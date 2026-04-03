// Single source of truth plant registry
// All plant data, images, and unlock logic centralized here

// NOTE: Currently using existing plant files with random names.
// When you add the new consistently named files (quiet-fern.png, wild-clover.png, etc.),
// update these imports to match the new filenames.

// Import all plant images (using existing files until new ones are added)
import quietFernImg from '../assets/plants/1- plant.png'; // Will become: quiet-fern.png
import wildCloverImg from '../assets/plants/Plant 2.png'; // Will become: wild-clover.png
import roseMossImg from '../assets/plants/Plant 3.png'; // Will become: rose-moss.png
import blueSageImg from '../assets/plants/grehrehr 6.png'; // Will become: blue-sage.png
import coralFrondImg from '../assets/plants/grehrehr 7.png'; // Will become: coral-frond.png
import jadeSpikeImg from '../assets/plants/grehrehr 8.png'; // Will become: jade-spike.png
import mistCactusImg from '../assets/plants/grehrehr 9.png'; // Will become: mist-cactus.png
import frostAloeImg from '../assets/plants/u9335614566_collection_of_pixel_art_potted_succulent_sprite_8_c38ec370-374d-45f9-b502-119c76b34833_1 copy 1.png'; // Will become: frost-aloe.png
import moonFernImg from '../assets/plants/u9335614566_collection_of_pixel_art_potted_succulent_sprite_8_c38ec370-374d-45f9-b502-119c76b34833_1 copy 2.png'; // Will become: moon-fern.png
import emberBloomImg from '../assets/plants/u9335614566_collection_of_pixel_art_potted_succulent_sprite_8_c38ec370-374d-45f9-b502-119c76b34833_1 copy 3.png'; // Will become: ember-bloom.png
import darkSpineImg from '../assets/plants/u9335614566_collection_of_pixel_art_potted_succulent_sprite_8_c38ec370-374d-45f9-b502-119c76b34833_1 copy 4.png'; // Will become: dark-spine.png
import paleReedImg from '../assets/plants/u9335614566_collection_of_pixel_art_potted_succulent_sprite_8_c38ec370-374d-45f9-b502-119c76b34833_1 copy 5.png'; // Will become: pale-reed.png
import silverPineImg from '../assets/plants/u9335614566_collection_of_pixel_art_potted_succulent_sprite_8_c38ec370-374d-45f9-b502-119c76b34833_1 copy 6.png'; // Will become: silver-pine.png
import greenMantleImg from '../assets/plants/u9335614566_collection_of_pixel_art_potted_succulent_sprite_8_c38ec370-374d-45f9-b502-119c76b34833_1 copy 7.png'; // Will become: green-mantle.png
import duskSucculentImg from '../assets/plants/u9335614566_collection_of_pixel_art_potted_succulent_sprite_8_c38ec370-374d-45f9-b502-119c76b34833_1 copy 8.png'; // Will become: dusk-succulent.png
import obsidianLeafImg from '../assets/plants/u9335614566_collection_of_pixel_art_potted_succulent_sprite_8_c38ec370-374d-45f9-b502-119c76b34833_1 copy 9.png'; // Will become: obsidian-leaf.png
import sageCrownImg from '../assets/plants/u9335614566_collection_of_pixel_art_potted_succulent_sprite_8_c38ec370-374d-45f9-b502-119c76b34833_1 copy 10.png'; // Will become: sage-crown.png

export interface Plant {
  id: string;
  displayName: string;
  image: string;
  personality: string;
  unlockLevel?: number;
  isStarter?: boolean;
}

// Plant registry - single source of truth
export const PLANT_REGISTRY: Record<string, Plant> = {
  // STARTERS (user picks one at onboarding, the other 3 are earnable at levels 2-4)
  'quiet-fern': {
    id: 'quiet-fern',
    displayName: 'Quiet Fern',
    image: quietFernImg,
    personality: 'calm & steady',
    isStarter: true,
    // If not chosen during onboarding, unlocks at level 2
    unlockLevel: 2,
  },
  'wild-clover': {
    id: 'wild-clover',
    displayName: 'Wild Clover',
    image: wildCloverImg,
    personality: 'resilient & bright',
    isStarter: true,
    // If not chosen during onboarding, unlocks at level 3
    unlockLevel: 3,
  },
  'rose-moss': {
    id: 'rose-moss',
    displayName: 'Rose Moss',
    image: roseMossImg,
    personality: 'soft & enduring',
    isStarter: true,
    // If not chosen during onboarding, unlocks at level 4
    unlockLevel: 4,
  },
  'blue-sage': {
    id: 'blue-sage',
    displayName: 'Blue Sage',
    image: blueSageImg,
    personality: 'deep & thoughtful',
    isStarter: true,
    // If not chosen during onboarding, unlocks at level 2
    unlockLevel: 2,
  },

  // EARNED (unlocked by reaching a level)
  'coral-frond': {
    id: 'coral-frond',
    displayName: 'Coral Frond',
    image: coralFrondImg,
    personality: 'vibrant & growing',
    unlockLevel: 2,
  },
  'jade-spike': {
    id: 'jade-spike',
    displayName: 'Jade Spike',
    image: jadeSpikeImg,
    personality: 'sharp & focused',
    unlockLevel: 3,
  },
  'mist-cactus': {
    id: 'mist-cactus',
    displayName: 'Mist Cactus',
    image: mistCactusImg,
    personality: 'resilient & strong',
    unlockLevel: 4,
  },
  'frost-aloe': {
    id: 'frost-aloe',
    displayName: 'Frost Aloe',
    image: frostAloeImg,
    personality: 'cool & healing',
    unlockLevel: 5,
  },
  'moon-fern': {
    id: 'moon-fern',
    displayName: 'Moon Fern',
    image: moonFernImg,
    personality: 'mystical & calm',
    unlockLevel: 5,
  },
  'ember-bloom': {
    id: 'ember-bloom',
    displayName: 'Ember Bloom',
    image: emberBloomImg,
    personality: 'warm & energetic',
    unlockLevel: 6,
  },
  'dark-spine': {
    id: 'dark-spine',
    displayName: 'Dark Spine',
    image: darkSpineImg,
    personality: 'bold & protective',
    unlockLevel: 7,
  },
  'pale-reed': {
    id: 'pale-reed',
    displayName: 'Pale Reed',
    image: paleReedImg,
    personality: 'flexible & graceful',
    unlockLevel: 7,
  },
  'silver-pine': {
    id: 'silver-pine',
    displayName: 'Silver Pine',
    image: silverPineImg,
    personality: 'wise & enduring',
    unlockLevel: 8,
  },
  'green-mantle': {
    id: 'green-mantle',
    displayName: 'Green Mantle',
    image: greenMantleImg,
    personality: 'protective & nurturing',
    unlockLevel: 9,
  },
  'dusk-succulent': {
    id: 'dusk-succulent',
    displayName: 'Dusk Succulent',
    image: duskSucculentImg,
    personality: 'tranquil & resilient',
    unlockLevel: 9,
  },
  'obsidian-leaf': {
    id: 'obsidian-leaf',
    displayName: 'Obsidian Leaf',
    image: obsidianLeafImg,
    personality: 'strong & mysterious',
    unlockLevel: 10,
  },
  'sage-crown': {
    id: 'sage-crown',
    displayName: 'Sage Crown',
    image: sageCrownImg,
    personality: 'wise & majestic',
    unlockLevel: 10,
  },
};

// Helper functions for plant data

// Get all starter plants
export const getStarterPlants = (): Plant[] => {
  return Object.values(PLANT_REGISTRY).filter(plant => plant.isStarter);
};

// Get all earned plants
export const getEarnedPlants = (): Plant[] => {
  return Object.values(PLANT_REGISTRY).filter(plant => !plant.isStarter);
};

// Get plants that can be unlocked at a specific level
export const getUnlockablePlants = (level: number): Plant[] => {
  return Object.values(PLANT_REGISTRY).filter(plant => 
    plant.unlockLevel === level
  );
};

// Get plants unlocked at or below a specific level
export const getUnlockedPlants = (currentLevel: number): Plant[] => {
  return Object.values(PLANT_REGISTRY).filter(plant => 
    plant.isStarter || (plant.unlockLevel && plant.unlockLevel <= currentLevel)
  );
};

// Get plants unlocked for a specific user (based on owned plants and level)
export const getUserUnlockedPlants = (ownedPlants: string[], currentLevel: number): Plant[] => {
  return Object.values(PLANT_REGISTRY).filter(plant => {
    // Plant is unlocked if:
    // 1. It's owned by the user, OR
    // 2. It's a starter plant that the user has earned through leveling up, OR
    // 3. It's an earned plant that the user has reached the required level for
    return ownedPlants.includes(plant.id) || 
           (plant.isStarter && currentLevel >= 2) || // Starter plants become available at level 2 if not chosen
           (plant.unlockLevel && plant.unlockLevel <= currentLevel);
  });
};

// Get newly unlocked plants when leveling up (excluding already owned plants)
export const getNewlyUnlockedPlants = (oldLevel: number, newLevel: number, ownedPlants: string[] = []): Plant[] => {
  const newlyUnlocked: Plant[] = [];
  for (let level = oldLevel + 1; level <= newLevel; level++) {
    const levelPlants = getUnlockablePlants(level);
    newlyUnlocked.push(...levelPlants.filter(plant => !ownedPlants.includes(plant.id)));
  }
  
  // At level 2, unlock the 3 starter plants that weren't chosen during onboarding
  if (oldLevel < 2 && newLevel >= 2) {
    const starterPlants = getStarterPlants();
    newlyUnlocked.push(...starterPlants.filter(plant => !ownedPlants.includes(plant.id)));
  }
  
  return newlyUnlocked;
};

// Check if a specific plant is unlocked at a given level
export const isPlantUnlocked = (plantId: string, currentLevel: number): boolean => {
  const plant = PLANT_REGISTRY[plantId];
  if (!plant) return false;
  return plant.isStarter || (plant.unlockLevel && plant.unlockLevel <= currentLevel);
};

// Get plant by ID
export const getPlantById = (id: string): Plant | undefined => {
  return PLANT_REGISTRY[id];
};

// Get plants sorted by unlock level (for display purposes)
export const getPlantsSortedByLevel = (): Plant[] => {
  return Object.values(PLANT_REGISTRY).sort((a, b) => {
    // Starters come first
    if (a.isStarter && !b.isStarter) return -1;
    if (!a.isStarter && b.isStarter) return 1;
    
    // Then sort by unlock level
    const aLevel = a.unlockLevel || 999;
    const bLevel = b.unlockLevel || 999;
    return aLevel - bLevel;
  });
};
