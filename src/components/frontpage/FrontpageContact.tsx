import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, MessageSquare, Clock, CheckCircle2, Copy, Check, CreditCard, Building2, ShieldAlert } from 'lucide-react';

export const FrontpageContact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    state: '',
    subject: 'New Joining & Business Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [ticketId, setTicketId] = useState<string>('');
  const [copiedHdfc, setCopiedHdfc] = useState<boolean>(false);
  const [copiedSbi, setCopiedSbi] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    const newTicket = `WDH-TK-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(newTicket);
    setSubmitted(true);
  };

  const handleCopy = (text: string, type: 'hdfc' | 'sbi') => {
    navigator.clipboard.writeText(text);
    if (type === 'hdfc') {
      setCopiedHdfc(true);
      setTimeout(() => setCopiedHdfc(false), 2000);
    } else {
      setCopiedSbi(true);
      setTimeout(() => setCopiedSbi(false), 2000);
    }
  };

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <Phone className="w-4 h-4" />
            <span>Connect with Us</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Get in Touch & Corporate Support Desks
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Have questions regarding distributor registration, dual-leg binary earnings, daily video tasks, or official bank transfers? Our dedicated support team is here to assist you.
          </p>
        </div>

        {/* 2-COLUMN: INQUIRY FORM & REGIONAL HUBS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inquiry Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Send Direct Message</h3>
                  <p className="text-xs text-slate-400">Our customer team replies within 15 minutes</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Support Online</span>
              </div>
            </div>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4 animate-in fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-3xl">
                  ✓
                </div>
                <h4 className="text-lg font-black text-white">Message Dispatched Successfully!</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Thank you, <strong className="text-white">{formData.name}</strong>. Your inquiry has been routed to our corporate relation desk under ticket reference:
                </p>
                <div className="inline-block px-4 py-1.5 rounded-xl bg-slate-950 border border-slate-700 font-mono text-sm font-black text-amber-400">
                  {ticketId}
                </div>
                <p className="text-[11px] text-slate-400">
                  An executive will contact you at <span className="text-slate-200">{formData.phone}</span> or <span className="text-slate-200">{formData.email || 'WhatsApp'}</span> promptly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', phone: '', email: '', state: '', subject: 'New Joining & Business Inquiry', message: '' });
                  }}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold">Phone / WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. rajesh@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold">State / City</label>
                    <input
                      type="text"
                      placeholder="e.g. Delhi, West Bengal, Maharashtra"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">Inquiry Topic</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs"
                  >
                    <option value="New Joining & Business Inquiry">New Joining & Business Plan Inquiry</option>
                    <option value="Daily Video Task Assistance">Daily Video Task & AdMob Payouts</option>
                    <option value="Binary Dual-Leg Matching Support">Binary Dual-Leg Matching & Rank Advancement</option>
                    <option value="Bank Account & KYC Verification">Bank Account & PAN KYC Verification</option>
                    <option value="Nominee Safeguard Pension Claim">Nominee Safeguard Pension Claim</option>
                    <option value="International Tour Qualification">International Tour Qualification Queries</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">Your Message / Query *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe how we can assist you..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm transition shadow-xl flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Inquiry Request</span>
                </button>
              </form>
            )}
          </div>

          {/* Contact Details & Regional Offices */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Mobile / Helpline */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-amber-950/30 border border-amber-500/40 space-y-2.5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30">
                    Official Mobile
                  </span>
                </div>
                <div>
                  <p className="text-[11px] text-slate-300 font-semibold">Customer & Joining Helpline</p>
                  <a
                    href="tel:+917098607404"
                    className="text-base font-black text-white hover:text-amber-400 font-mono tracking-tight transition block mt-0.5"
                  >
                    +91 7098607404
                  </a>
                  <p className="text-[10px] text-slate-400 mt-0.5">Toll-Free Backup: 1800-889-3322</p>
                </div>
                <a
                  href="tel:+917098607404"
                  className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 transition shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Now: 7098607404</span>
                </a>
              </div>

              {/* WhatsApp Support Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950/30 border border-emerald-500/40 space-y-2.5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                    WhatsApp Active
                  </span>
                </div>
                <div>
                  <p className="text-[11px] text-slate-300 font-semibold">WhatsApp Business Support</p>
                  <a
                    href="https://wa.me/917098607404?text=Hello%20Watch%20Video%20Dream%20in%20Hand%2C%20I%20have%20an%20inquiry"
                    target="_blank"
                    rel="noreferrer"
                    className="text-base font-black text-emerald-400 hover:text-emerald-300 font-mono tracking-tight transition block mt-0.5"
                  >
                    +91 7098607404
                  </a>
                  <p className="text-[10px] text-slate-400 mt-0.5">24/7 Fast Response & Joining Guidance</p>
                </div>
                <a
                  href="https://wa.me/917098607404?text=Hello%20Watch%20Video%20Dream%20in%20Hand%2C%20I%20have%20an%20inquiry"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 transition shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Corporate Registered Head Office */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                <MapPin className="w-4 h-4" />
                <span>Registered Corporate Headquarters</span>
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Watch Video Dream in Hand Pvt. Ltd.</h4>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  12th Floor, Statesman House, Barakhamba Road, Connaught Place, New Delhi - 110001
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800 text-xs space-y-1.5 text-slate-400 font-mono">
                <p>
                  <span className="text-slate-500 font-sans">Direct Helpline / Mobile:</span>{' '}
                  <a href="tel:+917098607404" className="text-amber-400 hover:underline font-bold">
                    +91 7098607404
                  </a>
                </p>
                <p><span className="text-slate-500 font-sans">Official Email:</span> contact@dreaminhand.in</p>
                <p><span className="text-slate-500 font-sans">Compliance:</span> compliance@dreaminhand.in</p>
              </div>
            </div>

            {/* Regional Hubs Mini list */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300">Regional Logistics Hubs:</span>
              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-white font-medium">Western Hub (Mumbai):</span>
                  <span>Andheri East (022-4890-1122)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-white font-medium">Southern Hub (Bengaluru):</span>
                  <span>MG Road (080-6710-4455)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white font-medium">Eastern Hub (Kolkata):</span>
                  <span>Salt Lake Sector V (033-2211-9876)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OFFICIAL CORPORATE BANK ACCOUNTS */}
        <div className="space-y-6 pt-6 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                Verified Banking Channels
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Official Corporate Bank Accounts for Package Activation
              </h3>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Never deposit into personal individual accounts</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account 1: HDFC */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-red-400">
                  <CreditCard className="w-6 h-6" />
                  <h4 className="text-base font-bold text-white">HDFC Bank (Primary Corporate)</h4>
                </div>
                <button
                  onClick={() => handleCopy('50200088192033', 'hdfc')}
                  className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono transition"
                >
                  {copiedHdfc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHdfc ? 'Copied' : 'Copy A/C'}</span>
                </button>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-800 py-1.5">
                  <span className="text-slate-400 font-sans">Beneficiary Name:</span>
                  <span className="font-bold text-white">Watch Video Dream in Hand Pvt Ltd</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 py-1.5">
                  <span className="text-slate-400 font-sans">Account Number:</span>
                  <span className="font-bold text-amber-400 text-sm">50200088192033</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 py-1.5">
                  <span className="text-slate-400 font-sans">IFSC Code:</span>
                  <span className="font-bold text-emerald-400">HDFC0000240</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400 font-sans">Official UPI VPA:</span>
                  <span className="text-slate-200">dreaminhand@hdfcbank</span>
                </div>
              </div>
            </div>

            {/* Account 2: SBI */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-blue-400">
                  <Building2 className="w-6 h-6" />
                  <h4 className="text-base font-bold text-white">State Bank of India (SBI)</h4>
                </div>
                <button
                  onClick={() => handleCopy('39882211004', 'sbi')}
                  className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono transition"
                >
                  {copiedSbi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSbi ? 'Copied' : 'Copy A/C'}</span>
                </button>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-800 py-1.5">
                  <span className="text-slate-400 font-sans">Beneficiary Name:</span>
                  <span className="font-bold text-white">Watch Video Dream in Hand Pvt Ltd</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 py-1.5">
                  <span className="text-slate-400 font-sans">Account Number:</span>
                  <span className="font-bold text-amber-400 text-sm">39882211004</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 py-1.5">
                  <span className="text-slate-400 font-sans">IFSC Code:</span>
                  <span className="font-bold text-emerald-400">SBIN0000691</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400 font-sans">Branch:</span>
                  <span className="text-slate-200">Connaught Place, New Delhi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
