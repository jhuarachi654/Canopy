import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, User, Sparkles, Focus, Bell, CircleHelp, Bug } from 'lucide-react';
import type { PlayerProgress } from '../App';
import { getPlantById } from '../lib/plantRegistry';

const FOCUS_MODE_STORAGE_KEY = 'lifelevel-focus-mode';
const FOCUS_MODE_UPDATED_EVENT = 'canopy-focus-mode-updated';

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
  const [focusMode, setFocusMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(FOCUS_MODE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });
  const [selectedPlant, setSelectedPlant] = useState('quiet-fern');

  // Load selected plant from localStorage
  useEffect(() => {
    try {
      const savedPlant = localStorage.getItem('lifelevel-selected-plant');
      if (savedPlant) {
        setSelectedPlant(savedPlant);
      }
    } catch (error) {
      console.warn('Could not load selected plant:', error);
    }
  }, []);

  // Plant configuration - using registry
  const plants = {
    'quiet-fern': {
      name: getPlantById('quiet-fern')?.displayName || 'Quiet Fern',
      image: getPlantById('quiet-fern')?.image || '',
    },
    'wild-clover': {
      name: getPlantById('wild-clover')?.displayName || 'Wild Clover',
      image: getPlantById('wild-clover')?.image || '',
    },
    'rose-moss': {
      name: getPlantById('rose-moss')?.displayName || 'Rose Moss',
      image: getPlantById('rose-moss')?.image || '',
    },
    'blue-sage': {
      name: getPlantById('blue-sage')?.displayName || 'Blue Sage',
      image: getPlantById('blue-sage')?.image || '',
    },
  };

  const currentPlant = plants[selectedPlant as keyof typeof plants] || plants['quiet-fern'];

  useEffect(() => {
    const syncFocusMode = () => {
      try {
        const stored = localStorage.getItem(FOCUS_MODE_STORAGE_KEY);
        setFocusMode(stored ? JSON.parse(stored) : true);
      } catch {
        setFocusMode(true);
      }
    };

    window.addEventListener('storage', syncFocusMode);
    window.addEventListener('focus', syncFocusMode);
    window.addEventListener(FOCUS_MODE_UPDATED_EVENT, syncFocusMode);

    return () => {
      window.removeEventListener('storage', syncFocusMode);
      window.removeEventListener('focus', syncFocusMode);
      window.removeEventListener(FOCUS_MODE_UPDATED_EVENT, syncFocusMode);
    };
  }, []);

  const toggleFocusMode = () => {
    const next = !focusMode;
    setFocusMode(next);

    try {
      localStorage.setItem(FOCUS_MODE_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(FOCUS_MODE_UPDATED_EVENT));
    } catch {
      // no-op
    }
  };

  // Get current level info
  const currentLevelInfo = levelConfig.find(l => l.level === playerProgress.level);
  const plantName = currentLevelInfo?.title || "Getting Started";

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <div className="px-4 pt-4">
        <h2 className="mb-6 font-serif text-4xl text-gray-900">Profile</h2>

        {/* Profile header */}
        <div className="mb-4 rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-base-85)] p-6 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-card-subtle-9)]">
              <img 
                src={currentPlant.image} 
                alt={currentPlant.name}
                className="h-10 w-10 object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-widest text-[var(--text-caption-2)]">Your profile</p>
              <p className="text-xl text-[var(--text-strong-alt)]">{userName}</p>
              <p className="text-sm text-[var(--text-body-muted-2)]">Current plant: {currentPlant.name}</p>
            </div>
          </div>
        </div>

        {/* Settings rows */}
        <div className="mb-4 overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-base-85)] shadow-sm backdrop-blur-sm">
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
              className={`flex w-full items-center justify-between px-5 py-4 transition-all duration-150 ease-out hover:bg-[var(--surface-hover-panel)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${
                idx < 5 ? 'border-b border-[var(--border-soft-panel)]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4 text-[var(--text-caption-2)]" />
                <span className="text-[var(--text-strong-alt)]">{item.label}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--accent-icon-muted)]" />
            </button>
          ))}
        </div>

        {/* Invite card */}
        <div className="mb-4 rounded-3xl border border-[var(--border-soft)] p-5 shadow-sm"
          style={{ background: 'var(--bg-gradient-settings-invite)' }}
        >
          <p className="mb-1 text-xs uppercase tracking-widest text-[var(--text-caption-2)]">Invite a friend</p>
          <h3 className="mb-1 font-serif text-lg text-[var(--text-strong-alt)]">Grow together, gently</h3>
          <p className="mb-3 text-sm text-[var(--text-body-muted-2)]">Share Canopy with someone who needs a calm planning space.</p>
          <button className="rounded-full border border-[var(--border-soft-panel-5)] bg-[var(--surface-base)] px-4 py-2 text-sm text-[var(--accent-pill)] transition-all duration-150 ease-out hover:bg-[var(--surface-hover-panel)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40">
            Send invite
          </button>
        </div>

        {/* Focus mode control */}
        <div className="mb-4 rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-base-85)] p-5 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-strong-alt)]">Focus mode</p>
              <p className="text-sm text-[var(--text-body-muted-2)]">Limit today&apos;s list to 3 tasks</p>
            </div>
            <button
              onClick={toggleFocusMode}
              className={`relative h-8 w-14 rounded-full transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-accent-35)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base-85)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${focusMode ? 'bg-[var(--accent-teal)] hover:bg-[var(--accent-teal-hover)]' : 'bg-[var(--surface-panel-track-disabled)] hover:bg-[var(--surface-panel-track-neutral)]'}`}
              aria-label="Toggle focus mode"
              aria-pressed={focusMode}
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
        <div className="mb-4 rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-base-85)] p-6 shadow-sm backdrop-blur-sm">
          <button
            onClick={onLogout}
            className="w-full rounded-full bg-[var(--accent-teal)] py-4 font-medium text-white transition-all duration-150 ease-out hover:bg-[var(--accent-teal-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-accent-40)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base-85)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isGuestMode ? 'Exit guest' : 'Log out'}
          </button>
        </div>
      </div>
    </div>
  );
}
