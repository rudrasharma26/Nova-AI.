import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { name: string; email: string };
  onSignInMock: (name: string, email: string) => void;
  isDark?: boolean;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignInMock,
  isDark = false,
}) => {
  const [signedInNotice, setSignedInNotice] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    onSignInMock('Dev Sharma', 'devsharma260705@gmail.com');
    setSignedInNotice(true);
    setTimeout(() => {
      setSignedInNotice(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-lg bg-[#FFFFFF] dark:bg-[#121318] border border-[#E4E2DC] dark:border-[#24262D] p-6 shadow-xl text-[#15161A] dark:text-[#EDECE8]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-[#5A5C66] dark:text-[#9A9CA6] hover:bg-[#F7F6F3] dark:hover:bg-[#0B0C10] transition-colors"
          aria-label="Close sign in modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-3">
            <BrandLogo size={40} isDark={isDark} />
          </div>
          <h2 className="text-lg font-semibold tracking-tight mb-1">
            Sign in to Nova
          </h2>
          <p className="text-xs text-[#5A5C66] dark:text-[#9A9CA6] max-w-xs leading-relaxed">
            Collaborative AI workspace for research, code synthesis, and shared threads.
          </p>
        </div>

        {/* Current user status if already signed in */}
        {currentUser && (
          <div className="mb-5 p-3 rounded-lg bg-[#F7F6F3] dark:bg-[#0B0C10] border border-[#E4E2DC] dark:border-[#24262D] text-xs">
            <div className="text-[#5A5C66] dark:text-[#9A9CA6] mb-1">Signed in as</div>
            <div className="font-medium text-[#15161A] dark:text-[#EDECE8]">{currentUser.name}</div>
            <div className="text-[#5A5C66] dark:text-[#9A9CA6] text-[11px]">{currentUser.email}</div>
          </div>
        )}

        {/* Continue with Google button (visual only) */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center gap-3 w-full py-2.5 px-4 rounded-lg border border-[#E4E2DC] dark:border-[#24262D] bg-[#FFFFFF] dark:bg-[#121318] hover:bg-[#F7F6F3] dark:hover:bg-[#0B0C10] text-xs font-medium text-[#15161A] dark:text-[#EDECE8] transition-colors shadow-xs"
            aria-label="Continue with Google"
          >
            {/* Google G SVG */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {signedInNotice && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-1">
              <Check className="w-4 h-4" />
              <span>Signed in successfully</span>
            </div>
          )}

          <p className="text-[11px] text-center text-[#5A5C66] dark:text-[#9A9CA6] pt-2">
            By signing in, you access shared workspace threads and telemetry quotas.
          </p>
        </div>
      </div>
    </div>
  );
};
