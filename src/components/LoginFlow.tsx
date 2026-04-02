import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { User, Lock } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import svgPaths from '../imports/Frame47296-1/svg-0hdeo07ddu';
import CanopyScreenBackground from './CanopyScreenBackground';

interface LoginFlowProps {
  onAuthSuccess: (user: any, accessToken: string) => void;
  onGuestMode: () => void;
  backgroundTheme: string;
}

const LoginFlow: React.FC<LoginFlowProps> = ({ onAuthSuccess, onGuestMode }) => {
  const prefersReducedMotion = useReducedMotion();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isReturningUser, setIsReturningUser] = useState(false);

  const supabase = getSupabaseClient();

  const handleSubmit = async () => {
    setError('');

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!password) {
      setError('Please enter a password');
      return;
    }

    if (!isReturningUser && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!isReturningUser && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const emailToUse = name.includes('@') ? name : `${name.toLowerCase().replace(/\s+/g, '')}@example.com`;
      
      if (isReturningUser) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password: password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Email or password is incorrect. Please check your credentials.');
          } else {
            throw error;
          }
          return;
        }
        onAuthSuccess(data.user, data.session.access_token);
      } else {
        const { data: existingUser, error: signInError } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password: password,
        });

        if (signInError && !signInError.message.includes('Invalid login credentials')) {
          throw signInError;
        }

        if (existingUser.user) {
          onAuthSuccess(existingUser.user, existingUser.session.access_token);
          return;
        }

        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-997116c5/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            email: emailToUse,
            password: password,
            name: name
          })
        });

        const result = await response.json();
        
        if (!response.ok) {
          if (response.status === 409 || (result.code === 'user_exists')) {
            setError('An account with this name already exists. Please use "Login" mode or try a different name.');
            setIsReturningUser(true);
          } else {
            throw new Error(result.error || 'Failed to create account');
          }
          return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password: password,
        });

        if (error) throw error;
        onAuthSuccess(data.user, data.session.access_token);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = name.trim().length > 0 && password.length > 0 && (isReturningUser || confirmPassword.length > 0);

  const inputClass =
    'type-body w-full h-[46px] box-border rounded-[var(--radius-md)] border border-[var(--border-soft-muted)] bg-[var(--surface-auth-input)] pl-[34px] pr-[var(--space-4)] text-[var(--text-body)] shadow-none transition-all placeholder:text-[var(--text-label-3)] focus:border-[var(--accent-login-focus)] focus:ring-2 focus:ring-[color:var(--accent-login-ring)]/10 focus:outline-none';

  return (
    <div
      className="absolute inset-0 z-[100] overflow-x-hidden overflow-y-auto bg-[var(--bg-screen-auth)]"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <CanopyScreenBackground variant="login" />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[390px] flex-col px-[var(--space-6)] pb-[max(env(safe-area-inset-bottom),var(--space-7))] pt-[clamp(1.75rem,8dvh,4.75rem)] sm:pt-[clamp(1.5rem,7dvh,4rem)]">
        <motion.div
          className="mb-[var(--space-5)] flex flex-col items-center pt-[var(--space-1)] sm:mb-[var(--space-6)]"
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <div className="mb-[var(--space-2)] h-8 w-8">
            <svg className="block size-full" fill="none" viewBox="0 0 780.771 775.61">
              <path d={svgPaths.p2ff87f00} fill="var(--text-strong-alt)" />
            </svg>
          </div>
          <h1 className="type-display text-center tracking-tight text-[var(--text-brand-wordmark)]">
            Can<span className="italic">opy</span>
          </h1>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mx-auto mt-[var(--space-1)] w-full max-w-[332px] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-soft-alt)] bg-[var(--surface-auth-card)]"
          style={{
            boxShadow: 'var(--shadow-auth-card)',
          }}
        >
          <div className="bg-[var(--surface-auth-card)] px-[var(--space-5)] pb-[var(--space-8)] pt-[var(--space-5)]">
            <div className="mb-[var(--space-5)] flex h-[46px] items-center rounded-[var(--radius-full)] bg-[var(--surface-auth-segment)] p-[var(--space-1)]">
              <button
                type="button"
                onClick={() => setIsReturningUser(true)}
                className={`type-label flex h-[37px] flex-1 items-center justify-center rounded-[var(--radius-full)] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-auth-segment)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${
                  isReturningUser ? 'bg-[var(--surface-base)] text-[var(--text-body-muted-4)] shadow-[var(--shadow-chip)] hover:bg-[var(--surface-base)]' : 'text-[var(--text-label)] hover:bg-[var(--surface-base-60)]'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsReturningUser(false)}
                className={`type-label flex h-[37px] flex-1 items-center justify-center rounded-[var(--radius-full)] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-auth-segment)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${
                  !isReturningUser ? 'bg-[var(--surface-base)] text-[var(--text-body-muted-4)] shadow-[var(--shadow-chip)] hover:bg-[var(--surface-base)]' : 'text-[var(--text-label)] hover:bg-[var(--surface-base-60)]'
                }`}
              >
                Sign up
              </button>
            </div>

            <div className="space-y-[var(--space-3)]">
              <div className="relative">
                <label htmlFor="login-username" className="type-label mb-[var(--space-2)] block text-[var(--text-label-2)]">
                  Username
                </label>
                <User className="pointer-events-none absolute left-3 top-[32px] h-[15px] w-[15px] text-[var(--text-label-4)]" aria-hidden />
                <input
                  id="login-username"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={inputClass}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && canProceed && handleSubmit()}
                />
              </div>

              <div className="relative">
                <label htmlFor="login-password" className="type-label mb-[var(--space-2)] block text-[var(--text-label-2)]">
                  Password
                </label>
                <Lock className="pointer-events-none absolute left-3 top-[32px] h-[15px] w-[15px] text-[var(--text-label-4)]" aria-hidden />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                  onKeyDown={(e) => e.key === 'Enter' && canProceed && handleSubmit()}
                />
              </div>

              {!isReturningUser && (
                <div className="relative">
                  <label htmlFor="login-confirm" className="type-label mb-[var(--space-2)] block text-[var(--text-label-2)]">
                    Confirm password
                  </label>
                  <Lock className="pointer-events-none absolute left-3 top-[32px] h-[15px] w-[15px] text-[var(--text-label-4)]" aria-hidden />
                  <input
                    id="login-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className={inputClass}
                    onKeyDown={(e) => e.key === 'Enter' && canProceed && handleSubmit()}
                  />
                </div>
              )}
            </div>

            {isReturningUser && (
              <div className="mt-[var(--space-2)] text-right">
                <button type="button" className="type-caption text-[var(--text-caption-5)] transition-all duration-150 ease-out hover:text-[var(--accent-pill-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-auth-card)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40">
                  Forgot password
                </button>
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, x: [0, -4, 4, -2, 0] }}
                transition={{ duration: 0.28 }}
                className="type-caption mt-[var(--space-4)] rounded-[var(--radius-md)] border border-[var(--error-border-soft)] bg-[var(--error-bg-soft)] p-[var(--space-3)] text-center text-[var(--error-text)]"
              >
                {error}
              </motion.div>
            )}

            <div className="mt-[var(--space-5)]">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed || isLoading}
                className={`type-body h-[48px] w-full rounded-[var(--radius-full)] font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-accent-40)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-auth-card)] active:scale-[0.97] ${
                  canProceed && !isLoading
                    ? 'bg-[var(--surface-auth-button)] text-white hover:bg-[var(--surface-auth-button-hover)]'
                    : 'bg-[var(--surface-auth-button-disabled)] text-white/92'
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                ) : isReturningUser ? (
                  'Login'
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>

            <div className="mt-[var(--space-3)] text-center">
              <button
                type="button"
                onClick={onGuestMode}
                disabled={isLoading}
                className="type-body font-semibold text-[var(--text-body-muted-alt)] transition-all duration-150 ease-out hover:text-[var(--text-strong-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-auth-card)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Try as Guest
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default LoginFlow;
