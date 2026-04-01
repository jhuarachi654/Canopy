import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, User, Sparkles, Focus, Bell, CircleHelp, Bug } from 'lucide-react';
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
        <h2 className="font-serif text-4xl mb-6 text-gray-900">Profile</h2>

        {/* Profile header */}
        <div className="bg-white/85 backdrop-blur-sm rounded-3xl shadow-sm p-6 mb-4 border border-[#E8E4F3]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#ECE8F8] text-[#696A8E] flex items-center justify-center text-2xl">
              🌿
            </div>
            <div className="flex-1">
              <p className="text-xs tracking-widest uppercase text-[#8B86A3]">Your profile</p>
              <p className="text-xl text-[#2D2B3E]">{userName}</p>
              <p className="text-sm text-[#6F6986]">Current plant: {plantName}</p>
            </div>
          </div>
        </div>

        {/* Settings rows */}
        <div className="bg-white/85 backdrop-blur-sm rounded-3xl shadow-sm mb-4 border border-[#E8E4F3] overflow-hidden">
          {[
            { icon: User, label: 'Edit profile' },
            { icon: Sparkles, label: 'Customize experience' },
            { icon: Focus, label: 'Focus mode' },
            { icon: Bell, label: 'Notifications' },
            { icon: CircleHelp, label: 'FAQ' },
            { icon: Bug, label: 'Report a bug' },
          ].map((item, idx) => (
            <button
              key={item.label}
              className={`w-full px-5 py-4 flex items-center justify-between hover:bg-[#F7F4FC] transition-colors ${
                idx < 5 ? 'border-b border-[#EFEAF8]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-[#8B86A3]" />
                <span className="text-[#2D2B3E]">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#B2AAC8]" />
            </button>
          ))}
        </div>

        {/* Invite card */}
        <div className="rounded-3xl shadow-sm p-5 mb-4 border border-[#E8E4F3]"
          style={{ background: 'linear-gradient(135deg,#F3F0FB 0%,#ECE8F8 55%,#E6F4F3 100%)' }}
        >
          <p className="text-xs text-[#8B86A3] uppercase tracking-widest mb-1">Invite a friend</p>
          <h3 className="text-[#2D2B3E] text-lg mb-1 font-serif">Grow together, gently</h3>
          <p className="text-sm text-[#6F6986] mb-3">Share Canopy with someone who needs a calm planning space.</p>
          <button className="px-4 py-2 rounded-full bg-white text-[#696A8E] border border-[#DAD3EC] text-sm hover:bg-[#F7F4FC] transition-colors">
            Send invite
          </button>
        </div>

        {/* Focus mode control */}
        <div className="bg-white/85 backdrop-blur-sm rounded-3xl shadow-sm p-5 mb-4 border border-[#E8E4F3]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#2D2B3E]">Focus mode</p>
              <p className="text-sm text-[#6F6986]">Limit today&apos;s list to 3 tasks</p>
            </div>
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`relative w-14 h-8 rounded-full transition-colors ${focusMode ? 'bg-teal-500' : 'bg-gray-200'}`}
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

        {/* Logout */}
        <div className="bg-white/85 backdrop-blur-sm rounded-3xl shadow-sm p-6 mb-4 border border-[#E8E4F3]">
          <button
            onClick={onLogout}
            className="w-full py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-full font-medium transition-colors"
          >
            {isGuestMode ? 'Exit guest' : 'Log out'}
          </button>
          <p className="text-xs text-[#8B86A3] text-center mt-3">
            Level {playerProgress.level} · {plantName}
          </p>
        </div>
      </div>
    </div>
  );
}