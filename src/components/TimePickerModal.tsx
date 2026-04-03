import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (time: string) => void;
  initialTime?: string; // Format: HH:mm (24-hour)
}

const TimePickerModal: React.FC<TimePickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialTime = '09:00',
}) => {
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');

  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);
  const ampmRef = useRef<HTMLDivElement>(null);

  const itemHeight = 40; // Height of each scroll item

  useEffect(() => {
    if (isOpen) {
      const [hourStr, minuteStr] = initialTime.split(':');
      let hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      let initialAmpm: 'AM' | 'PM' = 'AM';
      if (hour >= 12) {
        initialAmpm = 'PM';
        if (hour > 12) hour -= 12;
      }
      if (hour === 0) hour = 12; // 00:xx is 12 AM

      setSelectedHour(hour);
      setSelectedMinute(minute);
      setAmpm(initialAmpm);

      // Scroll to initial positions
      setTimeout(() => {
        if (hourRef.current) {
          hourRef.current.scrollTop = (hour - 1) * itemHeight - itemHeight * 2; // Center the initial value
        }
        if (minuteRef.current) {
          minuteRef.current.scrollTop = minute * itemHeight - itemHeight * 2; // Center the initial value
        }
        if (ampmRef.current) {
          ampmRef.current.scrollTop = (initialAmpm === 'PM' ? 1 : 0) * itemHeight - itemHeight * 2; // Center the initial value
        }
      }, 0);
    }
  }, [isOpen, initialTime]);

  const handleScroll = useCallback((ref: React.RefObject<HTMLDivElement>, setter: (value: number | 'AM' | 'PM') => void, type: 'hour' | 'minute' | 'ampm') => {
    if (ref.current) {
      const scrollTop = ref.current.scrollTop;
      const index = Math.round(scrollTop / itemHeight);
      let value;
      if (type === 'hour') {
        value = (index % 12) + 1;
        if (value === 0) value = 12; // Handle 12
      } else if (type === 'minute') {
        value = index % 60;
      } else { // ampm
        value = index % 2 === 0 ? 'AM' : 'PM';
      }
      setter(value);
    }
  }, []);

  const handleSet = () => {
    let hour24 = selectedHour;
    if (ampm === 'PM' && selectedHour !== 12) {
      hour24 += 12;
    } else if (ampm === 'AM' && selectedHour === 12) {
      hour24 = 0;
    }
    const timeString = `${hour24.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    onSelect(timeString);
    onClose();
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const ampmOptions = ['AM', 'PM'];

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-black/50"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[301] rounded-t-3xl bg-[var(--surface-base)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border-soft)] p-4">
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--accent-teal)] text-sm font-medium"
          >
            Cancel
          </button>
          <h3 className="text-lg font-medium text-[var(--text-strong-alt)]">Select Time</h3>
          <button
            type="button"
            onClick={handleSet}
            className="text-[var(--accent-teal)] text-sm font-medium"
          >
            Set
          </button>
        </div>

        <div className="flex justify-center p-8">
          <div className="flex gap-4">
            {/* Hours */}
            <div className="relative h-64 w-20">
              <div className="absolute inset-x-0 top-1/2 h-12 -translate-y-1/2 border-y border-[var(--border-soft)] bg-[var(--surface-base-90)]" />
              <div
                ref={hourRef}
                className="h-full overflow-y-auto scrollbar-hide"
                onScroll={() => handleScroll(hourRef, setSelectedHour, 'hour')}
              >
                <div style={{ height: hours.length * itemHeight + itemHeight * 4 }}>
                  {Array.from({ length: 2 }, () => hours).flat().map((hour, index) => (
                    <div
                      key={`hour-${index}`}
                      className="flex items-center justify-center text-lg"
                      style={{ height: itemHeight }}
                    >
                      <span className={hour === selectedHour ? 'text-[var(--text-strong-alt)] font-medium' : 'text-[var(--text-caption-2)]'}>
                        {hour}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Minutes */}
            <div className="relative h-64 w-20">
              <div className="absolute inset-x-0 top-1/2 h-12 -translate-y-1/2 border-y border-[var(--border-soft)] bg-[var(--surface-base-90)]" />
              <div
                ref={minuteRef}
                className="h-full overflow-y-auto scrollbar-hide"
                onScroll={() => handleScroll(minuteRef, setSelectedMinute, 'minute')}
              >
                <div style={{ height: minutes.length * itemHeight + itemHeight * 4 }}>
                  {Array.from({ length: 2 }, () => minutes).flat().map((minute, index) => (
                    <div
                      key={`minute-${index}`}
                      className="flex items-center justify-center text-lg"
                      style={{ height: itemHeight }}
                    >
                      <span className={minute === selectedMinute ? 'text-[var(--text-strong-alt)] font-medium' : 'text-[var(--text-caption-2)]'}>
                        {minute.toString().padStart(2, '0')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AM/PM */}
            <div className="relative h-64 w-20">
              <div className="absolute inset-x-0 top-1/2 h-12 -translate-y-1/2 border-y border-[var(--border-soft)] bg-[var(--surface-base-90)]" />
              <div
                ref={ampmRef}
                className="h-full overflow-y-auto scrollbar-hide"
                onScroll={() => handleScroll(ampmRef, setAmpm, 'ampm')}
              >
                <div style={{ height: ampmOptions.length * itemHeight + itemHeight * 4 }}>
                  {Array.from({ length: 8 }, () => ampmOptions).flat().map((period, index) => (
                    <div
                      key={`ampm-${index}`}
                      className="flex items-center justify-center text-lg"
                      style={{ height: itemHeight }}
                    >
                      <span className={period === ampm ? 'text-[var(--text-strong-alt)] font-medium' : 'text-[var(--text-caption-2)]'}>
                        {period}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default TimePickerModal;
