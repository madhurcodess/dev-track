import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { formatTime } from '../utils/youtube';
import type { VideoItem } from '../types';
import { 
  SkipBack, 
  SkipForward, 
  CheckCircle2, 
  Maximize2, 
  Minimize2,
  Maximize,
  Minimize,
  Clock, 
  Play,
  Pause, 
  ExternalLink, 
  BookmarkPlus, 
  Gauge, 
  Sparkles,
  FolderPlus,
  RotateCcw,
  LayoutGrid
} from 'lucide-react';
import { AdBanner } from './AdBanner';

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
    setVideoCompleted,
    setYtPlayer,
    isTheaterMode,
    setIsTheaterMode,
    saveNoteForCurrentVideo,
    getNoteForCurrentVideo,
    setIsAddModalOpen,
    updateCourseVideos,
    savePlaybackPosition,
    getPlaybackPosition,
    clearPlaybackPosition,
    setCurrentView,
  } = useApp();

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isRateMenuOpen, setIsRateMenuOpen] = useState<boolean>(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [videoDurationSec, setVideoDurationSec] = useState<number>(0);
  const [playerStatus, setPlayerStatus] = useState<'playing' | 'paused' | 'ready' | 'loading'>('loading');
  
  // Persistent Playback & Auto-completion Feedback
  const [resumeBanner, setResumeBanner] = useState<{ seconds: number; formatted: string } | null>(null);
  const [completionToast, setCompletionToast] = useState<string | null>(null);
  const hasAttemptedResumeRef = useRef<string | null>(null);
  const lastSavedSecRef = useRef<number>(0);

  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleFullscreen = () => {
    if (!videoWrapperRef.current) return;
    if (!document.fullscreenElement) {
      videoWrapperRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);


  const currentIndex = activeCourse ? activeCourse.videos.findIndex(v => v.id === activeVideoId) : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = activeCourse ? currentIndex < activeCourse.videos.length - 1 : false;

  // Check and resume playback position (isolated by courseId and videoId)
  const checkAndResumePlayback = useCallback((player: any) => {
    if (!activeCourse || !activeVideo || !player || typeof player.seekTo !== 'function') return;
    const trackingKey = `${activeCourse.id}::${activeVideo.id}`;
    if (hasAttemptedResumeRef.current === trackingKey) return;

    const savedSec = getPlaybackPosition(activeCourse.id, activeVideo.id);

    // Edge case: if video is explicitly marked completed, clear and start from 0
    if (activeVideo.completed) {
      clearPlaybackPosition(activeCourse.id, activeVideo.id);
      hasAttemptedResumeRef.current = trackingKey;
      return;
    }

    // Only resume if saved position > 5 seconds
    if (savedSec > 5) {
      try {
        player.seekTo(savedSec, true);
        hasAttemptedResumeRef.current = trackingKey;
        setResumeBanner({ seconds: savedSec, formatted: formatTime(savedSec) });
        setTimeout(() => {
          setResumeBanner(curr => (curr?.seconds === savedSec ? null : curr));
        }, 8000);
      } catch (e) {
        console.warn('Playback resume notice:', e);
      }
    } else {
      hasAttemptedResumeRef.current = trackingKey;
    }
  }, [activeCourse, activeVideo, getPlaybackPosition, clearPlaybackPosition]);

  // "Start Over" user action
  const handleStartOver = useCallback(() => {
    if (playerInstanceRef.current && typeof playerInstanceRef.current.seekTo === 'function') {
      playerInstanceRef.current.seekTo(0, true);
    }
    if (activeCourse && activeVideo) {
      clearPlaybackPosition(activeCourse.id, activeVideo.id);
      lastSavedSecRef.current = 0;
    }
    setResumeBanner(null);
  }, [activeCourse, activeVideo, clearPlaybackPosition]);

  // Sync real playlist videos from YouTube iFrame API
  const syncPlaylistIfAvailable = useCallback((player: any) => {
    if (!activeCourse?.playlistId || !player) return;
    try {
      const playlist: string[] = typeof player.getPlaylist === 'function' ? player.getPlaylist() : [];
      const videoData = typeof player.getVideoData === 'function' ? player.getVideoData() : null;

      if (playlist && playlist.length > 0) {
        const hasDummyId = activeCourse.videos.some(v => v.youtubeId === 'dQw4w9WgXcQ' || !v.youtubeId);
        const needsUpdate = hasDummyId || activeCourse.videos.length !== playlist.length;

        if (needsUpdate) {
          const updatedVideos: VideoItem[] = playlist.map((vId, idx) => {
            const existing = activeCourse.videos[idx];
            const isFirst = idx === 0;
            const title = (isFirst && videoData?.title) 
              ? `${String(idx + 1).padStart(2, '0')}. ${videoData.title}`
              : existing?.title && !existing.title.includes('Loading') && !existing.title.includes('Orientation')
              ? existing.title
              : `Lecture ${String(idx + 1).padStart(2, '0')}`;

            return {
              id: existing?.id || `vid-${activeCourse.id}-${idx}`,
              youtubeId: vId,
              title,
              duration: existing?.duration || '20:00',
              completed: existing?.completed || false,
            };
          });

          updateCourseVideos(activeCourse.id, updatedVideos);
          if (!activeVideoId || activeCourse.videos.length <= 1) {
            setActiveVideoId(updatedVideos[0].id);
          }
        }
      }
    } catch (e) {
      console.warn('Playlist sync notice:', e);
    }
  }, [activeCourse, activeVideoId, updateCourseVideos, setActiveVideoId]);

  // Sync currently playing video's real title from player
  const syncVideoMetadata = useCallback((player: any) => {
    if (!activeCourse || !player) return;
    try {
      const vData = typeof player.getVideoData === 'function' ? player.getVideoData() : null;
      if (!vData || !vData.title) return;

      const pIndex = typeof player.getPlaylistIndex === 'function' ? player.getPlaylistIndex() : -1;
      const targetIdx = pIndex >= 0 ? pIndex : activeCourse.videos.findIndex(v => v.id === activeVideoId);

      if (targetIdx >= 0 && activeCourse.videos[targetIdx]) {
        const vid = activeCourse.videos[targetIdx];
        const isGeneric = vid.title.startsWith('Lecture') || 
                          vid.title.includes('Loading') || 
                          vid.title.includes('Orientation') ||
                          vid.title.includes('Capstone Project');

        if (isGeneric) {
          const updated = [...activeCourse.videos];
          updated[targetIdx] = {
            ...vid,
            youtubeId: vData.video_id || vid.youtubeId,
            title: `${String(targetIdx + 1).padStart(2, '0')}. ${vData.title}`,
          };
          updateCourseVideos(activeCourse.id, updated);
        }
      }
    } catch {}
  }, [activeCourse, activeVideoId, updateCourseVideos]);

  // Initialize YouTube IFrame API
  useEffect(() => {
    let checkInterval: number;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player || !playerContainerRef.current) return;

      if (playerInstanceRef.current && typeof playerInstanceRef.current.loadVideoById === 'function') {
        return;
      }

      const isPlaylistCourse = Boolean(activeCourse?.playlistId);
      const playerConfig: any = {
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
          origin: window.location.origin,
          fs: 0,
          controls: 0,
        },
        events: {
          onReady: (event: any) => {
            setYtPlayer(event.target);
            setPlayerStatus('ready');
            try {
              setVideoDurationSec(event.target.getDuration() || 0);
              const iframe = event.target.getIframe?.() || document.querySelector('#youtube-player-element');
              if (iframe) {
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen');
                iframe.setAttribute('allowfullscreen', 'true');
              }
            } catch {}
            syncPlaylistIfAvailable(event.target);
            checkAndResumePlayback(event.target);
          },
          onStateChange: (event: any) => {
            if (event.data === 1) {
              setPlayerStatus('playing');
              syncVideoMetadata(event.target);
              checkAndResumePlayback(event.target);
            } else if (event.data === 2) {
              setPlayerStatus('paused');
              // Save exact offset on pause
              if (activeCourse && activeVideo && typeof event.target.getCurrentTime === 'function') {
                const pSec = Math.floor(event.target.getCurrentTime());
                if (pSec > 3) {
                  savePlaybackPosition(activeCourse.id, activeVideo.id, pSec);
                  lastSavedSecRef.current = pSec;
                }
              }
            } else if (event.data === 0) {
              // Video ended -> Auto mark completed & clear saved position
              setPlayerStatus('paused');
              if (activeCourse && activeVideo) {
                setVideoCompleted(activeCourse.id, activeVideo.id, true);
                clearPlaybackPosition(activeCourse.id, activeVideo.id);
                setCompletionToast('Lecture completed! 🎉');
                setTimeout(() => setCompletionToast(null), 4500);
              }
            }
          },
        },
      };

      if (isPlaylistCourse && activeCourse?.playlistId) {
        playerConfig.playerVars.listType = 'playlist';
        playerConfig.playerVars.list = activeCourse.playlistId;
      } else if (activeVideo?.youtubeId) {
        playerConfig.videoId = activeVideo.youtubeId;
      }

      playerInstanceRef.current = new window.YT.Player('youtube-player-element', playerConfig);
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

    // Polling current playback time (1s tick) for accurate time display and 2-3s auto-save
    checkInterval = window.setInterval(() => {
      if (playerInstanceRef.current && typeof playerInstanceRef.current.getCurrentTime === 'function') {
        try {
          const t = playerInstanceRef.current.getCurrentTime();
          const sec = Math.floor(t);
          setCurrentTimeSec(sec);

          const dur = typeof playerInstanceRef.current.getDuration === 'function' 
            ? Math.floor(playerInstanceRef.current.getDuration()) 
            : 0;
          if (dur > 0) {
            setVideoDurationSec(dur);
          }

          if (activeCourse && activeVideo && dur > 0 && sec > 0) {
            // Periodically save every 2-3 seconds during active playback
            if (!activeVideo.completed && sec > 3) {
              if (Math.abs(sec - lastSavedSecRef.current) >= 2) {
                savePlaybackPosition(activeCourse.id, activeVideo.id, sec);
                lastSavedSecRef.current = sec;
              }
            }
          }
        } catch {}
      }
    }, 1000);

    return () => {
      clearInterval(checkInterval);
    };
  }, [
    activeCourse?.id, 
    activeCourse?.playlistId, 
    activeVideo?.youtubeId, 
    setYtPlayer, 
    setVideoCompleted,
    clearPlaybackPosition,
    syncPlaylistIfAvailable, 
    syncVideoMetadata,
    checkAndResumePlayback,
    activeVideo,
    savePlaybackPosition
  ]);

  // Load new video when activeVideo changes
  useEffect(() => {
    if (!playerInstanceRef.current) return;
    hasAttemptedResumeRef.current = null; // Reset for new video
    lastSavedSecRef.current = 0;
    setResumeBanner(null);

    if (activeCourse?.playlistId && typeof playerInstanceRef.current.playVideoAt === 'function') {
      const idx = activeCourse.videos.findIndex(v => v.id === activeVideo?.id);
      if (idx >= 0) {
        const currentIdx = typeof playerInstanceRef.current.getPlaylistIndex === 'function' 
          ? playerInstanceRef.current.getPlaylistIndex() 
          : -1;

        if (currentIdx !== idx) {
          playerInstanceRef.current.playVideoAt(idx);
        }
      }
    } else if (activeVideo?.youtubeId && typeof playerInstanceRef.current.loadVideoById === 'function') {
      playerInstanceRef.current.loadVideoById(activeVideo.youtubeId);
    }
  }, [activeVideo?.id, activeVideo?.youtubeId, activeCourse?.playlistId, activeCourse?.videos]);

  const handlePrevious = () => {
    if (hasPrevious && activeCourse) {
      setActiveVideoId(activeCourse.videos[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (hasNext && activeCourse) {
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

  if (!activeCourse || !activeVideo) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#F9F8F5]">
        <div className="max-w-md p-8 rounded-3xl bg-white border-2 border-[#121417] shadow-solid-lg flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-[#EBF755] border-2 border-[#121417] text-[#121417] flex items-center justify-center mb-5 shadow-solid">
            <FolderPlus className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-extrabold text-[#121417] mb-2 tracking-tight">
            Ready to Start Learning?
          </h2>

          <p className="text-xs text-[#121417]/70 mb-6 leading-relaxed font-medium">
            Your learning workspace is clean and ready. Add any YouTube playlist or video link to track lectures, take timestamped notes, and build your daily study streak.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('playlists')}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-[#121417] bg-white hover:bg-slate-50 border-2 border-[#121417] shadow-sm transition-all"
            >
              <LayoutGrid className="w-3.5 h-3.5 inline mr-1.5" />
              <span>View All Playlists</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-[#121417] bg-[#D4E4FC] hover:bg-[#C2DBFB] border-2 border-[#121417] shadow-solid transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <FolderPlus className="w-4 h-4" />
              <span>+ Add Course</span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-[#F9F8F5] overflow-y-auto">
      {/* Player Container */}
      <div className="p-4 sm:p-6 lg:p-8 pb-2 max-w-6xl w-full mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            onClick={() => setCurrentView('playlists')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#121417]/70 hover:text-[#121417] transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>All Playlists</span>
            <span className="text-[#121417]/40">/</span>
            <span className="text-[#121417] font-extrabold truncate max-w-[200px] sm:max-w-[300px]">
              {activeCourse.title}
            </span>
          </button>
        </div>

        {/* Dynamic Alert Toasts: Playback Resume with "Start Over" & Completion Notification */}
        {completionToast && (
          <div className="animate-fade-in flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#EBF755] text-black border-2 border-[#121417] shadow-solid mb-3">
            <div className="flex items-center gap-2 text-xs font-black">
              <Sparkles className="w-4 h-4 fill-current text-black" />
              <span>{completionToast}</span>
            </div>
            <button
              onClick={() => setCompletionToast(null)}
              className="text-black/60 hover:text-black p-1 text-xs font-black"
              title="Close"
            >
              ✕
            </button>
          </div>
        )}

        {resumeBanner && (
          <div className="animate-fade-in flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#121417] text-[#EBF755] border-2 border-[#121417] shadow-solid mb-3">
            <div className="flex items-center gap-2 text-xs font-bold">
              <RotateCcw className="w-4 h-4 text-[#EBF755]" />
              <span>Resumed playback from <strong className="underline decoration-[#EBF755] font-mono text-white ml-0.5">{resumeBanner.formatted}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleStartOver}
                className="px-3 py-1 rounded-full text-xs font-black bg-[#EBF755] text-black hover:bg-white transition-all shadow-xs active:scale-95"
              >
                Start Over
              </button>
              <button
                onClick={() => setResumeBanner(null)}
                className="text-white/60 hover:text-white p-1 text-xs"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* 16:9 Responsive Video Aspect Ratio */}
        <div ref={videoWrapperRef} className="relative w-full rounded-3xl overflow-hidden shadow-solid-lg border-2 border-[#121417] bg-black aspect-video group">
          <div id="youtube-player-element" ref={playerContainerRef} className="w-full h-full" />
        </div>

        {/* Video Information & Action Controls */}
        <div className="mt-5 p-5 rounded-3xl bg-white border-2 border-[#121417] shadow-solid flex flex-col gap-4">
          
          {/* Secondary Control Bar: Previous / Play / Pause / Next / Speed / Theater / YouTube Link */}
          <div className="pb-3.5 border-b border-[#121417]/10 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={!hasPrevious}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  hasPrevious
                    ? 'bg-white border-[#121417]/30 text-[#121417] hover:bg-slate-100'
                    : 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400'
                }`}
              >
                <SkipBack className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              {/* Play / Pause Button */}
              <button
                onClick={() => {
                  if (playerStatus === 'playing') {
                    playerInstanceRef.current?.pauseVideo();
                  } else {
                    playerInstanceRef.current?.playVideo();
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors bg-white border-[#121417]/30 text-[#121417] hover:bg-slate-100"
              >
                {playerStatus === 'playing' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{playerStatus === 'playing' ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={handleNext}
                disabled={!hasNext}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  hasNext
                    ? 'bg-white border-[#121417]/30 text-[#121417] hover:bg-slate-100'
                    : 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400'
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-[#121417]/30 text-[#121417] text-xs font-mono font-bold transition-colors"
                >
                  <Gauge className="w-3.5 h-3.5 text-[#121417]" />
                  <span>{playbackRate}x</span>
                </button>

                {isRateMenuOpen && (
                  <div className="absolute bottom-full mb-2 right-0 bg-white border-2 border-[#121417] rounded-2xl shadow-solid p-1.5 z-50 flex flex-col gap-1 min-w-[80px]">
                    {[0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                      <button
                        key={rate}
                        onClick={() => handlePlaybackRate(rate)}
                        className={`px-2.5 py-1 text-xs rounded-xl text-center transition-colors font-mono font-bold ${
                          playbackRate === rate
                            ? 'bg-[#EBF755] text-black font-extrabold'
                            : 'text-[#121417] hover:bg-slate-100'
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
                className="p-2 rounded-full bg-white hover:bg-slate-50 border border-[#121417]/30 text-[#121417] transition-colors"
                title={isTheaterMode ? "Exit Theater Mode" : "Enter Theater Mode"}
              >
                {isTheaterMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Fullscreen Video Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full bg-white hover:bg-slate-50 border border-[#121417]/30 text-[#121417] transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Video"}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>

              {/* Watch on YouTube */}
              <a
                href={
                  activeCourse.playlistId 
                    ? `https://www.youtube.com/playlist?list=${activeCourse.playlistId}`
                    : `https://www.youtube.com/watch?v=${activeVideo.youtubeId}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white hover:bg-slate-50 border border-[#121417]/30 text-[#121417] transition-colors"
                title="Watch directly on YouTube"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Title & Metadata */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#D4E4FC] text-[#121417] border border-[#121417]/15">
                  Lecture {currentIndex + 1} of {activeCourse.videos.length}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-[#F9F8F5] border border-[#121417]/15 text-[#121417]/70 font-bold">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    playerStatus === 'playing' ? 'bg-emerald-500 animate-ping' : playerStatus === 'paused' ? 'bg-amber-500' : 'bg-slate-400'
                  }`} />
                  {playerStatus}
                </span>
                {videoDurationSec > 0 && (
                  <span className="flex items-center gap-1 text-[11px] text-[#121417]/70 font-mono font-bold">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(currentTimeSec)} / {formatTime(videoDurationSec)}</span>
                  </span>
                )}
                {activeVideo.completed && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    <Sparkles className="w-3 h-3" /> Completed
                  </span>
                )}
              </div>

              <h1 className="text-base sm:text-lg font-extrabold text-[#121417] tracking-tight leading-snug">
                {activeVideo.title}
              </h1>
              <p className="text-xs text-[#121417]/60 mt-1 font-bold">
                Course: <span className="text-[#121417]">{activeCourse.title}</span>
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Timestamp Note Quick Button */}
              <button
                onClick={handleQuickTimestampNote}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#D4E4FC] hover:bg-[#C2DBFB] text-[#121417] text-xs font-bold border-2 border-[#121417] shadow-sm transition-all hover:scale-105 active:scale-95"
                title="Insert current video timestamp into notes"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>Timestamp Note [{formatTime(currentTimeSec)}]</span>
              </button>

              {/* Mark Completed Toggle */}
              <button
                onClick={() => toggleVideoCompletion(activeCourse.id, activeVideo.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold border-2 border-[#121417] transition-all hover:scale-105 ${
                  activeVideo.completed
                    ? 'bg-[#EBF755] text-black shadow-solid'
                    : 'bg-white text-[#121417] hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{activeVideo.completed ? 'Completed' : 'Mark as Done'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Google AdSense Workspace Ad Slot */}
        <AdBanner slotId="player-workspace-bottom-banner" format="horizontal" className="mt-4 mb-2" />
      </div>
    </main>
  );
};
