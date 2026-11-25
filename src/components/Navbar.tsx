import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  Bell,
  Wallet,
  ShieldCheck,
  Award,
  Sparkles,
  ChevronDown,
  LogOut,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  PlaySquare,
  ArrowUpRight,
  Building2,
  FileText,
  Users,
  GitFork,
  User,
  ShoppingBag,
} from 'lucide-react';

interface NavbarProps {
  onNavigate: (view: string) => void;
  onOpenAi: () => void;
  onOpenLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, onOpenAi, onOpenLogin }) => {
  const { currentUser, logout, notifications, unreadCount, markNotificationRead, isAdmin } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // If no user is logged in, show clean guest header with login & brochure triggers
  if (!currentUser) {
    return (
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('website')}>
              <div className="w-11 h-11 rounded-full bg-white p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center overflow-hidden shrink-0 border border-amber-400/60">
                <img
                  src="/assets/aistudio/WVDH_Watch_Video_Corporate_Badge_81dfdbe6.png"
                  alt="Watch Video, Dream in Hand Direct Selling Pvt. Ltd. Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white font-sans">
                  Watch Video, <span className="text-amber-400">Dream in Hand</span>
                </span>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Direct Selling & Dual-Leg Binary ERP • Govt. Certified
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => onNavigate('product')}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center space-x-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>PRODUCT</span>
              </button>
              <button
                onClick={() => onNavigate('website')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Website
              </button>
              <button
                onClick={() => onNavigate('brochure')}
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold"
              >
                Brochure
              </button>
              <button
                onClick={() => onOpenLogin ? onOpenLogin() : onNavigate('website')}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs shadow-md hover:brightness-110 transition flex items-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5 rotate-180" />
                <span>Member Login (লগইন)</span>
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-11 h-11 rounded-full bg-white p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center overflow-hidden shrink-0 border border-amber-400/60">
              <img
                src="/assets/aistudio/WVDH_Watch_Video_Corporate_Badge_81dfdbe6.png"
                alt="Watch Video, Dream in Hand Direct Selling Pvt. Ltd. Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white font-sans">
                  Watch Video, <span className="text-amber-400">Dream in Hand</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  MLM ERP v3.2
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Direct Selling & Dual-Leg Binary ERP • Govt. Certified
              </p>
            </div>
          </div>

          {/* Center / Right controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* 3 Core Post-Login Navigation Options: Account, Network, All Network */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => onNavigate('account')}
                className="flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-750 text-amber-300 hover:text-amber-200 transition text-xs font-bold border border-slate-700/60 shadow-sm"
                title="My Account (অ্যাকাউন্ট)"
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Account</span>
                <span className="text-[11px] font-medium text-slate-300 sm:inline">(অ্যাকাউন্ট)</span>
              </button>

              <button
                onClick={() => onNavigate('network')}
                className="flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-750 text-blue-300 hover:text-blue-200 transition text-xs font-bold border border-slate-700/60 shadow-sm"
                title="Binary Network Tree (নেটওয়ার্ক)"
              >
                <GitFork className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden md:inline">Network</span>
                <span className="text-[11px] font-medium text-slate-300 sm:inline">(নেটওয়ার্ক)</span>
              </button>

              <button
                onClick={() => onNavigate('all-network')}
                className="flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-750 text-emerald-300 hover:text-emerald-200 transition text-xs font-bold border border-slate-700/60 shadow-sm"
                title="All Network Downlines Directory (অল নেটওয়ার্ক)"
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden lg:inline">All Network</span>
                <span className="text-[11px] font-medium text-slate-300 sm:inline">(অল নেটওয়ার্ক)</span>
              </button>
            </div>

            {/* Direct Logout Option in Navbar Header */}
            <button
              onClick={() => {
                logout();
                onNavigate('website');
              }}
              className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition cursor-pointer"
              title="Log Out (লগআউট)"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
              <span className="text-[11px] font-medium">(লগআউট)</span>
            </button>

            {/* PRODUCT Store Button */}
            <button
              onClick={() => onNavigate('product')}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition text-xs font-black shadow-sm"
              title="Open PRODUCT Store & Orders"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>PRODUCT</span>
            </button>

            {/* Corporate Website & Brochure Links */}
            <button
              onClick={() => onNavigate('website')}
              className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition text-xs font-semibold shadow-sm"
              title="View Public Corporate Website"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Website</span>
            </button>

            {/* AI Advisor Button */}
            <button
              onClick={onOpenAi}
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 hover:text-white hover:border-indigo-400 transition text-xs font-medium shadow-sm"
              title="AI Growth & Legal Compliance Advisor"
            >
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>AI Coach</span>
            </button>

            {/* Wallet Balance Pill */}
            <div
              onClick={() => onNavigate('wallet')}
              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 cursor-pointer hover:border-amber-500/40 transition group"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 leading-none">Wallet</p>
                <p className="text-xs font-bold text-amber-400 group-hover:text-amber-300 transition">
                  ₹{currentUser.walletBalance.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 p-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h4 className="text-sm font-semibold text-white">Notifications & Alerts</h4>
                    <span className="text-xs text-amber-400">{notifications.length} Updates</span>
                  </div>
                  <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                            n.read
                              ? 'bg-slate-800/40 border-slate-800 text-slate-400'
                              : 'bg-amber-500/5 border-amber-500/30 text-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-semibold text-amber-400">{n.title}</span>
                            <span className="text-[10px] text-slate-500">{n.createdAt.split(' ')[0]}</span>
                          </div>
                          <p className="mt-1 text-slate-300">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Persona Switcher / User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 p-1.5 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-slate-600 transition"
              >
                <div className="w-7 h-9 rounded-md overflow-hidden border border-amber-400/80 bg-slate-950 shrink-0">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="text-left hidden md:block pr-1">
                  <div className="flex items-center space-x-1.5">
                    <p className="text-xs font-bold text-white truncate max-w-[120px]">{currentUser.name}</p>
                    {currentUser.role === 'superadmin' ? (
                      <span className="px-1.5 py-0.2 bg-red-500/20 text-red-400 text-[9px] font-bold rounded">ADMIN</span>
                    ) : (
                      <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 text-[9px] font-bold rounded">
                        {currentUser.currentRankName}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">{currentUser.id}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 p-3">
                  <div className="p-2 border-b border-slate-800 flex items-center space-x-3">
                    <div className="relative shrink-0 text-center">
                      <div className="w-11 h-14 rounded-lg overflow-hidden border-2 border-amber-400 bg-slate-950 shadow-md">
                        <img
                          src={currentUser.avatarUrl}
                          alt={currentUser.name}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <span className="mt-0.5 inline-block text-[7.5px] font-mono text-amber-300 font-bold">
                        35×45mm
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-amber-400 font-mono">{currentUser.id}</p>
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {currentUser.currentRankName}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded border ${
                            currentUser.kycStatus === 'verified'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {currentUser.kycStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Private User Account Details & Links */}
                  <div className="py-2 space-y-1">
                    <div className="px-2 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50 mb-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Account Security:</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Isolated Profile
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] mt-1">
                        <span className="text-slate-400">Private User ID:</span>
                        <span className="font-mono text-amber-300 font-bold">{currentUser.id}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onNavigate('account');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center space-x-2.5 p-2 rounded-xl text-left text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition border border-amber-500/20"
                    >
                      <User className="w-4 h-4 text-amber-400" />
                      <div>
                        <p className="font-bold">Account (অ্যাকাউন্ট)</p>
                        <p className="text-[10px] text-amber-300/80">Manage bank, KYC, nominee & profile</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('network');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center space-x-2.5 p-2 rounded-xl text-left text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 transition border border-blue-500/20"
                    >
                      <GitFork className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="font-bold">Network (নেটওয়ার্ক)</p>
                        <p className="text-[10px] text-blue-300/80">Binary tree genealogy & leg volumes</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('all-network');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center space-x-2.5 p-2 rounded-xl text-left text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition border border-emerald-500/20"
                    >
                      <Users className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="font-bold">All Network (অল নেটওয়ার্ক)</p>
                        <p className="text-[10px] text-emerald-300/80">Downlines directory with Next Page</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('dashboard');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center space-x-2.5 p-2 rounded-xl text-left text-xs hover:bg-slate-800 text-slate-200 transition"
                    >
                      <UserCheck className="w-4 h-4 text-amber-400" />
                      <div>
                        <p className="font-semibold">My Dashboard</p>
                        <p className="text-[10px] text-slate-400">Overview, earnings & BV summary</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('kyc');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center space-x-2.5 p-2 rounded-xl text-left text-xs hover:bg-slate-800 text-slate-200 transition"
                    >
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="font-semibold">KYC Verification Center</p>
                        <p className="text-[10px] text-slate-400">Aadhaar, PAN & Bank status</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('wallet');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center space-x-2.5 p-2 rounded-xl text-left text-xs hover:bg-slate-800 text-slate-200 transition"
                    >
                      <Wallet className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="font-semibold">My Wallet & Payouts</p>
                        <p className="text-[10px] text-slate-400">Bank withdrawal & statement</p>
                      </div>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          onNavigate('admin');
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center space-x-2.5 p-2 rounded-xl text-left text-xs bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-red-400" />
                        <div>
                          <p className="font-bold">Secure Admin ERP Console</p>
                          <p className="text-[10px] text-red-400/80">Manage all users, KYC & payout audit</p>
                        </div>
                      </button>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <button
                      onClick={() => {
                        onNavigate('joining-form');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold transition"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>+ Register New Member</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                        onNavigate('website');
                      }}
                      className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-semibold transition border border-rose-500/20"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out / Log Out (লগআউট)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
