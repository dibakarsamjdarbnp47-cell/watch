import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  LayoutDashboard,
  Award,
  GitFork,
  PlaySquare,
  Wallet,
  UserPlus,
  ShieldCheck,
  Plane,
  ShoppingBag,
  Settings,
  Sparkles,
  HelpCircle,
  TrendingUp,
  FileSpreadsheet,
  Building2,
  FileText,
  Globe,
  Users,
  UserCheck,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAi: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onOpenAi }) => {
  const { currentUser, logout } = useAuth();
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

  const primaryNavItems = [
    { id: 'account', label: 'Account (অ্যাকাউন্ট)', icon: UserCheck, badge: 'Profile' },
    { id: 'network', label: 'Network (নেটওয়ার্ক)', icon: GitFork, badge: 'Tree' },
    { id: 'all-network', label: 'All Network (অল নেটওয়ার্ক)', icon: Users, badge: 'Directory' },
  ];

  const navItems = [
    { id: 'website', label: 'Corporate Website', icon: Globe, badge: 'Public' },
    { id: 'product', label: 'PRODUCT', icon: ShoppingBag, badge: 'Shop & BP' },
    { id: 'bp-wallet', label: 'My BP Wallet', icon: Sparkles, badge: 'Bonus BP' },
    { id: 'brochure', label: '2-in-1 Business Brochure', icon: FileText, badge: 'Plan Deck' },
    { id: 'dashboard', label: 'Member Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'recognition', label: '18-Rank Recognition', icon: Award, badge: '18 Levels' },
    { id: 'video-tasks', label: 'Watch Video & AdMob', icon: PlaySquare, badge: 'Daily BV' },
    { id: 'wallet', label: 'Wallet & 10+ Incomes', icon: Wallet, badge: 'Payouts' },
    { id: 'joining-form', label: 'Online Joining Form', icon: UserPlus, badge: 'New ID' },
    { id: 'kyc', label: 'KYC Document Center', icon: ShieldCheck, badge: currentUser?.kycStatus === 'verified' ? 'Verified' : 'Pending' },
    { id: 'promotions-safeguard', label: 'Tours & Safeguard', icon: Plane, badge: '13 Tours' },
    { id: 'repurchase-store', label: 'Repurchase BV Store', icon: ShoppingBag, badge: 'BV Items' },
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0">
      <div className="p-4 space-y-6">
        {/* User Mini Profile Card */}
        {currentUser && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-800/60 border border-slate-700/80 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="relative shrink-0 text-center">
                <div className="w-10 h-13 rounded-lg overflow-hidden border-2 border-amber-400 bg-slate-950 shadow-md relative">
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
                <span className="mt-0.5 inline-block text-[7.5px] font-mono text-amber-300 font-bold leading-none">
                  35×45mm
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-bold text-white truncate">{currentUser.name}</h3>
                <p className="text-[10px] text-amber-400 font-mono font-medium">{currentUser.id}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                    {currentUser.currentRankName}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick stats in sidebar */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-700/60 text-[10px]">
              <div>
                <span className="text-slate-400">Total BV</span>
                <p className="font-bold text-slate-200">
                  {(currentUser.personalBv + currentUser.group1Bv + currentUser.group2Bv).toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Team Size</span>
                <p className="font-bold text-slate-200">
                  {currentUser.leftTeamCount + currentUser.rightTeamCount} Members
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Primary Post-Login Options: Account, Network, All Network */}
        {currentUser && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-3 mb-2 flex items-center justify-between">
              <span>Core Network & Account</span>
              <span className="text-[9px] font-normal text-slate-400">লগইন অপশন</span>
            </p>
            <nav className="space-y-1.5">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold ${
                          isActive
                            ? 'bg-slate-950/20 text-slate-950'
                            : 'bg-slate-900 text-amber-300 border border-amber-500/20'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Navigation Menu */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Main Operations
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold ${
                        isActive
                          ? 'bg-slate-950/20 text-slate-950'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Enterprise & Admin Section */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            ERP Control & AI
          </p>
          <nav className="space-y-1">
            {/* Admin Console - Restricted strictly to authorized admins */}
            {isAdmin ? (
              <button
                onClick={() => onNavigate('admin')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                  currentView === 'admin'
                    ? 'bg-red-500 text-white font-bold shadow-md shadow-red-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Settings className={`w-4 h-4 ${currentView === 'admin' ? 'text-white' : 'text-red-400'}`} />
                  <span className="truncate">Admin ERP Console</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                  MASTER
                </span>
              </button>
            ) : (
              <div className="px-3 py-2 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Private Account
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  LOCKED
                </span>
              </div>
            )}

            {/* AI Advisor Button in Nav */}
            <button
              onClick={onOpenAi}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 transition"
            >
              <div className="flex items-center space-x-3 truncate">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="truncate">AI Growth Advisor</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 font-semibold">
                Gemini
              </span>
            </button>

            {/* Prominent Log Out Option */}
            {currentUser && (
              <button
                onClick={() => {
                  logout();
                  onNavigate('website');
                }}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white font-bold text-xs transition cursor-pointer shadow-sm shadow-rose-600/20 mt-2"
                title="Log Out (লগআউট)"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Log Out / Sign Out (লগআউট)</span>
              </button>
            )}
          </nav>
        </div>

        {/* Legal & Compliance Notice Footer */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[10px] text-slate-400 space-y-1">
          <div className="flex items-center space-x-1 text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Govt. Direct Selling 2021 Compliant</span>
          </div>
          <p className="text-[9px] leading-relaxed text-slate-400">
            Mandatory PAN & 5% TDS with transparent BV roll-up. 100% Genuine product & video utility.
          </p>
        </div>
      </div>
    </aside>
  );
};
