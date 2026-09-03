import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatTime } from '../utils/youtube';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Settings, 
  Flame, 
  Volume2, 
  VolumeX, 
  X, 
  Clock, 
  Award, 
  Coffee, 
  BrainCircuit, 
  Armchair 
} from 'lucide-react';

export const PomodoroTimer: React.FC = () => {
  const {
    pomodoroMode,
    pomodoroTimeLeft,
    isPomodoroRunning,
    pomodoroSettings,
    pomodoroStats,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    skipPomodoro,
    setPomodoroMode,
    updatePomodoroSettings,
    isPomodoroExpanded,
    setIsPomodoroExpanded,
  } = useApp();

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customWork, setCustomWork] = useState(pomodoroSettings.workDuration);
  const [customShort, setCustomShort] = useState(pomodoroSettings.shortBreakDuration);
  const [customLong, setCustomLong] = useState(pomodoroSettings.longBreakDuration);

  if (!isPomodoroExpanded) return null;

  const currentDurationSec = (
    pomodoroMode === 'work' 
      ? pomodoroSettings.workDuration 
      : pomodoroMode === 'shortBreak' 
      ? pomodoroSettings.shortBreakDuration 
      : pomodoroSettings.longBreakDuration
  ) * 60;

  const progressPercent = Math.min(100, Math.max(0, ((currentDurationSec - pomodoroTimeLeft) / currentDurationSec) * 100));

  const handleSaveCustomSettings = () => {
    updatePomodoroSettings({
      workDuration: Math.max(1, customWork),
      shortBreakDuration: Math.max(1, customShort),
      longBreakDuration: Math.max(1, customLong),
    });
    setIsCustomizing(false);
  };

  return (
    <div className="fixed bottom-5 right-5 sm:right-8 z-50 animate-fade-in">
      <div className="w-84 sm:w-96 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-2xl overflow-hidden ring-1 ring-white/10">
        {/* Modal Top Bar */}
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                Focus Engine
              </h3>
              <p className="text-[10px] text-slate-400">Pomodoro Interval Tracker</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => updatePomodoroSettings({ soundEnabled: !pomodoroSettings.soundEnabled })}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title={pomodoroSettings.soundEnabled ? "Sound enabled" : "Sound muted"}
            >
              {pomodoroSettings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              className={`p-1.5 rounded-lg transition-colors ${
                isCustomizing ? 'text-indigo-400 bg-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Customize durations"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPomodoroExpanded(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-5">
            <button
              onClick={() => setPomodoroMode('work')}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                pomodoroMode === 'work'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Work</span>
            </button>
            <button
              onClick={() => setPomodoroMode('shortBreak')}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                pomodoroMode === 'shortBreak'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Short</span>
            </button>
            <button
              onClick={() => setPomodoroMode('longBreak')}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                pomodoroMode === 'longBreak'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Armchair className="w-3.5 h-3.5" />
              <span>Long</span>
            </button>
          </div>

          {/* Center Timer Display with Circular Progress */}
          <div className="flex flex-col items-center justify-center my-4">
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* SVG Ring */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="stroke-slate-800"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className={`transition-all duration-500 ease-linear ${
                    pomodoroMode === 'work'
                      ? 'stroke-indigo-500'
                      : pomodoroMode === 'shortBreak'
                      ? 'stroke-emerald-500'
                      : 'stroke-amber-500'
                  }`}
                  strokeWidth="6"
                  strokeDasharray="276.46"
                  strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Digits in Center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
                  {formatTime(pomodoroTimeLeft)}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                  {pomodoroMode === 'work' ? 'Deep Work' : 'Rest & Recharge'}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={resetPomodoro}
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={isPomodoroRunning ? pausePomodoro : startPomodoro}
              className={`px-6 py-3 rounded-xl text-white font-bold text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
                isPomodoroRunning
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
              }`}
            >
              {isPomodoroRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              <span>{isPomodoroRunning ? 'PAUSE' : 'START FOCUS'}</span>
            </button>

            <button
              onClick={skipPomodoro}
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Skip to Next Session"
            >
              <FastForward className="w-4 h-4" />
            </button>
          </div>

          {/* Custom Settings Form Drawer */}
          {isCustomizing && (
            <div className="mt-5 p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3 animate-fade-in">
              <div className="text-xs font-semibold text-slate-300">Custom Durations (minutes)</div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Work</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={customWork}
                    onChange={(e) => setCustomWork(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white text-center font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Short Break</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={customShort}
                    onChange={(e) => setCustomShort(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white text-center font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Long Break</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={customLong}
                    onChange={(e) => setCustomLong(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white text-center font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveCustomSettings}
                className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
              >
                Apply Custom Times
              </button>
            </div>
          )}

          {/* Daily Stats Section */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <div className="flex items-center justify-center text-indigo-400 mb-1">
                <Award className="w-3.5 h-3.5" />
              </div>
              <span className="font-mono text-sm font-bold text-white block">
                {pomodoroStats.sessionsCompleted}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Sessions
              </span>
            </div>

            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <div className="flex items-center justify-center text-emerald-400 mb-1">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span className="font-mono text-sm font-bold text-white block">
                {pomodoroStats.todayFocusMinutes}m
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Focused
              </span>
            </div>

            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <div className="flex items-center justify-center text-orange-400 mb-1">
                <Flame className="w-3.5 h-3.5 fill-current text-orange-500" />
              </div>
              <span className="font-mono text-sm font-bold text-white block">
                {pomodoroStats.streakDays}d
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Streak
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
