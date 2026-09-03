import React from 'react';
import { useApp } from '../context/AppContext';
import { formatTime } from '../utils/youtube';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Timer, 
  Flame, 
  Plus, 
  PanelLeftClose, 
  PanelLeft, 
  PanelRightClose, 
  PanelRight, 
  Sparkles
} from 'lucide-react';
import { AuthBar } from './AuthBar';

export const Header: React.FC = () => {
  const {
    activeCourse,
    pomodoroMode,
    pomodoroTimeLeft,
    isPomodoroRunning,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    pomodoroStats,
    isPomodoroExpanded,
    setIsPomodoroExpanded,
    isSidebarOpen,
    setIsSidebarOpen,
    isNotesOpen,
    setIsNotesOpen,
    setIsAddModalOpen,
    resetAllData,
    hasClerkKey,
  } = useApp();

  const totalVideos = activeCourse?.videos.length || 0;
  const completedVideos = activeCourse?.videos.filter(v => v.completed).length || 0;
  const progressPercent = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  const getModeBadge = () => {
    switch (pomodoroMode) {
      case 'work':
        return 'bg-[#EBF755] text-[#121417] border-[#121417]/20';
      case 'shortBreak':
        return 'bg-[#D4E4FC] text-[#121417] border-[#121417]/20';
      case 'longBreak':
        return 'bg-amber-100 text-amber-900 border-amber-300';
    }
  };

  const getModeLabel = () => {
    switch (pomodoroMode) {
      case 'work':
        return 'Focus';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-[#121417]/10 bg-[#F9F8F5]/95 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left: Brand & Sidebar Toggle */}
      <div className="flex items-center gap-3 min-w-fit">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-full text-[#121417]/70 hover:text-[#121417] hover:bg-black/5 transition-colors"
          title={isSidebarOpen ? "Hide Course Index" : "Show Course Index"}
        >
          {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#121417] text-[#EBF755] flex items-center justify-center font-black text-xs">
            DT
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-[#121417]">
                DevTrack
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#EBF755] text-[#121417] border border-[#121417]/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-[#121417]/60 font-semibold truncate max-w-[140px] sm:max-w-[200px] md:max-w-[260px]">
              {activeCourse ? activeCourse.title : 'My Learning Dashboard'}
            </p>
          </div>
        </div>
      </div>

      {/* Center: Global Progress Bar */}
      <div className="hidden md:flex flex-1 max-w-md flex-col gap-1 px-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#121417]/70 font-bold flex items-center gap-1.5">
            <span>Course Progress</span>
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

      {/* Right: Pomodoro Quick-Widget & Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Pomodoro Quick Pill */}
        <div className="flex items-center gap-1.5 bg-white border border-[#121417]/15 rounded-full py-1 px-2.5 shadow-sm">
          <button
            onClick={() => setIsPomodoroExpanded(!isPomodoroExpanded)}
            className={`flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full border transition-all ${getModeBadge()}`}
            title="Open Pomodoro Settings"
          >
            <Timer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{getModeLabel()}</span>
            <span className="font-mono text-xs">{formatTime(pomodoroTimeLeft)}</span>
          </button>

          <button
            onClick={isPomodoroRunning ? pausePomodoro : startPomodoro}
            className={`p-1.5 rounded-full transition-all ${
              isPomodoroRunning
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                : 'bg-[#121417] text-[#EBF755] hover:bg-black shadow-sm'
            }`}
            title={isPomodoroRunning ? "Pause Timer" : "Start Timer"}
          >
            {isPomodoroRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.2" />}
          </button>

          <button
            onClick={resetPomodoro}
            className="p-1.5 rounded-full text-[#121417]/60 hover:text-[#121417] hover:bg-black/5 transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Focus Streak Badge */}
        <div 
          className="hidden xl:flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-white border border-[#121417]/15 text-[#121417] shadow-sm"
          title={`${pomodoroStats.sessionsCompleted} focus sessions completed today`}
        >
          <Flame className="w-4 h-4 fill-current text-orange-500" />
          <span>{pomodoroStats.streakDays}d Streak</span>
        </div>

        {/* Add Course Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full bg-[#D4E4FC] hover:bg-[#C2DBFB] border border-[#121417]/15 text-[#121417] transition-all shadow-sm hover:scale-105"
          title="Import YouTube Playlist or Video"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Course</span>
        </button>

        {/* Reset Data Button */}
        <button
          onClick={resetAllData}
          className="p-2 rounded-full text-[#121417]/50 hover:text-rose-600 hover:bg-black/5 transition-colors"
          title="Reset all courses & progress to default"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Clerk Authentication / Profile */}
        <AuthBar hasClerkKey={hasClerkKey} />

        <div className="w-[1px] h-5 bg-[#121417]/15 hidden sm:block mx-0.5" />

        {/* Notes Toggle Button */}
        <button
          onClick={() => setIsNotesOpen(!isNotesOpen)}
          className={`p-2 rounded-full transition-colors ${
            isNotesOpen 
              ? 'text-[#121417] bg-[#EBF755] border border-[#121417]/20 shadow-sm' 
              : 'text-[#121417]/60 hover:text-[#121417] hover:bg-black/5'
          }`}
          title={isNotesOpen ? "Hide Notes Workspace" : "Show Notes Workspace"}
        >
          {isNotesOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRight className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};
