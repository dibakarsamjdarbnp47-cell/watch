import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Eye,
  FileText,
  CreditCard,
  Building,
  User,
  Info,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const KycManagement: React.FC = () => {
  const { currentUser, refreshUserData } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    pan: currentUser?.pan || '',
    aadhaar: currentUser?.aadhaar || '',
    bankName: currentUser?.bankName || 'State Bank of India',
    bankAccount: currentUser?.bankAccount || '',
    ifsc: currentUser?.ifsc || '',
  });

  const [docs, setDocs] = useState({
    photo: currentUser?.kycDocuments?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    panCard: currentUser?.kycDocuments?.panCard || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
    bankProof: currentUser?.kycDocuments?.bankProof || 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop&q=80',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedDocPreview, setSelectedDocPreview] = useState<{ title: string; url: string } | null>(null);

  if (!currentUser) return null;

  const handleSaveKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/users/kyc/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          pan: formData.pan.toUpperCase(),
          aadhaar: formData.aadhaar,
          bankName: formData.bankName,
          bankAccount: formData.bankAccount,
          ifsc: formData.ifsc.toUpperCase(),
          kycDocuments: docs,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('KYC records submitted successfully for compliance verification.');
        setEditing(false);
        refreshUserData();
        confetti({ particleCount: 80, spread: 60 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">KYC & Statutory Document Center</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Government of India Direct Selling Rules 2021 & Income Tax Compliance Center.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center space-x-1.5 ${
              currentUser.kycStatus === 'verified'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : currentUser.kycStatus === 'pending'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}
          >
            {currentUser.kycStatus === 'verified' ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            <span>KYC {currentUser.kycStatus.toUpperCase()}</span>
          </span>
        </div>
      </div>

      {/* Statutory TDS Compliance Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-slate-900 to-slate-900 border border-emerald-500/30 flex items-start space-x-3">
        <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-1">
          <h4 className="font-bold text-emerald-300">Income Tax Act 1961 (Section 194H) TDS Notice:</h4>
          <p className="text-slate-400 leading-relaxed">
            With a <strong>Verified PAN Card</strong>, commission payouts are deducted at only <strong>5% TDS</strong>. If PAN is unverified or missing, statutory TDS is legally mandated at <strong>20%</strong>. Please ensure your PAN and Bank A/C details are 100% accurate.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* KYC Form & Document Preview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Details */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Identity & Bank Account Credentials
            </h3>
            <button
              onClick={() => setEditing(!editing)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              {editing ? 'Cancel' : 'Edit Credentials'}
            </button>
          </div>

          <form onSubmit={handleSaveKyc} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Permanent Account Number (PAN)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  disabled={!editing}
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono uppercase focus:border-emerald-500 focus:outline-none disabled:opacity-70"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  maxLength={12}
                  disabled={!editing}
                  value={formData.aadhaar}
                  onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-none disabled:opacity-70"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  disabled={!editing}
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none disabled:opacity-70"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  disabled={!editing}
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-none disabled:opacity-70"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  maxLength={11}
                  disabled={!editing}
                  value={formData.ifsc}
                  onChange={(e) => setFormData({ ...formData, ifsc: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono uppercase focus:border-emerald-500 focus:outline-none disabled:opacity-70"
                  required
                />
              </div>
            </div>

            {editing && (
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition"
                >
                  {saving ? 'Updating Records...' : 'Save & Re-submit KYC'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Uploaded Documents Gallery */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Attached KYC Documents
          </h3>

          <div className="space-y-3">
            {/* Passport Photo */}
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <img src={docs.photo} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-900" />
                <div>
                  <h4 className="font-bold text-white">Passport Photo</h4>
                  <p className="text-[10px] text-emerald-400 font-semibold">Verified</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDocPreview({ title: 'Passport Size Photo', url: docs.photo })}
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {/* PAN Card */}
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <img src={docs.panCard} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-900" />
                <div>
                  <h4 className="font-bold text-white">PAN Card Copy</h4>
                  <p className="text-[10px] text-emerald-400 font-semibold">PAN Matched</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDocPreview({ title: 'PAN Card Copy', url: docs.panCard })}
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {/* Bank Passbook */}
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <img src={docs.bankProof} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-900" />
                <div>
                  <h4 className="font-bold text-white">Bank Passbook / Cheque</h4>
                  <p className="text-[10px] text-emerald-400 font-semibold">Validated</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDocPreview({ title: 'Bank Passbook Proof', url: docs.bankProof })}
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Zoom Preview Modal */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">{selectedDocPreview.title}</h3>
              <button
                onClick={() => setSelectedDocPreview(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              <img src={selectedDocPreview.url} alt="" className="w-full max-h-80 object-contain mx-auto" />
            </div>
            <button
              onClick={() => setSelectedDocPreview(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition"
            >
              Close Viewer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
