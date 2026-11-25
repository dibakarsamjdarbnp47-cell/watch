import React, { useState } from 'react';
import {
  PlaySquare,
  Sparkles,
  ShieldCheck,
  Award,
  Plane,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Calculator,
  Users,
  Wallet,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  QrCode,
  TrendingUp,
  Star,
  ExternalLink,
  ChevronRight,
  Globe,
  HeartHandshake,
  Clock,
  BadgePercent,
  Check,
  Home,
  Gamepad2,
  Video,
  Camera,
  Info,
  Menu,
  X,
  LogIn,
  UserCircle,
  GitBranch,
  Share2,
  MessageSquare,
  ShoppingBag,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext.js';
import { ProductStoreHub } from './ecommerce/ProductStoreHub';
import { FrontpageGame } from './frontpage/FrontpageGame';
import { FrontpageVideo } from './frontpage/FrontpageVideo';
import { FrontpagePhoto } from './frontpage/FrontpagePhoto';
import { FrontpageAbout } from './frontpage/FrontpageAbout';
import { FrontpageContact } from './frontpage/FrontpageContact';
import {
  DistributorLoginModal,
  DistributorAccountModal,
  BinaryNetworkModal,
  AllIndiaNetworkModal,
} from './frontpage/FrontpageModals';

interface CorporateWebsiteProps {
  onNavigateToERP: (view?: string) => void;
  onNavigateToBrochure: () => void;
  onNavigateToJoin: () => void;
  onOpenAiCoach: () => void;
}

export const CorporateWebsite: React.FC<CorporateWebsiteProps> = ({
  onNavigateToERP,
  onNavigateToBrochure,
  onNavigateToJoin,
  onOpenAiCoach,
}) => {
  const { currentUser, login } = useAuth();

  // Income Calculator States
  const [weakerLegBv, setWeakerLegBv] = useState<number>(48000);
  const [strongerLegBv, setStrongerLegBv] = useState<number>(75000);
  const [activeTab, setActiveTab] = useState<'overview' | 'plan' | 'tours' | 'products' | 'safeguard' | 'legal'>('overview');

  // Frontpage Menu Navigation State & Modals
  const [activeNav, setActiveNav] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState<boolean>(false);
  const [isAllNetworkModalOpen, setIsAllNetworkModalOpen] = useState<boolean>(false);

  const navMenuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'product', label: 'PRODUCT', icon: ShoppingBag, badge: 'Shop & BP' },
    { id: 'game', label: 'Game', icon: Gamepad2, badge: 'Play & Win' },
    { id: 'video', label: 'Video', icon: Video, badge: 'Tasks' },
    { id: 'photo', label: 'Photo', icon: Camera, badge: 'Gallery' },
    { id: 'about', label: 'About', icon: Info },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'login', label: 'Login', icon: LogIn, badge: 'Portal' },
    { id: 'account', label: 'Account', icon: UserCircle },
    { id: 'network', label: 'Network', icon: GitBranch, badge: 'Binary' },
    { id: 'all-network', label: 'All Network', icon: Share2, badge: 'Pan-India' },
  ];

  const currentNavObj = navMenuItems.find((i) => i.id === activeNav) || navMenuItems[0];
  const CurrentNavIcon = currentNavObj.icon;

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);

    if (sectionId === 'login') {
      setIsLoginModalOpen(true);
      return;
    }
    if (sectionId === 'account') {
      setIsAccountModalOpen(true);
      return;
    }
    if (sectionId === 'network') {
      setIsNetworkModalOpen(true);
      return;
    }
    if (sectionId === 'all-network') {
      setIsAllNetworkModalOpen(true);
      return;
    }

    setActiveNav(sectionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = async (id: string) => {
    if (login) {
      await login(id);
    }
    setIsLoginModalOpen(false);
    onNavigateToERP('dashboard');
  };

  // Calculator outputs
  const matchedBv = Math.min(weakerLegBv, strongerLegBv);
  const binaryMatchingIncome = matchedBv * 0.10;
  const carryForwardBv = Math.abs(strongerLegBv - weakerLegBv);

  // Determine current Rank based on BV
  const getProjectedRank = (totalBv: number, g1: number) => {
    if (g1 >= 40000000) return { rank: 18, name: 'Universal Crown Ambassador', tour: '🗽 USA Super Tour (10N/11D)', safeguard: 25000 };
    if (g1 >= 24000000) return { rank: 17, name: 'Crown Ambassador', tour: '🇬🇧 London & UK Royal Tour', safeguard: 25000 };
    if (g1 >= 14000000) return { rank: 16, name: 'Universal Crown Leader', tour: '🦘 Australia Sydney Tour', safeguard: 25000 };
    if (g1 >= 8000000) return { rank: 15, name: 'Crown Diamond', tour: '🏔️ Switzerland Alpine Tour', safeguard: 25000 };
    if (g1 >= 4800000) return { rank: 14, name: 'Blue Diamond', tour: '🇷🇺 Russia Moscow Tour', safeguard: 25000 };
    if (g1 >= 2800000) return { rank: 13, name: 'Black Diamond', tour: '🏰 Eastern Europe Explorer', safeguard: 25000 };
    if (g1 >= 1600000) return { rank: 12, name: 'Double Diamond', tour: '🐉 China Great Wall Mega Tour', safeguard: 25000 };
    if (g1 >= 800000) return { rank: 11, name: 'Diamond', tour: '🦁 Singapore Sentosa & Universal', safeguard: 25000 };
    if (g1 >= 400000) return { rank: 10, name: 'Opal', tour: '🏝️ Maldives Overwater Villa', safeguard: 10000 };
    if (g1 >= 200000) return { rank: 9, name: 'Ruby', tour: '🎡 Hong Kong & Macau Luxury Tour', safeguard: 8000 };
    if (g1 >= 100000) return { rank: 8, name: 'Emerald', tour: '🏙️ Dubai Desert Safari & Mega City', safeguard: 6000 };
    if (g1 >= 48000) return { rank: 7, name: 'Topaz', tour: '🛡️ Safeguard Pension Unlocked', safeguard: 4000 };
    if (g1 >= 24000) return { rank: 6, name: 'Coral', tour: '✈️ Thailand Pattaya (4N/5D)', safeguard: 0 };
    if (g1 >= 12000) return { rank: 5, name: 'Platinum', tour: '📱 Executive Tablet Fund', safeguard: 0 };
    if (g1 >= 6000) return { rank: 4, name: 'Gold', tour: '🌴 Goa / Manali Domestic (3N/4D)', safeguard: 0 };
    if (g1 >= 3000) return { rank: 3, name: 'Silver', tour: '🏆 Silver Trophy & Pin', safeguard: 0 };
    if (g1 >= 1200) return { rank: 2, name: 'Bronze', tour: '🥉 Bronze Certificate', safeguard: 0 };
    return { rank: 1, name: 'Associate', tour: '📦 Welcome Kit Active', safeguard: 0 };
  };

  const projectedRank = getProjectedRank(weakerLegBv + strongerLegBv, weakerLegBv);

  const handleCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 py-1.5 px-4 text-center text-xs font-bold text-slate-950 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <div className="flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>Official Govt. Direct Selling Guidelines 2021 Compliant • MCA CIN: U74999DL2021PTC389210</span>
        </div>
        <span className="hidden md:inline text-slate-950/50">•</span>
        <div className="flex items-center space-x-1.5 bg-slate-950/15 px-2 py-0.5 rounded-md">
          <Phone className="w-3 h-3 text-slate-950" />
          <span>Helpline / Mobile:</span>
          <a href="tel:+917098607404" className="font-mono font-black text-slate-950 underline hover:text-white transition">
            +91 7098607404
          </a>
        </div>
        <button
          onClick={onNavigateToBrochure}
          className="underline hover:text-white transition font-extrabold hidden sm:inline"
        >
          View Business Brochure →
        </button>
      </div>

      {/* Main Corporate Navbar */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
              <div className="w-14 h-14 rounded-full bg-white p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center overflow-hidden shrink-0 border border-amber-400/60">
                <img
                  src="/assets/aistudio/WVDH_Watch_Video_Corporate_Badge_81dfdbe6.png"
                  alt="Watch Video, Dream in Hand Direct Selling Pvt. Ltd. Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-black tracking-tight text-white font-sans">
                    Watch Video, <span className="text-amber-400">Dream in Hand</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Direct Selling Pvt. Ltd. • Dual-Leg Video AdMob & Digital Network ERP
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 sm:space-x-1.5 text-xs font-bold overflow-x-auto no-scrollbar py-1">
              {navMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl transition shrink-0 ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent hover:border-slate-700/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="whitespace-nowrap">{item.label}</span>
                    {item.badge && !isActive && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold ml-0.5">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Actions & Mobile Toggle */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Direct Helpline Call Button */}
              <a
                href="tel:+917098607404"
                className="hidden xl:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition"
                title="Direct Mobile Helpline"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono">+91 7098607404</span>
              </a>

              {/* Brochure Button */}
              <button
                onClick={onNavigateToBrochure}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold transition shadow-sm"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Brochure</span>
              </button>

              {/* ERP Portal Switcher */}
              <button
                onClick={() => onNavigateToERP('dashboard')}
                className="flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black transition shadow-lg shadow-amber-500/20"
              >
                <Building2 className="w-4 h-4" />
                <span>ERP Portal</span>
              </button>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white border border-slate-700 transition"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Collapsible Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-slate-800/80 space-y-3 animate-in fade-in slide-in-from-top-2">
              {/* Mobile Quick Call Bar */}
              <div className="flex items-center gap-2">
                <a
                  href="tel:+917098607404"
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center space-x-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call: 7098607404</span>
                </a>
                <a
                  href="https://wa.me/917098607404?text=Hello%20Watch%20Video%20Dream%20in%20Hand"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center space-x-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {navMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`flex items-center space-x-2 p-2.5 rounded-xl text-xs font-bold text-left transition ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                          : 'bg-slate-950/60 text-slate-200 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                      <div className="flex flex-col truncate">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className="text-[9px] opacity-80 font-normal truncate">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* CONDITIONAL RENDER: HOME VIEW VS INDIVIDUAL CLICKED SECTIONS */}
      {activeNav === 'home' ? (
        <>
          {/* HERO SECTION */}
          <section id="home" className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        {/* Background glow accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-indigo-500/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            {/* Top Pill */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Direct Selling MLM Business Model • 100% Zero Joining Fee</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Watch Daily Videos, Build Dual-Leg Teams, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300">
                Hold Your Dreams in Hand.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              India's first direct selling ecosystem driven by <strong>Daily Video AdMob Tasks</strong> and <strong>Dual-Leg Binary Networking</strong>. Experience 18 recognition ranks, 13 fixed international luxury tours, and up to ₹25,000/month family safeguard protection.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={onNavigateToJoin}
                className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm transition shadow-xl shadow-amber-500/20 transform hover:-translate-y-0.5"
              >
                <span>Register as Distributor</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onNavigateToBrochure}
                className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700 transition"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>View Official Business Brochure</span>
              </button>

              <button
                onClick={onOpenAiCoach}
                className="flex items-center space-x-2 px-5 py-3.5 rounded-2xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 font-bold text-sm border border-indigo-500/30 transition"
              >
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span>Ask AI Growth Advisor</span>
              </button>
            </div>
          </div>

          {/* FRONT PAGE HERO SHOWCASE: Global Marketing & Leadership Seminar */}
          <div className="mt-12 relative max-w-5xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/30 bg-slate-900 shadow-2xl shadow-amber-500/10 group">
              {/* Top Status Bar */}
              <div className="bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300 pl-2 tracking-wide">
                    ANNUAL DIRECT SELLING LEADERSHIP CONCLAVE • GLOBAL MARKETING & DUAL-LEG SYSTEM
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>NATIONWIDE CONCLAVE</span>
                  </span>
                </div>
              </div>

              {/* Photo Display */}
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-slate-950">
                <img
                  src="/global-marketing-seminar.jpg"
                  alt="Watch Video, Dream in Hand Global Marketing & Leadership Seminar"
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.rawpixel.com/image_1300/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvay0yLWt1bmctNjg4MDctbHlqMzA3OS0yLWdsb2JhbG1hcmtldGluZ18zLmpwZw.jpg";
                  }}
                />

                {/* Gradient vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/20 to-transparent pointer-events-none" />

                {/* Overlaid Information Cards */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pointer-events-auto">
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 max-w-lg shadow-2xl space-y-1.5">
                    <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold">
                      <Globe className="w-4 h-4" />
                      <span>Global Marketing Vision 2026</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                      Worldwide Network & Mega Leadership Summits
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Uniting 120,000+ independent distributors, digital video viewers, and dynamic network leaders under one unified global marketing ecosystem.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <div className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500/95 text-slate-950 font-black text-xs shadow-lg backdrop-blur-md">
                      <Award className="w-4 h-4 shrink-0" />
                      <span>1,500+ Mega Seminars Across India</span>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900/90 text-slate-200 border border-slate-700 font-bold text-xs shadow-lg backdrop-blur-md">
                      <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>28 States • Dual-Leg Expansion</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-slate-800/80">
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
              <div className="flex items-center justify-center space-x-1.5 text-amber-400 text-xs font-bold">
                <Users className="w-4 h-4" />
                <span>Distributors</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white font-mono">120,000+</p>
              <p className="text-[11px] text-slate-400">Across 28 Indian States</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
              <div className="flex items-center justify-center space-x-1.5 text-emerald-400 text-xs font-bold">
                <Wallet className="w-4 h-4" />
                <span>Total Payouts</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">₹18.4 Cr+</p>
              <p className="text-[11px] text-slate-400">5% TDS Direct Bank Deposit</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
              <div className="flex items-center justify-center space-x-1.5 text-indigo-400 text-xs font-bold">
                <Plane className="w-4 h-4" />
                <span>Tour Promotions</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono">13 Fixed</p>
              <p className="text-[11px] text-slate-400">Domestic to USA Mega Tours</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
              <div className="flex items-center justify-center space-x-1.5 text-red-400 text-xs font-bold">
                <HeartHandshake className="w-4 h-4" />
                <span>Family Safeguard</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-red-400 font-mono">₹25,000/mo</p>
              <p className="text-[11px] text-slate-400">Nominee Social Security</p>
            </div>
          </div>
        </div>
      </section>

      {/* DIGITAL VIDEO MONETIZATION ENGINE EXPLAINED */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
              The Digital Business Advantage
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Why Watch Video, Dream in Hand is India's Smartest Business
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Traditional direct selling struggles with costly mandatory purchases and high dropout rates. Our digital video monetization architecture guarantees daily engagement, zero financial burden, and solid residual income.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Core Digital Video Engine */}
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-amber-500/30 space-y-6 shadow-xl">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                  <PlaySquare className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold uppercase text-amber-400">CORE MONETIZATION ENGINE</span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">Daily Video AdMob Monetization</h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Independent distributors watch certified corporate brand advertisements (15 to 30 seconds). Each completed task rewards instant wallet cash and distributes Business Volume (BV) across your upline network.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-bold">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Zero Burden</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Earn active BV daily right from your mobile smartphone without mandatory stock purchases.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-bold">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>High Retention</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Downline team members log in every single day to complete their rewarded daily video tasks.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-indigo-400 text-xs font-bold">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Real Revenue</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Funded through Google AdMob impressions and verified brand sponsorship campaigns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE BUSINESS PLAN & INCOME CALCULATOR */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Calculator className="w-4 h-4" />
              <span>Interactive Dual-Leg Simulator</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Calculate Your Dual-Leg Income & Rank Milestone
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Adjust the Group 1 (Weaker) and Group 2 (Stronger) Business Volume sliders to simulate your binary matching earnings, rank recognition level, and international tour unlock.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sliders Box */}
            <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <span>Projected Monthly Team BV Volume</span>
              </h3>

              {/* Slider 1: Group 1 Weaker */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-emerald-400">Group 1 (Weaker Leg) BV:</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {weakerLegBv.toLocaleString('en-IN')} BV
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="1000000"
                  step="1000"
                  value={weakerLegBv}
                  onChange={(e) => setWeakerLegBv(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1,000 BV</span>
                  <span>1,00,000 BV (Emerald)</span>
                  <span>10,00,000 BV (Opal)</span>
                </div>
              </div>

              {/* Slider 2: Group 2 Stronger */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-blue-400">Group 2 (Stronger Leg) BV:</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {strongerLegBv.toLocaleString('en-IN')} BV
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="1500000"
                  step="1000"
                  value={strongerLegBv}
                  onChange={(e) => setStrongerLegBv(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1,000 BV</span>
                  <span>1,50,000 BV</span>
                  <span>15,00,000 BV</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Quick Target Presets:</span>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button
                    onClick={() => {
                      setWeakerLegBv(6000);
                      setStrongerLegBv(9000);
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200 border border-slate-700"
                  >
                    Gold (Goa Tour)
                  </button>
                  <button
                    onClick={() => {
                      setWeakerLegBv(48000);
                      setStrongerLegBv(72000);
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200 border border-slate-700"
                  >
                    Topaz (Safeguard)
                  </button>
                  <button
                    onClick={() => {
                      setWeakerLegBv(100000);
                      setStrongerLegBv(150000);
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200 border border-slate-700"
                  >
                    Emerald (Dubai)
                  </button>
                </div>
              </div>
            </div>

            {/* Calculations & Results Card */}
            <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-400">Real-Time Simulation</span>
                  <h3 className="text-xl font-black text-white">Projected Earnings & Milestones</h3>
                </div>
                <button
                  onClick={handleCelebrate}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-md"
                >
                  🎉 Celebrate!
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">10% Binary Matching</span>
                  <p className="text-2xl font-black text-amber-400 font-mono">
                    ₹{binaryMatchingIncome.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-slate-400">On {matchedBv.toLocaleString('en-IN')} Matched BV</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Carry Forward BV</span>
                  <p className="text-2xl font-black text-blue-400 font-mono">
                    {carryForwardBv.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-slate-400">100% Lifetime Carry Forward</p>
                </div>
              </div>

              {/* Achieved Rank & Tour Box */}
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Achieved Recognition Rank:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-black">
                    Rank {projectedRank.rank}: {projectedRank.name}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-700/60 text-xs">
                  <span className="text-slate-400">Unlocked Tour / Reward:</span>
                  <span className="font-bold text-amber-300">{projectedRank.tour}</span>
                </div>
                {projectedRank.safeguard > 0 && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-700/60 text-xs">
                    <span className="text-slate-400">Nominee Safeguard Pension:</span>
                    <span className="font-bold text-emerald-400">₹{projectedRank.safeguard.toLocaleString('en-IN')}/month</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-slate-400">
                  *Statutory 5% TDS applies on all payouts. 0% Admin charge.
                </p>
                <button
                  onClick={onNavigateToJoin}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition shadow-md"
                >
                  Join to Start Earning →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 13 LUXURY TOUR PROMOTIONS SHOWCASE */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
              Global Lifestyle Rewards
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              13 All-Expenses-Paid Domestic & International Tours
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              No time limits, no expiry dates. Work at your own pace and travel the world with 5-star hospitality!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { rank: 'Rank 4 (Gold)', place: 'Goa / Manali (3N/4D)', bv: '6,000 : 9,000 BV', tag: '🌴 Domestic Luxury' },
              { rank: 'Rank 6 (Coral)', place: 'Thailand Pattaya (4N/5D)', bv: '24,000 : 36,000 BV', tag: '✈️ Southeast Asia' },
              { rank: 'Rank 8 (Emerald)', place: 'Dubai Safari (4N/5D)', bv: '1,00,000 : 1,50,000 BV', tag: '🏙️ Middle East Mega' },
              { rank: 'Rank 9 (Ruby)', place: 'Hong Kong & Macau (4N/5D)', bv: '2,00,000 : 3,00,000 BV', tag: '🎡 Island Luxury' },
              { rank: 'Rank 10 (Opal)', place: 'Maldives Overwater (3N/4D)', bv: '4,00,000 : 6,00,000 BV', tag: '🏝️ Tropical Paradise' },
              { rank: 'Rank 11 (Diamond)', place: 'Singapore & Sentosa (4N/5D)', bv: '8,00,000 : 12,00,000 BV', tag: '🦁 Universal Studios' },
              { rank: 'Rank 12 (Double Diamond)', place: 'China Great Wall (5N/6D)', bv: '16,00,000 : 24,00,000 BV', tag: '🐉 Imperial Asia' },
              { rank: 'Rank 18 (Universal Crown)', place: 'USA Mega Tour (10N/11D)', bv: '4,00,00,000 : 6,00,00,000 BV', tag: '🗽 Grand Royal' },
            ].map((tour, i) => (
              <div key={i} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 hover:border-amber-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-400 uppercase font-mono">{tour.rank}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">{tour.tag}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{tour.place}</h4>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <span>Target: </span>
                  <strong className="text-slate-200">{tour.bv}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={onNavigateToBrochure}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-400 font-bold text-xs transition"
            >
              <span>View All 13 Tour Itineraries in Business Brochure</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FAMILY SAFEGUARD & SOCIAL SECURITY CHARTER */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-6 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Humanitarian Social Security</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Accidental Death Safeguard Scheme for Leader Nominees
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Every hardworking leader who achieves <strong>Rank 7 (Topaz) or above</strong> is automatically covered under our company nominee pension scheme. In case of accidental demise, the company ensures recurring monthly financial assistance to the leader’s family.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950/80 border border-emerald-500/40 text-center shrink-0 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Maximum Protection</span>
                <p className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">₹25,000</p>
                <span className="text-xs text-slate-300 font-semibold">Per Month to Nominee</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <h4 className="text-xs font-bold text-amber-400">Rank 7 (Topaz)</h4>
                <p className="text-xl font-bold text-white">₹4,000 / Month</p>
                <p className="text-[11px] text-slate-400">Direct nominee bank account transfer</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <h4 className="text-xs font-bold text-amber-400">Rank 8 (Emerald)</h4>
                <p className="text-xl font-bold text-white">₹6,000 / Month</p>
                <p className="text-[11px] text-slate-400">Direct nominee bank account transfer</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                <h4 className="text-xs font-bold text-amber-400">Rank 11+ (Diamond & Above)</h4>
                <p className="text-xl font-bold text-white">₹25,000 / Month</p>
                <p className="text-[11px] text-slate-400">Lifetime family royalty security</p>
              </div>
            </div>
          </div>
        </div>
      </section>

          {/* QUICK ACCESS PORTALS HUB ON HOME (CLICK TO VIEW / OPEN WITH SMALL SYMBOLS) */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-slate-950/80">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="text-center space-y-2 max-w-2xl mx-auto">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                  Quick Access Directory
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Portals, Games & Network Hubs
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Click on any item below to immediately view the section, test interactive features, or access distributor networks.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {navMenuItems.filter((i) => i.id !== 'home').map((item) => {
                  const Icon = item.icon;
                  const descriptions: Record<string, string> = {
                    product: 'Shop certified products displaying Price & Bonus Points (BP), cart, checkout, and order tracking.',
                    game: 'Spin the Lucky Prize Wheel and play the Direct Selling Quiz to earn wallet cash.',
                    video: 'Experience the ₹25 daily video task simulator and watch official brand presentations.',
                    photo: 'Browse high-resolution galleries of Annual Leadership Conclaves & 13 luxury tours.',
                    about: 'Review corporate background, 4 pillars of direct selling, and our Vision 2030 roadmap.',
                    contact: 'Direct inquiries, 24/7 distributor helpdesk, regional office hubs, and verified bank accounts.',
                    login: 'Quick 1-click access to the Distributor Cloud ERP portal with demo credentials.',
                    account: 'Check personal rank, binary volumes, lifetime earnings, and nominee safeguard status.',
                    network: 'View dual-leg team volume distribution, 10% matching calculations, and genealogical tree.',
                    'all-network': 'Explore 120,000+ pan-India associates spanning across 28 states with regional hubs.',
                  };

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className="group p-5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 text-left transition duration-200 flex flex-col justify-between space-y-3 shadow-lg hover:shadow-amber-500/10 hover:-translate-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/15 group-hover:bg-amber-500/25 text-amber-400 flex items-center justify-center border border-amber-500/25 transition shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition">
                              {item.label}
                            </h3>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Click to view
                            </span>
                          </div>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-semibold border border-slate-700">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {descriptions[item.id] || 'Click to view details and features.'}
                      </p>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300 transition">
                        <span>Open {item.label}</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="min-h-screen bg-slate-950">
          {/* SECTION HEADER BAR WITH SYMBOL, TITLE & RETURN TO HOME BUTTON */}
          <div className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 py-3.5 px-4 sm:px-6 lg:px-8 sticky top-[69px] z-30 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                  <CurrentNavIcon className="w-4 h-4" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 text-xs font-medium">Viewing Section:</span>
                  <span className="text-white text-sm font-black">{currentNavObj.label}</span>
                  {currentNavObj.badge && (
                    <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                      {currentNavObj.badge}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleNavClick('home')}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition border border-slate-700 shadow-sm"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Return to Home</span>
                </button>
              </div>
            </div>
          </div>

          {/* RENDER ONLY THE CLICKED SECTION */}
          {activeNav === 'product' && (
            <ProductStoreHub
              onNavigateToLogin={() => setIsLoginModalOpen(true)}
              onNavigateToDashboard={() => onNavigateToERP('bp-wallet')}
            />
          )}
          {activeNav === 'game' && <FrontpageGame onRegisterClick={onNavigateToJoin} />}
          {activeNav === 'video' && <FrontpageVideo onStartEarningClick={() => onNavigateToERP('video-tasks')} />}
          {activeNav === 'photo' && <FrontpagePhoto />}
          {activeNav === 'about' && <FrontpageAbout onBrochureClick={onNavigateToBrochure} onJoinClick={onNavigateToJoin} />}
          {activeNav === 'contact' && <FrontpageContact />}
        </div>
      )}

      {/* FOOTER */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-white p-0.5 flex items-center justify-center overflow-hidden shrink-0 shadow-md border border-amber-400/50">
                <img
                  src="/assets/aistudio/WVDH_Watch_Video_Corporate_Badge_81dfdbe6.png"
                  alt="Watch Video, Dream in Hand Direct Selling Pvt. Ltd. Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-bold text-white text-sm">
                  Watch Video, Dream in Hand Direct Selling Pvt. Ltd.
                </span>
                <p className="text-[11px] text-slate-500">
                  © {new Date().getFullYear()} All Rights Reserved. Empowering India's Direct Sellers.
                </p>
              </div>
            </div>

            {/* Frontpage Navigation Links in Footer */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold">
              {navMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className="flex items-center space-x-1.5 text-slate-400 hover:text-amber-400 transition shrink-0"
                  >
                    <Icon className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <span className="text-slate-700 hidden sm:inline">|</span>
              <button onClick={onNavigateToBrochure} className="hover:text-amber-400 transition">
                Business Brochure
              </button>
              <button onClick={() => onNavigateToERP('dashboard')} className="hover:text-amber-400 transition">
                ERP Portal
              </button>
              <button onClick={onNavigateToJoin} className="text-amber-400 hover:text-amber-300 transition">
                Join Free
              </button>
            </div>
          </div>

          {/* Quick Contact & Helpline Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Customer Support & Joining Helpline:</span>
                <div className="flex items-center flex-wrap gap-x-2">
                  <a href="tel:+917098607404" className="text-sm font-black text-amber-400 hover:underline font-mono">
                    +91 7098607404
                  </a>
                  <span className="text-slate-600 hidden sm:inline">|</span>
                  <span className="text-slate-400 font-mono text-[11px]">Toll-Free: 1800-889-3322</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="tel:+917098607404"
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center space-x-1.5 shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call: 7098607404</span>
              </a>
              <a
                href="https://wa.me/917098607404?text=Hello%20Watch%20Video%20Dream%20in%20Hand"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition flex items-center space-x-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 space-y-2 leading-relaxed">
            <p>
              <strong>Statutory Direct Selling Disclaimer:</strong> Watch Video Dream in Hand Pvt. Ltd. operates strictly under the Consumer Protection (Direct Selling) Rules, 2021 notified by the Ministry of Consumer Affairs, Government of India. There is ZERO registration fee or mandatory purchase condition to join. Earnings are strictly based on genuine product sales volume and digital ad task verification, subject to mandatory PAN card verification and statutory 5% TDS deduction.
            </p>
          </div>
        </div>
      </footer>

      {/* DISTRIBUTOR LOGIN MODAL */}
      <DistributorLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onRegisterClick={onNavigateToJoin}
      />

      {/* DISTRIBUTOR ACCOUNT MODAL */}
      <DistributorAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onNavigateToERP={(view) => {
          setIsAccountModalOpen(false);
          onNavigateToERP(view);
        }}
        currentUser={currentUser}
      />

      {/* DUAL-LEG BINARY NETWORK MODAL */}
      <BinaryNetworkModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
        onNavigateToERP={(view) => {
          setIsNetworkModalOpen(false);
          onNavigateToERP(view);
        }}
      />

      {/* ALL INDIA DISTRIBUTION NETWORK MODAL */}
      <AllIndiaNetworkModal
        isOpen={isAllNetworkModalOpen}
        onClose={() => setIsAllNetworkModalOpen(false)}
        onNavigateToERP={(view) => {
          setIsAllNetworkModalOpen(false);
          onNavigateToERP(view);
        }}
      />
    </div>
  );
};
