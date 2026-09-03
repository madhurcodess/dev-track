import React from 'react';
import { useApp } from '../context/AppContext';
import { formatTime } from '../utils/youtube';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Timer, 
  Flame, 
  Volume2, 
  VolumeX
} from 'lucide-react';

export const CompactTimerBar: React.FC = () => {
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
  } = useApp();

  const currentDurationSec = (
    pomodoroMode === 'work' 
      ? pomodoroSettings.workDuration 
      : pomodoroMode === 'shortBreak' 
      ? pomodoroSettings.shortBreakDuration 
      : pomodoroSettings.longBreakDuration
  ) * 60;

  const progressPercent = Math.min(100, Math.max(0, ((currentDurationSec - pomodoroTimeLeft) / currentDurationSec) * 100));

  const modes: { key: typeof pomodoroMode; label: string }[] = [
    { key: 'work', label: 'Focus' },
    { key: 'shortBreak', label: 'Short Break' },
    { key: 'longBreak', label: 'Long Break' },
  ];

  return (
    <div className="p-3 bg-white border-b-2 border-[#121417]/10 flex flex-col gap-2.5 select-none shadow-xs">
      {/* Top row: Mode Pills + Sound Toggle + Streak */}
      <div className="flex items-center justify-between gap-1.5 flex-wrap">
        {/* Mode switcher pills */}
        <div className="flex items-center gap-1 bg-[#F9F8F5] p-1 rounded-xl border border-[#121417]/15">
          {modes.map(m => (
            <button
              key={m.key}
              onClick={() => setPomodoroMode(m.key)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                pomodoroMode === m.key
                  ? 'bg-[#121417] text-[#EBF755] shadow-xs scale-102'
                  : 'text-[#121417]/70 hover:text-[#121417] hover:bg-black/5'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Sound Toggle */}
          <button
            onClick={() => updatePomodoroSettings({ soundEnabled: !pomodoroSettings.soundEnabled })}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              pomodoroSettings.soundEnabled
                ? 'bg-white border-[#121417]/20 text-[#121417] hover:bg-slate-50'
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
            title={pomodoroSettings.soundEnabled ? "Mute Timer Sounds" : "Enable Timer Sounds"}
          >
            {pomodoroSettings.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Mini Streak Pill */}
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#F9F8F5] border border-[#121417]/15 text-[11px] font-extrabold text-[#121417]"
            title={`${pomodoroStats.sessionsCompleted} sessions completed today`}
          >
            <Flame className="w-3.5 h-3.5 fill-current text-orange-500" />
            <span>{pomodoroStats.streakDays}d</span>
          </div>
        </div>
      </div>

      {/* Bottom row: Countdown Display + Controls + Progress bar */}
      <div className="flex items-center justify-between gap-3 bg-[#F9F8F5] px-3.5 py-2 rounded-2xl border border-[#121417]/15">
        {/* Countdown */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#EBF755] border border-[#121417]/20 flex items-center justify-center text-[#121417]">
            <Timer className="w-3.5 h-3.5" />
          </div>
          <span className="font-mono text-xl font-black text-[#121417] tracking-tight">
            {formatTime(pomodoroTimeLeft)}
          </span>
          {isPomodoroRunning && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping ml-1" />
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={isPomodoroRunning ? pausePomodoro : startPomodoro}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all ${
              isPomodoroRunning
                ? 'bg-amber-200 text-amber-950 hover:bg-amber-300 border border-amber-400 shadow-xs'
                : 'bg-[#EBF755] hover:bg-[#E2EF43] text-[#121417] border border-[#121417]/30 shadow-solid active:scale-95'
            }`}
          >
            {isPomodoroRunning ? (
              <>
                <Pause className="w-3 h-3 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Start</span>
              </>
            )}
          </button>

          <button
            onClick={resetPomodoro}
            className="p-1.5 rounded-full bg-white hover:bg-slate-100 border border-[#121417]/20 text-[#121417]/70 transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={skipPomodoro}
            className="p-1.5 rounded-full bg-white hover:bg-slate-100 border border-[#121417]/20 text-[#121417]/70 transition-colors"
            title="Skip Interval"
          >
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Slim Progress Bar */}
      <div className="w-full h-1.5 bg-[#121417]/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#EBF755] transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
