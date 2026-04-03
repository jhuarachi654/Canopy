# Points and Level System Integration Guide

This guide explains how the centralized points and level system works with the plant registry across the entire app.

## 🎯 Point Values (No Daily Cap)

Users earn points for engagement without any daily limits:

```typescript
// From src/lib/pointsSystem.ts
export const POINT_VALUES = {
  JOURNAL_ENTRY: 10,        // +10 pts per journal entry
  COMPLETE_2_TASKS: 20,     // +20 pts for completing 2 tasks
  FOCUS_MODE_USED: 10,      // +10 pts when focus mode is used today
  TWO_MINUTE_RESET: 5,      // +5 pts for 2-minute reset
};
```

## 📈 Level Thresholds (Cumulative Points)

```typescript
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
};
```

## 🌱 Plant Unlock System

Plants are automatically unlocked when users reach specific levels:

### Starter Plants (Level 1 - Onboarding)
- quiet-fern: "Quiet Fern" - "calm & steady"
- wild-clover: "Wild Clover" - "resilient & bright"  
- rose-moss: "Rose Moss" - "soft & enduring"
- blue-sage: "Blue Sage" - "deep & thoughtful"

### Earned Plants (Level-based Unlocks)
- Level 2 → coral-frond: "Coral Frond"
- Level 3 → jade-spike: "Jade Spike"
- Level 4 → mist-cactus: "Mist Cactus"
- Level 5 → frost-aloe: "Frost Aloe"
- Level 5 → moon-fern: "Moon Fern"
- Level 6 → ember-bloom: "Ember Bloom"
- Level 7 → dark-spine: "Dark Spine"
- Level 7 → pale-reed: "Pale Reed"
- Level 8 → silver-pine: "Silver Pine"
- Level 9 → green-mantle: "Green Mantle"
- Level 9 → dusk-succulent: "Dusk Succulent"
- Level 10 → obsidian-leaf: "Obsidian Leaf"
- Level 10 → sage-crown: "Sage Crown"

## 💻 Usage Examples

### 1. Awarding Points
```typescript
import { getPointValue, checkLevelUp } from '../lib/pointsSystem';
import { getNewlyUnlockedPlants } from '../lib/plantRegistry';

// User completes a journal entry
const oldPoints = userProgress.totalXP;
const newPoints = oldPoints + getPointValue('journal_entry'); // +10 pts

// Check if they leveled up
const levelUpResult = checkLevelUp(oldPoints, newPoints);
if (levelUpResult.didLevelUp) {
  // Get newly unlocked plants
  const newPlants = getNewlyUnlockedPlants(
    levelUpResult.newLevel - levelUpResult.levelsGained,
    levelUpResult.newLevel
  );
  
  // Show celebration UI with new plants
  showLevelUpCelebration(levelUpResult.newLevel, newPlants);
}
```

### 2. Getting User's Current Level
```typescript
import { getLevelFromPoints, getPointsToNextLevel } from '../lib/pointsSystem';

const userLevel = getLevelFromPoints(userProgress.totalXP);
const pointsToNext = getPointsToNextLevel(userLevel, userProgress.totalXP);
const progressPercent = getLevelProgress(userLevel, userProgress.totalXP);
```

### 3. Getting Available Plants
```typescript
import { getUnlockedPlants, getPlantById } from '../lib/plantRegistry';

// Get all plants user can access
const currentLevel = getLevelFromPoints(userProgress.totalXP);
const availablePlants = getUnlockedPlants(currentLevel);

// Get specific plant info
const selectedPlant = getPlantById(userSelectedPlantId);
```

### 4. Checking Plant Unlock Status
```typescript
import { isPlantUnlocked } from '../lib/plantRegistry';

const canAccessPlant = isPlantUnlocked('coral-frond', userLevel);
```

## 🔄 Integration Points

### GameScreenNew.tsx
- Calculates level from total XP: `getLevelFromPoints(playerProgress.totalXP)`
- Shows unlocked plants based on calculated level
- Displays plant collection with proper unlock states

### FocusTaskScreen.tsx
- Uses `getUnlockedPlants(currentLevel)` to show available decorative plants
- Awards points for focus mode usage

### JournalScreenNew.tsx
- Awards `POINT_VALUES.JOURNAL_ENTRY` points for entries
- Can trigger level up celebrations

### SettingsScreen.tsx
- Shows current plant based on user's selection
- Displays user's current level and progress

## 🎉 Level Up Celebrations

When a user levels up:

1. **Automatic Plant Unlock**: Plants assigned to the new level become available
2. **Celebration UI**: Show level up animation with unlocked plants
3. **Progress Update**: Update user's level display throughout the app
4. **Notification**: Alert user about new plants

```typescript
// Example level up handler
const handleLevelUp = (oldPoints: number, newPoints: number) => {
  const { didLevelUp, newLevel, levelsGained } = checkLevelUp(oldPoints, newPoints);
  
  if (didLevelUp) {
    const newPlants = getNewlyUnlockedPlants(newLevel - levelsGained, newLevel);
    
    // Trigger celebration
    showLevelUpModal({
      newLevel,
      unlockedPlants: newPlants,
      totalPoints: newPoints
    });
  }
};
```

## 📊 Data Flow

1. **User Action** → Award Points → Update Total XP
2. **Total XP** → Calculate Level → Determine Unlocked Plants
3. **Level Change** → Trigger Plant Unlocks → Update UI
4. **UI Updates** → Show New Plants → Enable Selection

This creates a seamless progression system where engagement directly unlocks new content!
