import React, { useState, useEffect, useRef } from 'react';
import {
  PlaySquare,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Upload,
  Plus,
  Trash2,
  X,
  Video as VideoIcon,
  Film,
  Heart,
  Share2,
  Download,
  Eye,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FrontpageVideoProps {
  onStartEarningClick?: () => void;
}

export interface VideoItem {
  id: string | number;
  title: string;
  category: string;
  duration: string;
  views: number;
  likes: number;
  speaker: string;
  thumbnail: string;
  desc: string;
  videoUrl?: string;
  isUserUploaded?: boolean;
}

// Parse video URLs to determine embedding strategy
export function parseVideoEmbed(url?: string): {
  type: 'youtube' | 'vimeo' | 'html5' | 'none';
  embedUrl?: string;
  sourceUrl?: string;
} {
  if (!url) return { type: 'none' };
  const trimmed = url.trim();

  // YouTube match
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`,
      sourceUrl: trimmed,
    };
  }

  // Vimeo match
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
      sourceUrl: trimmed,
    };
  }

  // HTML5 video (blob, data:, mp4, webm, ogg, or general http video URL)
  return {
    type: 'html5',
    sourceUrl: trimmed,
  };
}

// Extract YouTube ID for auto thumbnail
export function getYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i
  );
  return match ? match[1] : null;
}

const DEFAULT_VIDEOS: VideoItem[] = [
  {
    id: 1,
    title: 'Full Business Plan 2026: Dual-Engine Direct Selling Concept',
    category: 'Corporate Film',
    duration: '12:40',
    views: 148200,
    likes: 4820,
    speaker: 'National Leadership Council',
    thumbnail: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    desc: 'Comprehensive breakdown of 18 recognition ranks, dual-leg binary matching, and 100% free registration framework.',
  },
  {
    id: 2,
    title: 'How Daily Video Ad Tasks & AdMob Verification Work',
    category: 'Task Tutorial',
    duration: '06:15',
    views: 92400,
    likes: 3190,
    speaker: 'Tech Operations Head',
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    desc: 'Step-by-step walkthrough of playing verified sponsored videos, anti-fraud captcha verification, and instant wallet credits.',
  },
  {
    id: 3,
    title: '13 Luxury Tours & Dubai Mega Conclave Highlights',
    category: 'Tour Showcase',
    duration: '09:50',
    views: 64100,
    likes: 2950,
    speaker: 'Events & Travel Desk',
    thumbnail: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    desc: 'Exclusive coverage of our 850+ Diamond leaders celebrating at Dubai Burj Khalifa and desert safari.',
  },
  {
    id: 4,
    title: 'Nominee Family Safeguard & Social Security Charter',
    category: 'Legal & Welfare',
    duration: '05:20',
    views: 41800,
    likes: 1890,
    speaker: 'Legal Advisory Board',
    thumbnail: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    desc: 'How the ₹25,000/month lifelong family financial protection is executed for qualifying active rank leaders.',
  },
];

export const FrontpageVideo: React.FC<FrontpageVideoProps> = ({ onStartEarningClick }) => {
  // Live Demo Player State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progressSeconds, setProgressSeconds] = useState<number>(0);
  const totalTaskSeconds = 15; // fast 15-second demo on frontpage
  const [taskCompleted, setTaskCompleted] = useState<boolean>(false);
  const [demoEarnings, setDemoEarnings] = useState<number>(0);

  // Video Library State with LocalStorage
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem('wv_uploaded_videos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_VIDEOS;
  });

  const [selectedVideo, setSelectedVideo] = useState<VideoItem>(videos[0]);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<string | number, boolean>>({});

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Plan Presentation');
  const [uploadDuration, setUploadDuration] = useState('08:30');
  const [uploadSpeaker, setUploadSpeaker] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadVideoUrl, setUploadVideoUrl] = useState('');
  const [uploadThumbnail, setUploadThumbnail] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  const demoPlayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('wv_uploaded_videos', JSON.stringify(videos));
    } catch {
      // storage quota
    }
  }, [videos]);

  // Demo task progress timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && progressSeconds < totalTaskSeconds) {
      interval = setInterval(() => {
        setProgressSeconds((prev) => {
          if (prev + 1 >= totalTaskSeconds) {
            setIsPlaying(false);
            setTaskCompleted(true);
            setDemoEarnings((e) => e + 25);
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.65 },
            });
            return totalTaskSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, progressSeconds]);

  const handleResetDemo = () => {
    setIsPlaying(false);
    setProgressSeconds(0);
    setTaskCompleted(false);
  };

  // When viewer clicks on a video in the playlist
  const handleWatchVideo = (vid: VideoItem) => {
    // Increment view count
    const updatedVideos = videos.map((v) =>
      v.id === vid.id ? { ...v, views: (Number(v.views) || 0) + 1 } : v
    );
    setVideos(updatedVideos);

    const activeItem = { ...vid, views: (Number(vid.views) || 0) + 1 };
    setSelectedVideo(activeItem);
    setVideoModalOpen(true);
  };

  // Like video handler
  const handleToggleLike = (vidId: string | number) => {
    const isCurrentlyLiked = !!likedMap[vidId];
    setLikedMap((prev) => ({ ...prev, [vidId]: !isCurrentlyLiked }));

    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === vidId) {
          const newLikes = isCurrentlyLiked ? Math.max(0, (v.likes || 0) - 1) : (v.likes || 0) + 1;
          return { ...v, likes: newLikes };
        }
        return v;
      })
    );

    setSelectedVideo((prev) => {
      if (prev.id === vidId) {
        const newLikes = isCurrentlyLiked ? Math.max(0, (prev.likes || 0) - 1) : (prev.likes || 0) + 1;
        return { ...prev, likes: newLikes };
      }
      return prev;
    });

    if (!isCurrentlyLiked) {
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.7 } });
    }
  };

  // Copy video link
  const handleCopyLink = (vid: VideoItem) => {
    const urlToCopy = vid.videoUrl || window.location.href;
    navigator.clipboard.writeText(urlToCopy);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Load this video into the top Live Earning Task Demonstrator
  const handleLoadInDemoPlayer = (vid: VideoItem) => {
    setSelectedVideo(vid);
    setVideoModalOpen(false);
    handleResetDemo();
    setIsPlaying(true);
    demoPlayerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Handle Video File Upload
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setUploadError('File is larger than 50MB. Please use an MP4 file under 50MB or paste a YouTube / MP4 video link.');
        return;
      }
      setUploadFileName(file.name);
      setIsProcessingUpload(true);

      // If small file (< 10MB), read as base64 DataURL for permanent persistence
      if (file.size <= 10 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setUploadVideoUrl(reader.result);
            setIsProcessingUpload(false);
          }
        };
        reader.onerror = () => {
          const objectUrl = URL.createObjectURL(file);
          setUploadVideoUrl(objectUrl);
          setIsProcessingUpload(false);
        };
        reader.readAsDataURL(file);
      } else {
        // For larger files, create object URL
        const objectUrl = URL.createObjectURL(file);
        setUploadVideoUrl(objectUrl);
        setIsProcessingUpload(false);
      }
    }
  };

  // Auto-detect YouTube thumbnail when URL is typed
  const handleUrlChange = (val: string) => {
    setUploadVideoUrl(val);
    setUploadFileName('');
    const ytId = getYoutubeId(val);
    if (ytId && !uploadThumbnail) {
      setUploadThumbnail(`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`);
    }
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      setUploadError('Please enter a video title.');
      return;
    }

    const defaultThumbs = [
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
    ];

    let thumb = uploadThumbnail.trim();
    if (!thumb) {
      const ytId = getYoutubeId(uploadVideoUrl);
      if (ytId) {
        thumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      } else {
        thumb = defaultThumbs[Math.floor(Math.random() * defaultThumbs.length)];
      }
    }

    // Default fallback video URL if none provided
    const finalVideoUrl =
      uploadVideoUrl.trim() ||
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

    const newVideo: VideoItem = {
      id: `vid-${Date.now()}`,
      title: uploadTitle.trim(),
      category: uploadCategory,
      duration: uploadDuration.trim() || '05:00',
      views: 1, // first view is creator
      likes: 1,
      speaker: uploadSpeaker.trim() || 'Distributor Leader',
      thumbnail: thumb,
      desc: uploadDesc.trim() || 'Direct selling business presentation and leadership training module.',
      videoUrl: finalVideoUrl,
      isUserUploaded: true,
    };

    setVideos((prev) => [newVideo, ...prev]);
    setSelectedVideo(newVideo);
    setIsUploadModalOpen(false);

    // Reset upload form
    setUploadTitle('');
    setUploadSpeaker('');
    setUploadDesc('');
    setUploadVideoUrl('');
    setUploadThumbnail('');
    setUploadFileName('');
    setUploadError('');

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 },
    });

    // Automatically open modal so viewers/creator can watch immediately!
    setTimeout(() => {
      setVideoModalOpen(true);
    }, 400);
  };

  const handleDeleteVideo = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this video?')) {
      const remaining = videos.filter((v) => v.id !== id);
      setVideos(remaining);
      if (selectedVideo.id === id && remaining.length > 0) {
        setSelectedVideo(remaining[0]);
      }
    }
  };

  const embedInfo = parseVideoEmbed(selectedVideo.videoUrl);

  return (
    <section id="video" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-slate-900/30 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[300px] bg-amber-500/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <PlaySquare className="w-4 h-4" />
            <span>Digital Video Utility Engine & Training Hub</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Watch Videos, Understand the Vision, Earn Daily
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Direct sellers and visitors earn daily cash credits simply by viewing verified brand campaigns, product demonstrations, and leadership presentations. Upload your own video to share with your team!
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition transform hover:-translate-y-0.5"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Video (ভিডিও আপলোড করুন)</span>
            </button>
            <button
              onClick={() => handleWatchVideo(videos[0])}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs transition"
            >
              <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>Watch Featured Video (ভিডিও দেখুন)</span>
            </button>
          </div>
        </div>

        {/* INTERACTIVE LIVE VIDEO TASK DEMONSTRATOR */}
        <div
          ref={demoPlayerRef}
          className="max-w-4xl mx-auto rounded-3xl bg-slate-950 border-2 border-amber-500/30 overflow-hidden shadow-2xl transition-all"
        >
          {/* Top Bar */}
          <div className="bg-slate-900/95 px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono font-bold text-slate-200 truncate max-w-xs sm:max-w-md">
                LIVE TASK DEMO: {selectedVideo.title}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                Reward: ₹25.00 INR
              </span>
              {demoEarnings > 0 && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30">
                  Earned: +₹{demoEarnings}
                </span>
              )}
            </div>
          </div>

          {/* Video Player Display Container */}
          <div className="relative aspect-video w-full bg-slate-950 flex flex-col items-center justify-center text-center overflow-hidden">
            {isPlaying && selectedVideo.videoUrl ? (
              embedInfo.type === 'youtube' && embedInfo.embedUrl ? (
                <iframe
                  src={embedInfo.embedUrl}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={embedInfo.sourceUrl || selectedVideo.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
              )
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={selectedVideo.thumbnail}
                  alt={selectedVideo.title}
                  className="w-full h-full object-cover filter brightness-[0.45]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col items-center justify-center p-6 text-center">
                  <div className="max-w-lg space-y-3">
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500 hover:bg-amber-400 border-2 border-amber-300 flex items-center justify-center mx-auto text-slate-950 shadow-2xl transition transform hover:scale-105"
                    >
                      <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
                    </button>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                        {selectedVideo.category} • {selectedVideo.speaker}
                      </span>
                      <h3 className="text-base sm:text-xl font-black text-white mt-1 line-clamp-2">
                        {selectedVideo.title}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        Watch for {totalTaskSeconds} seconds to trigger automated payout credit demo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress & Countdown Controls */}
          <div className="bg-slate-900/95 p-5 sm:p-6 space-y-4 border-t border-slate-800">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">
                  Task Verification Time: {progressSeconds}s / {totalTaskSeconds}s
                </span>
                <span className="text-amber-400 font-bold">
                  {Math.round((progressSeconds / totalTaskSeconds) * 100)}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${(progressSeconds / totalTaskSeconds) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {!taskCompleted ? (
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause Watching</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>
                        {progressSeconds > 0
                          ? `Resume Watching (${totalTaskSeconds - progressSeconds}s remaining)`
                          : `Start Watching (${totalTaskSeconds}s demo)`}
                      </span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-3 animate-in fade-in zoom-in">
                  <span className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/40 shadow-lg">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Demo Task Verified! +₹25 Credited to Simulator</span>
                  </span>
                  <button
                    onClick={handleResetDemo}
                    className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Watch Again</span>
                  </button>
                </div>
              )}

              <button
                onClick={() => setVideoModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
              >
                <PlaySquare className="w-4 h-4 text-amber-400" />
                <span>Open in Theater Mode (পূর্ণ পর্দায় দেখুন)</span>
              </button>
            </div>
          </div>

          {/* Player Bottom Bar */}
          <div className="bg-slate-900/90 px-6 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-4 text-slate-400">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Bot Detection</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Instant Wallet Credit</span>
              </span>
            </div>

            <button
              onClick={onStartEarningClick}
              className="flex items-center space-x-1 text-amber-400 hover:text-amber-300 font-bold underline"
            >
              <span>Activate Real Daily Task Wallet in ERP</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>

        {/* CORPORATE & UPLOADED VIDEO PLAYLIST */}
        <div className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <span>Official Video Presentations & Training</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold border border-amber-500/30">
                  {videos.length} Videos Available
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Click on any video below to watch instantly in HD with sound & playback controls.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add / Upload Video</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {videos.map((vid) => (
              <div
                key={vid.id}
                onClick={() => handleWatchVideo(vid)}
                className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group relative shadow-lg ${
                  selectedVideo.id === vid.id
                    ? 'bg-slate-900 border-amber-500 shadow-amber-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/50 hover:bg-slate-900'
                }`}
              >
                <div className="space-y-3">
                  {/* Thumbnail with Click to Watch overlay */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950">
                    <img
                      src={vid.thumbnail}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xl group-hover:scale-110 transition">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/90 text-[10px] font-mono text-white font-bold">
                      {vid.duration}
                    </span>
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-amber-500 text-[10px] font-bold text-slate-950 shadow">
                      {vid.category}
                    </span>

                    {/* Badge showing click to watch */}
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-emerald-500/90 text-[10px] font-bold text-slate-950 opacity-0 group-hover:opacity-100 transition shadow">
                      ▶ Click to Watch
                    </span>

                    {vid.isUserUploaded && (
                      <button
                        onClick={(e) => handleDeleteVideo(vid.id, e)}
                        title="Delete video"
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-950/90 hover:bg-red-900 border border-red-800 text-red-300 flex items-center justify-center transition z-10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-amber-400 transition leading-snug">
                    {vid.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {vid.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[120px]">{vid.speaker}</span>
                  <div className="flex items-center space-x-2 font-mono text-slate-400 shrink-0">
                    <span className="flex items-center space-x-1">
                      <Eye className="w-3 h-3 text-amber-400" />
                      <span>{Number(vid.views).toLocaleString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Heart className="w-3 h-3 text-rose-400" />
                      <span>{Number(vid.likes || 0).toLocaleString()}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2">
                  <div className="w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold text-center border border-amber-500/30 group-hover:border-amber-400 transition flex items-center justify-center space-x-1.5">
                    <Play className="w-3 h-3 fill-current" />
                    <span>Watch Now (এখন দেখুন)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FULL HD THEATER VIDEO PLAYER MODAL */}
        {videoModalOpen && selectedVideo && (
          <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
            <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
              {/* Header */}
              <div className="bg-slate-950/90 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5 truncate">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                    <Film className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h3 className="text-sm font-bold text-white truncate">{selectedVideo.title}</h3>
                    <p className="text-[11px] text-slate-400 truncate">
                      {selectedVideo.category} • Speaker: {selectedVideo.speaker}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setVideoModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white flex items-center justify-center transition shrink-0 ml-3"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Player Canvas */}
              <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
                {embedInfo.type === 'youtube' && embedInfo.embedUrl ? (
                  <iframe
                    src={embedInfo.embedUrl}
                    title={selectedVideo.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : embedInfo.type === 'vimeo' && embedInfo.embedUrl ? (
                  <iframe
                    src={embedInfo.embedUrl}
                    title={selectedVideo.title}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={embedInfo.sourceUrl || selectedVideo.videoUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain bg-black"
                  />
                )}
              </div>

              {/* Video Meta, Engagement & Action Bar */}
              <div className="p-6 space-y-4 overflow-y-auto bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-white">{selectedVideo.title}</h3>
                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <span className="flex items-center space-x-1 font-mono text-amber-400 font-bold">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{Number(selectedVideo.views).toLocaleString()} views</span>
                      </span>
                      <span>•</span>
                      <span className="font-mono">Length: {selectedVideo.duration}</span>
                      <span>•</span>
                      <span className="text-slate-300 font-medium">By {selectedVideo.speaker}</span>
                    </div>
                  </div>

                  {/* Actions: Like, Share, Demo Earning */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleToggleLike(selectedVideo.id)}
                      className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                        likedMap[selectedVideo.id]
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          likedMap[selectedVideo.id] ? 'fill-current text-rose-400' : ''
                        }`}
                      />
                      <span>{Number(selectedVideo.likes || 0).toLocaleString()}</span>
                    </button>

                    <button
                      onClick={() => handleCopyLink(selectedVideo)}
                      className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-bold transition"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400">Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4" />
                          <span>Share</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleLoadInDemoPlayer(selectedVideo)}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-md shadow-amber-500/20"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Test Earn ₹25 with this Video</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Video Overview</span>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                    {selectedVideo.desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* UPLOAD / ADD VIDEO MODAL */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="relative max-w-lg w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <VideoIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Upload / Add Video (ভিডিও যোগ করুন)</h3>
                    <p className="text-xs text-slate-400">
                      Upload from device or paste YouTube / MP4 stream link
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveVideo} className="space-y-4">
                {uploadError && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs font-medium">
                    {uploadError}
                  </div>
                )}

                {/* File Upload or Video Link */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">
                    Choose Video File or Enter Video Link
                  </label>

                  <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl p-4 text-center cursor-pointer bg-slate-950/60 transition">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime"
                      onChange={handleVideoFileChange}
                      className="hidden"
                      id="video-file-input"
                    />
                    <label htmlFor="video-file-input" className="cursor-pointer space-y-2 block">
                      <Film className="w-8 h-8 mx-auto text-amber-400/80" />
                      <div className="text-xs text-slate-300 font-medium">
                        {isProcessingUpload ? (
                          <span className="text-amber-400 font-bold">Processing video file...</span>
                        ) : uploadFileName ? (
                          <span className="text-emerald-400 font-bold">{uploadFileName} (Ready to Play)</span>
                        ) : (
                          <span>Click to browse video file from device</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">Supports MP4, WebM (under 50MB)</p>
                    </label>
                  </div>

                  <div className="space-y-1 pt-1">
                    <input
                      type="text"
                      placeholder="Or enter Video URL (YouTube, Vimeo, MP4 link)"
                      value={uploadVideoUrl.startsWith('data:') || uploadVideoUrl.startsWith('blob:') ? '' : uploadVideoUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                    />

                    {/* Quick sample insertion buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-500">Quick Test:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadTitle('2026 Direct Selling Leadership Conclave');
                          handleUrlChange('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
                          setUploadSpeaker('Council Leader');
                          setUploadCategory('Corporate Film');
                        }}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition"
                      >
                        Sample YouTube
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadTitle('Daily Ad Task Verification Tutorial');
                          handleUrlChange('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
                          setUploadSpeaker('Tech Desk');
                          setUploadCategory('Task Tutorial');
                        }}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition"
                      >
                        Sample MP4
                      </button>
                    </div>
                  </div>
                </div>

                {/* Video Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Video Title (ভিডিও শিরোনাম)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026 Leadership Training & Dual-Leg Matching"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Category & Duration */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Category</label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                    >
                      <option value="Corporate Film">Corporate Film</option>
                      <option value="Task Tutorial">Task Tutorial</option>
                      <option value="Plan Presentation">Plan Presentation</option>
                      <option value="Tour Showcase">Tour Showcase</option>
                      <option value="Leader Speech">Leader Speech</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 08:30"
                      value={uploadDuration}
                      onChange={(e) => setUploadDuration(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Speaker & Custom Thumbnail */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Speaker / Presenter</label>
                  <input
                    type="text"
                    placeholder="e.g. Top Achiever, Training Council"
                    value={uploadSpeaker}
                    onChange={(e) => setUploadSpeaker(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Thumbnail Image URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="Auto-detected from YouTube or paste image link"
                    value={uploadThumbnail}
                    onChange={(e) => setUploadThumbnail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                  />
                  {uploadThumbnail && (
                    <div className="mt-1.5 h-16 w-28 rounded-lg overflow-hidden border border-slate-800">
                      <img src={uploadThumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Description / Highlights</label>
                  <textarea
                    rows={2}
                    placeholder="Key highlights and notes of this presentation..."
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-lg shadow-amber-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Upload & Watch Now (ভিডিও আপলোড ও দেখুন)</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
