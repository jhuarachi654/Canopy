import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, AlertTriangle } from 'lucide-react';
import TaskContainer from './TaskPill';
import ParticleEffect from './ParticleEffect';
import ArcadeExplosionEffect from './ArcadeExplosionEffect';

import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { toast } from 'sonner@2.0.3';
import type { Todo, GameSettings } from '../App';


interface GameScreenProps {
  completedTodos: Todo[];
  onRemovePill: (id: string) => void;
  onRemoveMultiplePills: (ids: string[]) => void;
  gameSettings: GameSettings;
  playerProgress: {
    level: number;
    currentXP: number;
    totalXP: number;
    unlockedRewards: string[];
  };
  levelConfig: Array<{
    level: number;
    xpRequired: number;
    title: string;
    reward: string;
    emoji: string;
  }>;
  getXPForNextLevel: (currentLevel: number) => number;
  addXP: (amount: number) => void;
  backgroundThemes: BackgroundTheme[];
  backgroundTheme: string;
  onBackgroundThemeChange: (theme: string) => void;
  onRestartJourney: () => void;
}

interface BackgroundTheme {
  id: string;
  name: string;
  icon: any;
  image: string;
  description: string;
}

interface PillState extends Todo {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isSelected: boolean;
  isDragging: boolean;
  transformationPhase: 'task' | 'transitioning' | 'pill';
}

interface Celebration {
  id: string;
  x: number;
  y: number;
  type: 'explosion' | 'sparkles' | 'plant' | 'confetti' | 'rainbow' | 'stars';
}



interface ArcadeExplosion {
  id: string;
  pillId: string; // Track which pill this explosion belongs to
  x: number;
  y: number;
  width: number;
  height: number;
  duration?: number; // Optional duration for slow motion effects
}



export default function GameScreen({ 
  completedTodos, 
  onRemovePill, 
  onRemoveMultiplePills,
  gameSettings, 
  playerProgress, 
  levelConfig, 
  getXPForNextLevel, 
  addXP,
  backgroundThemes,
  backgroundTheme,
  onBackgroundThemeChange,
  onRestartJourney
}: GameScreenProps) {
  const [pills, setPills] = useState<PillState[]>([]);
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [arcadeExplosions, setArcadeExplosions] = useState<ArcadeExplosion[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [examplePills, setExamplePills] = useState<PillState[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const helpButtonRef = useRef<HTMLButtonElement>(null);
  const restartButtonRef = useRef<HTMLButtonElement>(null);

  // Toast queue system for smooth consecutive notifications
  const toastQueueRef = useRef<string[]>([]);
  const isProcessingToastRef = useRef(false);
  const lastToastTimeRef = useRef(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Initialize example pills for onboarding
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight - 100;
    
    // Create 3 example pills for onboarding demonstration
    const examples = [
      { text: "Buy fresh groceries", id: "example-1" },
      { text: "Call the dentist", id: "example-2" }, 
      { text: "Pay monthly bills", id: "example-3" }
    ];
    
    const examplePillStates: PillState[] = examples.map((example, index) => {
      const getDynamicDimensions = (text: string) => {
        const words = text.trim().split(/\s+/);
        const wordCount = words.length;
        
        if (wordCount >= 3 && wordCount <= 5) {
          const avgCharWidth = 8;
          const padding = 16;
          const minWidth = 80;
          const maxWidth = 140;
          
          const estimatedWidth = Math.max(minWidth, Math.min(maxWidth, text.length * avgCharWidth + padding));
          
          let height;
          if (wordCount <= 3) {
            height = 48;
          } else if (wordCount === 4) {
            height = 56;
          } else {
            height = 64;
          }
          
          return { width: estimatedWidth, height };
        }
        
        return { width: 120, height: 48 };
      };
      
      const { width, height } = getDynamicDimensions(example.text);
      
      // Position examples in a scattered pattern
      const positions = [
        { x: containerWidth * 0.15, y: containerHeight * 0.3 },
        { x: containerWidth * 0.6, y: containerHeight * 0.15 },
        { x: containerWidth * 0.3, y: containerHeight * 0.6 }
      ];
      
      const pos = positions[index] || { x: containerWidth * 0.5, y: containerHeight * 0.5 };
      
      return {
        id: example.id,
        text: example.text,
        completed: true,
        createdAt: new Date(),
        completedAt: new Date(),
        x: Math.max(0, Math.min(containerWidth - width, pos.x)),
        y: Math.max(0, Math.min(containerHeight - height, pos.y)),
        vx: (Math.random() - 0.5) * 1, // Very slow drift
        vy: (Math.random() - 0.5) * 1,
        width,
        height,
        isSelected: false,
        isDragging: false,
        transformationPhase: 'pill' as const,
      };
    });
    
    setExamplePills(examplePillStates);
  }, [containerRef.current]);

  // Hide onboarding when user has completed tasks
  useEffect(() => {
    if (completedTodos.length > 0) {
      setShowOnboarding(false);
    }
  }, [completedTodos.length]);

  // Handle new completed tasks - directly create floating containers
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight - 100;
    
    // Find new completed tasks that aren't in pills yet
    const existingPillIds = new Set(pills.map(p => p.id));
    const newTodos = completedTodos.filter(todo => !existingPillIds.has(todo.id));
    
    if (newTodos.length > 0) {
      // Create pills directly without transformation animation
      const newPills: PillState[] = newTodos.map((todo, index) => {
        // Calculate dynamic dimensions based on content
        const getDynamicDimensions = (text: string) => {
          const words = text.trim().split(/\s+/);
          const wordCount = words.length;
          
          // Only apply dynamic sizing for 3-5 word tasks
          if (wordCount >= 3 && wordCount <= 5) {
            const avgCharWidth = 8;
            const padding = 16;
            const minWidth = 80;
            const maxWidth = 140;
            
            const estimatedWidth = Math.max(minWidth, Math.min(maxWidth, text.length * avgCharWidth + padding));
            
            let height;
            if (wordCount <= 3) {
              height = 48;
            } else if (wordCount === 4) {
              height = 56;
            } else {
              height = 64;
            }
            
            return { width: estimatedWidth, height };
          }
          
          return { width: 120, height: 48 };
        };
        
        const { width, height } = getDynamicDimensions(todo.text);
        
        // Better initial positioning to avoid overlaps
        let x, y;
        let attempts = 0;
        const maxAttempts = 20;
        
        do {
          x = Math.random() * (containerWidth - width);
          y = Math.random() * (containerHeight - height);
          attempts++;
        } while (attempts < maxAttempts && pills.some(existingPill => {
          const dx = (x + width/2) - (existingPill.x + existingPill.width/2);
          const dy = (y + height/2) - (existingPill.y + existingPill.height/2);
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = Math.max(width, height, existingPill.width, existingPill.height) / 2 + 30;
          return distance < minDistance;
        }));
        
        return {
          ...todo,
          x,
          y,
          vx: (Math.random() - 0.5) * 3, // Slightly more initial velocity for dynamic entrance
          vy: (Math.random() - 0.5) * 3,
          width,
          height,
          isSelected: false,
          isDragging: false,
          transformationPhase: 'pill',
        };
      });
      
      setPills(prevPills => [...prevPills, ...newPills]);
    }
  }, [completedTodos, containerRef.current]);

  // Physics animation loop
  useEffect(() => {
    if (!containerRef.current) return;
    
    const animate = () => {
      if (pills.length === 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      const container = containerRef.current;
      if (!container) return;
      
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight - 100;
      
      setPills(prevPills => {
        return prevPills.map((pill, index) => {
          // Skip physics entirely for dragging pills - let user have full control
          if (pill.isDragging) {
            return pill;
          }
          
          // Also skip physics for selected pills to prevent conflicts during interaction
          if (pill.isSelected) {
            return pill;
          }
          
          let newX = pill.x + pill.vx;
          let newY = pill.y + pill.vy;
          let newVx = pill.vx;
          let newVy = pill.vy;
          
          // Wall bouncing
          if (newX <= 0 || newX + pill.width >= containerWidth) {
            newVx = -newVx * 0.95;
            newX = Math.max(0, Math.min(containerWidth - pill.width, newX));
          }
          
          if (newY <= 0 || newY + pill.height >= containerHeight) {
            newVy = -newVy * 0.95;
            newY = Math.max(0, Math.min(containerHeight - pill.height, newY));
          }
          
          // Enhanced collision detection - including with dragged pills
          prevPills.forEach((otherPill, otherIndex) => {
            if (index !== otherIndex && !otherPill.isSelected) {
              const dx = (newX + pill.width/2) - (otherPill.x + otherPill.width/2);
              const dy = (newY + pill.height/2) - (otherPill.y + otherPill.height/2);
              const distance = Math.sqrt(dx * dx + dy * dy);
              const minDistance = Math.max(pill.width, pill.height, otherPill.width, otherPill.height) / 2 + 15;
              
              if (distance < minDistance && distance > 0) {
                const pushForce = (minDistance - distance) * 0.6;
                const angle = Math.atan2(dy, dx);
                
                // Push this pill away from the other pill
                newX += Math.cos(angle) * pushForce;
                newY += Math.sin(angle) * pushForce;
                
                // Enhanced collision response based on other pill's state
                let bounceForce = 0.8;
                if (otherPill.isDragging) {
                  // Stronger response when colliding with dragged pills
                  bounceForce = 1.5;
                }
                
                newVx += Math.cos(angle) * bounceForce;
                newVy += Math.sin(angle) * bounceForce;
              }
            }
          });
          
          // Maintain consistent speed
          const targetSpeed = 1.5;
          const currentSpeed = Math.sqrt(newVx * newVx + newVy * newVy);
          if (currentSpeed > 0.1) {
            const speedRatio = targetSpeed / currentSpeed;
            newVx *= speedRatio;
            newVy *= speedRatio;
          }
          
          return {
            ...pill,
            x: Math.max(0, Math.min(containerWidth - pill.width, newX)),
            y: Math.max(0, Math.min(containerHeight - pill.height, newY)),
            vx: newVx,
            vy: newVy,
          };
        });
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [pills, completedTodos.length]);

  // Smart toast queue system for smooth consecutive notifications
  const queueToast = (message: string) => {
    toastQueueRef.current.push(message);
    processToastQueue();
  };

  const processToastQueue = () => {
    if (isProcessingToastRef.current || toastQueueRef.current.length === 0) {
      return;
    }

    isProcessingToastRef.current = true;
    const currentTime = Date.now();
    const timeSinceLastToast = currentTime - lastToastTimeRef.current;
    
    // Stagger toasts intelligently based on timing
    let delay = 0;
    if (timeSinceLastToast < 2000) { // If last toast was less than 2 seconds ago
      delay = Math.max(0, 800 - timeSinceLastToast); // Stagger by 800ms minimum
    }
    
    setTimeout(() => {
      const message = toastQueueRef.current.shift();
      if (message) {
        toast.success(message, {
          duration: 2800, // Slightly shorter duration for better flow
        });
        lastToastTimeRef.current = Date.now();
      }
      
      isProcessingToastRef.current = false;
      
      // Process next toast in queue if any
      if (toastQueueRef.current.length > 0) {
        setTimeout(() => processToastQueue(), 200); // Small gap between consecutive toasts
      }
    }, delay);
  };

  const handleTaskSelect = (id: string) => {
    setPills(prevPills =>
      prevPills.map(pill => ({
        ...pill,
        isSelected: pill.id === id,
        isDragging: false,
      }))
    );
  };

  const handleTaskDrag = (id: string, newX: number, newY: number) => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight - 100;
    
    // Use callback to ensure immediate update without state batching delays
    setPills(prevPills => {
      const draggedPillIndex = prevPills.findIndex(p => p.id === id);
      if (draggedPillIndex === -1) return prevPills;
      
      const draggedPill = prevPills[draggedPillIndex];
      const clampedX = Math.max(0, Math.min(containerWidth - draggedPill.width, newX));
      const clampedY = Math.max(0, Math.min(containerHeight - draggedPill.height, newY));
      
      // Create updated pills array with real-time collision detection
      return prevPills.map((pill, index) => {
        if (pill.id === id) {
          // Update the dragged pill position
          return {
            ...pill,
            x: clampedX,
            y: clampedY,
            isDragging: true,
            vx: 0, // Stop any existing momentum during drag
            vy: 0,
          };
        } else if (!pill.isSelected && !pill.isDragging) {
          // Check collision with the dragged pill for all other pills
          const dx = (clampedX + draggedPill.width/2) - (pill.x + pill.width/2);
          const dy = (clampedY + draggedPill.height/2) - (pill.y + pill.height/2);
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = Math.max(draggedPill.width, draggedPill.height, pill.width, pill.height) / 2 + 15;
          
          if (distance < minDistance && distance > 0) {
            // Calculate push force and direction
            const pushForce = (minDistance - distance) * 0.8; // Stronger push during drag
            const angle = Math.atan2(-dy, -dx); // Push away from dragged pill
            
            // Calculate new position for pushed pill
            const pushX = Math.cos(angle) * pushForce;
            const pushY = Math.sin(angle) * pushForce;
            
            const newPillX = Math.max(0, Math.min(containerWidth - pill.width, pill.x + pushX));
            const newPillY = Math.max(0, Math.min(containerHeight - pill.height, pill.y + pushY));
            
            // Add velocity for continued movement after push
            const bounceForce = 2.0;
            const newVx = Math.cos(angle) * bounceForce;
            const newVy = Math.sin(angle) * bounceForce;
            
            return {
              ...pill,
              x: newPillX,
              y: newPillY,
              vx: newVx,
              vy: newVy,
            };
          }
        }
        
        return pill;
      });
    });
  };

  const handleTaskRelease = (id: string, releaseVelocity?: { vx: number, vy: number }) => {
    setPills(prevPills =>
      prevPills.map(pill =>
        pill.id === id
          ? {
              ...pill,
              isSelected: false,
              isDragging: false,
              // Enhanced velocity calculation for smoother release physics
              vx: releaseVelocity?.vx ? Math.max(-15, Math.min(15, releaseVelocity.vx)) : (Math.random() - 0.5) * 2,
              vy: releaseVelocity?.vy ? Math.max(-15, Math.min(15, releaseVelocity.vy)) : (Math.random() - 0.5) * 2,
            }
          : pill
      )
    );
  };



  const handleTaskDestroy = (id: string) => {
    const task = pills.find(p => p.id === id);
    if (!task) return;
    
    // Award XP for destroying a task (100 XP per task)
    addXP(100);
    
    // Remove from main todos array immediately to prevent reappearing
    onRemovePill(id);
    
    // Create arcade explosion
    const arcadeExplosion: ArcadeExplosion = {
      id: Date.now().toString(),
      pillId: id,
      x: task.x,
      y: task.y,
      width: task.width,
      height: task.height,
    };
    
    setArcadeExplosions(prev => [...prev, arcadeExplosion]);
    
    // Remove task immediately to prevent interaction during explosion
    setPills(prev => prev.filter(p => p.id !== id));
    
    const messages = [
      'Gone. You handled it.',
      'Off the list. Feels good.',
      'Progress looks good on you.',
      'Look at you, getting things done.',
      "One down. You're on a roll.",
      'Every task counts. This one too.',
      "You're building a life, one task at a time.",
      'Look at you, figuring it out.',
      'Handled. Moving forward.',
      "Every task finished is proof you're making it.",
    ];
    
    // Queue toast with smart staggering for consecutive task destruction
    queueToast(messages[Math.floor(Math.random() * messages.length)]);
  };

  const handleArcadeExplosionComplete = (explosionId: string) => {
    // Just remove the explosion animation - todo was already removed in handleTaskDestroy
    setArcadeExplosions(prev => prev.filter(e => e.id !== explosionId));
  };

  const handleClearAll = () => {
    // Get all current pill IDs
    const allPillIds = pills.map(pill => pill.id);
    
    if (allPillIds.length === 0) return;

    // Award XP for each pill being cleared (same as individual destruction - 100 XP each)
    const xpGained = allPillIds.length * 100;
    addXP(xpGained);

    // Create arcade explosions for all pills simultaneously with slow motion effect
    const simultaneousExplosions: ArcadeExplosion[] = allPillIds.map(id => {
      const task = pills.find(p => p.id === id);
      if (!task) return null;
      
      return {
        id: `clear-all-${id}-${Date.now()}`,
        pillId: id,
        x: task.x,
        y: task.y,
        width: task.width,
        height: task.height,
        duration: 4000, // 4 seconds for dramatic slow motion effect (2x slower than normal)
      };
    }).filter(Boolean) as ArcadeExplosion[];

    // Add all explosion animations at once
    setArcadeExplosions(prev => [...prev, ...simultaneousExplosions]);

    // Remove all pills from the main todos state in a single operation
    onRemoveMultiplePills(allPillIds);

    // Clear all local pill states after a brief delay to allow animation to start
    setTimeout(() => {
      setPills([]);
    }, 100);

    // Show feedback toast
    toast.success(`Cleared ${allPillIds.length} task${allPillIds.length > 1 ? 's' : ''}! +${xpGained} XP!`, {
      duration: 3000
    });
  };





  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      
      {/* Simplified Header - Mobile Optimized */}
      <div className="relative z-10 px-4 py-3">
        <div className="notebook-content-strong p-3 rounded-lg">
          {/* Top Row - Adult Title Left, Theme Icons & Help Right */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <span className="font-pixel text-xs text-gray-700">
                {levelConfig.find(config => config.level === playerProgress.level)?.title || "Adult in Training"}
              </span>
            </div>
            <div className="flex flex-row gap-1 items-center">
              {/* Help Button */}
              <div className="relative">
                <Button
                  ref={helpButtonRef}
                  size="sm"
                  variant="ghost"
                  className="w-8 h-8 p-0 rounded-full"
                  onClick={() => setShowHelp(!showHelp)}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </Button>
                
                {/* Help Popup */}
                {showHelp && (
                  <>
                    {/* Backdrop for mobile */}
                    <div 
                      className="fixed inset-0 z-[99] sm:hidden" 
                      onClick={() => setShowHelp(false)}
                    />
                    
                    {/* Popup */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute z-[100] w-56 top-8 -right-1 sm:top-6 sm:-right-1"
                    >
                      <div className="bg-white rounded-lg shadow-xl border-2 border-gray-200 overflow-hidden">
                        <div className="p-3">
                          <div className="mb-2">
                            <h4 className="font-pixel text-xs text-black">🎮 How to Play</h4>
                          </div>
                          
                          <div className="space-y-1.5 text-xs text-black leading-relaxed">
                            <p>• Complete tasks to see containers</p>
                            <p>• Drag around with physics</p>
                            <p>• Tap 8 times to destroy & earn XP</p>
                            <p>• Level up for new titles!</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Arrow pointing up to help button */}
                      <div className="absolute w-3 h-3 bg-white border-l-2 border-t-2 border-gray-200 transform rotate-45 -top-1.5 right-6"></div>
                    </motion.div>
                  </>
                )}
              </div>
              
              {/* Theme Selection Icons */}
              {backgroundThemes.map((theme) => {
                const Icon = theme.icon;
                return (
                  <Button
                    key={theme.id}
                    onClick={() => onBackgroundThemeChange(theme.id)}
                    size="sm"
                    variant={backgroundTheme === theme.id ? "default" : "ghost"}
                    className="w-8 h-8 p-0 rounded-full"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Level & XP Info */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {levelConfig.find(config => config.level === playerProgress.level)?.emoji || "🌱"}
              </span>
              <span className="font-pixel text-xs text-black">
                LVL {playerProgress.level}
              </span>
            </div>
            <span className="font-pixel text-xs text-black">
              {playerProgress.currentXP}/{getXPForNextLevel(playerProgress.level)} XP
            </span>
          </div>
          
          {/* Simplified Progress Bar */}
          <Progress 
            value={Math.min(100, Math.max(0, (playerProgress.currentXP / Math.max(1, getXPForNextLevel(playerProgress.level))) * 100))}
            className="w-full h-3 bg-white border border-black/20"
          />
        </div>
      </div>

      {/* Game Area */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        {showOnboarding ? (
          <>
            {/* Example task containers in background */}
            {examplePills.map((examplePill, index) => (
              <motion.div
                key={examplePill.id}
                className="absolute opacity-70"
                style={{
                  left: examplePill.x,
                  top: examplePill.y,
                  width: examplePill.width,
                  height: examplePill.height,
                }}
                animate={{
                  x: [0, 15 + index * 5, 0],
                  y: [0, -8 - index * 3, 0],
                }}
                transition={{
                  duration: 4 + index * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.8,
                }}
              >
                <div 
                  className="relative pixelated cursor-grab inline-block"
                  style={{ 
                    imageRendering: 'pixelated',
                    width: examplePill.width,
                    height: examplePill.height
                  }}
                >
                  {/* Rounded container */}
                  <div 
                    className="absolute inset-0"
                  >
                    {/* Main rounded body */}
                    <div 
                      className="absolute bg-white border-2 border-black"
                      style={{
                        left: '0px',
                        right: '0px',
                        top: '0px',
                        bottom: '0px',
                        borderRadius: '16px',
                      }}
                    />
                  </div>
                  
                  {/* Text content */}
                  <div className="absolute flex items-center justify-center" style={{
                    left: '6px',
                    right: '6px',
                    top: '4px',
                    bottom: '4px'
                  }}>
                    <span 
                      className="text-black pixelated select-none text-center font-pixel"
                      style={{ 
                        imageRendering: 'pixelated',
                        textShadow: 'none',
                        fontSize: '9px',
                        lineHeight: '11px',
                        wordWrap: 'break-word',
                        hyphens: 'auto',
                        maxWidth: '100%',
                        display: '-webkit-box',
                        WebkitLineClamp: examplePill.height <= 48 ? 2 : 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {examplePill.text}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Onboarding content overlay - positioned closer to status bar */}
            <div className="absolute inset-0 flex flex-col items-center text-gray-500 z-50 pointer-events-none" style={{ paddingTop: 'calc(3rem + 32px)' }}>
              <div className="pointer-events-auto">
              <motion.div 
                className="bg-gray-800 rounded-3xl p-8 flex flex-col items-center max-w-sm mx-4 border-2 border-gray-700"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <h2 className="text-xl font-medium text-white font-pixel mb-3 text-center">Ready for some adulting?</h2>
                <p className="text-base text-center text-gray-300 font-pixel leading-relaxed mb-6">
                  Complete tasks to see them become floating and pixelated!
                </p>
                
                {/* Start Button */}
                <motion.button
                  onClick={() => setShowOnboarding(false)}
                  className="bg-white text-black font-pixel text-xs px-6 py-3 rounded-lg border-2 border-gray-200 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Playing
                </motion.button>
              </motion.div>
              </div>
            </div>
          </>
        ) : (pills.length === 0 && arcadeExplosions.length === 0) ? (
          <div className="absolute inset-0 flex flex-col items-center text-gray-500 z-50 pointer-events-none" style={{ paddingTop: 'calc(3rem + 32px)' }}>
            <div className="pointer-events-auto">
            <motion.div 
              className="bg-gray-800 rounded-3xl p-8 flex flex-col items-center max-w-sm mx-4 border-2 border-gray-700"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* Show different messages based on whether user has ever completed tasks */}
              {playerProgress.totalXP > 0 ? (
                <>
                  <h2 className="text-xl font-medium text-white font-pixel mb-3 text-center">All clear!</h2>
                  <p className="text-base text-center text-gray-300 font-pixel leading-relaxed">
                    Complete more tasks to play!
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-medium text-white font-pixel mb-3 text-center">Everyone starts somewhere. You just did.</h2>
                  <p className="text-base text-center text-gray-300 font-pixel leading-relaxed">
                    Your first task is the hardest one. It gets easier.
                  </p>
                </>
              )}
            </motion.div>
            </div>
          </div>
        ) : (
          <>

            {/* Floating containers */}
            {pills.map(pill => (
              <TaskContainer
                key={`task-${pill.id}`}
                pill={pill}
                onSelect={handleTaskSelect}
                onDrag={handleTaskDrag}
                onRelease={handleTaskRelease}
                onDestroy={handleTaskDestroy}
              />
            ))}
            
            {/* Arcade explosion effects */}
            {arcadeExplosions.map(explosion => (
              <ArcadeExplosionEffect
                key={`explosion-${explosion.id}`}
                x={explosion.x}
                y={explosion.y}
                width={explosion.width}
                height={explosion.height}
                duration={explosion.duration}
                onComplete={() => handleArcadeExplosionComplete(explosion.id)}
              />
            ))}
            
            {/* Legacy celebration effects (if needed) */}
            {celebrations.map(celebration => (
              <ParticleEffect
                key={`celebration-${celebration.id}`}
                x={celebration.x}
                y={celebration.y}
                type={celebration.type}
              />
            ))}
          </>
        )}
      </div>

      {/* Fixed Clear All Button - Bottom Center */}
      {pills.length > 8 && (
        <div className="fixed left-1/2 transform -translate-x-1/2 z-50" style={{ bottom: 'calc(env(safe-area-inset-bottom) + 5rem)' }}>
          <Button
            size="sm"
            variant="default"
            className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-pixel text-xs border-2 border-slate-800 shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
            onClick={handleClearAll}
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Fixed Restart Button - Bottom Left Corner */}
      <div className="fixed left-4 z-50" style={{ bottom: 'calc(env(safe-area-inset-bottom) + 5rem)' }}>
        <div className="relative">
          <Button
            ref={restartButtonRef}
            size="sm"
            variant="ghost"
            className="w-12 h-12 p-0 rounded-full bg-white border-2 border-gray-200 shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-200"
            onClick={() => setShowRestartConfirm(!showRestartConfirm)}
          >
            <AlertTriangle className="w-5 h-5 text-black" />
          </Button>
          
          {/* Restart Confirmation Popup */}
          {showRestartConfirm && (
            <>
              {/* Backdrop for mobile */}
              <div 
                className="fixed inset-0 z-40 sm:hidden" 
                onClick={() => setShowRestartConfirm(false)}
              />
              
              {/* Popup */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute z-50 w-64 bottom-16 left-0 max-w-[calc(100vw-32px)]"
              >
                <div className="bg-white rounded-lg shadow-xl border-2 border-gray-200 overflow-hidden">
                  <div className="p-4">
                    <div className="mb-3">
                      <h4 className="font-pixel text-xs text-black whitespace-nowrap">⚠️ Restart Journey</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-xs text-black leading-relaxed">
                        Reset to Level 1 and clear all XP. Task history stays.
                      </p>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            onRestartJourney();
                            setShowRestartConfirm(false);
                          }}
                          size="sm"
                          variant="destructive"
                          className="flex-1 font-pixel text-xs px-3 py-2"
                        >
                          Restart
                        </Button>
                        <Button
                          onClick={() => setShowRestartConfirm(false)}
                          size="sm"
                          variant="ghost"
                          className="flex-1 font-pixel text-xs px-3 py-2"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Arrow pointing down to restart button */}
                <div className="absolute w-3 h-3 bg-white border-r-2 border-b-2 border-gray-200 transform rotate-45 -bottom-1.5 left-6"></div>
              </motion.div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}