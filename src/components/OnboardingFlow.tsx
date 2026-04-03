import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import svgPaths from '../imports/Frame47296-1/svg-0hdeo07ddu';
import { Check, ChevronLeft, Target, Lightbulb } from 'lucide-react';
import { getStarterPlants } from '../lib/plantRegistry';
import CanopyScreenBackground from './CanopyScreenBackground';

const FOCUS_MODE_STORAGE_KEY = 'lifelevel-focus-mode';
const FOCUS_MODE_UPDATED_EVENT = 'canopy-focus-mode-updated';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const prefersReducedMotion = useReducedMotion();
  const [currentStep, setCurrentStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [userFeeling, setUserFeeling] = useState('');
  const [focusMode, setFocusMode] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState('quiet-fern');
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [bottomPadding, setBottomPadding] = useState(32);

  // Handle mobile keyboard with Visual Viewport API
  useEffect(() => {
    if (!window.visualViewport) return;

    const handleViewportChange = () => {
      const viewport = window.visualViewport;
      const heightDiff = window.innerHeight - viewport.height;
      setKeyboardHeight(heightDiff > 150 ? heightDiff : 0); // Only count as keyboard if significant height
    };

    // Initial check
    handleViewportChange();

    // Listen for viewport changes (keyboard open/close)
    window.visualViewport.addEventListener('resize', handleViewportChange);
    
    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
    };
  }, []);

  // Get starter plants from registry
  const plants = getStarterPlants().map(plant => ({
    id: plant.id,
    name: plant.displayName,
    subtitle: plant.personality,
    image: plant.image,
  }));

  const handleNext = () => {
    console.log('Current step:', currentStep, 'Loading state:', isLoading);
    
    // Prevent multiple clicks during loading
    if (isLoading) {
      console.log('Ignoring click - already loading');
      return;
    }
    
    // Reset scroll position before navigating away
    window.scrollTo(0, 0);
    
    // All steps should be instant for better UX
    if (currentStep === 3) {
      // Save preferences to localStorage instantly
      localStorage.setItem('lifelevel-user-name', userName);
      localStorage.setItem('lifelevel-user-feeling', userFeeling);
      localStorage.setItem('lifelevel-focus-mode', focusMode.toString());
      
      // Save ONLY the chosen starter plant as the user's first owned plant
      localStorage.setItem('lifelevel-selected-plant', selectedPlant);
      
      // Initialize user's owned plants array with ONLY the selected starter plant
      // The other 3 starter plants must be earned through leveling up
      const ownedPlants = [selectedPlant];
      localStorage.setItem('lifelevel-owned-plants', JSON.stringify(ownedPlants));
      
      // Initialize user progress (starting at Level 1 with 0 points)
      const initialProgress = {
        level: 1,
        currentXP: 0,
        totalXP: 0,
        ownedPlants: ownedPlants,
        unlockedPlants: [selectedPlant] // Only the selected plant is unlocked
      };
      localStorage.setItem('lifelevel-player-progress', JSON.stringify(initialProgress));
      
      // Complete onboarding instantly
      onComplete();
    } else {
      // Move to next step instantly
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    // Reset scroll position before navigating away
    window.scrollTo(0, 0);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const canContinue =
    currentStep === 0
      ? userName.trim().length > 0
      : currentStep === 1
        ? userFeeling.length > 0
        : true;

  return (
    <div
      className={`absolute inset-0 z-[100] flex bg-[var(--bg-screen-auth)] overflow-hidden`}
      style={{ 
        height: '100dvh',
        paddingBottom: 'max(env(safe-area-inset-bottom), 0px)',
        paddingTop: 'max(env(safe-area-inset-top), 12px)'
      }}
    >
      <CanopyScreenBackground
        variant={
          currentStep === 0
            ? 'onboarding-name'
            : currentStep === 1
              ? 'onboarding-question'
              : currentStep === 2
                ? 'onboarding-focus'
                : 'onboarding-plant'
        }
      />

      {/* Content: max 393px (frame width), centered on large viewports */}
      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-[min(393px,100%)] flex-1 flex-col px-[var(--space-6)] sm:px-[var(--space-10)]">
        {/* Header - pinned to top */}
        <div className="flex h-11 shrink-0 items-center justify-between">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-full)] border border-[var(--border-soft)] bg-[var(--surface-base)] text-[var(--text-strong)] transition-colors duration-200 hover:bg-[var(--surface-hover-soft)] active:bg-[var(--surface-panel-toggle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark)] focus-visible:ring-offset-2"
              aria-label="Back"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : (
            <span className="h-9 w-9" aria-hidden="true" />
          )}
          <span className="h-9 w-9" aria-hidden="true" />
        </div>

        {/* Middle content - flexible space that absorbs keyboard */}
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Step 0: reference places hero ~22–28% below top (upper-mid); other steps: centered in remaining space */}
          <div
            className={
              currentStep === 0
                ? keyboardHeight > 0 
                  ? 'flex w-full min-h-0 flex-col justify-center py-[var(--space-4)]'
                  : 'flex w-full min-h-0 flex-col pb-[var(--space-5)] pt-[clamp(var(--space-3),min(14dvh,4rem),5rem)]'
                : currentStep === 3
                  ? 'my-auto flex w-full min-h-0 flex-col py-[var(--space-2)]'
                  : currentStep === 2
                    ? 'flex w-full min-h-0 flex-col py-[var(--space-4)]'
                    : 'my-auto flex w-full min-h-0 flex-col py-[var(--space-6)]'
            }
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                className={`flex w-full flex-col ${currentStep === 3 ? '' : 'min-h-0'}`}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
            {/* Step 1: Name — Canopy-3 */}
            {currentStep === 0 && (
              <div className="flex w-full flex-col items-stretch text-left">
                <div className="mb-[var(--space-3)]">
                  <div className="mb-[var(--space-3)] h-8 w-8">
                    <svg className="block size-full" fill="none" viewBox="0 0 780.771 775.61">
                      <path d={svgPaths.p2ff87f00} fill="var(--text-strong)" />
                    </svg>
                  </div>
                </div>

                <h2 className="type-headline mb-[var(--space-3)] max-w-[20ch] italic text-[var(--text-strong)]">
                  What should we call you?
                </h2>
                <p className="type-body mb-[var(--space-6)] italic text-[var(--text-caption-3)]">
                  Just two quick things, then you&apos;re in.
                </p>

                <label
                  htmlFor="onboard-name"
                  className="type-label mb-[var(--space-3)] block uppercase tracking-wider text-[var(--text-caption-3)]"
                >
                  YOUR NAME
                </label>
                <input
                  id="onboard-name"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Name"
                  className="type-body w-full rounded-[var(--radius-full)] border border-[var(--border-soft)] bg-[var(--surface-base-90)] p-3 text-[var(--text-strong-alt)] outline-none transition-all duration-150 ease-out placeholder:text-[var(--text-placeholder)] focus:border-[var(--accent-teal)] focus:ring-2 focus:ring-[color:var(--shadow-focus-ring-accent-25)]"
                  autoFocus
                />
              </div>
            )}

            {/* Step 2: Mood */}
            {currentStep === 1 && (
              <div className="flex w-full flex-col items-stretch pt-[var(--space-2)] text-left">
                <h2 className="type-headline mb-[var(--space-2)] italic text-[var(--text-strong)]">
                  How&apos;s your relationship with your to-do list?
                </h2>
                <p className="type-body mb-[var(--space-6)] italic text-[var(--text-caption-6)]">
                  This helps us set up your experience.
                </p>

                <div className="mb-[var(--space-6)] space-y-[var(--space-3)]">
                  {['It stresses me out / I avoid it', 'It keeps me on track', "It's complicated"].map((feeling) => (
                    <button
                      type="button"
                      key={feeling}
                      onClick={() => setUserFeeling(feeling)}
                      className={`flex w-full items-center justify-between rounded-[var(--radius-lg)] px-[var(--space-4)] py-[var(--space-4)] text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 ${
                        userFeeling === feeling
                          ? 'bg-[var(--text-strong)] text-white active:bg-[var(--text-strong-active)] active:brightness-95'
                          : 'border border-[var(--border-soft)] bg-[var(--surface-base)] text-[var(--text-strong)] active:bg-[var(--surface-hover-soft-alt)] active:brightness-[0.98]'
                      } ${prefersReducedMotion ? '' : 'active:scale-[0.99]'}`}
                    >
                      <span>{feeling}</span>
                      {userFeeling === feeling && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-[var(--radius-full)] bg-[var(--accent-teal)]">
                          <Check className="h-3 w-3 text-white" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Focus mode */}
            {currentStep === 2 && (
              <div className="flex w-full flex-col items-stretch pt-[var(--space-2)] text-left">
                <h2 className="type-headline mb-[var(--space-2)] italic text-[var(--text-strong)]">Stay focused.</h2>
                <p className="type-body mb-[var(--space-6)] italic text-[var(--text-caption-6)]">
                  Two ways to stay on track.
                </p>

                {/* Card 1: Deep Focus (Timer) */}
                <div className="mb-[var(--space-4)] rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--surface-base)] p-[var(--space-5)]">
                  <div className="mb-[var(--space-3)]">
                    <h3 className="type-body font-semibold text-[var(--text-strong)]">Deep Focus</h3>
                    <p className="type-caption text-[var(--text-caption-6)]">
                      Timer for individual tasks
                    </p>
                  </div>
                  
                  {/* Demo task card */}
                  <div className="mb-[var(--space-3)] rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--surface-base-60)] p-[var(--space-3)]">
                    <div className="flex items-center gap-3">
                      <span className="type-body text-[var(--text-strong)]">Call the dentist</span>
                      <span className="ml-auto type-caption text-[var(--text-caption-2)]">25:00</span>
                    </div>
                  </div>

                  <p className="type-caption text-[var(--text-caption-6)]">
                    Long-press any task to start a timer
                  </p>
                </div>

                {/* Card 2: Essential List (3-task limit) */}
                <div className="mb-[var(--space-6)] rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--surface-base)] p-[var(--space-5)]">
                  <div className="mb-[var(--space-3)] flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="type-body font-semibold text-[var(--text-strong)]">Essential List</h3>
                      <p className="type-caption text-[var(--text-caption-6)]">
                        Limit to 3 tasks. Reduce overwhelm.
                      </p>
                    </div>
                    <label
                      className="relative ml-[var(--space-4)] flex h-11 w-16 shrink-0 cursor-pointer items-center"
                      aria-label="Toggle Essential List"
                    >
                      <input
                        type="checkbox"
                        checked={focusMode}
                        onChange={(e) => setFocusMode(e.target.checked)}
                        className="peer sr-only"
                      />
                      <span
                        className="absolute inset-0 rounded-[var(--radius-full)] bg-[var(--surface-panel-track-disabled)] transition-colors duration-150 ease-out peer-checked:bg-[var(--accent-teal)] peer-focus-visible:ring-2 peer-focus-visible:ring-[color:var(--shadow-focus-ring-dark)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white"
                        aria-hidden="true"
                      />
                      <motion.span
                        className="absolute left-1 top-1 h-9 w-9 rounded-[var(--radius-full)] bg-white shadow-sm"
                        animate={{ x: focusMode ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        aria-hidden="true"
                      />
                    </label>
                  </div>
                  <div className="border-t border-[var(--border-soft-panel)] pt-3">
                    <p className="type-caption text-[var(--accent-teal)]">Recommended based on your answer ↑</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Plant Selection */}
            {currentStep === 3 && (
              <div className="flex min-h-0 w-full flex-col items-stretch justify-center pb-[var(--space-1)] pt-[var(--space-1)] text-left">
                <h2 className="type-headline mb-[var(--space-1)] italic text-[var(--text-strong-alt)]">
                  Pick your first plant
                </h2>
                <p className="type-caption mb-[var(--space-3)] italic text-[var(--text-caption-7)]">
                  Your collection will grow as you show up.
                </p>

                <div className="mb-[var(--space-4)] grid grid-cols-2 gap-[var(--space-2)] overflow-visible p-[var(--space-1)] [grid-auto-rows:minmax(0,1fr)]">
                  {plants.map((plant) => {
                    const isSelected = selectedPlant === plant.id;
                    const hasDifferentSelection = selectedPlant !== plant.id;

                    return (
                    <button
                      type="button"
                      key={plant.id}
                      onClick={() => setSelectedPlant(plant.id)}
                      className={`relative self-stretch overflow-visible rounded-[var(--radius-lg)] border bg-[var(--surface-base-60)] px-[var(--space-3)] pb-[var(--space-3)] pt-[var(--space-3)] text-left backdrop-blur-[4px] transition-all duration-150 ease-out ${
                        isSelected
                          ? 'border-[var(--accent-select-outline)] shadow-[0_0_0_1px_var(--accent-select-outline),var(--shadow-plant-card)]'
                          : 'border-[var(--border-soft)] shadow-[var(--shadow-plant-card)] hover:border-[var(--accent-select-outline)] hover:bg-[var(--surface-base-75)] hover:shadow-[0_0_0_1px_var(--accent-select-outline),var(--shadow-plant-card)]'
                      } ${hasDifferentSelection ? 'opacity-85' : 'opacity-100'}`}
                    >
                      {isSelected ? (
                        <span className="absolute right-[var(--space-3)] top-[var(--space-3)] flex h-6 w-6 items-center justify-center rounded-[var(--radius-full)] bg-[var(--accent-select-outline)] text-white shadow-sm">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      ) : null}
                      <div className="mb-[var(--space-2)] flex min-h-[52px] items-center justify-center overflow-visible">
                        <img
                          src={plant.image}
                          alt={plant.name}
                          className="pixelated h-12 w-12 shrink-0 object-contain"
                          style={{ imageRendering: 'pixelated', overflow: 'visible' }}
                        />
                      </div>

                      <p className="type-body mb-[var(--space-1)] text-center text-[var(--text-strong-alt)]">
                        {plant.name}
                      </p>
                      <p className="type-caption text-center text-[var(--text-caption-7)]">
                        {plant.subtitle}
                      </p>
                    </button>
                    );
                  })}
                </div>
              </div>
            )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* CTA Button - Fixed to bottom with keyboard awareness */}
        <div className="shrink-0 px-[var(--space-6)] sm:px-[var(--space-10)] transition-all duration-300 ease-out" style={{ paddingBottom: `${Math.max(32, keyboardHeight + 16)}px` }}>
          {/* Step 1: Name */}
          {currentStep === 0 && (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canContinue}
              className={`type-body h-14 w-full rounded-[var(--radius-full)] text-center text-white shadow-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark)] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:bg-[var(--surface-panel-track-neutral)] disabled:text-white/80 disabled:hover:bg-[var(--surface-panel-track-neutral)] ${
                canContinue
                  ? 'bg-[var(--accent-teal)] hover:bg-[var(--accent-teal-hover)] active:bg-[var(--accent-teal-active)]'
                  : 'bg-[var(--surface-panel-track-disabled)]'
              } ${prefersReducedMotion ? '' : 'active:scale-[0.98] disabled:active:scale-100'}`}
            >
              Continue
            </button>
          )}

          {/* Step 2: Mood */}
          {currentStep === 1 && (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canContinue}
              className={`type-body h-14 w-full rounded-[var(--radius-full)] text-center text-white shadow-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark)] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:bg-[var(--surface-panel-track-neutral)] disabled:text-white/80 disabled:hover:bg-[var(--surface-panel-track-neutral)] ${
                canContinue
                  ? 'bg-[var(--accent-teal)] hover:bg-[var(--accent-teal-hover)] active:bg-[var(--accent-teal-active)]'
                  : 'bg-[var(--surface-panel-track-disabled)]'
              } ${prefersReducedMotion ? '' : 'active:scale-[0.98]'}`}
            >
              Continue
            </button>
          )}

          {/* Step 3: Focus mode */}
          {currentStep === 2 && (
            <button
              type="button"
              onClick={handleNext}
              className="type-body h-14 w-full rounded-[var(--radius-full)] bg-[var(--accent-teal)] text-center text-white shadow-none transition-colors duration-200 hover:bg-[var(--accent-teal-hover)] active:bg-[var(--accent-teal-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark)] focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98]"
            >
              Continue
            </button>
          )}

          {/* Step 4: Plant Selection */}
          {currentStep === 3 && (
            <button
              type="button"
              onClick={handleNext}
              className="type-body h-14 w-full rounded-[var(--radius-full)] bg-[var(--accent-teal)] text-center text-white shadow-none transition-colors duration-200 hover:bg-[var(--accent-teal-hover)] active:bg-[var(--accent-teal-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark)] focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98]"
            >
              Start growing
            </button>
          )}
        </div>

        <div
          className="flex shrink-0 justify-center gap-[var(--space-2)] pt-[var(--space-3)]"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom), var(--space-4))' }}
          role="status"
          aria-label={`Step ${currentStep + 1} of 4`}
        >
          {[0, 1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-1.5 w-1.5 rounded-[var(--radius-full)] ${currentStep === step ? 'bg-[var(--text-strong)]' : 'bg-[var(--surface-panel-track-disabled)]'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
