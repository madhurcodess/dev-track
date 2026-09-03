import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import App from './App.tsx';

const envKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const localKey = typeof window !== 'undefined' ? localStorage.getItem('devtrack_custom_clerk_key') : null;
const rawKey = (envKey && !envKey.includes('your_clerk')) ? envKey : localKey;
const clerkPubKey = (rawKey && rawKey.startsWith('pk_')) ? rawKey : '';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {clerkPubKey ? (
      <ClerkProvider 
        publishableKey={clerkPubKey}
        appearance={{
          variables: {
            colorPrimary: '#6366f1',
            colorBackground: '#0f172a',
            colorInputBackground: '#090d16',
            colorText: '#f8fafc',
            colorTextSecondary: '#94a3b8',
          }
        }}
      >
        <App hasClerkKey={true} />
      </ClerkProvider>
    ) : (
      <App hasClerkKey={false} />
    )}
  </StrictMode>,
);
