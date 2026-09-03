import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PlayerWorkspace } from './components/PlayerWorkspace';
import { NotesEditor } from './components/NotesEditor';
import { PomodoroTimer } from './components/PomodoroTimer';
import { AddCourseModal } from './components/AddCourseModal';
import { formatTime } from './utils/youtube';

const AppContent: React.FC = () => {
  const {
    isTheaterMode,
    isSidebarOpen,
    setIsSidebarOpen,
    isNotesOpen,
    setIsNotesOpen,
    isPomodoroRunning,
    startPomodoro,
    pausePomodoro,
    getCurrentPlayerTime,
    getNoteForCurrentVideo,
    saveNoteForCurrentVideo,
    setIsPomodoroExpanded,
    isPomodoroExpanded,
  } = useApp();

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut triggers when user is typing inside textareas or inputs
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // Alt + T: Insert timestamp note anytime
      if (e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        const currentSec = getCurrentPlayerTime();
        const formatted = formatTime(currentSec);
        const existing = getNoteForCurrentVideo();
        saveNoteForCurrentVideo(existing + `\n- [${formatted}] `);
        return;
      }

      // Alt + P: Toggle Pomodoro start/pause
      if (e.altKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        if (isPomodoroRunning) {
          pausePomodoro();
        } else {
          startPomodoro();
        }
        return;
      }

      // Alt + S: Toggle Sidebar
      if (!isInput && e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        setIsSidebarOpen(!isSidebarOpen);
      }

      // Alt + N: Toggle Notes
      if (!isInput && e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        setIsNotesOpen(!isNotesOpen);
      }

      // Alt + O: Toggle Pomodoro Dock
      if (!isInput && e.altKey && (e.key === 'o' || e.key === 'O')) {
        e.preventDefault();
        setIsPomodoroExpanded(!isPomodoroExpanded);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    getCurrentPlayerTime,
    getNoteForCurrentVideo,
    saveNoteForCurrentVideo,
    isPomodoroRunning,
    startPomodoro,
    pausePomodoro,
    isSidebarOpen,
    setIsSidebarOpen,
    isNotesOpen,
    setIsNotesOpen,
    isPomodoroExpanded,
    setIsPomodoroExpanded,
  ]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header Bar */}
      <Header />

      {/* Main 3-Panel Layout */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* Left Column: Tracklist & Course index */}
        {!isTheaterMode && <Sidebar />}

        {/* Center Workspace: Video Player & Controls */}
        <PlayerWorkspace />

        {/* Right Column: Contextual Notes Workspace */}
        {!isTheaterMode && <NotesEditor />}
      </div>

      {/* Floating Pomodoro Widget / Modal */}
      <PomodoroTimer />

      {/* Add Course / YouTube Playlist Modal */}
      <AddCourseModal />
    </div>
  );
};

export function App({ hasClerkKey = false }: { hasClerkKey?: boolean }) {
  return (
    <AppProvider hasClerkKey={hasClerkKey}>
      <AppContent />
    </AppProvider>
  );
}

export default App;
