import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { User, Lock } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import svgPaths from '../imports/Frame47296-1/svg-0hdeo07ddu';

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

  return (
    <div
      className="absolute inset-0 bg-gradient-to-b from-[#EBE8F4] to-[#E0DCF0] flex items-center justify-center z-[100] p-4 overflow-y-auto"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 64px)' }}
    >
      <div className="w-full max-w-[320px] my-auto">
        <motion.div
          className="text-center mb-5"
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <div className="w-8 h-8 mx-auto mb-1">
            <svg className="block size-full" fill="none" viewBox="0 0 780.771 775.61">
              <path d={svgPaths.p2ff87f00} fill="#2D2B3E" />
            </svg>
          </div>
          <h1 className="font-serif text-6xl text-[#2D2B3E] leading-none">
            Can<span className="italic">opy</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-[32px] overflow-hidden shadow-xl border border-[#DCD7EB] bg-white"
        >
          <div className="bg-white px-6 pt-6 pb-7">
            <div className="flex p-1 bg-[#EFEFF2] rounded-full mb-6">
              <button
                type="button"
                onClick={() => setIsReturningUser(true)}
                className={`flex-1 py-2 rounded-full text-sm transition-colors ${isReturningUser ? 'bg-white text-[#2D2B3E]' : 'text-[#8B86A3]'}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsReturningUser(false)}
                className={`flex-1 py-2 rounded-full text-sm transition-colors ${!isReturningUser ? 'bg-white text-[#2D2B3E]' : 'text-[#8B86A3]'}`}
              >
                Sign up
              </button>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <label className="block text-xs text-[#8B86A3] mb-1">Username</label>
                <User className="absolute left-3 top-[33px] w-4 h-4 text-[#A6A6A6]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full pl-9 pr-3 py-3 bg-[#F7F7F8] border border-[#ECECEC] rounded-xl text-[#2D2B3E] placeholder:text-[#B6B6B6] focus:border-[#696A8E] focus:ring-2 focus:ring-[#696A8E]/20 focus:outline-none transition-all"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && canProceed && handleSubmit()}
                />
              </div>

              <div className="relative">
                <label className="block text-xs text-[#8B86A3] mb-1">Password</label>
                <Lock className="absolute left-3 top-[33px] w-4 h-4 text-[#A6A6A6]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-3 bg-[#F7F7F8] border border-[#ECECEC] rounded-xl text-[#2D2B3E] placeholder:text-[#B6B6B6] focus:border-[#696A8E] focus:ring-2 focus:ring-[#696A8E]/20 focus:outline-none transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && canProceed && handleSubmit()}
                />
              </div>

              {!isReturningUser && (
                <div className="relative">
                  <label className="block text-xs text-[#8B86A3] mb-1">Confirm password</label>
                  <Lock className="absolute left-3 top-[33px] w-4 h-4 text-[#A6A6A6]" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full pl-9 pr-3 py-3 bg-[#F7F7F8] border border-[#ECECEC] rounded-xl text-[#2D2B3E] placeholder:text-[#B6B6B6] focus:border-[#696A8E] focus:ring-2 focus:ring-[#696A8E]/20 focus:outline-none transition-all"
                    onKeyPress={(e) => e.key === 'Enter' && canProceed && handleSubmit()}
                  />
                </div>
              )}
            </div>

            {isReturningUser && (
              <div className="text-right mt-2">
                <button className="text-sm text-[#696A8E] hover:text-[#5A5B78]">Forgot password</button>
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, x: [0, -4, 4, -2, 0] }}
                transition={{ duration: 0.28 }}
                className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm text-center rounded-xl"
              >
                {error}
              </motion.div>
            )}

            <div className="mt-6">
              <button
                onClick={handleSubmit}
                disabled={!canProceed || isLoading}
                className="w-full py-3 bg-[#101015] hover:bg-[#08080d] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full font-medium transition-colors"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full mx-auto" />
                ) : isReturningUser ? 'Login' : 'Sign Up'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={onGuestMode}
                disabled={isLoading}
                className="text-sm text-[#4C4C4C] hover:text-[#111111] transition-colors font-medium"
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