import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Course, VideoItem, PomodoroMode, PomodoroSettings, PomodoroStats } from '../types';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

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
  markCourseCompleted: (courseId: string, completed: boolean) => void;
  addCourse: (course: Course) => void;
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
}

const STORAGE_KEYS = {
  COURSES: 'devtrack_courses_v2',
  ACTIVE_COURSE: 'devtrack_active_course_v2',
  ACTIVE_VIDEO: 'devtrack_active_video_v2',
  NOTES: 'devtrack_notes_v2',
  POMODORO_SETTINGS: 'devtrack_pomo_settings_v2',
  POMODORO_STATS: 'devtrack_pomo_stats_v2',
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

export const AppProvider: React.FC<{ children: React.ReactNode; hasClerkKey?: boolean }> = ({ 
  children, 
  hasClerkKey = false 
}) => {
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
      if (saved) return { ...DEFAULT_POMO_SETTINGS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_POMO_SETTINGS;
  });

  const [pomodoroStats, setPomodoroStats] = useState<PomodoroStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POMODORO_STATS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_POMO_STATS;
  });

  const [pomodoroMode, setPomodoroMode] = useState<PomodoroMode>('work');
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState<number>(pomodoroSettings.workDuration * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState<boolean>(false);
  const [isPomodoroExpanded, setIsPomodoroExpanded] = useState<boolean>(false);

  // 4. YouTube Player instance
  const [ytPlayer, setYtPlayer] = useState<any>(null);
  const [playerState, setPlayerState] = useState<string>('unstarted');

  // 5. Layout State
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(true);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Save courses to localStorage
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
      return prev.map(c => {
        if (c.id !== courseId) return c;
        const updatedVideos = c.videos.map(v => {
          if (v.id !== videoId) return v;
          const nextCompleted = !v.completed;
          if (nextCompleted) {
            // Check if completing this makes the whole course completed!
            const remaining = c.videos.filter(x => x.id !== videoId && !x.completed);
            if (remaining.length === 0) {
              soundManager.playSuccess();
              confetti({
                particleCount: 120,
                spread: 70,
                origin: { y: 0.6 }
              });
            } else {
              soundManager.playClick();
            }
          }
          return { ...v, completed: nextCompleted };
        });
        return { ...c, videos: updatedVideos };
      });
    });
  }, []);

  const markCourseCompleted = useCallback((courseId: string, completed: boolean) => {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      return {
        ...c,
        videos: c.videos.map(v => ({ ...v, completed }))
      };
    }));
    if (completed) {
      soundManager.playSuccess();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    }
  }, []);

  // Add custom course
  const addCourse = useCallback((newCourse: Course) => {
    setCourses(prev => [newCourse, ...prev]);
    setActiveCourseId(newCourse.id);
    if (newCourse.videos[0]) {
      setActiveVideoId(newCourse.videos[0].id);
    }
  }, [setActiveCourseId, setActiveVideoId]);

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
  }, [activeCourseId, courses, setActiveCourseId]);

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
      const now = new Date();
      setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 600);
  }, [currentNoteKey]);

  // Pomodoro timer tick loop
  useEffect(() => {
    let interval: number | null = null;
    if (isPomodoroRunning) {
      interval = window.setInterval(() => {
        setPomodoroTimeLeft(prev => {
          if (prev <= 1) {
            // Mode completed!
            if (pomodoroSettings.soundEnabled) {
              soundManager.playChime();
            }
            confetti({ particleCount: 60, spread: 60, origin: { y: 0.2 } });

            // Update stats if finishing a work session
            if (pomodoroMode === 'work') {
              setPomodoroStats(cur => {
                const today = new Date().toISOString().split('T')[0];
                const streak = cur.lastActiveDate === today ? cur.streakDays : cur.streakDays + 1;
                return {
                  sessionsCompleted: cur.sessionsCompleted + 1,
                  todayFocusMinutes: cur.todayFocusMinutes + pomodoroSettings.workDuration,
                  streakDays: streak,
                  lastActiveDate: today,
                };
              });
              // Transition to short break or long break
              const nextMode = (pomodoroStats.sessionsCompleted + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
              setPomodoroMode(nextMode);
              return (nextMode === 'longBreak' ? pomodoroSettings.longBreakDuration : pomodoroSettings.shortBreakDuration) * 60;
            } else {
              // Break finished -> switch back to work
              setPomodoroMode('work');
              return pomodoroSettings.workDuration * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPomodoroRunning, pomodoroMode, pomodoroSettings, pomodoroStats.sessionsCompleted]);

  const startPomodoro = useCallback(() => {
    soundManager.playClick();
    setIsPomodoroRunning(true);
  }, []);

  const pausePomodoro = useCallback(() => {
    soundManager.playClick();
    setIsPomodoroRunning(false);
  }, []);

  const resetPomodoro = useCallback(() => {
    soundManager.playClick();
    setIsPomodoroRunning(false);
    const duration =
      pomodoroMode === 'work'
        ? pomodoroSettings.workDuration
        : pomodoroMode === 'shortBreak'
        ? pomodoroSettings.shortBreakDuration
        : pomodoroSettings.longBreakDuration;
    setPomodoroTimeLeft(duration * 60);
  }, [pomodoroMode, pomodoroSettings]);

  const skipPomodoro = useCallback(() => {
    soundManager.playClick();
    setIsPomodoroRunning(false);
    const nextMode: PomodoroMode = pomodoroMode === 'work' ? 'shortBreak' : 'work';
    setPomodoroMode(nextMode);
    const duration = nextMode === 'work' ? pomodoroSettings.workDuration : pomodoroSettings.shortBreakDuration;
    setPomodoroTimeLeft(duration * 60);
  }, [pomodoroMode, pomodoroSettings]);

  const handleSetPomodoroMode = useCallback((mode: PomodoroMode) => {
    soundManager.playClick();
    setPomodoroMode(mode);
    setIsPomodoroRunning(false);
    const duration =
      mode === 'work'
        ? pomodoroSettings.workDuration
        : mode === 'shortBreak'
        ? pomodoroSettings.shortBreakDuration
        : pomodoroSettings.longBreakDuration;
    setPomodoroTimeLeft(duration * 60);
  }, [pomodoroSettings]);

  const updatePomodoroSettings = useCallback((newSettings: Partial<PomodoroSettings>) => {
    setPomodoroSettings(prev => {
      const updated = { ...prev, ...newSettings };
      // update time left if currently in that mode and paused
      if (!isPomodoroRunning) {
        if (pomodoroMode === 'work' && newSettings.workDuration) {
          setPomodoroTimeLeft(newSettings.workDuration * 60);
        } else if (pomodoroMode === 'shortBreak' && newSettings.shortBreakDuration) {
          setPomodoroTimeLeft(newSettings.shortBreakDuration * 60);
        } else if (pomodoroMode === 'longBreak' && newSettings.longBreakDuration) {
          setPomodoroTimeLeft(newSettings.longBreakDuration * 60);
        }
      }
      return updated;
    });
  }, [isPomodoroRunning, pomodoroMode]);

  // YouTube API Player seek helper
  const seekTo = useCallback((seconds: number) => {
    if (ytPlayer && typeof ytPlayer.seekTo === 'function') {
      ytPlayer.seekTo(seconds, true);
      if (typeof ytPlayer.playVideo === 'function') {
        ytPlayer.playVideo();
      }
    }
  }, [ytPlayer]);

  const getCurrentPlayerTime = useCallback((): number => {
    if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
      try {
        return Math.floor(ytPlayer.getCurrentTime());
      } catch {
        return 0;
      }
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
        markCourseCompleted,
        addCourse,
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
