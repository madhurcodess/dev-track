import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { PlayerWorkspace } from './components/PlayerWorkspace';
import { WorkspaceRightPanel } from './components/WorkspaceRightPanel';
import { AddCourseModal } from './components/AddCourseModal';
import { LandingPage } from './components/LandingPage';
import { PlaylistsView } from './components/PlaylistsView';
import { NotesView } from './components/NotesView';
import { TimerCelebrationModal } from './components/TimerCelebrationModal';
import { FloatingTimerWidget } from './components/FloatingTimerWidget';
import { formatTime } from './utils/youtube';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import { Home, ListVideo } from 'lucide-react';

interface DashboardProps {
  onBackToLanding?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onBackToLanding }) => {
  const {
    currentView,
    isTheaterMode,
    isRightPanelOpen,
    setIsRightPanelOpen,
    workspaceRightTab,
    setWorkspaceRightTab,
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
      const isInput = 
        !target ||
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        Boolean(target.closest?.('[contenteditable="true"]')) ||
        Boolean(target.closest?.('.ProseMirror')) ||
        Boolean(target.closest?.('.tiptap'));

      // Alt + T: Insert timestamp note anytime
      if (e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        const currentSec = getCurrentPlayerTime();
        const formatted = formatTime(currentSec);
        const existing = getNoteForCurrentVideo();
        saveNoteForCurrentVideo({ content: existing.content + `<p><br></p><p>▶ [${formatted}] </p>` });
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

      // Alt + S: Toggle Queue / Playlist
      if (!isInput && e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        if (!isRightPanelOpen) {
          setIsRightPanelOpen(true);
          setWorkspaceRightTab('playlist');
        } else if (workspaceRightTab === 'playlist') {
          setIsRightPanelOpen(false);
        } else {
          setWorkspaceRightTab('playlist');
        }
      }

      // Alt + N: Toggle Notes
      if (!isInput && e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        if (!isRightPanelOpen) {
          setIsRightPanelOpen(true);
          setWorkspaceRightTab('notes');
        } else if (workspaceRightTab === 'notes') {
          setIsRightPanelOpen(false);
        } else {
          setWorkspaceRightTab('notes');
        }
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
    isRightPanelOpen,
    setIsRightPanelOpen,
    workspaceRightTab,
    setWorkspaceRightTab,
    isPomodoroExpanded,
    setIsPomodoroExpanded,
  ]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F9F8F5] text-[#121417] font-sans selection:bg-[#EBF755] selection:text-black">
      {/* Header Bar */}
      <Header />

      {/* Dynamic Content: Playlists Hub vs. Notes Hub vs. Learning Workspace */}
      {currentView === 'playlists' ? (
        <PlaylistsView />
      ) : currentView === 'notes' ? (
        <NotesView />
      ) : (
        <div className="flex-1 flex min-h-0 relative overflow-hidden">
          {/* Left Main Column: Video Player & Lecture Workspace */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            <PlayerWorkspace />
          </div>

          {/* Right Column: YouTube Playlist Queue & Notes with Pomodoro Timer */}
          {!isTheaterMode && (
            <>
              {/* Desktop Side-by-Side Right Column - Expanded to match rectangular wireframe (~38%-40%) */}
              <div className={`hidden lg:flex w-[400px] lg:w-[37%] xl:w-[38%] 2xl:w-[39%] min-w-[380px] max-w-[680px] flex-shrink-0 h-full flex-col min-h-0 pt-3 sm:pt-4 lg:pt-6 pb-6 pr-3 sm:pr-4 lg:pr-6 ${!isRightPanelOpen ? '!hidden' : ''}`}>
                <WorkspaceRightPanel />
              </div>

              {/* Tablet/Mobile Slide-in Drawer Overlay */}
              {isRightPanelOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
                  <div 
                    className="fixed inset-0"
                    onClick={() => setIsRightPanelOpen(false)}
                  />
                  <div className="relative w-full sm:w-[400px] h-full bg-white shadow-2xl z-10 animate-slide-in-right flex flex-col">
                    <WorkspaceRightPanel />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Desktop Re-open Button when Right Panel is collapsed */}
          {!isTheaterMode && !isRightPanelOpen && (
            <button
              onClick={() => setIsRightPanelOpen(true)}
              className="hidden lg:flex absolute right-4 top-3 z-30 items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#EBF755] hover:bg-[#E2EF43] border-2 border-[#121417] shadow-solid text-black text-xs font-black transition-all hover:scale-105 active:scale-95"
              title="Show Playlist & Notes"
            >
              <ListVideo className="w-3.5 h-3.5 text-black" />
              <span>Queue & Notes</span>
            </button>
          )}
        </div>
      )}

      {/* Floating Draggable Focus Engine Widget */}
      <FloatingTimerWidget />

      {/* Add Course / YouTube Playlist Modal */}
      <AddCourseModal />

      {/* Focus & Break Completion Celebration Modal */}
      <TimerCelebrationModal />

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
