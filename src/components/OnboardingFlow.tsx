import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import svgPaths from '../imports/Frame47296-1/svg-0hdeo07ddu';
import { Check, ChevronLeft } from 'lucide-react';

// Plant images for selection screen
import quietFernImg from 'figma:asset/7438a9d659ebf123bfbcca1916fe079babb35132.png';
import wildCloverImg from 'figma:asset/4c899badb6a576e6df75d3cb576969dd9e07298d.png';
import roseMossImg from 'figma:asset/34ec7cd771dafa77769204ece804cb31dcd57a39.png';
import blueSageImg from 'figma:asset/98636990ae62d87883607d3992be74e4cfde2eee.png';

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

  const plants = [
    {
      id: 'quiet-fern',
      name: 'Quiet Fern',
      subtitle: 'calm & steady',
      image: quietFernImg,
    },
    {
      id: 'wild-clover',
      name: 'Wild Clover',
      subtitle: 'resilient & bright',
      image: wildCloverImg,
    },
    {
      id: 'rose-moss',
      name: 'Rose Moss',
      subtitle: 'soft & enduring',
      image: roseMossImg,
    },
    {
      id: 'blue-sage',
      name: 'Blue Sage',
      subtitle: 'deep & thoughtful',
      image: blueSageImg,
    },
  ];

  const handleNext = () => {
    if (currentStep === 3) {
      // Save preferences to localStorage
      localStorage.setItem('lifelevel-user-name', userName);
      localStorage.setItem('lifelevel-user-feeling', userFeeling);
      localStorage.setItem('lifelevel-focus-mode', JSON.stringify(focusMode));
      localStorage.setItem('lifelevel-selected-plant', selectedPlant);
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canContinue =
    currentStep === 0
      ? userName.trim().length > 0
      : currentStep === 1
        ? userFeeling.length > 0
        : true;

  return (
    <div
      className="absolute inset-0 bg-[#eef0f7] flex items-center justify-center z-[100] p-4 overflow-y-auto"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 64px)' }}
    >
      <div className="w-full max-w-md my-auto">
        <div className="flex items-center justify-between mb-3">
          {currentStep > 0 ? (
            <button
              onClick={handleBack}
              className="w-9 h-9 rounded-full bg-white border border-[#E8E4F3] flex items-center justify-center text-[#1a1a2e]"
              aria-label="Back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-9 h-9" />
          )}
          <div className="w-9 h-9" />
        </div>

        <div className="min-h-[560px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
            {/* Step 1: Name */}
            {currentStep === 0 && (
              <div className="px-6">
                <div className="text-left mb-6">
                  <div className="w-8 h-8 mb-2">
                    <svg className="block size-full" fill="none" viewBox="0 0 780.771 775.61">
                      <path d={svgPaths.p2ff87f00} fill="#2D2B3E" />
                    </svg>
                  </div>
                  <h1 className="font-serif text-6xl text-[#1a1a2e] mb-4">
                    Can<span className="italic">opy</span>
                  </h1>
                </div>

                <h2 className="font-serif italic text-4xl text-[#1a1a2e] mb-2">What should we call you?</h2>
                <p className="text-[#8f95a3] text-sm mb-6">Just two quick things, then you&apos;re in.</p>

                <div className="bg-white rounded-3xl p-6 mb-6 border border-[#E8E4F3]">
                  <label className="block text-[11px] tracking-widest uppercase text-[#8f95a3] mb-3">YOUR NAME</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Name"
                    className="w-full text-lg text-[#1a1a2e] bg-transparent border-0 outline-none placeholder:text-[#c1c5cf]"
                  />
                </div>

                <button
                  onClick={handleNext}
                  disabled={!canContinue}
                  className="w-full py-4 bg-[#696A8E] hover:bg-[#5A5B78] disabled:bg-gray-300 text-white rounded-full font-medium transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 2: Mood */}
            {currentStep === 1 && (
              <div className="px-6">
                <h2 className="font-serif italic text-4xl text-[#1a1a2e] mb-2">How&apos;s your relationship with your to-do list?</h2>
                <p className="text-[#8f95a3] text-sm mb-6">This helps us set up your experience.</p>

                <div className="space-y-3 mb-6">
                  {['It stresses me out / I avoid it', 'It keeps me on track', "It's complicated"].map((feeling) => (
                    <button
                      key={feeling}
                      onClick={() => setUserFeeling(feeling)}
                      className={`w-full py-4 px-4 rounded-2xl text-left transition-colors flex items-center justify-between ${
                        userFeeling === feeling
                          ? 'bg-[#1a1a2e] text-white'
                          : 'bg-white text-[#1a1a2e] border border-[#E8E4F3]'
                      }`}
                    >
                      <span>{feeling}</span>
                      {userFeeling === feeling && (
                        <span className="w-5 h-5 rounded-full bg-[#1abf8f] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  disabled={!canContinue}
                  className="w-full py-4 bg-[#696A8E] hover:bg-[#5A5B78] disabled:bg-gray-300 text-white rounded-full font-medium transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 3: Focus mode */}
            {currentStep === 2 && (
              <div className="px-6">
                <h2 className="font-serif italic text-4xl text-[#1a1a2e] mb-2">One last thing.</h2>
                <p className="text-[#8f95a3] text-sm mb-6">You can always change this later.</p>

                <div className="bg-white rounded-3xl p-6 mb-6 border border-[#E8E4F3]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-base text-[#1a1a2e] mb-1">Focus mode</h3>
                      <p className="text-sm text-[#8f95a3] leading-relaxed">
                        Keeps your list to 3 tasks. Reduces decision fatigue.
                      </p>
                    </div>
                    <button
                      onClick={() => setFocusMode(!focusMode)}
                      className={`relative w-14 h-8 rounded-full transition-colors ml-4 flex-shrink-0 ${
                        focusMode ? 'bg-[#1abf8f]' : 'bg-gray-300'
                      }`}
                      aria-label="Toggle focus mode"
                    >
                      <motion.div
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
                        animate={{ left: focusMode ? '28px' : '4px' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                  <div className="border-t border-[#EFEAF8] pt-3">
                    <p className="text-sm text-[#1abf8f]">Recommended based on your answer ↑</p>
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full py-4 bg-[#696A8E] hover:bg-[#5A5B78] text-white rounded-full font-medium transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 4: Plant Selection */}
            {currentStep === 3 && (
              <div className="px-6">
                <h2 className="font-serif text-3xl text-gray-900 mb-2 italic">
                  Pick your first plant
                </h2>
                <p className="text-gray-400 text-sm mb-5">
                  It&apos;ll grow as you show up. No pressure.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  {plants.map((plant) => (
                    <motion.button
                      key={plant.id}
                      onClick={() => setSelectedPlant(plant.id)}
                      className={`relative bg-white/60 backdrop-blur-sm rounded-3xl p-4 transition-all ${
                        selectedPlant === plant.id
                          ? 'ring-2 ring-teal-400'
                          : 'hover:bg-white/80'
                      }`}
                      animate={
                        selectedPlant === plant.id && !prefersReducedMotion
                          ? { scale: [1, 1.03, 1] }
                          : { scale: 1 }
                      }
                      transition={{ duration: 0.3 }}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                    >
                      <div className="flex justify-center mb-3">
                        <img
                          src={plant.image}
                          alt={plant.name}
                          className="pixelated w-14 h-14 object-contain"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>

                      <p className="font-serif text-base text-gray-900 mb-1 italic">
                        {plant.name}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {plant.subtitle}
                      </p>
                    </motion.button>
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  className="w-full py-4 bg-[#1abf8f] hover:bg-[#14a87d] text-white rounded-full font-medium transition-colors"
                >
                  Start growing
                </button>
              </div>
            )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-1.5 w-1.5 rounded-full ${currentStep === step ? 'bg-[#1a1a2e]' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}