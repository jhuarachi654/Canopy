import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Coffee } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { Todo } from '../App';

interface FocusTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (targetTime?: number) => void;
  todo: Todo | null;
}

export default function FocusTaskModal({ isOpen, onClose, onConfirm, todo }: FocusTaskModalProps) {
  const [targetTime, setTargetTime] = useState(25); // Default 25 minutes
  const [showTimeInput, setShowTimeInput] = useState(false);

  if (!isOpen || !todo) return null;

  const handleConfirm = () => {
    onConfirm(showTimeInput ? targetTime : undefined);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.2 }}
          className="mx-4 max-w-sm w-full rounded-[var(--radius-xl)] bg-[var(--surface-base)] p-[var(--space-6)] shadow-[var(--shadow-card-strong)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-[var(--space-4)]">
            <h2 className="font-serif text-xl text-[var(--text-strong-alt)] leading-none">
              Focus Task Mode
            </h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-full)] text-[var(--text-body-muted)] transition-all duration-150 ease-out hover:bg-[var(--surface-hover-panel)] hover:text-[var(--text-body)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)] active:scale-[0.97]"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          {/* Task Info */}
          <div className="mb-[var(--space-5)]">
            <p className="text-xs uppercase tracking-widest text-[var(--text-body-muted)] mb-[var(--space-2)]">Focusing on:</p>
            <div className="rounded-[var(--radius-md)] bg-[var(--surface-base-90)] py-[var(--space-3)] pr-[var(--space-3)]">
              <p className="text-base font-medium text-[var(--text-strong-alt)] leading-snug">
                {todo.text}
              </p>
            </div>
          </div>

          {/* Target Time Setting */}
          <div className="mb-[var(--space-5)]">
            <div className="flex items-center justify-between mb-[var(--space-3)]">
              <div className="flex items-center gap-[var(--space-2)]">
                <Clock className="h-4 w-4 text-[var(--text-body-muted)]" strokeWidth={2} />
                <span className="text-sm font-medium text-[var(--text-strong-alt)]">
                  Target Time
                </span>
              </div>
              <button
                onClick={() => setShowTimeInput(!showTimeInput)}
                className="text-sm text-[var(--accent-teal)] transition-all duration-150 ease-out hover:text-[var(--accent-teal-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-accent-35)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)] active:scale-[0.97]"
              >
                {showTimeInput ? 'Use default' : 'Set custom'}
              </button>
            </div>

            {showTimeInput ? (
              <div className="flex items-center gap-[var(--space-3)]">
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={targetTime}
                  onChange={(e) => setTargetTime(Math.max(1, Math.min(180, parseInt(e.target.value) || 25)))}
                  className="flex-1 h-10 px-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--surface-base)] text-[var(--text-strong-alt)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-teal)] focus:border-transparent transition-all duration-150 ease-out"
                />
                <span className="text-sm text-[var(--text-body-muted)]">minutes</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-[var(--space-2)]">
                <button
                  onClick={() => setTargetTime(15)}
                  className="px-[var(--space-3)] py-[var(--space-1)] rounded-[var(--radius-full)] border border-[var(--border-soft)] bg-[var(--surface-base)] text-sm text-[var(--text-body-muted)] hover:bg-[var(--surface-hover-panel)] hover:text-[var(--text-body)] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)] active:scale-[0.97]"
                >
                  15 min
                </button>
                <button
                  onClick={() => setTargetTime(25)}
                  className="px-[var(--space-3)] py-[var(--space-1)] rounded-[var(--radius-full)] border border-[var(--border-soft)] bg-[var(--surface-base)] text-sm text-[var(--text-body-muted)] hover:bg-[var(--surface-hover-panel)] hover:text-[var(--text-body)] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)] active:scale-[0.97]"
                >
                  25 min
                </button>
                <button
                  onClick={() => setTargetTime(45)}
                  className="px-[var(--space-3)] py-[var(--space-1)] rounded-[var(--radius-full)] border border-[var(--border-soft)] bg-[var(--surface-base)] text-sm text-[var(--text-body-muted)] hover:bg-[var(--surface-hover-panel)] hover:text-[var(--text-body)] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)] active:scale-[0.97]"
                >
                  45 min
                </button>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="mb-[var(--space-5)] space-y-[var(--space-2)]">
            <div className="flex items-center gap-[var(--space-2)] text-sm text-[var(--text-body-muted)]">
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent-teal)]" />
              <span>Work session timer with break options</span>
            </div>
            <div className="flex items-center gap-[var(--space-2)] text-sm text-[var(--text-body-muted)]">
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent-teal)]" />
              <span>Your garden plants will accompany you</span>
            </div>
            <div className="flex items-center gap-[var(--space-2)] text-sm text-[var(--text-body-muted)]">
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent-teal)]" />
              <span>No task switching - single task focus</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-[var(--space-3)]">
            <button
              onClick={onClose}
              className="flex-1 h-10 px-[var(--space-4)] rounded-[var(--radius-full)] border border-[var(--border-soft)] bg-[var(--surface-base)] text-[var(--text-strong-alt)] transition-all duration-150 ease-out hover:bg-[var(--surface-hover-panel)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)] active:scale-[0.97]"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 h-10 px-[var(--space-4)] rounded-[var(--radius-full)] bg-[var(--accent-teal)] text-white font-medium transition-all duration-150 ease-out hover:bg-[var(--accent-teal-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-accent-35)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)] active:scale-[0.97]"
            >
              Start Focus
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
