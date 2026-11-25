import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  GitFork,
  ArrowRight,
  ShieldCheck,
  Award,
  Filter,
  RefreshCw,
  UserCheck,
  TrendingUp,
  Download,
} from 'lucide-react';

interface NetworkMember {
  id: string;
  name: string;
  avatarUrl: string;
  mobile: string;
  email: string;
  currentRankId: number;
  currentRankName: string;
  sponsorId: string;
  sponsorName: string;
  binaryParentId: string | null;
  binaryPosition: 'left' | 'right' | null;
  leg: 'left' | 'right' | 'direct' | 'root';
  level: number;
  personalBv: number;
  totalTeamBv: number;
  group1Bv: number;
  group2Bv: number;
  leftTeamCount: number;
  rightTeamCount: number;
  kycStatus: string;
  joinDate: string;
  isActive: boolean;
}

interface NetworkStats {
  totalMembers: number;
  leftLegCount: number;
  rightLegCount: number;
  directCount: number;
  activeCount: number;
  leftBv: number;
  rightBv: number;
  totalTeamBv: number;
}

interface AllNetworkDirectoryProps {
  onNavigateToTree?: (userId?: string) => void;
  onNavigateToAccount?: () => void;
}

export const AllNetworkDirectory: React.FC<AllNetworkDirectoryProps> = ({
  onNavigateToTree,
  onNavigateToAccount,
}) => {
  const { currentUser, token } = useAuth();

  const [members, setMembers] = useState<NetworkMember[]>([]);
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and Pagination states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [legFilter, setLegFilter] = useState<'all' | 'left' | 'right' | 'direct'>('all');
  const [kycFilter, setKycFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPrevPage, setHasPrevPage] = useState<boolean>(false);

  const fetchNetworkMembers = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        userId: currentUser.id,
        leg: legFilter,
        search: searchTerm,
        kyc: kycFilter,
        page: String(currentPage),
        limit: String(pageSize),
        scope: currentUser.role === 'superadmin' || currentUser.role === 'admin' ? 'all' : 'downline',
      });

      const res = await fetch(`/api/network/downlines?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token || currentUser.id}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load network downline data (${res.status})`);
      }

      const data = await res.json();
      setMembers(data.members || []);
      setStats(data.stats || null);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
      setHasNextPage(Boolean(data.hasNextPage));
      setHasPrevPage(Boolean(data.hasPrevPage));
    } catch (err: any) {
      console.error('Network Directory fetch error:', err);
      setError(err.message || 'Error loading network data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkMembers();
  }, [currentUser?.id, legFilter, kycFilter, currentPage, pageSize]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchNetworkMembers();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setLegFilter('all');
    setKycFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <Users className="w-4 h-4" />
              <span>Downline Team Directory • অল নেটওয়ার্ক তালিকা</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              All Network Directory <span className="text-amber-400 font-medium">(অল নেটওয়ার্ক)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Complete dual-leg downline hierarchy, direct team members, Group 1 (Left) and Group 2 (Right) leg positions with Next Page navigation.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {onNavigateToTree && (
              <button
                onClick={() => onNavigateToTree(currentUser?.id)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
              >
                <GitFork className="w-4 h-4" />
                <span>Binary Tree (নেটওয়ার্ক ট্রি)</span>
              </button>
            )}
            {onNavigateToAccount && (
              <button
                onClick={onNavigateToAccount}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition"
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>My Account (অ্যাকাউন্ট)</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Network Stat Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/60">
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-[11px] text-slate-400">Total Network Size</span>
              <p className="text-xl font-black text-white mt-0.5">
                {stats.totalMembers.toLocaleString('en-IN')}{' '}
                <span className="text-xs text-slate-400 font-normal">Members</span>
              </p>
              <div className="text-[10px] text-emerald-400 mt-1 font-semibold">
                ● {stats.activeCount} Active Distributorships
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-blue-500/30">
              <span className="text-[11px] text-blue-300 font-medium">Group 1 (Left Leg)</span>
              <p className="text-xl font-black text-blue-400 mt-0.5">
                {stats.leftLegCount}{' '}
                <span className="text-xs text-slate-400 font-normal">Downlines</span>
              </p>
              <div className="text-[10px] text-slate-400 mt-1">
                Volume: <span className="font-bold text-slate-200">{stats.leftBv.toLocaleString('en-IN')} BV</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-amber-500/30">
              <span className="text-[11px] text-amber-300 font-medium">Group 2 (Right Leg)</span>
              <p className="text-xl font-black text-amber-400 mt-0.5">
                {stats.rightLegCount}{' '}
                <span className="text-xs text-slate-400 font-normal">Downlines</span>
              </p>
              <div className="text-[10px] text-slate-400 mt-1">
                Volume: <span className="font-bold text-slate-200">{stats.rightBv.toLocaleString('en-IN')} BV</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-purple-500/30">
              <span className="text-[11px] text-purple-300 font-medium">Direct Sponsored</span>
              <p className="text-xl font-black text-purple-400 mt-0.5">
                {stats.directCount}{' '}
                <span className="text-xs text-slate-400 font-normal">Directs</span>
              </p>
              <div className="text-[10px] text-slate-400 mt-1">
                Team BV: <span className="font-bold text-slate-200">{stats.totalTeamBv.toLocaleString('en-IN')} BV</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Leg Filter Tabs */}
          <div className="flex items-center space-x-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 overflow-x-auto text-xs">
            <button
              onClick={() => {
                setLegFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                legFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              All Network (সবাই)
            </button>
            <button
              onClick={() => {
                setLegFilter('left');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                legFilter === 'left'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Group 1 (Left Leg)
            </button>
            <button
              onClick={() => {
                setLegFilter('right');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                legFilter === 'right'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Group 2 (Right Leg)
            </button>
            <button
              onClick={() => {
                setLegFilter('direct');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                legFilter === 'direct'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Direct Sponsored
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by ID, Name or Mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
            >
              Search
            </button>
            {(searchTerm || legFilter !== 'all' || kycFilter !== 'all') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                title="Reset Filters"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

        {/* Second Row: KYC status & Page Size */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>KYC Status:</span>
            <select
              value={kycFilter}
              onChange={(e) => {
                setKycFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span>Show per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Network Members Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading network members directory...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 space-y-2">
            <p className="text-sm font-semibold">{error}</p>
            <button
              onClick={fetchNetworkMembers}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Retry Loading
            </button>
          </div>
        ) : members.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No network members found</p>
            <p className="text-xs text-slate-500">Try adjusting your search query or leg filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-700/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Member ID & Name</th>
                  <th className="py-3.5 px-3">Position / Leg</th>
                  <th className="py-3.5 px-3">Rank Milestone</th>
                  <th className="py-3.5 px-3">Sponsor (Senior)</th>
                  <th className="py-3.5 px-3 text-right">Personal BV</th>
                  <th className="py-3.5 px-3 text-right">Team BV</th>
                  <th className="py-3.5 px-3 text-center">KYC Status</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {members.map((member) => {
                  const isDirect = member.sponsorId.toLowerCase() === currentUser?.id.toLowerCase();
                  const isSelf = member.id.toLowerCase() === currentUser?.id.toLowerCase();

                  return (
                    <tr
                      key={member.id}
                      className={`hover:bg-slate-800/40 transition ${
                        isSelf ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      {/* ID & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className="w-8 h-8 rounded-lg object-cover bg-slate-800 border border-slate-700 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-white truncate max-w-[150px]">
                                {member.name}
                              </span>
                              {isSelf && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                                  YOU
                                </span>
                              )}
                              {isDirect && !isSelf && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">
                                  DIRECT
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-amber-400 font-medium">
                              {member.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Leg / Group */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {member.leg === 'root' ? (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold text-[10px] border border-slate-700">
                            Root Leader
                          </span>
                        ) : member.leg === 'left' ? (
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 font-bold text-[10px] border border-blue-500/30 flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            Group 1 (Left)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-bold text-[10px] border border-amber-500/30 flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            Group 2 (Right)
                          </span>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Level {member.level} in tree
                        </div>
                      </td>

                      {/* Rank */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-semibold text-[11px]">
                          {member.currentRankName}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Rank {member.currentRankId}
                        </div>
                      </td>

                      {/* Sponsor */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <p className="text-slate-200 font-medium truncate max-w-[130px]">
                          {member.sponsorName}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">{member.sponsorId}</p>
                      </td>

                      {/* Personal BV */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap font-medium text-slate-200">
                        {member.personalBv.toLocaleString('en-IN')} BV
                      </td>

                      {/* Team BV */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap font-bold text-amber-400">
                        {member.totalTeamBv.toLocaleString('en-IN')} BV
                      </td>

                      {/* KYC Status */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            member.kycStatus === 'verified'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {member.kycStatus === 'verified' ? '✓ Verified' : 'Pending'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {onNavigateToTree && (
                          <button
                            onClick={() => onNavigateToTree(member.id)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-semibold transition hover:text-amber-400"
                            title="Inspect in Binary Tree"
                          >
                            <GitFork className="w-3 h-3" />
                            <span>View Tree</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Section: Next Page, Previous Page, Page Numbers */}
        <div className="p-4 bg-slate-800/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 text-center sm:text-left">
            Showing <span className="font-bold text-white">{members.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
            <span className="font-bold text-white">
              {Math.min(currentPage * pageSize, totalCount)}
            </span>{' '}
            of <span className="font-bold text-amber-400">{totalCount}</span> Network Members
          </div>

          {/* Next Page & Previous Page Navigation Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={!hasPrevPage}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                hasPrevPage
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 cursor-pointer shadow-sm'
                  : 'bg-slate-900/50 text-slate-600 border border-slate-800 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Page (পূর্ববর্তী)</span>
            </button>

            {/* Current Page Badge */}
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs">
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={!hasNextPage}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl font-bold transition text-xs ${
                hasNextPage
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer'
                  : 'bg-slate-900/50 text-slate-600 border border-slate-800 cursor-not-allowed'
              }`}
            >
              <span>Next Page (পরবর্তী পাতা)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
