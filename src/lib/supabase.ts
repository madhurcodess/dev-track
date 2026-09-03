import { createClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = 'https://gwctdvjdfvhunwpukdyi.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3Y3RkdmpkZnZodW53cHVrZHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDgzNzIsImV4cCI6MjEwNDAyNDM3Mn0.S4l4-nwsmbGeY05DWg9fBg1t9nNDIctos7SzgFIv12Q';

const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabaseUrl = (envUrl && !envUrl.includes('your-project')) ? envUrl.trim() : FALLBACK_SUPABASE_URL;
const supabaseAnonKey = (envAnonKey && !envAnonKey.includes('your_supabase_anon_key')) ? envAnonKey.trim() : FALLBACK_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
