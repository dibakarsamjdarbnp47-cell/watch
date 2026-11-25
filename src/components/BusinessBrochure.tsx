import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  FileText,
  Printer,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Award,
  Plane,
  PlaySquare,
  ShoppingBag,
  Building2,
  CheckCircle2,
  ArrowRight,
  Layers,
  Wallet,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  QrCode,
  Globe,
  Users,
  Languages,
  Sliders,
  UserCheck,
  Check,
  Download,
  AlertCircle,
  Clock,
  Car,
  Home,
  HeartHandshake,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BusinessBrochureProps {
  onNavigateToJoin?: () => void;
  onNavigateToDashboard?: () => void;
}

export const BusinessBrochure: React.FC<BusinessBrochureProps> = ({
  onNavigateToJoin,
  onNavigateToDashboard,
}) => {
  const { currentUser } = useAuth();

  const [viewMode, setViewMode] = useState<'slides' | 'document'>('document');
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  // Personalized Distributor Details for the Printed Stamp Box
  const [distributorName, setDistributorName] = useState<string>(
    currentUser?.name || 'Rajesh Sharma'
  );
  const [distributorId, setDistributorId] = useState<string>(
    currentUser?.id || 'WDH-100001'
  );
  const [distributorPhone, setDistributorPhone] = useState<string>(
    currentUser?.phone || '+91 70986 07404'
  );
  const [distributorRank, setDistributorRank] = useState<string>(
    currentUser?.currentRankName || 'Diamond Leader'
  );
  const [distributorCity, setDistributorCity] = useState<string>(
    'Kolkata, West Bengal'
  );

  // Section Toggles for Print Customization
  const [showSummary, setShowSummary] = useState(true);
  const [showIncomes, setShowIncomes] = useState(true);
  const [show18Ranks, setShow18Ranks] = useState(true);
  const [show13Tours, setShow13Tours] = useState(true);
  const [showSafeguard, setShowSafeguard] = useState(true);
  const [showProducts, setShowProducts] = useState(true);
  const [showBankDetails, setShowBankDetails] = useState(true);
  const [showLegalTerms, setShowLegalTerms] = useState(true);
  const [showDistributorStamp, setShowDistributorStamp] = useState(true);
  const [showCustomizer, setShowCustomizer] = useState(false);

  // Auto-sync if user logs in
  useEffect(() => {
    if (currentUser) {
      setDistributorName(currentUser.name);
      setDistributorId(currentUser.id);
      if (currentUser.phone) setDistributorPhone(currentUser.phone);
      if (currentUser.currentRankName) setDistributorRank(currentUser.currentRankName);
    }
  }, [currentUser]);

  // Complete 18 Ranks Official Matrix
  const full18Ranks = [
    { r: 1, name: 'Associate', total: '200', g1: 'Only individual', g2: '', rsa: '—', isIndividual: true, reward: lang === 'bn' ? 'আইডি অ্যাক্টিভেশন + ওয়েলকাম কিট' : 'ID Activation + Welcome Kit' },
    { r: 2, name: 'Bronze', total: '4,000', g1: '1,600', g2: '2,400', rsa: '₹7,000', reward: lang === 'bn' ? 'ব্রোঞ্জ পিন ও সার্টিফিকেট' : 'Bronze Pin & Certificate' },
    { r: 3, name: 'Silver', total: '10,000', g1: '4,000', g2: '6,000', rsa: '₹9,000', reward: lang === 'bn' ? 'সিলভার ট্রফি শিল্ড' : 'Silver Executive Trophy' },
    { r: 4, name: 'Gold', total: '20,000', g1: '8,000', g2: '12,000', rsa: '₹34,000', reward: lang === 'bn' ? '🌴 ১ম ট্যুর: গোয়া / মানালি (৩ রাত / ৪ দিন)' : '🌴 1st Tour: Goa / Manali (3N/4D Domestic)' },
    { r: 5, name: 'Platinum', total: '40,000', g1: '16,000', g2: '24,000', rsa: '₹34,000', reward: lang === 'bn' ? 'এক্সিকিউটিভ ট্যাবলেট / গ্যাজেট ফান্ড' : 'Executive Tablet / Digital Gadget Fund' },
    { r: 6, name: 'Coral', total: '60,000', g1: '24,000', g2: '36,000', rsa: '₹82,000', reward: lang === 'bn' ? '✈️ ২য় ট্যুর: থাইল্যান্ড পাতায়া (৪ রাত / ৫ দিন)' : '✈️ 2nd Tour: Thailand Pattaya (4N/5D)' },
    { r: 7, name: 'Topaz', total: '1,20,000', g1: '48,000', g2: '72,000', rsa: '₹1,18,000', reward: lang === 'bn' ? '🛡️ ₹৪,০০০/মাস নমিনি অ্যাক্সিডেন্টাল সেফগার্ড' : '🛡️ ₹4,000/mo Nominee Accidental Safeguard' },
    { r: 8, name: 'Emerald', total: '2,50,000', g1: '1,00,000', g2: '1,50,000', rsa: '₹1,32,000', reward: lang === 'bn' ? '🏙️ ৩য় ট্যুর: দুবাই ডেজার্ট সাফারি (৪ রাত / ৫ দিন) + ₹৬,০০০ সেফগার্ড' : '🏙️ 3rd Tour: Dubai Desert Safari (4N/5D) + ₹6k Safeguard' },
    { r: 9, name: 'Ruby', total: '5,00,000', g1: '2,00,000', g2: '3,00,000', rsa: '₹4,17,000', reward: lang === 'bn' ? '🎡 ৪র্থ ট্যুর: হংকং ও ম্যাকাও (৪ রাত / ৫ দিন) + ₹১০,০০০ সেফগার্ড' : '🎡 4th Tour: Hong Kong & Macau (4N/5D) + ₹10k Safeguard' },
    { r: 10, name: 'Opal', total: '10,00,000', g1: '4,00,000', g2: '6,00,000', rsa: '₹5,00,000', reward: lang === 'bn' ? '🏝️ ৫ম ট্যুর: মালদ্বীপ ওয়াটার ভিলা (৩ রাত / ৪ দিন) + ₹১৫,০০০ সেফগার্ড' : '🏝️ 5th Tour: Maldives Overwater Villa (3N/4D) + ₹15k Safeguard' },
    { r: 11, name: 'Diamond', total: '20,00,000', g1: '8,00,000', g2: '12,00,000', rsa: '₹5,00,000', reward: lang === 'bn' ? '🦁 ৬ষ্ঠ ট্যুর: সিঙ্গাপুর ও সান্তোসা (৪ রাত / ৫ দিন) + ১% রয়্যালটি + ₹২৫,০০০ সেফগার্ড' : '🦁 6th Tour: Singapore & Sentosa (4N/5D) + 1% Royalty + ₹25k Safeguard' },
    { r: 12, name: 'Double Diamond', total: '40,00,000', g1: '16,00,000', g2: '24,00,000', rsa: '₹8,50,000', reward: lang === 'bn' ? '🏯 ৭ম ট্যুর: চীন গ্রেট ওয়াল ও সাংহাই (৫ রাত / ৬ দিন) + কার ফান্ড' : '🏯 7th Tour: China Great Wall & Shanghai (5N/6D) + Car Fund' },
    { r: 13, name: 'Triple Diamond', total: '80,00,000', g1: '32,00,000', g2: '48,00,000', rsa: '₹10,00,000', reward: lang === 'bn' ? '🏰 ৮ম ট্যুর: পূর্ব ইউরোপ প্রাগ ও বুদাপেস্ট (৬ রাত / ৭ দিন)' : '🏰 8th Tour: Eastern Europe Prague/Budapest (6N/7D)' },
    { r: 14, name: 'Venus', total: '1,50,00,000', g1: '60,00,000', g2: '90,00,000', rsa: lang === 'bn' ? '₹৪০,০০০ / মাস' : '₹40,000 / month', reward: lang === 'bn' ? '🇷🇺 ৯ম ট্যুর: রাশিয়া মস্কো ও সেন্ট পিটার্সবার্গ (৬ রাত / ৭ দিন)' : '🇷🇺 9th Tour: Russia Moscow & St. Petersburg (6N/7D)' },
    { r: 15, name: 'Mercury', total: '3,00,00,000', g1: '1,20,00,000', g2: '1,80,00,000', rsa: lang === 'bn' ? '₹৫০,০০০ / মাস' : '₹50,000 / month', reward: lang === 'bn' ? '🏔️ ১০ম ট্যুর: সুইজারল্যান্ড আল্পাইন ও লেক লুসার্ন (৬ রাত / ৭ দিন)' : '🏔️ 10th Tour: Switzerland Alpine Wonderland (6N/7D)' },
    { r: 16, name: 'Crown', total: '5,00,00,000', g1: '2,00,00,000', g2: '3,00,00,000', rsa: lang === 'bn' ? '₹৬০,০০০ / মাস' : '₹60,000 / month', reward: lang === 'bn' ? '🦘 ১১তম ট্যুর: অস্ট্রেলিয়া সিডনি ও গোল্ড কোস্ট (৭ রাত / ৮ দিন) + হাউস ফান্ড' : '🦘 11th Tour: Australia Sydney & Gold Coast (7N/8D) + House Fund' },
    { r: 17, name: 'Crown Ambassador', total: '7,50,00,000', g1: '3,00,00,000', g2: '4,50,00,000', rsa: lang === 'bn' ? '₹৭০,০০০ / মাস' : '₹70,000 / month', reward: lang === 'bn' ? '🇬🇧 ১২তম ট্যুর: লন্ডন ও যুক্তরাজ্য রয়্যাল ট্যুর (৭ রাত / ৮ দিন)' : '🇬🇧 12th Tour: London & UK Royal Tour (7N/8D)' },
    { r: 18, name: 'Universal Crown Ambassador', total: '10,00,00,000', g1: '4,00,00,000', g2: '6,00,00,000', rsa: lang === 'bn' ? '₹৮০,০০০ / মাস' : '₹80,000 / month', reward: lang === 'bn' ? '🗽 ১৩তম ট্যুর: ইউএসএ সুপার ট্যুর (নিউ ইয়র্ক/অরল্যান্ডো/লাস ভেগাস ১০ রাত/১১ দিন) + ২.৫% গ্লোবাল রয়্যালটি + ₹২৫,০০০ আজীবন সেফগার্ড' : '🗽 13th Tour: USA Super Tour (10N/11D) + 2.5% Global Royalty + ₹25,000/mo Lifetime Nominee Pension' },
  ];

  // 10 Types of Incomes
  const incomesList = [
    { id: 1, title: lang === 'bn' ? 'রিটেইল মার্জিন প্রফিট' : 'Retail Margin Profit', desc: lang === 'bn' ? 'সকল কনজিউমার ও ডিজিটাল প্যাকেজে MRP-এর ওপর ১০% থেকে ৩০% পর্যন্ত সরাসরি ক্যাশ ডিসকাউন্ট।' : 'Up to 30% discount on DP vs MRP on all consumer, lifestyle & digital lines.' },
    { id: 2, title: lang === 'bn' ? 'ডেইলি ভিডিও অ্যাড ভিউ ইনকাম' : 'Daily Video Ad Utility Income', desc: lang === 'bn' ? 'প্রতিদিন ১৫-৩০ সেকেন্ডের ব্র্যান্ড ভিডিও দেখে ওয়ালেটে সরাসরি ক্যাশ ও BV আয়।' : 'Instant cash + BV credit into wallet for watching certified brand advertisements.' },
    { id: 3, title: lang === 'bn' ? 'ডাইরেক্ট স্পনসর রেফারেল বোনাস' : 'Direct Sponsor Referral Bonus', desc: lang === 'bn' ? 'আপনার ব্যক্তিগত স্পনসরে যুক্ত প্রতিটি অ্যাসোসিয়েটের ওপর ১০% সরাসরি বোনাস।' : '10% instant direct referral commission on personal sponsor activations.' },
    { id: 4, title: lang === 'bn' ? 'ডুয়াল-লেগ বাইনারি ম্যাচিং বোনাস' : 'Dual-Leg Binary Matching Bonus', desc: lang === 'bn' ? 'গ্রুপ ১ (দুর্বল লেগ) ও গ্রুপ ২ (শক্তিশালী লেগ)-এর ম্যাচিং BV-এর ওপর ১০% পে-আউট।' : '10% binary matching on matched BV of Group 1 (Weaker) & Group 2 legs.' },
    { id: 5, title: lang === 'bn' ? 'র‍্যাংক মাইলস্টোন ক্যাশ রিওয়ার্ড' : 'Rank Milestone Cash Reward', desc: lang === 'bn' ? 'প্রতিটি নতুন পদমর্যাদা অর্জনের সাথে সাথে ওয়ান-টাইম লিডারশিপ ক্যাশ বোনাস।' : 'One-time leadership bonus cash credited upon qualifying each rank level.' },
    { id: 6, title: lang === 'bn' ? '১৩টি নিশ্চিত বিশ্বভ্রমণ প্যাকেজ' : '13 Guaranteed World Tour Rewards', desc: lang === 'bn' ? 'গোয়া/মানালি থেকে থাইল্যান্ড, দুবাই, মালদ্বীপ, ইউরোপ ও আমেরিকা সম্পূর্ণ ফ্রি ট্যুর।' : 'Domestic Goa/Manali to Thailand, Dubai, Europe, and USA fully paid tours.' },
    { id: 7, title: lang === 'bn' ? 'লাক্সারি কার ফান্ড' : 'Luxury Car Fund Allowance', desc: lang === 'bn' ? 'ডাবল ডায়মন্ড ও তদূর্ধ্ব লিডারদের স্বপ্নের গাড়ি ক্রয়ের জন্য মাসিক ফান্ড।' : 'Monthly luxury car allowance for Double Diamond and above leaders.' },
    { id: 8, title: lang === 'bn' ? 'হাউস ও ড্রিম ভিলা ফান্ড' : 'Dream House & Villa Fund', desc: lang === 'bn' ? 'ক্রাউন লিডারদের জন্য স্থায়ী বিলাসবহুল বাড়ি বা ভিলার জন্য বিশেষ মাসিক বরাদ্দ।' : 'Monthly luxury house allowance for Crown and above achievers.' },
    { id: 9, title: lang === 'bn' ? 'ডায়মন্ড গ্লোবাল রয়্যালটি পুল' : 'Diamond Global Royalty Pool', desc: lang === 'bn' ? 'কোম্পানির সমগ্র ভারতের মাসিক মোট টার্নওভারের ১% থেকে ৩% সরাসরি বণ্টন।' : '1% to 3% sharing of overall company monthly turnover for Crown leaders.' },
    { id: 10, title: lang === 'bn' ? 'ফ্যামিলি অ্যাক্সিডেন্টাল সেফগার্ড পেনশন' : 'Family Accidental Safeguard Pension', desc: lang === 'bn' ? 'টোপাজ থেকে ডায়মন্ড লিডারদের অনাকাঙ্ক্ষিত মৃত্যুতে নমিনিকে ₹৪,০০০ - ₹২৫,০০০/মাস পেনশন।' : '₹4,000 to ₹25,000/month accidental death social security for nominees.' },
  ];

  // Top Products List
  const productsList = [
    { name: 'Executive Business Kit (Activation)', mrp: '₹1,200', dp: '₹900', bv: '450 BV', margin: '25% Retail Profit' },
    { name: 'Daily Nutrition & Wellness Pack (60)', mrp: '₹650', dp: '₹480', bv: '240 BV', margin: '26% Retail Profit' },
    { name: 'Personal Care & Hygiene Pack (1000ml)', mrp: '₹550', dp: '₹400', bv: '200 BV', margin: '27% Retail Profit' },
    { name: 'Essential Lifestyle & Health Care (100ml)', mrp: '₹499', dp: '₹350', bv: '180 BV', margin: '30% Retail Profit' },
    { name: 'Daily Video AdMob Engagement (Digital)', mrp: 'Free', dp: 'Free', bv: '25 BV/day', margin: 'Instant Cash + BV' },
  ];

  const handlePrint = () => {
    confetti({ particleCount: 50, spread: 60 });
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print-Only CSS Styles injection */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            font-size: 11pt !important;
          }
          nav, aside, header, footer, .no-print, button, .customizer-panel {
            display: none !important;
          }
          .printable-doc {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .page-break {
            page-break-before: always;
            break-before: page;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>

      {/* Top Banner & Control Toolbar (Hidden during Print) */}
      <div className="no-print p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-amber-400" />
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {lang === 'bn' ? 'অফিসিয়াল বিজনেস প্ল্যান ব্রোশার ও প্রিন্ট পেপার' : 'Official Business Brochure & Printable Plan'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                v3.2 2026 Edition
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'bn'
                ? 'ডাউনলাইন ও সম্ভাব্য গ্রাহকদের জন্য উচ্চমানের প্রিন্টেবল A4 ব্রোশার। আপনার নিজস্ব আইডি, নাম ও ফোন নম্বর দিয়ে কাস্টমাইজ করে প্রিন্ট বা PDF ডাউনলোড করুন।'
                : 'High-density printable A4 company brochure. Personalize with your Distributor ID, Name & Phone before printing or saving as PDF.'}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Language Toggle */}
            <div className="flex items-center bg-slate-950 border border-slate-750 rounded-xl p-1 shrink-0">
              <button
                onClick={() => setLang('bn')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                  lang === 'bn' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>বাংলা</span>
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                  lang === 'en' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>English</span>
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950 border border-slate-750 rounded-xl p-1 shrink-0">
              <button
                onClick={() => setViewMode('document')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === 'document' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'প্রিন্টেবল ব্রোশার (A4)' : 'Printable (A4)'}</span>
              </button>
              <button
                onClick={() => setViewMode('slides')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === 'slides' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'স্লাইড প্রেজেন্টেশন' : 'Slides Deck'}</span>
              </button>
            </div>

            {/* Customizer Drawer Toggle */}
            <button
              onClick={() => setShowCustomizer(!showCustomizer)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                showCustomizer
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'ব্রোশার এডিট ও সেটিংস' : 'Edit & Customize'}</span>
            </button>

            {/* Print / PDF Button */}
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'bn' ? 'প্রিন্ট / PDF ডাউনলোড' : 'Print / Download PDF'}</span>
            </button>
          </div>
        </div>

        {/* Live Distributor Personalization & Content Switcher Panel */}
        {showCustomizer && (
          <div className="customizer-panel p-5 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <UserCheck className="w-4 h-4" />
                <span>{lang === 'bn' ? 'প্রস্তুতকারক ও রেফারার ডিস্ট্রিবিউটর সিল সেটিংস' : 'Distributor Referral Stamp & Content Controls'}</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {lang === 'bn' ? 'তথ্য পরিবর্তন করলে ব্রোশারে তাৎক্ষণিক আপডেট হবে' : 'Changes apply live to the brochure'}
              </span>
            </div>

            {/* Input Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 font-bold block mb-1">
                  {lang === 'bn' ? 'আপনার নাম:' : 'Distributor Name:'}
                </label>
                <input
                  type="text"
                  value={distributorName}
                  onChange={(e) => setDistributorName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-bold block mb-1">
                  {lang === 'bn' ? 'মেম্বার / ইউজার আইডি:' : 'Distributor ID:'}
                </label>
                <input
                  type="text"
                  value={distributorId}
                  onChange={(e) => setDistributorId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-bold block mb-1">
                  {lang === 'bn' ? 'মোবাইল / হোয়াটসঅ্যাপ:' : 'Mobile / WhatsApp:'}
                </label>
                <input
                  type="text"
                  value={distributorPhone}
                  onChange={(e) => setDistributorPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-bold block mb-1">
                  {lang === 'bn' ? 'বর্তমান পদমর্যাদা (র‍্যাংক):' : 'Current Rank:'}
                </label>
                <input
                  type="text"
                  value={distributorRank}
                  onChange={(e) => setDistributorRank(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-bold block mb-1">
                  {lang === 'bn' ? 'ব্রাঞ্চ / জেলা / রাজ্য:' : 'District / State:'}
                </label>
                <input
                  type="text"
                  value={distributorCity}
                  onChange={(e) => setDistributorCity(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Section Visibility Checkboxes */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                {lang === 'bn' ? 'প্রিন্টে অন্তর্ভুক্ত করার সেকশন নির্বাচন করুন:' : 'Choose Sections to Include in Printout:'}
              </span>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSummary}
                    onChange={(e) => setShowSummary(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span>{lang === 'bn' ? 'কোম্পানি পরিচিতি ও ভিশন' : 'Executive Concept'}</span>
                </label>

                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showIncomes}
                    onChange={(e) => setShowIncomes(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span>{lang === 'bn' ? '১০ প্রকার আয়' : '10 Types of Income'}</span>
                </label>

                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={show18Ranks}
                    onChange={(e) => setShow18Ranks(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span>{lang === 'bn' ? '১৮টি পূর্ণাঙ্গ র‍্যাংক টেবিল' : 'All 18 Ranks Table'}</span>
                </label>

                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showProducts}
                    onChange={(e) => setShowProducts(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span>{lang === 'bn' ? 'কনজিউমার পণ্য ও BV মূল্যতালিকা' : 'Products & BV List'}</span>
                </label>

                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBankDetails}
                    onChange={(e) => setShowBankDetails(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span>{lang === 'bn' ? 'অফিসিয়াল ব্যাংক অ্যাকাউন্ট' : 'Bank Accounts'}</span>
                </label>

                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showDistributorStamp}
                    onChange={(e) => setShowDistributorStamp(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span>{lang === 'bn' ? 'রেফারার সিল বক্স' : 'Distributor Stamp'}</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main View Mode Selector: Either Interactive Slides or High-Density Document */}
      {viewMode === 'slides' ? (
        /* Interactive Slides Deck */
        <div className="space-y-4 no-print">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 min-h-[480px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  Slide {currentSlide + 1} of 3
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {currentSlide === 0 && (lang === 'bn' ? 'কোম্পানি ভিশন ও ডুয়াল-ইঞ্জিন সিস্টেম' : 'Company Vision & Dual-Engine System')}
                  {currentSlide === 1 && (lang === 'bn' ? '১০ প্রকার আকর্ষণীয় ইনকাম ও লাভ' : '10 Lucrative Incomes & Compensation')}
                  {currentSlide === 2 && (lang === 'bn' ? '১৮টি ক্যারিয়ার র‍্যাংক ও গ্যারান্টিড বিশ্বভ্রমণ' : '18-Rank Career Matrix & Guaranteed World Tours')}
                </h2>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
                  disabled={currentSlide === 0}
                  className="p-2 rounded-xl bg-slate-800 text-white disabled:opacity-30 border border-slate-700"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentSlide((p) => Math.min(2, p + 1))}
                  disabled={currentSlide === 2}
                  className="p-2 rounded-xl bg-slate-800 text-white disabled:opacity-30 border border-slate-700"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Slide Body */}
            <div>
              {currentSlide === 0 && (
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-white p-1 flex items-center justify-center shrink-0 shadow-xl overflow-hidden border-2 border-amber-400/60">
                      <img
                        src="/assets/aistudio/WVDH_Watch_Video_Corporate_Badge_81dfdbe6.png"
                        alt="Watch Video, Dream in Hand Direct Selling Pvt. Ltd. Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white">
                        Watch Video, <span className="text-amber-400">Dream in Hand</span> Pvt. Ltd.
                      </h3>
                      <p className="text-sm font-semibold text-amber-300 mt-1">
                        {lang === 'bn'
                          ? 'ভারতের ১ম ডুয়াল-ইঞ্জিন ডিরেক্ট সেলিং: ডিজিটাল ভিডিও অ্যাড + কনজিউমার প্রোডাক্টস রি-পারচেজ'
                          : "India's 1st Dual-Engine Business Model: Digital Video Ad Utility + Consumer Products Repurchase"}
                      </p>
                      <p className="text-xs text-slate-300 mt-2">
                        {lang === 'bn'
                          ? 'MCA CIN: U74999DL2021PTC389210 • ISO 9001:2020 সার্টিফায়েড • ডিরেক্ট সেলিং রুলস ২০২১ সম্পূর্ণ অনুসারী • ১০০% ফ্রি জয়েনিং'
                          : 'MCA CIN: U74999DL2021PTC389210 • ISO 9001:2020 Certified • Direct Selling Rules 2021 Compliant • 100% Zero Joining Fee'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-2">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase">Engine 01</span>
                      <h4 className="text-base font-bold text-white">
                        {lang === 'bn' ? 'ডেইলি ভিডিও অ্যাড ভিউ ইউটিলিটি' : 'Daily Video AdMob Utility'}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {lang === 'bn'
                          ? 'প্রতিদিন সার্টিফায়েড ব্র্যান্ডের ১৫-৩০ সেকেন্ডের ভিডিও বিজ্ঞাপন দেখে মেম্বাররা তাৎক্ষণিক ক্যাশ ও BV আয় করেন।'
                          : 'Watch certified brand advertisement videos (15-30 seconds). Earn instant Business Volume (BV) + Direct Wallet Cash.'}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2">
                      <span className="text-[10px] font-bold text-amber-400 uppercase">Engine 02</span>
                      <h4 className="text-base font-bold text-white">
                        {lang === 'bn' ? 'হাই-BV কনজিউমার প্রোডাক্টস রি-পারচেজ' : 'High-BV Consumer Products Repurchase'}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {lang === 'bn'
                          ? '১০-৩০% রিটেইল লাভ এবং বিশাল BV পয়েন্ট সমৃদ্ধ ১০০% জেনুইন কনজিউমার ইউটিলিটি, পার্সোনাল কেয়ার ও ডিজিটাল প্যাকেজ।'
                          : 'Up to 30% Retail Margin on verified consumer utility, personal care and digital packages with recurring monthly BV.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentSlide === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {incomesList.map((inc) => (
                    <div key={inc.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-mono font-bold text-amber-400">INCOME #{inc.id}</span>
                      <h4 className="text-sm font-bold text-white">{inc.title}</h4>
                      <p className="text-xs text-slate-400">{inc.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {currentSlide === 2 && (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="py-2 px-3">Rank</th>
                          <th className="py-2 px-3">Title</th>
                          <th className="py-2 px-3">Total BV</th>
                          <th className="py-2 px-3">G1 (40%)</th>
                          <th className="py-2 px-3">G2 (60%)</th>
                          <th className="py-2 px-3">RSA Compensation</th>
                          <th className="py-2 px-3">Reward / Tour</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-[11px] font-mono">
                        {full18Ranks.map((r) => (
                          <tr key={r.r}>
                            <td className="py-2 px-3 font-bold text-amber-400">R-{r.r}</td>
                            <td className="py-2 px-3 font-bold text-white font-sans">{r.name}</td>
                            <td className="py-2 px-3">{r.total}</td>
                            {r.isIndividual ? (
                              <td colSpan={2} className="py-2 px-3 text-center text-slate-300 font-sans italic">
                                Only individual
                              </td>
                            ) : (
                              <>
                                <td className="py-2 px-3 text-emerald-400">{r.g1}</td>
                                <td className="py-2 px-3 text-blue-400">{r.g2}</td>
                              </>
                            )}
                            <td className="py-2 px-3 text-purple-300 font-semibold">{r.rsa}</td>
                            <td className="py-2 px-3 text-amber-300 font-sans">{r.reward}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* High-Density Official Printable Brochure Document (A4 Print Optimized) */
        <div className="printable-doc p-6 sm:p-10 rounded-3xl bg-white text-slate-950 shadow-2xl space-y-6 font-sans border-2 border-amber-500/40">
          {/* Top Document Header */}
          <div className="border-b-2 border-amber-500 pb-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-20 h-20 rounded-full bg-white p-0.5 flex items-center justify-center shadow-md shrink-0 border border-amber-300 overflow-hidden">
                  <img
                    src="/assets/aistudio/WVDH_Watch_Video_Corporate_Badge_81dfdbe6.png"
                    alt="Watch Video, Dream in Hand Direct Selling Pvt. Ltd. Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 leading-tight">
                    WATCH VIDEO, DREAM IN HAND PVT. LTD.
                  </h2>
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                    {lang === 'bn'
                      ? 'ভারতের প্রথম ডুয়াল-লেগ ডিজিটাল ভিডিও অ্যাড ও কনজিউমার ডিরেক্ট সেলিং'
                      : "India's Premier Dual-Leg Video AdMob & Digital Direct Selling Network"}
                  </p>
                  <p className="text-[10.5px] text-slate-600 mt-0.5">
                    MCA CIN: U74999DL2021PTC389210 • ISO 9001:2020 Certified • Direct Selling Rules 2021 Compliant
                  </p>
                  <div className="mt-1.5 inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-extrabold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{lang === 'bn' ? '১০০% বিনামূল্যে জয়েনিং (100% Zero Joining Fee)' : '100% Zero Joining Fee'}</span>
                  </div>
                </div>
              </div>

              {/* Official Meta Box */}
              <div className="text-left sm:text-right text-[11px] text-slate-600 border-l-2 sm:border-l-2 sm:border-slate-300 pl-3">
                <p className="font-bold text-slate-900 uppercase">
                  {lang === 'bn' ? 'অফিসিয়াল বিজনেস প্রস্পেক্টাস' : 'Official Business Prospectus'}
                </p>
                <p className="font-mono">Ref: WDH/PROSP/2026-v3</p>
                <p>Helpline: +91 7098607404</p>
                <p>Toll-Free: 1800-889-3322</p>
              </div>
            </div>
          </div>

          {/* Personalized Distributor Referral Stamp Box (If Enabled) */}
          {showDistributorStamp && (
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border-2 border-dashed border-amber-400 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9.5px] font-bold text-amber-800 uppercase tracking-wider block">
                    {lang === 'bn' ? 'প্রস্তুতকারক ও রেফারার ডিস্ট্রিবিউটর পরিচিতি:' : 'Presented By Authorized Distributor:'}
                  </span>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    <span className="font-black text-slate-900 text-sm">{distributorName}</span>
                    <span className="px-2 py-0.2 rounded bg-amber-200/70 text-slate-900 font-mono font-bold text-[10px]">
                      ID: {distributorId}
                    </span>
                    <span className="font-semibold text-emerald-800 text-[11px]">
                      {distributorRank}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600">
                    Contact: <strong className="text-slate-900">{distributorPhone}</strong> • Location: <strong>{distributorCity}</strong>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block px-3 py-1 rounded-lg bg-slate-900 text-amber-400 font-black text-[10px]">
                  {lang === 'bn' ? 'রেফারেল কোড: ' + distributorId : 'REFERRAL ID: ' + distributorId}
                </span>
              </div>
            </div>
          )}

          {/* Section 1: Executive Concept & Dual-Engine Architecture */}
          {showSummary && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-800 border-b border-slate-300 pb-1 flex items-center justify-between">
                <span>{lang === 'bn' ? '১. বিজনেস কনসেপ্ট ও ডুয়াল-ইঞ্জিন আর্কিটেকচার' : '1. Business Concept & Dual-Engine Architecture'}</span>
                <span className="text-[10px] text-slate-500 font-normal">Dual-Leg (G1 40% : G2 60%)</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed text-justify">
                {lang === 'bn'
                  ? 'ওয়াচ ভিডিও ড্রিম ইন হ্যান্ড প্রাইভেট লিমিটেড ভারতের প্রথম ডিরেক্ট সেলিং প্রতিষ্ঠান যা ডিজিটাল বিজ্ঞাপন আয়ের সাথে কনজিউমার ও লাইফস্টাইল পণ্য বিক্রয়কে একত্রিত করেছে। অ্যাসোসিয়েটরা দৈনিক ১৫-৩০ সেকেন্ডের ব্র্যান্ডের ভিডিও দেখে তাত্ক্ষণিক BV ও ওয়ালেট ক্যাশ অর্জন করতে পারেন, পাশাপাশি প্রিমিয়াম কনজিউমার পণ্য ক্রয়-বিক্রয়ে ১০% থেকে ৩০% রিটেইল লাভ এবং বাইনারি ম্যাচিংয়ে ১০% নিয়মিত পে-আউট পান।'
                  : 'Watch Video, Dream in Hand Pvt. Ltd. is India’s pioneering dual-engine network. Associates generate Business Volume (BV) via daily 15-30 second digital video ad views and consumer product repurchases. Dual-leg (Group 1 Weaker / Group 2 Stronger) matching bonuses pay out at a lucrative 10% rate on matched BV with 100% carry forward.'}
              </p>
            </div>
          )}

          {/* Section 2: 10 Types of Lucrative Incomes */}
          {showIncomes && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-800 border-b border-slate-300 pb-1">
                {lang === 'bn' ? '২. ১০ প্রকারের নিশ্চিত ও বৈচিত্র্যময় আয়' : '2. 10 Types of Lucrative & Sustainable Incomes'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
                {incomesList.map((inc) => (
                  <div key={inc.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="text-[9.5px] font-mono font-bold text-amber-700 block">
                      #{inc.id} {inc.title}
                    </span>
                    <p className="text-[10.5px] text-slate-600 leading-tight">{inc.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Complete 18 Recognition Ranks Matrix (Page Break Friendly) */}
          {show18Ranks && (
            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-800 border-b border-slate-300 pb-1 flex items-center justify-between">
                <span>{lang === 'bn' ? '৩. ১৮টি অফিসিয়াল ক্যারিয়ার র‍্যাংক ও গ্যারান্টিড রিওয়ার্ড ম্যাট্রিক্স' : '3. Complete 18-Rank Career Matrix & Guaranteed Tour Rewards'}</span>
                <span className="text-[10px] text-emerald-700 font-bold">100% Lifetime Accumulative BV</span>
              </h3>
              <div className="overflow-x-auto border border-slate-300 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold text-[9.5px] uppercase">
                    <tr>
                      <th className="py-1.5 px-2">Rank</th>
                      <th className="py-1.5 px-2">{lang === 'bn' ? 'পদমর্যাদা' : 'Title'}</th>
                      <th className="py-1.5 px-2">{lang === 'bn' ? 'মোট BV' : 'Total BV'}</th>
                      <th className="py-1.5 px-2">{lang === 'bn' ? 'গ্রুপ ১ (৪০%)' : 'Weaker G1 (40%)'}</th>
                      <th className="py-1.5 px-2">{lang === 'bn' ? 'গ্রুপ ২ (৬০%)' : 'Stronger G2 (60%)'}</th>
                      <th className="py-1.5 px-2">{lang === 'bn' ? 'RSA কম্পেনসেশন' : 'RSA Compensation'}</th>
                      <th className="py-1.5 px-2">{lang === 'bn' ? 'নিশ্চিত রিওয়ার্ড ও বিদেশ ভ্রমণ' : 'Guaranteed Tour & Promotions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[10.5px]">
                    {full18Ranks.map((r) => (
                      <tr key={r.r} className={r.r % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'}>
                        <td className="py-1 px-2 font-bold text-amber-800 whitespace-nowrap">R-{r.r}</td>
                        <td className="py-1 px-2 font-bold text-slate-900 whitespace-nowrap">{r.name}</td>
                        <td className="py-1 px-2 font-mono whitespace-nowrap">{r.total}</td>
                        {r.isIndividual ? (
                          <td colSpan={2} className="py-1 px-2 text-center font-semibold text-slate-700 italic bg-amber-50/50">
                            {lang === 'bn' ? 'শুধুমাত্র ব্যক্তিগত (Only individual)' : 'Only individual'}
                          </td>
                        ) : (
                          <>
                            <td className="py-1 px-2 font-mono text-emerald-800 font-semibold whitespace-nowrap">{r.g1}</td>
                            <td className="py-1 px-2 font-mono text-blue-800 font-semibold whitespace-nowrap">{r.g2}</td>
                          </>
                        )}
                        <td className="py-1 px-2 font-mono font-bold text-purple-800 whitespace-nowrap">{r.rsa}</td>
                        <td className="py-1 px-2 text-slate-800 font-medium">{r.reward}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 4: Top Consumer Products & Repurchase BV */}
          {showProducts && (
            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-800 border-b border-slate-300 pb-1 flex items-center justify-between">
                <span>{lang === 'bn' ? '৪. প্রিমিয়াম কনজিউমার ও ডিজিটাল প্রোডাক্ট পোর্টফোলিও' : '4. Premium Consumer & Digital Ad Products Portfolio'}</span>
                <span className="text-[10px] text-slate-500">ISO & Direct Selling Certified</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                {productsList.map((p, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <p className="font-bold text-slate-900 text-[11px] truncate">{p.name}</p>
                    <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                      <span>MRP: {p.mrp}</span>
                      <span className="font-bold text-slate-900">DP: {p.dp}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-[10px]">
                      <span className="font-bold text-emerald-700 font-mono">{p.bv}</span>
                      <span className="text-amber-800 font-semibold">{p.margin}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Banking, Accidental Safeguard & Statutory TDS Rules */}
          {showBankDetails && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-300 text-xs">
              {/* Bank Details */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>{lang === 'bn' ? 'অফিসিয়াল কোম্পানি ব্যাংক অ্যাকাউন্ট' : 'Official Corporate Bank Accounts'}</span>
                </h4>
                <div className="space-y-0.5 text-[10.5px] font-mono text-slate-700">
                  <p><strong>A/C Name:</strong> WATCH VIDEO DREAM IN HAND PVT LTD</p>
                  <p><strong>HDFC Bank:</strong> A/C 50200088991122 • <strong>IFSC:</strong> HDFC0001234</p>
                  <p><strong>SBI Bank:</strong> A/C 39882211004 • <strong>IFSC:</strong> SBIN0000691</p>
                  <p><strong>UPI VPA:</strong> dreaminhand@hdfcbank</p>
                </div>
              </div>

              {/* Statutory Legal & TDS */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <h4 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{lang === 'bn' ? 'আইনি বৈধতা ও সরকারি নিয়মাবলী' : 'Statutory Compliance & Legal Charter'}</span>
                </h4>
                <ul className="space-y-0.5 text-[10.5px] text-slate-700">
                  <li>✓ <strong>100% Free Joining:</strong> {lang === 'bn' ? 'বিনামূল্যে আইডি রেজিস্ট্রেশন।' : 'Zero mandatory registration fees.'}</li>
                  <li>✓ <strong>5% TDS:</strong> {lang === 'bn' ? 'Section 194H অনুযায়ী প্যান কার্ডের মাধ্যমে ৫% টিডিএস কর্তন।' : 'Section 194H 5% TDS deducted with valid PAN.'}</li>
                  <li>✓ <strong>Nominee Safeguard:</strong> {lang === 'bn' ? 'অনাকাঙ্ক্ষিত দুর্ঘটনায় নমিনিকে ₹৪,০০০ - ₹২৫,০০০/মাস অনুদান।' : 'Nominee pension for Topaz and above leaders.'}</li>
                  <li>✓ <strong>30-Day Money Back:</strong> {lang === 'bn' ? 'পণ্যে সন্তুষ্ট না হলে ৩০ দিনের মানিব্যাক গ্যারান্টি।' : '30-day product refund & cooling-off policy.'}</li>
                </ul>
              </div>
            </div>
          )}

          {/* Footer Signature & Seal Block */}
          <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[10.5px] text-slate-600">
            <div>
              <p className="font-bold text-slate-900">WATCH VIDEO, DREAM IN HAND PVT. LTD.</p>
              <p>Corporate HQ: Barakhamba Road, Connaught Place, New Delhi - 110001</p>
              <p>Support Helpline: +91 7098607404 • Email: support@dreaminhand.in</p>
            </div>

            <div className="flex items-center space-x-8">
              <div className="text-center">
                <div className="h-8 border-b border-slate-400 w-28 mb-1 mx-auto" />
                <p className="font-semibold text-slate-700">{lang === 'bn' ? 'আবেদনকারীর স্বাক্ষর' : 'Applicant Signature'}</p>
              </div>
              <div className="text-center">
                <div className="h-8 border-b border-slate-400 w-32 mb-1 mx-auto" />
                <p className="font-bold text-slate-900">{lang === 'bn' ? 'অথরাইজড সিল ও সিগনেচার' : 'Authorized Signatory / Seal'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
