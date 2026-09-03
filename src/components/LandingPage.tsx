import React, { useState } from 'react';
import { 
  SignInButton, 
  SignUpButton, 
} from '@clerk/clerk-react';
import { 
  GraduationCap, 
  Play, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Edit3, 
  FolderPlus, 
  Sparkles, 
  ArrowRight, 
  ExternalLink, 
  Layers, 
  BrainCircuit,
  Key,
  X
} from 'lucide-react';

interface LandingPageProps {
  hasClerkKey: boolean;
  onEnterDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ hasClerkKey, onEnterDemo }) => {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState('');

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              DevTrack
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              PLATFORM
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#streaks" className="hover:text-white transition-colors">Streak Tracker</a>
        </nav>

        {/* Auth CTA */}
        <div className="flex items-center gap-2.5">
          {hasClerkKey ? (
            <>
              <SignInButton mode="modal">
                <button className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5">
                  <span>Get Started Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </SignUpButton>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowKeyModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-white transition-all"
              >
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>Connect Clerk Key</span>
              </button>
              <button
                onClick={onEnterDemo}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
              >
                Open Workspace Demo
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 lg:px-8 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Subtle radial glow background */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Announcement Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6 animate-fade-in shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Interactive Learning Tracker & Focus Platform</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15]">
          Turn Any YouTube Course Into a{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
            Structured Learning Track
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Stop losing track of lectures. Import any YouTube playlist, take notes with clickable video timestamps that seek playback, maintain your daily focus streak, and finish courses.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full justify-center">
          {hasClerkKey ? (
            <SignUpButton mode="modal">
              <button className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]">
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </SignUpButton>
          ) : (
            <button
              onClick={onEnterDemo}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <span>Launch Learning Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-sm font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 text-indigo-400 fill-current" />
            <span>See How It Works</span>
          </a>
        </div>

        {/* Live Mockup / Preview Banner */}
        <div className="mt-14 w-full rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950/60 shadow-2xl p-2.5 backdrop-blur-md">
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {/* Mock Sidebar */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-indigo-400" /> Your Playlists</span>
                <span className="text-[10px] text-indigo-400">75% Done</span>
              </div>
              <div className="space-y-1.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-200 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate">01. Setup & Fundamentals</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate">02. Data Structures & OOP</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/50 text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-700" />
                  <span className="truncate">03. Real World Project</span>
                </div>
              </div>
            </div>

            {/* Mock Player */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
              <div className="w-full aspect-video rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center relative overflow-hidden group">
                <div className="w-10 h-10 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-slate-300">
                  14:20 / 35:00
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 truncate">Embedded Player API</span>
                <span className="text-[10px] text-indigo-400 font-mono">1.25x Speed</span>
              </div>
            </div>

            {/* Mock Notes */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5"><Edit3 className="w-3.5 h-3.5 text-indigo-400" /> Smart Notes</span>
                <span className="text-[10px] text-emerald-400">Auto-saved</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1.5">
                <p className="text-indigo-300 font-bold"># Key Concepts</p>
                <p className="text-slate-400">
                  Click <span className="text-indigo-400 bg-indigo-500/20 px-1 py-0.2 rounded border border-indigo-500/30">[04:15]</span> to jump video.
                </p>
                <div className="p-1.5 rounded bg-slate-950 text-indigo-200 text-[10px]">
                  System.out.println("Success!");
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 px-4 lg:px-8 max-w-6xl mx-auto border-t border-slate-900">
        <div className="text-center mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
            Engineered For Serious Learners
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            Everything You Need To Actually Finish YouTube Playlists
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FolderPlus className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">Instant Playlist Loader</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Paste any YouTube Playlist URL or video ID. The app extracts all lectures with duration and progress checkboxes.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">Clickable Timestamp Notes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click "Timestamp Note" to tag current playback time. Clicking any <code className="text-indigo-300">[12:45]</code> tag immediately seeks the video.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">Pomodoro Focus Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Built-in 25-minute focus intervals and breaks with synthesized Web Audio chimes and custom timer intervals.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">Daily Streak & Stats</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Build daily learning momentum. Track completed sessions, total focused hours, and keep your learning streak alive.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 lg:px-8 max-w-5xl mx-auto border-t border-slate-900">
        <div className="text-center mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
            Simple & Frictionless
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            How DevTrack Works in 3 Steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <span className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold text-sm inline-flex items-center justify-center">
              1
            </span>
            <h3 className="text-base font-bold text-white">Paste YouTube Link</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sign in, click "Add Course", and paste any playlist URL or list of video links. Your tracklist generates instantly.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <span className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/30 font-bold text-sm inline-flex items-center justify-center">
              2
            </span>
            <h3 className="text-base font-bold text-white">Focus & Take Notes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Start the Pomodoro timer, watch without YouTube distractions, and capture timestamped notes with code snippets.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <span className="w-8 h-8 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-bold text-sm inline-flex items-center justify-center">
              3
            </span>
            <h3 className="text-base font-bold text-white">Track Streak & Finish</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mark lectures as completed, watch your progress bar reach 100%, and export your full notes as Markdown (`.md`).
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 text-center border-t border-slate-900 bg-slate-950/50">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
          Ready to Build Your Learning Habit?
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-6 max-w-lg mx-auto">
          Join self-taught developers, university students, and engineers mastering skills online with DevTrack.
        </p>
        {hasClerkKey ? (
          <SignUpButton mode="modal">
            <button className="px-6 py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 transition-all inline-flex items-center gap-2">
              <span>Create Your Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </SignUpButton>
        ) : (
          <button
            onClick={onEnterDemo}
            className="px-6 py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 transition-all inline-flex items-center gap-2"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-slate-900 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-6xl mx-auto w-full gap-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-400">DevTrack &bull; Interactive Learning Tracker</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/madhurcodess/dev-track"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </footer>

      {/* Clerk Key Helper Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-5 relative">
            <button
              onClick={() => setShowKeyModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Connect Clerk Authentication</h3>
                <p className="text-[11px] text-slate-400">Add your free Clerk Publishable key</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5 mb-4">
              <p className="font-semibold text-indigo-300">Quick 2-minute setup:</p>
              <ol className="list-decimal pl-4 space-y-1 text-slate-400 text-[11px]">
                <li>Sign in at <a href="https://dashboard.clerk.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline">dashboard.clerk.com <ExternalLink className="w-2.5 h-2.5 inline" /></a></li>
                <li>Create an application and copy your <strong>Publishable key</strong> (starts with <code>pk_test_...</code>)</li>
                <li>Paste it below:</li>
              </ol>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="pk_test_..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (inputKey.trim().startsWith('pk_')) {
                      localStorage.setItem('devtrack_custom_clerk_key', inputKey.trim());
                      window.location.reload();
                    } else {
                      alert('Please enter a valid Clerk publishable key starting with pk_test_ or pk_live_');
                    }
                  }}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
                >
                  Save & Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
