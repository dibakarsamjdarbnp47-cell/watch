import React, { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Globe, MapPin, Calendar, Users, Maximize2, X, Sparkles, Award, Upload, Plus, Trash2, CheckCircle2, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PhotoItem {
  id: string;
  title: string;
  category: 'conclave' | 'tours' | 'awards';
  categoryLabel: string;
  image: string;
  fallback?: string;
  location: string;
  date: string;
  description: string;
  featured?: boolean;
  isUserUploaded?: boolean;
}

const DEFAULT_PHOTOS: PhotoItem[] = [
  {
    id: 'photo-1',
    title: 'Annual Direct Selling Leadership Conclave: Global Marketing & Dual-Leg Expansion',
    category: 'conclave',
    categoryLabel: 'Seminars & Conclaves',
    image: '/global-marketing-seminar.jpg',
    fallback: 'https://images.rawpixel.com/image_1300/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvay0yLWt1bmctNjg4MDctbHlqMzA3OS0yLWdsb2JhbG1hcmtldGluZ18zLmpwZw.jpg',
    location: 'Auditorium Hall, New Delhi',
    date: 'Annual Mega Meet',
    description: 'Over 2,500 national distributors and top dual-leg leaders gathered to celebrate our all-India expansion and global marketing roadmap.',
    featured: true,
  },
  {
    id: 'photo-2',
    title: 'Dubai Desert Safari & Burj Khalifa Achievers Luxury Tour',
    category: 'tours',
    categoryLabel: 'International Tours',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1000&auto=format&fit=crop&q=80',
    location: 'Dubai, United Arab Emirates',
    date: 'Rank 8 Emerald Tour',
    description: 'Emerald and Diamond leaders enjoying fixed all-expenses-paid 4 Nights / 5 Days luxury tour in Dubai.',
  },
  {
    id: 'photo-3',
    title: 'Thailand Coral & Pattaya Beach Resort Tour Qualifiers',
    category: 'tours',
    categoryLabel: 'International Tours',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80',
    location: 'Pattaya, Thailand',
    date: 'Rank 6 Coral Tour',
    description: 'Over 1,200 Rank 6 Coral achievers celebrating their maiden international flight ticket sponsored by Watch Video, Dream in Hand.',
  },
  {
    id: 'photo-4',
    title: 'Crown Diamond Trophy & Gold Pin Recognition Ceremony',
    category: 'awards',
    categoryLabel: 'Award Recognition',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000&auto=format&fit=crop&q=80',
    location: 'Vigyan Bhawan, New Delhi',
    date: 'National Awards Gala',
    description: 'Felicitation of top earners, car fund achievers, and Crown Ambassador title holders on the grand stage.',
  },
  {
    id: 'photo-5',
    title: 'Singapore Sentosa & Universal Studios Diamond Expedition',
    category: 'tours',
    categoryLabel: 'International Tours',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1000&auto=format&fit=crop&q=80',
    location: 'Sentosa Island, Singapore',
    date: 'Rank 11 Diamond Tour',
    description: 'Top Diamond leaders exploring Singapore iconic landmarks, luxury cruising, and business growth networking.',
  },
  {
    id: 'photo-6',
    title: 'Mega Youth & Women Entrepreneurship Seminar',
    category: 'conclave',
    categoryLabel: 'Seminars & Conclaves',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1000&auto=format&fit=crop&q=80',
    location: 'Kolkata Science City',
    date: 'Eastern Regional Meet',
    description: 'Over 1,800 aspiring digital distributors learning daily video task monetization and dual-leg binary mechanics.',
  },
];

export const FrontpagePhoto: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'conclave' | 'tours' | 'awards'>('all');
  const [lightboxPhoto, setLightboxPhoto] = useState<PhotoItem | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>(() => {
    try {
      const saved = localStorage.getItem('wv_uploaded_photos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_PHOTOS;
  });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'conclave' | 'tours' | 'awards'>('conclave');
  const [uploadLocation, setUploadLocation] = useState('');
  const [uploadDate, setUploadDate] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadImageData, setUploadImageData] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('wv_uploaded_photos', JSON.stringify(photos));
    } catch {
      // storage full or quota exceeded
    }
  }, [photos]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size exceeds 5MB. Please choose a smaller image.');
        return;
      }
      setUploadFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setUploadImageData(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      setUploadError('Please provide a photo title.');
      return;
    }
    if (!uploadImageData.trim()) {
      setUploadError('Please select or upload a photo image.');
      return;
    }

    const categoryLabels: Record<string, string> = {
      conclave: 'Seminars & Conclaves',
      tours: 'International Tours',
      awards: 'Award Recognition',
    };

    const newPhoto: PhotoItem = {
      id: `photo-${Date.now()}`,
      title: uploadTitle.trim(),
      category: uploadCategory,
      categoryLabel: categoryLabels[uploadCategory] || 'Event Gallery',
      image: uploadImageData,
      location: uploadLocation.trim() || 'India',
      date: uploadDate.trim() || 'Recent Event',
      description: uploadDescription.trim() || 'Distributor event photo uploaded to official portal.',
      isUserUploaded: true,
    };

    setPhotos((prev) => [newPhoto, ...prev]);
    setIsUploadModalOpen(false);
    setUploadTitle('');
    setUploadLocation('');
    setUploadDate('');
    setUploadDescription('');
    setUploadImageData('');
    setUploadFileName('');
    setUploadError('');

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.5 },
    });

    // Viewers can immediately see the uploaded photo in lightbox
    setTimeout(() => {
      setLightboxPhoto(newPhoto);
    }, 300);
  };

  const handleDeletePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this photo?')) {
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      if (lightboxPhoto?.id === id) {
        setLightboxPhoto(null);
      }
    }
  };

  const filteredPhotos = selectedFilter === 'all'
    ? photos
    : photos.filter((p) => p.category === selectedFilter);

  return (
    <section id="photo" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-slate-950 relative">
      {/* Soft background light */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[300px] bg-amber-500/5 blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <Camera className="w-4 h-4" />
            <span>Official Photo Gallery & Conclaves</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Moments of Leadership, Success & Global Travel
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Witness the real celebration of direct sellers across India. From national auditorium conclaves to Dubai desert safaris and grand diamond award nights.
          </p>

          {/* Action Row: Upload Button & Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition transform hover:-translate-y-0.5"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Photo (নতুন ছবি আপলোড)</span>
            </button>

            <div className="flex flex-wrap items-center justify-center gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
              {[
                { id: 'all', label: 'All Photos' },
                { id: 'conclave', label: 'Seminars & Conclaves' },
                { id: 'tours', label: '13 Luxury Tours' },
                { id: 'awards', label: 'Award Ceremonies' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedFilter === tab.id
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PHOTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((item) => (
            <div
              key={item.id}
              onClick={() => setLightboxPhoto(item)}
              className={`rounded-3xl overflow-hidden bg-slate-900 border transition-all duration-300 cursor-pointer group flex flex-col justify-between shadow-xl relative ${
                item.featured
                  ? 'border-amber-500/40 md:col-span-2 lg:col-span-2 shadow-amber-500/10'
                  : 'border-slate-800 hover:border-amber-500/40'
              }`}
            >
              {/* Photo Canvas */}
              <div className={`relative w-full overflow-hidden bg-slate-950 ${item.featured ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    if (item.fallback) {
                      (e.target as HTMLImageElement).src = item.fallback;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                {/* Badge */}
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700 text-[10px] font-bold text-amber-400">
                    {item.categoryLabel}
                  </span>
                  {item.featured && (
                    <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black shadow-lg">
                      GLOBAL CONCLAVE
                    </span>
                  )}
                  {item.isUserUploaded && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      Uploaded
                    </span>
                  )}
                </div>

                {/* Actions: Delete for uploaded & Quick Expand Icon */}
                <div className="absolute top-4 right-4 flex items-center space-x-1.5">
                  {item.isUserUploaded && (
                    <button
                      onClick={(e) => handleDeletePhoto(item.id, e)}
                      title="Delete uploaded photo"
                      className="w-8 h-8 rounded-full bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 flex items-center justify-center transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 flex items-center justify-center text-slate-300 group-hover:text-amber-400 group-hover:scale-110 transition">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center space-x-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{item.location}</span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">{item.date}</span>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-5 space-y-2">
                <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-400 transition">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* UPLOAD PHOTO MODAL */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="relative max-w-lg w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Upload New Photo</h3>
                    <p className="text-xs text-slate-400">Add conclave, tour or leadership event photos</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSavePhoto} className="space-y-4">
                {uploadError && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs font-medium">
                    {uploadError}
                  </div>
                )}

                {/* File Upload / Image Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Choose Image File or Paste URL</label>
                  <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl p-4 text-center cursor-pointer bg-slate-950/60 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="photo-upload-input"
                    />
                    <label htmlFor="photo-upload-input" className="cursor-pointer space-y-2 block">
                      <ImageIcon className="w-8 h-8 mx-auto text-amber-400/80" />
                      <div className="text-xs text-slate-300 font-medium">
                        {uploadFileName ? (
                          <span className="text-emerald-400 font-bold">{uploadFileName}</span>
                        ) : (
                          <span>Click to browse from device (Max 5MB)</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">Supports JPG, PNG, WebP</p>
                    </label>
                  </div>

                  <div className="pt-2">
                    <input
                      type="text"
                      placeholder="Or enter image URL (e.g. https://...)"
                      value={uploadImageData.startsWith('data:') ? '' : uploadImageData}
                      onChange={(e) => {
                        setUploadImageData(e.target.value);
                        setUploadFileName('');
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  {uploadImageData && (
                    <div className="mt-2 aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                      <img src={uploadImageData} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Photo Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Photo Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Goa Leadership Workshop & Achievers Gala"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                  >
                    <option value="conclave">Seminars & Conclaves</option>
                    <option value="tours">International & Luxury Tours</option>
                    <option value="awards">Award Recognition & Trophies</option>
                  </select>
                </div>

                {/* Location & Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai, Goa, Dubai"
                      value={uploadLocation}
                      onChange={(e) => setUploadLocation(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Date / Event</label>
                    <input
                      type="text"
                      placeholder="e.g. October 2026"
                      value={uploadDate}
                      onChange={(e) => setUploadDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the event, leaders and participants..."
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
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
                    <span>Upload & Save (সংরক্ষণ করুন)</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* LIGHTBOX MODAL */}
        {lightboxPhoto && (() => {
          const currentIndex = photos.findIndex((p) => p.id === lightboxPhoto.id);
          const handlePrev = () => {
            const nextIdx = (currentIndex - 1 + photos.length) % photos.length;
            setLightboxPhoto(photos[nextIdx]);
          };
          const handleNext = () => {
            const nextIdx = (currentIndex + 1) % photos.length;
            setLightboxPhoto(photos[nextIdx]);
          };

          return (
            <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
              <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4">
                {/* Top Action Bar */}
                <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
                  <a
                    href={lightboxPhoto.image}
                    download={`photo-${lightboxPhoto.id}.jpg`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full bg-slate-950/80 hover:bg-slate-950 border border-slate-700 text-white flex items-center justify-center transition"
                    title="Download / Open Full Photo"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setLightboxPhoto(null)}
                    className="w-10 h-10 rounded-full bg-slate-950/80 hover:bg-slate-950 border border-slate-700 text-white flex items-center justify-center transition"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Main Photo Canvas with Nav Arrows */}
                <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center group">
                  <img
                    src={lightboxPhoto.image}
                    alt={lightboxPhoto.title}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      if (lightboxPhoto.fallback) {
                        (e.target as HTMLImageElement).src = lightboxPhoto.fallback;
                      }
                    }}
                  />

                  {/* Previous / Next Arrow Controls */}
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={handlePrev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-950/80 hover:bg-amber-500 hover:text-slate-950 text-white border border-slate-700 flex items-center justify-center transition shadow-xl"
                        title="Previous Photo"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-950/80 hover:bg-amber-500 hover:text-slate-950 text-white border border-slate-700 flex items-center justify-center transition shadow-xl"
                        title="Next Photo"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>

                <div className="p-6 sm:p-8 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                        {lightboxPhoto.categoryLabel}
                      </span>
                      {lightboxPhoto.isUserUploaded && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          User Uploaded
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-mono">
                        {currentIndex + 1} / {photos.length}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-slate-400">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-amber-400" />
                        <span>{lightboxPhoto.location}</span>
                      </span>
                      <span className="font-mono">{lightboxPhoto.date}</span>
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {lightboxPhoto.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {lightboxPhoto.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
};

