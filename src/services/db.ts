import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Course, PomodoroStats } from '../types';

/**
 * Supabase Data Service
 * Transparently manages cloud persistence for courses, notes, and focus streaks
 * tied to Clerk user IDs.
 */

// 1. User Courses
export async function fetchUserCoursesFromCloud(userId: string): Promise<Course[] | null> {
  if (!isSupabaseConfigured || !supabase || !userId) return null;
  try {
    const { data, error } = await supabase
      .from('user_courses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchUserCourses notice:', error.message);
      return null;
    }

    if (!data) return [];

    return data.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      playlistId: row.playlist_id || undefined,
      videos: Array.isArray(row.videos) ? row.videos : [],
    }));
  } catch (err) {
    console.warn('Error fetching courses from Supabase:', err);
    return null;
  }
}

export async function upsertUserCourseToCloud(userId: string, course: Course): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !userId) return false;
  try {
    const { error } = await supabase
      .from('user_courses')
      .upsert({
        id: course.id,
        user_id: userId,
        title: course.title,
        description: course.description || '',
        playlist_id: course.playlistId || null,
        videos: course.videos,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.warn('Supabase upsertUserCourse error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error saving course to Supabase:', err);
    return false;
  }
}

export async function deleteUserCourseFromCloud(userId: string, courseId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !userId) return false;
  try {
    const { error } = await supabase
      .from('user_courses')
      .delete()
      .eq('user_id', userId)
      .eq('id', courseId);

    if (error) {
      console.warn('Supabase deleteUserCourse error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error deleting course from Supabase:', err);
    return false;
  }
}

// 2. User Notes
export async function fetchUserNotesFromCloud(userId: string): Promise<Record<string, string> | null> {
  if (!isSupabaseConfigured || !supabase || !userId) return null;
  try {
    const { data, error } = await supabase
      .from('user_notes')
      .select('video_id, content')
      .eq('user_id', userId);

    if (error) {
      console.warn('Supabase fetchUserNotes notice:', error.message);
      return null;
    }

    const notesMap: Record<string, string> = {};
    if (data) {
      data.forEach(row => {
        notesMap[row.video_id] = row.content || '';
      });
    }
    return notesMap;
  } catch (err) {
    console.warn('Error fetching notes from Supabase:', err);
    return null;
  }
}

export async function upsertUserNoteToCloud(userId: string, videoId: string, content: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !userId) return false;
  try {
    const noteId = `${userId}_${videoId}`;
    const { error } = await supabase
      .from('user_notes')
      .upsert({
        id: noteId,
        user_id: userId,
        video_id: videoId,
        content,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.warn('Supabase upsertUserNote error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error saving note to Supabase:', err);
    return false;
  }
}

// 3. User Study Streaks & Stats
export async function fetchUserStreakFromCloud(userId: string): Promise<PomodoroStats | null> {
  if (!isSupabaseConfigured || !supabase || !userId) return null;
  try {
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // PGRST116 means 0 rows found, which is normal for new users
      if (error.code !== 'PGRST116') {
        console.warn('Supabase fetchUserStreak notice:', error.message);
      }
      return null;
    }

    if (!data) return null;

    return {
      streakDays: data.streak_days || 0,
      sessionsCompleted: data.sessions_completed || 0,
      todayFocusMinutes: data.today_focus_minutes || 0,
      lastActiveDate: data.last_study_date || new Date().toISOString().split('T')[0],
    };
  } catch (err) {
    console.warn('Error fetching streak from Supabase:', err);
    return null;
  }
}

export async function upsertUserStreakToCloud(userId: string, stats: PomodoroStats): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !userId) return false;
  try {
    const { error } = await supabase
      .from('user_streaks')
      .upsert({
        user_id: userId,
        streak_days: stats.streakDays,
        sessions_completed: stats.sessionsCompleted,
        today_focus_minutes: stats.todayFocusMinutes,
        last_study_date: stats.lastActiveDate,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.warn('Supabase upsertUserStreak error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error saving streak to Supabase:', err);
    return false;
  }
}
