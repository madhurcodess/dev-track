import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Sparkles,
  LayoutGrid,
  Tv,
  Flame
} from 'lucide-react';
import { AuthBar } from './AuthBar';
import { BrandLogo } from './BrandLogo';

export const Header: React.FC = () => {
  const {
    activeCourse,
    pomodoroStats,
    setIsAddModalOpen,
    hasClerkKey,
    currentView,
    setCurrentView,
  } = useApp();

  const totalVideos = activeCourse?.videos.length || 0;
  const completedVideos = activeCourse?.videos.filter(v => v.completed).length || 0;
  const progressPercent = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-[#121417]/10 bg-[#F9F8F5]/95 backdrop-blur-md px-3 sm:px-5 lg:px-6 flex items-center justify-between gap-3">
      {/* Left: Brand & View Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-fit">
        {/* Custom Brand Logo - Click to go to Playlists */}
        <button 
          onClick={() => setCurrentView('playlists')}
          className="flex items-center text-left transition-transform hover:scale-102"
          title="Back to All Playlists"
        >
          <BrandLogo size="md" />
        </button>

        {/* View Switcher: All Playlists vs Player Workspace */}
        <div className="hidden sm:flex items-center ml-2 pl-2 border-l border-[#121417]/15 gap-1.5">
          <button
            onClick={() => setCurrentView('playlists')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              currentView === 'playlists'
                ? 'bg-[#121417] text-[#EBF755] shadow-sm'
                : 'text-[#121417]/70 hover:text-[#121417] hover:bg-black/5'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Playlists</span>
          </button>

          <button
            onClick={() => setCurrentView('workspace')}
            disabled={!activeCourse}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              currentView === 'workspace'
                ? 'bg-[#121417] text-[#EBF755] shadow-sm'
                : activeCourse 
                ? 'text-[#121417]/70 hover:text-[#121417] hover:bg-black/5'
                : 'opacity-40 cursor-not-allowed text-[#121417]/40'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </button>
        </div>
      </div>

      {/* Center: Global Progress Bar (shown when active in workspace) */}
      {currentView === 'workspace' && activeCourse && (
        <div className="hidden md:flex flex-1 max-w-md flex-col gap-1 px-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#121417]/70 font-bold flex items-center gap-1.5">
              <span className="truncate max-w-[180px]">{activeCourse.title}</span>
              {progressPercent === 100 && (
                <span className="text-emerald-700 inline-flex items-center gap-0.5 text-[10px] font-bold bg-emerald-100 px-1.5 py-0.2 rounded-full border border-emerald-300">
                  <Sparkles className="w-3 h-3" /> Done!
                </span>
              )}
            </span>
            <span className="font-bold text-[#121417]">
              <span>{completedVideos}</span>
              <span className="text-[#121417]/50">/{totalVideos}</span>
              <span className="ml-1.5 text-[#121417]/70">({progressPercent}%)</span>
            </span>
          </div>
          <div className="h-2.5 w-full bg-black/5 rounded-full overflow-hidden p-0.5 border border-[#121417]/10">
            <div
              className="h-full rounded-full transition-all duration-500 bg-[#EBF755] border border-[#121417]/20 shadow-sm"
              style={{ width: `${Math.max(progressPercent, totalVideos > 0 ? 3 : 0)}%` }}
            />
          </div>
        </div>
      )}

      {/* Right: Streak, Add Course, and Auth Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Focus Streak Badge */}
        <div 
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-white border border-[#121417]/15 text-[#121417] shadow-sm"
          title={`${pomodoroStats.sessionsCompleted} focus sessions completed today`}
        >
          <Flame className="w-4 h-4 fill-current text-orange-500" />
          <span>{pomodoroStats.streakDays}d Streak</span>
        </div>

        {/* Add Course Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 text-xs font-bold px-3.5 sm:px-4 py-2 rounded-full bg-[#D4E4FC] hover:bg-[#C2DBFB] border border-[#121417]/15 text-[#121417] transition-all shadow-sm hover:scale-105"
          title="Import YouTube Playlist or Video"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Course</span>
        </button>

        {/* Clerk Authentication / Profile */}
        <AuthBar hasClerkKey={hasClerkKey} />
      </div>
    </header>
  );
};
