import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import svgPaths from '../imports/Frame47296-1/svg-0hdeo07ddu';
import CanopyScreenBackground from './CanopyScreenBackground';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
  backgroundImage?: string;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isPressed, setIsPressed] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const handleMouseDown = () => {
    setIsPressed(true);
  };
  
  const handleMouseUp = () => {
    if (slideProgress > 0.8) {
      // Slid far enough - complete
      setIsComplete(true);
      setTimeout(() => {
        onLoadingComplete();
      }, 300);
    } else {
      // Didn't slide far enough - reset
      setIsPressed(false);
      setSlideProgress(0);
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPressed) return;
    
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = Math.min(Math.max(x / rect.width, 0), 1);
    setSlideProgress(progress);
  };

  return (
    <motion.div
      className="absolute inset-0 z-50 flex min-h-[100dvh] flex-col overflow-y-auto overscroll-y-contain bg-[#4A4E6E]"
      style={{
        paddingTop: 'max(env(safe-area-inset-top), 40px)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 24px)',
      }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <CanopyScreenBackground variant="splash" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-max(env(safe-area-inset-top),40px)-max(env(safe-area-inset-bottom),24px))] w-full max-w-[390px] flex-1 flex-col items-center px-6 py-6">
        <div className="flex flex-1 flex-col items-center justify-center">
        {/* Canopy Flower Logo */}
        <motion.div
          className="mb-8 w-24 h-24"
          initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0.8, opacity: 0 }}
          animate={{
            scale: prefersReducedMotion ? 1 : [0.9, 1.04, 1],
            opacity: 1,
          }}
          transition={{
            duration: 0.35,
            ease: 'easeOut',
          }}
        >
          <svg className="block size-full" fill="none" viewBox="0 0 780.771 775.61">
            <path d={svgPaths.p2ff87f00} fill="#FFFFFF" />
          </svg>
        </motion.div>

        {/* Canopy Branding */}
        <motion.div
          className="mx-[0px] mb-[32px] mt-[0px] text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="mx-[0px] mb-[16px] mt-[0px] font-serif text-6xl text-white">
            Can<span className="italic">opy</span>
          </h1>
          <p className="text-sm font-light uppercase tracking-[0.3em] text-white/70">
            Grow through every day
          </p>
        </motion.div>
        </div>

        {/* Enter Button */}
        <motion.div
          className="mb-2 flex w-full flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.button
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp}
            className={`mb-4 w-full max-w-[248px] rounded-full border border-white/10 bg-[#2D2B3E] px-10 py-4 text-lg font-light text-white shadow-lg transition-all duration-200 cursor-pointer select-none overflow-hidden relative ${
              isPressed ? 'scale-95' : 'hover:bg-[#232136]'
            }`}
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            animate={{
              backgroundColor: isComplete ? '#10B981' : '#2D2B3E',
            }}
            transition={{ duration: 0.3 }}
          >
            {/* Progress fill */}
            <motion.div 
              className="absolute top-0 left-0 h-full bg-white/20 rounded-full"
              style={{ width: `${slideProgress * 100}%` }}
              transition={{ duration: 0.1 }}
            />
            
            {/* Slider thumb */}
            <motion.div 
              className="absolute top-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center"
              style={{ 
                left: `${slideProgress * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
              transition={{ duration: 0.1 }}
            >
              <span className="text-[#2D2B3E] text-sm">→</span>
            </motion.div>
            
            {/* Text */}
            <span className={`transition-opacity duration-200 ${slideProgress > 0.3 ? 'opacity-0' : 'opacity-100'}`}>
              {isComplete ? 'Welcome!' : 'Slide to begin →'}
            </span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
