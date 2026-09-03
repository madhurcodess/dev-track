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
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-[#121417] hover:bg-black/5 transition-colors">
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button className="flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#D4E4FC] hover:bg-[#C2DBFB] text-[#121417] border border-[#121417]/20 shadow-sm transition-all hover:scale-105">
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
                  userButtonAvatarBox: 'w-8 h-8 ring-2 ring-[#121417] transition-all',
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white hover:bg-slate-50 border border-[#121417]/20 text-[#121417] transition-all shadow-sm"
          title="Connect Clerk Authentication Key"
        >
          <Key className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Clerk Key</span>
        </button>
      </div>

      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border-2 border-[#121417] shadow-solid-lg p-6 relative text-[#121417]">
            <button
              onClick={() => setShowKeyModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-500 hover:text-black hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#EBF755] border-2 border-[#121417] text-[#121417] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#121417]">Connect Clerk Authentication</h3>
                <p className="text-xs text-[#121417]/60 font-medium">Enable multi-user cloud accounts</p>
              </div>
            </div>

            <div className="p-4 bg-[#F9F8F5] rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2 mb-4">
              <p className="font-bold text-[#121417]">Quick 2-minute setup:</p>
              <ol className="list-decimal pl-4 space-y-1 text-slate-600 text-[11px] font-medium">
                <li>Sign up at <a href="https://dashboard.clerk.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-bold inline-flex items-center gap-0.5">dashboard.clerk.com <ExternalLink className="w-2.5 h-2.5" /></a></li>
                <li>Create an app and copy the <strong>Publishable key</strong> (starts with <code>pk_test_...</code>)</li>
                <li>Paste it below to test immediately:</li>
              </ol>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="pk_test_..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="w-full bg-[#F9F8F5] border-2 border-[#121417]/20 rounded-xl px-4 py-2.5 text-xs text-[#121417] font-mono placeholder-slate-400 focus:outline-none focus:border-[#121417] focus:ring-2 focus:ring-[#EBF755]"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:text-black"
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
                  className="px-5 py-2 rounded-full bg-[#EBF755] hover:bg-[#E2EF43] text-black text-xs font-extrabold border border-black shadow-sm"
                >
                  Activate Key
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
      <span className="text-xs font-bold text-[#121417] truncate max-w-[120px]">
        {user.fullName || user.firstName || user.username || 'Student'}
      </span>
      <span className="text-[10px] text-[#121417]/60 font-semibold truncate max-w-[120px]">
        {user.primaryEmailAddress?.emailAddress}
      </span>
    </div>
  );
};
