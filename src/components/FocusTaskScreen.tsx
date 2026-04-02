import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ChevronLeft, Sparkles } from 'lucide-react';
import type { Todo } from '../App';
import {
  CANOPY_PRIORITY_OPTIONS,
  type CanopyPriorityTag,
  canopyPriorityPickerClass,
  canopyPriorityPillClass,
} from '../lib/canopyPriorityTags';
import CanopyScreenBackground from './CanopyScreenBackground';

export type TimeChoice = 5 | 10 | 25 | 'open';

export interface FocusTaskScreenProps {
  todo: Todo;
  priorityTag?: CanopyPriorityTag;
  onClose: () => void;
  /** Called once when the user finishes from the celebration screen. Awards minute XP in the parent; parent should toggle the task if markTaskComplete and !todo.completed. */
  onSessionFinish: (payload: { totalSecondsFocused: number; markTaskComplete: boolean }) => void;
}

function segmentSeconds(mode: TimeChoice): number {
  if (mode === 'open') return 25 * 60;
  return mode * 60;
}

function formatClock(totalSeconds: number): string {
  const t = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const TIME_OPTIONS: { value: TimeChoice; label: string }[] = [
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 25, label: '25 min' },
  { value: 'open', label: 'Open-ended' },
];

export default function FocusTaskScreen({
  todo,
  priorityTag,
  onClose,
  onSessionFinish,
}: FocusTaskScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const [timeMode, setTimeMode] = useState<TimeChoice>(25);
  const [phase, setPhase] = useState<'idle' | 'running' | 'paused' | 'checkin' | 'complete'>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [nextCheckpoint, setNextCheckpoint] = useState(0);
  const [pendingMarkComplete, setPendingMarkComplete] = useState(false);
  const [secondsAtFinish, setSecondsAtFinish] = useState(0);
  const finishOnceRef = useRef(false);

  const seg = segmentSeconds(timeMode);

  const posInSegment = useMemo(() => {
    if (phase === 'idle') return 0;
    return Math.max(0, elapsedSeconds - (nextCheckpoint - seg));
  }, [phase, elapsedSeconds, nextCheckpoint, seg]);

  const segmentProgress = useMemo(() => {
    if (seg <= 0) return 0;
    return Math.min(1, posInSegment / seg);
  }, [posInSegment, seg]);

  useEffect(() => {
    if (phase !== 'running') return;
    const id = window.setInterval(() => {
      setElapsedSeconds((e) => e + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'running') return;
    if (elapsedSeconds <= 0) return;
    if (elapsedSeconds >= nextCheckpoint) {
      setPhase('checkin');
    }
  }, [phase, elapsedSeconds, nextCheckpoint]);

  const startSession = useCallback(() => {
    setElapsedSeconds(0);
    setNextCheckpoint(segmentSeconds(timeMode));
    setPhase('running');
  }, [timeMode]);

  const handleBack = () => {
    if (phase === 'complete') return;
    onClose();
  };

  const ringMetrics = useMemo(() => {
    const size = 248;
    const stroke = 16;
    const r = (size - stroke) / 2;
    const circumference = 2 * Math.PI * r;
    const offset = circumference * (1 - segmentProgress);
    return { size, stroke, r, circumference, offset };
  }, [segmentProgress]);

  const { size, stroke, r, circumference, offset } = ringMetrics;

  const minutesXp = Math.floor(secondsAtFinish / 60);
  const bonusXp = pendingMarkComplete && !todo.completed ? 10 : 0;
  const totalXpDisplay = minutesXp + bonusXp;

  const enterCelebration = (markTaskComplete: boolean) => {
    setSecondsAtFinish(elapsedSeconds);
    setPendingMarkComplete(markTaskComplete);
    setPhase('complete');
  };

  const handleCelebrationDone = () => {
    if (finishOnceRef.current) return;
    finishOnceRef.current = true;
    onSessionFinish({
      totalSecondsFocused: secondsAtFinish,
      markTaskComplete: pendingMarkComplete,
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex min-h-[100dvh] flex-col overflow-y-auto overscroll-y-contain text-[var(--text-strong)]"
      style={{
        paddingTop: 'max(env(safe-area-inset-top), 12px)',
      }}
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={
        prefersReducedMotion
          ? { duration: 0.2 }
          : { type: 'spring', damping: 30, stiffness: 320 }
      }
      role="dialog"
      aria-modal="true"
      aria-labelledby="focus-task-title"
    >
      <CanopyScreenBackground variant="default" />

      {phase === 'paused' && (
        <div
          className="pointer-events-none absolute inset-0 z-[14] bg-[var(--bg-overlay-dark-soft)]"
          aria-hidden
        />
      )}

      <div
        className={`relative z-[16] flex shrink-0 items-center px-2 pb-2 transition-opacity duration-500 ${
          phase === 'paused' ? 'opacity-75' : 'opacity-100'
        }`}
      >
        <button
          type="button"
          onClick={handleBack}
          disabled={phase === 'complete'}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface-base-90)] text-[var(--text-strong)] shadow-sm transition-colors hover:bg-[var(--surface-hover-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-accent-35)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
          aria-label="Exit focus mode"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>

      <h1
        id="focus-task-title"
        className="type-headline relative z-[16] mx-auto max-w-[min(22rem,100%)] px-6 text-center tracking-tight text-[var(--text-strong-alt)]"
      >
        {todo.text}
      </h1>

      {priorityTag && (
        <div className="relative z-[16] mx-auto mt-3 flex justify-center px-6">
          <span
            className={`type-label rounded-full px-3 py-1.5 ${canopyPriorityPillClass(priorityTag)}`}
          >
            {CANOPY_PRIORITY_OPTIONS.find((o) => o.id === priorityTag)?.label}
          </span>
        </div>
      )}

      {phase === 'idle' && (
        <>
          <div className="relative z-[16] mt-6 flex flex-wrap items-center justify-center gap-2 px-4">
            {TIME_OPTIONS.map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setTimeMode(opt.value)}
                className={`type-label rounded-full px-4 py-2.5 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-accent-35)] focus-visible:ring-offset-2 ${prefersReducedMotion ? '' : 'active:scale-[0.98]'} ${
                  timeMode === opt.value
                    ? canopyPriorityPickerClass('quick-win', true)
                    : `${canopyPriorityPickerClass('someday', false)} opacity-95`
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}

      <div
        className={`relative z-[16] mx-auto mt-6 flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-6 transition-opacity duration-500 ${
          phase === 'paused' ? 'opacity-90' : 'opacity-100'
        }`}
      >
        {(phase === 'running' || phase === 'checkin') && !prefersReducedMotion && (
          <motion.div
            className="pointer-events-none absolute rounded-full bg-[color:var(--accent-soft-fill)]/35"
            style={{ width: size + 40, height: size + 40 }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.28, 0.42, 0.28] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
        {(phase === 'running' || phase === 'checkin') && prefersReducedMotion && (
          <div
            className="pointer-events-none absolute rounded-full border border-[color:var(--accent-soft-border-5)]/30 bg-[color:var(--surface-card-subtle-8)]/20"
            style={{ width: size + 40, height: size + 40 }}
            aria-hidden
          />
        )}

        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} className="-rotate-90" aria-hidden>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="var(--surface-card-subtle-8)"
              strokeWidth={stroke}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="var(--accent-teal-deep)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={phase === 'idle' ? circumference : offset}
              className={
                prefersReducedMotion ? '' : 'transition-[stroke-dashoffset] duration-1000 ease-linear'
              }
            />
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-3">
            {phase !== 'idle' && phase !== 'complete' ? (
              <>
                <p className="type-caption mb-1 text-center text-[var(--text-body-muted-3)]">
                  You&apos;ve been focusing for...
                </p>
                <p
                  className="type-headline text-center tabular-nums tracking-tight text-[var(--text-strong-alt)]"
                  aria-live="polite"
                >
                  {formatClock(elapsedSeconds)}
                </p>
              </>
            ) : phase === 'idle' ? (
              <p className="type-caption text-center text-[var(--text-caption-2)]">Press start when you&apos;re ready</p>
            ) : null}
          </div>
        </div>

        <AnimatePresence>
          {phase === 'paused' && (
            <motion.div
              className="absolute inset-x-4 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center rounded-3xl bg-[var(--surface-base-75)] px-6 py-8 shadow-sm ring-1 ring-[var(--border-soft)] backdrop-blur-sm"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0.2 }
                  : { type: 'spring', damping: 28, stiffness: 320 }
              }
            >
              <p className="type-headline text-center italic text-[var(--text-body-muted)]">
                Rest is part of the process
              </p>
              <button
                type="button"
                onClick={() => setPhase('running')}
                className="type-body mt-6 h-12 w-full max-w-[16rem] rounded-full bg-[var(--accent-teal)] text-white transition-colors hover:bg-[var(--accent-teal-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-accent-40)] focus-visible:ring-offset-2"
              >
                Continue when you&apos;re ready
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase === 'checkin' && (
            <motion.div
              className="absolute inset-x-0 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-[35] mx-auto flex max-w-[min(22rem,100%)] flex-col gap-3 px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0.18 }
                  : { type: 'spring', damping: 32, stiffness: 340 }
              }
            >
              <p className="type-headline mb-1 text-center italic text-[var(--text-body)]">
                Hey, how&apos;s it going?
              </p>
              <button
                type="button"
                onClick={() => enterCelebration(true)}
                className="type-body min-h-[52px] w-full rounded-full bg-[var(--accent-teal)] text-white shadow-sm transition-colors hover:bg-[var(--accent-teal-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-accent-40)]"
              >
                All done ✓
              </button>
              <button
                type="button"
                onClick={() => {
                  setNextCheckpoint((c) => c + seg);
                  setPhase('running');
                }}
                className="type-body min-h-[52px] w-full rounded-full bg-[var(--surface-panel-input)] text-[var(--text-success-soft)] ring-1 ring-[var(--accent-soft-border-3)] transition-colors hover:bg-[var(--surface-panel-input-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--text-success-soft)]/25"
              >
                Still going 🌱
              </button>
              <button
                type="button"
                onClick={() => setPhase('paused')}
                className="type-body min-h-[52px] w-full rounded-full bg-[var(--surface-card-subtle-8)] text-[var(--text-body-muted)] ring-1 ring-[var(--accent-soft-border-4)] transition-colors hover:bg-[var(--surface-card-subtle-13)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-break)]"
              >
                Taking a break 🌿
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase === 'complete' && (
            <motion.div
              className="absolute inset-x-4 top-[12%] z-[50] flex flex-col items-center rounded-3xl bg-[var(--surface-base-90)] px-6 py-10 shadow-md ring-1 ring-[var(--border-soft)] backdrop-blur-md"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
              animate={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : {
                      opacity: 1,
                      scale: [1, 1.02, 1],
                    }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0.2 }
                  : { type: 'spring', damping: 26, stiffness: 280 }
              }
            >
              {prefersReducedMotion ? (
                <div className="mb-4 text-[var(--accent-teal)]" aria-hidden>
                  <Sparkles className="h-10 w-10" strokeWidth={1.25} />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: [0.7, 1, 0.85, 1], scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.1, ease: 'easeOut' }}
                  className="mb-4 text-[var(--accent-teal)]"
                  aria-hidden
                >
                  <Sparkles className="h-10 w-10" strokeWidth={1.25} />
                </motion.div>
              )}
              <p className="type-headline text-center text-[var(--text-strong-alt)]">
                You showed up. That&apos;s everything. 🌿
              </p>
              <p className="type-body mt-4 text-center text-[var(--text-body-muted)]">
                +{totalXpDisplay} pts for focusing
                {bonusXp > 0 ? <span className="type-caption block text-[var(--text-body-muted-3)]">including +10 for wrapping up the task</span> : null}
              </p>
              <button
                type="button"
                onClick={handleCelebrationDone}
                className="type-body mt-8 h-12 w-full max-w-[14rem] rounded-full bg-[var(--accent-teal)] text-white transition-colors hover:bg-[var(--accent-teal-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-accent-40)] focus-visible:ring-offset-2"
              >
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase === 'idle' && (
        <div className="relative z-[16] shrink-0 px-6" style={{ paddingBottom: `max(1.25rem, calc(env(safe-area-inset-bottom) + 1rem))` }}>
          <button
            type="button"
            onClick={startSession}
            className="type-body h-14 w-full rounded-full bg-[var(--accent-teal)] text-white shadow-none transition-colors duration-200 hover:bg-[var(--accent-teal-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-accent-45)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Start
          </button>
        </div>
      )}

    </motion.div>
  );
}
