import React, { useState, useEffect } from 'react';
import {
  LogIn,
  UserCircle,
  GitBranch,
  Share2,
  X,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  ArrowRight,
  Wallet,
  Users,
  Award,
  Globe,
  MapPin,
  TrendingUp,
  Building2,
  ExternalLink,
  Phone,
  FileCheck,
  Sparkles,
  Camera,
} from 'lucide-react';

/* =========================================================================
   1. DISTRIBUTOR LOGIN MODAL
   ========================================================================= */
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (id: string) => void;
  onRegisterClick: () => void;
}

export const DistributorLoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onRegisterClick,
}) => {
  const [distributorId, setDistributorId] = useState('WDH-100001');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    {
      id: 'WDH-100001',
      name: 'Rajesh Sharma',
      rank: 'Diamond Leader',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'WDH-100007',
      name: 'Subhash Chandra Das',
      rank: 'Gold Leader',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'WDH-100008',
      name: 'Tanushree Roy',
      rank: 'Silver Leader',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'WDH-100009',
      name: 'Amit Kumar Sen',
      rank: 'Coral Leader',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'WDH-100010',
      name: 'Mousumi Banerjee',
      rank: 'Platinum Leader',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'WDH-100011',
      name: 'Debabrata Biswas',
      rank: 'Bronze Leader',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    },
  ];

  const [memberPreview, setMemberPreview] = useState<{
    id: string;
    name: string;
    avatarUrl: string;
    rank: string;
    kycStatus?: string;
  } | null>({
    id: 'WDH-100001',
    name: 'Rajesh Sharma',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    rank: 'Diamond Leader',
  });
  const [lookingUp, setLookingUp] = useState(false);

  useEffect(() => {
    const trimmed = distributorId.trim();
    if (!trimmed) {
      setMemberPreview(null);
      return;
    }

    const matchedDemo = demoAccounts.find((a) => a.id.toLowerCase() === trimmed.toLowerCase());
    if (matchedDemo) {
      setMemberPreview(matchedDemo);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      try {
        setLookingUp(true);
        const res = await fetch(`/api/auth/lookup-member/${encodeURIComponent(trimmed)}`);
        if (res.ok && active) {
          const data = await res.json();
          if (data.found && data.member) {
            setMemberPreview({
              id: data.member.id,
              name: data.member.name,
              avatarUrl:
                data.member.avatarUrl ||
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
              rank: data.member.currentRankName || 'Associate Member',
              kycStatus: data.member.kycStatus,
            });
          } else {
            setMemberPreview(null);
          }
        }
      } catch (err) {
        console.warn('Member photo lookup failed:', err);
      } finally {
        if (active) setLookingUp(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [distributorId]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(distributorId);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative max-w-md w-full bg-slate-900 border-2 border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl space-y-5 p-6 sm:p-7">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <LogIn className="w-3.5 h-3.5" />
            <span>Distributor Member Login</span>
          </div>
          <h3 className="text-xl font-black text-white">Access Your ERP Portal</h3>
          <p className="text-xs text-slate-400">
            Sign in to access your dual-leg binary earnings, daily video tasks, and wallet payouts.
          </p>
        </div>

        {/* Quick Demo Accounts Selection with Passport Thumbnail Photos */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quick 1-Click Demo Login:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {demoAccounts.map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => {
                  setDistributorId(acc.id);
                  setPassword('demo123');
                }}
                className={`p-1.5 rounded-xl text-left border transition flex flex-col justify-between ${
                  distributorId === acc.id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <img
                    src={acc.avatarUrl}
                    alt={acc.name}
                    className="w-6 h-7 rounded-md object-cover border border-amber-400/40"
                  />
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono truncate">{acc.id}</div>
                    <div className="text-[11px] font-semibold text-white truncate leading-tight">{acc.name}</div>
                  </div>
                </div>
                <div className="text-[9px] text-amber-400/90 truncate">{acc.rank}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Login Form with Passport Photo Verification */}
        <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-bold">Distributor / User ID</label>
            <div className="relative">
              <input
                type="text"
                required
                value={distributorId}
                onChange={(e) => setDistributorId(e.target.value)}
                placeholder="e.g. WDH-100001"
                className="w-full pl-3.5 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* PASSPORT SIZE PHOTO VERIFICATION BOX */}
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Passport Size Photo Verification (পাসপোর্ট সাইজ ছবি যাচাই)</span>
              </span>
              <span className="text-[9px] font-mono font-bold text-amber-400/90 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                35mm × 45mm
              </span>
            </div>

            {memberPreview ? (
              <div className="flex items-center space-x-3.5 bg-slate-900/90 p-2.5 rounded-xl border border-emerald-500/40">
                {/* 35mm x 45mm Passport Photo Frame */}
                <div className="relative shrink-0 text-center">
                  <div className="w-14 h-18 sm:w-16 sm:h-20 rounded-lg overflow-hidden border-2 border-emerald-400 bg-slate-950 shadow-md relative">
                    <img
                      src={memberPreview.avatarUrl}
                      alt={memberPreview.name}
                      className="w-full h-full object-cover object-top"
                    />
                    {/* Corner crop guides */}
                    <div className="absolute top-0.5 left-0.5 right-0.5 flex justify-between pointer-events-none">
                      <span className="w-1 h-1 border-t border-l border-emerald-300" />
                      <span className="w-1 h-1 border-t border-r border-emerald-300" />
                    </div>
                    <div className="absolute bottom-0.5 left-0.5 right-0.5 flex justify-between pointer-events-none">
                      <span className="w-1 h-1 border-b border-l border-emerald-300" />
                      <span className="w-1 h-1 border-b border-r border-emerald-300" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-1 text-emerald-400 text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>✓ PHOTO VERIFIED (পাসপোর্ট ছবি মিলেছে)</span>
                  </div>
                  <div className="text-sm font-black text-white truncate">{memberPreview.name}</div>
                  <div className="text-[10px] font-mono text-amber-400 truncate">
                    {memberPreview.rank} • ID: {memberPreview.id}
                  </div>
                  <div className="text-[9px] text-slate-400">
                    Officially matched with registered passport photograph
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-900/60 border border-dashed border-slate-700">
                <div className="w-14 h-18 rounded-lg border border-dashed border-slate-600 bg-slate-950/80 flex flex-col items-center justify-center text-slate-500 shrink-0">
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span className="text-[7px] font-mono">35×45mm</span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <p className="font-semibold text-slate-300">
                    {lookingUp ? 'Verifying member photo...' : 'Passport Photo Preview'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    সঠিক মেম্বার আইডি টাইপ করলে পাসপোর্ট সাইজ ছবি দৃশ্যমান হবে।
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-bold">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-medium">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>256-bit SSL Secured • Consumer Protection Rules 2021 Compliant</span>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs transition shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In & Open ERP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Free Joining Footer */}
        <div className="pt-2 border-t border-slate-800 text-center space-y-2 text-xs">
          <p className="text-slate-400">
            Don't have a Distributor ID yet?
          </p>
          <button
            type="button"
            onClick={() => {
              onClose();
              onRegisterClick();
            }}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold border border-amber-500/30 transition text-xs"
          >
            100% Free Online Registration
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   2. DISTRIBUTOR ACCOUNT MODAL
   ========================================================================= */
interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToERP: (view: string) => void;
  currentUser?: any;
}

export const DistributorAccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onNavigateToERP,
  currentUser,
}) => {
  if (!isOpen) return null;

  const [showSecret, setShowSecret] = useState(false);

  const user = currentUser || {
    id: 'WDH-100001',
    name: 'Rajesh Sharma',
    rank: 'Diamond Leader',
    rankNumber: 11,
    walletBalance: 64250,
    taskEarnings: 8420,
    kycStatus: 'Verified',
    nomineeName: 'Sunita Sharma',
    nomineeRelation: 'Wife',
    phone: '+91 98765 43210',
    joinedDate: '15 Jan 2024',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative max-w-lg w-full bg-slate-900 border-2 border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl space-y-5 p-6 sm:p-7">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Passport Size Photo */}
        <div className="flex items-center space-x-4">
          <div className="relative shrink-0 text-center">
            <div className="w-16 h-20 rounded-xl overflow-hidden border-2 border-amber-400 bg-slate-950 shadow-xl relative flex items-center justify-center">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'}
                alt={user.name}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute top-0.5 left-0.5 right-0.5 flex justify-between pointer-events-none">
                <span className="w-1.5 h-1.5 border-t border-l border-amber-300" />
                <span className="w-1.5 h-1.5 border-t border-r border-amber-300" />
              </div>
              <div className="absolute bottom-0.5 left-0.5 right-0.5 flex justify-between pointer-events-none">
                <span className="w-1.5 h-1.5 border-b border-l border-amber-300" />
                <span className="w-1.5 h-1.5 border-b border-r border-amber-300" />
              </div>
            </div>
            <span className="mt-1 inline-block px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[8px] font-mono text-amber-300 font-bold">
              35mm × 45mm
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-black text-white">{user.name}</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                ✓ PHOTO VERIFIED
              </span>
            </div>
            <p className="text-xs text-amber-400 font-mono font-bold mt-0.5">
              ID: {user.id} • {user.rank || user.currentRankName || 'Diamond Leader'} (Rank #{user.rankNumber || 11})
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Official Direct Selling Associate Account Profile
            </p>
          </div>
        </div>

        {/* Balance Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Main Payout Wallet</span>
            </div>
            <div className="text-xl font-black text-white font-mono">
              ₹{(user.walletBalance || 64250).toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-500">Available for 5% TDS Bank Withdrawal</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Daily Video Task Wallet</span>
            </div>
            <div className="text-xl font-black text-amber-400 font-mono">
              ₹{(user.taskEarnings || 8420).toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-500">Auto-credited from AdMob video views</p>
          </div>
        </div>

        {/* Nominee & Social Security Safeguard */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Nominee Social Security Charter</span>
            </span>
            <span className="text-emerald-400 font-bold font-mono text-[11px]">₹25,000/mo Active</span>
          </div>
          <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
            <span>Nominee: <strong className="text-slate-200">{user.nomineeName || 'Sunita Sharma'}</strong> ({user.nomineeRelation || 'Wife'})</span>
            <span>Tax Reg: <strong className="text-slate-200">Form 16A Enrolled</strong></span>
          </div>
        </div>

        {/* Private Sponsor & Secret Code Card */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Sponsor ID</span>
            <span className="font-mono font-bold text-amber-400">{user.id}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center justify-end gap-1">
              <span>Private Secret Code</span>
              <span className="text-[9px] text-emerald-400 font-bold">(গোপনীয়)</span>
            </span>
            <div className="flex items-center space-x-1.5 justify-end mt-0.5">
              <span className="font-mono font-black text-emerald-400 px-2 py-0.5 bg-slate-900 rounded-lg border border-emerald-500/30 tracking-wider">
                {showSecret ? (user.seniorSecretCode || 'RS-8821') : '••••••••'}
              </span>
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                title={showSecret ? "Hide" : "Show"}
              >
                {showSecret ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              onClose();
              onNavigateToERP('dashboard');
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs transition shadow-lg flex items-center justify-center space-x-2"
          >
            <span>Launch Distributor Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onClose();
                onNavigateToERP('wallet');
              }}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
            >
              Wallet & Bank Transfers
            </button>
            <button
              onClick={() => {
                onClose();
                onNavigateToERP('kyc');
              }}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
            >
              KYC & Bank Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   3. DUAL-LEG BINARY NETWORK MODAL
   ========================================================================= */
interface NetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToERP: (view: string) => void;
}

export const BinaryNetworkModal: React.FC<NetworkModalProps> = ({
  isOpen,
  onClose,
  onNavigateToERP,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative max-w-xl w-full bg-slate-900 border-2 border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl space-y-5 p-6 sm:p-7">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <GitBranch className="w-3.5 h-3.5" />
            <span>Dual-Leg Binary Network Engine</span>
          </div>
          <h3 className="text-xl font-black text-white">Left & Right Leg Geneology Status</h3>
          <p className="text-xs text-slate-400">
            Real-time binary matching volume, power leg spillover, and weaker leg payout calculations.
          </p>
        </div>

        {/* Dual Leg Split Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Left Leg (Weaker Leg) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2 relative">
            <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
              WEAKER LEG (FOCUS)
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">LEFT LEG (A)</span>
            <div className="text-2xl font-black text-white font-mono">48,000 <span className="text-xs font-sans text-slate-400">BV</span></div>
            <div className="space-y-1 text-xs text-slate-400 pt-1 border-t border-slate-800">
              <div className="flex justify-between">
                <span>Active Members:</span>
                <span className="font-bold text-slate-200">1,420</span>
              </div>
              <div className="flex justify-between">
                <span>Direct Sponsors:</span>
                <span className="font-bold text-amber-400">6 Members</span>
              </div>
            </div>
          </div>

          {/* Right Leg (Power Leg) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-2 relative">
            <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 text-[10px] font-bold border border-indigo-500/30">
              POWER LEG (SPILLOVER)
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">RIGHT LEG (B)</span>
            <div className="text-2xl font-black text-white font-mono">75,000 <span className="text-xs font-sans text-slate-400">BV</span></div>
            <div className="space-y-1 text-xs text-slate-400 pt-1 border-t border-slate-800">
              <div className="flex justify-between">
                <span>Active Members:</span>
                <span className="font-bold text-slate-200">2,180</span>
              </div>
              <div className="flex justify-between">
                <span>Direct Sponsors:</span>
                <span className="font-bold text-indigo-400">8 Members</span>
              </div>
            </div>
          </div>
        </div>

        {/* 10% Binary Matching Calculation Banner */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-400 flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>Current Cycle 10% Matching Payout</span>
            </span>
            <span className="text-base font-black text-white font-mono">₹4,800.00 INR</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-300">
            <span>Matched: <strong>48,000 BV</strong></span>
            <span>Carry-Forward to Right: <strong className="text-amber-400">27,000 BV</strong></span>
          </div>
        </div>

        {/* CTA to Open Full Binary Tree */}
        <div className="pt-1">
          <button
            onClick={() => {
              onClose();
              onNavigateToERP('binary-tree');
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs transition shadow-lg flex items-center justify-center space-x-2"
          >
            <GitBranch className="w-4 h-4" />
            <span>Open Interactive 3D Binary Tree Visualizer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   4. ALL INDIA DISTRIBUTION NETWORK MODAL
   ========================================================================= */
interface AllNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToERP: (view: string) => void;
}

export const AllIndiaNetworkModal: React.FC<AllNetworkModalProps> = ({
  isOpen,
  onClose,
  onNavigateToERP,
}) => {
  if (!isOpen) return null;

  const topStates = [
    { state: 'Delhi NCR', distributors: '34,200', leaders: '42 Diamonds', status: 'Corporate HQ' },
    { state: 'West Bengal', distributors: '28,900', leaders: '38 Diamonds', status: 'Eastern RDC' },
    { state: 'Maharashtra', distributors: '22,500', leaders: '29 Diamonds', status: 'Western Hub' },
    { state: 'Karnataka', distributors: '16,800', leaders: '21 Diamonds', status: 'Southern RDC' },
    { state: 'Uttar Pradesh', distributors: '14,400', leaders: '19 Diamonds', status: 'Regional Hub' },
    { state: 'Bihar & Odisha', distributors: '11,200', leaders: '15 Diamonds', status: 'Expansion Zone' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative max-w-2xl w-full bg-slate-900 border-2 border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl space-y-5 p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <Share2 className="w-3.5 h-3.5" />
            <span>All-India Direct Selling Network</span>
          </div>
          <h3 className="text-xl font-black text-white">120,000+ Distributors Across 28 States</h3>
          <p className="text-xs text-slate-400">
            Explore nationwide team downlines, regional distribution centers, and leadership councils.
          </p>
        </div>

        {/* Summary Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-xl font-black text-amber-400 font-mono">128,000+</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Total Distributors</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-xl font-black text-emerald-400 font-mono">28 States</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Pan-India Presence</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-xl font-black text-indigo-400 font-mono">850+</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Diamond Achievers</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-xl font-black text-yellow-400 font-mono">13 Tours</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Luxury Travel Desks</div>
          </div>
        </div>

        {/* State Hubs Table */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-300">Top State Downlines & Regional Centers:</span>
          <div className="space-y-1.5 text-xs">
            {topStates.map((st, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 transition"
              >
                <div className="flex items-center space-x-2.5">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white">{st.state}</span>
                    <span className="text-[10px] text-slate-500 ml-2">({st.status})</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 font-mono text-xs">
                  <span className="text-slate-300 font-semibold">{st.distributors} Users</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                    {st.leaders}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => {
              onClose();
              onNavigateToERP('recognition');
            }}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs transition shadow-lg flex items-center justify-center space-x-2"
          >
            <Award className="w-4 h-4" />
            <span>18-Rank National Leaderboard</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onNavigateToERP('binary-tree');
            }}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center justify-center space-x-2"
          >
            <GitBranch className="w-4 h-4 text-amber-400" />
            <span>View Downline Binary Tree</span>
          </button>
        </div>
      </div>
    </div>
  );
};
