import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { RankCalculationResult } from '../../server/rankEngine.js';
import {
  Wallet,
  TrendingUp,
  Award,
  Users,
  GitFork,
  PlaySquare,
  ArrowUpRight,
  ShieldCheck,
  Plane,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  Layers,
  Clock,
  ArrowRight,
  HelpCircle,
  FileCheck2,
  Key,
  Lock,
  Eye,
  EyeOff,
  Share2,
  ShieldAlert,
  UserCheck,
  Building,
  Save,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  LogOut,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BpWalletSection } from './ecommerce/BpWalletSection.js';

interface DashboardProps {
  onNavigate: (view: string) => void;
  onOpenAi: () => void;
}

export const MemberDashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenAi }) => {
  const { currentUser, settings, refreshUserData, updateMyProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'bp-wallet'>('overview');
  const [rankInfo, setRankInfo] = useState<RankCalculationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingRank, setLoadingRank] = useState(true);

  // Profile Form State for self-management
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    mobile: currentUser?.mobile || '',
    email: currentUser?.email || '',
    address: currentUser?.address || '',
    state: currentUser?.state || '',
    pincode: currentUser?.pincode || '',
    bankName: currentUser?.bankName || '',
    bankAccount: currentUser?.bankAccount || '',
    bankIfsc: currentUser?.bankIfsc || '',
    bankBranch: currentUser?.bankBranch || '',
    nomineeName: currentUser?.nomineeName || '',
    nomineeRelation: currentUser?.nomineeRelation || '',
    pan: currentUser?.pan || '',
    aadhaar: currentUser?.aadhaar || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Sync profile form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        mobile: currentUser.mobile || '',
        email: currentUser.email || '',
        address: currentUser.address || '',
        state: currentUser.state || '',
        pincode: currentUser.pincode || '',
        bankName: currentUser.bankName || '',
        bankAccount: currentUser.bankAccount || '',
        bankIfsc: currentUser.bankIfsc || '',
        bankBranch: currentUser.bankBranch || '',
        nomineeName: currentUser.nomineeName || '',
        nomineeRelation: currentUser.nomineeRelation || '',
        pan: currentUser.pan || '',
        aadhaar: currentUser.aadhaar || '',
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    fetch(`/api/users/${currentUser.id}/rank`)
      .then((res) => res.json())
      .then((data) => {
        setRankInfo(data);
        setLoadingRank(false);
      })
      .catch((err) => {
        console.error('Failed to load rank info:', err);
        setLoadingRank(false);
      });
  }, [currentUser]);

  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showSecretCode, setShowSecretCode] = useState(false);

  if (!currentUser) return null;

  const totalBv = currentUser.personalBv + currentUser.group1Bv + currentUser.group2Bv;
  const weakerLegBv = Math.min(currentUser.group1Bv, currentUser.group2Bv);
  const strongerLegBv = Math.max(currentUser.group1Bv, currentUser.group2Bv);

  const copySponsorLink = () => {
    navigator.clipboard.writeText(currentUser.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copySecretCode = () => {
    navigator.clipboard.writeText(currentUser.seniorSecretCode || 'RS-8821');
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(null);

    const success = await updateMyProfile(profileForm);
    setIsSaving(false);

    if (success) {
      setSaveSuccess('আপনার প্রোফাইল ও অ্যাকাউন্ট বিবরণী সফলভাবে আপডেট করা হয়েছে (Profile updated successfully)!');
      confetti({ particleCount: 50, spread: 60 });
      setTimeout(() => setSaveSuccess(null), 4000);
    } else {
      setSaveSuccess('Error updating profile. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Dashboard Navigation Bar with Account, Network, All Network & Logout */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          <button
            onClick={() => onNavigate('account')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 transition"
            title="Manage Private Account"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Account (অ্যাকাউন্ট)</span>
          </button>

          <button
            onClick={() => onNavigate('network')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold text-xs border border-slate-700 transition"
            title="Binary Genealogy Tree"
          >
            <GitFork className="w-3.5 h-3.5 text-blue-400" />
            <span>Network (নেটওয়ার্ক)</span>
          </button>

          <button
            onClick={() => onNavigate('all-network')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs border border-slate-700 transition"
            title="All Downlines Directory with Pagination"
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>All Network (অল নেটওয়ার্ক)</span>
          </button>

          <div className="hidden sm:block h-5 w-[1px] bg-slate-800 mx-1" />

          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'profile'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Profile Tab</span>
          </button>
          <button
            onClick={() => setActiveTab('bp-wallet')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'bp-wallet'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>BP Wallet</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center space-x-2 text-[11px] px-3 py-1 bg-slate-950/60 rounded-xl border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">User ID:</span>
            <span className="font-mono font-bold text-amber-400">{currentUser.id}</span>
            <span className="text-emerald-400 font-semibold">• Isolated</span>
          </div>

          <button
            onClick={() => {
              logout();
              onNavigate('website');
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white font-bold text-xs transition cursor-pointer"
            title="Log out from account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out (লগআউট)</span>
          </button>
        </div>
      </div>

      {/* Broadcast Announcement Bar */}
      {settings?.announcementNotice && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
            <p className="text-xs font-medium text-amber-200">{settings.announcementNotice}</p>
          </div>
          <button
            onClick={() => onNavigate('recognition')}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1 shrink-0 ml-2"
          >
            <span>View Tours</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TAB 2: MY PRIVATE PROFILE & ACCOUNT DETAILS */}
      {activeTab === 'profile' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">
                  My Profile & Account Details (ব্যক্তিগত প্রোফাইল ও অ্যাকাউন্ট ব্যবস্থাপনা)
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                আপনার সমস্ত ব্যক্তিগত তথ্য, ব্যাঙ্ক অ্যাকাউন্ট ও নমিনী বিবরণ সম্পূর্ণ প্রাইভেট ও সুরক্ষিত। আপনি ছাড়া অন্য কোনো ব্যবহারকারী এই ডেটা দেখতে পারবে না।
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono">
                🔒 STRICT DATA ISOLATION
              </span>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{saveSuccess}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Section 1: Security & Identity Summary */}
            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-750 space-y-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Account Identity & Security (গোপনীয় আইডি ও অথরাইজেশন)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Private User ID:</span>
                  <span className="font-mono text-sm font-bold text-amber-400">{currentUser.id}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">System Role:</span>
                  <span className="font-bold text-white uppercase">{currentUser.role}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Senior Sponsor:</span>
                  <span className="font-semibold text-slate-200">{currentUser.sponsorName} ({currentUser.sponsorId})</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Private Secret Code:</span>
                  <span className="font-mono text-xs font-black text-emerald-400">
                    {showSecretCode ? (currentUser.seniorSecretCode || 'RS-8821') : '••••••••'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Personal Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>Personal Information (ব্যক্তিগত তথ্য)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name (পূর্ণ নাম)</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Mobile Number (মোবাইল নম্বর)</label>
                  <input
                    type="tel"
                    value={profileForm.mobile}
                    onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address (ইমেইল)</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Postal Address (ঠিকানা)</label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    placeholder="Enter complete residential address"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">State (রাজ্য)</label>
                    <input
                      type="text"
                      value={profileForm.state}
                      onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                      placeholder="e.g. West Bengal"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Pincode (পিনকোড)</label>
                    <input
                      type="text"
                      value={profileForm.pincode}
                      onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })}
                      placeholder="e.g. 700001"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Banking & Payout Account Details */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Bank & Financial Account Details (ব্যাঙ্ক ও পেআউট অ্যাকাউন্ট)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Bank Name (ব্যাঙ্কের নাম)</label>
                  <input
                    type="text"
                    value={profileForm.bankName}
                    onChange={(e) => setProfileForm({ ...profileForm, bankName: e.target.value })}
                    placeholder="e.g. State Bank of India"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Account Number (হিসাব নম্বর)</label>
                  <input
                    type="text"
                    value={profileForm.bankAccount}
                    onChange={(e) => setProfileForm({ ...profileForm, bankAccount: e.target.value })}
                    placeholder="Account Number"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">IFSC Code (আইএফএসসি কোড)</label>
                  <input
                    type="text"
                    value={profileForm.bankIfsc}
                    onChange={(e) => setProfileForm({ ...profileForm, bankIfsc: e.target.value.toUpperCase() })}
                    placeholder="e.g. SBIN0001234"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Branch Name (শাখা)</label>
                  <input
                    type="text"
                    value={profileForm.bankBranch}
                    onChange={(e) => setProfileForm({ ...profileForm, bankBranch: e.target.value })}
                    placeholder="Branch"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">PAN Card Number (প্যান কার্ড)</label>
                  <input
                    type="text"
                    value={profileForm.pan}
                    onChange={(e) => setProfileForm({ ...profileForm, pan: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono uppercase"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">* 5% TDS কর্তন ও আয়কর বিধির জন্য প্রযোজ্য</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Aadhaar Card Number (আধার নম্বর)</label>
                  <input
                    type="text"
                    value={profileForm.aadhaar}
                    onChange={(e) => setProfileForm({ ...profileForm, aadhaar: e.target.value })}
                    placeholder="1234 5678 9012"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Nominee Details */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Nominee Details & Accidental Safeguard (নমিনী বিবরণী)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Nominee Full Name (নমিনীর নাম)</label>
                  <input
                    type="text"
                    value={profileForm.nomineeName}
                    onChange={(e) => setProfileForm({ ...profileForm, nomineeName: e.target.value })}
                    placeholder="Nominee Name"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Relationship with Nominee (সম্পর্ক)</label>
                  <input
                    type="text"
                    value={profileForm.nomineeRelation}
                    onChange={(e) => setProfileForm({ ...profileForm, nomineeRelation: e.target.value })}
                    placeholder="e.g. Wife, Son, Mother, Husband"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit & Save Button */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <p className="text-[11px] text-slate-400">
                🔒 তথ্য সম্পূর্ণ গোপনীয় রাখা হবে এবং সুরক্ষিত এনক্রিপশনে সংরক্ষিত থাকবে।
              </p>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-lg hover:brightness-110 transition flex items-center space-x-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save & Update Profile (তথ্য সংরক্ষণ করুন)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: BP WALLET (BONUS POINT LEDGER) */}
      {activeTab === 'bp-wallet' && (
        <BpWalletSection onNavigateToProducts={() => onNavigate('product')} />
      )}

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {activeTab === 'overview' && (
        <>
          {/* Hero Welcome Banner & Sponsor Box */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="relative shrink-0 text-center">
              <div className="w-16 sm:w-20 h-20 sm:h-24 rounded-xl overflow-hidden border-2 border-amber-400 bg-slate-950 shadow-xl relative">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute top-0.5 left-0.5 right-0.5 flex justify-between pointer-events-none">
                  <span className="w-1 h-1 border-t border-l border-amber-300" />
                  <span className="w-1 h-1 border-t border-r border-amber-300" />
                </div>
                <div className="absolute bottom-0.5 left-0.5 right-0.5 flex justify-between pointer-events-none">
                  <span className="w-1 h-1 border-b border-l border-amber-300" />
                  <span className="w-1 h-1 border-b border-r border-amber-300" />
                </div>
              </div>
              <span className="mt-1 inline-block px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-[8px] font-mono text-amber-300 font-bold">
                35mm × 45mm
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">{currentUser.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-extrabold shadow-sm">
                  Rank {currentUser.currentRankId}: {currentUser.currentRankName}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono">
                <span>Member ID: <strong className="text-amber-400 font-bold">{currentUser.id}</strong></span>
                <span>•</span>
                <span>Sponsor: {currentUser.sponsorName} ({currentUser.sponsorId})</span>
                <span>•</span>
                <span>Joined: {currentUser.joinDate}</span>
              </p>
            </div>
          </div>

          {/* Quick Sponsor & Senior Secret Code Sharing */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/70">
            {/* Sponsor Code */}
            <div className="text-xs text-left px-2 border-r border-slate-700/70 pr-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Sponsor ID</span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="text-sm font-mono font-bold text-amber-400">{currentUser.id}</span>
                <button
                  onClick={copySponsorLink}
                  className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
                  title="Copy Sponsor ID"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Mandatory Senior Secret Code - Protected & Private */}
            <div className="text-xs text-left px-2">
              <div className="flex items-center space-x-1.5">
                <Key className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] uppercase font-black text-amber-400">
                  Your Private Secret Code
                </span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30 flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" />
                  <span>গোপনীয় (Private)</span>
                </span>
              </div>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="text-sm font-mono font-black text-emerald-400 px-2 py-0.5 bg-slate-900 rounded-lg border border-emerald-500/40 tracking-wider">
                  {showSecretCode ? (currentUser.seniorSecretCode || 'RS-8821') : '••••••••'}
                </span>
                <button
                  onClick={() => setShowSecretCode(!showSecretCode)}
                  className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
                  title={showSecretCode ? "Hide Secret Code" : "Show Secret Code (গোপন কোড দেখুন)"}
                >
                  {showSecretCode ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={copySecretCode}
                  className="p-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition"
                  title="Copy Secret Code (শুধুমাত্র ডাউনলাইনকে জয়েন করানোর সময় দিন)"
                >
                  {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Hello! Join Watch Video Dream in Hand under my sponsorship.\nSponsor ID: ${currentUser.id} (${currentUser.name})\nSenior Secret Code: ${currentUser.seniorSecretCode || 'RS-8821'}\n(Note: Keep this authorization code safe and use it on the registration page).`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition"
                  title="Share Authorization Code with Downline via WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </a>
              </div>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                * এই কোডটি প্ল্যাটফর্মের অন্য কোনো মেম্বার দেখতে পাবে না (Strictly Private to You)
              </span>
            </div>

            <button
              onClick={() => onNavigate('joining-form')}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-sm flex items-center space-x-1 ml-auto"
            >
              <span>+ Register Downline</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Financial & BV KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Wallet Balance */}
        <div
          onClick={() => onNavigate('wallet')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Available Wallet</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-white group-hover:text-amber-400 transition">
              ₹{currentUser.walletBalance.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
              <span>Total Payouts: ₹{currentUser.totalIncome.toLocaleString('en-IN')}</span>
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
            </p>
          </div>
        </div>

        {/* 2. Total Business Volume (BV) */}
        <div
          onClick={() => onNavigate('recognition')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Business Volume</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-indigo-300">
              {totalBv.toLocaleString('en-IN')} <span className="text-sm font-semibold text-slate-400">BV</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Personal: {currentUser.personalBv.toLocaleString('en-IN')} BV • Re-selling: {currentUser.resellingBv.toLocaleString('en-IN')} BV
            </p>
          </div>
        </div>

        {/* 3. Dual Vertical Leg Volume (Group 1 vs Group 2) */}
        <div
          onClick={() => onNavigate('binary-tree')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Dual Verticals (Leg BV)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
              <GitFork className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Left (G1): <strong>{currentUser.group1Bv.toLocaleString('en-IN')}</strong></span>
              <span className="text-slate-300">Right (G2): <strong>{currentUser.group2Bv.toLocaleString('en-IN')}</strong></span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden flex">
              <div
                className="bg-emerald-400 h-2"
                style={{
                  width: `${totalBv > 0 ? (currentUser.group1Bv / (currentUser.group1Bv + currentUser.group2Bv || 1)) * 100 : 50}%`,
                }}
              />
              <div
                className="bg-blue-400 h-2"
                style={{
                  width: `${totalBv > 0 ? (currentUser.group2Bv / (currentUser.group1Bv + currentUser.group2Bv || 1)) * 100 : 50}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 flex justify-between">
              <span>Matching Base: {weakerLegBv.toLocaleString('en-IN')} BV</span>
              <span className="text-emerald-400 font-semibold">10% Binary</span>
            </p>
          </div>
        </div>

        {/* 4. Binary Team Size */}
        <div
          onClick={() => onNavigate('binary-tree')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Binary Team Count</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-purple-300">
              {currentUser.leftTeamCount + currentUser.rightTeamCount} <span className="text-sm font-semibold text-slate-400">Members</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex justify-between">
              <span>Left: {currentUser.leftTeamCount} | Right: {currentUser.rightTeamCount}</span>
              <span className="text-amber-400 font-semibold">Direct: {currentUser.directMembersCount}</span>
            </p>
          </div>
        </div>
      </div>

      {/* BP Wallet Compact Summary Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <div className="lg:col-span-2">
          <BpWalletSection compact onNavigateToProducts={() => onNavigate('product')} />
        </div>
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Product Orders & BP</span>
            <h4 className="text-sm font-black text-white mt-0.5">Shop & Track Bonus Points</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              View your itemized BP credits, pending orders, and reversals linked to {currentUser.id}.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('bp-wallet')}
              className="flex-1 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition"
            >
              Open BP Wallet
            </button>
            <button
              onClick={() => onNavigate('product')}
              className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition"
            >
              Open PRODUCT
            </button>
          </div>
        </div>
      </div>

      {/* Automated Rank Engine & Next Rank Milestone Card */}
      {rankInfo && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Automated 18-Rank Engine
              </span>
              <h2 className="text-lg font-bold text-white">Recognition Level Qualification Status</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigate('recognition')}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
              >
                <span>View Full 18-Rank Table</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Current Rank Badge */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/30 text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <Award className="w-7 h-7 text-amber-400" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Achieved Rank</p>
                <h3 className="text-xl font-black text-amber-400">
                  {currentUser.currentRankName}
                </h3>
                <p className="text-xs text-slate-300">Level {currentUser.currentRankId} of 18</p>
              </div>
              {currentUser.safeguardEligible && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  🛡️ Safeguard ₹{currentUser.safeguardAmount.toLocaleString('en-IN')} Active
                </span>
              )}
            </div>

            {/* Next Rank Targets */}
            <div className="lg:col-span-2 space-y-4">
              {rankInfo.nextRank ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Target Next Recognition Level:</span>
                      <h4 className="text-base font-bold text-white flex items-center space-x-2">
                        <span>Rank {rankInfo.nextRank.id} - {rankInfo.nextRank.name}</span>
                        {rankInfo.nextRank.promotionReward && (
                          <span className="text-xs text-amber-400 font-semibold">
                            (✈️ {rankInfo.nextRank.promotionReward})
                          </span>
                        )}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-400">{rankInfo.progressPercent}%</span>
                      <p className="text-[10px] text-slate-400">Qualification Score</p>
                    </div>
                  </div>

                  {/* Overall Progress Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-yellow-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(5, rankInfo.progressPercent))}%` }}
                    />
                  </div>

                  {/* Dual Vertical Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {/* Total BV */}
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Total BV Required</span>
                      <p className="font-bold text-white mt-1">
                        {totalBv.toLocaleString('en-IN')} / {rankInfo.nextRank.totalBvRequired.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-amber-400 mt-1">
                        {rankInfo.remainingTotalBv > 0
                          ? `Need ${rankInfo.remainingTotalBv.toLocaleString('en-IN')} BV more`
                          : '✅ Fulfilled'}
                      </p>
                    </div>

                    {/* Group 1 (Weaker Leg) */}
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Group 1 (Weaker) BV</span>
                      <p className="font-bold text-white mt-1">
                        {weakerLegBv.toLocaleString('en-IN')} / {rankInfo.nextRank.group1BvRequired.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-amber-400 mt-1">
                        {rankInfo.remainingGroup1Bv > 0
                          ? `Need ${rankInfo.remainingGroup1Bv.toLocaleString('en-IN')} BV more`
                          : '✅ Fulfilled'}
                      </p>
                    </div>

                    {/* Group 2 (Stronger Leg) */}
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Group 2 (Stronger) BV</span>
                      <p className="font-bold text-white mt-1">
                        {strongerLegBv.toLocaleString('en-IN')} / {rankInfo.nextRank.group2BvRequired.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-amber-400 mt-1">
                        {rankInfo.remainingGroup2Bv > 0
                          ? `Need ${rankInfo.remainingGroup2Bv.toLocaleString('en-IN')} BV more`
                          : '✅ Fulfilled'}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
                  <h4 className="text-base font-bold text-amber-400">
                    👑 Supreme Universal Crown Ambassador (Rank 18) Achieved!
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    You have reached the highest leadership recognition in the system! You are entitled to USA Mega Tour and Lifetime Global Royalty Pool.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigate('video-tasks')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500 text-left transition group shadow-sm flex flex-col justify-between"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
            <PlaySquare className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition">Watch Video Tasks</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Earn 25 BV & ₹20 per ad</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('binary-tree')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500 text-left transition group shadow-sm flex flex-col justify-between"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
            <GitFork className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition">Binary Tree View</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Dual-leg visual genealogy</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('wallet')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500 text-left transition group shadow-sm flex flex-col justify-between"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition">Bank Withdrawal</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Instant NEFT/IMPS payout</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('repurchase-store')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500 text-left transition group shadow-sm flex flex-col justify-between"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition">
            <Layers className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <h4 className="text-xs font-bold text-white group-hover:text-purple-400 transition">Product BV Store</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Ayurveda & High BV items</p>
          </div>
        </button>
      </div>

      {/* Unlocked Promotions & Accidental Safeguard Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Unlocked Tour Rewards */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Plane className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Fixed Tour Promotions Unlocked</h3>
            </div>
            <button
              onClick={() => onNavigate('promotions-safeguard')}
              className="text-xs text-amber-400 hover:underline"
            >
              Details
            </button>
          </div>

          <div className="space-y-2">
            {currentUser.promotionsWon && currentUser.promotionsWon.length > 0 ? (
              currentUser.promotionsWon.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-base">✈️</span>
                    <span className="font-semibold text-slate-200">{p}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    QUALIFIED
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 text-center text-xs text-slate-400">
                Reach <strong className="text-amber-400 font-semibold">Rank 4 (Gold)</strong> to unlock your first
                all-expenses-paid Domestic Holiday!
              </div>
            )}
          </div>
        </div>

        {/* Accidental Death Safeguard Scheme */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Accidental Death Safeguard Scheme</h3>
            </div>
            <button
              onClick={() => onNavigate('promotions-safeguard')}
              className="text-xs text-emerald-400 hover:underline"
            >
              Policy
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Nominee Coverage Status:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded ${
                  currentUser.safeguardEligible
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {currentUser.safeguardEligible ? 'ACTIVE BENEFIT' : 'ELIGIBLE AT RANK 7+'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Sum Assured Benefit:</span>
              <span className="text-base font-black text-emerald-400">
                ₹{currentUser.safeguardAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="pt-2 border-t border-emerald-500/20 text-[11px] text-slate-400">
              Registered Nominee: <strong className="text-slate-200">{currentUser.nomineeName}</strong> ({currentUser.nomineeRelation})
            </div>
          </div>
        </div>
      </div>
    </>
  )}
</div>
);
};
