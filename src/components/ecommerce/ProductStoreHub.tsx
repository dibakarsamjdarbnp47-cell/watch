import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import {
  EcommerceCartItem,
  EcommerceOrder,
  EcommerceProduct,
  PaymentMethod,
  ProductCategory,
} from '../../types/index.js';
import { formatInr, getAuthHeaders, getEffectivePrice } from './ecommerceApi.js';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  Filter,
  Lock,
  MapPin,
  Minus,
  Package,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  X,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProductStoreHubProps {
  onNavigateToLogin?: () => void;
  onNavigateToDashboard?: () => void;
}

type StoreTab = 'catalog' | 'cart' | 'checkout' | 'orders' | 'track';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const ProductStoreHub: React.FC<ProductStoreHubProps> = ({
  onNavigateToLogin,
  onNavigateToDashboard,
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<StoreTab>('catalog');

  // Catalog state
  const [products, setProducts] = useState<EcommerceProduct[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState<'all' | 'under500' | '500to2000' | 'over2000'>('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // Product Details modal
  const [detailProduct, setDetailProduct] = useState<EcommerceProduct | null>(null);
  const [detailImageIdx, setDetailImageIdx] = useState(0);
  const [detailQty, setDetailQty] = useState(1);
  const [detailVariations, setDetailVariations] = useState<Record<string, string>>({});

  // Cart state (synced with DB when logged in, fallback localStorage for seamless preview before checkout)
  const [cartItems, setCartItems] = useState<EcommerceCartItem[]>([]);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Checkout state
  const [paymentConfig, setPaymentConfig] = useState<{ onlinePaymentConfigured: boolean; keyId: string | null }>({
    onlinePaymentConfigured: false,
    keyId: null,
  });
  const [checkoutForm, setCheckoutForm] = useState({
    customerName: currentUser?.name || '',
    registeredLoginId: currentUser?.id || '',
    mobile: currentUser?.mobile || '',
    whatsapp: currentUser?.mobile || '',
    email: currentUser?.email || '',
    deliveryAddress: currentUser?.address || '',
    cityTownVillage: currentUser?.city || '',
    district: currentUser?.city || '',
    state: currentUser?.state || '',
    pincode: currentUser?.pincode || '',
    deliveryInstructions: '',
    paymentMethod: 'COD' as PaymentMethod,
  });
  const [placingOrder, setPlacingOrder] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<EcommerceOrder | null>(null);

  // Orders & Tracking state
  const [myOrders, setMyOrders] = useState<EcommerceOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState('');
  const [trackMobile, setTrackMobile] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<EcommerceOrder | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Keep checkout defaults synced with logged in user
  useEffect(() => {
    if (currentUser) {
      setCheckoutForm((prev) => ({
        ...prev,
        customerName: prev.customerName || currentUser.name,
        registeredLoginId: currentUser.id,
        mobile: prev.mobile || currentUser.mobile,
        whatsapp: prev.whatsapp || currentUser.mobile,
        email: prev.email || currentUser.email,
        deliveryAddress: prev.deliveryAddress || currentUser.address,
        cityTownVillage: prev.cityTownVillage || currentUser.city,
        district: prev.district || currentUser.city,
        state: prev.state || currentUser.state,
        pincode: prev.pincode || currentUser.pincode,
      }));
    }
  }, [currentUser?.id]);

  // Fetch categories and payment config
  useEffect(() => {
    fetch('/api/ecommerce/categories')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.categories)) setCategories(d.categories);
      })
      .catch(() => {});

    fetch('/api/ecommerce/payments/config')
      .then((r) => r.json())
      .then((d) => setPaymentConfig({ onlinePaymentConfigured: Boolean(d.onlinePaymentConfigured), keyId: d.keyId || null }))
      .catch(() => {});
  }, []);

  // Fetch products
  const loadProducts = async () => {
    setLoadingCatalog(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (selectedCategory !== 'All') params.set('category', selectedCategory);
      if (priceRange === 'under500') params.set('maxPrice', '500');
      if (priceRange === '500to2000') {
        params.set('minPrice', '500');
        params.set('maxPrice', '2000');
      }
      if (priceRange === 'over2000') params.set('minPrice', '2000');
      if (featuredOnly) params.set('featured', 'true');
      params.set('sort', sortBy);
      params.set('page', String(page));
      params.set('limit', '8');

      const res = await fetch(`/api/ecommerce/products?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
        setTotalProducts(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      // ignore transient error
    } finally {
      setLoadingCatalog(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, selectedCategory, priceRange, featuredOnly, sortBy]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      loadProducts();
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  // Load cart when user changes
  const loadCart = async () => {
    if (!currentUser) {
      setCartItems([]);
      return;
    }
    try {
      const res = await fetch('/api/ecommerce/cart', { headers: getAuthHeaders(currentUser.id) });
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.items || []);
      }
    } catch {
      // ignore
    }
  };

  const loadMyOrders = async () => {
    if (!currentUser) {
      setMyOrders([]);
      return;
    }
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/ecommerce/my-orders', { headers: getAuthHeaders(currentUser.id) });
      if (res.ok) {
        const data = await res.json();
        setMyOrders(data.orders || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadCart();
    loadMyOrders();
  }, [currentUser?.id]);

  // Open product details modal
  const openProductDetails = (product: EcommerceProduct) => {
    const defaultVars: Record<string, string> = {};
    product.variations.forEach((v) => {
      if (v.options.length > 0) defaultVars[v.name] = v.options[0];
    });
    setDetailProduct(product);
    setDetailImageIdx(0);
    setDetailQty(1);
    setDetailVariations(defaultVars);
  };

  // Add to cart
  const handleAddToCart = async (
    product: EcommerceProduct,
    qty = 1,
    variations: Record<string, string> = {},
    goToCheckout = false
  ) => {
    if (!currentUser) {
      showToast('error', 'Please log in with your Member LOGIN ID first so BP credits to your account.');
      onNavigateToLogin?.();
      return;
    }
    if (product.stockQuantity <= 0 || product.availabilityStatus === 'out_of_stock') {
      showToast('error', `${product.name} is currently out of stock.`);
      return;
    }

    // Fill default variations if none selected
    const chosenVars = { ...variations };
    product.variations.forEach((v) => {
      if (!chosenVars[v.name] && v.options.length > 0) {
        chosenVars[v.name] = v.options[0];
      }
    });

    try {
      const res = await fetch('/api/ecommerce/cart', {
        method: 'POST',
        headers: getAuthHeaders(currentUser.id),
        body: JSON.stringify({
          productId: product.id,
          quantity: qty,
          selectedVariations: chosenVars,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Could not add product to cart.');
        return;
      }
      setCartItems(data.items || []);
      setDetailProduct(null);
      if (goToCheckout) {
        setConfirmedOrder(null);
        setActiveTab('checkout');
      } else {
        showToast('success', `Added ${qty}× ${product.name} (+${product.bpValue * qty} BP) to cart.`);
      }
    } catch {
      showToast('error', 'Network error while updating cart.');
    }
  };

  const handleUpdateCartQty = async (itemId: string, quantity: number) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/ecommerce/cart/${itemId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(currentUser.id),
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      if (res.ok) {
        setCartItems(data.items || []);
      } else {
        showToast('error', data.error || 'Failed to update quantity.');
      }
    } catch {
      showToast('error', 'Failed to update cart.');
    }
  };

  // Derived cart totals
  const cartSummary = cartItems.reduce(
    (acc, item) => {
      const p = item.product;
      const eff = getEffectivePrice(p.price, p.discountedPrice);
      acc.totalCount += item.quantity;
      acc.mrpSubtotal += p.price * item.quantity;
      acc.discountTotal += Math.max(0, p.price - eff) * item.quantity;
      acc.totalBp += p.bpValue * item.quantity;
      if (p.deliveryCharge > acc.deliveryCharges) acc.deliveryCharges = p.deliveryCharge;
      return acc;
    },
    { totalCount: 0, mrpSubtotal: 0, discountTotal: 0, deliveryCharges: 0, totalBp: 0 }
  );
  const finalPayable = Math.max(0, cartSummary.mrpSubtotal - cartSummary.discountTotal + cartSummary.deliveryCharges);

  // Load Razorpay script dynamically when needed
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Submit Checkout Order
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onNavigateToLogin?.();
      return;
    }
    if (cartItems.length === 0) {
      showToast('error', 'Your shopping cart is empty.');
      return;
    }

    setPlacingOrder(true);
    try {
      const res = await fetch('/api/ecommerce/checkout', {
        method: 'POST',
        headers: getAuthHeaders(currentUser.id),
        body: JSON.stringify({
          ...checkoutForm,
          items: cartItems.map((c) => ({
            productId: c.productId,
            quantity: c.quantity,
            selectedVariations: c.selectedVariations,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Checkout failed.');
        setPlacingOrder(false);
        return;
      }

      const createdOrder: EcommerceOrder = data.order;

      // If Online Payment selected & server gateway configured -> launch Razorpay checkout
      if (checkoutForm.paymentMethod === 'ONLINE_RAZORPAY') {
        const scriptOk = await loadRazorpayScript();
        const rzpInitRes = await fetch('/api/ecommerce/payments/razorpay/create-order', {
          method: 'POST',
          headers: getAuthHeaders(currentUser.id),
          body: JSON.stringify({ orderId: createdOrder.id }),
        });
        const rzpInit = await rzpInitRes.json();
        if (!scriptOk || !rzpInitRes.ok) {
          showToast('error', rzpInit.error || 'Online payment initialization failed. Order saved as Pending COD.');
          setConfirmedOrder(createdOrder);
          await loadCart();
          await loadMyOrders();
          setPlacingOrder(false);
          return;
        }

        const rzp = new window.Razorpay({
          key: rzpInit.keyId,
          amount: rzpInit.amount,
          currency: rzpInit.currency,
          name: 'Watch Video, Dream in Hand Direct Selling Pvt. Ltd.',
          description: `Order ${createdOrder.id} (${createdOrder.totalBp} BP)`,
          order_id: rzpInit.razorpayOrderId,
          prefill: {
            name: createdOrder.customerName,
            email: createdOrder.email,
            contact: createdOrder.mobile,
          },
          handler: async (response: any) => {
            const verifyRes = await fetch('/api/ecommerce/payments/razorpay/verify', {
              method: 'POST',
              headers: getAuthHeaders(currentUser.id),
              body: JSON.stringify({
                orderId: createdOrder.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.order) {
              setConfirmedOrder(verifyData.order);
              confetti({ particleCount: 100, spread: 80 });
              showToast('success', verifyData.message);
            } else {
              setConfirmedOrder(createdOrder);
              showToast('error', verifyData.error || 'Payment signature verification failed.');
            }
            await loadCart();
            await loadMyOrders();
            await loadProducts();
            setPlacingOrder(false);
          },
          modal: {
            ondismiss: async () => {
              setConfirmedOrder(createdOrder);
              await loadCart();
              await loadMyOrders();
              setPlacingOrder(false);
            },
          },
        });
        rzp.open();
        return;
      }

      // Cash on Delivery path
      setConfirmedOrder(createdOrder);
      await loadCart();
      await loadMyOrders();
      await loadProducts();
      confetti({ particleCount: 90, spread: 70 });
      showToast('success', data.message);
    } catch {
      showToast('error', 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Track an order
  const handleTrackOrder = async (orderIdToTrack?: string, mobileOverride?: string) => {
    const id = (orderIdToTrack ?? trackOrderId).trim();
    const mob = (mobileOverride ?? trackMobile).trim();
    if (!id) {
      setTrackError('Please enter an Order ID.');
      return;
    }
    setTrackError(null);
    try {
      const qs = mob ? `?mobile=${encodeURIComponent(mob)}` : '';
      const res = await fetch(`/api/ecommerce/orders/${encodeURIComponent(id)}/track${qs}`, {
        headers: currentUser ? getAuthHeaders(currentUser.id) : { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) {
        setTrackedOrder(null);
        setTrackError(data.error || 'Unable to track order.');
        return;
      }
      setTrackedOrder(data.order);
    } catch {
      setTrackError('Network error while tracking order.');
    }
  };

  const renderBpStatusBadge = (status: EcommerceOrder['bpCreditStatus']) => {
    if (status === 'Credited') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
          ✓ BP Credited
        </span>
      );
    }
    if (status === 'Reversed') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
          ↺ BP Reversed
        </span>
      );
    }
    if (status === 'Cancelled') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">
          ✕ BP Cancelled
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
        ⏳ BP Pending
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Store Header & Navigation Tabs */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                PRODUCT Store & Bonus Point (BP) Mall
              </h1>
              <p className="text-xs text-slate-400">
                Certified Direct Selling Products • Automatic Login ID BP Credit on Qualifying Orders
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'catalog'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Products</span>
          </button>

          <button
            onClick={() => setActiveTab('cart')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 relative ${
              activeTab === 'cart' || activeTab === 'checkout'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Cart ({cartSummary.totalCount})</span>
            {cartSummary.totalBp > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black ${
                  activeTab === 'cart' || activeTab === 'checkout'
                    ? 'bg-slate-950 text-amber-400'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                +{cartSummary.totalBp} BP
              </span>
            )}
          </button>

          <button
            onClick={() => {
              loadMyOrders();
              setActiveTab('orders');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>My Orders ({myOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('track')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'track'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Track Order</span>
          </button>

          {currentUser ? (
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-[11px] font-mono flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">ID:</span>
              <strong className="text-amber-400">{currentUser.id}</strong>
            </div>
          ) : (
            onNavigateToLogin && (
              <button
                onClick={onNavigateToLogin}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition"
              >
                Login to Earn BP
              </button>
            )
          )}
        </div>
      </div>

      {/* Toast Banner */}
      {toastMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
            toastMsg.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {toastMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toastMsg.text}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ==========================================
          TAB 1: PRODUCT LISTING PAGE
          ========================================== */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Search & Filters Bar */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products by name, Product ID, or SKU..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="All">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <select
                  value={priceRange}
                  onChange={(e) => {
                    setPriceRange(e.target.value as any);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Prices</option>
                  <option value="under500">Under ₹500</option>
                  <option value="500to2000">₹500 – ₹2,000</option>
                  <option value="over2000">Above ₹2,000</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="bp_desc">Highest BP First</option>
                  <option value="best_selling">Best Selling</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>

              <div className="md:col-span-1 flex items-center justify-end">
                <button
                  onClick={() => {
                    setFeaturedOnly(!featuredOnly);
                    setPage(1);
                  }}
                  className={`w-full py-2.5 px-2.5 rounded-xl text-xs font-bold border transition ${
                    featuredOnly
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Filter Featured Products"
                >
                  ★ Top
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center space-x-1.5">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                <span>Showing {products.length} of {totalProducts} certified products</span>
              </span>
              {(search || selectedCategory !== 'All' || priceRange !== 'all' || featuredOnly) && (
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('All');
                    setPriceRange('all');
                    setFeaturedOnly(false);
                    setPage(1);
                  }}
                  className="text-amber-400 hover:underline font-semibold"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Product Grid */}
          {loadingCatalog ? (
            <div className="py-16 text-center text-sm text-slate-400">Loading products catalog...</div>
          ) : products.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No matching products found</h3>
              <p className="text-xs text-slate-400">Try adjusting your search keywords or category filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {products.map((p) => {
                const effectivePrice = getEffectivePrice(p.price, p.discountedPrice);
                const hasDiscount = effectivePrice < p.price;
                const outOfStock = p.stockQuantity <= 0 || p.availabilityStatus === 'out_of_stock';

                return (
                  <div
                    key={p.id}
                    className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between overflow-hidden shadow-xl group"
                  >
                    <div>
                      {/* Product Image */}
                      <div
                        onClick={() => openProductDetails(p)}
                        className="relative aspect-[4/3] bg-slate-950 overflow-hidden cursor-pointer border-b border-slate-800"
                      >
                        <img
                          src={p.images[0] || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80'}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                          <span className="px-2 py-0.5 rounded-full bg-slate-950/90 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                            {p.category}
                          </span>
                          {p.isFeatured && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                              FEATURED
                            </span>
                          )}
                        </div>
                        <div className="absolute bottom-2.5 right-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              outOfStock
                                ? 'bg-rose-950/90 text-rose-300 border-rose-500/40'
                                : p.stockQuantity < 15
                                ? 'bg-amber-950/90 text-amber-300 border-amber-500/40'
                                : 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                            }`}
                          >
                            {outOfStock ? 'Out of Stock' : `In Stock (${p.stockQuantity})`}
                          </span>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-4 space-y-2.5">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>{p.sku}</span>
                          <span>{p.deliveryCharge === 0 ? 'Free Delivery' : `+₹${p.deliveryCharge} Shipping`}</span>
                        </div>

                        <h3
                          onClick={() => openProductDetails(p)}
                          className="text-sm font-bold text-white line-clamp-2 cursor-pointer hover:text-amber-400 transition min-h-[2.5rem]"
                        >
                          {p.name}
                        </h3>

                        {/* MANDATORY FORMAT: Product Price: ₹400 | BP: 10 BP */}
                        <div className="p-2.5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-1">
                          <div className="text-xs font-black text-white flex flex-wrap items-center gap-x-1.5">
                            <span className="text-slate-300 font-semibold">Product Price:</span>
                            <span className="text-amber-400 font-mono text-sm">{formatInr(effectivePrice)}</span>
                            <span className="text-slate-600">|</span>
                            <span className="text-emerald-400 font-mono text-sm">BP: {p.bpValue} BP</span>
                          </div>
                          {hasDiscount && (
                            <div className="flex items-center space-x-2 text-[10px]">
                              <span className="text-slate-500 line-through font-mono">{formatInr(p.price)}</span>
                              <span className="text-emerald-400 font-bold">
                                Save {formatInr(p.price - effectivePrice)} (
                                {Math.round(((p.price - effectivePrice) / p.price) * 100)}% OFF)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-4 pb-4 space-y-2">
                      <button
                        onClick={() => openProductDetails(p)}
                        className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center space-x-1.5 transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Product Details</span>
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          disabled={outOfStock}
                          onClick={() => handleAddToCart(p, 1, {}, false)}
                          className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Add to Cart
                        </button>
                        <button
                          disabled={outOfStock}
                          onClick={() => handleAddToCart(p, 1, {}, true)}
                          className="py-2 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 text-xs font-black transition shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40 flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>
              <span className="text-xs font-mono text-slate-300 px-3">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40 flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB 2: SHOPPING CART
          ========================================== */}
      {activeTab === 'cart' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-black text-white flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-amber-400" />
                <span>Shopping Cart ({cartSummary.totalCount} Items)</span>
              </h2>
              <button
                onClick={() => setActiveTab('catalog')}
                className="text-xs font-bold text-amber-400 hover:underline flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Continue Shopping</span>
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto" />
                <div>
                  <h3 className="text-base font-bold text-white">Your Shopping Cart is Empty</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Browse our product catalog and add items to earn Bonus Points (BP) on your Login ID.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => {
                  const p = item.product;
                  const effPrice = getEffectivePrice(p.price, p.discountedPrice);
                  const lineTotal = effPrice * item.quantity;
                  const lineBp = p.bpValue * item.quantity;
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start space-x-3.5">
                        <img
                          src={p.images[0] || ''}
                          alt={p.name}
                          className="w-20 h-20 rounded-xl object-cover border border-slate-800 shrink-0"
                        />
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white">{p.name}</h4>
                          <p className="text-[11px] font-mono text-slate-400">
                            SKU: {p.sku}
                            {Object.keys(item.selectedVariations || {}).length > 0 &&
                              ` • ${Object.entries(item.selectedVariations)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(', ')}`}
                          </p>
                          <div className="text-xs font-bold text-amber-400 font-mono">
                            Product Price: {formatInr(effPrice)} | BP: {p.bpValue} BP
                            {effPrice < p.price && (
                              <span className="text-slate-500 line-through ml-2">{formatInr(p.price)}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 rounded-xl p-1">
                          <button
                            onClick={() => handleUpdateCartQty(item.id, item.quantity - 1)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-black font-mono text-white px-2">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateCartQty(item.id, item.quantity + 1)}
                            disabled={item.quantity >= p.stockQuantity}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-40"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Line Price & Total BP */}
                        <div className="text-right min-w-[100px]">
                          <p className="text-sm font-black text-white font-mono">{formatInr(lineTotal)}</p>
                          <p className="text-xs font-bold text-emerald-400 font-mono">Total BP: {lineBp} BP</p>
                        </div>

                        <button
                          onClick={() => handleUpdateCartQty(item.id, 0)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                          title="Remove Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart Totals Sidebar */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5 self-start">
            <h3 className="text-sm font-black uppercase tracking-wider text-white pb-3 border-b border-slate-800">
              Cart Summary & BP Reward
            </h3>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-200">Total BP Earned</span>
              </div>
              <span className="text-xl font-black font-mono text-emerald-400">+{cartSummary.totalBp} BP</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal (MRP)</span>
                <span className="font-mono">{formatInr(cartSummary.mrpSubtotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Product Discounts</span>
                <span className="font-mono">-{formatInr(cartSummary.discountTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Delivery Charges</span>
                <span className="font-mono">
                  {cartSummary.deliveryCharges === 0 ? 'FREE' : formatInr(cartSummary.deliveryCharges)}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-between text-base font-black text-white">
                <span>Final Payable</span>
                <span className="text-amber-400 font-mono">{formatInr(finalPayable)}</span>
              </div>
            </div>

            <button
              disabled={cartItems.length === 0}
              onClick={() => {
                setConfirmedOrder(null);
                setActiveTab('checkout');
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs transition shadow-lg disabled:opacity-40"
            >
              Proceed to Checkout →
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 3: CHECKOUT & ORDER CONFIRMATION
          ========================================== */}
      {activeTab === 'checkout' && (
        <div>
          {confirmedOrder ? (
            <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase text-emerald-400">Order Confirmed</span>
                  <h2 className="text-xl font-black text-white">Order ID: {confirmedOrder.id}</h2>
                  <p className="text-xs text-slate-400">
                    Registered LOGIN ID: <strong className="text-amber-400 font-mono">{confirmedOrder.userId}</strong>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Final Amount</span>
                  <p className="text-lg font-black text-amber-400 font-mono">{formatInr(confirmedOrder.finalAmount)}</p>
                  <span className="text-[10px] text-slate-400">
                    {confirmedOrder.paymentMethod} • {confirmedOrder.paymentStatus}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Order Bonus Points</span>
                  <p className="text-lg font-black text-emerald-400 font-mono">+{confirmedOrder.totalBp} BP</p>
                  <div className="mt-1">{renderBpStatusBadge(confirmedOrder.bpCreditStatus)}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Order Status</span>
                  <p className="text-lg font-black text-white">{confirmedOrder.orderStatus}</p>
                  <span className="text-[10px] text-slate-400">{confirmedOrder.createdAt}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-400">Ordered Products</h4>
                {confirmedOrder.items.map((it) => (
                  <div key={it.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">{it.productName} × {it.quantity}</p>
                      <p className="text-[11px] font-mono text-slate-400">
                        Product Price: {formatInr(it.effectiveUnitPrice)} | BP: {it.unitBp} BP
                      </p>
                    </div>
                    <div className="text-right font-mono">
                      <p className="font-bold text-amber-400">{formatInr(it.lineTotal)}</p>
                      <p className="text-emerald-400 font-bold">+{it.lineBp} BP</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => {
                    setTrackOrderId(confirmedOrder.id);
                    setTrackMobile(confirmedOrder.mobile);
                    handleTrackOrder(confirmedOrder.id, confirmedOrder.mobile);
                    setActiveTab('track');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition"
                >
                  Track This Order
                </button>
                <button
                  onClick={() => {
                    loadMyOrders();
                    setActiveTab('orders');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700"
                >
                  View Order History
                </button>
                {onNavigateToDashboard && (
                  <button
                    onClick={onNavigateToDashboard}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/30"
                  >
                    Open BP Wallet in Dashboard
                  </button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Customer & Shipping Form */}
              <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h2 className="text-lg font-black text-white">Checkout & Delivery Details</h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('cart')}
                    className="text-xs font-bold text-amber-400 hover:underline"
                  >
                    ← Back to Cart
                  </button>
                </div>

                {!currentUser && (
                  <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3">
                    <span>You must be logged in with your Member LOGIN ID to place an order and earn BP.</span>
                    {onNavigateToLogin && (
                      <button
                        type="button"
                        onClick={onNavigateToLogin}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black shrink-0"
                      >
                        Login Now
                      </button>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Customer Full Name *</label>
                    <input
                      type="text"
                      required
                      value={checkoutForm.customerName}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, customerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Registered LOGIN ID * <span className="text-emerald-400">(BP Credits Here)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        readOnly={Boolean(currentUser && currentUser.role !== 'admin' && currentUser.role !== 'superadmin')}
                        value={checkoutForm.registeredLoginId}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, registeredLoginId: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-emerald-500/40 rounded-xl text-amber-400 font-mono font-bold focus:outline-none"
                      />
                      <Lock className="w-3.5 h-3.5 text-emerald-400 absolute right-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={checkoutForm.mobile}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, mobile: e.target.value })}
                      placeholder="10-digit mobile number"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      value={checkoutForm.whatsapp}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, whatsapp: e.target.value })}
                      placeholder="WhatsApp number for updates"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={checkoutForm.email}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Delivery Address (House / Street / Landmark) *</label>
                    <input
                      type="text"
                      required
                      value={checkoutForm.deliveryAddress}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, deliveryAddress: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Village / Town / City *</label>
                    <input
                      type="text"
                      required
                      value={checkoutForm.cityTownVillage}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, cityTownVillage: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">District *</label>
                    <input
                      type="text"
                      required
                      value={checkoutForm.district}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, district: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={checkoutForm.state}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, state: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">PIN Code (6 Digits) *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={checkoutForm.pincode}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, pincode: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Delivery Instructions (Optional)</label>
                    <textarea
                      rows={2}
                      value={checkoutForm.deliveryInstructions}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, deliveryInstructions: e.target.value })}
                      placeholder="Preferred delivery timing, nearby landmark, etc."
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>Select Payment Method</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'COD' })}
                      className={`p-3.5 rounded-2xl border text-left transition ${
                        checkoutForm.paymentMethod === 'COD'
                          ? 'bg-amber-500/15 border-amber-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <p className="font-bold text-white">Cash on Delivery (COD)</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Pay on delivery. BP credits automatically upon delivery confirmation.
                      </p>
                    </button>

                    <button
                      type="button"
                      disabled={!paymentConfig.onlinePaymentConfigured}
                      onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'ONLINE_RAZORPAY' })}
                      className={`p-3.5 rounded-2xl border text-left transition ${
                        !paymentConfig.onlinePaymentConfigured
                          ? 'bg-slate-950/50 border-slate-800/60 text-slate-500 opacity-65 cursor-not-allowed'
                          : checkoutForm.paymentMethod === 'ONLINE_RAZORPAY'
                          ? 'bg-emerald-500/15 border-emerald-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <p className="font-bold text-white flex items-center justify-between">
                        <span>Online Payment (UPI / Cards)</span>
                        {!paymentConfig.onlinePaymentConfigured && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Not Configured</span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {paymentConfig.onlinePaymentConfigured
                          ? 'Instant Razorpay verification & automatic BP credit.'
                          : 'Configure RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET on server to enable online checkout.'}
                      </p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 self-start">
                <h3 className="text-sm font-black uppercase tracking-wider text-white pb-3 border-b border-slate-800">
                  Order & BP Summary
                </h3>

                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {cartItems.map((item) => {
                    const p = item.product;
                    const eff = getEffectivePrice(p.price, p.discountedPrice);
                    return (
                      <div key={item.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between text-xs gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Qty: {item.quantity} • Product Price: {formatInr(eff)} | BP: {p.bpValue} BP
                          </p>
                        </div>
                        <div className="text-right font-mono shrink-0">
                          <p className="font-bold text-amber-400">{formatInr(eff * item.quantity)}</p>
                          <p className="text-emerald-400 font-bold">+{p.bpValue * item.quantity} BP</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal (MRP)</span>
                    <span className="font-mono">{formatInr(cartSummary.mrpSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span className="font-mono">-{formatInr(cartSummary.discountTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Delivery Charges</span>
                    <span className="font-mono">
                      {cartSummary.deliveryCharges === 0 ? 'FREE' : formatInr(cartSummary.deliveryCharges)}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold pt-2 border-t border-slate-800">
                    <span>Total Product BP (To {checkoutForm.registeredLoginId || 'Login ID'})</span>
                    <span className="font-mono text-sm">+{cartSummary.totalBp} BP</span>
                  </div>
                  <div className="flex justify-between text-white font-black text-base pt-2 border-t border-slate-800">
                    <span>Final Payable Amount</span>
                    <span className="text-amber-400 font-mono">{formatInr(finalPayable)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={placingOrder || !currentUser || cartItems.length === 0}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs transition shadow-lg disabled:opacity-40"
                >
                  {placingOrder ? 'Placing Order...' : `Confirm Order (${formatInr(finalPayable)})`}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ==========================================
          TAB 4: MY ORDER HISTORY
          ========================================== */}
      {activeTab === 'orders' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-black text-white">My Order History</h2>
              <p className="text-xs text-slate-400">
                Showing orders placed by LOGIN ID: <strong className="font-mono text-amber-400">{currentUser?.id || 'Guest'}</strong>
              </p>
            </div>
            <button
              onClick={loadMyOrders}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700"
            >
              Refresh Orders
            </button>
          </div>

          {loadingOrders ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading your orders...</div>
          ) : myOrders.length === 0 ? (
            <div className="py-12 text-center space-y-3 text-xs text-slate-400">
              <p>You have not placed any product orders yet.</p>
              <button
                onClick={() => setActiveTab('catalog')}
                className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black"
              >
                Explore Products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map((ord) => (
                <div key={ord.id} className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-black text-amber-400 text-sm">{ord.id}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] font-bold">
                          {ord.orderStatus}
                        </span>
                        {renderBpStatusBadge(ord.bpCreditStatus)}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Ordered: {ord.createdAt} • Payment: {ord.paymentMethod} ({ord.paymentStatus})
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right font-mono">
                        <p className="text-sm font-black text-white">{formatInr(ord.finalAmount)}</p>
                        <p className="text-xs font-bold text-emerald-400">+{ord.totalBp} BP</p>
                      </div>
                      <button
                        onClick={() => {
                          setTrackOrderId(ord.id);
                          setTrackMobile(ord.mobile);
                          handleTrackOrder(ord.id, ord.mobile);
                          setActiveTab('track');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center space-x-1"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Track</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {ord.items.map((it) => (
                      <div key={it.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2.5 min-w-0">
                          {it.productImage && (
                            <img src={it.productImage} alt={it.productName} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate">{it.productName} × {it.quantity}</p>
                            <p className="text-[10px] font-mono text-slate-400">
                              Product Price: {formatInr(it.effectiveUnitPrice)} | BP: {it.unitBp} BP
                            </p>
                          </div>
                        </div>
                        <div className="text-right font-mono shrink-0 ml-2">
                          <p className="font-bold text-amber-400">{formatInr(it.lineTotal)}</p>
                          <p className="text-[11px] font-bold text-emerald-400">+{it.lineBp} BP</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB 5: LIVE ORDER & DELIVERY TRACKING
          ========================================== */}
      {activeTab === 'track' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-lg font-black text-white flex items-center space-x-2">
              <Truck className="w-5 h-5 text-amber-400" />
              <span>Track Order & Delivery Status</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={trackOrderId}
                onChange={(e) => setTrackOrderId(e.target.value)}
                placeholder="Enter Order ID (e.g. ORD-2026-10001)"
                className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
              />
              <input
                type="tel"
                value={trackMobile}
                onChange={(e) => setTrackMobile(e.target.value)}
                placeholder="Registered Mobile Number (if not logged in)"
                className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
              />
              <button
                onClick={() => handleTrackOrder()}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition"
              >
                Track Shipment
              </button>
            </div>

            {trackError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">{trackError}</div>
            )}
          </div>

          {trackedOrder && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-black font-mono text-amber-400">{trackedOrder.id}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                      {trackedOrder.orderStatus}
                    </span>
                    {renderBpStatusBadge(trackedOrder.bpCreditStatus)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Buyer LOGIN ID: <strong className="font-mono text-white">{trackedOrder.userId}</strong> •{' '}
                    {trackedOrder.customerName}
                  </p>
                </div>
                <div className="text-right font-mono">
                  <p className="text-base font-black text-white">{formatInr(trackedOrder.finalAmount)}</p>
                  <p className="text-xs font-bold text-emerald-400">+{trackedOrder.totalBp} BP</p>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-400 uppercase text-[11px] flex items-center space-x-1.5">
                    <Truck className="w-4 h-4" />
                    <span>Courier & Shipment Details</span>
                  </h4>
                  <p className="text-slate-300">
                    Delivery Status: <strong className="text-white">{trackedOrder.delivery.deliveryStatus}</strong>
                  </p>
                  <p className="text-slate-300">
                    Courier Partner: <strong className="text-white">{trackedOrder.delivery.partnerName || 'Assigned Soon'}</strong>
                  </p>
                  <p className="text-slate-300">
                    Tracking Number:{' '}
                    <strong className="font-mono text-amber-300">{trackedOrder.delivery.trackingNumber || 'Pending Dispatch'}</strong>
                  </p>
                  <p className="text-slate-300">
                    Shipment Date: <strong className="text-white">{trackedOrder.delivery.shipmentDate || 'TBD'}</strong> • Est. Delivery:{' '}
                    <strong className="text-emerald-400">{trackedOrder.delivery.estimatedDeliveryDate || 'TBD'}</strong>
                  </p>
                  {trackedOrder.delivery.notes && (
                    <p className="text-slate-400 italic">Note: {trackedOrder.delivery.notes}</p>
                  )}
                  {trackedOrder.delivery.trackingUrl && (
                    <a
                      href={trackedOrder.delivery.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-amber-400 hover:underline font-bold pt-1"
                    >
                      <span>Open External Courier Tracking</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-400 uppercase text-[11px] flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>Shipping Destination</span>
                  </h4>
                  <p className="font-bold text-white">{trackedOrder.customerName}</p>
                  <p className="text-slate-300">
                    {trackedOrder.deliveryAddress}, {trackedOrder.cityTownVillage}, {trackedOrder.district}, {trackedOrder.state} -{' '}
                    <strong className="font-mono">{trackedOrder.pincode}</strong>
                  </p>
                  <p className="text-slate-400 flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span className="font-mono">{trackedOrder.mobile}</span>
                  </p>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-400">Order & Delivery Timeline</h4>
                <div className="space-y-2">
                  {trackedOrder.statusHistory.map((h) => (
                    <div key={h.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                        <div>
                          <span className="font-bold text-white">{h.status}</span>
                          <p className="text-[11px] text-slate-400">{h.note}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{h.createdAt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          PRODUCT DETAILS MODAL
          ========================================== */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full p-5 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2 text-[11px] font-mono text-amber-400">
                  <span>{detailProduct.category}</span>
                  {detailProduct.subcategory && <span>• {detailProduct.subcategory}</span>}
                  <span>• ID: {detailProduct.id}</span>
                  <span>• SKU: {detailProduct.sku}</span>
                </div>
                <h2 className="text-xl font-black text-white mt-1">{detailProduct.name}</h2>
              </div>
              <button
                onClick={() => setDetailProduct(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Multi-image Gallery */}
              <div className="space-y-3">
                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img
                    src={detailProduct.images[detailImageIdx] || detailProduct.images[0] || ''}
                    alt={detailProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {detailProduct.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {detailProduct.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setDetailImageIdx(idx)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 ${
                          detailImageIdx === idx ? 'border-amber-400' : 'border-slate-800 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details & Purchase Controls */}
              <div className="space-y-4">
                {/* Prominent Price & BP Banner */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-1.5">
                  <div className="text-base sm:text-lg font-black text-white flex flex-wrap items-center gap-x-2">
                    <span className="text-slate-300 font-bold">Product Price:</span>
                    <span className="text-amber-400 font-mono">
                      {formatInr(getEffectivePrice(detailProduct.price, detailProduct.discountedPrice))}
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-emerald-400 font-mono">BP: {detailProduct.bpValue} BP</span>
                  </div>
                  {detailProduct.discountedPrice && detailProduct.discountedPrice < detailProduct.price && (
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-slate-500 line-through font-mono">MRP: {formatInr(detailProduct.price)}</span>
                      <span className="text-emerald-400 font-bold">
                        Discounted Savings: {formatInr(detailProduct.price - detailProduct.discountedPrice)}
                      </span>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400">
                    Total BP for {detailQty} unit(s):{' '}
                    <strong className="text-emerald-400 font-mono">{detailProduct.bpValue * detailQty} BP</strong>
                  </p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{detailProduct.description}</p>

                {/* Variations Selector */}
                {detailProduct.variations.length > 0 && (
                  <div className="space-y-3">
                    {detailProduct.variations.map((v) => (
                      <div key={v.name} className="space-y-1.5">
                        <span className="text-[11px] font-bold uppercase text-slate-400">{v.name}</span>
                        <div className="flex flex-wrap gap-2">
                          {v.options.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setDetailVariations((prev) => ({ ...prev, [v.name]: opt }))}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                                detailVariations[v.name] === opt
                                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                                  : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Specifications */}
                {detailProduct.specifications.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <h4 className="text-[11px] font-bold uppercase text-slate-400 flex items-center space-x-1">
                      <Tag className="w-3.5 h-3.5 text-amber-400" />
                      <span>Specifications</span>
                    </h4>
                    <div className="divide-y divide-slate-800/80 text-xs">
                      {detailProduct.specifications.map((s, idx) => (
                        <div key={idx} className="py-1.5 flex justify-between gap-2">
                          <span className="text-slate-400">{s.key}</span>
                          <span className="text-slate-200 font-semibold text-right">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock, Quantity & Buttons */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Availability:{' '}
                      <strong className={detailProduct.stockQuantity > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {detailProduct.stockQuantity > 0
                          ? `In Stock (${detailProduct.stockQuantity} units)`
                          : 'Out of Stock'}
                      </strong>
                    </span>

                    <div className="flex items-center space-x-2 bg-slate-950 border border-slate-700 rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => setDetailQty((q) => Math.max(1, q - 1))}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-black font-mono text-white px-2">{detailQty}</span>
                      <button
                        type="button"
                        onClick={() => setDetailQty((q) => Math.min(detailProduct.stockQuantity || 1, q + 1))}
                        disabled={detailQty >= detailProduct.stockQuantity}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      disabled={detailProduct.stockQuantity <= 0}
                      onClick={() => handleAddToCart(detailProduct, detailQty, detailVariations, false)}
                      className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/30 disabled:opacity-40"
                    >
                      Add to Cart
                    </button>
                    <button
                      disabled={detailProduct.stockQuantity <= 0}
                      onClick={() => handleAddToCart(detailProduct, detailQty, detailVariations, true)}
                      className="py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-lg disabled:opacity-40"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
