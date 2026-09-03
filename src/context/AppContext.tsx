import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Course, VideoItem, PomodoroMode, PomodoroSettings, PomodoroStats } from '../types';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { isSupabaseConfigured } from '../lib/supabase';
import { 
  fetchUserCoursesFromCloud, 
  upsertUserCourseToCloud, 
  deleteUserCourseFromCloud,
  fetchUserNotesFromCloud,
  upsertUserNoteToCloud,
  fetchUserStreakFromCloud,
  upsertUserStreakToCloud
} from '../services/db';

export interface TimerCelebrationState {
  type: 'work' | 'break';
  durationMinutes: number;
}

interface AppContextType {
  // Courses & Tracklist
  courses: Course[];
  activeCourse: Course | null;
  activeVideo: VideoItem | undefined;
  activeCourseId: string;
  activeVideoId: string;
  setActiveCourseId: (id: string) => void;
  setActiveVideoId: (id: string) => void;
  toggleVideoCompletion: (courseId: string, videoId: string) => void;
  setVideoCompleted: (courseId: string, videoId: string, completed: boolean) => void;
  markCourseCompleted: (courseId: string, completed: boolean) => void;
  addCourse: (course: Course) => void;
  updateCourseVideos: (courseId: string, videos: VideoItem[], title?: string) => void;
  deleteCourse: (courseId: string) => void;
  resetAllData: () => void;

  // Notes
  getNoteForCurrentVideo: () => string;
  saveNoteForCurrentVideo: (content: string) => void;
  isNoteSaving: boolean;
  lastSavedTime: string | null;

  // Pomodoro
  pomodoroMode: PomodoroMode;
  pomodoroTimeLeft: number;
  isPomodoroRunning: boolean;
  pomodoroSettings: PomodoroSettings;
  pomodoroStats: PomodoroStats;
  startPomodoro: () => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;
  skipPomodoro: () => void;
  setPomodoroMode: (mode: PomodoroMode) => void;
  updatePomodoroSettings: (settings: Partial<PomodoroSettings>) => void;
  isPomodoroExpanded: boolean;
  setIsPomodoroExpanded: (expanded: boolean) => void;

  // Timer Celebration Modal State & Actions
  timerCelebration: TimerCelebrationState | null;
  setTimerCelebration: (state: TimerCelebrationState | null) => void;
  startNextSprint: () => void;
  startBreakAfterWork: () => void;
  extendBreak: (extraMinutes?: number) => void;

  // YouTube Player Ref and Sync
  ytPlayer: any;
  setYtPlayer: (player: any) => void;
  seekTo: (seconds: number) => void;
  getCurrentPlayerTime: () => number;
  playerState: string;
  setPlayerState: (state: string) => void;

  // UI layout toggles
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isNotesOpen: boolean;
  setIsNotesOpen: (open: boolean) => void;
  isTheaterMode: boolean;
  setIsTheaterMode: (theater: boolean) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  hasClerkKey: boolean;

  // View Navigation: 'playlists' (hub) or 'workspace' (3-panel player)
  currentView: 'playlists' | 'workspace';
  setCurrentView: (view: 'playlists' | 'workspace') => void;

  // Playback Resume & Position Tracking (Indexed by courseId and videoId)
  savePlaybackPosition: (courseId: string, videoId: string, seconds: number) => void;
  getPlaybackPosition: (courseId: string, videoId: string) => number;
  clearPlaybackPosition: (courseId: string, videoId: string) => void;

  // Cloud Sync
  isCloudConnected: boolean;
  isCloudSyncing: boolean;
}

const STORAGE_KEYS = {
  COURSES: 'devtrack_courses_v2',
  ACTIVE_COURSE: 'devtrack_active_course_v2',
  ACTIVE_VIDEO: 'devtrack_active_video_v2',
  NOTES: 'devtrack_notes_v2',
  POMODORO_SETTINGS: 'devtrack_pomo_settings_v2',
  POMODORO_STATS: 'devtrack_pomo_stats_v2',
  PLAYBACK_POSITIONS: 'devtrack_playback_pos_v2',
};

const DEFAULT_POMO_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  soundEnabled: true,
};

const DEFAULT_POMO_STATS: PomodoroStats = {
  sessionsCompleted: 0,
  todayFocusMinutes: 0,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
};

const AppContext = createContext<AppContextType | null>(null);

export interface AppProviderProps {
  children: React.ReactNode;
  hasClerkKey?: boolean;
  userId?: string | null;
}

export const AppProvider: React.FC<AppProviderProps> = ({ 
  children, 
  hasClerkKey = false,
  userId = null
}) => {
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [timerCelebration, setTimerCelebration] = useState<TimerCelebrationState | null>(null);

  // View Navigation: 'playlists' (hub) or 'workspace' (player & notes)
  const [currentView, setCurrentView] = useState<'playlists' | 'workspace'>('playlists');

  // Playback positions per video ID
  const [playbackPositions, setPlaybackPositions] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLAYBACK_POSITIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const savePlaybackPosition = useCallback((courseId: string, videoId: string, seconds: number) => {
    if (!courseId || !videoId || seconds < 0) return;
    const key = `${courseId}::${videoId}`;
    setPlaybackPositions(prev => {
      // Don't save if position change is minimal (< 2s)
      if (Math.abs((prev[key] || 0) - seconds) < 2) return prev;
      const updated = { ...prev, [key]: Math.floor(seconds) };
      try {
        localStorage.setItem(STORAGE_KEYS.PLAYBACK_POSITIONS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const getPlaybackPosition = useCallback((courseId: string, videoId: string): number => {
    if (!courseId || !videoId) return 0;
    const key = `${courseId}::${videoId}`;
    return playbackPositions[key] || playbackPositions[videoId] || 0;
  }, [playbackPositions]);

  const clearPlaybackPosition = useCallback((courseId: string, videoId: string) => {
    if (!courseId || !videoId) return;
    const key = `${courseId}::${videoId}`;
    setPlaybackPositions(prev => {
      const updated = { ...prev };
      delete updated[key];
      delete updated[videoId];
      try {
        localStorage.setItem(STORAGE_KEYS.PLAYBACK_POSITIONS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // 1. Courses State - Starts clean and empty
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load courses from localStorage', e);
    }
    return []; // Empty by default
  });

  const [activeCourseId, setActiveCourseIdState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_COURSE);
    return saved && courses.some(c => c.id === saved) ? saved : (courses[0]?.id || '');
  });

  const activeCourse = courses.find(c => c.id === activeCourseId) || courses[0] || null;

  const [activeVideoId, setActiveVideoIdState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_VIDEO);
    if (saved && activeCourse?.videos.some(v => v.id === saved)) return saved;
    return activeCourse?.videos[0]?.id || '';
  });

  const activeVideo = activeCourse?.videos.find(v => v.id === activeVideoId) || activeCourse?.videos[0];

  // 2. Notes State
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load notes from localStorage', e);
    }
    return {};
  });

  const [isNoteSaving, setIsNoteSaving] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // 3. Pomodoro State
  const [pomodoroSettings, setPomodoroSettings] = useState<PomodoroSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POMODORO_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_POMO_SETTINGS;
  });

  const [pomodoroStats, setPomodoroStats] = useState<PomodoroStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POMODORO_STATS);
      if (saved) {
        const parsed = JSON.parse(saved);
        const today = new Date().toISOString().split('T')[0];
        if (parsed.lastActiveDate !== today) {
          return {
            ...parsed,
            todayFocusMinutes: 0,
            lastActiveDate: today,
          };
        }
        return parsed;
      }
    } catch {}
    return DEFAULT_POMO_STATS;
  });

  const [pomodoroMode, setPomodoroMode] = useState<PomodoroMode>('work');
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState<number>(pomodoroSettings.workDuration * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState<boolean>(false);
  const [isPomodoroExpanded, setIsPomodoroExpanded] = useState<boolean>(false);

  // 4. YouTube Player API Reference
  const [ytPlayer, setYtPlayer] = useState<any>(null);
  const [playerState, setPlayerState] = useState<string>('unstarted');

  // 5. UI Layout toggles
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(true);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // --- Cloud Sync Effect (Supabase) ---
  useEffect(() => {
    if (!userId || !isSupabaseConfigured) return;
    let isSubscribed = true;

    const syncFromCloud = async () => {
      setIsCloudSyncing(true);
      try {
        // 1. Fetch courses from Supabase
        const cloudCourses = await fetchUserCoursesFromCloud(userId);
        if (isSubscribed && cloudCourses !== null) {
          if (cloudCourses.length > 0) {
            setCourses(cloudCourses);
            setActiveCourseIdState(cloudCourses[0].id);
            if (cloudCourses[0].videos[0]) {
              setActiveVideoIdState(cloudCourses[0].videos[0].id);
            }
          } else if (courses.length > 0) {
            // First-time sync: migrate local courses to cloud!
            for (const c of courses) {
              await upsertUserCourseToCloud(userId, c);
            }
          }
        }

        // 2. Fetch notes from Supabase
        const cloudNotes = await fetchUserNotesFromCloud(userId);
        if (isSubscribed && cloudNotes !== null) {
          setNotes(prev => ({ ...prev, ...cloudNotes }));
        }

        // 3. Fetch Pomodoro streak from Supabase
        const cloudStreak = await fetchUserStreakFromCloud(userId);
        if (isSubscribed && cloudStreak !== null) {
          setPomodoroStats(cloudStreak);
        }
      } catch (err) {
        console.warn('Cloud sync error:', err);
      } finally {
        if (isSubscribed) setIsCloudSyncing(false);
      }
    };

    syncFromCloud();

    return () => {
      isSubscribed = false;
    };
  }, [userId]);

  // Persist courses to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    } catch (e) {
      console.error(e);
    }
  }, [courses]);

  // Save active course & video selection
  const setActiveCourseId = useCallback((id: string) => {
    setActiveCourseIdState(id);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_COURSE, id);
    const target = courses.find(c => c.id === id);
    if (target && target.videos.length > 0) {
      setActiveVideoIdState(target.videos[0].id);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_VIDEO, target.videos[0].id);
    }
  }, [courses]);

  const setActiveVideoId = useCallback((id: string) => {
    setActiveVideoIdState(id);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_VIDEO, id);
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (e) {
      console.error(e);
    }
  }, [notes]);

  // Save Pomodoro Settings & Stats
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.POMODORO_SETTINGS, JSON.stringify(pomodoroSettings));
    } catch {}
  }, [pomodoroSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.POMODORO_STATS, JSON.stringify(pomodoroStats));
    } catch {}
  }, [pomodoroStats]);

  // Toggle Video Completion
  const toggleVideoCompletion = useCallback((courseId: string, videoId: string) => {
    setCourses(prev => {
      const updated = prev.map(c => {
        if (c.id !== courseId) return c;
        const updatedVideos = c.videos.map(v => {
          if (v.id !== videoId) return v;
          const nextCompleted = !v.completed;
          if (nextCompleted) {
            const remaining = c.videos.filter(x => x.id !== videoId && !x.completed);
            if (remaining.length === 0) {
              soundManager.playSuccess();
              confetti({
                particleCount: 120,
                spread: 70,
                origin: { y: 0.6 }
              });
            } else {
              soundManager.playCheck();
            }
          }
          return { ...v, completed: nextCompleted };
        });
        const updatedCourse = { ...c, videos: updatedVideos };
        if (userId) {
          upsertUserCourseToCloud(userId, updatedCourse);
        }
        return updatedCourse;
      });
      return updated;
    });
  }, [userId]);

  // Set Video Completed (idempotent, triggers celebrations on first-time completion)
  const setVideoCompleted = useCallback((courseId: string, videoId: string, completed: boolean) => {
    setCourses(prev => {
      let isFirstTime = false;
      const updated = prev.map(c => {
        if (c.id !== courseId) return c;
        const currentVid = c.videos.find(v => v.id === videoId);
        if (currentVid && currentVid.completed !== completed) {
          if (completed) isFirstTime = true;
        } else {
          return c; // Already in target completed state
        }

        const updatedVideos = c.videos.map(v => {
          if (v.id !== videoId) return v;
          return { ...v, completed };
        });

        const updatedCourse = { ...c, videos: updatedVideos };
        if (userId) {
          upsertUserCourseToCloud(userId, updatedCourse);
        }
        return updatedCourse;
      });

      if (isFirstTime) {
        soundManager.playCheck();
        const course = prev.find(c => c.id === courseId);
        const remaining = course ? course.videos.filter(x => x.id !== videoId && !x.completed) : [];
        if (remaining.length === 0) {
          soundManager.playSuccess();
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }

      return updated;
    });
  }, [userId]);

  const markCourseCompleted = useCallback((courseId: string, completed: boolean) => {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      const updated = {
        ...c,
        videos: c.videos.map(v => ({ ...v, completed }))
      };
      if (userId) {
        upsertUserCourseToCloud(userId, updated);
      }
      return updated;
    }));
    if (completed) {
      soundManager.playSuccess();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    }
  }, [userId]);

  // Add custom course
  const addCourse = useCallback((newCourse: Course) => {
    setCourses(prev => [newCourse, ...prev]);
    setActiveCourseId(newCourse.id);
    if (newCourse.videos[0]) {
      setActiveVideoId(newCourse.videos[0].id);
    }
    if (userId) {
      upsertUserCourseToCloud(userId, newCourse);
    }
  }, [setActiveCourseId, setActiveVideoId, userId]);

  // Update course videos dynamically (e.g. when synced from YouTube playlist API)
  const updateCourseVideos = useCallback((courseId: string, updatedVideos: VideoItem[], updatedTitle?: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      const updated = {
        ...c,
        title: updatedTitle || c.title,
        videos: updatedVideos,
      };
      if (userId) {
        upsertUserCourseToCloud(userId, updated);
      }
      return updated;
    }));
  }, [userId]);

  // Delete course
  const deleteCourse = useCallback((courseId: string) => {
    setCourses(prev => {
      const remaining = prev.filter(c => c.id !== courseId);
      return remaining;
    });
    if (activeCourseId === courseId) {
      const remaining = courses.filter(c => c.id !== courseId);
      const next = remaining[0];
      if (next) {
        setActiveCourseId(next.id);
      } else {
        setActiveCourseIdState('');
        setActiveVideoIdState('');
      }
    }
    if (userId) {
      deleteUserCourseFromCloud(userId, courseId);
    }
  }, [activeCourseId, courses, setActiveCourseId, userId]);

  // Reset all to empty
  const resetAllData = useCallback(() => {
    if (window.confirm('Are you sure you want to clear your courses, progress, and timer stats?')) {
      localStorage.clear();
      setCourses([]);
      setActiveCourseIdState('');
      setActiveVideoIdState('');
      setNotes({});
      setPomodoroSettings(DEFAULT_POMO_SETTINGS);
      setPomodoroStats(DEFAULT_POMO_STATS);
      setPomodoroMode('work');
      setPomodoroTimeLeft(DEFAULT_POMO_SETTINGS.workDuration * 60);
      setIsPomodoroRunning(false);
    }
  }, []);

  // Notes operations
  const currentNoteKey = `${activeCourseId}_${activeVideo?.id || ''}`;
  const getNoteForCurrentVideo = useCallback(() => {
    return notes[currentNoteKey] ?? (activeVideo ? `# Notes: ${activeVideo.title}\n\n- Key concepts:\n- ` : '');
  }, [notes, currentNoteKey, activeVideo]);

  const saveTimeoutRef = useRef<number | null>(null);
  const saveNoteForCurrentVideo = useCallback((content: string) => {
    setIsNoteSaving(true);
    setNotes(prev => ({
      ...prev,
      [currentNoteKey]: content,
    }));

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = window.setTimeout(() => {
      setIsNoteSaving(false);
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      // Sync note to cloud
      if (userId && activeVideo) {
        upsertUserNoteToCloud(userId, activeVideo.id, content);
      }
    }, 600);
  }, [currentNoteKey, userId, activeVideo]);

  // Pomodoro Actions
  const timerIntervalRef = useRef<number | null>(null);

  const startPomodoro = useCallback(() => {
    setIsPomodoroRunning(true);
    if (pomodoroSettings.soundEnabled) {
      soundManager.playStart();
    }
  }, [pomodoroSettings.soundEnabled]);

  const pausePomodoro = useCallback(() => {
    setIsPomodoroRunning(false);
  }, []);

  const resetPomodoro = useCallback(() => {
    setIsPomodoroRunning(false);
    const duration = pomodoroMode === 'work' 
      ? pomodoroSettings.workDuration 
      : pomodoroMode === 'shortBreak' 
      ? pomodoroSettings.shortBreakDuration 
      : pomodoroSettings.longBreakDuration;
    setPomodoroTimeLeft(duration * 60);
  }, [pomodoroMode, pomodoroSettings]);

  const handleSetPomodoroMode = useCallback((mode: PomodoroMode) => {
    setPomodoroMode(mode);
    setIsPomodoroRunning(false);
    const duration = mode === 'work' 
      ? pomodoroSettings.workDuration 
      : mode === 'shortBreak' 
      ? pomodoroSettings.shortBreakDuration 
      : pomodoroSettings.longBreakDuration;
    setPomodoroTimeLeft(duration * 60);
  }, [pomodoroSettings]);

  const updatePomodoroSettings = useCallback((newSettings: Partial<PomodoroSettings>) => {
    setPomodoroSettings(prev => {
      const updated = { ...prev, ...newSettings };
      return updated;
    });
  }, []);

  const handleTimerComplete = useCallback(() => {
    setIsPomodoroRunning(false);
    if (pomodoroSettings.soundEnabled) {
      soundManager.playAlarm();
    }

    if (pomodoroMode === 'work') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      const today = new Date().toISOString().split('T')[0];
      setPomodoroStats(prev => {
        const isConsecutiveDay = prev.lastActiveDate !== today;
        const newStreak = isConsecutiveDay ? prev.streakDays + 1 : prev.streakDays;
        const updated = {
          sessionsCompleted: prev.sessionsCompleted + 1,
          todayFocusMinutes: prev.todayFocusMinutes + pomodoroSettings.workDuration,
          streakDays: newStreak,
          lastActiveDate: today,
        };
        if (userId) {
          upsertUserStreakToCloud(userId, updated);
        }
        return updated;
      });

      // Trigger Celebration Modal for deep work completion
      setTimerCelebration({
        type: 'work',
        durationMinutes: pomodoroSettings.workDuration,
      });
    } else {
      // Break ended -> Trigger Break Celebration Modal
      setTimerCelebration({
        type: 'break',
        durationMinutes: pomodoroMode === 'shortBreak' ? pomodoroSettings.shortBreakDuration : pomodoroSettings.longBreakDuration,
      });
    }
  }, [pomodoroMode, pomodoroSettings, userId]);

  const startBreakAfterWork = useCallback(() => {
    setTimerCelebration(null);
    const isLong = (pomodoroStats.sessionsCompleted) % 4 === 0 && pomodoroStats.sessionsCompleted > 0;
    const breakMode = isLong ? 'longBreak' : 'shortBreak';
    handleSetPomodoroMode(breakMode);
    setIsPomodoroRunning(true);
  }, [pomodoroStats.sessionsCompleted, handleSetPomodoroMode]);

  const startNextSprint = useCallback(() => {
    setTimerCelebration(null);
    handleSetPomodoroMode('work');
    setIsPomodoroRunning(true);
  }, [handleSetPomodoroMode]);

  const extendBreak = useCallback((extraMinutes: number = 5) => {
    setTimerCelebration(null);
    setPomodoroTimeLeft(extraMinutes * 60);
    setIsPomodoroRunning(true);
  }, []);

  const skipPomodoro = useCallback(() => {
    handleTimerComplete();
  }, [handleTimerComplete]);

  // Pomodoro countdown timer tick
  useEffect(() => {
    if (isPomodoroRunning) {
      timerIntervalRef.current = window.setInterval(() => {
        setPomodoroTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isPomodoroRunning, handleTimerComplete]);

  // YouTube Controller helper
  const seekTo = useCallback((seconds: number) => {
    if (ytPlayer && typeof ytPlayer.seekTo === 'function') {
      ytPlayer.seekTo(seconds, true);
    }
  }, [ytPlayer]);

  const getCurrentPlayerTime = useCallback((): number => {
    if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
      return Math.floor(ytPlayer.getCurrentTime());
    }
    return 0;
  }, [ytPlayer]);

  return (
    <AppContext.Provider
      value={{
        courses,
        activeCourse,
        activeVideo,
        activeCourseId,
        activeVideoId,
        setActiveCourseId,
        setActiveVideoId,
        toggleVideoCompletion,
        setVideoCompleted,
        markCourseCompleted,
        addCourse,
        updateCourseVideos,
        deleteCourse,
        resetAllData,
        getNoteForCurrentVideo,
        saveNoteForCurrentVideo,
        isNoteSaving,
        lastSavedTime,
        pomodoroMode,
        pomodoroTimeLeft,
        isPomodoroRunning,
        pomodoroSettings,
        pomodoroStats,
        startPomodoro,
        pausePomodoro,
        resetPomodoro,
        skipPomodoro,
        setPomodoroMode: handleSetPomodoroMode,
        updatePomodoroSettings,
        isPomodoroExpanded,
        setIsPomodoroExpanded,
        timerCelebration,
        setTimerCelebration,
        startNextSprint,
        startBreakAfterWork,
        extendBreak,
        ytPlayer,
        setYtPlayer,
        seekTo,
        getCurrentPlayerTime,
        playerState,
        setPlayerState,
        isSidebarOpen,
        setIsSidebarOpen,
        isNotesOpen,
        setIsNotesOpen,
        isTheaterMode,
        setIsTheaterMode,
        isAddModalOpen,
        setIsAddModalOpen,
        hasClerkKey,
        currentView,
        setCurrentView,
        savePlaybackPosition,
        getPlaybackPosition,
        clearPlaybackPosition,
        isCloudConnected: isSupabaseConfigured,
        isCloudSyncing,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
