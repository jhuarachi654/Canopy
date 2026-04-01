import React, { useState } from 'react';
import { motion } from 'motion/react';
import type { PlayerProgress } from '../App';

interface SettingsScreenProps {
  user: any;
  isGuestMode: boolean;
  onLogout: () => void;
  onRestartJourney: () => void;
  playerProgress: PlayerProgress;
  levelConfig: Array<{
    level: number;
    xpRequired: number;
    title: string;
    reward: string;
    emoji: string;
  }>;
}

export default function SettingsScreen({
  user,
  isGuestMode,
  onLogout,
  onRestartJourney,
  playerProgress,
  levelConfig,
}: SettingsScreenProps) {
  const [userName, setUserName] = useState(user?.user_metadata?.name || user?.email?.split('@')[0] || 'Guest');
  const [focusMode, setFocusMode] = useState(false);

  // Get current level info
  const currentLevelInfo = levelConfig.find(l => l.level === playerProgress.level);
  const plantName = currentLevelInfo?.title || "Getting Started";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-24 pt-4">
        {/* Header */}
        <h2 className="font-serif text-4xl mb-8 text-gray-900">Settings</h2>

        {/* User Name Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm p-6 mb-4">
          <label className="block text-xs uppercase tracking-widest text-gray-400 mb-3">
            Your Name
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full text-lg text-gray-900 bg-transparent border-0 outline-none placeholder:text-gray-300"
            placeholder="Enter your name"
          />
        </div>

        {/* Focus Mode Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg text-gray-900 mb-1">Focus mode</h3>
              <p className="text-sm text-gray-400">Limit today's list to 3 tasks</p>
            </div>
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                focusMode ? 'bg-teal-500' : 'bg-gray-200'
              }`}
              aria-label="Toggle focus mode"
            >
              <motion.div
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
                animate={{ left: focusMode ? '28px' : '4px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>

        {/* Your Plant Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm p-6 mb-4">
          <label className="block text-xs uppercase tracking-widest text-gray-400 mb-3">
            Your Plant
          </label>
          <h3 className="font-serif text-2xl text-gray-900 mb-2 italic">Quick Fern</h3>
          <p className="text-sm text-gray-400">
            Grows with you on this journey — type can't be switched mid-path.
          </p>
        </div>

        {/* Action Buttons Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm p-6 mb-4">
          
          <button
            onClick={onLogout}
            className="w-full py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-full font-medium transition-colors"
          >
            {isGuestMode ? 'Exit guest' : 'Log out'}
          </button>
        </div>
      </div>
    </div>
  );
}