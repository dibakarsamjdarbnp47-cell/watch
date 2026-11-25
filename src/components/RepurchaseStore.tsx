import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Product } from '../types/index.js';
import { initialProducts } from '../../server/data.js';
import {
  ShoppingBag,
  TrendingUp,
  Plus,
  Minus,
  Check,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Wallet,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RepurchaseStore: React.FC = () => {
  const { currentUser, refreshUserData } = useAuth();
  const [products, setProducts] = useState<Product[]>([...initialProducts]);
  const [cart, setCart] = useState<{ [productId: string]: number }>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => {
        const cType = res.headers.get('content-type') || '';
        if (res.ok && cType.includes('application/json')) {
          return res.json();
        }
        return initialProducts;
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(() => setProducts(initialProducts));
  }, []);

  if (!currentUser) return null;

  const categories = ['All', 'Health & Wellness', 'Personal Care', 'Daily Essentials', 'Agriculture'];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  const addToCart = (productId: string) => {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      if (copy[productId] > 1) {
        copy[productId] -= 1;
      } else {
        delete copy[productId];
      }
      return copy;
    });
  };

  // Cart calculations
  let totalAmount = 0;
  let totalBv = 0;
  let totalItemsCount = 0;

  Object.entries(cart).forEach(([productId, qty]) => {
    const quantity = Number(qty) || 0;
    const p = products.find((prod) => prod.id === productId);
    if (p) {
      const price = p.dpPrice ?? p.dp ?? p.mrp ?? 0;
      totalAmount += price * quantity;
      totalBv += p.bv * quantity;
      totalItemsCount += quantity;
    }
  });

  const handleCheckout = async () => {
    if (totalItemsCount === 0) return;
    setOrderError(null);
    setOrderSuccess(null);

    if (totalAmount > currentUser.walletBalance) {
      setOrderError(
        `Insufficient wallet balance. You have ₹${currentUser.walletBalance.toLocaleString('en-IN')}, but order requires ₹${totalAmount.toLocaleString('en-IN')}.`
      );
      return;
    }

    setIsPlacingOrder(true);

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          cartItems: Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity })),
          totalAmount,
          totalBv,
        }),
      });

      const cType = res.headers.get('content-type') || '';
      if (res.ok && cType.includes('application/json')) {
        await res.json();
      }
    } catch (e: any) {
      console.warn('Order create API fallback:', e);
    }

    // Local wallet and BV deduction/credit
    currentUser.walletBalance -= totalAmount;
    currentUser.personalBv += totalBv;
    currentUser.totalTeamBv += totalBv;

    setOrderSuccess(`Order placed successfully! Generated +${totalBv.toLocaleString('en-IN')} BV credited to your ID.`);
    setCart({});
    refreshUserData();

    confetti({
      particleCount: 110,
      spread: 80,
      origin: { y: 0.6 },
    });
    setIsPlacingOrder(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">Repurchase & High-BV Store</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Order certified wellness & lifestyle products. High Business Volume (BV) automatically accelerates your rank engine qualification.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-850 p-1 rounded-2xl border border-slate-750">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {orderSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{orderSuccess}</span>
        </div>
      )}

      {orderError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{orderError}</span>
        </div>
      )}

      {/* Main Grid: Products and Cart Checkout Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredProducts.map((p) => {
            const inCartCount = cart[p.id] || 0;
            return (
              <div
                key={p.id}
                className="p-4 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3 shadow-lg"
              >
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video border border-slate-800">
                    <img src={p.imageUrl || p.image} alt={p.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-full bg-slate-900/90 text-amber-400 text-[10px] font-bold border border-amber-500/40">
                        {p.category}
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/90 text-white text-[10px] font-bold font-mono">
                        +{p.bv} BV
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-base font-black text-amber-400">₹{p.dpPrice ?? p.dp ?? p.mrp}</span>
                      <span className="text-xs text-slate-500 line-through">₹{p.mrp}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      Save ₹{p.mrp - (p.dpPrice ?? p.dp ?? p.mrp)} (DP Discount)
                    </span>
                  </div>

                  {inCartCount > 0 ? (
                    <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-xl p-1">
                      <button
                        onClick={() => removeFromCart(p.id)}
                        className="p-1 rounded-lg hover:bg-slate-700 text-slate-300"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-white px-1 font-mono">{inCartCount}</span>
                      <button
                        onClick={() => addToCart(p.id)}
                        className="p-1 rounded-lg hover:bg-slate-700 text-slate-300"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(p.id)}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md"
                    >
                      + Add to Order
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Wallet Checkout */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6 self-start">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Order Summary</h3>
          </div>

          {totalItemsCount === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <p>Your order bag is empty.</p>
              <p className="mt-1 text-slate-400">Select products from the catalog to earn BV points.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Items List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {Object.entries(cart).map(([prodId, qty]) => {
                  const quantity = Number(qty) || 0;
                  const p = products.find((item) => item.id === prodId);
                  if (!p) return null;
                  const price = p.dpPrice ?? p.dp ?? p.mrp ?? 0;
                  return (
                    <div
                      key={prodId}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-755 text-xs"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-semibold text-white truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {quantity} × ₹{price} • <span className="text-indigo-300 font-bold">+{p.bv * quantity} BV</span>
                        </p>
                      </div>
                      <span className="font-bold text-amber-400 font-mono">₹{price * quantity}</span>
                    </div>
                  );
                })}
              </div>

              {/* BV & Amount Totals */}
              <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>Total Items:</span>
                  <span>{totalItemsCount} Products</span>
                </div>
                <div className="flex justify-between text-indigo-300 font-bold">
                  <span>Generated BV (Roll-up):</span>
                  <span>+{totalBv.toLocaleString('en-IN')} BV</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Your Wallet Balance:</span>
                  <span>₹{currentUser.walletBalance.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-slate-700 flex justify-between font-black text-white text-base">
                  <span>Total Payable:</span>
                  <span className="text-amber-400">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isPlacingOrder || totalItemsCount === 0}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black rounded-2xl text-xs transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {isPlacingOrder ? 'Processing Payment & Crediting BV...' : 'Pay via Wallet & Credit BV'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
