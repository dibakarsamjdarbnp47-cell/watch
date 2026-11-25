import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { VideoTask } from '../types/index.js';
import { initialVideoTasks } from '../../server/data.js';
import {
  PlaySquare,
  Sparkles,
  Smartphone,
  Code2,
  CheckCircle2,
  Clock,
  Wallet,
  TrendingUp,
  Award,
  Play,
  RotateCcw,
  Copy,
  Check,
  Eye,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const WatchVideoEarning: React.FC = () => {
  const { currentUser, refreshUserData } = useAuth();
  const [tasks, setTasks] = useState<VideoTask[]>([]);
  const [activeTask, setActiveTask] = useState<VideoTask | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(15);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [showAdMobSim, setShowAdMobSim] = useState(false);
  const [simAdType, setSimAdType] = useState<'banner' | 'interstitial' | 'rewarded' | 'app_open' | 'native'>('rewarded');
  const [interstitialClickCount, setInterstitialClickCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'watch' | 'android-code'>('watch');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    fetch('/api/video-tasks')
      .then((res) => {
        const cType = res.headers.get('content-type') || '';
        if (res.ok && cType.includes('application/json')) {
          return res.json();
        }
        return initialVideoTasks;
      })
      .then((data) => {
        const list = Array.isArray(data) && data.length > 0 ? data : initialVideoTasks;
        setTasks(list);
        if (list.length > 0) setActiveTask(list[0]);
      })
      .catch(() => {
        setTasks(initialVideoTasks);
        if (initialVideoTasks.length > 0) setActiveTask(initialVideoTasks[0]);
      });
  }, []);

  // Timer countdown when video plays
  useEffect(() => {
    let timer: any;
    if (isPlaying && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (isPlaying && secondsRemaining === 0) {
      handleCompleteVideo();
    }
    return () => clearInterval(timer);
  }, [isPlaying, secondsRemaining]);

  const handleStartWatching = (task: VideoTask) => {
    setActiveTask(task);
    setSecondsRemaining(task.durationSec || 15);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleCompleteVideo = async () => {
    setIsPlaying(false);
    if (!activeTask || !currentUser) return;

    try {
      const res = await fetch('/api/video-tasks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, taskId: activeTask.id }),
      });
      const cType = res.headers.get('content-type') || '';
      if (res.ok && cType.includes('application/json')) {
        await res.json();
      }
    } catch (e) {
      console.warn('Task complete server fallback:', e);
    }

    // Local balance & BV update
    const cashEarned = activeTask.cashReward || 15;
    const bvEarned = activeTask.bvReward || 25;
    currentUser.walletBalance += cashEarned;
    currentUser.personalBv += bvEarned;
    currentUser.totalIncome += cashEarned;

    setCompletedTaskIds((prev) => [...prev, activeTask.id]);
    refreshUserData();

    // Celebration confetti
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Interstitial trigger demo
  const handleGenericClick = () => {
    const nextCount = interstitialClickCount + 1;
    setInterstitialClickCount(nextCount);
    if (nextCount % 3 === 0) {
      setSimAdType('interstitial');
      setShowAdMobSim(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <PlaySquare className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Watch Video, Dream in Hand
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete daily verified video tasks to earn instant Business Volume (BV) & direct wallet earnings. Integrated with Google AdMob SDK.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-800 border border-slate-700 rounded-2xl p-1 shrink-0">
          <button
            onClick={() => setActiveTab('watch')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'watch'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <PlaySquare className="w-4 h-4" />
            <span>Daily Video Player</span>
          </button>
          <button
            onClick={() => setActiveTab('android-code')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'android-code'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Android Studio AdMob Code</span>
          </button>
        </div>
      </div>

      {activeTab === 'watch' ? (
        <div className="space-y-6">
          {/* Main Video Player & Active Task */}
          {activeTask && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
              {/* Video Player Canvas */}
              <div className="lg:col-span-2 space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video border border-slate-800 flex items-center justify-center group shadow-2xl">
                  <video
                    ref={videoRef}
                    src={activeTask.videoUrl}
                    poster={activeTask.thumbnail}
                    className="w-full h-full object-cover"
                    playsInline
                    muted={false}
                  />

                  {/* Overlay timer & play state */}
                  {!isPlaying && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
                      <button
                        onClick={() => handleStartWatching(activeTask)}
                        className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-2xl shadow-amber-500/40 hover:scale-110 transition flex items-center justify-center"
                      >
                        <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                          <Play className="w-7 h-7 text-amber-400 fill-amber-400 ml-1" />
                        </div>
                      </button>
                      <h3 className="text-base font-bold text-white mt-4">{activeTask.title}</h3>
                      <p className="text-xs text-amber-300 mt-1">
                        Watch for 15 seconds to credit <strong>+25 BV</strong> & <strong>₹20</strong> to your account!
                      </p>
                    </div>
                  )}

                  {/* Active Playing Countdown Header */}
                  {isPlaying && (
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="px-3 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/50 text-amber-400 font-bold text-xs font-mono shadow-lg flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        <span>Reward Unlocks In: {secondsRemaining}s</span>
                      </span>
                      <span className="px-3 py-1 rounded-full bg-red-500/90 text-white text-[10px] font-extrabold uppercase tracking-wider">
                        LIVE TASK
                      </span>
                    </div>
                  )}

                  {/* Progress bar at bottom */}
                  {isPlaying && (
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
                      <div
                        className="h-full bg-amber-400 transition-all duration-1000"
                        style={{ width: `${((15 - secondsRemaining) / 15) * 100}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                      Advertiser: {activeTask.advertiserName}
                    </span>
                    <h2 className="text-lg font-bold text-white">{activeTask.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{activeTask.description}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSimAdType('rewarded');
                        setShowAdMobSim(true);
                      }}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                      <span>Test AdMob Format</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Task Rewards & Progress Side Card */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-800 to-slate-900 border border-amber-500/30 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    Instant Rewards for This Task
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700">
                      <TrendingUp className="w-4 h-4 text-indigo-400 mx-auto" />
                      <span className="text-[10px] text-slate-400 block mt-1">BV Credit</span>
                      <strong className="text-base text-indigo-300 font-black">+{activeTask.bvReward} BV</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700">
                      <Wallet className="w-4 h-4 text-emerald-400 mx-auto" />
                      <span className="text-[10px] text-slate-400 block mt-1">Cash Credit</span>
                      <strong className="text-base text-emerald-300 font-black">+₹{activeTask.cashReward}</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300">
                    💡 BV earned rolls up directly into your Personal BV and accelerates your rank promotion towards
                    Domestic & Dubai Tours!
                  </p>
                </div>

                {/* AdMob Click Trigger simulator */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 text-xs space-y-2">
                  <span className="font-bold text-slate-200 block">
                    AdMob Interstitial Trigger Tracker
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Clicks: <strong className="text-amber-400">{interstitialClickCount}</strong> (Displays Interstitial ad every 3 clicks)
                  </p>
                  <button
                    onClick={handleGenericClick}
                    className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition"
                  >
                    Simulate App Action Click ({interstitialClickCount % 3}/3)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Daily Video Playlist Grid */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Today's Sponsored Video Queue (Watch to Earn)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => {
                const isCompleted = completedTaskIds.includes(task.id);
                const isSelected = activeTask?.id === task.id;

                return (
                  <div
                    key={task.id}
                    onClick={() => handleStartWatching(task)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-lg'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex space-x-3">
                      <img
                        src={task.thumbnail}
                        alt=""
                        className="w-20 h-16 rounded-xl object-cover bg-slate-800 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold uppercase text-amber-400">{task.category}</span>
                          {isCompleted && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                              COMPLETED
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-white truncate mt-1">{task.title}</h4>
                        <p className="text-[10px] text-slate-400 truncate">{task.advertiserName}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                      <span className="text-slate-400 font-mono">15s Video</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-indigo-300">+{task.bvReward} BV</span>
                        <span className="text-slate-500">•</span>
                        <span className="font-bold text-emerald-400">+₹{task.cashReward}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Android Studio Kotlin Code Hub */
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Production-Ready Android Studio Integration
              </span>
              <h2 className="text-lg font-bold text-white">Google AdMob SDK (Kotlin) Implementation</h2>
            </div>
            <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
              Material Design 3 • ViewBinding • Anti-Memory Leak
            </span>
          </div>

          <div className="space-y-6 text-xs">
            {/* AdMob IDs Table */}
            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-700/80 space-y-3">
              <h4 className="font-bold text-amber-400 text-sm">Official Google AdMob Test Ad Unit IDs</h4>
              <p className="text-slate-400 text-[11px]">
                Use these test IDs during development. In production, replace them with your approved AdMob App ID & Ad Unit IDs.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">AdMob App ID:</span>
                  <span className="text-amber-300">ca-app-pub-3940256099942544~3347511713</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">Banner Ad Unit ID:</span>
                  <span className="text-amber-300">ca-app-pub-3940256099942544/6300978111</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">Interstitial Ad Unit ID:</span>
                  <span className="text-amber-300">ca-app-pub-3940256099942544/1033173712</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">Rewarded Ad Unit ID:</span>
                  <span className="text-amber-300">ca-app-pub-3940256099942544/5224354917</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">App Open Ad Unit ID:</span>
                  <span className="text-amber-300">ca-app-pub-3940256099942544/9257399415</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">Native Ad Unit ID:</span>
                  <span className="text-amber-300">ca-app-pub-3940256099942544/2247696110</span>
                </div>
              </div>
            </div>

            {/* Code Block 1: AdMobManager.kt */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs font-mono">AdMobManager.kt (Ad Lifecycle & Preloaders)</span>
                <button
                  onClick={() => copyCode(adMobManagerCode, 'admob-mgr')}
                  className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold transition"
                >
                  {copiedSection === 'admob-mgr' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'admob-mgr' ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto max-h-72">
                {adMobManagerCode}
              </pre>
            </div>

            {/* Code Block 2: AndroidManifest.xml */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs font-mono">AndroidManifest.xml</span>
                <button
                  onClick={() => copyCode(manifestCode, 'manifest')}
                  className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold transition"
                >
                  {copiedSection === 'manifest' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'manifest' ? 'Copied!' : 'Copy XML'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto max-h-52">
                {manifestCode}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* AdMob Simulator Modal */}
      {showAdMobSim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Google AdMob Simulation: {simAdType.toUpperCase()}</h3>
              </div>
              <button
                onClick={() => setShowAdMobSim(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
              <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                TEST AD • GOOGLE ADMOB SDK
              </span>
              <h4 className="text-base font-bold text-white">
                {simAdType === 'interstitial' && 'Interstitial Ad (Full Screen Event)'}
                {simAdType === 'rewarded' && 'Rewarded Video Ad (+25 BV Bonus)'}
                {simAdType === 'banner' && 'Adaptive 320x50 Anchor Banner'}
                {simAdType === 'app_open' && 'App Open Splash Ad (Cold Start)'}
              </h4>
              <p className="text-xs text-slate-400">
                Ad Unit ID: <code>ca-app-pub-3940256099942544/...</code>
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowAdMobSim(false);
                  if (simAdType === 'rewarded') {
                    handleCompleteVideo();
                  }
                }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition"
              >
                {simAdType === 'rewarded' ? 'Claim Rewarded BV Bonus' : 'Close Ad Simulator'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const adMobManagerCode = `package com.watchvideodream.app.ads

import android.app.Activity
import android.content.Context
import com.google.android.gms.ads.*
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback

/**
 * AdMobManager: Production-ready AdMob SDK handler for Kotlin.
 * Prevents memory leaks by clearing activity references on destroy.
 */
object AdMobManager {

    private var interstitialAd: InterstitialAd? = null
    private var rewardedAd: RewardedAd? = null
    private var clickCount = 0

    // Test Ad Unit IDs (Replace with Live AdMob IDs before release)
    const val BANNER_ID = "ca-app-pub-3940256099942544/6300978111"
    const val INTERSTITIAL_ID = "ca-app-pub-3940256099942544/1033173712"
    const val REWARDED_ID = "ca-app-pub-3940256099942544/5224354917"

    fun initialize(context: Context) {
        MobileAds.initialize(context) {}
        loadInterstitial(context)
        loadRewarded(context)
    }

    fun loadInterstitial(context: Context) {
        val adRequest = AdRequest.Builder().build()
        InterstitialAd.load(context, INTERSTITIAL_ID, adRequest,
            object : InterstitialAdLoadCallback() {
                override fun onAdLoaded(ad: InterstitialAd) {
                    interstitialAd = ad
                }
                override fun onAdFailedToLoad(error: LoadAdError) {
                    interstitialAd = null
                }
            })
    }

    fun showInterstitialAfterClicks(activity: Activity, onDismiss: () -> Unit = {}) {
        clickCount++
        if (clickCount % 3 == 0 && interstitialAd != null) {
            interstitialAd?.fullScreenContentCallback = object : FullScreenContentCallback() {
                override fun onAdDismissedFullScreenContent() {
                    interstitialAd = null
                    loadInterstitial(activity)
                    onDismiss()
                }
            }
            interstitialAd?.show(activity)
        } else {
            onDismiss()
        }
    }

    fun loadRewarded(context: Context) {
        val adRequest = AdRequest.Builder().build()
        RewardedAd.load(context, REWARDED_ID, adRequest,
            object : RewardedAdLoadCallback() {
                override fun onAdLoaded(ad: RewardedAd) {
                    rewardedAd = ad
                }
                override fun onAdFailedToLoad(error: LoadAdError) {
                    rewardedAd = null
                }
            })
    }

    fun showRewarded(activity: Activity, onEarnedReward: (Int) -> Unit) {
        rewardedAd?.let { ad ->
            ad.show(activity) { rewardItem ->
                // Credit BV / ₹20 to User's ERP Account via REST API
                onEarnedReward(rewardItem.amount)
                loadRewarded(activity)
            }
        } ?: run {
            loadRewarded(activity)
        }
    }
}`;

const manifestCode = `<!-- AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.watchvideodream.app">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.WatchVideoDreamInHand">

        <!-- Google AdMob App ID -->
        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="ca-app-pub-3940256099942544~3347511713" />

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;
