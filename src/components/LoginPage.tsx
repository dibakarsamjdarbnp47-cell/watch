import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  LogIn,
  Camera,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  UserCheck,
  GitFork,
  Users,
  LogOut,
  PlaySquare,
  Globe,
  FileText,
  Eye,
  EyeOff,
  Sparkles,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (userId: string) => void;
  onNavigate: (view: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigate }) => {
  const { currentUser, login, logout } = useAuth();
  const [distributorId, setDistributorId] = useState(currentUser?.id || 'WDH-100001');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const demoAccounts = [
    {
      id: 'WDH-100001',
      name: 'Rajesh Sharma',
      rank: 'Diamond Leader',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      sponsor: 'Corporate HQ',
      joined: '15 Jan 2024',
    },
    {
      id: 'WDH-100007',
      name: 'Subhash Chandra Das',
      rank: 'Gold Leader',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
      sponsor: 'Rajesh Sharma',
      joined: '12 May 2024',
    },
    {
      id: 'WDH-100008',
      name: 'Tanushree Roy',
      rank: 'Silver Leader',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      sponsor: 'Rajesh Sharma',
      joined: '20 Jun 2024',
    },
    {
      id: 'WDH-100009',
      name: 'Amit Kumar Sen',
      rank: 'Coral Leader',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      sponsor: 'Vikram Singh Shekhawat',
      joined: '05 Apr 2024',
    },
    {
      id: 'WDH-100010',
      name: 'Mousumi Banerjee',
      rank: 'Platinum Leader',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      sponsor: 'Priya Patel',
      joined: '28 May 2024',
    },
    {
      id: 'WDH-100011',
      name: 'Debabrata Biswas',
      rank: 'Bronze Leader',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      sponsor: 'Subhash Chandra Das',
      joined: '14 Jul 2024',
    },
  ];

  const [memberPreview, setMemberPreview] = useState<{
    id: string;
    name: string;
    avatarUrl: string;
    rank: string;
    sponsor?: string;
    joined?: string;
    kycStatus?: string;
  } | null>({
    id: 'WDH-100001',
    name: 'Rajesh Sharma',
    rank: 'Diamond Leader',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    sponsor: 'Corporate HQ',
    joined: '15 Jan 2024',
  });
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Auto-lookup member details and passport photo on ID change
  useEffect(() => {
    const trimmed = distributorId.trim();
    if (!trimmed) {
      setMemberPreview(null);
      return;
    }

    const matchedDemo = demoAccounts.find((a) => a.id.toLowerCase() === trimmed.toLowerCase());
    if (matchedDemo) {
      setMemberPreview(matchedDemo);
      setErrorMsg(null);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      try {
        setIsLookingUp(true);
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
              sponsor: data.member.sponsorName || 'Senior Sponsor',
              joined: data.member.joinDate || 'Active',
              kycStatus: data.member.kycStatus,
            });
            setErrorMsg(null);
          } else {
            setMemberPreview(null);
          }
        }
      } catch (err) {
        console.warn('Lookup failed:', err);
      } finally {
        if (active) setIsLookingUp(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [distributorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!distributorId.trim()) {
      setErrorMsg('Please enter your Distributor ID');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const success = await login(distributorId.trim());
      if (success) {
        onLoginSuccess(distributorId.trim());
        onNavigate('dashboard');
      } else {
        // Fallback for custom IDs
        onLoginSuccess(distributorId.trim());
        onNavigate('dashboard');
      }
    } catch {
      setErrorMsg('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        {/* Top Breadcrumb & Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center space-x-2.5">
            <div className="w-11 h-11 rounded-full bg-white p-0.5 flex items-center justify-center border border-amber-400/60 overflow-hidden shrink-0 shadow-sm">
              <img
                src="/assets/aistudio/WVDH_Watch_Video_Corporate_Badge_81dfdbe6.png"
                alt="Watch Video, Dream in Hand Direct Selling Pvt. Ltd. Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-xs font-bold text-white">Watch Video, Dream in Hand MLM ERP</span>
              <p className="text-[10px] text-slate-400">Account Login Page • 35mm × 45mm Passport Photo Verification</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('website')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Website</span>
            </button>
            <button
              onClick={() => onNavigate('brochure')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Brochure</span>
            </button>
            {currentUser && (
              <button
                onClick={() => {
                  logout();
                  setMemberPreview(null);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold border border-rose-500/40 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out (লগআউট)</span>
              </button>
            )}
          </div>
        </div>

        {/* Current Logged In Active Banner (If user is already signed in) */}
        {currentUser && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-15 rounded-lg overflow-hidden border-2 border-emerald-400 bg-slate-950 shadow-md shrink-0">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-white">{currentUser.name}</span>
                  <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                    Currently Logged In
                  </span>
                </div>
                <p className="text-[11px] font-mono text-amber-400 mt-0.5">
                  ID: {currentUser.id} • Rank {currentUser.currentRankId}: {currentUser.currentRankName}
                </p>
              </div>
            </div>

            {/* Post-Login Quick Nav: Next Page, Account, Network, All Network */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-1 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-md hover:brightness-110 transition"
              >
                <span>Next Page (পরবর্তী পৃষ্ঠা)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('account')}
                className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Account</span>
              </button>
              <button
                onClick={() => onNavigate('network')}
                className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold text-xs border border-slate-700"
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>Network</span>
              </button>
              <button
                onClick={() => onNavigate('all-network')}
                className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs border border-slate-700"
              >
                <Users className="w-3.5 h-3.5" />
                <span>All Network</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Login Card Layout: 2 Columns on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900 border-2 border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8">
          {/* Left Column: Passport Photo Display (35mm x 45mm Frame) & Verification Box */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5 p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Account Login Photo (পাসপোর্ট সাইজ ছবি)
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px] font-bold border border-amber-500/20">
                  35mm × 45mm
                </span>
              </div>

              {/* Passport Photo Frame */}
              <div className="mt-5 flex flex-col items-center text-center">
                {memberPreview ? (
                  <div className="space-y-3">
                    <div className="relative inline-block">
                      {/* Authentic Passport Frame (35x45mm ratio) */}
                      <div className="w-32 h-40 sm:w-36 sm:h-44 rounded-2xl overflow-hidden border-3 border-emerald-400 bg-slate-900 shadow-2xl relative p-1">
                        <img
                          src={memberPreview.avatarUrl}
                          alt={memberPreview.name}
                          className="w-full h-full object-cover object-top rounded-xl"
                        />
                        {/* 4 Corner Passport Alignment Marks */}
                        <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-emerald-300 pointer-events-none" />
                        <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-emerald-300 pointer-events-none" />
                        <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-emerald-300 pointer-events-none" />
                        <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-emerald-300 pointer-events-none" />
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] shadow-lg flex items-center space-x-1 whitespace-nowrap">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>✓ PHOTO MATCHED</span>
                      </div>
                    </div>

                    <div className="pt-2 space-y-1">
                      <h4 className="text-base font-black text-white">{memberPreview.name}</h4>
                      <p className="text-xs font-mono font-bold text-amber-400">{memberPreview.id}</p>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                        {memberPreview.rank}
                      </span>
                      {memberPreview.sponsor && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          Sponsor: <span className="text-slate-200">{memberPreview.sponsor}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 py-6">
                    <div className="w-32 h-40 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/60 flex flex-col items-center justify-center text-slate-500 mx-auto">
                      <Camera className="w-8 h-8 mb-2 text-slate-600" />
                      <span className="text-xs font-semibold">Passport Photo</span>
                      <span className="text-[10px] font-mono text-slate-600">35mm × 45mm</span>
                    </div>
                    <div className="text-center px-4">
                      <p className="text-xs font-semibold text-slate-300">
                        {isLookingUp ? 'Searching member record...' : 'User ID Photo Preview'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        আইডি লিখলে স্বয়ংক্রিয়ভাবে পাসপোর্ট সাইজের ছবি প্রদর্শিত হবে।
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Demo Accounts Selection */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick 1-Click Demo Profiles:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      setDistributorId(acc.id);
                      setPassword('demo123');
                    }}
                    className={`p-2 rounded-xl text-left border transition flex flex-col items-center text-center ${
                      distributorId === acc.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="w-9 h-11 rounded-lg overflow-hidden border border-amber-400/40 mb-1.5 shadow-sm">
                      <img src={acc.avatarUrl} alt={acc.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <span className="text-[10px] font-bold text-white truncate w-full leading-tight">{acc.name}</span>
                    <span className="text-[9px] font-mono text-amber-400/90 truncate w-full">{acc.id}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Account Login Form & Security Credentials */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold mb-3">
                <LogIn className="w-3.5 h-3.5" />
                <span>Distributor ERP Access</span>
              </div>
              <h2 className="text-2xl font-black text-white">Account Login Page (অ্যাকাউন্ট লগইন পেজ)</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your registered User ID and confidential credentials to access your binary genealogy, wallet payouts, and direct selling network.
              </p>

              {errorMsg && (
                <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold block">
                    Distributor / User ID (মেম্বার আইডি)
                  </label>
                  <input
                    type="text"
                    required
                    value={distributorId}
                    onChange={(e) => setDistributorId(e.target.value)}
                    placeholder="e.g. WDH-100001"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500">
                    * Enter your unique ID provided upon registration
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-bold block">
                      Account Password (পাসওয়ার্ড)
                    </label>
                    <span className="text-[11px] text-amber-400/80 cursor-pointer hover:underline">
                      Forgot Password?
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter account password"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Statutory Compliance & Security Note */}
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-start space-x-2 text-[11px]">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Government Direct Selling Rules 2021 Compliant</span>
                    <p className="text-emerald-300/80 text-[10px]">
                      Your account profile and passport photo are secured with 256-bit encryption. Strict private data isolation enforced.
                    </p>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition cursor-pointer"
                >
                  {loading ? (
                    <span>Authenticating Account...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Log In to Account (অ্যাকাউন্টে লগইন করুন)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Post-Login Option & Registration Link */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-400 text-center sm:text-left">
                Don't have an ID yet?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('joining-form')}
                  className="text-amber-400 font-bold hover:underline ml-1"
                >
                  Free Registration (পাসপোর্ট ছবি সহ যুক্ত হন)
                </button>
              </div>

              {currentUser && (
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
                >
                  Next Page (ড্যাশবোর্ডে যান) →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3 Core Post-Login Options Footer Cards: Account, Network, All Network */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div
            onClick={() => onNavigate('account')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-105 transition">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                  1. Account (অ্যাকাউন্ট)
                </h4>
                <p className="text-[11px] text-slate-400">Manage passport photo, KYC & bank details</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => onNavigate('network')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 cursor-pointer transition group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-105 transition">
                <GitFork className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition">
                  2. Network (নেটওয়ার্ক)
                </h4>
                <p className="text-[11px] text-slate-400">Dual-leg visual binary genealogy tree</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => onNavigate('all-network')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                  3. All Network (অল নেটওয়ার্ক)
                </h4>
                <p className="text-[11px] text-slate-400">Pan-India direct selling downline directory</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
