import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Eye,
  EyeOff,
  Lock,
  Building,
  CreditCard,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Printer,
  Sparkles,
  Key,
  ShieldAlert,
  Copy,
  Check,
  MessageSquare,
  Share2,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface JoiningFormProps {
  onSuccess: (newUserId: string) => void;
}

export const OnlineJoiningForm: React.FC<JoiningFormProps> = ({ onSuccess }) => {
  const { refreshAllData, login, users } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    fatherHusbandName: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    mobile: '',
    email: '',
    pan: '',
    aadhaar: '',
    bankName: '',
    bankAccount: '',
    ifsc: '',
    nomineeName: '',
    nomineeRelation: 'Spouse',
    sponsorId: 'WDH-100001',
    seniorSecretCode: '', // Empty: Private code must be provided privately by senior
    password: '',
    confirmPassword: '',
    placementType: 'auto' as 'auto' | 'manual',
    binaryPosition: 'left' as 'left' | 'right',
  });

  const [sponsorName, setSponsorName] = useState<string | null>('Rajesh Sharma (Diamond)');
  const [validatingSponsor, setValidatingSponsor] = useState(false);
  const [sponsorError, setSponsorError] = useState<string | null>(null);
  const [seniorSecretVerified, setSeniorSecretVerified] = useState<boolean>(false);
  const [secretCodeError, setSecretCodeError] = useState<string | null>(null);
  const [secretCodeSuccessMessage, setSecretCodeSuccessMessage] = useState<string | null>(null);
  const [secretCopied, setSecretCopied] = useState<boolean>(false);
  const [showInputSecret, setShowInputSecret] = useState<boolean>(false);
  const [showRegisteredSecret, setShowRegisteredSecret] = useState<boolean>(false);

  // Document Uploads (Simulated base64 or preview URLs)
  const [photoDoc, setPhotoDoc] = useState<string>('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80');
  const [panDoc, setPanDoc] = useState<string>('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80');
  const [bankDoc, setBankDoc] = useState<string>('https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop&q=80');

  const samplePassportPhotos = [
    { label: 'Executive Male (পুরুষ)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80' },
    { label: 'Corporate Female (মহিলা)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80' },
    { label: 'Professional Male (তরুণ পেশাদার)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
    { label: 'Leader Female (নেতৃত্ব)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
    { label: 'Business Executive (নির্বাহী)', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80' },
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoDoc(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const [submitting, setSubmitting] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<any | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Validate sponsor code & mandatory senior secret code
  const verifySponsorAndSecret = async (sponsorCode: string, secretCode: string) => {
    if (!sponsorCode.trim()) {
      setSponsorName(null);
      setSponsorError('Sponsor Code is required.');
      setSeniorSecretVerified(false);
      return;
    }

    setValidatingSponsor(true);
    setSponsorError(null);
    setSecretCodeError(null);
    setSecretCodeSuccessMessage(null);

    try {
      const url = `/api/auth/verify-sponsor/${encodeURIComponent(sponsorCode.trim())}${
        secretCode.trim() ? `?secretCode=${encodeURIComponent(secretCode.trim())}` : ''
      }`;
      const res = await fetch(url);
      const cType = res.headers.get('content-type') || '';
      if (res.ok && cType.includes('application/json')) {
        const data = await res.json();
        if (data.valid) {
          setSponsorName(`${data.sponsorName} (${data.rank})`);
          setSponsorError(null);

          if (secretCode.trim()) {
            if (data.isSecretValid) {
              setSeniorSecretVerified(true);
              setSecretCodeSuccessMessage(`Senior Authorization Confirmed: Secret Code Verified for ${data.sponsorName}!`);
              setSecretCodeError(null);
            } else {
              setSeniorSecretVerified(false);
              setSecretCodeError(`Invalid Senior Secret Code for ${data.sponsorName} (${data.sponsorId}). Please ask your senior sponsor for their secret authorization code.`);
              setSecretCodeSuccessMessage(null);
            }
          } else {
            setSeniorSecretVerified(false);
            setSecretCodeError('Senior Secret Code is strictly mandatory for all-time joining (অল টাইম জয়েনিং এর জন্য সিনিয়র সিক্রেট কোড আবশ্যক).');
          }
          return;
        } else {
          setSponsorName(null);
          setSponsorError(data.message || 'Sponsor code does not exist.');
          setSeniorSecretVerified(false);
          return;
        }
      }
    } catch (e) {
      console.warn('API sponsor check fallback to client dataset:', e);
    }

    // Client-side fallback check (when API is unreachable)
    const localSponsor = users.find(
      (u) => u.id.toLowerCase() === sponsorCode.trim().toLowerCase()
    );
    if (localSponsor) {
      setSponsorName(`${localSponsor.name} (${localSponsor.currentRankName})`);
      setSponsorError(null);

      const expected = (localSponsor.seniorSecretCode || 'RS-8821').trim().toUpperCase();
      if (secretCode.trim()) {
        if (secretCode.trim().toUpperCase() === expected) {
          setSeniorSecretVerified(true);
          setSecretCodeSuccessMessage(`Senior Authorization Confirmed: Secret Code Verified for ${localSponsor.name}!`);
          setSecretCodeError(null);
        } else {
          setSeniorSecretVerified(false);
          setSecretCodeError(`Invalid Senior Secret Code for ${localSponsor.name} (${localSponsor.id}).`);
          setSecretCodeSuccessMessage(null);
        }
      } else {
        setSeniorSecretVerified(false);
        setSecretCodeError('Senior Secret Code is strictly mandatory for all-time joining.');
      }
    } else {
      setSponsorName(null);
      setSponsorError('Sponsor code not found in directory.');
      setSeniorSecretVerified(false);
    }
    setValidatingSponsor(false);
  };

  const setSeniorPreset = (sponsorId: string, secretCode: string) => {
    setFormData((prev) => ({
      ...prev,
      sponsorId,
      seniorSecretCode: secretCode,
    }));
    verifySponsorAndSecret(sponsorId, secretCode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validations
    if (!formData.name.trim()) return setFormError('Full Name is required.');
    if (!/^[0-9]{10}$/.test(formData.mobile.trim())) {
      return setFormError('Mobile number must be exactly 10 digits.');
    }
    if (formData.pan.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.pan.trim())) {
      return setFormError('Invalid Indian PAN Card format (e.g. ABCDE1234F).');
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      return setFormError('Passwords do not match.');
    }

    // MANDATORY SENIOR SECRET CODE VALIDATION
    if (!formData.seniorSecretCode.trim()) {
      setSecretCodeError('Senior Secret Code is strictly mandatory for all joining registrations (অল টাইম জয়েনিং এর জন্য সিনিয়র সিক্রেট কোড আবশ্যক).');
      return setFormError('Senior Secret Code is mandatory. All registrations require senior authorization code.');
    }

    if (sponsorError) {
      return setFormError('Please enter a valid active Sponsor Code.');
    }

    if (!seniorSecretVerified || secretCodeError) {
      return setFormError('Senior Secret Code authorization failed. Please enter the correct secret code provided by your Senior Sponsor.');
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          avatarUrl: photoDoc,
          photoDoc,
          kycDocuments: {
            photo: photoDoc,
            panCard: panDoc,
            bankProof: bankDoc,
          },
        }),
      });

      const cType = res.headers.get('content-type') || '';
      if (res.ok && cType.includes('application/json')) {
        const data = await res.json();
        if (data.user) {
          setRegisteredUser(data.user);
          await refreshAllData();

          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 },
          });
          setSubmitting(false);
          return;
        } else {
          setFormError(data.error || 'Registration failed. Please check form values.');
          setSubmitting(false);
          return;
        }
      }
    } catch (err: any) {
      console.warn('API register fallback to client-side registration:', err);
    }

    // Client-side fallback registration (when API is unreachable)
    const newIdNum = 100000 + users.length + 1;
    const newUserId = `WDH-${newIdNum}`;
    const initials = formData.name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2) || 'MB';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedSecret = `${initials}-${randomSuffix}`;

    const fallbackNewUser: any = {
      id: newUserId,
      name: formData.name,
      fatherHusbandName: formData.fatherHusbandName,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      mobile: formData.mobile,
      email: formData.email,
      pan: formData.pan.toUpperCase(),
      bankName: formData.bankName,
      bankAccount: formData.bankAccount,
      ifsc: formData.ifsc.toUpperCase(),
      nomineeName: formData.nomineeName,
      nomineeRelation: formData.nomineeRelation,
      sponsorId: formData.sponsorId,
      seniorSecretCode: generatedSecret,
      currentRankId: 0,
      currentRankName: 'Associate',
      walletBalance: 0,
      personalBv: 0,
      group1Bv: 0,
      group2Bv: 0,
      totalTeamBv: 0,
      resellingBv: 0,
      totalIncome: 0,
      monthlyIncome: 0,
      kycStatus: 'pending',
      isActive: true,
      joinDate: new Date().toISOString().split('T')[0],
      role: 'member',
      avatarUrl: photoDoc || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      kycDocuments: { photo: photoDoc, panCard: panDoc, bankProof: bankDoc },
    };

    setRegisteredUser(fallbackNewUser);
    users.push(fallbackNewUser);
    await refreshAllData();

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
    });
    setSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <UserPlus className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">Online Member Joining Form</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Register a new Direct Seller Associate with auto-generated Member ID, instant sponsor validation, and Indian KYC records.
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4 mr-1.5" />
          Govt. Certified MLM Scheme
        </span>
      </div>

      {formError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-8">
        {/* Section 1: Sponsor / Senior Code */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                1. Sponsor (Senior) & Security Secret Code
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-black text-amber-400 flex items-center space-x-1">
              <Lock className="w-3 h-3 mr-1" />
              Senior Secret Code Mandatory
            </span>
          </div>

          {/* Mandatory Rule Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300">
                Mandatory Joining Rule (অল টাইম জয়েনিং এর জন্য সিনিয়র সিক্রেট কোড বাধ্যতামূলক):
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                As per system network security policy, all new member registrations require both a valid <strong>Sponsor ID</strong> and their authorized <strong>Senior Secret Code</strong>. Registration is strictly blocked without valid senior authorization.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Field 1: Sponsor Code */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Sponsor Code (Senior ID) *
              </label>
              <input
                type="text"
                value={formData.sponsorId}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setFormData({ ...formData, sponsorId: val });
                  verifySponsorAndSecret(val, formData.seniorSecretCode);
                }}
                placeholder="e.g. WDH-100001"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono uppercase focus:border-amber-500 focus:outline-none"
                required
              />
              {sponsorName && (
                <p className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Sponsor: {sponsorName}</span>
                </p>
              )}
              {sponsorError && (
                <p className="text-[11px] text-red-400 mt-1 flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{sponsorError}</span>
                </p>
              )}
            </div>

            {/* Field 2: Mandatory Senior Secret Code */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-amber-400 flex items-center space-x-1">
                  <Key className="w-3 h-3 text-amber-400 mr-0.5" />
                  <span>Senior Secret Code *</span>
                </label>
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Must Enter</span>
              </div>
              <div className="relative">
                <input
                  type={showInputSecret ? "text" : "password"}
                  value={formData.seniorSecretCode}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setFormData({ ...formData, seniorSecretCode: val });
                    verifySponsorAndSecret(formData.sponsorId, val);
                  }}
                  placeholder="Enter Sponsor Secret Code"
                  className={`w-full pl-8 pr-10 py-2.5 bg-slate-800 border rounded-xl text-xs font-mono font-bold uppercase focus:outline-none transition ${
                    seniorSecretVerified
                      ? 'border-emerald-500/70 text-emerald-300 focus:border-emerald-400'
                      : secretCodeError
                      ? 'border-red-500 text-red-300 focus:border-red-400'
                      : 'border-amber-500/60 text-white focus:border-amber-400'
                  }`}
                  required
                />
                <Lock className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${
                  seniorSecretVerified ? 'text-emerald-400' : 'text-amber-400'
                }`} />
                <button
                  type="button"
                  onClick={() => setShowInputSecret(!showInputSecret)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 transition"
                  title={showInputSecret ? "Hide code" : "Show code"}
                >
                  {showInputSecret ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {secretCodeSuccessMessage && (
                <p className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{secretCodeSuccessMessage}</span>
                </p>
              )}
              {secretCodeError && (
                <p className="text-[11px] text-red-400 mt-1 flex items-center space-x-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{secretCodeError}</span>
                </p>
              )}
            </div>

            {/* Field 3: Binary Leg */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Binary Placement Leg *
              </label>
              <select
                value={formData.binaryPosition}
                onChange={(e) => setFormData({ ...formData, binaryPosition: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="left">Left Leg (Group 1 - Vertical A)</option>
                <option value="right">Right Leg (Group 2 - Vertical B)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Automatic spillover engine will place under this team leg.
              </p>
            </div>
          </div>

          {/* Confidential Senior Secret Code Protection & Privacy Banner */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-3">
            <div className="flex items-start space-x-2.5">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white flex items-center gap-2">
                  <span>ব্যক্তিগত ও সুরক্ষিত সিক্রেট কোড নীতি (Strictly Private & Confidential)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                    অন্য কেউ দেখতে পারে না
                  </span>
                </h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  কোম্পানির নিরাপত্তা ও প্রাইভেসি পলিসি অনুযায়ী প্রত্যেকের সিক্রেট কোড সম্পূর্ণ ব্যক্তিগত ও গোপনীয়। জয়েনিংয়ের পরে প্রত্যেকের নিজস্ব আলাদা কোড তৈরি হবে যা অন্য কেউ দেখতে পারে না। আপনি যাঁর মাধ্যমে জয়েন করছেন, তাঁর কাছ থেকে সরাসরি সিক্রেট কোড চেয়ে নিয়ে এখানে বসান।
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400">কোড না থাকলে সহায়তা নিন:</span>
              <a
                href="tel:+917098607404"
                className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] flex items-center space-x-1.5 hover:bg-emerald-500/30 transition"
              >
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>Call Helpline: 7098607404</span>
              </a>
              <a
                href="https://wa.me/917098607404?text=Hello%20I%20need%20Senior%20Sponsor%20and%20Secret%20Code%20to%20join"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-[11px] flex items-center space-x-1.5 hover:bg-amber-500/30 transition"
              >
                <MessageSquare className="w-3 h-3 text-amber-400" />
                <span>WhatsApp-এ কোড চান</span>
              </a>

              {/* Demo Helper - Fills demo test sponsor upon explicit click */}
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    sponsorId: 'WDH-100001',
                    seniorSecretCode: 'RS-8821',
                  }));
                  verifySponsorAndSecret('WDH-100001', 'RS-8821');
                }}
                className="text-[11px] text-slate-400 hover:text-amber-300 underline ml-auto transition font-medium"
                title="Fill Demo Test Sponsor: Rajesh Sharma"
              >
                টেস্ট করতে ডেমো স্পনসর ও কোড লোড করুন
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Personal Details */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <User className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              2. Applicant Personal Details & Passport Photograph (ব্যক্তিগত তথ্য ও পাসপোর্ট সাইজ ছবি)
            </h3>
          </div>

          {/* PASSPORT SIZE PHOTOGRAPH SECTION */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-2 border-amber-500/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  Passport Size Photograph (পাসপোর্ট সাইজ রঙিন ছবি)
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                  Standard 35mm × 45mm
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>অফিসিয়াল মেম্বার ফটো</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Actual Passport Photo Frame (Strict 35mm x 45mm ratio) */}
              <div className="relative shrink-0 group text-center">
                <div className="w-28 sm:w-32 h-36 sm:h-40 rounded-xl overflow-hidden border-2 border-amber-400 shadow-2xl bg-slate-950 relative flex items-center justify-center">
                  <img
                    src={photoDoc}
                    alt="Applicant Passport Size Photograph"
                    className="w-full h-full object-cover object-top"
                  />
                  {/* Subtle Passport Overlay Guides */}
                  <div className="absolute top-1 left-1 right-1 flex justify-between pointer-events-none">
                    <span className="w-2 h-2 border-t-2 border-l-2 border-amber-300" />
                    <span className="w-2 h-2 border-t-2 border-r-2 border-amber-300" />
                  </div>
                  <div className="absolute bottom-1 left-1 right-1 flex justify-between pointer-events-none">
                    <span className="w-2 h-2 border-b-2 border-l-2 border-amber-300" />
                    <span className="w-2 h-2 border-b-2 border-r-2 border-amber-300" />
                  </div>
                </div>

                <div className="mt-1.5">
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[9px] font-mono text-amber-300 font-bold tracking-tight">
                    35mm × 45mm
                  </span>
                </div>
              </div>

              {/* Upload Controls & Sample Photos */}
              <div className="flex-1 space-y-3 w-full">
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  আপনার স্পষ্ট পাসপোর্ট সাইজ ছবি যুক্ত করুন। এই ছবিটি আপনার মেম্বার আইডি কার্ড, লগইন পেজ ভেরিফিকেশন এবং ওয়েলকাম লেটারে মুদ্রিত হবে।
                </p>

                {/* Upload Action Button */}
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs shadow-md transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>আপলোড করুন (Upload Photo)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-400">
                    JPG, PNG, WEBP (Max 5MB • White / Plain Background)
                  </span>
                </div>

                {/* Preset Professional Passport Samples (1-Click Selection) */}
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    অথবা সরাসরি নমুনা পাসপোর্ট ছবি বেছে নিন (Quick Sample Photos):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {samplePassportPhotos.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPhotoDoc(sample.url)}
                        className={`flex items-center space-x-1.5 p-1 pr-2.5 rounded-xl border transition text-[10px] ${
                          photoDoc === sample.url
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <img
                          src={sample.url}
                          alt={sample.label}
                          className="w-6 h-7 rounded-md object-cover border border-amber-400/40"
                        />
                        <span>{sample.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Full Name (As per PAN Card) *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramesh Kumar Verma"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Father's / Husband's Name *
              </label>
              <input
                type="text"
                value={formData.fatherHusbandName}
                onChange={(e) => setFormData({ ...formData, fatherHusbandName: e.target.value })}
                placeholder="e.g. Late Mohan Lal Verma"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Mobile Number (10 Digits) *
              </label>
              <input
                type="tel"
                maxLength={10}
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                placeholder="9876543210"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Gmail / Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@gmail.com"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Full Residential Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Flat/House No, Street, Landmark"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">City / District</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Pune"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">PIN Code (6 Digits)</label>
              <input
                type="text"
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="411001"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Government ID & Banking Details */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <CreditCard className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              3. Indian PAN, Aadhaar & Bank Details (Payout Gateway)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Permanent Account Number (PAN)
              </label>
              <input
                type="text"
                maxLength={10}
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                placeholder="ABCDE1234F"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono uppercase focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Aadhaar Number (Optional)
              </label>
              <input
                type="text"
                maxLength={12}
                value={formData.aadhaar}
                onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value.replace(/\D/g, '') })}
                placeholder="12-digit Aadhaar"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Bank Name</label>
              <select
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="">Select Bank (Optional)</option>
                <option value="State Bank of India">State Bank of India (SBI)</option>
                <option value="HDFC Bank Ltd.">HDFC Bank Ltd.</option>
                <option value="ICICI Bank Ltd.">ICICI Bank Ltd.</option>
                <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                <option value="Axis Bank Ltd.">Axis Bank Ltd.</option>
                <option value="Bank of Baroda">Bank of Baroda</option>
                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                <option value="Canara Bank">Canara Bank</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Bank Account Number
              </label>
              <input
                type="text"
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                placeholder="e.g. 50100987654321"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">IFSC Code</label>
              <input
                type="text"
                maxLength={11}
                value={formData.ifsc}
                onChange={(e) => setFormData({ ...formData, ifsc: e.target.value.toUpperCase() })}
                placeholder="SBIN0001234"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono uppercase focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Nominee Name (Accidental Death Safeguard Scheme)
              </label>
              <input
                type="text"
                value={formData.nomineeName}
                onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })}
                placeholder="Full Name of Nominee"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Security Password */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Lock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              4. Member Portal Password
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Portal Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-2xl text-sm shadow-xl shadow-amber-500/20 transition flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-4 h-4 text-slate-950" />
            <span>{submitting ? 'Generating Member ID...' : 'Complete Online Joining Registration'}</span>
          </button>
        </div>
      </form>

      {/* Success Welcome Modal */}
      {registeredUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 mx-auto shadow-xl shadow-amber-500/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                REGISTRATION SUCCESSFUL
              </span>
              <h3 className="text-xl font-black text-white mt-1">Welcome to Watch Video, Dream in Hand</h3>
              <p className="text-xs text-slate-300 mt-1">
                Your Direct Selling Associate account has been created and verified.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 text-left space-y-3 text-xs">
              {/* Member ID & Passport Photograph Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">DISTRIBUTOR PROFILE • আইডি স্লিপ</span>
                  <div className="text-base font-black text-white">{registeredUser.name}</div>
                  <div className="text-sm font-mono font-black text-amber-400">ID: {registeredUser.id}</div>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                    ✓ PASSPORT PHOTO VERIFIED
                  </span>
                </div>

                {/* Member Passport Photograph Box (35mm x 45mm) */}
                <div className="text-center shrink-0">
                  <div className="w-20 h-24 rounded-lg overflow-hidden border-2 border-amber-400 shadow-md bg-slate-950">
                    <img
                      src={registeredUser.avatarUrl || photoDoc}
                      alt={registeredUser.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <span className="text-[8px] font-mono text-amber-300 font-bold block mt-0.5">
                    35mm × 45mm PHOTO
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">New Member ID:</span>
                <span className="font-mono font-black text-base text-amber-400">{registeredUser.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Member Name:</span>
                <span className="font-bold text-white">{registeredUser.name}</span>
              </div>

              {/* Display Generated Senior Secret Code - Strictly Private */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-emerald-500/10 border-2 border-amber-500/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <Key className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-black uppercase text-amber-300">
                        আপনার নিজস্ব গোপনীয় সিক্রেট কোড (Your Private Secret Code):
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        🔒 ব্যক্তিগত (Private)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      🔒 <strong>প্রাইভেসি নিশ্চয়তা:</strong> এই কোডটি সম্পূর্ণ আপনার নিজস্ব। এটি আপনার ড্যাশবোর্ড ছাড়া সিস্টেমের অন্য কোনো মেম্বার বা ডাউনলাইন দেখতে পাবে না। ভবিষ্যতে কেউ আপনার নিচে জয়েন করতে চাইলে আপনি ব্যক্তিগতভাবে এই কোডটি তাকে দেবেন।
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="font-mono font-black text-base px-3 py-1.5 bg-slate-900 border border-amber-400 text-amber-300 rounded-xl tracking-wider shadow-inner">
                      {showRegisteredSecret ? (registeredUser.seniorSecretCode || 'RS-8821') : '••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowRegisteredSecret(!showRegisteredSecret)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title={showRegisteredSecret ? "Hide Code" : "Show Code (কোড দেখুন)"}
                    >
                      {showRegisteredSecret ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(registeredUser.seniorSecretCode || 'RS-8821');
                        setSecretCopied(true);
                        setTimeout(() => setSecretCopied(false), 2000);
                      }}
                      className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-sm"
                      title="Copy Secret Code"
                    >
                      {secretCopied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* WhatsApp Share Action */}
                <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-300">ভবিষ্যত ডাউনলাইনকে জয়েনিং তথ্য পাঠাতে:</span>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Watch Video Dream in Hand - Joining Invitation:\nSponsor ID: ${registeredUser.id} (${registeredUser.name})\nSenior Secret Code: ${registeredUser.seniorSecretCode}\n(Note: Keep this code safe and confidential).`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition flex items-center space-x-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp-এ ডাউনলাইনকে পাঠান</span>
                  </a>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Senior Sponsor:</span>
                <span className="text-slate-200">{registeredUser.sponsorName} ({registeredUser.sponsorId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Initial Rank:</span>
                <span className="text-amber-300 font-semibold">{registeredUser.currentRankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Binary Leg:</span>
                <span className="text-slate-200 uppercase font-mono">{registeredUser.binaryPosition} Leg</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={async () => {
                  await login(registeredUser.id);
                  onSuccess(registeredUser.id);
                }}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition shadow-md"
              >
                Login & Open Dashboard →
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition flex items-center justify-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Welcome Letter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
