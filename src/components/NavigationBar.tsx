import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ClipboardList, Sun, Calendar, MoreHorizontal, Flower2 } from 'lucide-react';

interface NavigationBarProps {
  activeScreen: 'todos' | 'game' | 'log' | 'journal' | 'settings';
  onScreenChange: (screen: 'todos' | 'game' | 'log' | 'journal' | 'settings') => void;
  completedCount: number;
  onLogout?: () => void;
  isGuestMode?: boolean;
}

export default function NavigationBar({
  activeScreen,
  onScreenChange,
  completedCount,
  onLogout,
  isGuestMode = false,
}: NavigationBarProps) {
  const prefersReducedMotion = useReducedMotion();
  const navItems = [
    {
      id: 'todos' as const,
      label: 'Tasks',
      icon: ClipboardList,
    },
    {
      id: 'game' as const,
      label: 'Garden',
      icon: Flower2,
    },
    {
      id: 'journal' as const,
      label: 'Journal',
      icon: Sun,
    },
    {
      id: 'log' as const,
      label: 'Log',
      icon: Calendar,
    },
    {
      id: 'settings' as const,
      label: 'More',
      icon: MoreHorizontal,
    },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] h-20 flex items-center justify-center bg-transparent"
      style={{
        paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))',
        paddingTop: '1rem',
      }}
    >
      <div className="flex w-[calc(100%-2rem)] max-w-[min(42rem,calc(100%-2rem))] items-center justify-between rounded-[var(--radius-full)] bg-[var(--surface-base-90)] px-[var(--space-5)] py-[var(--space-3)] shadow-lg backdrop-blur-lg">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onScreenChange(item.id)}
              className={`relative flex flex-col items-center justify-center gap-[var(--space-1)] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base-90)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${
                isActive ? 'scale-105' : 'scale-100'
              }`}
            >
              {/* Icon Container */}
              <motion.div
                className={`flex h-12 w-12 items-center justify-center rounded-[var(--radius-full)] transition-all duration-150 ease-out ${
                  isActive
                    ? 'bg-[var(--text-strong-alt)] text-white'
                    : 'bg-transparent text-[var(--text-caption-2)] hover:bg-[var(--surface-hover-panel)] hover:text-[var(--text-body-muted)]'
                }`}
                whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                animate={
                  prefersReducedMotion
                    ? { opacity: isActive ? 1 : 0.95 }
                    : { scale: isActive ? [1, 1.08, 1] : 1, y: isActive ? [0, -1, 0] : 0 }
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0.2 }
                    : { duration: 0.32, type: 'spring', stiffness: 300, damping: 20 }
                }
              >
                <Icon className="w-5 h-5" strokeWidth={2} />
              </motion.div>

              {/* Label */}
              <span
                className={`text-xs font-medium transition-colors duration-150 ease-out ${
                  isActive ? 'text-[var(--text-strong-alt)]' : 'text-[var(--text-caption-2)]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
