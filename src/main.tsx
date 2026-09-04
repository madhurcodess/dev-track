import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import './utils/enableIframeFullscreen';
import './index.css';
import App from './App.tsx';

const FALLBACK_CLERK_KEY = 'pk_test_Y29uY2lzZS1jYXQtNjkxOS5jbGVyay5hY2NvdW50cy5kZXYk';
const envKey = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) as string | undefined;
const localKey = typeof window !== 'undefined' ? localStorage.getItem('devtrack_custom_clerk_key') : null;
const rawKey = (envKey && !envKey.includes('your_clerk') && envKey.trim().length > 0) ? envKey : (localKey || FALLBACK_CLERK_KEY);
const clerkPubKey = (rawKey && rawKey.startsWith('pk_')) ? rawKey.trim() : FALLBACK_CLERK_KEY;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {clerkPubKey ? (
      <ClerkProvider 
        publishableKey={clerkPubKey}
        appearance={{
          variables: {
            colorPrimary: '#121417',
            colorBackground: '#FFFFFF',
            colorInputBackground: '#F9F8F5',
            colorText: '#121417',
            colorTextSecondary: '#5A606A',
          },
          elements: {
            card: 'border-2 border-[#121417] shadow-solid-lg rounded-3xl',
            formButtonPrimary: 'bg-[#EBF755] hover:bg-[#E2EF43] text-black font-extrabold border-2 border-[#121417] shadow-solid rounded-full',
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
