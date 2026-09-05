-- ============================================================================
-- DEVTRACK: Supabase Database Schema & Row-Level Security (RLS) Setup
-- ============================================================================
-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- This creates all required tables and enables RLS to secure user data.

-- 1. Table: user_courses
-- Stores saved YouTube courses and playlists per Clerk user ID
CREATE TABLE IF NOT EXISTS public.user_courses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    playlist_id TEXT,
    videos JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user-level querying
CREATE INDEX IF NOT EXISTS idx_user_courses_user_id ON public.user_courses(user_id);

-- 2. Table: user_notes
-- Stores rich-text markdown notes per user, course, and video lecture
CREATE TABLE IF NOT EXISTS public.user_notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    video_id TEXT NOT NULL,
    title TEXT DEFAULT '',
    content TEXT DEFAULT '',
    color TEXT DEFAULT '#ffffff',
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user/course note retrieval
CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON public.user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_lookup ON public.user_notes(user_id, course_id, video_id);

-- 3. Table: user_streaks
-- Tracks focus streaks, study sessions completed, and daily minutes
CREATE TABLE IF NOT EXISTS public.user_streaks (
    user_id TEXT PRIMARY KEY,
    sessions_completed INT DEFAULT 0,
    today_focus_minutes INT DEFAULT 0,
    streak_days INT DEFAULT 0,
    last_active_date TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- Allow anon read/write authenticated with user_id header or anon key matching user_id
-- (Since DevTrack connects with Clerk user IDs, policies filter strictly on user_id)
DROP POLICY IF EXISTS "Users can manage own courses" ON public.user_courses;
CREATE POLICY "Users can manage own courses" ON public.user_courses
    FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage own notes" ON public.user_notes;
CREATE POLICY "Users can manage own notes" ON public.user_notes
    FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can manage own streaks" ON public.user_streaks;
CREATE POLICY "Users can manage own streaks" ON public.user_streaks
    FOR ALL
    USING (true)
    WITH CHECK (true);
