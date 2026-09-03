import React from 'react';
import { useApp } from '../context/AppContext';
import { formatTime } from '../utils/youtube';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Timer, 
  Flame, 
  PlusCircle, 
  PanelLeftClose, 
  PanelLeft, 
  PanelRightClose, 
  PanelRight, 
  Sparkles,
  GraduationCap
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

  const totalVideos = activeCourse.videos.length;
  const completedVideos = activeCourse.videos.filter(v => v.completed).length;
  const progressPercent = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  const getModeColor = () => {
    switch (pomodoroMode) {
      case 'work':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
      case 'shortBreak':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'longBreak':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
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
    <header className="sticky top-0 z-30 h-16 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left: Brand & Sidebar Toggle */}
      <div className="flex items-center gap-3 min-w-fit">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
          title={isSidebarOpen ? "Hide Course Index" : "Show Course Index"}
        >
          {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2.5 group cursor-default">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                DevTrack
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate max-w-[140px] sm:max-w-[200px] md:max-w-[260px]">
              {activeCourse.title}
            </p>
          </div>
        </div>
      </div>

      {/* Center: Global Progress Bar */}
      <div className="hidden md:flex flex-1 max-w-md flex-col gap-1.5 px-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <span>Course Progress</span>
            {progressPercent === 100 && (
              <span className="text-emerald-400 inline-flex items-center gap-0.5 text-[10px] font-semibold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30">
                <Sparkles className="w-3 h-3" /> Completed!
              </span>
            )}
          </span>
          <span className="font-semibold text-slate-200">
            <span className="text-indigo-400">{completedVideos}</span>
            <span className="text-slate-500">/{totalVideos}</span>
            <span className="ml-1.5 text-slate-400">({progressPercent}%)</span>
          </span>
        </div>
        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 shadow-sm"
            style={{ width: `${Math.max(progressPercent, 2)}%` }}
          />
        </div>
      </div>

      {/* Right: Pomodoro Quick-Widget & Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Pomodoro Quick Pill */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-full py-1 px-2.5 shadow-inner">
          <button
            onClick={() => setIsPomodoroExpanded(!isPomodoroExpanded)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border transition-all ${getModeColor()}`}
            title="Open Pomodoro Settings"
          >
            <Timer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{getModeLabel()}</span>
            <span className="font-mono text-xs">{formatTime(pomodoroTimeLeft)}</span>
          </button>

          <button
            onClick={isPomodoroRunning ? pausePomodoro : startPomodoro}
            className={`p-1.5 rounded-full text-slate-200 hover:text-white transition-all ${
              isPomodoroRunning
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-600/30 text-white'
            }`}
            title={isPomodoroRunning ? "Pause Timer" : "Start Timer"}
          >
            {isPomodoroRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={resetPomodoro}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Focus Streak Badge */}
        <div 
          className="hidden xl:flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400"
          title={`${pomodoroStats.sessionsCompleted} sessions completed today`}
        >
          <Flame className="w-4 h-4 fill-current text-orange-500 animate-bounce" style={{ animationDuration: '2s' }} />
          <span>{pomodoroStats.streakDays}d Streak</span>
        </div>

        {/* Add Course Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 transition-all shadow-sm"
          title="Import YouTube Playlist or Video"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Add Course</span>
        </button>

        {/* Reset Data Button */}
        <button
          onClick={resetAllData}
          className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
          title="Reset all courses & progress to default"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Clerk Authentication / Profile */}
        <AuthBar hasClerkKey={hasClerkKey} />

        <div className="w-[1px] h-5 bg-slate-800 hidden sm:block mx-0.5" />

        {/* Notes Toggle Button */}
        <button
          onClick={() => setIsNotesOpen(!isNotesOpen)}
          className={`p-2 rounded-lg transition-colors ${
            isNotesOpen 
              ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' 
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
          }`}
          title={isNotesOpen ? "Hide Notes Workspace" : "Show Notes Workspace"}
        >
          {isNotesOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRight className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};
