import React from 'react';
import { Info, ShieldCheck, Award, Users, Target, HeartHandshake, FileCheck, CheckCircle2, ChevronRight } from 'lucide-react';

interface FrontpageAboutProps {
  onBrochureClick?: () => void;
  onJoinClick?: () => void;
}

export const FrontpageAbout: React.FC<FrontpageAboutProps> = ({ onBrochureClick, onJoinClick }) => {
  const milestones = [
    {
      year: '2021',
      title: 'Company Incorporation',
      desc: 'Incorporated under MCA Ministry of Corporate Affairs, New Delhi (CIN: U74999DL2021PTC389210) with full compliance to Consumer Protection Direct Selling Rules 2021.',
    },
    {
      year: '2023',
      title: '50,000 Distributors Milestone',
      desc: 'Launched the pioneer Dual-Engine hybrid model: combining daily sponsored video ad viewing with high-grade wellness products across Northern & Eastern India.',
    },
    {
      year: '2024',
      title: 'Fixed Luxury Tour Program & Safeguard Charter',
      desc: 'Disbursed over ₹12 Crores in direct bank payouts with 5% statutory TDS. Instituted the ₹25,000/month Nominee Family Safeguard social security charter.',
    },
    {
      year: '2026',
      title: 'AI Growth Coach & All-India Expansion',
      desc: 'Reached 120,000+ active direct sellers, integrated AI MLM growth coaching, and hosted nationwide leadership conclaves across 28 Indian states.',
    },
  ];

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-slate-900/40 relative">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <Info className="w-4 h-4" />
            <span>About Watch Video, Dream in Hand</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Pioneering India's Most Ethical & Rewarding Direct Selling Ecosystem
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            We bridge the gap between digital brand advertising and genuine direct-to-consumer entrepreneurship. Built on 100% statutory transparency, zero-fee entry, and rock-solid family security.
          </p>
        </div>

        {/* 2-COLUMN STORY & VISION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                Our Genesis & Mission
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Empowering Everyday Citizens to Build Sustainable Passive Wealth
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Traditional MLM companies in India have suffered from exorbitant initial joining kits, unrealistic sales targets, and high distributor dropout rates. <strong>Watch Video, Dream in Hand Direct Selling Pvt. Ltd.</strong> was founded with a singular mission: to democratize financial freedom.
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                By integrating a daily monetizable digital task (viewing brand promotional campaigns) with a high-BV wellness consumption ecosystem, our distributors earn income every single day—even while building their 2-leg binary organization.
              </p>
            </div>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>100% Free Registration</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Zero mandatory joining fees or compulsory purchase conditions as per Ministry guidelines.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                  <Award className="w-4 h-4 shrink-0" />
                  <span>13 Fixed Luxury Tours</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Guaranteed rank-based national and global tours from Goa to Thailand, Dubai, London & USA.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center space-x-2 text-red-400 font-bold text-xs">
                  <HeartHandshake className="w-4 h-4 shrink-0" />
                  <span>₹25k/mo Family Safeguard</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Nominee financial security providing pension-like monthly support to bereaved distributor families.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs">
                  <FileCheck className="w-4 h-4 shrink-0" />
                  <span>5% Statutory TDS Payouts</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Direct bank deposits with quarterly Form 16A certificates ensuring 100% white tax compliance.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={onBrochureClick}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-amber-500/30 transition shadow-sm flex items-center space-x-1.5"
              >
                <span>Read Full Corporate Brochure</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onJoinClick}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-lg shadow-amber-500/20"
              >
                Join Free Today
              </button>
            </div>
          </div>

          {/* Right Highlights Card */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Vision 2030 Roadmap</h4>
                <p className="text-xs text-slate-400">Direct Selling Leadership Charter</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p><strong>10 Lakh Independent Entrepreneurs:</strong> Targeting 1 million self-employed digital marketers across rural and urban India.</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p><strong>AI-Assisted Dual-Leg Balancing:</strong> Proprietary algorithms guiding distributors to optimize weaker-leg business volume.</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p><strong>Digital Media & Consumer Utility Products:</strong> Promoting verified digital ad campaigns, consumer utility services, and digital monetization solutions.</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p><strong>100% Cashless Transparency:</strong> Zero hand-to-hand cash handling; payouts dispatched through automated NEFT/IMPS channels.</p>
              </div>
            </div>

            {/* Statutory Compliance Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center text-slate-400">
                <span>MCA CIN:</span>
                <span className="text-amber-400 font-bold">U74999DL2021PTC389210</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>ISO Standards:</span>
                <span className="text-slate-200">ISO 9001:2015 QMS</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Tax Compliance:</span>
                <span className="text-emerald-400 font-bold">Section 194H (5% TDS)</span>
              </div>
            </div>
          </div>
        </div>

        {/* COMPANY MILESTONES TIMELINE */}
        <div className="space-y-6 pt-6 border-t border-slate-800">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-white">Our Journey of Continuous Excellence</h3>
            <p className="text-xs text-slate-400">Key milestones achieved since foundation in 2021</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {milestones.map((m, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 relative">
                <span className="text-2xl font-black text-amber-400 font-mono">{m.year}</span>
                <h4 className="text-sm font-bold text-white">{m.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
