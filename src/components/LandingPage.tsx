import React, { useState } from 'react';
import { 
  SignInButton, 
  SignUpButton, 
} from '@clerk/clerk-react';
import { 
  Check, 
  ExternalLink, 
  Key, 
  X, 
  Plus, 
  Minus, 
  Play, 
  Clock, 
  BookmarkPlus, 
  Flame, 
  CheckCircle2, 
  Laptop 
} from 'lucide-react';

interface LandingPageProps {
  hasClerkKey: boolean;
  onEnterDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ hasClerkKey, onEnterDemo }) => {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F5] text-[#121417] font-sans antialiased selection:bg-[#EBF755] selection:text-black flex flex-col">
      
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 w-full border-b border-[#121417]/10 bg-[#F9F8F5]/90 backdrop-blur-md px-6 lg:px-12 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#121417] text-[#EBF755] flex items-center justify-center font-black text-sm tracking-tighter">
            DT
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[#121417]">
            DevTrack
          </span>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#121417]/80">
          <a href="#how-it-works" className="hover:text-black transition-colors">How it works</a>
          <a href="#features" className="hover:text-black transition-colors">Features</a>
          <a href="#metrics" className="hover:text-black transition-colors">Stats</a>
          <a href="#workflow" className="hover:text-black transition-colors">Workflow</a>
          <a href="#faq" className="hover:text-black transition-colors">FAQ</a>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          {hasClerkKey ? (
            <>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-xs font-bold text-[#121417] hover:text-black transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#D4E4FC] hover:bg-[#C2DBFB] text-[#121417] border border-[#121417]/15 shadow-sm transition-all hover:scale-105">
                  Get Started Free
                </button>
              </SignUpButton>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowKeyModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-white hover:bg-slate-50 text-[#121417] border border-[#121417]/20 transition-all shadow-sm"
              >
                <Key className="w-3.5 h-3.5 text-indigo-600" />
                <span>Clerk Key</span>
              </button>
              <button
                onClick={onEnterDemo}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#D4E4FC] hover:bg-[#C2DBFB] text-[#121417] border border-[#121417]/15 shadow-sm transition-all hover:scale-105"
              >
                Launch App Demo
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. HERO SECTION (CREAM BACKGROUND) */}
      <section className="relative pt-16 pb-20 px-6 lg:px-12 max-w-5xl mx-auto flex flex-col items-center text-center">
        
        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#121417] max-w-3xl leading-[1.12]">
          Unlock effortless YouTube learning with your own interactive course tracker.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-[#121417]/75 max-w-xl leading-relaxed font-medium">
          Paste any playlist URL. Take timestamped notes that seek playback, track completed lectures, and build an unbreakable focus streak.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          {hasClerkKey ? (
            <SignUpButton mode="modal">
              <button className="px-6 py-3 rounded-full text-xs font-bold bg-[#D4E4FC] hover:bg-[#C2DBFB] text-[#121417] border border-[#121417]/20 shadow-sm transition-all hover:scale-105">
                Try DevTrack Free
              </button>
            </SignUpButton>
          ) : (
            <button
              onClick={onEnterDemo}
              className="px-6 py-3 rounded-full text-xs font-bold bg-[#D4E4FC] hover:bg-[#C2DBFB] text-[#121417] border border-[#121417]/20 shadow-sm transition-all hover:scale-105"
            >
              Try DevTrack Free
            </button>
          )}

          <a
            href="#how-it-works"
            className="px-6 py-3 rounded-full text-xs font-bold bg-white hover:bg-slate-50 text-[#121417] border border-[#121417]/20 shadow-sm transition-all hover:scale-105"
          >
            See Demo
          </a>
        </div>

        {/* CENTRAL VIDEO PLAYER PREVIEW CARD */}
        <div className="mt-14 w-full max-w-3xl relative">
          
          {/* Handwritten Annotation Sticker ("Watch Demo") */}
          <div className="absolute -top-7 right-6 sm:right-10 flex flex-col items-center pointer-events-none z-20">
            <span className="font-hand text-xl sm:text-2xl font-bold text-[#121417] -rotate-6">
              Watch Demo!
            </span>
            <svg className="w-8 h-8 -rotate-12 text-[#121417]" viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 10 Q 25 35 40 40 M 30 40 L 40 40 L 38 30" />
            </svg>
          </div>

          {/* Video Mockup Container */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-[#121417] bg-[#121417] shadow-solid-lg aspect-video flex items-center justify-center group cursor-pointer" onClick={onEnterDemo}>
            {/* Background Image Representation */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 opacity-90" />

            {/* Mock Screen Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between z-10 text-left">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-mono border border-white/20">
                  Lecture 01 &bull; Core Java & OOP Masterclass
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#EBF755] text-black text-[11px] font-bold">
                  LIVE WORKSPACE
                </span>
              </div>

              {/* Big Center Play Button */}
              <div className="self-center flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#EBF755] text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 fill-current ml-1" />
                </div>
                {/* Floating sticker on player (matching "Hey Friends" in reference) */}
                <div className="px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[#121417] font-hand text-lg sm:text-xl font-bold shadow-md -rotate-2 border border-black/10">
                  Hey Learners 👋
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-white/80 font-mono">
                <span>04:25 / 45:10</span>
                <span>Click to launch learning workspace &rarr;</span>
              </div>
            </div>
          </div>

          {/* CONTINUOUS YELLOW SQUIGGLE SVG (Reference DNA) */}
          <div className="w-full flex justify-center -mb-8 pointer-events-none">
            <svg className="w-48 sm:w-64 h-32 text-[#EBF755]" viewBox="0 0 200 120" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round">
              <path d="M 100 0 C 120 40, 20 60, 40 100 C 50 120, 160 110, 170 140" />
            </svg>
          </div>
        </div>

        {/* PROBLEM / AGITATION SECTION */}
        <div className="mt-10 max-w-xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121417] tracking-tight">
            Making it on YouTube <br />is tougher than you think.
          </h2>

          {/* Doodle Cloud Illustration / Badges */}
          <div className="relative py-6 flex flex-wrap items-center justify-center gap-2.5">
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#121417]/15 text-xs font-bold text-[#121417] shadow-sm -rotate-2">
              🌀 Tutorial Hell
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#121417]/15 text-xs font-bold text-[#121417] shadow-sm rotate-3">
              ❌ Lost Timestamps
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#121417]/15 text-xs font-bold text-[#121417] shadow-sm -rotate-1">
              📑 Messy Notepad Tabs
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#121417]/15 text-xs font-bold text-[#121417] shadow-sm rotate-2">
              📉 Broken Streaks
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#121417]/15 text-xs font-bold text-[#121417] shadow-sm -rotate-3">
              ⏳ Random Feed Distractions
            </span>
          </div>

          <div className="pt-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#121417]">
              We do it for you. No more struggling to finish courses.
            </h3>
            <p className="mt-2 text-sm text-[#121417]/70 font-medium">
              DevTrack turns chaotic YouTube playlists into an organized university curriculum with zero distraction feeds.
            </p>
          </div>

          {/* Squiggle down */}
          <div className="flex justify-center pt-2">
            <svg className="w-16 h-20 text-[#EBF755]" viewBox="0 0 60 80" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
              <path d="M 30 0 C 10 25, 50 45, 30 75" />
            </svg>
          </div>
        </div>
      </section>

      {/* 3. SIGNATURE LIME / CHARTREUSE COLOR-BLOCKED SECTION (REFERENCE DNA) */}
      <section id="features" className="bg-[#EBF755] text-[#121417] py-20 px-6 lg:px-12 border-y-2 border-[#121417]">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15]">
              We're the structured, world-class YouTube campus you've been dreaming about. No big budgets required.
            </h2>
            <div className="mt-6 inline-flex">
              <span className="px-5 py-2 rounded-full bg-[#121417] text-white text-xs font-bold shadow-solid">
                Platform Features
              </span>
            </div>
          </div>

          {/* 4 Feature Line-Art Cards (2x2 Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-white border-2 border-[#121417] shadow-solid space-y-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF755] border-2 border-[#121417] flex items-center justify-center font-bold text-lg">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">
                One-Click Playlist Loader
              </h3>
              <p className="text-sm text-[#121417]/80 leading-relaxed font-medium">
                Paste any YouTube Playlist URL or individual video links. DevTrack instantly parses every lecture, duration tag, and completion checkbox automatically.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#121417]">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Zero configuration required</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-white border-2 border-[#121417] shadow-solid space-y-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-[#D4E4FC] border-2 border-[#121417] flex items-center justify-center font-bold text-lg">
                <BookmarkPlus className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">
                Clickable Timestamp Seeking
              </h3>
              <p className="text-sm text-[#121417]/80 leading-relaxed font-medium">
                Click "Timestamp Note" while watching to stamp the exact video second. Clicking any timestamp chip in your notes immediately seeks playback to that moment.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#121417]">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Bidirectional player synchronization</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-white border-2 border-[#121417] shadow-solid space-y-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-[#D4E4FC] border-2 border-[#121417] flex items-center justify-center font-bold text-lg">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">
                Pomodoro Focus Engine
              </h3>
              <p className="text-sm text-[#121417]/80 leading-relaxed font-medium">
                Built-in 25-minute study intervals, short breaks, and long breaks with pleasant Web Audio synthesizer chimes that keep you in flow state without audio file errors.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#121417]">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Customizable focus intervals</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl bg-white border-2 border-[#121417] shadow-solid space-y-4 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF755] border-2 border-[#121417] flex items-center justify-center font-bold text-lg">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">
                Daily Streaks & Markdown Export
              </h3>
              <p className="text-sm text-[#121417]/80 leading-relaxed font-medium">
                Build an unbreakable daily streak tracking completed sessions. Export all course notes as clean Markdown (.md) or plain text anytime.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#121417]">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>One-click .md file download</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. METRICS & PROOF SECTION (CREAM WITH PASTEL CARDS) */}
      <section id="metrics" className="py-20 px-6 lg:px-12 max-w-5xl mx-auto text-center">
        
        {/* Headline with Embedded Avatars (Matching Reference Image) */}
        <div className="max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-snug">
            We've helped{' '}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#D4E4FC] border border-[#121417]/20 align-middle text-sm font-bold text-black mx-1">
              👨‍💻 over 10,000+
            </span>{' '}
            learners grow on YouTube.
          </h2>
          <p className="mt-3 text-lg font-bold text-[#121417]/80">
            Now we can do it for you.
          </p>
        </div>

        {/* 3 Pastel Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          
          {/* Card 1: White */}
          <div className="p-6 rounded-3xl bg-white border-2 border-[#121417] shadow-solid space-y-3">
            <span className="text-4xl font-extrabold text-[#121417]">
              120k+
            </span>
            <h4 className="text-sm font-bold text-[#121417]">
              Study Minutes Logged
            </h4>
            <p className="text-xs text-[#121417]/70 font-medium leading-relaxed">
              Engineers and students logging distraction-free Pomodoro study sprints daily.
            </p>
          </div>

          {/* Card 2: Lime */}
          <div className="p-6 rounded-3xl bg-[#EBF755] border-2 border-[#121417] shadow-solid space-y-3">
            <span className="text-4xl font-extrabold text-[#121417]">
              4.9 / 5
            </span>
            <h4 className="text-sm font-bold text-[#121417]">
              Course Completion Rate
            </h4>
            <p className="text-xs text-[#121417]/80 font-medium leading-relaxed">
              Users complete 3x more full playlists compared to standard YouTube tabs.
            </p>
          </div>

          {/* Card 3: Pastel Blue */}
          <div className="p-6 rounded-3xl bg-[#D4E4FC] border-2 border-[#121417] shadow-solid space-y-3">
            <span className="text-4xl font-extrabold text-[#121417]">
              21 Days
            </span>
            <h4 className="text-sm font-bold text-[#121417]">
              Average Focus Streak
            </h4>
            <p className="text-xs text-[#121417]/70 font-medium leading-relaxed">
              Habit-forming streak engine that turns casual watching into disciplined practice.
            </p>
          </div>

        </div>

        {/* Sub-banner: It doesn't matter if you have 5 videos or 1,000+ */}
        <div className="mt-16 p-8 rounded-3xl bg-white border-2 border-[#121417] shadow-solid flex flex-col sm:flex-row items-center justify-between gap-6 text-left max-w-4xl mx-auto">
          <div>
            <h3 className="text-2xl font-extrabold text-[#121417]">
              It doesn't matter if your playlist has 5 videos or 1,000+.
            </h3>
            <p className="text-sm text-[#121417]/70 font-medium mt-1">
              DevTrack handles single lectures, crash courses, and 80-part bootcamps seamlessly.
            </p>
          </div>
          <button
            onClick={onEnterDemo}
            className="px-6 py-3 rounded-full text-xs font-bold bg-[#EBF755] hover:bg-[#E2EF43] text-[#121417] border border-[#121417] shadow-sm flex-shrink-0 transition-transform hover:scale-105"
          >
            Start Tracking Now &rarr;
          </button>
        </div>
      </section>

      {/* 5. DEEP FOREST GREEN WORKFLOW SECTION (REFERENCE DNA) */}
      <section id="workflow" className="bg-[#0D2319] text-white py-24 px-6 lg:px-12 border-t-2 border-[#121417]">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Build world-class coding habits. <br />
            100% Free Forever.
          </h2>
          <p className="mt-4 text-emerald-200/80 text-sm font-medium">
            Everything you need to master tech stacks through free video courses.
          </p>

          {/* 2 Plan Cards (White cards on dark green) */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            
            {/* Plan 1: Free Forever */}
            <div className="p-8 rounded-3xl bg-white text-[#121417] border-2 border-black shadow-solid space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xl">Self-Learner</span>
                <span className="px-3 py-1 rounded-full bg-[#EBF755] text-xs font-bold border border-black">
                  $0 / Free
                </span>
              </div>
              <p className="text-xs text-[#121417]/70 font-medium">
                For students and developers studying online courses.
              </p>
              <ul className="space-y-2 text-xs font-bold pt-2 text-[#121417]/80">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Unlimited YouTube Playlists</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Clickable Timestamp Seeking</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Built-in Pomodoro Focus Timer</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Markdown & Code Export (.md)</li>
              </ul>
              <button
                onClick={onEnterDemo}
                className="w-full mt-4 py-3 rounded-full text-xs font-bold bg-[#D4E4FC] hover:bg-[#C2DBFB] text-[#121417] border border-[#121417]/20 transition-all hover:scale-[1.02]"
              >
                Get Started Free
              </button>
            </div>

            {/* Plan 2: Pro Sync */}
            <div className="p-8 rounded-3xl bg-white text-[#121417] border-2 border-black shadow-solid space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xl">Clerk Account</span>
                <span className="px-3 py-1 rounded-full bg-[#D4E4FC] text-xs font-bold border border-black">
                  Multi-Device
                </span>
              </div>
              <p className="text-xs text-[#121417]/70 font-medium">
                Securely sign in with Google or GitHub to sync data.
              </p>
              <ul className="space-y-2 text-xs font-bold pt-2 text-[#121417]/80">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Google & GitHub 1-Click Sign In</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Cross-device streak maintenance</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Private user data isolation</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Free cloud deployment on Vercel</li>
              </ul>
              {hasClerkKey ? (
                <SignUpButton mode="modal">
                  <button className="w-full mt-4 py-3 rounded-full text-xs font-bold bg-[#EBF755] hover:bg-[#E2EF43] text-[#121417] border border-[#121417] transition-all hover:scale-[1.02]">
                    Create Free Account
                  </button>
                </SignUpButton>
              ) : (
                <button
                  onClick={() => setShowKeyModal(true)}
                  className="w-full mt-4 py-3 rounded-full text-xs font-bold bg-[#EBF755] hover:bg-[#E2EF43] text-[#121417] border border-[#121417] transition-all hover:scale-[1.02]"
                >
                  Connect Clerk Key
                </button>
              )}
            </div>

          </div>

          {/* 4-STEP WINDING ROADMAP WITH DASHED CONNECTORS (REFERENCE DNA) */}
          <div className="mt-24 max-w-2xl mx-auto space-y-12 relative text-center">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-emerald-800 text-emerald-200 font-bold text-xs flex items-center justify-center border border-emerald-600 mb-3">
                1
              </span>
              <h4 className="text-lg font-extrabold text-white">
                Paste any YouTube Playlist Link
              </h4>
              <p className="text-xs text-emerald-200/70 max-w-sm mt-1">
                Paste any video or playlist URL. DevTrack parses the entire tracklist and durations in milliseconds.
              </p>
            </div>

            {/* Dashed connector path */}
            <div className="flex justify-center -my-2">
              <svg className="w-40 h-16 text-emerald-600" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4">
                <path d="M 50 0 C 80 20, 20 20, 50 40" />
              </svg>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-emerald-800 text-emerald-200 font-bold text-xs flex items-center justify-center border border-emerald-600 mb-3">
                2
              </span>
              <h4 className="text-lg font-extrabold text-white">
                Lock In with 25-Min Focus Sprints
              </h4>
              <p className="text-xs text-emerald-200/70 max-w-sm mt-1">
                Start the built-in Pomodoro timer to watch lectures distraction-free with gentle audio chimes.
              </p>
            </div>

            {/* Dashed connector path */}
            <div className="flex justify-center -my-2">
              <svg className="w-40 h-16 text-emerald-600" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4">
                <path d="M 50 0 C 20 20, 80 20, 50 40" />
              </svg>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-emerald-800 text-emerald-200 font-bold text-xs flex items-center justify-center border border-emerald-600 mb-3">
                3
              </span>
              <h4 className="text-lg font-extrabold text-white">
                Take Timestamped Notes with Instant Seek
              </h4>
              <p className="text-xs text-emerald-200/70 max-w-sm mt-1">
                Tag tricky code moments. Click any timestamp in your notes to jump playback directly to that second.
              </p>
            </div>

            {/* Dashed connector path */}
            <div className="flex justify-center -my-2">
              <svg className="w-40 h-16 text-emerald-600" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4">
                <path d="M 50 0 C 80 20, 20 20, 50 40" />
              </svg>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center">
              <span className="w-8 h-8 rounded-full bg-[#EBF755] text-black font-bold text-xs flex items-center justify-center mb-3 shadow-md">
                4
              </span>
              <h4 className="text-lg font-extrabold text-white">
                Export Your Notes & Keep Your Streak Alive
              </h4>
              <p className="text-xs text-emerald-200/70 max-w-sm mt-1">
                Download your notes as clean Markdown (.md) or plain text, build your focus streak, and finish your courses.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 6. FAQ SECTION (CREAM BACKGROUND WITH ACCORDIONS) */}
      <section id="faq" className="py-24 px-6 lg:px-12 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#121417]">
            Have questions?
          </h2>
          <p className="text-sm text-[#121417]/70 font-medium mt-2">
            Everything you need to know about DevTrack and YouTube course learning.
          </p>
        </div>

        {/* Accordion Container */}
        <div className="space-y-3">
          {[
            {
              q: "Can I import any YouTube playlist or video?",
              a: "Yes! Simply paste any standard YouTube playlist link (containing list=...), video link, or bare ID. DevTrack extracts the lectures and embeds the distraction-free player automatically."
            },
            {
              q: "How does the timestamp seeking feature work?",
              a: "When you click 'Timestamp Note' or press Alt+T, DevTrack queries the YouTube Player API for the exact second of video playback and inserts a [mm:ss] tag. Clicking that tag in your notes preview commands the player to jump right to that second."
            },
            {
              q: "Is my progress and notes saved when I close the tab?",
              a: "Yes. All added playlists, lecture completion checkmarks, notes, and Pomodoro streak counts are saved locally in your browser and isolated to your user profile."
            },
            {
              q: "Is DevTrack really 100% free?",
              a: "Yes! DevTrack is completely free and open-source. You can track unlimited courses, take unlimited notes, and use the Pomodoro timer without any subscription."
            },
            {
              q: "How do I host this on Vercel for other people to use?",
              a: "The project repository is ready with vercel.json. You can deploy it with one click by connecting your GitHub repo (github.com/madhurcodess/dev-track) at vercel.com/new."
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="border-2 border-[#121417] rounded-2xl bg-white shadow-solid overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left font-extrabold text-sm sm:text-base text-[#121417] flex items-center justify-between gap-4"
              >
                <span>{item.q}</span>
                <span className="w-7 h-7 rounded-full bg-[#F9F8F5] border border-[#121417]/20 flex items-center justify-center flex-shrink-0">
                  {openFaq === idx ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-[#121417]/75 font-medium leading-relaxed border-t border-[#121417]/10 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. BOTTOM FOOTER */}
      <footer className="border-t border-[#121417]/15 bg-[#F9F8F5] py-8 px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between max-w-6xl mx-auto w-full gap-4 text-xs font-semibold text-[#121417]/70">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#121417] text-[#EBF755] flex items-center justify-center text-[10px] font-black">
            DT
          </div>
          <span>DevTrack &bull; Hey Learners 👋</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://github.com/madhurcodess/dev-track"
            target="_blank"
            rel="noreferrer"
            className="hover:text-black transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GitHub Repository</span>
          </a>
        </div>
      </footer>

      {/* CLERK KEY HELPER MODAL */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border-2 border-[#121417] shadow-solid-lg p-6 relative">
            <button
              onClick={() => setShowKeyModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#EBF755] border-2 border-[#121417] text-[#121417] flex items-center justify-center font-bold">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#121417]">Connect Clerk Key</h3>
                <p className="text-xs text-slate-500 font-medium">Enable cloud user accounts</p>
              </div>
            </div>

            <div className="p-4 bg-[#F9F8F5] rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2 mb-4">
              <p className="font-bold text-[#121417]">Quick 2-minute setup:</p>
              <ol className="list-decimal pl-4 space-y-1 text-slate-600 text-[11px] font-medium">
                <li>Sign up at <a href="https://dashboard.clerk.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-bold inline-flex items-center gap-0.5">dashboard.clerk.com <ExternalLink className="w-2.5 h-2.5" /></a></li>
                <li>Create an app and copy the <strong>Publishable key</strong> (starts with <code>pk_test_...</code>)</li>
                <li>Paste it below to test immediately:</li>
              </ol>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="pk_test_..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="w-full bg-white border-2 border-[#121417] rounded-xl px-4 py-2.5 text-xs text-[#121417] font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EBF755]"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (inputKey.trim().startsWith('pk_')) {
                      localStorage.setItem('devtrack_custom_clerk_key', inputKey.trim());
                      window.location.reload();
                    } else {
                      alert('Please enter a valid Clerk key starting with pk_test_ or pk_live_');
                    }
                  }}
                  className="px-5 py-2 rounded-full bg-[#EBF755] hover:bg-[#E2EF43] text-black text-xs font-extrabold border border-black shadow-sm"
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
