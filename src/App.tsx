import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Building2, Home, Cloud, PawPrint } from 'lucide-react';
import TodoListScreen from './components/TodoListScreenNew';
import GameScreen from './components/GameScreenNew';
import TaskHistoryScreen from './components/TaskHistoryScreenNew';
import JournalScreen from './components/JournalScreenNew';
import SettingsScreen from './components/SettingsScreen';
import NavigationBar from './components/NavigationBar';
import LoginFlow from './components/LoginFlow';
import LoadingScreen from './components/LoadingScreen';
import OnboardingFlow from './components/OnboardingFlow';
import { getSupabaseClient } from './utils/supabase/client';
import { taskApi, progressApi, settingsApi } from './utils/api';

import { Toaster } from './components/ui/sonner';
import cityBackground from 'figma:asset/b06399fe4c9c24f9ce21884751670df3937a40b9.png';
import homeBackground from 'figma:asset/49a1be4de73e79605e84e98473fb6cf4adf4df2e.png';
import skyBackground from 'figma:asset/730a2b5730fb297ff69baf12c868d97ded365bc0.png';
import puppyBackground from 'figma:asset/e554bfa8d6607d253dbd4597c0f90c1a34986892.png';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  destroyedAt?: Date;
  isFirstTime?: boolean;
}

export interface WeeklyReflection {
  id: string;
  weekStartDate: string; // ISO date string for Monday of the week
  prompt: string;
  response: string;
  submittedAt: Date;
}

export interface JournalEntry {
  id: string;
  prompt: string | null; // null for free-write entries
  response: string;
  createdAt: Date;
  isWeeklyPrompt: boolean;
  weekStartDate?: string; // Only for weekly prompt entries
  mood?: 'heavy' | 'okay' | 'good'; // Optional mood tag
  photoUrl?: string; // Optional photo attachment
}

export interface DailyStats {
  date: string;
  added: number;
  completed: number;
}

export type AnimationType = 'explosion' | 'sparkles' | 'plant' | 'confetti' | 'rainbow' | 'stars';

export interface GameSettings {
  animationType: AnimationType;
}

export interface PlayerProgress {
  level: number;
  currentXP: number;
  totalXP: number;
  unlockedRewards: string[];
}

export interface BackgroundTheme {
  id: string;
  name: string;
  icon: any;
  image: string;
  description: string;
}

const backgroundThemes: BackgroundTheme[] = [
  {
    id: 'cityscape',
    name: 'City Life',
    icon: Building2,
    image: cityBackground,
    description: 'Navigate adult responsibilities'
  },
  {
    id: 'home',
    name: 'Home Sweet Home',
    icon: Home,
    image: homeBackground,
    description: 'Cozy household management'
  },
  {
    id: 'sky',
    name: 'Sky Dreams',
    icon: Cloud,
    image: skyBackground,
    description: 'Peaceful productivity realm'
  },
  {
    id: 'puppy',
    name: 'Puppy Friends',
    icon: PawPrint,
    image: puppyBackground,
    description: 'Adorable companions cheer you on'
  }
];

export default function App() {
  const prefersReducedMotion = useReducedMotion();
  const [activeScreen, setActiveScreen] = useState<'todos' | 'game' | 'log' | 'journal' | 'settings'>('todos');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [reflections, setReflections] = useState<WeeklyReflection[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [backgroundTheme, setBackgroundTheme] = useState(() => {
    // Initialize from localStorage or default to 'sky'
    try {
      const saved = localStorage.getItem('lifelevel-background-theme');
      return saved || 'sky';
    } catch (error) {
      console.warn('Could not load background theme from localStorage:', error);
      return 'sky';
    }
  });
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress>({
    level: 1,
    currentXP: 0,
    totalXP: 0,
    unlockedRewards: []
  });
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Check if user has completed onboarding
    try {
      const completed = localStorage.getItem('lifelevel-onboarding-completed');
      return !completed; // Show onboarding if not completed
    } catch (error) {
      return true; // Default to showing onboarding on error
    }
  });
  const [focusModeOn, setFocusModeOn] = useState<boolean>(true);
  const [bonusVersion, setBonusVersion] = useState(0);

  const [gameSettings, setGameSettings] = useState<GameSettings>({
    animationType: 'sparkles',
  });

  const supabase = getSupabaseClient();
  const hasInitializedProgressPersistence = useRef(false);

  useEffect(() => {
    const syncFocusMode = () => {
      try {
        const stored = localStorage.getItem('lifelevel-focus-mode');
        setFocusModeOn(stored ? JSON.parse(stored) : true);
      } catch {
        setFocusModeOn(true);
      }
    };
    syncFocusMode();
    window.addEventListener('storage', syncFocusMode);
    window.addEventListener('focus', syncFocusMode);
    window.addEventListener('canopy-focus-mode-updated', syncFocusMode);
    return () => {
      window.removeEventListener('storage', syncFocusMode);
      window.removeEventListener('focus', syncFocusMode);
      window.removeEventListener('canopy-focus-mode-updated', syncFocusMode);
    };
  }, []);

  useEffect(() => {
    const handleBonusUpdated = () => setBonusVersion((v) => v + 1);
    window.addEventListener('canopy-bonus-updated', handleBonusUpdated);
    return () => window.removeEventListener('canopy-bonus-updated', handleBonusUpdated);
  }, []);

  useEffect(() => {
    if (!user) return;
    if (!hasInitializedProgressPersistence.current) {
      hasInitializedProgressPersistence.current = true;
      return;
    }
    saveProgress(playerProgress);
  }, [playerProgress.totalXP, playerProgress.currentXP, playerProgress.level, user]);

  // Extended level system configuration with hilarious adulting titles
  const levelConfig = [
    { level: 1, xpRequired: 0, title: "Getting Started", reward: "Welcome! Every small step counts 💪", emoji: "🌱" },
    { level: 2, xpRequired: 500, title: "Task Tackler", reward: "You're getting the hang of this! Keep crushing those goals 🎯", emoji: "⚡" },
    { level: 3, xpRequired: 1000, title: "Routine Runner", reward: "Look at you building healthy habits! Consistency is key 🔥", emoji: "🏃" },
    { level: 4, xpRequired: 1500, title: "Habit Hero", reward: "You're officially a habit-forming machine! Nothing can stop you 🚀", emoji: "🦸" },
    { level: 5, xpRequired: 2000, title: "Responsibility Rookie", reward: "Taking charge like a true adult! Your future self thanks you 🙏", emoji: "👔" },
    { level: 6, xpRequired: 2500, title: "Chore Champion", reward: "Household tasks bow down to your excellence! You're unstoppable 💫", emoji: "🏆" },
    { level: 7, xpRequired: 3000, title: "Life Manager", reward: "You're not just adulting, you're MASTERING it! Goals achieved ✨", emoji: "📊" },
    { level: 8, xpRequired: 3500, title: "Adulting Ace", reward: "Peak adulting performance! You make the impossible look easy 🎪", emoji: "🎭" },
    { level: 9, xpRequired: 4000, title: "Maturity Master", reward: "Wisdom level: Maximum! You're inspiring others to adult better 🌟", emoji: "🧙" },
    { level: 10, xpRequired: 5000, title: "Ultimate Adult", reward: "LEGENDARY STATUS ACHIEVED! You've transcended mere adulting 👑", emoji: "👑" },
    
    // Extended levels with hilarious titles
    { level: 11, xpRequired: 6000, title: "Procrastination Slayer", reward: "You've defeated your greatest enemy! Netflix trembles before you 📺", emoji: "⚔️" },
    { level: 12, xpRequired: 7000, title: "Calendar Wizard", reward: "Time bends to your will! You actually know what day it is 📅", emoji: "🧙‍♂️" },
    { level: 13, xpRequired: 8000, title: "Laundry Legend", reward: "Clean clothes AND they're put away? You're basically a superhero 🧺", emoji: "🦸‍♀️" },
    { level: 14, xpRequired: 9000, title: "Grocery Guru", reward: "You have a meal plan AND stuck to it! Your fridge is proud 🥬", emoji: "🛒" },
    { level: 15, xpRequired: 10500, title: "Bill-Paying Badass", reward: "Your credit score just winked at you! Financial responsibility unlocked 💳", emoji: "💰" },
    
    { level: 16, xpRequired: 12000, title: "Email Emperor", reward: "Inbox Zero achieved! You've conquered digital chaos 📧", emoji: "👑" },
    { level: 17, xpRequired: 13500, title: "Appointment Assassin", reward: "You actually showed up on time! Doctors everywhere are shook 🏥", emoji: "🎯" },
    { level: 18, xpRequired: 15000, title: "Plant Parent Pro", reward: "Something green is still alive in your home! Nature approves 🌿", emoji: "🌱" },
    { level: 19, xpRequired: 16500, title: "Social Battery Manager", reward: "You know when to say no AND when to say yes! Boundaries mastered 🔋", emoji: "⚡" },
    { level: 20, xpRequired: 18500, title: "Midnight Snack Moderator", reward: "You actually went to bed instead of raiding the fridge! Self-control activated 🌙", emoji: "🧘" },
    
    { level: 21, xpRequired: 20500, title: "Insurance Investigator", reward: "You understand your coverage! Adult mysteries are no match for you 🕵️", emoji: "🔍" },
    { level: 22, xpRequired: 22500, title: "Tax Terror Tamer", reward: "April doesn't scare you anymore! The IRS tips their hat 📋", emoji: "🦾" },
    { level: 23, xpRequired: 25000, title: "Relationship Referee", reward: "You've mastered the art of healthy boundaries! Communication leveled up 💬", emoji: "🏅" },
    { level: 24, xpRequired: 27500, title: "Kitchen Conquistador", reward: "You cooked a real meal from actual ingredients! Gordon Ramsay weeps with pride 👨‍🍳", emoji: "🍳" },
    { level: 25, xpRequired: 30000, title: "Exercise Executioner", reward: "You worked out without posting about it! True strength achieved 💪", emoji: "🏋️" },
    
    { level: 26, xpRequired: 33000, title: "Sleep Schedule Sage", reward: "8 hours of sleep AND you feel rested? You've cracked the code 😴", emoji: "🌙" },
    { level: 27, xpRequired: 36000, title: "Savings Sorcerer", reward: "Emergency fund exists! Future you sends grateful vibes ✨", emoji: "🪄" },
    { level: 28, xpRequired: 39000, title: "Social Media Monk", reward: "You touched grass instead of scrolling! Digital detox master 🧘‍♂️", emoji: "🌿" },
    { level: 29, xpRequired: 42000, title: "Closet Whisperer", reward: "Marie Kondo wants to know your location! Organization goals achieved 👗", emoji: "✨" },
    { level: 30, xpRequired: 45000, title: "Time Lord", reward: "You're always punctual AND prepared! The universe adjusts to your schedule ⏰", emoji: "⏳" },
    
    { level: 31, xpRequired: 49000, title: "Existential Crisis Counselor", reward: "You've helped others through their quarter-life crises! Wisdom dispenser activated 🧠", emoji: "🎓" },
    { level: 32, xpRequired: 53000, title: "Furniture Assembly Phenom", reward: "IKEA instructions make sense to you! Swedish engineering bows down 🔨", emoji: "🛠️" },
    { level: 33, xpRequired: 57000, title: "Weather Prediction Prophet", reward: "You check the forecast AND dress accordingly! Meteorologists are jealous 🌦️", emoji: "🔮" },
    { level: 34, xpRequired: 61000, title: "Password Paladin", reward: "All your accounts are secure AND you remember them! Cybersecurity salutes you 🛡️", emoji: "🔐" },
    { level: 35, xpRequired: 65000, title: "Subscription Slasher", reward: "You canceled services you don't use! Your bank account does a happy dance 💸", emoji: "⚔️" },
    
    { level: 36, xpRequired: 70000, title: "Friendship Facilitator", reward: "You actually maintain friendships as an adult! Social skills: legendary 👥", emoji: "💫" },
    { level: 37, xpRequired: 75000, title: "Home Maintenance Mastermind", reward: "Things break, you fix them! DIY videos everywhere nod in approval 🔧", emoji: "🏠" },
    { level: 38, xpRequired: 80000, title: "Career Compass Captain", reward: "You have direction AND ambition! LinkedIn influencers want your secrets 🧭", emoji: "🚀" },
    { level: 39, xpRequired: 85000, title: "Mental Health Monarch", reward: "Therapy works AND you do the homework! Self-care sovereignty achieved 👑", emoji: "💚" },
    { level: 40, xpRequired: 90000, title: "Life Balance Deity", reward: "Work, play, rest - you've mastered the holy trinity! Ancient wisdom unlocked 🕉️", emoji: "⚖️" },
    
    { level: 41, xpRequired: 96000, title: "Impulse Purchase Paragon", reward: "You thought before buying! Jeff Bezos sheds a single tear 🛒", emoji: "🧘‍♀️" },
    { level: 42, xpRequired: 102000, title: "Answer to Everything", reward: "Douglas Adams would be proud! You've found life's meaning in task completion 🌌", emoji: "🤖" },
    { level: 43, xpRequired: 108000, title: "Nostalgia Navigator", reward: "You appreciate the past without living in it! Time travel mastered ⏰", emoji: "🚀" },
    { level: 44, xpRequired: 114000, title: "Chaos Coordinator Supreme", reward: "Murphy's Law fears you! Everything that can go right, does 🌪️", emoji: "🎭" },
    { level: 45, xpRequired: 120000, title: "Wisdom Dispensing Wizard", reward: "Young adults seek your counsel! Sage mode: permanently activated 🧙‍♂️", emoji: "📚" },
    
    { level: 46, xpRequired: 127000, title: "Reality Check Champion", reward: "You see things clearly AND stay optimistic! Balanced perspective achieved 👁️", emoji: "🏆" },
    { level: 47, xpRequired: 134000, title: "Gratitude Grandmaster", reward: "You appreciate what you have! The universe conspires to help you 🙏", emoji: "✨" },
    { level: 48, xpRequired: 141000, title: "Legacy Builder Boss", reward: "Future generations will study your adulting methods! History remembers 📜", emoji: "🏛️" },
    { level: 49, xpRequired: 148000, title: "Transcendence Technician", reward: "You've surpassed normal human adulting capabilities! Enlightenment loading... 🧘", emoji: "🌟" },
    { level: 50, xpRequired: 155000, title: "The Adult Final Boss", reward: "MAXIMUM ADULTING ACHIEVED! You are the standard by which all adults are measured! 👑", emoji: "🐉" }
  ];

  const calculateLevel = (totalXP: number) => {
    let currentLevel = 1;
    let currentXP = totalXP;
    
    for (let i = levelConfig.length - 1; i >= 0; i--) {
      if (totalXP >= levelConfig[i].xpRequired) {
        currentLevel = levelConfig[i].level;
        currentXP = totalXP - levelConfig[i].xpRequired;
        break;
      }
    }
    
    return { level: currentLevel, currentXP };
  };

  const getXPForNextLevel = (currentLevel: number) => {
    const nextLevelConfig = levelConfig.find(config => config.level === currentLevel + 1);
    const currentLevelConfig = levelConfig.find(config => config.level === currentLevel);
    
    if (!nextLevelConfig) {
      // If at max level, return 1000 as a placeholder for the progress bar
      return 1000;
    }
    if (!currentLevelConfig) return 500; // Default fallback
    
    return nextLevelConfig.xpRequired - currentLevelConfig.xpRequired;
  };

  // Save tasks to database (skip if guest mode)
  const saveTasks = async (updatedTodos: Todo[]) => {
    if (isGuestMode) {
      // In guest mode, save to localStorage instead
      try {
        localStorage.setItem('lifelevel-guest-todos', JSON.stringify(updatedTodos));
      } catch (error) {
        console.warn('Could not save tasks to localStorage:', error);
      }
      return;
    }
    
    if (!accessToken || !user) {
      console.warn('Cannot save tasks: missing access token or user');
      return;
    }
    
    try {
      await taskApi.saveTasks(updatedTodos, accessToken);
      console.log('Tasks saved successfully');
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  // Save progress to database (skip if guest mode)
  const saveProgress = async (progress: PlayerProgress) => {
    if (isGuestMode) {
      // In guest mode, save to localStorage instead
      try {
        localStorage.setItem('lifelevel-guest-progress', JSON.stringify(progress));
      } catch (error) {
        console.warn('Could not save progress to localStorage:', error);
      }
      return;
    }
    
    if (!accessToken || !user) {
      console.warn('Cannot save progress: missing access token or user');
      return;
    }
    
    try {
      await progressApi.saveProgress(progress, accessToken);
      console.log('Progress saved successfully');
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Save settings to database (skip if guest mode)
  const saveSettings = async (settings: any) => {
    if (isGuestMode) {
      // In guest mode, save to localStorage instead
      try {
        localStorage.setItem('lifelevel-guest-settings', JSON.stringify(settings));
      } catch (error) {
        console.warn('Could not save settings to localStorage:', error);
      }
      return;
    }
    
    if (!accessToken || !user) {
      console.warn('Cannot save settings: missing access token or user');
      return;
    }
    
    try {
      await settingsApi.saveSettings(settings, accessToken);
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Save reflections to localStorage (for both guest and logged-in users)
  const saveReflections = (updatedReflections: WeeklyReflection[]) => {
    try {
      const storageKey = isGuestMode ? 'lifelevel-guest-reflections' : `lifelevel-reflections-${user?.id}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedReflections));
    } catch (error) {
      console.warn('Could not save reflections to localStorage:', error);
    }
  };

  // Load reflections from localStorage
  const loadReflections = () => {
    try {
      const storageKey = isGuestMode ? 'lifelevel-guest-reflections' : `lifelevel-reflections-${user?.id}`;
      const savedReflections = localStorage.getItem(storageKey);
      if (savedReflections) {
        const parsedReflections = JSON.parse(savedReflections).map((reflection: any) => ({
          ...reflection,
          submittedAt: new Date(reflection.submittedAt),
        }));
        setReflections(parsedReflections);
      }
    } catch (error) {
      console.error('Error loading reflections:', error);
    }
  };

  // Save journal entries to localStorage (for both guest and logged-in users)
  const saveJournalEntries = (updatedEntries: JournalEntry[]) => {
    try {
      const storageKey = isGuestMode ? 'lifelevel-guest-journal' : `lifelevel-journal-${user?.id}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedEntries));
    } catch (error) {
      console.warn('Could not save journal entries to localStorage:', error);
    }
  };

  // Load journal entries from localStorage
  const loadJournalEntries = () => {
    try {
      const storageKey = isGuestMode ? 'lifelevel-guest-journal' : `lifelevel-journal-${user?.id}`;
      const savedEntries = localStorage.getItem(storageKey);
      if (savedEntries) {
        const parsedEntries = JSON.parse(savedEntries).map((entry: any) => ({
          ...entry,
          createdAt: new Date(entry.createdAt),
        }));
        setJournalEntries(parsedEntries);
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
    }
  };

  // Add a journal entry
  const addJournalEntry = (
    prompt: string | null, 
    response: string, 
    isWeeklyPrompt: boolean,
    mood?: 'heavy' | 'okay' | 'good',
    photoUrl?: string
  ) => {
    const getMondayOfWeek = (date: Date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      return monday;
    };

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      prompt,
      response,
      createdAt: new Date(),
      isWeeklyPrompt,
      weekStartDate: isWeeklyPrompt ? getMondayOfWeek(new Date()).toISOString().split('T')[0] : undefined,
      mood,
      photoUrl,
    };

    const updatedEntries = [...journalEntries, newEntry];
    setJournalEntries(updatedEntries);
    saveJournalEntries(updatedEntries);
  };

  // Update a journal entry
  const updateJournalEntry = (
    entryId: string,
    response: string,
    photoUrl?: string
  ) => {
    const updatedEntries = journalEntries.map(entry => 
      entry.id === entryId 
        ? { ...entry, response, photoUrl: photoUrl || entry.photoUrl }
        : entry
    );
    setJournalEntries(updatedEntries);
    saveJournalEntries(updatedEntries);
  };

  // Load guest data from localStorage
  const loadGuestData = () => {
    try {
      // Load guest todos
      const savedTodos = localStorage.getItem('lifelevel-guest-todos');
      if (savedTodos) {
        const parsedTodos = JSON.parse(savedTodos).map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined,
          destroyedAt: todo.destroyedAt ? new Date(todo.destroyedAt) : undefined,
        }));
        
        // If saved todos exist but array is empty, create example tasks
        if (parsedTodos.length === 0) {
          const now = new Date();
          const initialTodos: Todo[] = [
            // Active tasks for the todo list
            {
              id: 'example-1',
              text: 'Buy fresh groceries',
              completed: false,
              createdAt: new Date(now.getTime() - 60000), // 1 minute ago
            },
            {
              id: 'example-2', 
              text: 'Call the dentist',
              completed: false,
              createdAt: new Date(now.getTime() - 30000), // 30 seconds ago
            },
            {
              id: 'example-3',
              text: 'Pay monthly bills',
              completed: false,
              createdAt: now,
            },
            // Completed tasks for the game screen - so guests can experience the core mechanic
            {
              id: 'example-completed-1',
              text: 'Do laundry',
              completed: true,
              createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
              completedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
            },
            {
              id: 'example-completed-2',
              text: 'Clean kitchen',
              completed: true,
              createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
              completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            },
            {
              id: 'example-completed-3',
              text: 'Reply to emails',
              completed: true,
              createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
              completedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            }
          ];
          setTodos(initialTodos);
          setDailyStats(generateDailyStats(initialTodos));
          // Save the initial example tasks to localStorage
          localStorage.setItem('lifelevel-guest-todos', JSON.stringify(initialTodos));
        } else {
          setTodos(parsedTodos);
          setDailyStats(generateDailyStats(parsedTodos));
        }
      } else {
        // Set example tasks for new guest users
        const now = new Date();
        const initialTodos: Todo[] = [
          // Active tasks for the todo list
          {
            id: 'example-1',
            text: 'Buy fresh groceries',
            completed: false,
            createdAt: new Date(now.getTime() - 60000), // 1 minute ago
          },
          {
            id: 'example-2', 
            text: 'Call the dentist',
            completed: false,
            createdAt: new Date(now.getTime() - 30000), // 30 seconds ago
          },
          {
            id: 'example-3',
            text: 'Pay monthly bills',
            completed: false,
            createdAt: now,
          },
          // Completed tasks for the game screen - so guests can experience the core mechanic
          {
            id: 'example-completed-1',
            text: 'Do laundry',
            completed: true,
            createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            completedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
          },
          {
            id: 'example-completed-2',
            text: 'Clean kitchen',
            completed: true,
            createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          },
          {
            id: 'example-completed-3',
            text: 'Reply to emails',
            completed: true,
            createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
            completedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          }
        ];
        setTodos(initialTodos);
        setDailyStats(generateDailyStats(initialTodos));
      }

      // Load guest progress
      const savedProgress = localStorage.getItem('lifelevel-guest-progress');
      if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress);
        // Recalculate level in case level system was extended
        const { level: recalculatedLevel, currentXP: recalculatedCurrentXP } = calculateLevel(parsedProgress.totalXP);
        const updatedProgress = {
          ...parsedProgress,
          level: recalculatedLevel,
          currentXP: recalculatedCurrentXP
        };
        setPlayerProgress(updatedProgress);
      }

      // Load guest settings
      const savedSettings = localStorage.getItem('lifelevel-guest-settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        if (parsedSettings.backgroundTheme && parsedSettings.backgroundTheme !== backgroundTheme) {
          setBackgroundTheme(parsedSettings.backgroundTheme);
        }
        if (parsedSettings.gameSettings) {
          setGameSettings(parsedSettings.gameSettings);
        }
      }

      // Load guest reflections
      loadReflections();

      // Load guest journal entries
      loadJournalEntries();
    } catch (error) {
      console.error('Error loading guest data:', error);
      // Fallback to default data if loading fails
      const now = new Date();
      const initialTodos: Todo[] = [
        // Active tasks
        {
          id: 'example-1',
          text: 'Buy fresh groceries',
          completed: false,
          createdAt: new Date(now.getTime() - 60000),
        },
        {
          id: 'example-2', 
          text: 'Call the dentist',
          completed: false,
          createdAt: new Date(now.getTime() - 30000),
        },
        {
          id: 'example-3',
          text: 'Pay monthly bills',
          completed: false,
          createdAt: now,
        },
        // Completed tasks for game screen
        {
          id: 'example-completed-1',
          text: 'Do laundry',
          completed: true,
          createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          completedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        },
        {
          id: 'example-completed-2',
          text: 'Clean kitchen',
          completed: true,
          createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'example-completed-3',
          text: 'Reply to emails',
          completed: true,
          createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
          completedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        }
      ];
      setTodos(initialTodos);
      setDailyStats(generateDailyStats(initialTodos));
    }
  };

  // Load user data from database
  const loadUserData = async (userAccessToken: string) => {
    if (!userAccessToken) {
      console.error('No access token provided to loadUserData');
      return;
    }
    
    try {
      console.log('Loading user data from database with token starting with:', userAccessToken.substring(0, 20) + '...');
      
      // First test server connectivity
      try {
        const { healthCheck } = await import('./utils/api');
        const healthResult = await healthCheck();
        if (healthResult.success) {
          console.log('Server health check passed');
        } else {
          console.warn('Server health check failed:', healthResult.error);
        }
      } catch (healthError) {
        console.warn('Could not perform health check:', healthError);
      }
      
      // Load tasks
      const userTasks = await taskApi.getTasks(userAccessToken);
      console.log('Loaded tasks:', userTasks);
      
      // Convert date strings back to Date objects
      const tasksWithDates = userTasks.map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined,
        destroyedAt: todo.destroyedAt ? new Date(todo.destroyedAt) : undefined,
      }));
      
      setTodos(tasksWithDates);
      setDailyStats(generateDailyStats(tasksWithDates));
      
      // Load progress
      const userProgress = await progressApi.getProgress(userAccessToken);
      console.log('Loaded progress:', userProgress);
      
      // Recalculate level based on current level config (in case level system was extended)
      const { level: recalculatedLevel, currentXP: recalculatedCurrentXP } = calculateLevel(userProgress.totalXP);
      const updatedProgress = {
        ...userProgress,
        level: recalculatedLevel,
        currentXP: recalculatedCurrentXP
      };
      
      console.log('Recalculated progress with new level system:', updatedProgress);
      setPlayerProgress(updatedProgress);
      
      // Save the recalculated progress back to database if level changed
      if (recalculatedLevel !== userProgress.level) {
        console.log(`Level updated from ${userProgress.level} to ${recalculatedLevel} due to extended level system`);
        await progressApi.saveProgress(updatedProgress, userAccessToken);
      }
      
      // Load settings
      const userSettings = await settingsApi.getSettings(userAccessToken);
      console.log('Loaded settings:', userSettings);
      
      // Only update background theme from server if different from localStorage
      if (userSettings.backgroundTheme && userSettings.backgroundTheme !== backgroundTheme) {
        setBackgroundTheme(userSettings.backgroundTheme);
      }
      setGameSettings(userSettings.gameSettings);
      
      // Load reflections
      loadReflections();

      // Load journal entries
      loadJournalEntries();
    } catch (error) {
      console.error('Error loading user data:', error);
      // If there's an error loading data, set some default tasks for new users
      const now = new Date();
      const initialTodos: Todo[] = [
        // Active tasks
        {
          id: 'example-1',
          text: 'Buy fresh groceries',
          completed: false,
          createdAt: new Date(now.getTime() - 60000), // 1 minute ago
        },
        {
          id: 'example-2', 
          text: 'Call the dentist',
          completed: false,
          createdAt: new Date(now.getTime() - 30000), // 30 seconds ago
        },
        {
          id: 'example-3',
          text: 'Pay monthly bills',
          completed: false,
          createdAt: now,
        },
        // Completed tasks for game screen
        {
          id: 'example-completed-1',
          text: 'Do laundry',
          completed: true,
          createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          completedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        },
        {
          id: 'example-completed-2',
          text: 'Clean kitchen',
          completed: true,
          createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'example-completed-3',
          text: 'Reply to emails',
          completed: true,
          createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
          completedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        }
      ];
      
      setTodos(initialTodos);
      setDailyStats(generateDailyStats(initialTodos));
    }
  };

  // Check for existing session and load initial data
  useEffect(() => {
    const checkSession = async () => {
      try {
        // First try to get the current session without refreshing
        const { data: { session: currentSession }, error: currentSessionError } = await supabase.auth.getSession();
        
        if (currentSessionError) {
          console.log('Current session fetch error:', currentSessionError.message);
          setIsLoading(false);
          loadReflections(); // Load reflections even if no session
          return;
        }
        
        if (currentSession?.user && currentSession.access_token) {
          // We have a current session, try to refresh it to ensure it's valid
          try {
            const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError) {
              console.log('Session refresh failed:', refreshError.message);
              
              // If refresh fails with invalid refresh token, clear the session
              if (refreshError.message.includes('Invalid Refresh Token') || 
                  refreshError.message.includes('Refresh Token Not Found')) {
                console.log('Invalid refresh token detected, signing out...');
                await supabase.auth.signOut();
                setIsLoading(false);
                loadReflections(); // Load reflections even on sign out
                return;
              }
              
              // For other refresh errors, try to use the current session
              console.log('Using current session despite refresh error');
              setUser(currentSession.user);
              setAccessToken(currentSession.access_token);
              await loadUserData(currentSession.access_token);
              loadReflections();
            } else if (refreshedSession?.user && refreshedSession.access_token) {
              console.log('Successfully refreshed session for user:', refreshedSession.user.email);
              setUser(refreshedSession.user);
              setAccessToken(refreshedSession.access_token);
              await loadUserData(refreshedSession.access_token);
              loadReflections();
            }
          } catch (refreshError) {
            console.log('Refresh attempt failed, using current session:', refreshError);
            setUser(currentSession.user);
            setAccessToken(currentSession.access_token);
            await loadUserData(currentSession.access_token);
            loadReflections();
          }
        } else {
          console.log('No current session found');
          loadReflections(); // Load reflections for guest mode
        }
      } catch (error) {
        console.error('Session check error:', error);
        // Clear any potentially corrupted auth state
        await supabase.auth.signOut();
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email || 'no user');
      
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user && session.access_token) {
        console.log('User signed in/token refreshed, token starts with:', session.access_token.substring(0, 20) + '...');
        setUser(session.user);
        setAccessToken(session.access_token);
        
        // Only load data on initial sign in, not on token refresh
        if (event === 'SIGNED_IN') {
          await loadUserData(session.access_token);
        }
      } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
        console.log('User signed out or session invalidated');
        // Don't clear state if in guest mode
        if (!isGuestMode) {
          setUser(null);
          setAccessToken(null);
          setTodos([]);
          setDailyStats([]);
          setPlayerProgress({
            level: 1,
            currentXP: 0,
            totalXP: 0,
            unlockedRewards: []
          });
          // Don't reset background theme on logout - let it persist
          setGameSettings({ animationType: 'sparkles' });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Save background theme to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('lifelevel-background-theme', backgroundTheme);
    } catch (error) {
      console.warn('Could not save background theme to localStorage:', error);
    }
  }, [backgroundTheme]);

  // Save settings to server/localStorage when they change (with debouncing)
  useEffect(() => {
    if (user && (accessToken || isGuestMode)) {
      const timeoutId = setTimeout(() => {
        const settings = {
          backgroundTheme,
          gameSettings
        };
        saveSettings(settings);
      }, 500); // Debounce for 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [backgroundTheme, gameSettings, user, accessToken, isGuestMode]);

  const generateDailyStats = (todoList: Todo[]): DailyStats[] => {
    const statsMap = new Map<string, { added: number; completed: number }>();
    
    todoList.forEach(todo => {
      // Count task creation
      const addedDate = todo.createdAt.toISOString().split('T')[0];
      if (!statsMap.has(addedDate)) {
        statsMap.set(addedDate, { added: 0, completed: 0 });
      }
      statsMap.get(addedDate)!.added++;
      
      // Count task completion separately (can be different date)
      if (todo.completed && todo.completedAt) {
        const completedDate = todo.completedAt.toISOString().split('T')[0];
        if (!statsMap.has(completedDate)) {
          statsMap.set(completedDate, { added: 0, completed: 0 });
        }
        statsMap.get(completedDate)!.completed++;
      }
    });
    
    return Array.from(statsMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const addXP = (amount: number) => {
    setPlayerProgress((prev) => {
      const safeTotalXP = Number.isFinite(prev.totalXP) ? prev.totalXP : 0;
      const newTotalXP = Math.max(0, safeTotalXP + amount);
      const { level: newLevel, currentXP } = calculateLevel(newTotalXP);

      if (newLevel > prev.level) {
        const levelConfigItem = levelConfig.find(config => config.level === newLevel);
        if (levelConfigItem) {
          import('sonner@2.0.3').then(({ toast }) => {
            setTimeout(() => {
              toast.success(
                `${levelConfigItem.emoji} LEVEL UP! You're now a ${levelConfigItem.title}! ${levelConfigItem.emoji}\n\n${levelConfigItem.reward}`,
                { duration: 4000 }
              );
            }, 800);
          });
        }
      }

      const updatedProgress = {
        level: newLevel,
        currentXP,
        totalXP: newTotalXP,
        unlockedRewards: prev.unlockedRewards || [],
      };
      return updatedProgress;
    });
  };

  const addTodo = (text: string, isFirstTime: boolean = false) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date(),
      isFirstTime,
    };
    
    const updatedTodos = [newTodo, ...todos];
    setTodos(updatedTodos);
    setDailyStats(generateDailyStats(updatedTodos));
    
    // Save to database
    saveTasks(updatedTodos);
  };

  const toggleTodo = (id: string) => {
    const targetTodo = todos.find(todo => todo.id === id);
    if (!targetTodo) return;
    const isCompleting = !targetTodo.completed;

    const updatedTodos = todos.map(todo =>
      todo.id === id
        ? {
            ...todo,
            completed: !todo.completed,
            completedAt: !todo.completed ? new Date() : undefined,
          }
        : todo
    );
    
    setTodos(updatedTodos);
    setDailyStats(generateDailyStats(updatedTodos));
    
    // Save to database
    saveTasks(updatedTodos);

    // Award XP on completion; remove XP if task is unchecked
    addXP(isCompleting ? 10 : -10);
  };

  // Keep XP consistent with completed task count as a fallback guard.
  useEffect(() => {
    const completedCount = todos.filter(todo => todo.completed && !todo.destroyedAt).length;
    const taskXP = completedCount * 10;

    const today = new Date().toISOString().split('T')[0];
    const completedToday = todos.filter(todo => {
      if (!todo.completedAt || todo.destroyedAt) return false;
      return new Date(todo.completedAt).toISOString().split('T')[0] === today;
    }).length;

    const journalToday = journalEntries.some(entry =>
      new Date(entry.createdAt).toISOString().split('T')[0] === today
    );

    let focusBonus = 0;
    let resetBonus = 0;
    try {
      const focusEnabled = JSON.parse(localStorage.getItem('lifelevel-focus-mode') || 'true');
      focusBonus = focusEnabled && completedToday > 0 ? 10 : 0;
      resetBonus = localStorage.getItem(`lifelevel-reset-${today}`) === 'true' ? 5 : 0;
    } catch {
      focusBonus = completedToday > 0 ? 10 : 0;
      resetBonus = 0;
    }

    const journalBonus = journalToday ? 10 : 0;
    const expectedTotalXP = taskXP + journalBonus + focusBonus + resetBonus;
    if (playerProgress.totalXP === expectedTotalXP) return;

    const { level, currentXP } = calculateLevel(expectedTotalXP);
    setPlayerProgress(prev => ({
      ...prev,
      level,
      currentXP,
      totalXP: expectedTotalXP,
    }));
  }, [todos, journalEntries, bonusVersion]);

  const editTodo = (id: string, newText: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id
        ? { ...todo, text: newText.trim() }
        : todo
    );
    
    setTodos(updatedTodos);
    setDailyStats(generateDailyStats(updatedTodos));
    
    // Save to database
    saveTasks(updatedTodos);
  };

  const reorderTodos = (dragIndex: number, hoverIndex: number) => {
    const activeTodos = todos.filter(todo => !todo.completed && !todo.destroyedAt);
    const otherTodos = todos.filter(todo => todo.completed || todo.destroyedAt);
    
    const draggedTodo = activeTodos[dragIndex];
    const reorderedActiveTodos = [...activeTodos];
    
    // Remove dragged item and insert at new position
    reorderedActiveTodos.splice(dragIndex, 1);
    reorderedActiveTodos.splice(hoverIndex, 0, draggedTodo);
    
    // Combine reordered active todos with other todos
    const updatedTodos = [...reorderedActiveTodos, ...otherTodos];
    
    setTodos(updatedTodos);
    setDailyStats(generateDailyStats(updatedTodos));
    
    // Save to database
    saveTasks(updatedTodos);
  };

  const deleteTodo = (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    setDailyStats(generateDailyStats(updatedTodos));
    
    // Save to database
    saveTasks(updatedTodos);
  };

  const removePillFromGame = (id: string) => {
    // Mark the todo as destroyed but keep it in history
    const updatedTodos = todos.map(todo =>
      todo.id === id
        ? { ...todo, destroyedAt: new Date() }
        : todo
    );
    
    setTodos(updatedTodos);
    setDailyStats(generateDailyStats(updatedTodos));
    
    // Save to database
    saveTasks(updatedTodos);
  };

  const removeMultiplePillsFromGame = (ids: string[]) => {
    // Mark multiple todos as destroyed but keep them in history
    const idsSet = new Set(ids);
    const updatedTodos = todos.map(todo =>
      idsSet.has(todo.id)
        ? { ...todo, destroyedAt: new Date() }
        : todo
    );
    
    setTodos(updatedTodos);
    setDailyStats(generateDailyStats(updatedTodos));
    
    // Save to database
    saveTasks(updatedTodos);
  };

  const restartAdultingJourney = async () => {
    // Reset progress to level 1 with 0 XP
    const resetProgress: PlayerProgress = {
      level: 1,
      currentXP: 0,
      totalXP: 0,
      unlockedRewards: []
    };
    
    setPlayerProgress(resetProgress);
    
    // Save reset progress to database
    await saveProgress(resetProgress);
    
    // Show confirmation toast
    import('sonner@2.0.3').then(({ toast }) => {
      toast.success('🌱 Fresh start! Your adulting journey has been reset to level 1!', { 
        duration: 3000 
      });
    });
  };

  const restoreTask = (id: string) => {
    // Create the updated todos array
    const updatedTodos = todos.map(todo =>
      todo.id === id
        ? {
            ...todo,
            completed: false,
            completedAt: undefined,
            destroyedAt: undefined,
            createdAt: new Date(), // Update creation date to current time
          }
        : todo
    );
    
    // Update state
    setTodos(updatedTodos);
    setDailyStats(generateDailyStats(updatedTodos));
    
    // Save to database
    saveTasks(updatedTodos);
  };

  const submitReflection = (weekStartDate: string, prompt: string, response: string) => {
    const newReflection: WeeklyReflection = {
      id: Date.now().toString(),
      weekStartDate,
      prompt,
      response,
      submittedAt: new Date(),
    };

    const updatedReflections = [...reflections, newReflection];
    setReflections(updatedReflections);
    saveReflections(updatedReflections);
  };

  const completedTodos = todos.filter(todo => todo.completed && !todo.destroyedAt);
  const currentTheme = backgroundThemes.find(t => t.id === backgroundTheme) || backgroundThemes[2];

  const handleAuthSuccess = async (newUser: any, token: string) => {
    setUser(newUser);
    setAccessToken(token);
    setIsGuestMode(false);
    
    // Check if this is a brand new user (no onboarding completion record)
    try {
      const completed = localStorage.getItem('lifelevel-onboarding-completed');
      const userSpecificCompleted = localStorage.getItem(`lifelevel-onboarding-${newUser.id}`);
      
      // Show onboarding if neither global nor user-specific completion is found
      if (!completed && !userSpecificCompleted) {
        setShowOnboarding(true);
      } else {
        setShowOnboarding(false);
      }
    } catch (error) {
      console.warn('Could not check onboarding status:', error);
      setShowOnboarding(true); // Default to showing onboarding on error
    }

    // Try to load user data from Supabase
    try {
      const todos = await taskApi.getTasks(token);
      const parsedTodos = todos.map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.created_at),
        completedAt: todo.completed_at ? new Date(todo.completed_at) : undefined,
        destroyedAt: todo.destroyed_at ? new Date(todo.destroyed_at) : undefined,
      }));
      setTodos(parsedTodos);
      setDailyStats(generateDailyStats(parsedTodos));

      const progress = await progressApi.getProgress(token);
      if (progress) {
        setPlayerProgress({
          level: progress.level || 1,
          currentXP: progress.current_xp || 0,
          totalXP: progress.total_xp || 0,
          unlockedRewards: progress.unlocked_rewards || []
        });
      }

      const settings = await settingsApi.getSettings(token);
      if (settings) {
        setGameSettings({
          animationType: settings.animation_type || 'sparkles',
        });
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleGuestMode = () => {
    setIsGuestMode(true);
    setUser({ id: 'guest', email: 'guest@example.com' }); // Fake user object for guest
    setAccessToken(null);
    loadGuestData();
    // Don't skip onboarding for guests - they should see it too
    // Check if they've already completed onboarding
    try {
      const completed = localStorage.getItem('lifelevel-guest-onboarding-completed');
      if (!completed) {
        setShowOnboarding(true);
      }
    } catch (error) {
      setShowOnboarding(true);
    }
  };

  const handleLogout = async () => {
    if (isGuestMode) {
      // For guest mode, just clear state
      setUser(null);
      setAccessToken(null);
      setIsGuestMode(false);
      setTodos([]);
      setDailyStats([]);
      setPlayerProgress({
        level: 1,
        currentXP: 0,
        totalXP: 0,
        unlockedRewards: []
      });
      setGameSettings({ animationType: 'sparkles' });
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      // The auth state change listener will handle clearing state
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handle splash screen completion
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    try {
      // Save onboarding completion for both guest and logged-in users
      if (isGuestMode) {
        localStorage.setItem('lifelevel-guest-onboarding-completed', 'true');
      } else {
        localStorage.setItem('lifelevel-onboarding-completed', 'true');
      }
    } catch (error) {
      console.warn('Could not save onboarding completion:', error);
    }
  };

  // Show splash screen on initial load
  if (showSplash) {
    return (
      <LoadingScreen 
        onLoadingComplete={handleSplashComplete}
        backgroundImage={currentTheme.image}
      />
    );
  }

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E0DCF0]">
        <div className="w-64 space-y-3">
          <div className="h-8 rounded-2xl bg-white/60 animate-pulse" />
          <div className="h-24 rounded-3xl bg-white/55 animate-pulse" />
          <div className="h-12 rounded-full bg-white/65 animate-pulse" />
        </div>
      </div>
    );
  }

  // Show login flow if user is not authenticated
  if (!user) {
    return (
      <LoginFlow 
        onAuthSuccess={handleAuthSuccess}
        onGuestMode={handleGuestMode}
        backgroundTheme={currentTheme.image}
      />
    );
  }

  // Show onboarding flow on first visit
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div
      className="flex flex-col relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
      style={{
        minHeight: '100dvh',
        height: '100dvh',
        paddingTop: 'max(env(safe-area-inset-top), 50px)',
      }}
    >
      {focusModeOn && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[46px] z-[2]"
          animate={
            prefersReducedMotion
              ? { opacity: 0.25 }
              : {
                  boxShadow: [
                    'inset 0 0 0 1px rgba(20,184,166,0.14)',
                    'inset 0 0 0 2px rgba(20,184,166,0.24)',
                    'inset 0 0 0 1px rgba(20,184,166,0.14)',
                  ],
                }
          }
          transition={{ duration: 0.36, repeat: prefersReducedMotion ? 0 : Infinity, repeatType: 'loop' }}
        />
      )}
      {/* Removed immersive game background - using clean gradient instead */}
      
      {/* Fixed Top Navigation */}
      <NavigationBar
        activeScreen={activeScreen}
        onScreenChange={setActiveScreen}
        completedCount={completedTodos.length}
        onLogout={handleLogout}
        isGuestMode={isGuestMode}
      />
      
      <Toaster 
        position="bottom-center"
        expand={true}
        richColors={false}
        closeButton={false}
        offset={`calc(env(safe-area-inset-bottom) + 12px)`}
        gap={12}
        visibleToasts={5}
        toastOptions={{
          className: `toast-website toast-${backgroundTheme} ${activeScreen === 'todos' ? 'toast-tasks-screen' : activeScreen === 'game' ? 'toast-game-screen' : ''}`,
          duration: 2800,
          classNames: {
            success: '',
            error: '',
            warning: '',
            info: '',
          }
        }}
      />
      
      {/* Screen Content with bottom padding to account for fixed navbar + safe area */}
      <motion.div 
        className="flex-1 relative z-10 min-h-0"
        style={{
          paddingBottom: `calc(5rem + env(safe-area-inset-bottom))`
        }}
        key={activeScreen}
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeScreen === 'todos' && (
          <TodoListScreen
            todos={todos}
            onAddTodo={addTodo}
            onToggleTodo={toggleTodo}
            onEditTodo={editTodo}
            onReorderTodos={reorderTodos}
            onDeleteTodo={deleteTodo}
          />
        )}
        
        {activeScreen === 'game' && (
          <GameScreen
            playerProgress={playerProgress}
            levelConfig={levelConfig}
            getXPForNextLevel={getXPForNextLevel}
            journalEntries={journalEntries}
            todos={todos}
          />
        )}
        
        {activeScreen === 'log' && (
          <TaskHistoryScreen 
            todos={todos} 
            onRestoreTask={restoreTask}
            journalEntries={journalEntries}
          />
        )}
        
        {activeScreen === 'journal' && (
          <JournalScreen 
            journalEntries={journalEntries}
            todos={todos}
            onAddEntry={addJournalEntry}
            onUpdateEntry={updateJournalEntry}
          />
        )}
        
        {activeScreen === 'settings' && (
          <SettingsScreen 
            user={user}
            isGuestMode={isGuestMode}
            onLogout={handleLogout}
            onRestartJourney={restartAdultingJourney}
            playerProgress={playerProgress}
            levelConfig={levelConfig}
          />
        )}
      </motion.div>
    </div>
  );
}