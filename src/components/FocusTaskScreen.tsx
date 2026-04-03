import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X, Music, ChevronDown, Pause, Play, RotateCcw, Coffee } from 'lucide-react';
import { getUnlockedPlants, getPlantById, getUserUnlockedPlants } from '../lib/plantRegistry';
import type { Todo } from '../App';
import CanopyScreenBackground from './CanopyScreenBackground';

interface Plant {
  id: string;
  name: string;
  image: string;
  unlocked: boolean;
  level?: number;
}

interface PlantPosition {
  plant: Plant;
  position: { x: number; y: number };
  isDragging?: boolean;
}

interface DecorativePlantProps {
  plantData: PlantPosition;
  onMouseNear: (isNear: boolean, distance: number) => void;
  onPositionChange: (newPosition: { x: number; y: number }) => void;
  isIntro: boolean;
}

const DecorativePlant = React.forwardRef<HTMLDivElement, DecorativePlantProps>(
  ({ plantData, onMouseNear, onPositionChange, isIntro }, ref) => {
  const [isHolding, setIsHolding] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [holdTimer, setHoldTimer] = useState<NodeJS.Timeout | null>(null);
  const [currentPosition, setCurrentPosition] = useState(plantData.position);
  const plantRef = useRef<HTMLDivElement>(null);

  // Update local position when plantData.position changes
  useEffect(() => {
    setCurrentPosition(plantData.position);
  }, [plantData.position]);

  const startHold = (clientX: number, clientY: number) => {
    setIsHolding(true);
    
    const timer = setTimeout(() => {
      setIsDragging(true);
      setIsHolding(false);
      const startX = clientX - currentPosition.x;
      const startY = clientY - currentPosition.y;

      const handleMouseMove = (e: MouseEvent) => {
        const newX = e.clientX - startX;
        const newY = e.clientY - startY;
        setCurrentPosition({ x: newX, y: newY });
        onPositionChange({ x: newX, y: newY });
      };

      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        const newX = touch.clientX - startX;
        const newY = touch.clientY - startY;
        setCurrentPosition({ x: newX, y: newY });
        onPositionChange({ x: newX, y: newY });
      };

      const handleEnd = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    }, 180); // 180ms hold delay

    setHoldTimer(timer);
  };

  const cancelHold = () => {
    if (holdTimer) {
      clearTimeout(holdTimer);
      setHoldTimer(null);
    }
    setIsHolding(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startHold(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    startHold(touch.clientX, touch.clientY);
  };

  const handleMouseUp = () => {
    if (!isDragging) {
      cancelHold();
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) {
      cancelHold();
    }
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (holdTimer) {
        clearTimeout(holdTimer);
      }
    };
  }, [holdTimer]);

  return (
    <div
      ref={ref || plantRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="absolute cursor-move"
      style={{
        left: `${currentPosition.x}px`,
        top: `${currentPosition.y}px`,
        width: '80px',
        height: '80px',
        zIndex: 9999,
        transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isDragging ? 'scale(1.15) rotate(3deg)' : isHolding ? 'scale(1.05) rotate(1deg)' : 'scale(1) rotate(0deg)',
        filter: isDragging ? 'drop-shadow(0 25px 50px rgba(0,0,0,0.4))' : isHolding ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' : 'none',
        animation: isHolding && !isDragging ? 'gentle-sway 2s ease-in-out infinite' : 'none',
      }}
    >
      <img 
        src={plantData.plant.image} 
        alt={plantData.plant.name}
        className="w-full h-full object-contain pixelated select-none"
        style={{ imageRendering: 'pixelated' }}
      />
      <style>{`
        @keyframes gentle-sway {
          0%, 100% { transform: scale(1.05) translateY(0px) rotate(1deg); }
          25% { transform: scale(1.05) translateY(-4px) rotate(0deg); }
          75% { transform: scale(1.05) translateY(-4px) rotate(2deg); }
        }
      `}</style>
    </div>
  );
});

interface FocusTaskScreenProps {
  todo: Todo;
  onClose: () => void;
  targetTime?: number; // in minutes
}

export default function FocusTaskScreen({ todo, onClose, targetTime }: FocusTaskScreenProps) {
  // Get targetTime from window storage if not provided in props
  const storedTargetTime = (window as any).focusTaskTargetTime;
  const actualTargetTime = targetTime || storedTargetTime || 25;
  
  console.log('FocusTaskScreen - targetTime from props:', targetTime);
  console.log('FocusTaskScreen - targetTime from window:', storedTargetTime);
  console.log('FocusTaskScreen - actualTargetTime:', actualTargetTime);
  
  // Clear the stored targetTime
  if (storedTargetTime) {
    delete (window as any).focusTaskTargetTime;
  }
  
  const prefersReducedMotion = useReducedMotion();
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(actualTargetTime * 60);
  const [selectedMusic, setSelectedMusic] = useState('ambiance');
  const [showMusicDropdown, setShowMusicDropdown] = useState(false);
  const [showBreakConfirm, setShowBreakConfirm] = useState(false);
  const [showBreakComplete, setShowBreakComplete] = useState(false);
  const [ownedPlants, setOwnedPlants] = useState<string[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<string>('quiet-fern');
  const [breakTime] = useState(5 * 60); // 5 minutes in seconds
  
  // Update timeLeft when targetTime changes, but only if not currently running
  useEffect(() => {
    if (!isRunning && !isBreak) {
      setTimeLeft(actualTargetTime * 60);
    }
  }, [actualTargetTime, isRunning, isBreak]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoStartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Load user's owned plants from localStorage
  useEffect(() => {
    try {
      const savedOwnedPlants = localStorage.getItem('lifelevel-owned-plants');
      if (savedOwnedPlants) {
        const parsed = JSON.parse(savedOwnedPlants);
        setOwnedPlants(parsed);
      }
      
      // Also load the currently selected plant
      const selectedPlant = localStorage.getItem('lifelevel-selected-plant');
      if (selectedPlant) {
        setSelectedPlant(selectedPlant);
      }
    } catch (error) {
      console.warn('Could not load plant data:', error);
    }
  }, []);
  
  // Plant positioning state - using pixel positions instead of percentages
  const [plantPositions, setPlantPositions] = useState<PlantPosition[]>([]);
  const [isIntro, setIsIntro] = useState(true);
  const proximityStates = useRef<Map<string, { isNear: boolean, distance: number }>>(new Map());

  // Generate positions for plants to match reference image layout
  useEffect(() => {
    // Use the currently selected plant if user owns it, otherwise fallback to owned plants
    let plantToShow: Plant | null = null;
    
    // First try to use the selected plant if user owns it
    if (selectedPlant && ownedPlants.includes(selectedPlant)) {
      const plant = getPlantById(selectedPlant);
      if (plant) {
        plantToShow = {
          id: plant.id,
          name: plant.displayName,
          image: plant.image,
          unlocked: true,
          level: plant.unlockLevel || 1,
        };
      }
    }
    
    // If selected plant not available, fallback to first owned plant
    if (!plantToShow && ownedPlants.length > 0) {
      const plant = getPlantById(ownedPlants[0]);
      if (plant) {
        plantToShow = {
          id: plant.id,
          name: plant.displayName,
          image: plant.image,
          unlocked: true,
          level: plant.unlockLevel || 1,
        };
      }
    }
    
    // If no plants available, use a default plant
    if (!plantToShow) {
      // Use a default plant as fallback
      const defaultPlant = getPlantById('quiet-fern');
      if (defaultPlant) {
        plantToShow = {
          id: defaultPlant.id,
          name: defaultPlant.displayName,
          image: defaultPlant.image,
          unlocked: true,
          level: 1,
        };
      }
    }
    
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    // Position plant 124px above and slightly to the right of "Focusing on:" text
    // The "Focusing on:" text is typically in the upper-middle area of the screen
    const defaultX = window.innerWidth / 2 + 60; // Center + 60px to the right
    const defaultY = window.innerHeight / 2 - 292; // Center - 292px (approximately 124px above the text)
    
    console.log('Positioning plant near "Focusing on:" text:', { x: defaultX, y: defaultY, plant: plantToShow?.name });
    
    const positions: PlantPosition[] = [{
      plant: plantToShow,
      position: { 
        x: defaultX,
        y: defaultY
      }
    }];
    setPlantPositions(positions);
    
    // End intro phase after initial animations
    setTimeout(() => setIsIntro(false), 2000);
  }, [ownedPlants, selectedPlant]);

  const handlePlantPositionChange = (plantId: string, newPosition: { x: number, y: number }) => {
    setPlantPositions(prev => prev.map(p => 
      p.plant.id === plantId 
        ? { ...p, position: newPosition }
        : p
    ));
  };

  const handlePlantProximity = (plantId: string, isNear: boolean, distance: number) => {
    const currentState = proximityStates.current.get(plantId);
    if (!currentState || currentState.isNear !== isNear || currentState.distance !== distance) {
      proximityStates.current.set(plantId, { isNear, distance });
      
      // Trigger proximity reaction animation
      if (isNear) {
        // Different intensity based on distance
        const intensity = Math.max(0.1, 1 - (distance / 50));
        console.log(`Plant ${plantId} reacting with intensity ${intensity}`);
      }
    }
  };

  const handlePlantClick = (plant: Plant) => {
    // Trigger subtle animation - could play a sound or show a small animation
    console.log(`Clicked on ${plant.name}`);
  };

  // Play pleasant sound alert
  const playSound = (type: 'work' | 'break') => {
    try {
      const audio = new Audio();
      if (type === 'work') {
        // Work complete - gentle chime
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      } else {
        // Break complete - soft bell
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      }
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Silently fail if audio can't play
      });
    } catch (error) {
      // Silently fail if audio not supported
    }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            // Timer completed
            if (!isBreak) {
              // Work session completed, suggest break
              playSound('work');
              setShowBreakConfirm(true);
            } else {
              // Break completed, show celebration and prepare for next session
              playSound('break');
              setShowBreakComplete(true);
              
              // Auto-start next session after 3 seconds
              autoStartTimeoutRef.current = setTimeout(() => {
                setIsBreak(false);
                setTimeLeft(targetTime * 60);
                setShowBreakComplete(false);
                setIsRunning(true); // Auto-start the next work session
              }, 3000);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (autoStartTimeoutRef.current) {
        clearTimeout(autoStartTimeoutRef.current);
      }
    };
  }, [isRunning, timeLeft, isBreak, targetTime]);

  // Handle music playback with local MP3 files
  useEffect(() => {
    // Local audio file paths - using public folder
    const musicUrls: Record<string, string> = {
      'ambiance': '/assets/audio/Ambiance.mp3',
      'lofi': '/assets/audio/Lofi.mp3',
      'techno': '/assets/audio/Techno.mp3',
      'upbeat': '/assets/audio/Upbeat.mp3'
    };

    // Only play when timer is running and music is selected
    if (isRunning && selectedMusic !== 'none') {
      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;
      }
      
      // Update source if music type changed
      const musicUrl = musicUrls[selectedMusic];
      if (musicUrl && audioRef.current.src !== musicUrl) {
        audioRef.current.src = musicUrl;
        audioRef.current.load(); // Load the new source
        console.log('Loading audio:', musicUrl);
      }
      
      // Play the music with better error handling
      const playAudio = async () => {
        try {
          await audioRef.current?.play();
          console.log('Audio playing successfully');
        } catch (err) {
          console.error('Audio play error:', err);
          if (err instanceof Error) {
            if (err.name === 'NotAllowedError') {
              console.log('Autoplay blocked - user interaction required');
            } else if (err.name === 'NotFoundError') {
              console.log('Audio file not found:', musicUrl);
            }
          }
        }
      };
      
      playAudio();
    } else {
      // Pause when timer is stopped or music is none
      if (audioRef.current) {
        audioRef.current.pause();
        console.log('Audio paused');
      }
    }

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isRunning, selectedMusic]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    const wasRunning = isRunning;
    setIsRunning(!isRunning);
    
    // Start ambiance music when timer starts (if not already playing)
    if (!wasRunning && selectedMusic === 'none') {
      setSelectedMusic('ambiance');
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(targetTime * 60);
  };

  const handleStartBreak = () => {
    setIsBreak(true);
    setTimeLeft(breakTime);
    setShowBreakConfirm(false);
    setIsRunning(true);
    
    // Start ambiance music when break starts (if not already playing)
    if (selectedMusic === 'none') {
      setSelectedMusic('ambiance');
    }
  };

  const handleSkipBreak = () => {
    setIsBreak(false);
    setTimeLeft(targetTime * 60);
    setShowBreakConfirm(false);
  };

  // Get user's owned plants for display (same logic as positioning)
  const ownedPlantsForDisplay = ownedPlants.map(plantId => {
    const plant = getPlantById(plantId);
    if (!plant) return null;
    return {
      id: plant.id,
      name: plant.displayName,
      image: plant.image,
      unlocked: true,
      level: plant.unlockLevel || 1,
    };
  }).filter(Boolean) as Plant[];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex flex-col"
      style={{
        backgroundColor: '#ffffff',
        color: '#1f2937'
      }}
    >
      {/* Animated Gradient Background - Bottom only */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[50vh] pointer-events-none z-0 overflow-hidden"
      >
        {/* Animated gradient base */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(ellipse at 20% 100%, rgba(99, 102, 241, 0.25) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
              'radial-gradient(ellipse at 40% 100%, rgba(99, 102, 241, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 60% 100%, rgba(139, 92, 246, 0.25) 0%, transparent 50%)',
              'radial-gradient(ellipse at 30% 100%, rgba(99, 102, 241, 0.25) 0%, transparent 50%), radial-gradient(ellipse at 70% 100%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
            ]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Floating blob 1 - Indigo */}
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full blur-[100px]"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.5) 0%, rgba(79, 70, 229, 0.3) 50%, transparent 70%)',
            bottom: '-100px',
            left: '-80px',
          }}
          animate={{
            x: [0, 60, 20, 80, 0],
            y: [0, -40, -60, -30, 0],
            scale: [1, 1.2, 0.9, 1.15, 1],
            rotate: [0, 45, -30, 15, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Floating blob 2 - Purple */}
        <motion.div
          className="absolute w-[250px] h-[250px] rounded-full blur-[90px]"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.45) 0%, rgba(124, 58, 237, 0.25) 50%, transparent 70%)',
            bottom: '-80px',
            right: '-60px',
          }}
          animate={{
            x: [0, -50, -30, -70, 0],
            y: [0, 30, -20, 40, 0],
            scale: [1, 0.85, 1.1, 0.95, 1],
            rotate: [0, -35, 20, -45, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Floating blob 3 - Blue-Purple mix */}
        <motion.div
          className="absolute w-[200px] h-[200px] rounded-full blur-[80px]"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(99, 102, 241, 0.2) 50%, transparent 70%)',
            bottom: '0px',
            left: '35%',
          }}
          animate={{
            x: [0, 40, -30, 60, 0],
            y: [0, -50, 20, -40, 0],
            scale: [1, 1.1, 0.8, 1.05, 1],
            rotate: [0, 60, -45, 30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        {/* Floating blob 4 - Soft lilac */}
        <motion.div
          className="absolute w-[180px] h-[180px] rounded-full blur-[70px]"
          style={{
            background: 'radial-gradient(circle, rgba(167, 139, 250, 0.35) 0%, rgba(192, 132, 252, 0.2) 50%, transparent 70%)',
            bottom: '20px',
            right: '25%',
          }}
          animate={{
            x: [0, -30, 40, -50, 0],
            y: [0, 40, -30, 20, 0],
            scale: [1, 0.9, 1.15, 0.85, 1],
            rotate: [0, -25, 35, -15, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />

        {/* Shimmer overlay */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
          }}
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Decorative Plants - Only show after session starts */}
      {isRunning && plantPositions.map((plantData) => {
        return (
          <DecorativePlant
            key={plantData.plant.id}
            plantData={plantData}
            onMouseNear={(isNear, distance) => handlePlantProximity(plantData.plant.id, isNear, distance)}
            onPositionChange={(newPosition) => handlePlantPositionChange(plantData.plant.id, newPosition)}
            isIntro={isIntro}
          />
        );
      })}
      
      {/* Header */}
      <div className="relative z-[100] flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-[var(--space-3)]">
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-full)] text-gray-600 transition-all duration-150 ease-out hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.97]"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
          <div className="flex items-center gap-[var(--space-2)]">
            <div>
              <h1 className="font-serif text-xl text-gray-900 leading-none">
                Focus Task Mode
              </h1>
              <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">
                {isBreak ? 'Break Time' : 'Work Session'}
              </p>
            </div>
          </div>
        </div>

        {/* Music Dropdown */}
        <div className="relative z-[101]">
          <button
            onClick={() => setShowMusicDropdown(!showMusicDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-full)] border border-[var(--border-soft)] bg-[var(--surface-base)] text-sm text-[var(--text-body-muted)] hover:bg-[var(--surface-hover-panel)] hover:text-[var(--text-body)] transition-all duration-150 ease-out w-28 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.97]"
          >
            {/* Music icon with playing indicator */}
            <div className="relative">
              <Music className="h-4 w-4 flex-shrink-0" />
              {isRunning && selectedMusic !== 'none' && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
              )}
            </div>
            
            {/* Display current selection */}
            <span className="capitalize truncate flex-1 min-w-0 text-left">
              {selectedMusic === 'none' ? 'Select Music' : selectedMusic}
            </span>
            
            {/* Dropdown arrow */}
            <ChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${showMusicDropdown ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showMusicDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-40 rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--surface-base)] shadow-[var(--shadow-card-strong)] overflow-hidden z-[9999]"
              >
                {['ambiance', 'lofi', 'techno', 'upbeat', 'none'].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSelectedMusic(option);
                      setShowMusicDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm capitalize transition-all duration-150 ease-out hover:bg-[var(--surface-hover-panel)] ${
                      selectedMusic === option
                        ? 'bg-[var(--surface-hover-panel)] text-[var(--text-strong)] font-medium'
                        : 'text-[var(--text-body-muted)]'
                    }`}
                  >
                    {option === 'none' ? 'Mute' : option}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Task Title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Focusing on:</p>
          <div className="max-w-md">
            <p className="text-xl font-semibold text-gray-900 leading-snug">
              {todo.text}
            </p>
          </div>
        </motion.div>

        {/* Timer Display */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative mb-12"
        >
          <div className={`w-48 h-48 rounded-[var(--radius-full)] border-4 flex items-center justify-center ${
            isBreak 
              ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50' 
              : 'border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50'
          }`}>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 font-mono">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {isBreak ? 'Break' : `${targetTime} min target`}
              </div>
            </div>
          </div>

          {/* Progress Ring */}
          <svg className="absolute inset-0 w-48 h-48 -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-purple-400 opacity-30"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - (isBreak ? (breakTime - timeLeft) / breakTime : ((actualTargetTime || 25) * 60 - timeLeft) / ((actualTargetTime || 25) * 60)))}`}
              className="text-purple-300"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
        </motion.div>

        {/* Control Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 mb-12 pb-[env(safe-area-inset-bottom)]"
        >
          <button
            onClick={handleStartPause}
            className={`h-12 w-12 rounded-[var(--radius-full)] flex items-center justify-center transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.97] ${
              isRunning
                ? 'bg-gray-800 text-white hover:bg-gray-900 border border-gray-800'
                : 'bg-gray-800 text-white hover:bg-gray-900 border border-gray-800'
            }`}
          >
            {isRunning ? <Pause className="h-5 w-5" strokeWidth={2} /> : <Play className="h-5 w-5" strokeWidth={2} />}
          </button>
          
          <button
            onClick={handleReset}
            className="h-12 w-12 rounded-[var(--radius-full)] flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.97]"
          >
            <RotateCcw className="h-5 w-5" strokeWidth={2} />
          </button>

          {!isBreak && (
            <button
              onClick={() => setShowBreakConfirm(true)}
              className="h-12 w-12 rounded-[var(--radius-full)] flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.97]"
            >
              <Coffee className="h-5 w-5" strokeWidth={2} />
            </button>
          )}
        </motion.div>
      </div>

      {/* Break Confirmation Modal */}
      <AnimatePresence>
        {showBreakConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[1000]"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--surface-base)] rounded-[var(--radius-xl)] p-[var(--space-6)] max-w-sm w-full shadow-[var(--shadow-card-strong)]"
            >
              <h3 className="font-serif text-xl text-[var(--text-strong-alt)] leading-none mb-2">
                Work Session Complete
              </h3>
              <p className="text-[var(--text-body-muted)] mb-6">
                Great job! Would you like to take a 5-minute break or continue working?
              </p>
              <div className="flex gap-[var(--space-3)]">
                <button
                  onClick={handleSkipBreak}
                  className="flex-1 h-10 px-[var(--space-4)] rounded-[var(--radius-full)] border border-[var(--border-soft)] bg-[var(--surface-base)] text-[var(--text-strong-alt)] transition-all duration-150 ease-out hover:bg-[var(--surface-hover-panel)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)] active:scale-[0.97]"
                >
                  Continue
                </button>
                <button
                  onClick={handleStartBreak}
                  className="flex-1 h-10 px-[var(--space-4)] rounded-[var(--radius-full)] bg-gray-800 text-white font-medium transition-all duration-150 ease-out hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.97]"
                >
                  Take Break
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Break Complete Celebration */}
      <AnimatePresence>
        {showBreakComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[1000]"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-[var(--radius-xl)] p-[var(--space-6)] max-w-sm w-full shadow-[var(--shadow-card-strong)] text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center"
              >
                <span className="text-2xl">✨</span>
              </motion.div>
              
              <motion.h3
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-serif text-xl text-gray-900 leading-none mb-2"
              >
                Break Complete!
              </motion.h3>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-600 mb-4"
              >
                Ready for your next work session?
              </motion.p>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-gray-500"
              >
                Starting automatically in 3 seconds...
              </motion.p>
              
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => {
                  if (autoStartTimeoutRef.current) {
                    clearTimeout(autoStartTimeoutRef.current);
                  }
                  setIsBreak(false);
                  setTimeLeft(targetTime * 60);
                  setShowBreakComplete(false);
                  setIsRunning(true);
                }}
                className="mt-4 px-[var(--space-4)] py-[var(--space-2)] rounded-[var(--radius-full)] bg-gray-800 text-white text-sm font-medium hover:bg-gray-900 transition-colors duration-150"
              >
                Start Now
              </motion.button>
              
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={() => {
                  if (autoStartTimeoutRef.current) {
                    clearTimeout(autoStartTimeoutRef.current);
                  }
                  setShowBreakComplete(false);
                  // Don't auto-start, let user decide what to do next
                }}
                className="mt-2 px-[var(--space-4)] py-[var(--space-2)] rounded-[var(--radius-full)] border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors duration-150"
              >
                Cancel
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
