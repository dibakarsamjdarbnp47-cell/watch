import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { BpWalletSummary } from '../../types/index.js';
import { getAuthHeaders } from './ecommerceApi.js';
import {
  Award,
  CheckCircle2,
  Clock,
  RefreshCw,
  RotateCcw,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface BpWalletSectionProps {
  onNavigateToProducts?: () => void;
  compact?: boolean;
}

export const BpWalletSection: React.FC<BpWalletSectionProps> = ({ onNavigateToProducts, compact = false }) => {
  const { currentUser } = useAuth();
  const [wallet, setWallet] = useState<BpWalletSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBpWallet = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ecommerce/my-bp-wallet', {
        headers: getAuthHeaders(currentUser.id),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load BP Wallet');
      }
      setWallet(data);
    } catch (e: any) {
      setError(e.message || 'Unable to load BP wallet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBpWallet();
  }, [currentUser?.id]);

  if (!currentUser) return null;

  if (compact) {
    return (
      <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Login ID BP Wallet</span>
              <h3 className="text-sm font-black text-white">{currentUser.id}</h3>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
            Auto-Verified
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Total BP</span>
            <p className="text-lg font-black text-amber-400 font-mono">
              {loading ? '...' : `${wallet?.totalBpBalance ?? 0} BP`}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Pending BP</span>
            <p className="text-lg font-black text-sky-400 font-mono">
              {loading ? '...' : `${wallet?.pendingOrderBp ?? 0} BP`}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Earned</span>
            <p className="text-lg font-black text-emerald-400 font-mono">
              {loading ? '...' : `${wallet?.totalBpEarned ?? 0} BP`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-amber-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-black text-white">My BP Wallet (Bonus Point Ledger)</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            BP earned from qualifying product orders is automatically verified and credited exclusively to your Login ID:{' '}
            <strong className="font-mono text-amber-400">{currentUser.id}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadBpWallet}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center space-x-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {onNavigateToProducts && (
            <button
              onClick={onNavigateToProducts}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs flex items-center space-x-1.5 shadow-md transition"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Shop Products</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{error}</div>
      )}

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Available BP Balance</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400 font-mono mt-2">{wallet?.totalBpBalance ?? 0} BP</p>
          <p className="text-[11px] text-slate-400 mt-1">Linked to LOGIN ID {currentUser.id}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total BP Earned</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400 font-mono mt-2">+{wallet?.totalBpEarned ?? 0} BP</p>
          <p className="text-[11px] text-slate-400 mt-1">From verified product purchases</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Order BP</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-3xl font-black text-sky-400 font-mono mt-2">{wallet?.pendingOrderBp ?? 0} BP</p>
          <p className="text-[11px] text-slate-400 mt-1">Credits upon confirmation / delivery</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Reversed / Adjusted</span>
            <RotateCcw className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-3xl font-black text-rose-400 font-mono mt-2">{wallet?.totalBpReversed ?? 0} BP</p>
          <p className="text-[11px] text-slate-400 mt-1">Cancelled / returned order reversals</p>
        </div>
      </div>

      {/* Security Policy Notice */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start space-x-3 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white">Automated BP Protection & Order Verification Policy</p>
          <p className="text-slate-400 leading-relaxed">
            BP is calculated automatically from each product&apos;s verified BP value multiplied by quantity. Pending, unconfirmed, or cancelled orders never receive BP. Returned or refunded orders automatically reverse previously credited BP. Each qualifying order is credited strictly once.
          </p>
        </div>
      </div>

      {/* BP Transactions Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">BP Transaction & Order Credit History</h3>
          <span className="text-xs font-mono text-slate-400">{wallet?.transactions.length ?? 0} Entries</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading your BP transaction ledger...</div>
        ) : !wallet || wallet.transactions.length === 0 ? (
          <div className="py-12 text-center space-y-2 text-xs text-slate-400">
            <p>No BP transactions recorded yet for {currentUser.id}.</p>
            <p className="text-slate-500">Purchase products from the PRODUCT menu to earn Bonus Points automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Products, Price & BP</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3 text-right">BP Change</th>
                  <th className="py-3 px-3 text-right">Balance After</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {wallet.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">{tx.createdAt}</td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-400 whitespace-nowrap">{tx.orderId}</td>
                    <td className="py-3 px-3">
                      <p className="text-slate-200 font-medium">{tx.itemsSummary || tx.description}</p>
                      <p className="text-[10px] text-slate-400">{tx.description}</p>
                    </td>
                    <td className="py-3 px-3 uppercase font-bold text-[10px]">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          tx.type === 'credit'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : tx.type === 'reversal'
                            ? 'bg-rose-500/15 text-rose-400'
                            : 'bg-sky-500/15 text-sky-400'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-mono font-black whitespace-nowrap ${
                        tx.bpAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.bpAmount >= 0 ? `+${tx.bpAmount}` : tx.bpAmount} BP
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white whitespace-nowrap">
                      {tx.balanceAfter} BP
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.status === 'credited'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{tx.status.toUpperCase()}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
