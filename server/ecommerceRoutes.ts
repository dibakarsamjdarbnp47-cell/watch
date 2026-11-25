import crypto from 'crypto';
import express, { Router } from 'express';
import { db as coreDb } from './db.js';
import { ecommerceDb, isValidHttpUrl, isValidImageUrl } from './ecommerceDb.js';
import { OrderStatus, PaymentMethod } from '../src/types/index.js';

export function createEcommerceRouter(): Router {
  const router = Router();

  // ==========================================
  // SERVER-SIDE AUTHENTICATION & ROLE HELPERS
  // ==========================================
  function getVerifiedAuth(req: express.Request) {
    const rawHeaderId = String(req.headers['x-user-id'] || '').trim();
    const rawAuth = String(req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim();

    let tokenUserId = '';
    if (rawAuth.startsWith('demo-jwt-token-')) {
      tokenUserId = rawAuth.replace('demo-jwt-token-', '').trim();
    } else if (rawAuth) {
      tokenUserId = rawAuth;
    }

    const lookupId = tokenUserId || rawHeaderId;
    const user = lookupId ? coreDb.findUserById(lookupId) : undefined;
    // Security: Always derive role strictly from server-side DB user record, never trusting client headers
    const role = user ? user.role : null;
    const isAdmin = role === 'admin' || role === 'superadmin';

    return { user, userId: user?.id || null, role, isAdmin };
  }

  function requireUser(req: express.Request, res: express.Response, next: express.NextFunction) {
    const auth = getVerifiedAuth(req);
    if (!auth.user) {
      return res.status(401).json({ error: 'Authentication required. Please log in with your Member LOGIN ID.' });
    }
    (req as any).verifiedAuth = auth;
    next();
  }

  function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
    const auth = getVerifiedAuth(req);
    if (!auth.user || !auth.isAdmin) {
      return res.status(403).json({
        error: 'Access Denied: Administrator privileges required.',
      });
    }
    (req as any).verifiedAuth = auth;
    next();
  }

  // ==========================================
  // PUBLIC CATALOG & CATEGORIES
  // ==========================================
  router.get('/categories', (_req, res) => {
    res.json({ categories: ecommerceDb.getCategories() });
  });

  router.get('/products', (req, res) => {
    const { search, category, subcategory, minPrice, maxPrice, featured, sort, page, limit } = req.query;
    const result = ecommerceDb.listProducts({
      search: search ? String(search) : undefined,
      category: category ? String(category) : undefined,
      subcategory: subcategory ? String(subcategory) : undefined,
      minPrice: minPrice !== undefined && minPrice !== '' ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined && maxPrice !== '' ? Number(maxPrice) : undefined,
      featured: featured === 'true',
      includeInactive: false,
      sort: sort ? String(sort) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 8,
    });
    res.json(result);
  });

  router.get('/products/:id', (req, res) => {
    const product = ecommerceDb.getProductById(req.params.id);
    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json({ product });
  });

  // ==========================================
  // AUTHENTICATED SHOPPING CART
  // ==========================================
  router.get('/cart', requireUser, (req, res) => {
    const { userId } = (req as any).verifiedAuth;
    res.json({ items: ecommerceDb.getCart(userId) });
  });

  router.post('/cart', requireUser, (req, res) => {
    const { userId } = (req as any).verifiedAuth;
    const { productId, quantity, selectedVariations } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }
    const result = ecommerceDb.addToCart(userId, String(productId), Number(quantity) || 1, selectedVariations || {});
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ success: true, items: result.items });
  });

  router.patch('/cart/:itemId', requireUser, (req, res) => {
    const { userId } = (req as any).verifiedAuth;
    const result = ecommerceDb.updateCartItem(userId, req.params.itemId, Number(req.body.quantity));
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ success: true, items: result.items });
  });

  router.delete('/cart', requireUser, (req, res) => {
    const { userId } = (req as any).verifiedAuth;
    ecommerceDb.clearCart(userId);
    res.json({ success: true, items: [] });
  });

  // ==========================================
  // CHECKOUT & ORDER CREATION (SERVER-AUTHORITATIVE)
  // ==========================================
  router.post('/checkout', requireUser, (req, res) => {
    const { user, userId, isAdmin } = (req as any).verifiedAuth;
    const {
      registeredLoginId,
      customerName,
      mobile,
      whatsapp,
      email,
      deliveryAddress,
      cityTownVillage,
      district,
      state,
      pincode,
      deliveryInstructions,
      paymentMethod,
      items,
    } = req.body;

    // Enforce Login ID ownership: ordinary buyers can only place orders for their own authenticated LOGIN ID
    const requestedLoginId = String(registeredLoginId || userId).trim();
    if (!isAdmin && requestedLoginId.toLowerCase() !== userId.toLowerCase()) {
      return res.status(403).json({
        error: `Security check failed: You are logged in as ${userId}. Orders & BP can only be credited to your own authenticated LOGIN ID.`,
      });
    }

    const cleanName = String(customerName || user.name || '').trim();
    const cleanMobile = String(mobile || user.mobile || '').replace(/\D/g, '');
    const cleanPin = String(pincode || user.pincode || '').replace(/\D/g, '');
    const cleanAddr = String(deliveryAddress || '').trim();
    const cleanCity = String(cityTownVillage || '').trim();
    const cleanDistrict = String(district || '').trim();
    const cleanState = String(state || '').trim();

    if (!cleanName || cleanMobile.length < 10 || !cleanAddr || !cleanCity || !cleanDistrict || !cleanState || cleanPin.length !== 6) {
      return res.status(400).json({
        error: 'Please fill all mandatory delivery fields including a valid 10-digit mobile number and 6-digit PIN code.',
      });
    }

    const allowedMethod: PaymentMethod = paymentMethod === 'ONLINE_RAZORPAY' ? 'ONLINE_RAZORPAY' : 'COD';
    if (allowedMethod === 'ONLINE_RAZORPAY') {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return res.status(503).json({
          error:
            'Online Payment Gateway is not configured on the server (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing). Please select Cash on Delivery (COD).',
        });
      }
    }

    // Read authoritative items either from request items list or user's DB cart
    const orderItemsInput = Array.isArray(items) && items.length > 0
      ? items
      : ecommerceDb.getCart(userId).map((c) => ({
          productId: c.productId,
          quantity: c.quantity,
          selectedVariations: c.selectedVariations,
        }));

    if (!orderItemsInput || orderItemsInput.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty.' });
    }

    const result = ecommerceDb.createOrder({
      userId: requestedLoginId,
      customerName: cleanName,
      mobile: cleanMobile,
      whatsapp: String(whatsapp || cleanMobile).replace(/\D/g, ''),
      email: String(email || user.email || '').trim(),
      deliveryAddress: cleanAddr,
      cityTownVillage: cleanCity,
      district: cleanDistrict,
      state: cleanState,
      pincode: cleanPin,
      deliveryInstructions: String(deliveryInstructions || '').trim(),
      paymentMethod: allowedMethod,
      items: orderItemsInput,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json({
      success: true,
      message: `Order ${result.order!.id} placed successfully! ${result.order!.totalBp} BP will be credited to LOGIN ID ${result.order!.userId} upon confirmation/delivery.`,
      order: result.order,
    });
  });

  // ==========================================
  // ONLINE PAYMENT GATEWAY (RAZORPAY)
  // ==========================================
  router.get('/payments/config', (_req, res) => {
    const configured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
    res.json({
      onlinePaymentConfigured: configured,
      provider: 'razorpay',
      keyId: configured ? process.env.RAZORPAY_KEY_ID : null,
      supportedMethods: configured ? ['COD', 'ONLINE_RAZORPAY'] : ['COD'],
    });
  });

  router.post('/payments/razorpay/create-order', requireUser, async (req, res) => {
    const { userId, isAdmin } = (req as any).verifiedAuth;
    const { orderId } = req.body;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(503).json({
        error: 'Online Payment Gateway is not configured on the server. Use Cash on Delivery (COD).',
      });
    }

    const order = ecommerceDb.getOrderById(String(orderId || ''));
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    if (!isAdmin && order.userId.toLowerCase() !== userId.toLowerCase()) {
      return res.status(403).json({ error: 'Access denied for this order.' });
    }
    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({ error: 'Order is already paid.' });
    }

    try {
      const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({
          amount: Math.round(order.finalAmount * 100),
          currency: 'INR',
          receipt: order.id,
          notes: { userId: order.userId, orderId: order.id },
        }),
      });

      const rzpData = (await rzpRes.json()) as any;
      if (!rzpRes.ok) {
        return res.status(502).json({ error: rzpData?.error?.description || 'Failed to initialize Razorpay order.' });
      }

      ecommerceDb.updatePaymentDetails(order.id, { gatewayOrderId: rzpData.id }, userId);
      res.json({
        success: true,
        keyId,
        razorpayOrderId: rzpData.id,
        amount: rzpData.amount,
        currency: rzpData.currency,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Payment gateway communication error.' });
    }
  });

  router.post('/payments/razorpay/verify', requireUser, (req, res) => {
    const { userId, isAdmin } = (req as any).verifiedAuth;
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return res.status(503).json({ error: 'Online Payment Gateway is not configured on the server.' });
    }

    const order = ecommerceDb.getOrderById(String(orderId || ''));
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    if (!isAdmin && order.userId.toLowerCase() !== userId.toLowerCase()) {
      return res.status(403).json({ error: 'Access denied for this order.' });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification parameters.' });
    }

    const expectedSig = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const sigBuf = Buffer.from(String(razorpay_signature));
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      ecommerceDb.updatePaymentDetails(order.id, { paymentStatus: 'Failed' }, userId);
      return res.status(400).json({ error: 'Invalid payment signature. Verification failed.' });
    }

    const verified = ecommerceDb.verifyOnlinePaymentAndConfirmOrder(
      order.id,
      String(razorpay_order_id),
      String(razorpay_payment_id),
      userId
    );
    res.json({
      success: true,
      message: `Payment verified and ${verified.order!.totalBp} BP automatically credited to LOGIN ID ${verified.order!.userId}!`,
      order: verified.order,
    });
  });

  // ==========================================
  // MEMBER ORDERS, TRACKING & BP WALLET
  // ==========================================
  router.get('/my-orders', requireUser, (req, res) => {
    const { userId } = (req as any).verifiedAuth;
    res.json({ orders: ecommerceDb.getOrdersForUser(userId) });
  });

  router.get('/orders/:orderId/track', (req, res) => {
    const auth = getVerifiedAuth(req);
    const mobileQuery = String(req.query.mobile || '').replace(/\D/g, '');
    const order = ecommerceDb.getOrderById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order ID not found. Please check your Order ID.' });
    }

    const isOwner = Boolean(auth.user && auth.user.id.toLowerCase() === order.userId.toLowerCase());
    const matchesMobile = mobileQuery.length >= 10 && order.mobile.replace(/\D/g, '') === mobileQuery;

    if (!auth.isAdmin && !isOwner && !matchesMobile) {
      return res.status(403).json({
        error: 'To track this order, please enter the matching 10-digit Registered Mobile Number or log in with the buyer LOGIN ID.',
      });
    }

    res.json({ order });
  });

  // Strictly scoped to logged-in user's own LOGIN ID
  router.get('/my-bp-wallet', requireUser, (req, res) => {
    const { userId } = (req as any).verifiedAuth;
    const summary = ecommerceDb.getUserBpWallet(userId);
    res.json(summary);
  });

  // ==========================================
  // ADMIN E-COMMERCE MANAGEMENT (ROLE-GUARDED)
  // ==========================================
  router.get('/admin/summary', requireAdmin, (_req, res) => {
    res.json(ecommerceDb.getAdminSummary());
  });

  router.get('/admin/products', requireAdmin, (req, res) => {
    const { search, category, page, limit } = req.query;
    const result = ecommerceDb.listProducts({
      search: search ? String(search) : undefined,
      category: category ? String(category) : undefined,
      includeInactive: true,
      sort: 'newest',
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
    });
    res.json(result);
  });

  router.post('/admin/products', requireAdmin, (req, res) => {
    const body = req.body;
    if (!body.name || body.price === undefined || body.bpValue === undefined) {
      return res.status(400).json({ error: 'Product name, price (INR), and BP value are required.' });
    }

    if (Array.isArray(body.images)) {
      const invalidImg = body.images.find((url: string) => !isValidImageUrl(url));
      if (invalidImg) {
        return res.status(400).json({ error: 'One or more product image URLs are invalid or exceed size limits.' });
      }
    }

    try {
      const product = ecommerceDb.createProduct(body);
      const { userId } = (req as any).verifiedAuth;
      coreDb.addAuditLog(userId, userId, 'PRODUCT_CREATED', `Created product ${product.name} (${product.id}) - ₹${product.price} | ${product.bpValue} BP`);
      res.status(201).json({ success: true, product });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create product (SKU or ID may already exist).' });
    }
  });

  router.put('/admin/products/:id', requireAdmin, (req, res) => {
    const body = req.body;
    if (Array.isArray(body.images)) {
      const invalidImg = body.images.find((url: string) => !isValidImageUrl(url));
      if (invalidImg) {
        return res.status(400).json({ error: 'One or more product image URLs are invalid.' });
      }
    }

    try {
      const updated = ecommerceDb.updateProduct(req.params.id, body);
      if (!updated) return res.status(404).json({ error: 'Product not found.' });
      const { userId } = (req as any).verifiedAuth;
      coreDb.addAuditLog(userId, userId, 'PRODUCT_UPDATED', `Updated product ${updated.name} (${updated.id})`);
      res.json({ success: true, product: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to update product.' });
    }
  });

  router.delete('/admin/products/:id', requireAdmin, (req, res) => {
    const ok = ecommerceDb.deleteProduct(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Product not found.' });
    const { userId } = (req as any).verifiedAuth;
    coreDb.addAuditLog(userId, userId, 'PRODUCT_DELETED', `Deleted product ${req.params.id}`);
    res.json({ success: true });
  });

  router.get('/admin/orders', requireAdmin, (req, res) => {
    const { search, status, dateFrom, dateTo } = req.query;
    const orders = ecommerceDb.listAdminOrders({
      search: search ? String(search) : undefined,
      status: status ? String(status) : undefined,
      dateFrom: dateFrom ? String(dateFrom) : undefined,
      dateTo: dateTo ? String(dateTo) : undefined,
    });
    res.json({ orders });
  });

  router.patch('/admin/orders/:orderId/status', requireAdmin, (req, res) => {
    const { status, note } = req.body;
    const validStatuses: OrderStatus[] = [
      'Pending',
      'Confirmed',
      'Processing',
      'Packed',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
      'Returned',
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status.' });
    }

    const { userId } = (req as any).verifiedAuth;
    const result = ecommerceDb.updateOrderStatus(req.params.orderId, status, String(note || ''), userId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ success: true, order: result.order });
  });

  router.patch('/admin/orders/:orderId/delivery', requireAdmin, (req, res) => {
    const { userId } = (req as any).verifiedAuth;
    if (req.body.trackingUrl !== undefined && !isValidHttpUrl(String(req.body.trackingUrl))) {
      return res.status(400).json({ error: 'Tracking URL must begin with http:// or https://' });
    }
    const result = ecommerceDb.updateDeliveryDetails(req.params.orderId, req.body, userId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ success: true, order: result.order });
  });

  router.patch('/admin/orders/:orderId/payment', requireAdmin, (req, res) => {
    const { userId } = (req as any).verifiedAuth;
    const result = ecommerceDb.updatePaymentDetails(req.params.orderId, req.body, userId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ success: true, order: result.order });
  });

  router.get('/admin/bp-transactions', requireAdmin, (_req, res) => {
    res.json({ transactions: ecommerceDb.getAllBpTransactions() });
  });

  return router;
}
