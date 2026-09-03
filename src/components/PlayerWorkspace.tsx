import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { formatTime } from '../utils/youtube';
import { 
  SkipBack, 
  SkipForward, 
  CheckCircle2, 
  Maximize2, 
  Minimize2, 
  Clock, 
  ExternalLink, 
  BookmarkPlus, 
  Gauge, 
  Sparkles 
} from 'lucide-react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const PlayerWorkspace: React.FC = () => {
  const {
    activeCourse,
    activeVideo,
    activeVideoId,
    setActiveVideoId,
    toggleVideoCompletion,
    setYtPlayer,
    isTheaterMode,
    setIsTheaterMode,
    saveNoteForCurrentVideo,
    getNoteForCurrentVideo,
  } = useApp();

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isRateMenuOpen, setIsRateMenuOpen] = useState<boolean>(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [videoDurationSec, setVideoDurationSec] = useState<number>(0);
  const [playerStatus, setPlayerStatus] = useState<'playing' | 'paused' | 'ready' | 'loading'>('loading');

  const currentIndex = activeCourse.videos.findIndex(v => v.id === activeVideoId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < activeCourse.videos.length - 1;

  // Initialize YouTube IFrame API
  useEffect(() => {
    let checkInterval: number;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player || !playerContainerRef.current) return;

      // If player already exists, load video
      if (playerInstanceRef.current && typeof playerInstanceRef.current.loadVideoById === 'function') {
        if (activeVideo?.youtubeId) {
          playerInstanceRef.current.loadVideoById(activeVideo.youtubeId);
        }
        return;
      }

      // Create new player
      playerInstanceRef.current = new window.YT.Player('youtube-player-element', {
        videoId: activeVideo?.youtubeId || '',
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            setYtPlayer(event.target);
            setPlayerStatus('ready');
            try {
              setVideoDurationSec(event.target.getDuration() || 0);
            } catch {}
          },
          onStateChange: (event: any) => {
            // YT.PlayerState: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 video cued
            if (event.data === 1) {
              setPlayerStatus('playing');
            } else if (event.data === 2) {
              setPlayerStatus('paused');
            } else if (event.data === 0) {
              // Video ended -> Auto mark completed!
              if (activeVideo && !activeVideo.completed) {
                toggleVideoCompletion(activeCourse.id, activeVideo.id);
              }
              setPlayerStatus('paused');
            }
          },
        },
      });
      setYtPlayer(playerInstanceRef.current);
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else {
      initPlayer();
    }

    // Polling current playback time for accurate display & timestamp capture
    checkInterval = window.setInterval(() => {
      if (playerInstanceRef.current && typeof playerInstanceRef.current.getCurrentTime === 'function') {
        try {
          const t = playerInstanceRef.current.getCurrentTime();
          setCurrentTimeSec(Math.floor(t));
          const dur = playerInstanceRef.current.getDuration();
          if (dur && dur > 0) {
            setVideoDurationSec(Math.floor(dur));
          }
        } catch {}
      }
    }, 1000);

    return () => {
      clearInterval(checkInterval);
    };
  }, [activeVideo?.youtubeId, setYtPlayer, activeCourse.id, activeVideo, toggleVideoCompletion]);

  // Load new video when activeVideo changes
  useEffect(() => {
    if (playerInstanceRef.current && typeof playerInstanceRef.current.loadVideoById === 'function') {
      if (activeVideo?.youtubeId) {
        playerInstanceRef.current.loadVideoById(activeVideo.youtubeId);
      }
    }
  }, [activeVideo?.youtubeId]);

  const handlePrevious = () => {
    if (hasPrevious) {
      setActiveVideoId(activeCourse.videos[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setActiveVideoId(activeCourse.videos[currentIndex + 1].id);
    }
  };

  const handlePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    setIsRateMenuOpen(false);
    if (playerInstanceRef.current && typeof playerInstanceRef.current.setPlaybackRate === 'function') {
      playerInstanceRef.current.setPlaybackRate(rate);
    }
  };

  // Quick timestamp note insertion
  const handleQuickTimestampNote = useCallback(() => {
    let currentSec = 0;
    if (playerInstanceRef.current && typeof playerInstanceRef.current.getCurrentTime === 'function') {
      currentSec = Math.floor(playerInstanceRef.current.getCurrentTime());
    }
    const formatted = formatTime(currentSec);
    const existing = getNoteForCurrentVideo();
    const tag = `\n\n- [${formatted}] `;
    saveNoteForCurrentVideo(existing + tag);
  }, [getNoteForCurrentVideo, saveNoteForCurrentVideo]);

  if (!activeVideo) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400">
        <p>No video selected. Select a lecture from the sidebar to begin.</p>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-slate-950/40 overflow-y-auto">
      {/* Player Container */}
      <div className="p-3 sm:p-5 lg:p-6 pb-2 max-w-6xl w-full mx-auto">
        {/* 16:9 Responsive Video Aspect Ratio */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-slate-800/80 bg-black aspect-video group">
          <div id="youtube-player-element" ref={playerContainerRef} className="w-full h-full" />
        </div>

        {/* Video Information & Action Controls */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Title & Metadata */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Lecture {currentIndex + 1} of {activeCourse.videos.length}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    playerStatus === 'playing' ? 'bg-emerald-400 animate-ping' : playerStatus === 'paused' ? 'bg-amber-400' : 'bg-slate-500'
                  }`} />
                  {playerStatus}
                </span>
                {videoDurationSec > 0 && (
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(currentTimeSec)} / {formatTime(videoDurationSec)}</span>
                  </span>
                )}
                {activeVideo.completed && (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Sparkles className="w-3 h-3" /> Completed
                  </span>
                )}
              </div>

              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                {activeVideo.title}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Course: <span className="text-slate-300 font-medium">{activeCourse.title}</span>
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Timestamp Note Quick Button */}
              <button
                onClick={handleQuickTimestampNote}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
                title="Insert current video timestamp into notes"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>Timestamp Note [{formatTime(currentTimeSec)}]</span>
              </button>

              {/* Mark Completed */}
              <button
                onClick={() => toggleVideoCompletion(activeCourse.id, activeVideo.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                  activeVideo.completed
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700/80'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">{activeVideo.completed ? 'Completed' : 'Mark as Done'}</span>
              </button>
            </div>
          </div>

          {/* Secondary Control Bar: Previous / Next / Speed / Theater / YouTube Link */}
          <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={!hasPrevious}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  hasPrevious
                    ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                    : 'opacity-40 cursor-not-allowed border-slate-800 text-slate-600'
                }`}
              >
                <SkipBack className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button
                onClick={handleNext}
                disabled={!hasNext}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  hasNext
                    ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                    : 'opacity-40 cursor-not-allowed border-slate-800 text-slate-600'
                }`}
              >
                <span>Next</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Playback speed selector */}
              <div className="relative">
                <button
                  onClick={() => setIsRateMenuOpen(!isRateMenuOpen)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-medium transition-colors"
                >
                  <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{playbackRate}x</span>
                </button>

                {isRateMenuOpen && (
                  <div className="absolute bottom-full mb-1 right-0 bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-1 z-50 flex flex-col gap-0.5 min-w-[70px]">
                    {[0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                      <button
                        key={rate}
                        onClick={() => handlePlaybackRate(rate)}
                        className={`px-2 py-1 text-xs rounded text-center transition-colors font-mono ${
                          playbackRate === rate
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theater Mode Toggle */}
              <button
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                title={isTheaterMode ? "Exit Theater Mode" : "Enter Theater Mode"}
              >
                {isTheaterMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Watch on YouTube */}
              <a
                href={`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Watch directly on YouTube"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
