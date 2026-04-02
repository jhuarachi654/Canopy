import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import type { JournalEntry } from '../App';
import CanopyScreenBackground from './CanopyScreenBackground';

interface JournalEntryDetailViewProps {
  entries: JournalEntry[];
  selectedDate: string;
  onClose: () => void;
}

export default function JournalEntryDetailView({
  entries,
  selectedDate,
  onClose,
}: JournalEntryDetailViewProps) {
  // Filter and sort entries by date
  const sortedEntries = entries
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Find the initial entry for the selected date
  useEffect(() => {
    const index = sortedEntries.findIndex(entry => {
      const entryDate = new Date(entry.createdAt).toISOString().split('T')[0];
      return entryDate === selectedDate;
    });
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [selectedDate, sortedEntries]);

  const currentEntry = sortedEntries[currentIndex];

  const navigatePrevious = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const navigateNext = () => {
    if (currentIndex < sortedEntries.length - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      navigatePrevious();
    } else if (info.offset.x < -threshold) {
      navigateNext();
    }
  };

  if (!currentEntry) {
    return null;
  }

  const entryDate = new Date(currentEntry.createdAt);
  const formattedDate = entryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = entryDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  // Animation variants for swipe transitions
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-screen-auth)] overflow-y-auto overscroll-y-contain">
      <CanopyScreenBackground variant="journal" />
      {/* Header */}
      <div className="relative z-10 flex-shrink-0 px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <motion.button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-[var(--text-strong-alt)] transition-all duration-150 ease-out hover:text-[var(--text-caption-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-screen-auth)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
            whileTap={{ scale: 0.97 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="type-body">Back</span>
          </motion.button>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={navigatePrevious}
              disabled={currentIndex === 0}
              className="text-[var(--text-strong-alt)] transition-all duration-150 ease-out hover:text-[var(--text-caption-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-screen-auth)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="type-label text-[var(--text-caption-2)]">
              {currentIndex + 1} / {sortedEntries.length}
            </span>
            <button
              type="button"
              onClick={navigateNext}
              disabled={currentIndex === sortedEntries.length - 1}
              className="text-[var(--text-strong-alt)] transition-all duration-150 ease-out hover:text-[var(--text-caption-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-screen-auth)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Date Header */}
        <div className="text-center">
          <h1 className="type-headline mb-1 text-[var(--text-strong-alt)]">{formattedDate}</h1>
          <p className="type-caption text-[var(--text-caption-2)]">{formattedTime}</p>
        </div>
      </div>

      {/* Entry Content - Swipeable */}
      <div
        className="relative z-10 flex-1 overflow-hidden px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={currentEntry.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="h-full flex flex-col"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm p-6 flex-1 overflow-y-auto custom-scrollbar">
              {/* Mood indicator if available */}
              {currentEntry.mood && (
                <div className="mb-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#EBE8F4] rounded-full">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        currentEntry.mood === 'good'
                          ? 'bg-green-400'
                          : currentEntry.mood === 'okay'
                          ? 'bg-yellow-400'
                          : 'bg-purple-400'
                      }`}
                    />
                    <span className="type-caption capitalize text-[var(--text-strong-alt)]">
                      {currentEntry.mood}
                    </span>
                  </div>
                </div>
              )}

              {/* Prompt */}
              {currentEntry.prompt && (
                <div className="mb-4 border-b border-[#EBE8F4] pb-4">
                  <p className="type-label mb-1 uppercase tracking-wider text-[var(--text-caption-2)]">
                    Prompt
                  </p>
                  <p className="type-body italic text-[var(--text-strong-alt)]">
                    {currentEntry.prompt}
                  </p>
                </div>
              )}

              {/* Photo if available */}
              {currentEntry.photoUrl && (
                <div className="mb-6">
                  <div className="bg-white p-3 shadow-md rounded-2xl">
                    <img
                      src={currentEntry.photoUrl}
                      alt="Journal entry"
                      className="w-full rounded-lg object-cover"
                      style={{ maxHeight: '300px' }}
                    />
                  </div>
                </div>
              )}

              {/* Response */}
              <div>
                <p className="type-label mb-2 uppercase tracking-wider text-[var(--text-caption-2)]">
                  {currentEntry.prompt ? 'Your reflection' : 'Entry'}
                </p>
                <p className="type-body whitespace-pre-wrap text-[var(--text-strong-alt)]">
                  {currentEntry.response}
                </p>
              </div>

              {/* Weekly prompt indicator */}
              {currentEntry.isWeeklyPrompt && (
                <div className="mt-6 pt-4 border-t border-[#EBE8F4]">
                  <span className="type-caption inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#A8C5DA] to-[#8B86A3] px-3 py-1 text-white">
                    ✨ Weekly Reflection
                  </span>
                </div>
              )}
            </div>

            {/* Swipe hint */}
            <div className="type-caption mt-4 text-center text-[#8B86A3]">
              Swipe left or right to navigate entries
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
