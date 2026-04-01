import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Plant images for selection screen
import quietFernImg from 'figma:asset/7438a9d659ebf123bfbcca1916fe079babb35132.png';
import wildCloverImg from 'figma:asset/4c899badb6a576e6df75d3cb576969dd9e07298d.png';
import roseMossImg from 'figma:asset/34ec7cd771dafa77769204ece804cb31dcd57a39.png';
import blueSageImg from 'figma:asset/98636990ae62d87883607d3992be74e4cfde2eee.png';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
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
    if (currentStep === 2) {
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

  const isLastStep = currentStep === 2;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="w-full max-w-md my-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 0: Welcome */}
            {currentStep === 0 && (
              <div className="text-center space-y-10 max-w-lg mx-auto">
                {/* Canopy Branding */}
                <div className="mb-8">
                  <h1 className="font-serif text-6xl text-[#2D2B3E] mb-4">
                    Can<span className="italic">opy</span>
                  </h1>
                  <p className="text-[#8B86A3] text-sm tracking-[0.2em] uppercase font-light">
                    Grow through every day
                  </p>
                </div>
                
                {/* Description */}
                <p className="text-center text-[#5B5878] text-base leading-relaxed mb-12 px-4 font-light">
                  Canopy is a gentle space for tasks, reflection, and tiny wins — designed for neurodivergent minds.
                </p>

                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mb-8">
                  <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleNext}
                    className="w-full py-4 bg-[#696A8E] hover:bg-[#5A5B78] text-white rounded-full font-medium transition-colors"
                  >
                    Get started
                  </button>
                  <button
                    onClick={handleSkip}
                    className="w-full py-3 text-gray-400 hover:text-gray-600 text-sm transition-colors"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Personalization */}
            {currentStep === 1 && (
              <div className="px-6">
                {/* Title */}
                <h2 className="font-serif text-3xl text-gray-900 mb-2 italic">
                  What should we call you?
                </h2>
                <p className="text-gray-400 text-sm mb-8">
                  Just two quick things, then you're in.
                </p>

                {/* Name Input Card */}
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 mb-4">
                  <label className="block text-xs text-gray-400 mb-3">
                    Your name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Name"
                    className="w-full text-lg text-gray-900 bg-transparent border-0 outline-none placeholder:text-gray-300"
                  />

                  {/* How do you feel section */}
                  <div className="mt-6">
                    <p className="text-sm text-gray-900 mb-4">
                      How do you feel most days?
                    </p>
                    <div className="space-y-3">
                      {['Overwhelmed often', 'Pretty steady', 'It varies a lot'].map((feeling) => (
                        <button
                          key={feeling}
                          onClick={() => setUserFeeling(feeling)}
                          className={`w-full py-3 px-4 rounded-2xl text-left transition-colors ${
                            userFeeling === feeling
                              ? 'bg-teal-50 text-gray-900'
                              : 'bg-white/40 text-gray-700 hover:bg-white/60'
                          }`}
                        >
                          {feeling}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Focus Mode Card */}
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 mb-8">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-base text-gray-900 mb-1">Focus mode</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        Limit your task list to 3 items. Helps reduce decision fatigue.
                      </p>
                    </div>
                    <button
                      onClick={() => setFocusMode(!focusMode)}
                      className={`relative w-14 h-8 rounded-full transition-colors ml-4 flex-shrink-0 ${
                        focusMode ? 'bg-teal-400' : 'bg-gray-300'
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
                  <p className="text-sm text-teal-500 mt-3">
                    On — I like this
                  </p>
                </div>

                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mb-8">
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                  <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                </div>

                {/* Continue Button */}
                <button
                  onClick={handleNext}
                  className="w-full py-4 bg-[#696A8E] hover:bg-[#5A5B78] text-white rounded-full font-medium transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 2: Plant Selection */}
            {currentStep === 2 && (
              <div className="px-6">
                {/* Title */}
                <h2 className="font-serif text-3xl text-gray-900 mb-2 italic">
                  Pick your first plant
                </h2>
                <p className="text-gray-400 text-sm mb-8">
                  It'll grow as you show up. No pressure.
                </p>

                {/* Plant Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {plants.map((plant) => (
                    <button
                      key={plant.id}
                      onClick={() => setSelectedPlant(plant.id)}
                      className={`relative bg-white/60 backdrop-blur-sm rounded-3xl p-6 transition-all ${
                        selectedPlant === plant.id
                          ? 'ring-2 ring-teal-400'
                          : 'hover:bg-white/80'
                      }`}
                    >
                      {selectedPlant === plant.id && (
                        <div className="absolute top-4 right-4 bg-teal-400 text-white text-xs px-3 py-1 rounded-full">
                          Selected
                        </div>
                      )}
                      
                      {/* Plant Image */}
                      <div className="flex justify-center mb-4">
                        <img
                          src={plant.image}
                          alt={plant.name}
                          className="pixelated w-20 h-20 object-contain"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>

                      {/* Plant Name */}
                      <p className="font-serif text-lg text-gray-900 mb-1 italic">
                        {plant.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {plant.subtitle}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mb-8">
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                  <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                </div>

                {/* Start Growing Button */}
                <button
                  onClick={handleNext}
                  className="w-full py-4 bg-[#696A8E] hover:bg-[#5A5B78] text-white rounded-full font-medium transition-colors"
                >
                  Start growing
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}