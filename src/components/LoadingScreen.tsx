import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import svgPaths from '../imports/Frame47296-1/svg-0hdeo07ddu';
import CanopyScreenBackground from './CanopyScreenBackground';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
  backgroundImage?: string;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const handleEnter = () => {
    onLoadingComplete();
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
            onClick={handleEnter}
            className="mb-4 w-full max-w-[248px] rounded-full border border-white/10 bg-[#2D2B3E] px-10 py-4 text-lg font-light text-white shadow-lg transition-colors hover:bg-[#232136]"
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          >
            Start growing
          </motion.button>

          <motion.div
            className="text-center"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <p className="text-sm font-light text-white/70">I already have an account</p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
