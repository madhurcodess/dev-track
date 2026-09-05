export interface VideoItem {
  id: string;
  youtubeId: string;
  title: string;
  duration?: string;
  completed: boolean;
  thumbnail?: string;
}

export interface Course {
  id: string;
  title: string;
  author?: string;
  description?: string;
  playlistId?: string;
  videos: VideoItem[];
}

export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

export interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  soundEnabled: boolean;
}

export interface PomodoroStats {
  sessionsCompleted: number;
  todayFocusMinutes: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
}

export interface VideoNote {
  videoId: string;
  courseId: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  updatedAt: number;
}
