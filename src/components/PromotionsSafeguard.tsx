import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  Plane,
  ShieldCheck,
  Award,
  CheckCircle2,
  Lock,
  HeartHandshake,
  Calendar,
  MapPin,
  Sparkles,
  Info,
  HelpCircle,
} from 'lucide-react';

export const PromotionsSafeguard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'tours' | 'safeguard'>('tours');

  if (!currentUser) return null;

  const tourPromotions = [
    { rank: 4, rankName: 'Gold', title: '1st Promotion - Domestic Tour (Goa / Manali)', days: '3 Nights / 4 Days', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&auto=format&fit=crop&q=80', description: 'Luxury 5-star resort stay, leadership masterclass & Gala dinner.' },
    { rank: 6, rankName: 'Coral', title: '2nd Promotion - Thailand International Tour (Pattaya/Bangkok)', days: '4 Nights / 5 Days', image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=500&auto=format&fit=crop&q=80', description: 'Coral Island cruise, luxury transfers, international banquet.' },
    { rank: 8, rankName: 'Emerald', title: '3rd Promotion - Dubai Desert Safari & Mega City Tour', days: '4 Nights / 5 Days', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500&auto=format&fit=crop&q=80', description: 'Burj Khalifa experience, desert dune bashing, VIP dinner.' },
    { rank: 9, rankName: 'Ruby', title: '4th Promotion - Hong Kong & Macau Tour', days: '4 Nights / 5 Days', image: 'https://images.unsplash.com/photo-1506970845036-3d29052d0a0b?w=500&auto=format&fit=crop&q=80', description: 'Disneyland passes, Victoria Peak tram, Venetian casino luxury.' },
    { rank: 10, rankName: 'Opal', title: '5th Promotion - Maldives Water Villa Luxury Vacation', days: '3 Nights / 4 Days', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=500&auto=format&fit=crop&q=80', description: 'Overwater ocean villa, all-inclusive dining, snorkeling safari.' },
    { rank: 11, rankName: 'Diamond', title: '6th Promotion - Singapore & Sentosa Dream Tour', days: '4 Nights / 5 Days', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=500&auto=format&fit=crop&q=80', description: 'Marina Bay Sands infinity experience, Universal Studios passes.' },
    { rank: 12, rankName: 'Double Diamond', title: '7th Promotion - China Great Wall & Shanghai Tour', days: '5 Nights / 6 Days', image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=500&auto=format&fit=crop&q=80', description: 'Historic Great Wall expedition and high-speed bullet train.' },
    { rank: 13, rankName: 'Triple Diamond', title: '8th Promotion - Eastern Europe Scenic Tour (Prague/Budapest)', days: '6 Nights / 7 Days', image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=500&auto=format&fit=crop&q=80', description: 'Danube cruise, ancient castles, European culinary journey.' },
    { rank: 14, rankName: 'Venus', title: '9th Promotion - Russia Moscow & St. Petersburg Tour', days: '6 Nights / 7 Days', image: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=500&auto=format&fit=crop&q=80', description: 'Red Square, Hermitage Museum & White Nights celebration.' },
    { rank: 15, rankName: 'Mercury', title: '10th Promotion - Switzerland Alpine Wonderland Tour', days: '6 Nights / 7 Days', image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=500&auto=format&fit=crop&q=80', description: 'Mount Titlis cable car, Lucerne lake cruise, luxury Swiss chalet.' },
    { rank: 16, rankName: 'Crown', title: '11th Promotion - Australia Sydney & Gold Coast Tour', days: '7 Nights / 8 Days', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=500&auto=format&fit=crop&q=80', description: 'Sydney Opera House, Great Barrier Reef helicopter flight.' },
    { rank: 17, rankName: 'Crown Ambassador', title: '12th Promotion - London & United Kingdom Royal Tour', days: '7 Nights / 8 Days', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=500&auto=format&fit=crop&q=80', description: 'Buckingham Palace VIP tour, London Eye luxury capsule.' },
    { rank: 18, rankName: 'Universal Crown Ambassador', title: '13th Promotion - USA Super Tour (New York/Orlando/Las Vegas)', days: '10 Nights / 11 Days', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=500&auto=format&fit=crop&q=80', description: 'Times Square, Grand Canyon chopper, Universal Studios VIP.' },
  ];

  const safeguardTiers = [
    { rank: 7, rankName: 'Topaz', amount: 4000, description: 'Monthly family welfare grant for 12 months.' },
    { rank: 8, rankName: 'Emerald', amount: 6000, description: 'Monthly family welfare grant + medical corpus.' },
    { rank: 9, rankName: 'Ruby', amount: 10000, description: 'Monthly nominee security pension + educational support.' },
    { rank: 10, rankName: 'Opal', amount: 15000, description: 'Monthly security pension + business inheritance support.' },
    { rank: 11, rankName: 'Diamond & Above', amount: 25000, description: 'Highest executive lifetime family safeguard and royalty transfer.' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Plane className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">Fixed Promotions & Safeguard Scheme</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            13 All-Expenses-Paid International & Domestic Tour Rewards and Family Accidental Death Protection.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-slate-800 border border-slate-700 rounded-2xl p-1 shrink-0">
          <button
            onClick={() => setActiveTab('tours')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'tours' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Plane className="w-4 h-4" />
            <span>13 Tour Rewards</span>
          </button>
          <button
            onClick={() => setActiveTab('safeguard')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'safeguard' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Accidental Safeguard</span>
          </button>
        </div>
      </div>

      {activeTab === 'tours' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tourPromotions.map((tour) => {
            const isQualified = currentUser.currentRankId >= tour.rank;
            return (
              <div
                key={tour.rank}
                className={`rounded-3xl border overflow-hidden transition flex flex-col justify-between ${
                  isQualified
                    ? 'bg-slate-900 border-amber-500/60 shadow-xl shadow-amber-500/5'
                    : 'bg-slate-900/60 border-slate-800 opacity-80'
                }`}
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-slate-900/90 text-amber-400 text-[10px] font-bold border border-amber-500/40">
                      Rank {tour.rank} • {tour.rankName}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    {isQualified ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold flex items-center space-x-1 shadow-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>QUALIFIED</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-950/80 text-slate-400 text-[10px] font-bold flex items-center space-x-1">
                        <Lock className="w-3 h-3" />
                        <span>LOCKED</span>
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2 left-3 right-3">
                    <span className="text-[10px] font-mono text-amber-300 font-semibold">{tour.days}</span>
                    <h3 className="text-sm font-bold text-white leading-tight truncate">{tour.title}</h3>
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-400">{tour.description}</p>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Eligibility:</span>
                    <span className="font-semibold text-amber-400">
                      Achieve {tour.rankName} (Rank {tour.rank})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Accidental Death Safeguard Scheme */
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
              <h2 className="text-lg font-bold text-white">Family Social Security & Nominee Safeguard Charter</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              In accordance with our humanitarian Direct Selling values, every active leader who achieves <strong>Rank 7 (Topaz) or above</strong> is enrolled in the <strong>Accidental Death Safeguard Scheme</strong>. In case of any unforeseen tragic demise, the company provides direct financial monthly assistance to the registered Nominee.
            </p>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Current User Status</span>
                <p className="font-bold text-white mt-0.5">
                  {currentUser.safeguardEligible ? '✅ ENROLLED & ACTIVE' : 'LOCKED (Needs Rank 7 Topaz)'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Assigned Nominee</span>
                <p className="font-bold text-emerald-400 mt-0.5">
                  {currentUser.nomineeName || 'Not Appointed'} ({currentUser.nomineeRelation || 'N/A'})
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Monthly Coverage</span>
                <p className="font-black text-amber-400 text-sm mt-0.5">
                  ₹{currentUser.safeguardAmount.toLocaleString('en-IN')} / Month
                </p>
              </div>
            </div>
          </div>

          {/* Safeguard Table */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Recognition Level Safeguard Slab Structure
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {safeguardTiers.map((tier) => {
                const isEligible = currentUser.currentRankId >= tier.rank;
                return (
                  <div
                    key={tier.rank}
                    className={`p-4 rounded-2xl border transition space-y-3 ${
                      isEligible
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg'
                        : 'bg-slate-800/40 border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        Rank {tier.rank} • {tier.rankName}
                      </span>
                      {isEligible ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Locked</span>
                      )}
                    </div>

                    <div>
                      <span className="text-2xl font-black text-emerald-400">
                        ₹{tier.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-400"> / Month</span>
                    </div>

                    <p className="text-xs text-slate-400">{tier.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
