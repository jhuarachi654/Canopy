import React from 'react';
import { motion } from 'motion/react';
import svgPaths from '../imports/Frame47296-1/svg-0hdeo07ddu';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
  backgroundImage?: string;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const handleEnter = () => {
    onLoadingComplete();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#5B5E88] via-[#7B7EA8] to-[#9B9EC8] overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Canopy Flower Logo */}
      <motion.div
        className="mb-8 w-24 h-24"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1
        }}
        transition={{ 
          duration: 0.8, 
          ease: "easeOut"
        }}
      >
        <svg className="block size-full" fill="none" viewBox="0 0 780.771 775.61">
          <path d={svgPaths.p2ff87f00} fill="white" />
        </svg>
      </motion.div>

      {/* Canopy Branding */}
      <motion.div
        className="text-center mx-[0px] mt-[0px] mb-[32px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h1 className="font-serif text-6xl text-white mx-[0px] mt-[0px] mb-[16px]">
          Can<span className="italic">opy</span>
        </h1>
        <p className="text-white/70 text-sm tracking-[0.3em] uppercase font-light">
          Grow through every day
        </p>
      </motion.div>

      {/* Enter Button */}
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <motion.button
          onClick={handleEnter}
          className="px-16 py-4 bg-[#2D2B3E] hover:bg-[#1D1B2E] text-white rounded-full font-light text-lg transition-colors shadow-lg mb-4 border border-white/20"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >Start growing</motion.button>

        {/* Hint text */}
        <motion.div
          className="text-center"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <p className="text-white/60 text-sm font-light">
            I already have an account
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}