import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PlayerWorkspace } from './components/PlayerWorkspace';
import { NotesEditor } from './components/NotesEditor';
import { PomodoroTimer } from './components/PomodoroTimer';
import { AddCourseModal } from './components/AddCourseModal';
import { LandingPage } from './components/LandingPage';
import { PlaylistsView } from './components/PlaylistsView';
import { CompactTimerBar } from './components/CompactTimerBar';
import { formatTime } from './utils/youtube';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import { Home } from 'lucide-react';

interface DashboardProps {
  onBackToLanding?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onBackToLanding }) => {
  const {
    currentView,
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
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F9F8F5] text-[#121417] font-sans selection:bg-[#EBF755] selection:text-black">
      {/* Header Bar */}
      <Header />

      {/* Dynamic Content: All Playlists Hub vs. 3-Panel Learning Workspace */}
      {currentView === 'playlists' ? (
        <PlaylistsView />
      ) : (
        <div className="flex-1 flex min-h-0 relative overflow-hidden">
          {/* Left Column: Tracklist & Course index */}
          {!isTheaterMode && <Sidebar />}

          {/* Center Workspace: Video Player & Controls */}
          <PlayerWorkspace />

          {/* Right Column: Timer container arranged directly above Contextual Notes area */}
          {!isTheaterMode && isNotesOpen && (
            <section className="w-full sm:w-[380px] lg:w-[420px] xl:w-[460px] flex-shrink-0 h-full flex flex-col min-h-0 border-l border-[#121417]/10 bg-white">
              {/* Rectangular Pomodoro Timer Container placed directly above notes */}
              <CompactTimerBar />

              {/* Single-Pane WYSIWYG Contextual Notes Editor */}
              <NotesEditor />
            </section>
          )}
        </div>
      )}

      {/* Floating Pomodoro Widget / Modal */}
      <PomodoroTimer />

      {/* Add Course / YouTube Playlist Modal */}
      <AddCourseModal />

      {/* Optional Back to Landing Page button in bottom left */}
      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="fixed bottom-4 left-4 z-40 px-4 py-2 rounded-full bg-white hover:bg-slate-50 border-2 border-[#121417] text-xs font-bold text-[#121417] transition-all shadow-solid flex items-center gap-2 hover:scale-105"
          title="Return to Landing Page"
        >
          <Home className="w-3.5 h-3.5 text-[#121417]" />
          <span>Landing Page</span>
        </button>
      )}
    </div>
  );
};

export function App({ hasClerkKey = false }: { hasClerkKey?: boolean }) {
  const [guestView, setGuestView] = useState<'landing' | 'workspace'>('landing');

  // If Clerk is fully active, use Clerk's SignedIn / SignedOut routing with user sync
  if (hasClerkKey) {
    return (
      <>
        <SignedOut>
          <AppProvider hasClerkKey={true} userId={null}>
            <LandingPage hasClerkKey={true} onEnterDemo={() => {}} />
          </AppProvider>
        </SignedOut>
        <SignedIn>
          <SignedInWorkspace />
        </SignedIn>
      </>
    );
  }

  // Fallback demo/preview mode before Clerk key is supplied
  return (
    <AppProvider hasClerkKey={false} userId={null}>
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

const SignedInWorkspace: React.FC = () => {
  const { user } = useUser();
  return (
    <AppProvider hasClerkKey={true} userId={user?.id || null}>
      <Dashboard />
    </AppProvider>
  );
};

export default App;
