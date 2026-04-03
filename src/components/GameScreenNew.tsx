import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Send, Sparkles, Check } from 'lucide-react';
import type { Todo, JournalEntry } from '../App';
import JournalEntryDetailView from './JournalEntryDetailView';
import { getUnlockedPlants, getPlantById, getNewlyUnlockedPlants, getUserUnlockedPlants, PLANT_REGISTRY } from '../lib/plantRegistry';
import { getLevelFromPoints, checkLevelUp } from '../lib/pointsSystem';

// Import pixelated grass background
import grassTexture from 'figma:asset/efb1d6fe14114965e2db541fd29beb0dca2527d6.png';

interface GameScreenProps {
  playerProgress: {
    level: number;
    currentXP: number;
    totalXP: number;
  };
  levelConfig: Array<{
    level: number;
    xpRequired: number;
    title: string;
    reward: string;
    emoji: string;
  }>;
  getXPForNextLevel: (currentLevel: number) => number;
  journalEntries?: JournalEntry[];
  todos: Todo[];
}

export default function GameScreen({
  playerProgress,
  levelConfig,
  getXPForNextLevel,
  journalEntries = [],
  todos,
}: GameScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const [focusPlantCelebrating, setFocusPlantCelebrating] = useState(false);
  const [hasJournaledToday, setHasJournaledToday] = useState(false);
  const [completedTasksToday, setCompletedTasksToday] = useState(0);
  const [selectedPlant, setSelectedPlant] = useState('quiet-fern');
  const [ownedPlants, setOwnedPlants] = useState<string[]>([]);
  const [reflectionText, setReflectionText] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showLevelBurst, setShowLevelBurst] = useState(false);
  const [displayedXP, setDisplayedXP] = useState(0);
  const [displayedProgressPercentage, setDisplayedProgressPercentage] = useState(0);
  const [didTwoMinuteReset, setDidTwoMinuteReset] = useState(false);
  const prevLevelRef = useRef(playerProgress.level);

  // Load user data from localStorage
  useEffect(() => {
    try {
      const savedPlant = localStorage.getItem('lifelevel-selected-plant');
      if (savedPlant) {
        setSelectedPlant(savedPlant);
      }
      
      // Load owned plants
      const savedOwnedPlants = localStorage.getItem('lifelevel-owned-plants');
      if (savedOwnedPlants) {
        setOwnedPlants(JSON.parse(savedOwnedPlants));
      }
    } catch (error) {
      console.warn('Could not load user data:', error);
    }
  }, []);

  // Plant configuration - using all plants from registry
  const plants = PLANT_REGISTRY;

  const currentPlant = plants[selectedPlant as keyof typeof plants] || plants['quiet-fern'];

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const onCelebrate = () => {
      setFocusPlantCelebrating(true);
      clearTimeout(timeoutId);
      const ms = prefersReducedMotion ? 400 : 720;
      timeoutId = setTimeout(() => setFocusPlantCelebrating(false), ms);
    };
    window.addEventListener('canopy-focus-session-celebrate', onCelebrate);
    return () => {
      window.removeEventListener('canopy-focus-session-celebrate', onCelebrate);
      clearTimeout(timeoutId);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (playerProgress.level > prevLevelRef.current) {
      setShowLevelBurst(true);
      const timeoutId = setTimeout(() => setShowLevelBurst(false), 420);
      prevLevelRef.current = playerProgress.level;
      return () => clearTimeout(timeoutId);
    }
    prevLevelRef.current = playerProgress.level;
  }, [playerProgress.level]);

  // Check if user has journaled today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = journalEntries.find(entry => {
      const entryDate = new Date(entry.createdAt).toISOString().split('T')[0];
      return entryDate === today;
    });
    setHasJournaledToday(!!todayEntry);
  }, [journalEntries]);

  // Check completed tasks today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayCompletedCount = todos.filter(todo => {
      if (todo.completedAt) {
        const completedDate = new Date(todo.completedAt).toISOString().split('T')[0];
        return completedDate === today;
      }
      return false;
    }).length;
    setCompletedTasksToday(todayCompletedCount);
  }, [todos]);

  // Get current level info
  const currentLevelInfo = levelConfig.find(l => l.level === playerProgress.level);
  const plantName = currentPlant.displayName;
  
  const xpForNextLevel = getXPForNextLevel(playerProgress.level);
  const progressPercentage = (playerProgress.currentXP / xpForNextLevel) * 100;

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayedXP(playerProgress.currentXP);
      setDisplayedProgressPercentage(progressPercentage);
      return;
    }

    const duration = 360;
    const startTime = performance.now();
    const startXP = 0;
    const startPct = 0;
    let frameId = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);

      setDisplayedXP(Math.round(startXP + (playerProgress.currentXP - startXP) * eased));
      setDisplayedProgressPercentage(startPct + (progressPercentage - startPct) * eased);

      if (t < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [playerProgress.currentXP, progressPercentage, prefersReducedMotion]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const stored = localStorage.getItem(`lifelevel-reset-${today}`);
      setDidTwoMinuteReset(stored === 'true');
    } catch {
      setDidTwoMinuteReset(false);
    }
  }, []);

  const markTwoMinuteReset = () => {
    const next = !didTwoMinuteReset;
    setDidTwoMinuteReset(next);
    const today = new Date().toISOString().split('T')[0];
    try {
      localStorage.setItem(`lifelevel-reset-${today}`, String(next));
      window.dispatchEvent(new Event('canopy-bonus-updated'));
    } catch {
      // no-op
    }
  };

  const focusModeToday = (() => {
    try {
      const enabled = JSON.parse(localStorage.getItem('lifelevel-focus-mode') || 'true');
      return enabled && completedTasksToday > 0;
    } catch {
      return completedTasksToday > 0;
    }
  })();

  // Calculate year garden data (365 days)
  const generateYearGarden = () => {
    const today = new Date();
    const yearAgo = new Date(today);
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    
    const days = [];
    const currentDate = new Date(yearAgo);
    
    while (currentDate <= today) {
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Check if there's activity on this date (journal or completed tasks)
      const hasJournal = journalEntries.some(entry => {
        const entryDate = new Date(entry.createdAt).toISOString().split('T')[0];
        return entryDate === dateString;
      });
      
      const hasCompletedTask = todos.some(todo => {
        if (todo.completedAt) {
          const completedDate = new Date(todo.completedAt).toISOString().split('T')[0];
          return completedDate === dateString;
        }
        return false;
      });
      
      days.push({
        date: dateString,
        hasActivity: hasJournal || hasCompletedTask,
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const yearGardenDays = generateYearGarden();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 overflow-y-auto" style={{ maxHeight: '100vh' }}>
        <h2 className="mb-3 text-xs uppercase tracking-widest text-gray-400">Your Garden</h2>
        <h2 className="mb-0 font-serif text-[2.6rem] leading-tight text-[var(--text-strong-alt)]">Garden</h2>
        <p className="mb-6 mt-2 text-[14px] font-normal leading-[1.4] text-[var(--text-caption-2)]">Your plant grows as you show up.</p>
        
        {/* Plant Card */}
        <motion.div 
          className="relative mb-4 flex flex-col items-center rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-base-90)] p-4 shadow-sm backdrop-blur-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Garden Field with Plants */}
          <div className="mb-3 w-full relative">
            {/* Garden background field - Pixelated grass texture */}
            <div 
              className="relative h-36 w-full overflow-hidden rounded-2xl"
              style={{
                backgroundImage: `url(${grassTexture})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                imageRendering: 'pixelated',
              }}
            >
              {/* Subtle vignette for depth */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10"></div>
              
              {/* Plant positions on the field */}
              <div className="absolute inset-0 flex items-end justify-center gap-6 pb-6">
                {/* Left plant (if level 3+) */}
                {playerProgress.level >= 3 && (
                  <motion.div 
                    className="relative" 
                    style={{ marginBottom: '0px' }}
                    animate={{ 
                      y: [0, -4, 0],
                      scale: [1, 1.02, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                  >
                    <img 
                      src={currentPlant.image} 
                      alt="Plant"
                      className="pixelated w-16 h-auto drop-shadow-lg"
                      style={{
                        imageRendering: 'pixelated',
                      }}
                    />
                  </motion.div>
                )}
                
                {/* Center plant - User's selected plant (always visible) */}
                <motion.div 
                  className="relative" 
                  style={{ marginBottom: '0px' }}
                  animate={
                    focusPlantCelebrating
                      ? prefersReducedMotion
                        ? { opacity: [1, 0.9, 1], y: 0, scale: 1 }
                        : { y: [0, -16, 0], scale: [1, 1.08, 1] }
                      : prefersReducedMotion
                        ? { y: 0, scale: 1, opacity: 1 }
                        : { y: [0, -6, 0], scale: [1, 1.03, 1] }
                  }
                  transition={
                    focusPlantCelebrating
                      ? { duration: prefersReducedMotion ? 0.35 : 0.65, ease: 'easeOut' }
                      : { duration: 4, repeat: prefersReducedMotion ? 0 : Infinity, ease: 'easeInOut' }
                  }
                >
                  <img 
                    src={currentPlant.image} 
                    alt={currentPlant.displayName}
                    className="pixelated w-18 h-auto drop-shadow-xl"
                    style={{
                      imageRendering: 'pixelated',
                    }}
                  />
                </motion.div>
                
                {/* Right plant (if level 2+) */}
                {playerProgress.level >= 2 && (
                  <motion.div 
                    className="relative" 
                    style={{ marginBottom: '0px' }}
                    animate={{ 
                      y: [0, -4, 0],
                      scale: [1, 1.02, 1]
                    }}
                    transition={{ 
                      duration: 3.5, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 0.3
                    }}
                  >
                    <img 
                      src={currentPlant.image} 
                      alt="Plant"
                      className="pixelated w-16 h-auto drop-shadow-lg"
                      style={{
                        imageRendering: 'pixelated',
                      }}
                    />
                  </motion.div>
                )}
              </div>
              
              {/* Plant name label at bottom */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 backdrop-blur-sm">
                <p className="text-white text-xs font-medium">{currentPlant.displayName}</p>
              </div>
            </div>
          </div>

          {/* Plant Name */}
          <h3 className="mb-1 font-serif text-[1.75rem] italic text-gray-900">
            {plantName}
          </h3>
          
          {/* Level Info */}
          <p className="mb-3 text-sm text-gray-400">
            Level {playerProgress.level} · Seedling
          </p>

          {/* Progress Bar */}
          <div className="w-full mb-2">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">To level {playerProgress.level + 1}</span>
              <span className="font-medium text-[var(--accent-cyan)]">
                {displayedXP} / {xpForNextLevel} pts
              </span>
            </div>
            
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[var(--accent-teal)]"
                initial={{ width: 0 }}
                animate={{ width: `${displayedProgressPercentage}%` }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Tasks + journal entries earn points
          </p>
          <AnimatePresence>
            {showLevelBurst && (
              <motion.div
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.span
                  className="text-2xl"
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 6 }}
                  animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1.05, y: -6 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.36 }}
                >
                  ✨
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Today's Watering Card */}
        <motion.div 
          className="mb-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-base-80)] p-3 shadow-sm backdrop-blur-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h4 className="mb-2 text-xs font-light uppercase tracking-wider text-[var(--text-caption-2)]">
            Today's watering
          </h4>
          
          <div className="space-y-2.5">
            {/* Journal Entry */}
            <motion.div 
              className="flex items-center justify-between"
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div>
                <p className="text-sm font-light text-[var(--text-strong-alt)]">Journal entry</p>
                <motion.p 
                  className="text-xs text-[var(--text-caption-2)]"
                  animate={{ 
                    opacity: hasJournaledToday ? [0.5, 1, 0.5] : 1 
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: hasJournaledToday ? Infinity : 0,
                    ease: "easeInOut" 
                  }}
                >
                  +10 pts
                </motion.p>
              </div>
              <motion.div
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                  hasJournaledToday
                    ? 'bg-[var(--accent-teal)]'
                    : 'border-2 border-[var(--border-soft)] bg-[var(--surface-base)]'
                }`}
                animate={{ 
                  scale: hasJournaledToday ? [1, 1.1, 1] : 1 
                }}
                transition={{ 
                  duration: 0.3 
                }}
              >
                <AnimatePresence>
                  {hasJournaledToday && (
                    <motion.svg
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                      className="h-5 w-5 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <motion.path
                        d="M5 13l4 4L19 7"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>

            {/* Divider */}
            <div className="border-t border-[var(--border-soft-panel-2)]/70" />

            {/* Complete 2 Tasks */}
            <motion.div 
              className="flex items-center justify-between"
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div>
                <p className="text-sm font-light text-[var(--text-strong-alt)]">Complete 2 tasks</p>
                <motion.p 
                  className="text-xs text-[var(--text-caption-2)]"
                  animate={{ 
                    opacity: completedTasksToday >= 2 ? [0.5, 1, 0.5] : 1 
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: completedTasksToday >= 2 ? Infinity : 0,
                    ease: "easeInOut" 
                  }}
                >
                  +20 pts
                </motion.p>
              </div>
              <motion.div
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                  completedTasksToday >= 2
                    ? 'bg-[var(--accent-teal)]'
                    : 'border-2 border-[var(--border-soft)] bg-[var(--surface-base)]'
                }`}
                animate={{ 
                  scale: completedTasksToday >= 2 ? [1, 1.1, 1] : 1 
                }}
                transition={{ 
                  duration: 0.3 
                }}
              >
                <AnimatePresence>
                  {completedTasksToday >= 2 && (
                    <motion.svg
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                      className="h-5 w-5 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <motion.path
                        d="M5 13l4 4L19 7"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>

            {/* Divider */}
            <div className="border-t border-[var(--border-soft-panel-2)]/70" />

            {/* Focus mode used today */}
            <motion.div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-light text-[var(--text-strong-alt)]">Focus mode used today</p>
                <p className="text-xs text-[var(--text-caption-2)]">+10 pts</p>
              </div>
              <motion.div
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                  focusModeToday ? 'bg-[var(--accent-teal)]' : 'border-2 border-[var(--border-soft)] bg-[var(--surface-base)]'
                }`}
              >
                {focusModeToday && (
                  <Check className="h-5 w-5 text-white" />
                )}
              </motion.div>
            </motion.div>

            {/* Divider */}
            <div className="border-t border-[var(--border-soft-panel-2)]/70" />

            {/* Two minute reset */}
            <motion.button
              onClick={markTwoMinuteReset}
              className="w-full text-left flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-light text-[var(--text-strong-alt)]">2-minute reset</p>
                <p className="text-xs text-[var(--text-caption-2)]">+5 pts</p>
              </div>
              <motion.div
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                  didTwoMinuteReset ? 'bg-[var(--accent-teal)]' : 'border-2 border-[var(--border-soft)] bg-[var(--surface-base)]'
                }`}
              >
                {didTwoMinuteReset && (
                  <Check className="h-5 w-5 text-white" />
                )}
              </motion.div>
            </motion.button>
          </div>
        </motion.div>

        {/* Plant Collection */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mb-6"
        >
          <h4 className="mb-3 px-1 text-xs font-light uppercase tracking-widest text-[var(--text-caption-2)]">
            Your Plant Collection
          </h4>
          
          <div className="grid grid-cols-3 gap-[var(--space-2)] px-1">
            {Object.entries(plants).sort(([keyA], [keyB]) => {
              const isOwnedA = ownedPlants.includes(keyA);
              const isOwnedB = ownedPlants.includes(keyB);
              
              // Owned plants come first
              if (isOwnedA && !isOwnedB) return -1;
              if (!isOwnedA && isOwnedB) return 1;
              
              // Within each group, maintain original order
              return 0;
            }).slice(0, 6).map(([key, plant], index) => {
              // Calculate current level from total XP using points system
              const currentLevel = getLevelFromPoints(playerProgress.totalXP);
              // Check if user owns this plant
              const isOwned = ownedPlants.includes(key);
              // Check if this is the user's starter plant (first owned plant)
              const isStarterPlant = ownedPlants.length > 0 && ownedPlants[0] === key;
              // Use user-specific unlock logic
              const isUnlocked = isOwned || 
                                (plant.isStarter && currentLevel >= 2) || 
                                (plant.unlockLevel && currentLevel >= plant.unlockLevel);
              const isSelected = key === selectedPlant;
              
              // Determine what text to show below the plant
              let unlockText = '';
              if (isOwned && isStarterPlant) {
                unlockText = 'Your first plant';
              } else if (!isUnlocked && plant.unlockLevel) {
                unlockText = `Unlocks at lvl ${plant.unlockLevel}`;
              }
              
              return (
              <motion.button
                key={key}
                onClick={() => {
                  if (isUnlocked) {
                    setSelectedPlant(key);
                    localStorage.setItem('lifelevel-selected-plant', key);
                  }
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  delay: 0.5 + (index * 0.1),
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
                className={`relative aspect-square rounded-[var(--radius-md)] border border-[var(--border-soft-panel-3)] bg-[var(--surface-base)] p-[var(--space-3)] shadow-[var(--shadow-card-soft)] transition-all duration-150 ease-out ${
                  isSelected
                    ? 'border-[var(--accent-teal)]'
                    : ''
                } ${
                  isUnlocked
                    ? 'hover:bg-[var(--surface-hover-panel)] cursor-pointer'
                    : 'cursor-not-allowed'
                }`}
                whileHover={isUnlocked ? { 
                  scale: 1.02,
                } : {}}
                whileTap={isUnlocked ? { scale: 0.98 } : {}}
              >
                <div className="flex flex-col items-center justify-center h-full space-y-[var(--space-1)]">
                  {/* Plant image */}
                  <div className="flex h-8 w-8 items-center justify-center">
                    <img
                      src={plant.image}
                      alt={plant.displayName}
                      className="h-full w-full object-contain"
                      style={{
                        imageRendering: 'pixelated',
                        opacity: isUnlocked ? 1 : 0.4,
                        transform: 'scale(1.2)',
                      }}
                    />
                  </div>
                  
                  {/* Plant name */}
                  <h5 className="text-xs font-medium text-[var(--text-strong-alt)] text-center leading-tight">
                    {plant.displayName}
                  </h5>
                  
                  {/* Status text */}
                  <p className="text-[10px] text-[var(--text-caption-2)] text-center leading-tight">
                    {unlockText}
                  </p>
                </div>
              </motion.button>
              );
            })}
          </div>
          
          {/* See More button - full width with proper spacing */}
          {Object.entries(plants).length > 6 && (
            <div className="mt-[var(--space-3)]">
              <motion.button
                onClick={() => setShowAllPlants(!showAllPlants)}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  delay: 1.1,
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
                className="type-body h-14 w-full rounded-[var(--radius-full)] border border-[var(--border-soft)] bg-[var(--surface-base-90)] text-[var(--text-strong-alt)] shadow-none transition-all duration-150 ease-out hover:bg-[var(--surface-hover-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark)] focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98] cursor-pointer"
                whileHover={{ 
                  scale: 1.02,
                }}
                whileTap={{ scale: 0.98 }}
              >
                More Plants (+{Object.entries(plants).length - 6})
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Garden Reflection Input */}
      </div>

      {/* Journal Entry Detail View Modal */}
      {showDetailView && selectedDate && (
        <JournalEntryDetailView
          entries={journalEntries}
          selectedDate={selectedDate}
          onClose={() => {
            setShowDetailView(false);
            setSelectedDate(null);
          }}
        />
      )}
    </div>
  );
}
