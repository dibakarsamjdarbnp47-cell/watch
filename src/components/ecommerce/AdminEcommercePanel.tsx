import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import {
  BpTransaction,
  DeliveryStatus,
  EcommerceAdminSummary,
  EcommerceOrder,
  EcommerceProduct,
  OrderStatus,
  PaymentStatus,
  ProductSpecification,
  ProductVariation,
} from '../../types/index.js';
import { formatInr, getAuthHeaders, getEffectivePrice } from './ecommerceApi.js';
import {
  AlertCircle,
  Award,
  BarChart3,
  CheckCircle2,
  CreditCard,
  Edit,
  ImagePlus,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  X,
} from 'lucide-react';

type AdminEcomTab = 'overview' | 'products' | 'orders' | 'bp-ledger';

const ORDER_STATUSES: OrderStatus[] = [
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

const DELIVERY_STATUSES: DeliveryStatus[] = [
  'Pending',
  'Packed',
  'Shipped',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'Returned',
  'Cancelled',
];

export const AdminEcommercePanel: React.FC<{ initialTab?: AdminEcomTab }> = ({ initialTab = 'overview' }) => {
  const { currentUser } = useAuth();
  const [subTab, setSubTab] = useState<AdminEcomTab>(initialTab);
  const [summary, setSummary] = useState<EcommerceAdminSummary | null>(null);
  const [products, setProducts] = useState<EcommerceProduct[]>([]);
  const [orders, setOrders] = useState<EcommerceOrder[]>([]);
  const [bpTransactions, setBpTransactions] = useState<BpTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Order filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderDateFrom, setOrderDateFrom] = useState('');
  const [orderDateTo, setOrderDateTo] = useState('');

  // Product search
  const [prodSearch, setProdSearch] = useState('');

  // Product Form Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<EcommerceProduct | null>(null);
  const [productForm, setProductForm] = useState({
    id: '',
    sku: '',
    name: '',
    description: '',
    category: 'Health & Wellness',
    subcategory: '',
    price: 400,
    discountedPrice: '' as string | number,
    bpValue: 10,
    stockQuantity: 50,
    availabilityStatus: 'in_stock' as 'in_stock' | 'out_of_stock' | 'limited',
    deliveryCharge: 0,
    isFeatured: false,
    isActive: true,
    images: [] as string[],
    specifications: [{ key: 'Brand', value: 'Watch Video, Dream in Hand' }] as ProductSpecification[],
    variations: [{ name: 'Size', options: ['Standard'] }] as ProductVariation[],
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [varOptionsDraft, setVarOptionsDraft] = useState<Record<number, string>>({});

  // Order Detail / Delivery / Payment Drawer Modal
  const [selectedOrder, setSelectedOrder] = useState<EcommerceOrder | null>(null);
  const [statusUpdateNote, setStatusUpdateNote] = useState('');
  const [deliveryForm, setDeliveryForm] = useState({
    partnerName: '',
    trackingNumber: '',
    shipmentDate: '',
    estimatedDeliveryDate: '',
    deliveryCharges: 0,
    trackingUrl: '',
    deliveryStatus: 'Pending' as DeliveryStatus,
    notes: '',
  });
  const [paymentForm, setPaymentForm] = useState({
    paymentStatus: 'Pending' as PaymentStatus,
    transactionId: '',
    paymentDate: '',
    refundStatus: 'None' as 'None' | 'Requested' | 'Refunded',
    refundNotes: '',
  });

  const flash = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4500);
  };

  const loadAllAdminEcom = async () => {
    if (!currentUser) return;
    setLoading(true);
    const headers = getAuthHeaders(currentUser.id);
    try {
      const [sumRes, prodRes, ordRes, bpRes] = await Promise.all([
        fetch('/api/ecommerce/admin/summary', { headers }),
        fetch(`/api/ecommerce/admin/products?search=${encodeURIComponent(prodSearch)}`, { headers }),
        fetch(
          `/api/ecommerce/admin/orders?search=${encodeURIComponent(orderSearch)}&status=${encodeURIComponent(orderStatusFilter)}&dateFrom=${encodeURIComponent(orderDateFrom)}&dateTo=${encodeURIComponent(orderDateTo)}`,
          { headers }
        ),
        fetch('/api/ecommerce/admin/bp-transactions', { headers }),
      ]);
      if (sumRes.ok) setSummary(await sumRes.json());
      if (prodRes.ok) {
        const pd = await prodRes.json();
        setProducts(pd.products || []);
      }
      if (ordRes.ok) {
        const od = await ordRes.json();
        setOrders(od.orders || []);
      }
      if (bpRes.ok) {
        const bd = await bpRes.json();
        setBpTransactions(bd.transactions || []);
      }
    } catch {
      flash('error', 'Failed to load e-commerce admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminEcom();
  }, [currentUser?.id, subTab]);

  // Open Create Product Modal
  const openNewProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      id: '',
      sku: '',
      name: '',
      description: '',
      category: 'Health & Wellness',
      subcategory: '',
      price: 400,
      discountedPrice: '',
      bpValue: 10,
      stockQuantity: 50,
      availabilityStatus: 'in_stock',
      deliveryCharge: 0,
      isFeatured: false,
      isActive: true,
      images: [],
      specifications: [{ key: 'Quality Standard', value: 'ISO 9001:2020 Certified' }],
      variations: [{ name: 'Pack Size', options: ['Standard'] }],
    });
    setVarOptionsDraft({ 0: 'Standard' });
    setShowProductModal(true);
  };

  const openEditProductModal = (p: EcommerceProduct) => {
    setEditingProduct(p);
    setProductForm({
      id: p.id,
      sku: p.sku,
      name: p.name,
      description: p.description,
      category: p.category,
      subcategory: p.subcategory,
      price: p.price,
      discountedPrice: p.discountedPrice ?? '',
      bpValue: p.bpValue,
      stockQuantity: p.stockQuantity,
      availabilityStatus: p.availabilityStatus,
      deliveryCharge: p.deliveryCharge,
      isFeatured: p.isFeatured,
      isActive: p.isActive,
      images: [...p.images],
      specifications: p.specifications.length > 0 ? [...p.specifications] : [{ key: '', value: '' }],
      variations: p.variations.length > 0 ? [...p.variations] : [{ name: '', options: [] }],
    });
    const drafts: Record<number, string> = {};
    p.variations.forEach((v, idx) => {
      drafts[idx] = v.options.join(', ');
    });
    setVarOptionsDraft(drafts);
    setShowProductModal(true);
  };

  // Local image file upload -> base64 data URL
  const handleImageFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files || []);
    files.forEach((file: File) => {
      if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
        flash('error', 'Only PNG, JPG, WEBP, or GIF image files are allowed.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setProductForm((prev) => ({
            ...prev,
            images: [...prev.images, reader.result as string],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const preparedVars = productForm.variations
      .map((v, idx) => ({
        name: v.name.trim(),
        options: (varOptionsDraft[idx] ?? v.options.join(','))
          .split(',')
          .map((o) => o.trim())
          .filter(Boolean),
      }))
      .filter((v) => v.name && v.options.length > 0);

    const payload = {
      ...productForm,
      discountedPrice:
        productForm.discountedPrice === '' || Number(productForm.discountedPrice) <= 0
          ? null
          : Number(productForm.discountedPrice),
      variations: preparedVars,
      specifications: productForm.specifications.filter((s) => s.key.trim() && s.value.trim()),
    };

    const url = editingProduct
      ? `/api/ecommerce/admin/products/${editingProduct.id}`
      : '/api/ecommerce/admin/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(currentUser.id),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        flash('error', data.error || 'Failed to save product.');
        return;
      }
      flash('success', editingProduct ? 'Product updated successfully!' : 'New product created!');
      setShowProductModal(false);
      await loadAllAdminEcom();
    } catch {
      flash('error', 'Network error saving product.');
    }
  };

  const handleToggleProductActive = async (p: EcommerceProduct) => {
    if (!currentUser) return;
    const res = await fetch(`/api/ecommerce/admin/products/${p.id}`, {
      method: 'PUT',
      headers: getAuthHeaders(currentUser.id),
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    if (res.ok) {
      flash('success', `${p.name} is now ${!p.isActive ? 'Active' : 'Inactive'}.`);
      loadAllAdminEcom();
    }
  };

  const handleDeleteProduct = async (p: EcommerceProduct) => {
    if (!currentUser) return;
    const res = await fetch(`/api/ecommerce/admin/products/${p.id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(currentUser.id),
    });
    if (res.ok) {
      flash('success', `Deleted product ${p.name}.`);
      loadAllAdminEcom();
    }
  };

  // Open Order Management Drawer
  const openOrderModal = (ord: EcommerceOrder) => {
    setSelectedOrder(ord);
    setStatusUpdateNote('');
    setDeliveryForm({
      partnerName: ord.delivery.partnerName || '',
      trackingNumber: ord.delivery.trackingNumber || '',
      shipmentDate: ord.delivery.shipmentDate || '',
      estimatedDeliveryDate: ord.delivery.estimatedDeliveryDate || '',
      deliveryCharges: ord.delivery.deliveryCharges ?? ord.deliveryCharges,
      trackingUrl: ord.delivery.trackingUrl || '',
      deliveryStatus: ord.delivery.deliveryStatus || 'Pending',
      notes: ord.delivery.notes || '',
    });
    setPaymentForm({
      paymentStatus: ord.paymentStatus,
      transactionId: ord.paymentTransactionId || '',
      paymentDate: ord.paymentDate || '',
      refundStatus: ord.refundStatus,
      refundNotes: '',
    });
  };

  const handleOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    if (!currentUser) return;
    const res = await fetch(`/api/ecommerce/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(currentUser.id),
      body: JSON.stringify({ status, note: statusUpdateNote || `Status updated to ${status} by Admin` }),
    });
    const data = await res.json();
    if (!res.ok) {
      flash('error', data.error || 'Failed to update order status.');
      return;
    }
    setSelectedOrder(data.order);
    flash(
      'success',
      `Order ${orderId} updated to ${status}. BP Status: ${data.order.bpCreditStatus} (${data.order.totalBp} BP)`
    );
    loadAllAdminEcom();
  };

  const handleSaveDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedOrder) return;
    const res = await fetch(`/api/ecommerce/admin/orders/${selectedOrder.id}/delivery`, {
      method: 'PATCH',
      headers: getAuthHeaders(currentUser.id),
      body: JSON.stringify(deliveryForm),
    });
    const data = await res.json();
    if (!res.ok) {
      flash('error', data.error || 'Failed to save delivery details.');
      return;
    }
    setSelectedOrder(data.order);
    flash('success', `Delivery tracking updated for ${selectedOrder.id}.`);
    loadAllAdminEcom();
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedOrder) return;
    const res = await fetch(`/api/ecommerce/admin/orders/${selectedOrder.id}/payment`, {
      method: 'PATCH',
      headers: getAuthHeaders(currentUser.id),
      body: JSON.stringify(paymentForm),
    });
    const data = await res.json();
    if (!res.ok) {
      flash('error', data.error || 'Failed to save payment details.');
      return;
    }
    setSelectedOrder(data.order);
    flash('success', `Payment status updated for ${selectedOrder.id}. BP Credit Status: ${data.order.bpCreditStatus}`);
    loadAllAdminEcom();
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSubTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              subTab === 'overview' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>E-Commerce Summary</span>
          </button>
          <button
            onClick={() => setSubTab('products')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              subTab === 'products' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Products ({products.length})</span>
          </button>
          <button
            onClick={() => setSubTab('orders')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              subTab === 'orders' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Orders, Delivery & Payments ({orders.length})</span>
          </button>
          <button
            onClick={() => setSubTab('bp-ledger')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              subTab === 'bp-ledger' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>All Users BP Ledger ({bpTransactions.length})</span>
          </button>
        </div>

        <button
          onClick={loadAllAdminEcom}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center space-x-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync</span>
        </button>
      </div>

      {notice && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center space-x-2 ${
            notice.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}
        >
          {notice.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* ==========================================
          SUBTAB 1: ADMIN DASHBOARD SUMMARY CARDS
          ========================================== */}
      {subTab === 'overview' && summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Products</span>
              <p className="text-2xl font-black text-white mt-1">{summary.totalProducts}</p>
              <span className="text-[11px] text-emerald-400">{summary.activeProducts} Active</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400">Out of Stock</span>
              <p className="text-2xl font-black text-rose-400 mt-1">{summary.outOfStockProducts}</p>
              <span className="text-[11px] text-slate-400">Needs restock</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Orders</span>
              <p className="text-2xl font-black text-amber-400 mt-1">{summary.totalOrders}</p>
              <span className="text-[11px] text-slate-400">
                {summary.pendingOrders} Pending • {summary.deliveredOrders} Delivered
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Sales (INR)</span>
              <p className="text-2xl font-black text-emerald-400 font-mono mt-1">{formatInr(summary.totalSales)}</p>
              <span className="text-[11px] text-slate-400">Active net revenue</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase text-amber-400">Total BP Credited</span>
              <p className="text-2xl font-black text-white font-mono mt-1">{summary.totalBpCredited} BP</p>
              <span className="text-[11px] text-sky-400">{summary.pendingBp} BP Pending</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase">Recent Orders</h3>
                <button onClick={() => setSubTab('orders')} className="text-xs text-amber-400 font-bold hover:underline">
                  Manage All →
                </button>
              </div>
              <div className="space-y-2">
                {summary.recentOrders.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => {
                      openOrderModal(o);
                      setSubTab('orders');
                    }}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 cursor-pointer flex items-center justify-between text-xs transition"
                  >
                    <div>
                      <p className="font-mono font-bold text-amber-400">
                        {o.id} • <span className="text-white font-sans">{o.customerName}</span> ({o.userId})
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Status: {o.orderStatus} • BP: {o.bpCreditStatus} (+{o.totalBp} BP)
                      </p>
                    </div>
                    <span className="font-mono font-black text-emerald-400">{formatInr(o.finalAmount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Best-Selling Products */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase">Best-Selling Products</h3>
                <button onClick={() => setSubTab('products')} className="text-xs text-amber-400 font-bold hover:underline">
                  Manage Catalog →
                </button>
              </div>
              <div className="space-y-2">
                {summary.bestSellingProducts.map((p) => (
                  <div key={p.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3 min-w-0">
                      <img src={p.images[0] || ''} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{p.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">
                          Product Price: {formatInr(getEffectivePrice(p.price, p.discountedPrice))} | BP: {p.bpValue} BP
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-mono shrink-0 ml-2">
                      <p className="font-black text-amber-400">{p.totalSold} Sold</p>
                      <p className="text-[10px] text-slate-400">Stock: {p.stockQuantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          SUBTAB 2: PRODUCT MANAGEMENT (CRUD)
          ========================================== */}
      {subTab === 'products' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Product Management Catalog</h3>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadAllAdminEcom()}
                  placeholder="Search product / SKU..."
                  className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                onClick={openNewProductModal}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center space-x-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price & BP</th>
                  <th className="py-3 px-3">Stock</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={p.images[0] || ''}
                          alt=""
                          className="w-11 h-11 rounded-xl object-cover border border-slate-800 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-white">{p.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">
                            {p.id} • {p.sku} {p.isFeatured && '• ★ Featured'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <p className="text-slate-200">{p.category}</p>
                      <p className="text-[10px] text-slate-400">{p.subcategory || 'General'}</p>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <p className="font-bold text-amber-400">
                        {formatInr(getEffectivePrice(p.price, p.discountedPrice))} | {p.bpValue} BP
                      </p>
                      {p.discountedPrice && p.discountedPrice < p.price && (
                        <p className="text-[10px] text-slate-500 line-through">MRP {formatInr(p.price)}</p>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className={p.stockQuantity <= 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {p.stockQuantity} units
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleProductActive(p)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          p.isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => openEditProductModal(p)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-[11px] flex items-center space-x-1"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
          SUBTAB 3: ORDERS, PAYMENTS & DELIVERY
          ========================================== */}
      {subTab === 'orders' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Order, Payment & Delivery Control</h3>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Order ID / LOGIN ID / Mobile..."
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
              />
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
              >
                <option value="All">All Statuses</option>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={orderDateFrom}
                onChange={(e) => setOrderDateFrom(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
              />
              <input
                type="date"
                value={orderDateTo}
                onChange={(e) => setOrderDateTo(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
              />
              <button
                onClick={loadAllAdminEcom}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black"
              >
                Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Order ID & Date</th>
                  <th className="py-3 px-3">Buyer LOGIN ID</th>
                  <th className="py-3 px-3">Amount & BP</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Order & Delivery</th>
                  <th className="py-3 px-3">BP Credit</th>
                  <th className="py-3 px-3 text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <p className="font-mono font-bold text-amber-400">{ord.id}</p>
                      <p className="text-[10px] text-slate-400">{ord.createdAt}</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-white">{ord.customerName}</p>
                      <p className="text-[10px] font-mono text-emerald-400">
                        {ord.userId} • {ord.mobile}
                      </p>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <p className="font-bold text-white">{formatInr(ord.finalAmount)}</p>
                      <p className="text-[11px] font-bold text-emerald-400">+{ord.totalBp} BP</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-200">{ord.paymentMethod}</p>
                      <span
                        className={`text-[10px] font-bold ${
                          ord.paymentStatus === 'Paid'
                            ? 'text-emerald-400'
                            : ord.paymentStatus === 'Refunded'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-white text-[10px] font-bold">
                        {ord.orderStatus}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {ord.delivery.partnerName ? `${ord.delivery.partnerName} (${ord.delivery.trackingNumber})` : ord.delivery.deliveryStatus}
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.bpCreditStatus === 'Credited'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : ord.bpCreditStatus === 'Reversed'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {ord.bpCreditStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => openOrderModal(ord)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px]"
                      >
                        Manage Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
          SUBTAB 4: ALL USERS BP TRANSACTIONS LEDGER
          ========================================== */}
      {subTab === 'bp-ledger' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Master BP Transactions Ledger (All Member Login IDs)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Member LOGIN ID</th>
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Items Summary</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3 text-right">BP Amount</th>
                  <th className="py-3 px-3 text-right">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {bpTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">{tx.createdAt}</td>
                    <td className="py-3 px-3">
                      <p className="font-mono font-bold text-amber-400">{tx.userId}</p>
                      <p className="text-[10px] text-slate-400">{tx.userName}</p>
                    </td>
                    <td className="py-3 px-3 font-mono text-white font-bold">{tx.orderId}</td>
                    <td className="py-3 px-3 text-slate-300">{tx.itemsSummary || tx.description}</td>
                    <td className="py-3 px-3 uppercase font-bold text-[10px]">{tx.type}</td>
                    <td
                      className={`py-3 px-3 text-right font-mono font-black ${
                        tx.bpAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.bpAmount >= 0 ? `+${tx.bpAmount}` : tx.bpAmount} BP
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white">{tx.balanceAfter} BP</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: ADD / EDIT PRODUCT
          ========================================== */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm overflow-y-auto">
          <form
            onSubmit={handleSaveProduct}
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New E-Commerce Product'}
              </h3>
              <button type="button" onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Product SKU / ID</label>
                <input
                  type="text"
                  value={productForm.sku}
                  onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  placeholder="Auto-generated if empty"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category *</label>
                <input
                  type="text"
                  required
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subcategory</label>
                <input
                  type="text"
                  value={productForm.subcategory}
                  onChange={(e) => setProductForm({ ...productForm, subcategory: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Product Price (INR ₹) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Discounted Price (INR ₹, optional)</label>
                <input
                  type="number"
                  min={0}
                  value={productForm.discountedPrice}
                  onChange={(e) => setProductForm({ ...productForm, discountedPrice: e.target.value })}
                  placeholder="Leave blank for no discount"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-emerald-400 font-bold mb-1">Product BP Value (Bonus Points) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={productForm.bpValue}
                  onChange={(e) => setProductForm({ ...productForm, bpValue: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-emerald-500/40 rounded-xl text-emerald-400 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Stock Quantity *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={productForm.stockQuantity}
                  onChange={(e) => setProductForm({ ...productForm, stockQuantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Delivery Charge (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={productForm.deliveryCharge}
                  onChange={(e) => setProductForm({ ...productForm, deliveryCharge: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Availability</label>
                <select
                  value={productForm.availabilityStatus}
                  onChange={(e) => setProductForm({ ...productForm, availabilityStatus: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  <option value="in_stock">In Stock</option>
                  <option value="limited">Limited Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Product Description</label>
              <textarea
                rows={3}
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
              />
            </div>

            {/* Multiple Product Images */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-amber-400">Product Images (Multiple Uploads & URLs)</span>
                <label className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold cursor-pointer flex items-center space-x-1.5">
                  <ImagePlus className="w-4 h-4" />
                  <span>Upload Images</span>
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple onChange={handleImageFilesUpload} className="hidden" />
                </label>
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Or paste image URL (https://...)"
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newImageUrl.trim()) {
                      setProductForm((prev) => ({ ...prev, images: [...prev.images, newImageUrl.trim()] }));
                      setNewImageUrl('');
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold"
                >
                  Add URL
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {productForm.images.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        setProductForm((prev) => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== idx),
                        }))
                      }
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Specifications & Variations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-300">Specifications</span>
                  <button
                    type="button"
                    onClick={() =>
                      setProductForm((prev) => ({
                        ...prev,
                        specifications: [...prev.specifications, { key: '', value: '' }],
                      }))
                    }
                    className="text-amber-400 font-bold"
                  >
                    + Add Spec
                  </button>
                </div>
                {productForm.specifications.map((s, idx) => (
                  <div key={idx} className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Key"
                      value={s.key}
                      onChange={(e) => {
                        const copy = [...productForm.specifications];
                        copy[idx].key = e.target.value;
                        setProductForm({ ...productForm, specifications: copy });
                      }}
                      className="w-1/2 px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={s.value}
                      onChange={(e) => {
                        const copy = [...productForm.specifications];
                        copy[idx].value = e.target.value;
                        setProductForm({ ...productForm, specifications: copy });
                      }}
                      className="w-1/2 px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                    />
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-300">Variations (Size, Color, Model)</span>
                  <button
                    type="button"
                    onClick={() => {
                      const nextIdx = productForm.variations.length;
                      setProductForm((prev) => ({
                        ...prev,
                        variations: [...prev.variations, { name: '', options: [] }],
                      }));
                      setVarOptionsDraft((prev) => ({ ...prev, [nextIdx]: '' }));
                    }}
                    className="text-amber-400 font-bold"
                  >
                    + Add Variant
                  </button>
                </div>
                {productForm.variations.map((v, idx) => (
                  <div key={idx} className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Type (e.g. Color)"
                      value={v.name}
                      onChange={(e) => {
                        const copy = [...productForm.variations];
                        copy[idx].name = e.target.value;
                        setProductForm({ ...productForm, variations: copy });
                      }}
                      className="w-2/5 px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                    />
                    <input
                      type="text"
                      placeholder="Options comma-separated"
                      value={varOptionsDraft[idx] ?? v.options.join(', ')}
                      onChange={(e) => setVarOptionsDraft({ ...varOptionsDraft, [idx]: e.target.value })}
                      className="w-3/5 px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-slate-200 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                  />
                  <span>Mark as Featured</span>
                </label>
                <label className="flex items-center space-x-2 text-slate-200 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isActive}
                    onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                  />
                  <span>Active in Storefront</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ==========================================
          MODAL: ORDER, PAYMENT & DELIVERY CONTROL
          ========================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-black text-white flex items-center space-x-2">
                  <span>Order {selectedOrder.id}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[11px] font-mono">
                    LOGIN ID: {selectedOrder.userId}
                  </span>
                </h3>
                <p className="text-slate-400 mt-0.5">
                  {selectedOrder.customerName} • {selectedOrder.mobile} • {selectedOrder.deliveryAddress},{' '}
                  {selectedOrder.cityTownVillage}, {selectedOrder.district}, {selectedOrder.state} - {selectedOrder.pincode}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Items & BP Banner */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex flex-wrap justify-between items-center gap-2 pb-2 border-b border-slate-800">
                <span className="font-bold text-slate-300">
                  Total Payable: <strong className="text-amber-400 font-mono">{formatInr(selectedOrder.finalAmount)}</strong>
                </span>
                <span className="font-bold text-emerald-400 font-mono">
                  Order BP: +{selectedOrder.totalBp} BP ({selectedOrder.bpCreditStatus})
                </span>
              </div>
              {selectedOrder.items.map((it) => (
                <div key={it.id} className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-200">
                    {it.productName} × {it.quantity} (Price: {formatInr(it.effectiveUnitPrice)} | BP: {it.unitBp} BP)
                  </span>
                  <span className="font-mono text-amber-300">
                    {formatInr(it.lineTotal)} (+{it.lineBp} BP)
                  </span>
                </div>
              ))}
            </div>

            {/* Order Status Transitions */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="font-bold text-amber-400 uppercase text-[11px]">Update Order Status (Triggers Automatic BP Rules)</h4>
              <input
                type="text"
                value={statusUpdateNote}
                onChange={(e) => setStatusUpdateNote(e.target.value)}
                placeholder="Optional status update note..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
              />
              <div className="flex flex-wrap gap-1.5">
                {ORDER_STATUSES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleOrderStatusChange(selectedOrder.id, st)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition ${
                      selectedOrder.orderStatus === st
                        ? 'bg-amber-500 text-slate-950'
                        : st === 'Cancelled' || st === 'Returned'
                        ? 'bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment & Delivery Forms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payment Update */}
              <form onSubmit={handleSavePayment} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-emerald-400 uppercase text-[11px] flex items-center space-x-1.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Payment Management ({selectedOrder.paymentMethod})</span>
                </h4>
                <div>
                  <label className="text-slate-400 block mb-1">Payment Status</label>
                  <select
                    value={paymentForm.paymentStatus}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentStatus: e.target.value as PaymentStatus })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Failed">Failed</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Transaction ID / UTR</label>
                  <input
                    type="text"
                    value={paymentForm.transactionId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Refund Status</label>
                  <select
                    value={paymentForm.refundStatus}
                    onChange={(e) => setPaymentForm({ ...paymentForm, refundStatus: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="None">None</option>
                    <option value="Requested">Requested</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-2 rounded-xl bg-emerald-500 text-slate-950 font-black">
                  Save Payment Status
                </button>
              </form>

              {/* Delivery Update */}
              <form onSubmit={handleSaveDelivery} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <h4 className="font-bold text-sky-400 uppercase text-[11px] flex items-center space-x-1.5">
                  <Truck className="w-4 h-4" />
                  <span>Delivery & Shipment Tracking</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Courier / Partner"
                    value={deliveryForm.partnerName}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, partnerName: e.target.value })}
                    className="px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  />
                  <input
                    type="text"
                    placeholder="Tracking Number"
                    value={deliveryForm.trackingNumber}
                    onChange={(e) => setDeliveryForm({ ...deliveryForm, trackingNumber: e.target.value })}
                    className="px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                  />
                  <div>
                    <span className="text-[10px] text-slate-400">Ship Date</span>
                    <input
                      type="date"
                      value={deliveryForm.shipmentDate}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, shipmentDate: e.target.value })}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Est. Delivery</span>
                    <input
                      type="date"
                      value={deliveryForm.estimatedDeliveryDate}
                      onChange={(e) => setDeliveryForm({ ...deliveryForm, estimatedDeliveryDate: e.target.value })}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                </div>
                <select
                  value={deliveryForm.deliveryStatus}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryStatus: e.target.value as DeliveryStatus })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                >
                  {DELIVERY_STATUSES.map((ds) => (
                    <option key={ds} value={ds}>
                      Delivery Status: {ds}
                    </option>
                  ))}
                </select>
                <input
                  type="url"
                  placeholder="Courier Tracking URL (https://...)"
                  value={deliveryForm.trackingUrl}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, trackingUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                />
                <input
                  type="text"
                  placeholder="Delivery Notes..."
                  value={deliveryForm.notes}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                />
                <button type="submit" className="w-full py-2 rounded-xl bg-sky-500 text-slate-950 font-black">
                  Save Delivery Tracking
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
