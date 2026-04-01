import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Lock } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface LoginFlowProps {
  onAuthSuccess: (user: any, accessToken: string) => void;
  onGuestMode: () => void;
  backgroundTheme: string;
}

const LoginFlow: React.FC<LoginFlowProps> = ({ onAuthSuccess, onGuestMode }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isReturningUser, setIsReturningUser] = useState(false);

  const supabase = getSupabaseClient();

  const steps = [
    {
      title: "What's your name?",
      subtitle: "Let's get you set up"
    },
    {
      title: isReturningUser ? "Enter your password" : "Create a password",
      subtitle: isReturningUser ? "Enter your password to continue" : "Keep your tasks secure"
    }
  ];

  const handleNext = async () => {
    setError('');

    if (currentStep === 0) {
      if (!name.trim()) {
        setError('Please enter your name');
        return;
      }
      setCurrentStep(1);
    } else {
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
          // Sign in existing user
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
          // First, try to sign in to check if user already exists
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

          // User doesn't exist, create new account
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
              setError('An account with this name already exists. Please use "Returning" mode or try a different name.');
              setIsReturningUser(true);
            } else {
              throw new Error(result.error || 'Failed to create account');
            }
            return;
          }

          // Sign them in with the new account
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
    }
  };

  const canProceed = currentStep === 0 
    ? name.trim().length > 0 
    : password.length > 0 && (isReturningUser || confirmPassword.length > 0);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#EBE8F4] to-[#E0DCF0] flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="w-full max-w-md my-auto">
        {/* Canopy Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-serif text-5xl text-[#2D2B3E] mb-2">
            Can<span className="italic">opy</span>
          </h1>
          <p className="text-[#8B86A3] text-sm font-light">
            Welcome back — your garden awaits
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl"
        >
          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                    index <= currentStep ? 'bg-teal-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl text-gray-900 mb-2">
                  {steps[currentStep].title}
                </h2>
                <p className="text-sm text-gray-500">
                  {steps[currentStep].subtitle}
                </p>
              </div>

              {/* Step 0: Name input */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  {/* User Type Selection */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsReturningUser(false)}
                      className={`flex-1 py-3 px-4 rounded-2xl transition-all ${
                        !isReturningUser
                          ? 'bg-gray-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      New User
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsReturningUser(true)}
                      className={`flex-1 py-3 px-4 rounded-2xl transition-all ${
                        isReturningUser
                          ? 'bg-gray-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Returning
                    </button>
                  </div>

                  {/* Name Input */}
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-teal-400 rounded-2xl text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all"
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && canProceed && handleNext()}
                    />
                  </div>
                </div>
              )}

              {/* Step 1: Password input */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-teal-400 rounded-2xl text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all"
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && canProceed && handleNext()}
                    />
                  </div>

                  {!isReturningUser && (
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-teal-400 rounded-2xl text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all"
                        onKeyPress={(e) => e.key === 'Enter' && canProceed && handleNext()}
                      />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm text-center rounded-2xl"
            >
              {error}
            </motion.div>
          )}

          <div className="mt-8 flex gap-3">
            {/* Back Button */}
            {currentStep > 0 && (
              <button
                onClick={() => {
                  setCurrentStep(currentStep - 1);
                  setError('');
                }}
                disabled={isLoading}
                className="px-6 py-4 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 rounded-full font-medium transition-colors"
              >
                Back
              </button>
            )}
            
            {/* Continue/Submit Button */}
            <button
              onClick={handleNext}
              disabled={!canProceed || isLoading}
              className="flex-1 py-4 bg-teal-400 hover:bg-teal-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full font-medium transition-colors"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full mx-auto" />
              ) : (
                currentStep === steps.length - 1
                  ? isReturningUser ? 'Sign In' : 'Create Account'
                  : 'Continue'
              )}
            </button>
          </div>

          {/* Guest Mode Option */}
          {currentStep === 0 && (
            <div className="mt-4 text-center">
              <button
                onClick={onGuestMode}
                disabled={isLoading}
                className="text-sm text-gray-700 hover:text-gray-900 transition-colors underline font-medium"
              >
                Try as Guest
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LoginFlow;