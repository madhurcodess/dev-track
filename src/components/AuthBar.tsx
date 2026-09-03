import React, { useState } from 'react';
import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  SignUpButton, 
  UserButton,
  useUser
} from '@clerk/clerk-react';
import { LogIn, UserPlus, ShieldCheck, Key, ExternalLink, X } from 'lucide-react';

interface AuthBarProps {
  hasClerkKey: boolean;
}

export const AuthBar: React.FC<AuthBarProps> = ({ hasClerkKey }) => {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState('');

  if (hasClerkKey) {
    return (
      <div className="flex items-center gap-2">
        <SignedOut>
          <div className="flex items-center gap-1.5">
            <SignInButton mode="modal">
              <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors">
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 transition-all">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </SignUpButton>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="flex items-center gap-2.5 pl-1.5">
            <UserInfoBadge />
            <UserButton 
              appearance={{
                elements: {
                  userButtonAvatarBox: 'w-8 h-8 ring-2 ring-indigo-500/40 hover:ring-indigo-500 transition-all',
                }
              }}
              afterSignOutUrl="/"
            />
          </div>
        </SignedIn>
      </div>
    );
  }

  // Fallback demo mode when Clerk Key is not yet set in environment
  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowKeyModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 text-indigo-300 hover:text-white hover:border-indigo-500/60 transition-all shadow-sm"
          title="Connect Clerk Authentication Key"
        >
          <Key className="w-3.5 h-3.5 text-indigo-400" />
          <span>Connect Clerk</span>
        </button>
      </div>

      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-5 relative">
            <button
              onClick={() => setShowKeyModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Connect Clerk Authentication</h3>
                <p className="text-[11px] text-slate-400">Enable multi-user authentication and cloud accounts</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2 mb-4">
              <p className="font-semibold text-indigo-300">How to get your Clerk Publishable Key:</p>
              <ol className="list-decimal pl-4 space-y-1 text-slate-400 text-[11px]">
                <li>Sign up for free at <a href="https://dashboard.clerk.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline inline-flex items-center gap-0.5">dashboard.clerk.com <ExternalLink className="w-2.5 h-2.5" /></a></li>
                <li>Create a new application (select Google, Email, GitHub)</li>
                <li>Copy the <strong>Publishable key</strong> (starts with <code>pk_test_...</code>)</li>
                <li>Add it to <code>.env.local</code> as <code>VITE_CLERK_PUBLISHABLE_KEY=pk_test_...</code></li>
              </ol>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Or test right now by pasting your Key here:
                </label>
                <input
                  type="text"
                  placeholder="pk_test_..."
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (inputKey.trim().startsWith('pk_')) {
                      localStorage.setItem('devtrack_custom_clerk_key', inputKey.trim());
                      window.location.reload();
                    } else {
                      alert('Please enter a valid Clerk publishable key starting with pk_test_ or pk_live_');
                    }
                  }}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
                >
                  Activate Clerk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const UserInfoBadge: React.FC = () => {
  const { user } = useUser();
  if (!user) return null;

  return (
    <div className="hidden sm:flex flex-col text-right">
      <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
        {user.fullName || user.firstName || user.username || 'Student'}
      </span>
      <span className="text-[10px] text-indigo-400 font-medium truncate max-w-[120px]">
        {user.primaryEmailAddress?.emailAddress}
      </span>
    </div>
  );
};
