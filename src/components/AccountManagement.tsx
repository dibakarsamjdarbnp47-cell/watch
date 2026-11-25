import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  User,
  ShieldCheck,
  CreditCard,
  Building2,
  Lock,
  Phone,
  Mail,
  MapPin,
  Key,
  Users,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Save,
  FileText,
  UserCheck,
  Camera,
  Upload,
} from 'lucide-react';

interface AccountManagementProps {
  onNavigateToNetwork?: () => void;
  onNavigateToAllNetwork?: () => void;
}

export const AccountManagement: React.FC<AccountManagementProps> = ({
  onNavigateToNetwork,
  onNavigateToAllNetwork,
}) => {
  const { currentUser, updateProfile, logout } = useAuth();

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    fatherHusbandName: currentUser?.fatherHusbandName || '',
    mobile: currentUser?.mobile || '',
    email: currentUser?.email || '',
    address: currentUser?.address || '',
    city: currentUser?.city || '',
    state: currentUser?.state || '',
    pincode: currentUser?.pincode || '',
    pan: currentUser?.pan || '',
    aadhaar: currentUser?.aadhaar || '',
    bankName: currentUser?.bankName || '',
    bankAccount: currentUser?.bankAccount || '',
    ifsc: currentUser?.ifsc || '',
    nomineeName: currentUser?.nomineeName || '',
    nomineeRelation: currentUser?.nomineeRelation || '',
    seniorSecretCode: currentUser?.seniorSecretCode || '',
  });

  const [photoUrl, setPhotoUrl] = useState<string>(
    currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80'
  );
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [photoSuccessMsg, setPhotoSuccessMsg] = useState<string | null>(null);

  const samplePassportPhotos = [
    { label: 'Executive Male (পুরুষ)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80' },
    { label: 'Corporate Female (মহিলা)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80' },
    { label: 'Professional Male (তরুণ পেশাদার)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
    { label: 'Leader Female (নেতৃত্ব)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
    { label: 'Business Executive (নির্বাহী)', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80' },
  ];

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = async () => {
    setSavingPhoto(true);
    setPhotoSuccessMsg(null);
    try {
      await updateProfile({ avatarUrl: photoUrl });
      setPhotoSuccessMsg('Passport photo updated successfully! (পাসপোর্ট সাইজ ছবি সফলভাবে সংরক্ষিত হয়েছে)');
      setTimeout(() => setPhotoSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update passport photo.');
    } finally {
      setSavingPhoto(false);
    }
  };

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!currentUser) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await updateProfile(formData);
      setSuccessMessage('Profile and account details updated successfully! (আপনার অ্যাকাউন্ট তথ্য সফলভাবে সংরক্ষিত হয়েছে)');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update account details.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header with Logout Option */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative shrink-0 text-center">
              <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 border-amber-400 bg-slate-950 shadow-xl relative">
                <img
                  src={currentUser.avatarUrl || photoUrl}
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
              <span className="mt-1 inline-block px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[8px] font-mono text-amber-300 font-bold">
                35mm × 45mm
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                  Private Account Center • অ্যাকাউন্ট পরিচালনা
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Active Member
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {currentUser.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                  User ID: {currentUser.id}
                </span>
                <span className="text-xs text-slate-300">
                  Rank: <strong className="text-white">{currentUser.currentRankName}</strong> (Level {currentUser.currentRankId})
                </span>
                <span className="text-xs text-slate-400">
                  Joined: {currentUser.joinDate}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Prominent Logout Option */}
          <div className="flex flex-wrap items-center gap-2.5">
            {onNavigateToNetwork && (
              <button
                onClick={onNavigateToNetwork}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                <Users className="w-4 h-4 text-blue-400" />
                <span>Network (নেটওয়ার্ক)</span>
              </button>
            )}
            {onNavigateToAllNetwork && (
              <button
                onClick={onNavigateToAllNetwork}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                <UserCheck className="w-4 h-4 text-purple-400" />
                <span>All Network (অল নেটওয়ার্ক)</span>
              </button>
            )}

            {/* Direct Prominent Logout Option */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition cursor-pointer"
              title="Log out from this account"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out (লগআউট)</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/60 text-xs">
          <div>
            <span className="text-slate-400">Personal BV</span>
            <p className="text-lg font-black text-white">{currentUser.personalBv.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <span className="text-slate-400">Team Total BV</span>
            <p className="text-lg font-black text-amber-400">{currentUser.totalTeamBv.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <span className="text-slate-400">Left / Right Team</span>
            <p className="text-lg font-black text-slate-200">{currentUser.leftTeamCount} / {currentUser.rightTeamCount}</p>
          </div>
          <div>
            <span className="text-slate-400">KYC Verification</span>
            <p className="text-sm font-bold text-emerald-400 flex items-center gap-1 mt-1">
              <ShieldCheck className="w-4 h-4" />
              {currentUser.kycStatus === 'verified' ? 'Fully Verified' : 'Under Review'}
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Log Out Confirmation (লগআউট)</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to log out from account <strong>{currentUser.id}</strong>?
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel (বাতিল)
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/30"
              >
                Confirm Log Out (লগআউট)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {photoSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{photoSuccessMsg}</span>
        </div>
      )}

      {/* Account Details Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* PASSPORT SIZE PHOTOGRAPH CARD */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-2 border-amber-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
              <Camera className="w-4 h-4" />
              <span>Passport Size Photograph Management (পাসপোর্ট সাইজ ফটো পরিচালনা)</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold">
              Standard 35mm × 45mm
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Passport Photo Frame (35mm x 45mm ratio) */}
            <div className="relative shrink-0 text-center">
              <div className="w-28 sm:w-32 h-36 sm:h-40 rounded-xl overflow-hidden border-2 border-amber-400 shadow-2xl bg-slate-950 relative flex items-center justify-center">
                <img
                  src={photoUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover object-top"
                />
                {/* Passport Corner Alignment Marks */}
                <div className="absolute top-1 left-1 right-1 flex justify-between pointer-events-none">
                  <span className="w-2 h-2 border-t-2 border-l-2 border-amber-300" />
                  <span className="w-2 h-2 border-t-2 border-r-2 border-amber-300" />
                </div>
                <div className="absolute bottom-1 left-1 right-1 flex justify-between pointer-events-none">
                  <span className="w-2 h-2 border-b-2 border-l-2 border-amber-300" />
                  <span className="w-2 h-2 border-b-2 border-r-2 border-amber-300" />
                </div>
              </div>
              <span className="mt-1.5 inline-block px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[9px] font-mono text-amber-300 font-bold">
                35mm × 45mm PASSPORT PHOTO
              </span>
            </div>

            {/* Photo Upload & Preset Sample Controls */}
            <div className="flex-1 space-y-3.5 w-full">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Official Member Identity Photo (অফিসিয়াল মেম্বার ছবি)
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  পাসপোর্ট সাইজের রঙিন ছবি আপলোড করুন। এই ছবিটি আপনার অ্যাকাউন্ট পোর্টাল, মেম্বার ড্যাশবোর্ড এবং লগইন ফর্ম ভেরিফিকেশনে প্রদর্শিত হবে।
                </p>
              </div>

              {/* Upload Button and Save Button */}
              <div className="flex flex-wrap items-center gap-2.5">
                <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs shadow transition">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>নতুন ছবি আপলোড (Upload New Photo)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleSavePhoto}
                  disabled={savingPhoto}
                  className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingPhoto ? 'Saving Photo...' : 'Save Photo (ফটো সেভ করুন)'}</span>
                </button>
              </div>

              {/* Quick Preset Professional Passport Samples */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  অথবা ডেমো পাসপোর্ট ছবি থেকে বেছে নিন (Quick Select Samples):
                </span>
                <div className="flex flex-wrap gap-2">
                  {samplePassportPhotos.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoUrl(sample.url)}
                      className={`flex items-center space-x-1.5 p-1 pr-2.5 rounded-xl border transition text-[10px] ${
                        photoUrl === sample.url
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

        {/* Section 1: Personal & Contact Information */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 text-amber-400 font-bold text-sm">
            <User className="w-4 h-4" />
            <span>1. Personal & Contact Details (ব্যক্তিগত তথ্য)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Full Name (সম্পূর্ণ নাম)</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Father / Husband Name</label>
              <input
                type="text"
                name="fatherHusbandName"
                value={formData.fatherHusbandName}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Mobile Number (মোবাইল নম্বর)</label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Email Address (ইমেইল)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-400 font-medium mb-1">Permanent Residential Address (ঠিকানা)</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">City / District (শহর)</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">State (রাজ্য)</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Postal PIN Code (পিনকোড)</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Banking & Payout Credentials */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 text-emerald-400 font-bold text-sm">
            <Building2 className="w-4 h-4" />
            <span>2. Bank Details & Direct Payout (ব্যাঙ্কিং বিবরণী)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Bank Name (ব্যাঙ্কের নাম)</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="e.g. State Bank of India"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Account Number (অ্যাকাউন্ট নম্বর)</label>
              <input
                type="text"
                name="bankAccount"
                value={formData.bankAccount}
                onChange={handleChange}
                placeholder="e.g. 30291827364"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">IFSC Code (আইএফএসসি কোড)</label>
              <input
                type="text"
                name="ifsc"
                value={formData.ifsc}
                onChange={handleChange}
                placeholder="e.g. SBIN0001234"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium font-mono uppercase focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Government KYC & Nominee Details */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 text-blue-400 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>3. Government Tax Compliance & Nominee (কেওয়াইসি ও নমিনী)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">PAN Card (প্যান নম্বর)</label>
              <input
                type="text"
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium font-mono uppercase focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Aadhaar Card (আধার নম্বর)</label>
              <input
                type="text"
                name="aadhaar"
                value={formData.aadhaar}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Nominee Name (নমিনীর নাম)</label>
              <input
                type="text"
                name="nomineeName"
                value={formData.nomineeName}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Nominee Relation (সম্পর্ক)</label>
              <input
                type="text"
                name="nomineeRelation"
                value={formData.nomineeRelation}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Sponsor & Placement Authorization */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 text-purple-400 font-bold text-sm">
            <Key className="w-4 h-4" />
            <span>4. Senior Authorization & Placement Secret Code</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Senior Sponsor</label>
              <div className="px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 font-medium">
                {currentUser.sponsorName} ({currentUser.sponsorId})
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Binary Placement Leg</label>
              <div className="px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-amber-300 font-bold capitalize">
                {currentUser.binaryPosition ? `${currentUser.binaryPosition} Leg` : 'Root'}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Your Private Secret Code (সিনিয়র সিক্রেট কোড)
              </label>
              <input
                type="text"
                name="seniorSecretCode"
                value={formData.seniorSecretCode}
                onChange={handleChange}
                placeholder="e.g. RS-8821"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-amber-500/40 text-amber-300 font-bold font-mono uppercase focus:outline-none focus:border-amber-400"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Downlines must enter this code when registering under you.
              </p>
            </div>
          </div>
        </div>

        {/* Submit & Save Footer Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>All modifications are authenticated with 256-bit isolated ERP security.</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save & Update Details (তথ্য সংরক্ষণ করুন)'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
