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
      className="absolute bottom-0 left-0 right-0 flex items-center justify-center z-50"
      style={{
        paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
        paddingTop: '1.5rem',
      }}
    >
      <div className="bg-white/90 backdrop-blur-lg rounded-full shadow-lg px-5 py-3 w-[calc(100%-2rem)] max-w-[358px] flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onScreenChange(item.id)}
              className={`relative flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                isActive ? 'scale-105' : 'scale-100'
              }`}
            >
              {/* Icon Container */}
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'bg-transparent text-gray-400 hover:text-gray-600'
                }`}
                whileTap={prefersReducedMotion ? {} : { scale: 0.96 }}
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
                className={`text-xs font-medium transition-colors duration-200 ${
                  isActive ? 'text-gray-900' : 'text-gray-400'
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