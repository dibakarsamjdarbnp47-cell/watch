import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { BinaryTreeNodeDTO } from '../../server/binaryTreeEngine.js';
import {
  GitFork,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  UserCheck,
  Award,
  Users,
  ChevronDown,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Info,
} from 'lucide-react';

interface BinaryTreeVisualizerProps {
  onNavigateToAllNetwork?: () => void;
  onNavigateToAccount?: () => void;
}

export const BinaryTreeVisualizer: React.FC<BinaryTreeVisualizerProps> = ({
  onNavigateToAllNetwork,
  onNavigateToAccount,
}) => {
  const { currentUser, users } = useAuth();
  const [rootId, setRootId] = useState<string>(currentUser?.id || 'WDH-100001');
  const [treeData, setTreeData] = useState<BinaryTreeNodeDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<BinaryTreeNodeDTO | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);

  const fetchTree = (id: string) => {
    setLoading(true);
    fetch(`/api/binary-tree/${id}?depth=4`)
      .then((res) => res.json())
      .then((data) => {
        setTreeData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch binary tree:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (rootId) {
      fetchTree(rootId);
    }
  }, [rootId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const matched = users.find(
      (u) =>
        u.id.toLowerCase() === searchTerm.trim().toLowerCase() ||
        u.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );

    if (matched) {
      setRootId(matched.id);
    } else {
      alert(`No member found matching "${searchTerm}".`);
    }
  };

  const renderNode = (node: BinaryTreeNodeDTO | null, positionLabel?: string) => {
    if (!node) {
      return (
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/60 border-2 border-dashed border-slate-800 w-36 h-28 text-slate-400 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">{positionLabel || 'Vacant'}</span>
          <span className="text-xs text-slate-400 mt-1">Open Placement Slot</span>
        </div>
      );
    }

    const isRoot = node.id === rootId;

    return (
      <div className="flex flex-col items-center">
        {/* Node Card */}
        <div
          onClick={() => setSelectedNode(node)}
          className={`relative p-3.5 rounded-2xl cursor-pointer transition-all duration-200 w-44 text-left shadow-lg border ${
            isRoot
              ? 'bg-gradient-to-br from-amber-500/20 to-slate-900 border-amber-400/80 shadow-amber-500/10'
              : 'bg-slate-900 border-slate-700/80 hover:border-amber-400 hover:scale-105'
          }`}
        >
          {/* Top Pill */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono font-bold text-amber-400">{node.id}</span>
            <span className="text-[8px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
              {node.rankName}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <img
              src={node.avatarUrl}
              alt=""
              className="w-8 h-8 rounded-lg object-cover bg-slate-800 border border-slate-600"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate">{node.name}</h4>
              <p className="text-[9px] text-slate-400 truncate">Sponsor: {node.sponsorName.split(' ')[0]}</p>
            </div>
          </div>

          {/* BV & Team stats */}
          <div className="grid grid-cols-2 gap-1 mt-2 pt-2 border-t border-slate-800 text-[9px]">
            <div className="bg-emerald-500/10 p-1 rounded text-emerald-300">
              <span className="block text-[8px] text-slate-400">Left BV</span>
              <strong>{node.group1Bv.toLocaleString('en-IN')}</strong>
            </div>
            <div className="bg-blue-500/10 p-1 rounded text-blue-300">
              <span className="block text-[8px] text-slate-400">Right BV</span>
              <strong>{node.group2Bv.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* Drill-down button */}
          {!isRoot && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRootId(node.id);
              }}
              className="w-full mt-2 py-1 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-lg text-[9px] font-bold transition text-center"
            >
              Drill Down Tree ↓
            </button>
          )}
        </div>

        {/* Child Subtree Connections */}
        {(node.left || node.right) && (
          <div className="flex flex-col items-center mt-3 w-full">
            {/* Connecting Vertical Line */}
            <div className="w-0.5 h-4 bg-slate-700" />

            {/* Connecting Horizontal Line */}
            <div className="w-48 h-0.5 bg-slate-700" />

            {/* Two Branches */}
            <div className="flex items-start justify-between w-full space-x-6 mt-2">
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-3 bg-slate-700" />
                {renderNode(node.left, 'Left Slot')}
              </div>
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-3 bg-slate-700" />
                {renderNode(node.right, 'Right Slot')}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <GitFork className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">Binary Genealogy Tree</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual dual-leg network structure with real-time Left/Right volume calculation & drill-down capabilities.
          </p>
        </div>

        {/* Tree Search & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Member ID / Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </form>

          {/* Reset to my ID */}
          <button
            onClick={() => setRootId(currentUser?.id || 'WDH-100001')}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs text-slate-200 font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>My Root</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-2 text-slate-400">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.3, z + 0.1))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick link to All Network Table */}
          {onNavigateToAllNetwork && (
            <button
              onClick={onNavigateToAllNetwork}
              className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-bold transition"
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Network Directory (অল নেটওয়ার্ক)</span>
            </button>
          )}

          {/* Quick link to Account */}
          {onNavigateToAccount && (
            <button
              onClick={onNavigateToAccount}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs text-amber-300 font-bold transition"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Account (অ্যাকাউন্ট)</span>
            </button>
          )}
        </div>
      </div>

      {/* Dual Leg Volume Summary Card */}
      {treeData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Left Leg (Group 1)
            </span>
            <h3 className="text-xl font-black text-white mt-1">
              {treeData.group1Bv.toLocaleString('en-IN')} <span className="text-xs text-emerald-300">BV</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">Total Team: {treeData.leftCount} Members</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
              Right Leg (Group 2)
            </span>
            <h3 className="text-xl font-black text-white mt-1">
              {treeData.group2Bv.toLocaleString('en-IN')} <span className="text-xs text-blue-300">BV</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">Total Team: {treeData.rightCount} Members</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Binary Matching Payout (10%)
            </span>
            <h3 className="text-xl font-black text-amber-400 mt-1">
              ₹{(Math.min(treeData.group1Bv, treeData.group2Bv) * 0.1).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Weaker Leg Base: {Math.min(treeData.group1Bv, treeData.group2Bv).toLocaleString('en-IN')} BV
            </p>
          </div>
        </div>
      )}

      {/* Graphical Tree Canvas Viewport */}
      <div className="p-8 rounded-3xl bg-slate-950 border border-slate-850 shadow-2xl overflow-x-auto min-h-[500px] flex items-center justify-center">
        {loading ? (
          <div className="text-center space-y-3 py-16">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Generating Binary Genealogy Hierarchy...</p>
          </div>
        ) : treeData ? (
          <div
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
            className="transition-transform duration-200 py-6"
          >
            {renderNode(treeData)}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No binary tree data found.</p>
        )}
      </div>

      {/* Selected Node Details Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <img src={selectedNode.avatarUrl} alt="" className="w-10 h-10 rounded-xl" />
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedNode.name}</h3>
                  <p className="text-xs text-amber-400 font-mono">{selectedNode.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-slate-400 text-[10px]">Recognition Rank</span>
                <p className="font-bold text-amber-400">{selectedNode.rankName}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-slate-400 text-[10px]">KYC Status</span>
                <p className="font-bold text-emerald-400 capitalize">{selectedNode.kycStatus}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-slate-400 text-[10px]">Group 1 (Left Leg) BV</span>
                <p className="font-bold text-white">{selectedNode.group1Bv.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-slate-400 text-[10px]">Group 2 (Right Leg) BV</span>
                <p className="font-bold text-white">{selectedNode.group2Bv.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-slate-400 text-[10px]">Total Team Members</span>
                <p className="font-bold text-white">{selectedNode.leftCount + selectedNode.rightCount}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-slate-400 text-[10px]">Direct Sponsors</span>
                <p className="font-bold text-white">{selectedNode.directCount}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => {
                  setRootId(selectedNode.id);
                  setSelectedNode(null);
                }}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition"
              >
                Set as Tree Root
              </button>
              <button
                onClick={() => setSelectedNode(null)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
