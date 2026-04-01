import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles } from 'lucide-react';
import type { Todo, JournalEntry } from '../App';
import JournalEntryDetailView from './JournalEntryDetailView';

// Import all plant images
import quietFernImg from 'figma:asset/7438a9d659ebf123bfbcca1916fe079babb35132.png';
import wildCloverImg from 'figma:asset/4c899badb6a576e6df75d3cb576969dd9e07298d.png';
import roseMossImg from 'figma:asset/34ec7cd771dafa77769204ece804cb31dcd57a39.png';
import blueSageImg from 'figma:asset/98636990ae62d87883607d3992be74e4cfde2eee.png';

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
  const [hasJournaledToday, setHasJournaledToday] = useState(false);
  const [completedTasksToday, setCompletedTasksToday] = useState(0);
  const [selectedPlant, setSelectedPlant] = useState('quiet-fern');
  const [reflectionText, setReflectionText] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);

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

  // Plant configuration
  const plants = {
    'quiet-fern': {
      name: 'Quiet Fern',
      image: quietFernImg,
      unlockLevel: 1,
    },
    'wild-clover': {
      name: 'Wild Clover',
      image: wildCloverImg,
      unlockLevel: 5,
    },
    'rose-moss': {
      name: 'Rose Moss',
      image: roseMossImg,
      unlockLevel: 10,
    },
    'blue-sage': {
      name: 'Blue Sage',
      image: blueSageImg,
      unlockLevel: 15,
    },
  };

  const currentPlant = plants[selectedPlant as keyof typeof plants] || plants['quiet-fern'];

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
  const plantName = currentLevelInfo?.title || "Getting Started";
  
  const xpForNextLevel = getXPForNextLevel(playerProgress.level);
  const progressPercentage = (playerProgress.currentXP / xpForNextLevel) * 100;

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
    <div className="flex flex-col h-full overflow-hidden">
      <motion.div 
        className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-24 pt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        
        {/* Plant Card */}
        <motion.div 
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm p-6 mb-6 flex flex-col items-center border border-[#E8E4F3]"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Garden Field with Plants */}
          <div className="mb-4 w-full relative">
            {/* Garden background field - Pixelated grass texture */}
            <div 
              className="w-full h-48 rounded-2xl overflow-hidden relative"
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
              <div className="absolute inset-0 flex items-end justify-center pb-8 gap-6">
                {/* Left plant (if level 10+) */}
                {playerProgress.level >= 10 && (
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
                  animate={{ 
                    y: [0, -6, 0],
                    scale: [1, 1.03, 1]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  <img 
                    src={currentPlant.image} 
                    alt={currentPlant.name}
                    className="pixelated w-24 h-auto drop-shadow-xl"
                    style={{
                      imageRendering: 'pixelated',
                    }}
                  />
                </motion.div>
                
                {/* Right plant (if level 5+) */}
                {playerProgress.level >= 5 && (
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
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                <p className="text-white text-xs font-medium">{currentPlant.name}</p>
              </div>
            </div>
          </div>

          {/* Plant Name */}
          <h3 className="font-serif text-2xl text-gray-900 mb-1 italic">
            {plantName}
          </h3>
          
          {/* Level Info */}
          <p className="text-sm text-gray-400 mb-6">
            Level {playerProgress.level} · Seedling
          </p>

          {/* Progress Bar */}
          <div className="w-full mb-2">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">To level {playerProgress.level + 1}</span>
              <span className="text-[#34A0DE] font-medium">
                {playerProgress.currentXP} / {xpForNextLevel} pts
              </span>
            </div>
            
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#3431DE] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Tasks + journal entries earn points
          </p>
        </motion.div>

        {/* Today's Watering Card */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm p-6 mb-6 border border-[#E8E4F3]"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h4 className="text-sm text-[#8B86A3] mb-4 uppercase tracking-wider font-light">
            Today's watering
          </h4>
          
          <div className="space-y-4">
            {/* Journal Entry */}
            <motion.div 
              className="flex items-center justify-between"
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div>
                <p className="text-[#2D2B3E] font-light">Journal entry</p>
                <motion.p 
                  className="text-sm text-[#8B86A3]"
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
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  hasJournaledToday
                    ? 'bg-gradient-to-br from-[#A8C5DA] to-[#8B86A3]'
                    : 'border-2 border-[#E8E4F3] bg-white'
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
                      className="w-6 h-6 text-white"
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
            <div className="border-t border-[#EBE8F4]"></div>

            {/* Complete 2 Tasks */}
            <motion.div 
              className="flex items-center justify-between"
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div>
                <p className="text-[#2D2B3E] font-light">Complete 2 tasks</p>
                <motion.p 
                  className="text-sm text-[#8B86A3]"
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
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  completedTasksToday >= 2
                    ? 'bg-gradient-to-br from-[#A8C5DA] to-[#8B86A3]'
                    : 'border-2 border-[#E8E4F3] bg-white'
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
                      className="w-6 h-6 text-white"
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
          </div>
        </motion.div>

        {/* Year Garden Section */}
        <motion.div 
          className="mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h4 className="text-xs text-[#8B86A3] mb-3 uppercase tracking-widest px-1 font-light">
            Your Growth This Year
          </h4>
          
          
        </motion.div>

        {/* Plant Collection */}
        <motion.div 
          className="mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <h4 className="text-xs text-[#8B86A3] mb-3 uppercase tracking-widest px-1 font-light">
            Your Plant Collection
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(plants).map(([key, plant], index) => {
              const isUnlocked = playerProgress.level >= plant.unlockLevel;
              const isSelected = key === selectedPlant;
              
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
                  className={`relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm p-4 border-2 transition-all ${
                    isSelected
                      ? 'border-[#8B86A3] shadow-lg'
                      : 'border-[#E8E4F3]'
                  } ${
                    isUnlocked
                      ? 'cursor-pointer hover:border-[#8B86A3]/50 hover:shadow-md'
                      : 'cursor-not-allowed opacity-50'
                  }`}
                  whileHover={isUnlocked ? { 
                    scale: 1.03,
                    y: -4
                  } : {}}
                  whileTap={isUnlocked ? { scale: 0.98 } : {}}
                >
                  {/* Selected indicator */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div 
                        className="absolute top-2 right-2 w-6 h-6 bg-[#8B86A3] rounded-full flex items-center justify-center"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ 
                          scale: 1, 
                          rotate: 0
                        }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Sparkles className="w-4 h-4 text-white" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Plant image */}
                  <div className="aspect-square bg-gradient-to-br from-[#EBE8F4] to-[#E0DCF0] rounded-2xl mb-3 flex items-center justify-center overflow-hidden">
                    <motion.img
                      src={plant.image}
                      alt={plant.name}
                      className="pixelated w-16 h-auto"
                      style={{
                        imageRendering: 'pixelated',
                        filter: isUnlocked ? 'none' : 'grayscale(100%) brightness(0.5)',
                      }}
                      animate={isUnlocked ? {
                        y: [0, -2, 0],
                      } : {}}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.2
                      }}
                    />
                  </div>
                  
                  {/* Plant info */}
                  <div className="text-center">
                    <h5 className="text-sm font-medium text-[#2D2B3E] mb-1 font-light">{plant.name}</h5>
                    <p className="text-xs text-[#8B86A3] font-light">
                      {isUnlocked ? `Level ${plant.unlockLevel}` : `Unlock at level ${plant.unlockLevel}`}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Garden Reflection Input */}
        

        {/* Restart Journey Button */}
        <div className="flex justify-center mb-8">
          <button className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Restart journey
          </button>
        </div>
      </motion.div>

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