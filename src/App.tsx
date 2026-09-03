import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PlayerWorkspace } from './components/PlayerWorkspace';
import { NotesEditor } from './components/NotesEditor';
import { PomodoroTimer } from './components/PomodoroTimer';
import { AddCourseModal } from './components/AddCourseModal';
import { LandingPage } from './components/LandingPage';
import { formatTime } from './utils/youtube';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { Home } from 'lucide-react';

interface DashboardProps {
  onBackToLanding?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onBackToLanding }) => {
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
    isPomodoroExpanded,
    setIsPomodoroExpanded,
  } = useApp();

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

      {/* Optional Back to Landing Page button in bottom left */}
      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="fixed bottom-4 left-4 z-40 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-400 hover:text-white transition-all shadow-lg flex items-center gap-1.5 backdrop-blur-md"
          title="Return to Landing Page"
        >
          <Home className="w-3.5 h-3.5 text-indigo-400" />
          <span>Landing Page</span>
        </button>
      )}
    </div>
  );
};

export function App({ hasClerkKey = false }: { hasClerkKey?: boolean }) {
  const [guestView, setGuestView] = useState<'landing' | 'workspace'>('landing');

  // If Clerk is fully active, use Clerk's SignedIn / SignedOut routing
  if (hasClerkKey) {
    return (
      <AppProvider hasClerkKey={true}>
        <SignedOut>
          <LandingPage hasClerkKey={true} onEnterDemo={() => {}} />
        </SignedOut>
        <SignedIn>
          <Dashboard />
        </SignedIn>
      </AppProvider>
    );
  }

  // Fallback demo/preview mode before Clerk key is supplied
  return (
    <AppProvider hasClerkKey={false}>
      {guestView === 'landing' ? (
        <LandingPage 
          hasClerkKey={false} 
          onEnterDemo={() => setGuestView('workspace')} 
        />
      ) : (
        <Dashboard onBackToLanding={() => setGuestView('landing')} />
      )}
    </AppProvider>
  );
}

export default App;
