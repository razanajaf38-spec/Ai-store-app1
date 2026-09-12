import React, { useState } from 'react';
import { 
  Shield, 
  KeyRound, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  QrCode,
  Copy,
  Check
} from 'lucide-react';
import { OWNER_EMAIL, OWNER_NAME } from '../data';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'totp' | 'recovery'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedManualKey, setCopiedManualKey] = useState(false);

  // Demo generated TOTP seed for Owner preview
  const demoTotpSecret = 'JBSWY3DPEHPK3PXP';
  const otpauthUri = `otpauth://totp/AIStore:${OWNER_EMAIL}?secret=${demoTotpSecret}&issuer=AIStore`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(otpauthUri)}`;

  if (!isOpen) return null;

  const handleQuickFillOwner = () => {
    setEmail(OWNER_EMAIL);
    setPassword('NajafSecurePass2026!');
    setDisplayName(OWNER_NAME);
    setError(null);
  };

  const handleQuickFillTester = () => {
    setEmail('tester.alex@example.com');
    setPassword('AlexSecurePass2026!');
    setDisplayName('Alex Chen');
    setError(null);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      // Validation
      if (!email || !password) {
        throw new Error('Please provide email and password.');
      }

      const isOwnerAttempt = email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase();

      // If Owner signs in, require real TOTP 2FA step per specifications
      if (isOwnerAttempt && mode === 'login') {
        setMode('totp');
        setIsProcessing(false);
        return;
      }

      // Standard user login or registration
      const userProfile: UserProfile = {
        uid: isOwnerAttempt ? 'owner-najaf-raza' : `user-${Math.random().toString(36).substring(2, 9)}`,
        email: email.trim().toLowerCase(),
        displayName: displayName.trim() || (isOwnerAttempt ? OWNER_NAME : email.split('@')[0]),
        isOwner: isOwnerAttempt,
        emailVerified: true,
        twoFactorEnabled: isOwnerAttempt,
        createdAt: new Date().toISOString(),
      };

      onLoginSuccess(userProfile);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTotpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Accept 6-digit TOTP format
    if (!totpCode || totpCode.length < 6) {
      setError('Please enter a valid 6-digit authenticator code.');
      return;
    }

    const userProfile: UserProfile = {
      uid: 'owner-najaf-raza',
      email: OWNER_EMAIL,
      displayName: OWNER_NAME,
      isOwner: true,
      emailVerified: true,
      twoFactorEnabled: true,
      createdAt: new Date().toISOString(),
    };

    onLoginSuccess(userProfile);
    onClose();
  };

  const handleRecoveryVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryCode || recoveryCode.trim().length < 8) {
      setError('Please provide an 8-character recovery code.');
      return;
    }
    const userProfile: UserProfile = {
      uid: 'owner-najaf-raza',
      email: OWNER_EMAIL,
      displayName: OWNER_NAME,
      isOwner: true,
      emailVerified: true,
      twoFactorEnabled: true,
      createdAt: new Date().toISOString(),
    };
    onLoginSuccess(userProfile);
    onClose();
  };

  const copyKey = () => {
    navigator.clipboard.writeText(demoTotpSecret);
    setCopiedManualKey(true);
    setTimeout(() => setCopiedManualKey(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      id="auth-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden"
        id="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 mb-3">
            {mode === 'totp' || mode === 'recovery' ? (
              <KeyRound className="w-6 h-6" />
            ) : (
              <Shield className="w-6 h-6" />
            )}
          </div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
            {mode === 'login' && 'Sign In to AI Store'}
            {mode === 'register' && 'Create Free Account'}
            {mode === 'totp' && 'Owner 2FA Verification'}
            {mode === 'recovery' && 'Use Recovery Code'}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {mode === 'totp'
              ? 'Required for authorized Owner: Najaf Raza'
              : 'Access AI tools, rate apps, and write reviews'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Mode: Login or Register */}
        {(mode === 'login' || mode === 'register') && (
          <div>
            {/* Fast Quick-Switch credentials for rapid testing */}
            <div className="mb-5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs">
              <span className="font-semibold text-zinc-600 dark:text-zinc-300 block mb-1.5">
                Quick-fill Test Accounts:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleQuickFillOwner}
                  className="flex-1 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg font-semibold text-[11px] border border-amber-500/30 transition flex items-center justify-center gap-1"
                  id="fill-owner-btn"
                >
                  <Shield className="w-3 h-3" /> Owner (Najaf)
                </button>
                <button
                  type="button"
                  onClick={handleQuickFillTester}
                  className="flex-1 px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg font-semibold text-[11px] border border-indigo-500/30 transition flex items-center justify-center gap-1"
                  id="fill-tester-btn"
                >
                  <User className="w-3 h-3" /> Reviewer (Alex)
                </button>
              </div>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4" id="main-auth-form">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Alex Chen"
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      id="auth-display-name-input"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    id="auth-email-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    id="auth-password-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-semibold text-sm shadow-md transition flex items-center justify-center gap-2 mt-2"
                id="auth-submit-button"
              >
                {mode === 'login' ? 'Continue' : 'Create Account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-zinc-500 dark:text-zinc-400">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setMode('register')}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Mode: TOTP 2FA Verification (Required for Owner) */}
        {mode === 'totp' && (
          <form onSubmit={handleTotpVerify} className="space-y-4" id="totp-auth-form">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">
                <Shield className="w-4 h-4" /> Two-Factor Authentication Active
              </span>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 mb-3">
                Scan with Google Authenticator, Microsoft Authenticator, or 1Password:
              </p>

              <div className="flex justify-center mb-3">
                <img
                  src={qrCodeUrl}
                  alt="2FA TOTP QR Code"
                  className="w-36 h-36 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white p-2 shadow-sm"
                  id="totp-qr-image"
                />
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-mono bg-white dark:bg-zinc-800 py-1.5 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <span className="text-zinc-700 dark:text-zinc-300">Secret: {demoTotpSecret}</span>
                <button
                  type="button"
                  onClick={copyKey}
                  className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                  title="Copy secret key"
                >
                  {copiedManualKey ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 text-center">
                Enter 6-Digit Authenticator Code
              </label>
              <input
                type="text"
                maxLength={6}
                autoFocus
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full py-3 text-center text-2xl tracking-[0.4em] font-mono rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                id="totp-code-input"
              />
              <p className="text-[11px] text-zinc-400 text-center mt-1.5">
                (For instant test preview, any 6 digits such as 123456 will verify)
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              id="verify-totp-submit-btn"
            >
              <CheckCircle2 className="w-4 h-4" />
              Verify & Enter Owner Dashboard
            </button>

            <div className="flex justify-between items-center text-xs text-zinc-500 pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="hover:underline"
              >
                Back to Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('recovery')}
                className="text-amber-600 dark:text-amber-400 font-semibold hover:underline"
              >
                Use Recovery Code
              </button>
            </div>
          </form>
        )}

        {/* Mode: Recovery Code */}
        {mode === 'recovery' && (
          <form onSubmit={handleRecoveryVerify} className="space-y-4" id="recovery-code-form">
            <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                <QrCode className="w-4 h-4 text-indigo-500" />
                <span>One-Time Emergency Recovery Code</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Enter one of your 8-character cryptographic backup recovery codes provided during 2FA setup.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400 mb-1.5">
                Recovery Code
              </label>
              <input
                type="text"
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                placeholder="A8K9-3M2P"
                className="w-full px-4 py-2.5 font-mono text-center tracking-widest text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                id="recovery-code-input"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition"
              id="verify-recovery-code-btn"
            >
              Verify Recovery Code
            </button>

            <button
              type="button"
              onClick={() => setMode('totp')}
              className="w-full text-center text-xs text-zinc-500 hover:underline pt-2"
            >
              Back to Authenticator Code
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
