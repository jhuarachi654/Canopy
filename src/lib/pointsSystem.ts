// Centralized points and level system
// Defines point values, level thresholds, and plant unlock logic

import { getUnlockablePlants, getUnlockedPlants } from './plantRegistry';

// POINT VALUES - No daily cap, users earn as much as they engage
export const POINT_VALUES = {
  JOURNAL_ENTRY: 10,
  COMPLETE_2_TASKS: 20,
  FOCUS_MODE_USED: 10,
  TWO_MINUTE_RESET: 5,
} as const;

// LEVEL THRESHOLDS - Cumulative points needed for each level
export const LEVEL_THRESHOLDS = {
  LEVEL_1_TO_2: 500,   // Level 1 → 2: 500 pts
  LEVEL_2_TO_3: 1000,  // Level 2 → 3: 1,000 pts (cumulative: 1,500)
  LEVEL_3_TO_4: 1500,  // Level 3 → 4: 1,500 pts (cumulative: 3,000)
  LEVEL_4_TO_5: 2000,  // Level 4 → 5: 2,000 pts (cumulative: 5,000)
  LEVEL_5_TO_6: 2500,  // Level 5 → 6: 2,500 pts (cumulative: 7,500)
  LEVEL_6_TO_7: 3000,  // Level 6 → 7: 3,000 pts (cumulative: 10,500)
  LEVEL_7_TO_8: 3500,  // Level 7 → 8: 3,500 pts (cumulative: 14,000)
  LEVEL_8_TO_9: 4000,  // Level 8 → 9: 4,000 pts (cumulative: 18,000)
  LEVEL_9_TO_10: 4500, // Level 9 → 10: 4,500 pts (cumulative: 22,500)
} as const;

// Helper functions for level calculations

// Get level based on total points
export const getLevelFromPoints = (totalPoints: number): number => {
  if (totalPoints < LEVEL_THRESHOLDS.LEVEL_1_TO_2) return 1;
  if (totalPoints < LEVEL_THRESHOLDS.LEVEL_2_TO_3) return 2;
  if (totalPoints < LEVEL_THRESHOLDS.LEVEL_3_TO_4) return 3;
  if (totalPoints < LEVEL_THRESHOLDS.LEVEL_4_TO_5) return 4;
  if (totalPoints < LEVEL_THRESHOLDS.LEVEL_5_TO_6) return 5;
  if (totalPoints < LEVEL_THRESHOLDS.LEVEL_6_TO_7) return 6;
  if (totalPoints < LEVEL_THRESHOLDS.LEVEL_7_TO_8) return 7;
  if (totalPoints < LEVEL_THRESHOLDS.LEVEL_8_TO_9) return 8;
  if (totalPoints < LEVEL_THRESHOLDS.LEVEL_9_TO_10) return 9;
  return 10; // Max level
};

// Get points needed to reach next level
export const getPointsToNextLevel = (currentLevel: number, totalPoints: number): number => {
  if (currentLevel >= 10) return 0; // Max level
  
  const nextLevelThreshold = Object.values(LEVEL_THRESHOLDS)[currentLevel - 1];
  return Math.max(0, nextLevelThreshold - totalPoints);
};

// Get progress percentage towards next level
export const getLevelProgress = (currentLevel: number, totalPoints: number): number => {
  if (currentLevel >= 10) return 100; // Max level
  
  const currentLevelThreshold = currentLevel === 1 ? 0 : Object.values(LEVEL_THRESHOLDS)[currentLevel - 2];
  const nextLevelThreshold = Object.values(LEVEL_THRESHOLDS)[currentLevel - 1];
  
  const progressInLevel = totalPoints - currentLevelThreshold;
  const totalNeededInLevel = nextLevelThreshold - currentLevelThreshold;
  
  return Math.min(100, Math.max(0, (progressInLevel / totalNeededInLevel) * 100));
};

// Get points earned in current level
export const getPointsInCurrentLevel = (currentLevel: number, totalPoints: number): number => {
  if (currentLevel === 1) return totalPoints;
  
  const previousLevelThreshold = Object.values(LEVEL_THRESHOLDS)[currentLevel - 2];
  return totalPoints - previousLevelThreshold;
};

// Check if user leveled up and return new level
export const checkLevelUp = (oldPoints: number, newPoints: number): { didLevelUp: boolean; newLevel: number; levelsGained: number } => {
  const oldLevel = getLevelFromPoints(oldPoints);
  const newLevel = getLevelFromPoints(newPoints);
  const levelsGained = newLevel - oldLevel;
  
  return {
    didLevelUp: levelsGained > 0,
    newLevel,
    levelsGained,
  };
};

// Get plants unlocked at specific levels
export const getPlantsUnlockedAtLevel = (level: number) => {
  return getUnlockablePlants(level);
};

// Get all plants unlocked up to a certain level
export const getAllUnlockedPlantsUpToLevel = (level: number) => {
  return getUnlockedPlants(level);
};

// Point earning events
export type PointEvent = 
  | 'journal_entry'
  | 'complete_2_tasks'
  | 'focus_mode_used'
  | 'two_minute_reset';

// Get point value for an event
export const getPointValue = (event: PointEvent): number => {
  switch (event) {
    case 'journal_entry':
      return POINT_VALUES.JOURNAL_ENTRY;
    case 'complete_2_tasks':
      return POINT_VALUES.COMPLETE_2_TASKS;
    case 'focus_mode_used':
      return POINT_VALUES.FOCUS_MODE_USED;
    case 'two_minute_reset':
      return POINT_VALUES.TWO_MINUTE_RESET;
    default:
      return 0;
  }
};

// Get user-friendly description for point events
export const getPointEventDescription = (event: PointEvent): string => {
  switch (event) {
    case 'journal_entry':
      return 'Journal entry';
    case 'complete_2_tasks':
      return 'Complete 2 tasks';
    case 'focus_mode_used':
      return 'Focus mode used today';
    case 'two_minute_reset':
      return '2-minute reset';
    default:
      return 'Unknown activity';
  }
};

// Calculate total XP for level display (for UI purposes)
export const getTotalXPForLevel = (level: number): number => {
  if (level === 1) return 0;
  return Object.values(LEVEL_THRESHOLDS)[level - 2];
};

// Get level threshold for display
export const getLevelThreshold = (level: number): number => {
  if (level >= 10) return LEVEL_THRESHOLDS.LEVEL_9_TO_10;
  return Object.values(LEVEL_THRESHOLDS)[level - 1];
};
