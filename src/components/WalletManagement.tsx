import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Download,
  Building,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Filter,
  DollarSign,
  ShieldAlert,
  Percent,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const WalletManagement: React.FC = () => {
  const { currentUser, transactions, refreshUserData } = useAuth();
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!currentUser) return null;

  const numAmount = Number(withdrawAmount) || 0;
  const tdsDeduction = numAmount * 0.05; // 5% Govt. TDS
  const adminCharge = numAmount * 0.05; // 5% Admin / Maintenance
  const netPayable = Math.max(0, numAmount - tdsDeduction - adminCharge);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (numAmount < 500) {
      setErrorMsg('Minimum withdrawal amount is ₹500.');
      return;
    }
    if (numAmount > currentUser.walletBalance) {
      setErrorMsg('Insufficient wallet balance for this payout.');
      return;
    }
    if (currentUser.kycStatus !== 'verified') {
      setErrorMsg('KYC Verification is required before requesting bank withdrawals.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, amount: numAmount }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Withdrawal of ₹${numAmount} requested successfully! Net ₹${netPayable} will be credited to ${currentUser.bankName}.`);
        setWithdrawAmount('');
        refreshUserData();
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      } else {
        setErrorMsg(data.error || 'Failed to submit withdrawal request.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const userTransactions = transactions.filter((t) => t.userId === currentUser.id);
  const filteredTransactions = userTransactions.filter((t) => {
    if (filterType === 'credit') return t.type === 'credit';
    if (filterType === 'debit') return t.type === 'debit';
    return true;
  });

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Transaction ID', 'Type', 'Category', 'Amount (INR)', 'BV', 'Date', 'Description'];
    const rows = userTransactions.map((t) => [
      t.id,
      t.type,
      t.category,
      t.amount,
      t.bvAmount,
      `"${t.createdAt}"`,
      `"${t.description}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MLM_Wallet_Ledger_${currentUser.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Wallet className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">Wallet & 10+ Incomes Center</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time income streams, BV rewards, automated 5% TDS compliance & instant bank payouts.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Export Ledger (CSV)</span>
        </button>
      </div>

      {/* 4 Financial Balances Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30">
          <span className="text-[10px] uppercase font-bold text-amber-400">Available Wallet Balance</span>
          <h3 className="text-2xl font-black text-amber-400 mt-1">
            ₹{currentUser.walletBalance.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Ready for Bank Transfer / Repurchase</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-emerald-400">Total Incomes Earned</span>
          <h3 className="text-2xl font-black text-emerald-400 mt-1">
            ₹{currentUser.totalIncome.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Cumulative all-time commissions</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-indigo-400">Current Month Income</span>
          <h3 className="text-2xl font-black text-indigo-300 mt-1">
            ₹{currentUser.monthlyIncome.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Rolling monthly performance</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-blue-400">Total Business Volume</span>
          <h3 className="text-2xl font-black text-white mt-1">
            {(currentUser.personalBv + currentUser.group1Bv + currentUser.group2Bv).toLocaleString('en-IN')}{' '}
            <span className="text-xs text-slate-400">BV</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Dual leg + personal BV</p>
        </div>
      </div>

      {/* 10 Incomes Breakdown Matrix */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
          Active Multi-Tier Income Streams (Direct Selling Plan)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-amber-400 font-bold">1. Retail Profit</span>
            <p className="text-slate-300 mt-1">Up to 20% margin on Ayurveda & consumer product re-sales.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-amber-400 font-bold">2. Direct Sponsor Bonus</span>
            <p className="text-slate-300 mt-1">Instant 5-10% direct sponsor commission on joining orders.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-amber-400 font-bold">3. Binary Matching Income</span>
            <p className="text-slate-300 mt-1">10% matching payout calculated on the weaker leg BV.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-amber-400 font-bold">4. Daily Video Utility Income</span>
            <p className="text-slate-300 mt-1">Instant ₹20 & 25 BV per 15-second AdMob sponsored task.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-amber-400 font-bold">5. 18-Rank Acceleration Bonus</span>
            <p className="text-slate-300 mt-1">Milestone payouts from Bronze (Rank 1) to Universal Crown (Rank 18).</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-amber-400 font-bold">6. Tour & Travel Allowance</span>
            <p className="text-slate-300 mt-1">13 all-expenses-paid tours from Domestic to USA Mega Tour.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-amber-400 font-bold">7. Accidental Death Safeguard</span>
            <p className="text-slate-300 mt-1">Nominee financial coverage up to ₹25,000 for Topaz & above ranks.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-amber-400 font-bold">8. Leadership Performance Pool</span>
            <p className="text-slate-300 mt-1">Global turnover royalty shared among Emerald and higher leaders.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-amber-400 font-bold">9. Car / House Luxury Royalty</span>
            <p className="text-slate-300 mt-1">Monthly asset maintenance fund for Diamond & Crown Ambassador.</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Withdrawal Form & Transaction Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bank Withdrawal Form */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Building className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Bank Payout Request</h3>
          </div>

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleWithdraw} className="space-y-4 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Withdrawal Amount (₹) *
              </label>
              <input
                type="number"
                min={500}
                step={100}
                max={currentUser.walletBalance}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount (Min ₹500)"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-sm focus:border-amber-500 focus:outline-none"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Max available: ₹{currentUser.walletBalance.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Statutory Deductions Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span>Requested Gross:</span>
                <span>₹{numAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-red-400">
                <span>TDS (5% Govt. Tax):</span>
                <span>- ₹{tdsDeduction.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>Admin Charge (5%):</span>
                <span>- ₹{adminCharge.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-700 flex justify-between font-bold text-white text-xs">
                <span>Net Bank Credit:</span>
                <span className="text-emerald-400 font-black">₹{netPayable.toFixed(2)}</span>
              </div>
            </div>

            {/* Target Bank Card */}
            <div className="p-3 rounded-xl bg-slate-850 border border-slate-700/60 text-[11px]">
              <span className="text-slate-400 block text-[9px] uppercase font-bold">Beneficiary Bank Details:</span>
              <p className="font-bold text-white mt-1">{currentUser.bankName}</p>
              <p className="text-slate-300 font-mono">A/C: {currentUser.bankAccount || 'Not Provided'}</p>
              <p className="text-slate-400 font-mono">IFSC: {currentUser.ifsc || 'N/A'}</p>
            </div>

            <button
              type="submit"
              disabled={submitting || numAmount <= 0}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition shadow-md"
            >
              {submitting ? 'Processing Payout...' : 'Submit Withdrawal Request'}
            </button>
          </form>
        </div>

        {/* Real-time Ledger Statement */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Wallet & BV Transaction Ledger</h3>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filterType === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('credit')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filterType === 'credit' ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Incomes (+)
              </button>
              <button
                onClick={() => setFilterType('debit')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filterType === 'debit' ? 'bg-red-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Payouts (-)
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {filteredTransactions.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">No transactions found in this view.</p>
            ) : (
              filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-750 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        tx.type === 'credit'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {tx.type === 'credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{tx.description}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {tx.id} • {tx.createdAt}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-mono font-bold text-sm ${
                        tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </p>
                    {tx.bvAmount > 0 && (
                      <span className="text-[10px] text-indigo-300 font-semibold">
                        +{tx.bvAmount.toLocaleString('en-IN')} BV
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
