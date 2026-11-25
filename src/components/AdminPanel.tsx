import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { User, AdminSettings, WithdrawalRequest } from '../types/index.js';
import {
  Settings,
  Users,
  Wallet,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Download,
  Edit,
  Save,
  Plus,
  ArrowRight,
  Filter,
  DollarSign,
  Radio,
  FileSpreadsheet,
  Lock,
  Archive,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AdminEcommercePanel } from './ecommerce/AdminEcommercePanel.js';

export const AdminPanel: React.FC = () => {
  const { currentUser, isAdmin, settings, refreshAllData } = useAuth();
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'members' | 'withdrawals' | 'settings' | 'ecommerce' | 'reports'>('members');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRank, setFilterRank] = useState<string>('all');
  const [filterKyc, setFilterKyc] = useState<string>('all');

  // Manual Adjust Modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [adjustType, setAdjustType] = useState<'wallet' | 'bv'>('wallet');
  const [adjustAmount, setAdjustAmount] = useState<number>(1000);
  const [adjustRemark, setAdjustRemark] = useState<string>('Admin ERP Balance adjustment');
  const [adjustSuccess, setAdjustSuccess] = useState<string | null>(null);

  // Settings form
  const [settingsForm, setSettingsForm] = useState<any>(
    settings || {
      companyName: 'Watch Video, Dream in Hand MLM ERP',
      minWithdrawal: 500,
      tdsPercentage: 5,
      adminFeePercentage: 5,
      binaryMatchingPercentage: 10,
      announcementNotice: '🌟 Special Dubai Mega Leadership Tour qualification period active! Achieve Rank 8 (Emerald) to qualify.',
    }
  );

  // Website ZIP Backup & Export states
  const [backupDownloading, setBackupDownloading] = useState(false);
  const [backupProgress, setBackupProgress] = useState<number | null>(null);
  const [backupBytesLoaded, setBackupBytesLoaded] = useState(0);
  const [backupBytesTotal, setBackupBytesTotal] = useState(0);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);

  const getAdminHeaders = () => ({
    'Content-Type': 'application/json',
    'x-user-id': currentUser?.id || localStorage.getItem('wdh_auth_user_id') || 'WDH-ADMIN',
    'x-user-role': currentUser?.role || localStorage.getItem('wdh_auth_role') || 'superadmin',
    Authorization: `Bearer ${localStorage.getItem('wdh_auth_token') || 'demo-jwt-token-WDH-ADMIN'}`,
  });

  const fetchAdminData = () => {
    fetch('/api/admin/reports/summary', { headers: getAdminHeaders() })
      .then((res) => res.json())
      .then((data) => setAdminStats(data))
      .catch((e) => console.error(e));

    fetch('/api/admin/withdrawals', { headers: getAdminHeaders() })
      .then((res) => res.json())
      .then((data) => setWithdrawals(data))
      .catch((e) => console.error(e));

    fetch('/api/admin/users', { headers: getAdminHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.users)) {
          setAdminUsers(data.users);
        }
      })
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900 border-2 border-rose-500/30 text-center space-y-4 max-w-xl mx-auto my-12 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white">Access Denied (অননুমোদিত অ্যাডমিন অ্যাক্সেস)</h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Administrator privileges are strictly required to view this Secure Admin Dashboard.
          সাধারণ ব্যবহারকারীরা শুধুমাত্র তাদের নিজস্ব ব্যক্তিগত Profile ও Account Details দেখতে ও পরিচালনা করতে পারেন।
        </p>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 font-mono flex items-center justify-between">
          <span>Active User ID: <strong className="text-amber-400">{currentUser?.id || 'Anonymous'}</strong></span>
          <span className="text-rose-400 font-bold uppercase">Role: {currentUser?.role || 'Member'} (Blocked)</span>
        </div>
      </div>
    );
  }

  const handleKycStatus = async (userId: string, status: 'verified' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/kyc-status`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ kycStatus: status }),
      });
      if (res.ok) {
        await refreshAllData();
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleWithdrawalAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/status`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ status, utrNumber: `UTR${Date.now()}` }),
      });
      if (res.ok) {
        await refreshAllData();
        fetchAdminData();
        confetti({ particleCount: 70, spread: 60 });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const res = await fetch('/api/admin/adjust-balance', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          userId: selectedUser.id,
          type: adjustType,
          amount: adjustAmount,
          remark: adjustRemark,
        }),
      });

      if (res.ok) {
        setAdjustSuccess(`Successfully adjusted ${adjustType.toUpperCase()} for ${selectedUser.name}!`);
        await refreshAllData();
        fetchAdminData();
        setTimeout(() => {
          setSelectedUser(null);
          setAdjustSuccess(null);
        }, 1500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify(settingsForm),
      });
      if (res.ok) {
        await refreshAllData();
        alert('System settings & announcement notice updated successfully!');
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  const handleDownloadWebsiteZip = async () => {
    setBackupDownloading(true);
    setBackupProgress(0);
    setBackupBytesLoaded(0);
    setBackupBytesTotal(0);
    setBackupSuccess(null);
    setBackupError(null);

    try {
      const token = localStorage.getItem('wdh_auth_token') || (currentUser?.id ? `demo-jwt-token-${currentUser.id}` : '');
      const headers: Record<string, string> = {
        'x-user-id': currentUser?.id || '',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch('/api/admin/backup/download', {
        method: 'POST',
        headers,
      });

      if (!res.ok) {
        let errMessage = `Backup export failed (HTTP ${res.status}).`;
        try {
          const errJson = await res.json();
          if (errJson?.error) errMessage = errJson.error;
        } catch {
          // Ignore JSON parse fallback
        }
        throw new Error(errMessage);
      }

      const disposition = res.headers.get('Content-Disposition') || '';
      const headerName = res.headers.get('X-Backup-File-Name');
      const match = disposition.match(/filename="?([^"]+)"?/i);
      const today = new Date().toISOString().split('T')[0];
      const fileName = headerName || match?.[1] || `Website_Full_Backup_${today}.zip`;
      const totalBytes = Number(res.headers.get('Content-Length') || 0);
      const fileCount = res.headers.get('X-Backup-File-Count');
      setBackupBytesTotal(totalBytes);

      let blob: Blob;
      if (res.body && typeof res.body.getReader === 'function') {
        const reader = res.body.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            received += value.length;
            setBackupBytesLoaded(received);
            if (totalBytes > 0) {
              setBackupProgress(Math.min(100, Math.round((received / totalBytes) * 100)));
            }
          }
        }
        setBackupProgress(100);
        blob = new Blob(chunks as BlobPart[], { type: 'application/zip' });
      } else {
        blob = await res.blob();
        setBackupBytesLoaded(blob.size);
        setBackupProgress(100);
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      const sizeKb = (blob.size / 1024).toFixed(1);
      setBackupSuccess(
        `Backup ready! Downloaded ${fileName} (${sizeKb} KB${fileCount ? `, ${fileCount} files` : ''}).`
      );
    } catch (err: any) {
      setBackupError(err?.message || 'Unable to generate complete website ZIP backup.');
      setBackupProgress(null);
    } finally {
      setBackupDownloading(false);
    }
  };

  // Filtered members from adminUsers list
  const filteredUsers = adminUsers.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.mobile.includes(searchTerm) ||
      u.pan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchRank = filterRank === 'all' || u.currentRankId.toString() === filterRank;
    const matchKyc = filterKyc === 'all' || u.kycStatus === filterKyc;

    return matchSearch && matchRank && matchKyc;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Settings className="w-6 h-6 text-red-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">Master Admin ERP Console</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete management control over network distributors, KYC validation, BV roll-ups, payouts & system rules.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center bg-slate-850 p-1 rounded-2xl border border-slate-750 gap-1">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'members' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Members ({adminUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'withdrawals' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Payouts ({withdrawals.filter((w) => w.status === 'pending').length} Pending)
          </button>
          <button
            onClick={() => setActiveTab('ecommerce')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'ecommerce' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
            }`}
          >
            Products, Orders & BP ERP
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'settings' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Settings & Broadcast
          </button>
        </div>
      </div>

      {/* Admin KPI Summary Cards */}
      {adminStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Members Registered</span>
            <h3 className="text-2xl font-black text-white mt-1">{adminStats.totalUsers}</h3>
            <p className="text-[11px] text-emerald-400 mt-1">{adminStats.verifiedKycCount} KYC Verified</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Network Business Volume</span>
            <h3 className="text-2xl font-black text-indigo-300 mt-1">
              {adminStats.totalSystemBv.toLocaleString('en-IN')} <span className="text-xs text-slate-400">BV</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Across Group 1 & Group 2 legs</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Company Incomes Paid</span>
            <h3 className="text-2xl font-black text-amber-400 mt-1">
              ₹{adminStats.totalCommissionDisbursed.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Disbursed with 5% statutory TDS</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Pending Bank Withdrawals</span>
            <h3 className="text-2xl font-black text-red-400 mt-1">
              ₹{adminStats.pendingWithdrawalsVolume.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">{adminStats.pendingWithdrawalsCount} Requests in Queue</p>
          </div>
        </div>
      )}

      {/* Tab 0: Complete E-Commerce, Product, Order, Delivery & BP Control */}
      {activeTab === 'ecommerce' && <AdminEcommercePanel />}

      {/* Tab 1: Member Management */}
      {activeTab === 'members' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Network Members Directory</h3>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Name / ID / Mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* KYC filter */}
              <select
                value={filterKyc}
                onChange={(e) => setFilterKyc(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="all">All KYC Statuses</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Member ID</th>
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3">Rank Level</th>
                  <th className="py-3 px-3">Group 1 BV</th>
                  <th className="py-3 px-3">Group 2 BV</th>
                  <th className="py-3 px-3">Wallet Balance</th>
                  <th className="py-3 px-3">KYC</th>
                  <th className="py-3 px-3 text-center">ERP Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono font-bold text-amber-400">{u.id}</td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-white">{u.name}</p>
                      <p className="text-[10px] text-slate-400">{u.mobile} • {u.pan}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                        Rank {u.currentRankId} - {u.currentRankName}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-300">{u.group1Bv.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-mono text-blue-300">{u.group2Bv.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-400">₹{u.walletBalance.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.kycStatus === 'verified'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {u.kycStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setAdjustType('wallet');
                            setAdjustAmount(1000);
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-[10px] border border-slate-700"
                          title="Manual Balance / BV Adjustment"
                        >
                          ± Adjust
                        </button>
                        {u.kycStatus === 'pending' && (
                          <button
                            onClick={() => handleKycStatus(u.id, 'verified')}
                            className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[10px]"
                          >
                            Approve KYC
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Withdrawal Queue */}
      {activeTab === 'withdrawals' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Bank Withdrawal Payout Queue</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Req ID</th>
                  <th className="py-3 px-3">Member</th>
                  <th className="py-3 px-3">Gross Amount</th>
                  <th className="py-3 px-3">5% TDS</th>
                  <th className="py-3 px-3">Net Payout</th>
                  <th className="py-3 px-3">Bank Details</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {withdrawals.map((w) => {
                  const gross = w.amount || w.requestedAmount || 0;
                  const tds = w.tdsDeducted || w.tds || 0;
                  const net = w.netPayable || w.payableAmount || (gross - tds);
                  const acc = w.bankAccount || w.accountNumber || '';
                  return (
                    <tr key={w.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-mono font-bold text-slate-400">{w.id}</td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-white">{w.userName}</p>
                        <p className="text-[10px] text-amber-400 font-mono">{w.userId}</p>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-white">₹{gross.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 font-mono text-red-400">-₹{tds.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 font-mono font-black text-emerald-400">
                        ₹{net.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-[11px]">
                        <p className="font-semibold text-slate-200">{w.bankName}</p>
                        <p className="text-slate-400 font-mono text-[10px]">{acc} • {w.ifsc}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            w.status === 'approved' || w.status === 'transferred'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : w.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {w.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {w.status === 'pending' ? (
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => handleWithdrawalAction(w.id, 'approved')}
                              className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] transition"
                            >
                              Approve & Disburse
                            </button>
                            <button
                              onClick={() => handleWithdrawalAction(w.id, 'rejected')}
                              className="px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-[10px]"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Settings & Announcement */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveSettings} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">System Global Rules & Broadcast Notice</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Company ERP Name</label>
                <input
                  type="text"
                  value={settingsForm.companyName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, companyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Minimum Withdrawal Limit (₹)</label>
                <input
                  type="number"
                  value={settingsForm.minWithdrawal}
                  onChange={(e) => setSettingsForm({ ...settingsForm, minWithdrawal: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Govt. TDS Percentage (%)</label>
                <input
                  type="number"
                  value={settingsForm.tdsPercentage}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tdsPercentage: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Binary Matching Payout Rate (%)</label>
                <input
                  type="number"
                  value={settingsForm.binaryMatchingPercentage}
                  onChange={(e) => setSettingsForm({ ...settingsForm, binaryMatchingPercentage: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Live Member Notice & Promotional Announcement Bar
              </label>
              <textarea
                rows={2}
                value={settingsForm.announcementNotice}
                onChange={(e) => setSettingsForm({ ...settingsForm, announcementNotice: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md"
              >
                Save ERP Configuration
              </button>
            </div>
          </form>

          {/* Dedicated Admin Website ZIP Backup & Export Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Archive className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Download Website ZIP Backup
                  </h3>
                </div>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  Export a complete, redeployable ZIP archive of accessible website source files, frontend/backend modules, images, logos, configurations, Hostycare setup files, and a sanitized SQLite schema &amp; catalog backup. Private credentials, `.env` secrets, API keys, and personal customer data are excluded automatically.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadWebsiteZip}
                disabled={backupDownloading}
                className="shrink-0 inline-flex items-center justify-center space-x-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-60 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                {backupDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Preparing &amp; Downloading ZIP...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Complete Website ZIP</span>
                  </>
                )}
              </button>
            </div>

            {backupDownloading && backupProgress !== null && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span>Generating &amp; streaming archive...</span>
                  <span>
                    {backupProgress}% ({(backupBytesLoaded / 1024).toFixed(1)} KB
                    {backupBytesTotal > 0 ? ` / ${(backupBytesTotal / 1024).toFixed(1)} KB` : ''})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-150"
                    style={{ width: `${Math.max(5, backupProgress)}%` }}
                  />
                </div>
              </div>
            )}

            {backupSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{backupSuccess}</span>
              </div>
            )}

            {backupError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{backupError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Balance Adjustment Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Manual Balance / BV Adjustment</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            {adjustSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                {adjustSuccess}
              </div>
            )}

            <form onSubmit={handleManualAdjust} className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Target Member:</span>
                <p className="font-bold text-white">{selectedUser.name} ({selectedUser.id})</p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Adjustment Type</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                >
                  <option value="wallet">Wallet Cash (₹)</option>
                  <option value="bv">Personal Business Volume (BV)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Amount to Add (or Subtract)</label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Audit Log Remark</label>
                <input
                  type="text"
                  value={adjustRemark}
                  onChange={(e) => setAdjustRemark(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition"
                >
                  Confirm Adjustment
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
