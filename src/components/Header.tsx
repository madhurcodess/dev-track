import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Flame,
  Coffee,
  LayoutGrid,
  Tv,
  FileText,
  Timer
} from 'lucide-react';
import { AuthBar } from './AuthBar';
import { BrandLogo } from './BrandLogo';
import { formatTime } from '../utils/youtube';

export const Header: React.FC = () => {
  const {
    activeCourse,
    pomodoroStats,
    pomodoroTimeLeft,
    isFloatingTimerOpen,
    setIsFloatingTimerOpen,
    setIsAddModalOpen,
    hasClerkKey,
    currentView,
    setCurrentView,
  } = useApp();

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-[#121417]/10 bg-[#F9F8F5]/95 backdrop-blur-md px-3 sm:px-5 lg:px-6 flex items-center justify-between gap-3">
      {/* Left: Brand Logo */}
      <div className="flex items-center min-w-fit">
        <button 
          onClick={() => setCurrentView('playlists')}
          className="flex items-center text-left transition-transform hover:scale-102"
          title="Back to All Playlists"
        >
          <BrandLogo size="md" />
        </button>
      </div>

      {/* Center: View Switcher Hub (Playlists | Workspace | Notes) */}
      <nav className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#121417]/15 shadow-2xs">
        <button
          onClick={() => setCurrentView('playlists')}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-black transition-all ${
            currentView === 'playlists'
              ? 'bg-[#121417] text-[#EBF755] shadow-xs'
              : 'text-[#121417]/70 hover:text-[#121417] hover:bg-black/5'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Playlists</span>
        </button>

        <button
          onClick={() => setCurrentView('workspace')}
          disabled={!activeCourse}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-black transition-all ${
            currentView === 'workspace'
              ? 'bg-[#121417] text-[#EBF755] shadow-xs'
              : activeCourse
              ? 'text-[#121417]/70 hover:text-[#121417] hover:bg-black/5'
              : 'opacity-40 cursor-not-allowed text-[#121417]/40'
          }`}
          title={!activeCourse ? 'Select a playlist to start learning' : 'Open Learning Workspace'}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>Workspace</span>
        </button>

        <button
          onClick={() => setCurrentView('notes')}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-black transition-all ${
            currentView === 'notes'
              ? 'bg-[#121417] text-[#EBF755] shadow-xs'
              : 'text-[#121417]/70 hover:text-[#121417] hover:bg-black/5'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Notes</span>
        </button>
      </nav>

      {/* Right: Timer, Streak, Add Course, and Auth Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Focus Timer Button (To the left of Streak) */}
        <button
          onClick={() => setIsFloatingTimerOpen(!isFloatingTimerOpen)}
          className="flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-full bg-[#EBF755] hover:bg-[#E2EF43] text-black border-2 border-[#121417] shadow-solid-xs transition-all hover:scale-105 active:scale-95"
          title="Focus Timer"
        >
          <Timer className="w-3.5 h-3.5 text-black" />
          <span className="hidden sm:inline font-black text-xs">Focus Timer</span>
          <span className="font-mono text-[11px] font-extrabold bg-black/10 px-1.5 py-0.2 rounded-md">{formatTime(pomodoroTimeLeft)}</span>
        </button>

        {/* Focus Streak Badge */}
        <div 
          className="flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-full bg-white border-2 border-[#121417] text-[#121417] shadow-solid-xs"
          title={`${pomodoroStats.sessionsCompleted} focus sessions completed today`}
        >
          <Flame className="w-4 h-4 fill-current text-orange-500" />
          <span>{pomodoroStats.streakDays}d Streak</span>
        </div>

        {/* Add Course Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 text-xs font-black px-3.5 sm:px-4 py-1.5 rounded-full bg-[#D4E4FC] hover:bg-[#C2DBFB] border-2 border-[#121417] text-[#121417] transition-all shadow-solid-xs hover:scale-105 active:scale-95"
          title="Import YouTube Playlist or Video"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Course</span>
        </button>

        {/* Buy a Coffee For Developer Button */}
        <a
          href={import.meta.env.VITE_BUY_ME_COFFEE_URL || "https://buymeacoffee.com/madhurcodess"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-full bg-[#FFF4D4] hover:bg-[#EBF755] border-2 border-[#121417] text-[#121417] transition-all shadow-solid-xs hover:scale-105 active:scale-95"
          title="Support the developer on Buy Me a Coffee!"
        >
          <Coffee className="w-3.5 h-3.5 text-black" />
          <span className="hidden md:inline">Fuel The Dev ☕</span>
          <span className="md:hidden">☕</span>
        </a>

        {/* Clerk Authentication / Profile */}
        <AuthBar hasClerkKey={hasClerkKey} />
      </div>
    </header>
  );
};
