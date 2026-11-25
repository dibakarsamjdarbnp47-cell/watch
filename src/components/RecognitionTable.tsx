import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { RankLevel } from '../types/index.js';
import {
  Award,
  ShieldCheck,
  Plane,
  Sparkles,
  Search,
  CheckCircle2,
  Lock,
  Calculator,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const RecognitionTable: React.FC = () => {
  const { currentUser } = useAuth();
  const [ranks, setRanks] = useState<RankLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Simulator state
  const [simTotalBv, setSimTotalBv] = useState<number>(50000);
  const [simGroup1Bv, setSimGroup1Bv] = useState<number>(17000);
  const [simGroup2Bv, setSimGroup2Bv] = useState<number>(33500);

  useEffect(() => {
    fetch('/api/ranks')
      .then((res) => res.json())
      .then((data) => {
        setRanks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load ranks:', err);
        setLoading(false);
      });
  }, []);

  const userTotalBv = currentUser
    ? currentUser.personalBv + currentUser.group1Bv + currentUser.group2Bv
    : 0;
  const userG1 = currentUser ? Math.min(currentUser.group1Bv, currentUser.group2Bv) : 0;
  const userG2 = currentUser ? Math.max(currentUser.group1Bv, currentUser.group2Bv) : 0;

  // Simulator calculation
  const getSimulatedRank = () => {
    const weaker = Math.min(simGroup1Bv, simGroup2Bv);
    const stronger = Math.max(simGroup1Bv, simGroup2Bv);
    let matched: RankLevel | null = null;

    for (const r of ranks) {
      if (simTotalBv >= r.totalBvRequired && weaker >= r.group1BvRequired && stronger >= r.group2BvRequired) {
        matched = r;
      } else {
        break;
      }
    }
    return matched;
  };

  const simulatedRank = getSimulatedRank();

  const filteredRanks = ranks.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">Recognition Level Matrix</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic 18-Tier Dual-Leg Qualification Engine based on Group 1 (Weaker) & Group 2 (Stronger) Business Volume.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search Rank 1-18..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Interactive BV Rank Simulator Tool */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-indigo-300">
          <Calculator className="w-5 h-5" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Live BV Rank Qualification Simulator</h3>
        </div>
        <p className="text-xs text-slate-400">
          Simulate dual-leg volume scenarios to see which Leadership Rank, Tour Promotion & Accidental Safeguard you will qualify for.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Simulated Total BV
            </label>
            <input
              type="number"
              value={simTotalBv}
              onChange={(e) => setSimTotalBv(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Group 1 (Weaker Leg) BV
            </label>
            <input
              type="number"
              value={simGroup1Bv}
              onChange={(e) => setSimGroup1Bv(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Group 2 (Stronger Leg) BV
            </label>
            <input
              type="number"
              value={simGroup2Bv}
              onChange={(e) => setSimGroup2Bv(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400">Projected Qualified Rank:</span>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-base font-black text-amber-400">
                {simulatedRank ? `Rank ${simulatedRank.id} - ${simulatedRank.name}` : 'Associate (Under Rank 1)'}
              </span>
              {simulatedRank?.promotionReward && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                  ✈️ {simulatedRank.promotionReward}
                </span>
              )}
              {simulatedRank?.safeguardAmount && simulatedRank.safeguardAmount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  🛡️ ₹{simulatedRank.safeguardAmount.toLocaleString('en-IN')} Safeguard
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              if (currentUser) {
                setSimTotalBv(userTotalBv);
                setSimGroup1Bv(userG1);
                setSimGroup2Bv(userG2);
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shrink-0"
          >
            Load My Current BV
          </button>
        </div>
      </div>

      {/* Complete 18 Ranks Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-800/90 border-b border-slate-700 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-4 px-4">S.No</th>
                <th className="py-4 px-4">Recognition Level</th>
                <th className="py-4 px-4">Total Business Volume</th>
                <th className="py-4 px-4">Group 1 BV (Weaker)</th>
                <th className="py-4 px-4">Group 2 BV (Stronger)</th>
                <th className="py-4 px-4">Promotion / Tour Reward</th>
                <th className="py-4 px-4">Safeguard Benefit</th>
                <th className="py-4 px-4 text-center">Your Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredRanks.map((rank) => {
                const isCurrentRank = currentUser?.currentRankId === rank.id;
                const isAchieved = (currentUser?.currentRankId || 0) >= rank.id;

                // Qualification checks
                const totalPass = userTotalBv >= rank.totalBvRequired;
                const g1Pass = userG1 >= rank.group1BvRequired;
                const g2Pass = userG2 >= rank.group2BvRequired;

                return (
                  <tr
                    key={rank.id}
                    className={`transition ${
                      isCurrentRank
                        ? 'bg-amber-500/10 border-l-4 border-l-amber-400 font-medium'
                        : isAchieved
                        ? 'bg-slate-800/20 hover:bg-slate-800/50'
                        : 'hover:bg-slate-800/30'
                    }`}
                  >
                    {/* S.No */}
                    <td className="py-4 px-4 font-mono font-bold text-slate-400">
                      Rank {rank.id}
                    </td>

                    {/* Recognition Level */}
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: rank.badgeColor }}
                        />
                        <span className="font-bold text-white text-sm">
                          {rank.name}
                        </span>
                        {isCurrentRank && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-extrabold shadow-sm">
                            YOU ARE HERE
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total BV */}
                    <td className="py-4 px-4 font-mono font-bold text-slate-200">
                      {rank.totalBvRequired.toLocaleString('en-IN')}{' '}
                      <span className="text-[10px] text-slate-400">BV</span>
                    </td>

                    {/* Group 1 BV */}
                    <td className="py-4 px-4 font-mono text-slate-300">
                      {rank.group1BvRequired.toLocaleString('en-IN')}{' '}
                      <span className="text-[10px] text-slate-400">BV</span>
                    </td>

                    {/* Group 2 BV */}
                    <td className="py-4 px-4 font-mono text-slate-300">
                      {rank.group2BvRequired.toLocaleString('en-IN')}{' '}
                      <span className="text-[10px] text-slate-400">BV</span>
                    </td>

                    {/* Promotion Tour Reward */}
                    <td className="py-4 px-4">
                      {rank.promotionReward ? (
                        <div className="flex items-center space-x-1.5 text-amber-300 font-medium">
                          <Plane className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate max-w-[200px]" title={rank.promotionReward}>
                            {rank.promotionReward}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-600 font-mono">—</span>
                      )}
                    </td>

                    {/* Safeguard Benefit */}
                    <td className="py-4 px-4">
                      {rank.safeguardAmount && rank.safeguardAmount > 0 ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 font-mono">
                          <ShieldCheck className="w-3 h-3" />
                          <span>₹{rank.safeguardAmount.toLocaleString('en-IN')}</span>
                        </span>
                      ) : (
                        <span className="text-slate-600 font-mono">—</span>
                      )}
                    </td>

                    {/* Your Status */}
                    <td className="py-4 px-4 text-center">
                      {isAchieved ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ACHIEVED</span>
                        </span>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="inline-flex items-center space-x-1 text-slate-400 text-[10px]">
                            <Lock className="w-3 h-3" />
                            <span>In Progress</span>
                          </span>
                          <div className="w-16 bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
                            <div
                              className="bg-amber-400 h-1"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.round(((userTotalBv / rank.totalBvRequired) * 100))
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
