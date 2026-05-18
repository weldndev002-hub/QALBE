import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import clsx from 'clsx';
import { Play, Pause, SkipForward, SkipBack, Lock, Volume2, Headphones, Activity } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAudioStore } from '../store/audioStore';

const CATEGORIES = ['Semua', 'Dzikir', 'Refleksi', 'Motivasi', 'Alam'];

const AUDIO_TRACKS = [
  { id: 1, title: 'Dzikir Pagi Penenang Hati', category: 'Dzikir', duration: '15:00', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', isPremium: false },
  { id: 2, title: 'Refleksi: Melepaskan Beban', category: 'Refleksi', duration: '10:30', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', isPremium: true },
  { id: 3, title: 'Suara Hujan & Hutan Tropis', category: 'Alam', duration: '45:00', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', isPremium: false },
  { id: 4, title: 'Bangkit dari Rasa Cemas', category: 'Motivasi', duration: '08:15', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', isPremium: true },
  { id: 5, title: 'Dzikir Petang & Doa Keselamatan', category: 'Dzikir', duration: '20:00', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', isPremium: false },
];

export default function AudioTerapiPage() {
  const { user } = useAuthStore() as any;
  const { currentTrack, isPlaying, play, pause } = useAudioStore() as any;
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [progress, setProgress] = useState(0);
  const soundRef = useRef<Howl | null>(null);

  // Filter tracks
  const filteredTracks = activeCategory === 'Semua' 
    ? AUDIO_TRACKS 
    : AUDIO_TRACKS.filter(t => t.category === activeCategory);

  // Handle Play/Pause Global
  useEffect(() => {
    if (currentTrack) {
      if (soundRef.current) {
        soundRef.current.unload(); // Unload previous
      }

      const isFreeTier = false; // Dibuka semua
      const isLocked = currentTrack.isPremium && isFreeTier;

      // Inisialisasi Howler
      soundRef.current = new Howl({
        src: [currentTrack.url],
        html5: true,
        onplay: () => {
          // Timer untuk update progress bar visual
          requestAnimationFrame(updateProgress);
        },
      });

      if (isPlaying && !isLocked) {
        soundRef.current.play();
      }
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
  }, [currentTrack]);

  // Sync isPlaying state to Howler instance
  useEffect(() => {
    if (soundRef.current) {
      if (isPlaying && !soundRef.current.playing()) {
        soundRef.current.play();
      } else if (!isPlaying && soundRef.current.playing()) {
        soundRef.current.pause();
      }
    }
  }, [isPlaying]);

  const updateProgress = () => {
    if (soundRef.current && soundRef.current.playing()) {
      const seek = soundRef.current.seek() as number;
      const duration = soundRef.current.duration();
      setProgress((seek / duration) * 100);
      
      // Batasi 30 detik untuk user Free
      if (user?.tier === 'free' && seek >= 30) {
        soundRef.current.pause();
        pause();
        alert("Batas preview 30 detik tercapai. Silakan upgrade ke Premium untuk mendengar penuh.");
        return;
      }
      
      requestAnimationFrame(updateProgress);
    }
  };

  const handleTrackClick = (track: any) => {
    if (currentTrack?.id === track.id) {
      isPlaying ? pause() : play(track);
    } else {
      play(track);
      setProgress(0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (soundRef.current) {
      const seekTime = (Number(e.target.value) / 100) * soundRef.current.duration();
      soundRef.current.seek(seekTime);
      setProgress(Number(e.target.value));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-50 pb-[130px] font-sans">
      {/* Header */}
      <header className="bg-white px-4 py-6 pb-2 sticky top-0 z-40 border-b border-neutral-100">
        <h1 className="text-2xl font-display font-bold text-neutral-900 mb-2">Audio Terapi</h1>
        <p className="text-neutral-500 text-sm mb-4">Dengarkan dan temukan ketenangan di setiap lantunan.</p>
        
        {/* Categories Horizontal Scroll */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={clsx(
                "whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                activeCategory === cat 
                  ? "bg-primary-600 text-white border-primary-600 shadow-sm" 
                  : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content List */}
      <main className="flex-1 max-w-md md:max-w-3xl mx-auto w-full overflow-y-auto p-4 space-y-4">
        {filteredTracks.map((track, i) => {
          const isLocked = false; // Dibuka semua
          const isCurrentTrack = currentTrack?.id === track.id;
          
          return (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => !isLocked && handleTrackClick(track)}
              className={clsx(
                "bg-white rounded-2xl p-4 border transition-all flex items-center gap-4 group",
                isLocked ? "border-neutral-100 opacity-60" : "border-neutral-200 hover:border-primary-300 cursor-pointer",
                isCurrentTrack ? "border-primary-500 ring-2 ring-primary-500/20" : ""
              )}
            >
              {/* Thumbnail */}
              <div className={clsx(
                "w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-colors relative overflow-hidden",
                isCurrentTrack ? "bg-primary-500 text-white" : "bg-neutral-100 text-neutral-400 group-hover:bg-primary-50 group-hover:text-primary-600"
              )}>
                {isLocked ? (
                  <Lock size={20} />
                ) : isCurrentTrack && isPlaying ? (
                  <Activity size={20} className="animate-pulse" />
                ) : (
                  <Play size={24} className="ml-1" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold tracking-wider text-primary-600 uppercase bg-primary-50 px-2 py-0.5 rounded-md">
                    {track.category}
                  </span>
                  {track.isPremium && (
                    <span className="text-[10px] font-bold tracking-wider text-secondary-600 uppercase bg-secondary-50 px-2 py-0.5 rounded-md">
                      Premium
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-neutral-900 truncate pr-2">{track.title}</h3>
                <p className="text-xs text-neutral-500">{track.duration} • {isLocked ? 'Preview 30d' : 'Full Audio'}</p>
              </div>
            </motion.div>
          );
        })}
      </main>

      {/* Sticky Audio Player */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-[72px] md:bottom-6 left-0 right-0 md:left-64 lg:left-72 px-4 z-40"
          >
            <div className="max-w-md md:max-w-3xl mx-auto bg-neutral-900 rounded-3xl p-4 text-white shadow-xl shadow-neutral-900/20 border border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shrink-0">
                  <Headphones size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white truncate">{currentTrack.title}</h4>
                  <p className="text-xs text-neutral-400">{currentTrack.category}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <button onClick={() => isPlaying ? pause() : play(currentTrack)} className="w-10 h-10 bg-white text-neutral-900 rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                    {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-[10px] text-neutral-400 font-medium font-mono">
                  {user?.tier === 'free' ? 'Pre' : '0:00'}
                </span>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={progress}
                  onChange={handleSeek}
                  className="flex-1 h-1 bg-neutral-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                  style={{
                    background: `linear-gradient(to right, #4ade80 ${progress}%, #404040 ${progress}%)`
                  }}
                />
                <span className="text-[10px] text-neutral-400 font-medium font-mono">
                  {user?.tier === 'free' ? '30s' : currentTrack.duration}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
