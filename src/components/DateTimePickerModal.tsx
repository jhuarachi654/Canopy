import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';

interface DateTimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (dateTime: { date: string; time: string; display: string }) => void;
  initialDateTime?: { date: string; time: string };
}

const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialDateTime,
}) => {
  const [dateSelectedIndex, setDateSelectedIndex] = useState(1);
  const [hourSelectedIndex, setHourSelectedIndex] = useState(4);
  const [minuteSelectedIndex, setMinuteSelectedIndex] = useState(30);
  const [ampmSelectedIndex, setAmpmSelectedIndex] = useState(1); // 0 = AM, 1 = PM

  const dateScrollRef = useRef<HTMLDivElement>(null);
  const hourScrollRef = useRef<HTMLDivElement>(null);
  const minuteScrollRef = useRef<HTMLDivElement>(null);
  const ampmScrollRef = useRef<HTMLDivElement>(null);

  const itemHeight = 40;

  // Generate date options
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    dates.push('Yesterday');

    // Today
    dates.push('Today');

    // Tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    dates.push('Tomorrow');

    // Next 30 days
    for (let i = 2; i <= 30; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + i);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dateStr = `${dayNames[futureDate.getDay()]} ${monthNames[futureDate.getMonth()]} ${futureDate.getDate()}`;
      dates.push(dateStr);
    }

    return dates;
  };

  const dateOptions = generateDateOptions();
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const ampmOptions = ['AM', 'PM'];

  // Initialize from initialDateTime
  useEffect(() => {
    if (isOpen && initialDateTime) {
      const initialDate = new Date(initialDateTime.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      initialDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((initialDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === -1) setDateSelectedIndex(0);
      else if (diffDays === 0) setDateSelectedIndex(1);
      else if (diffDays === 1) setDateSelectedIndex(2);
      else setDateSelectedIndex(Math.min(diffDays + 2, dateOptions.length - 1));

      const [hourStr, minuteStr] = initialDateTime.time.split(':');
      let hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      let initialAmpm: 'AM' | 'PM' = 'AM';
      if (hour >= 12) {
        initialAmpm = 'PM';
        if (hour > 12) hour -= 12;
      }
      if (hour === 0) hour = 12;

      setHourSelectedIndex(hour - 1);
      setMinuteSelectedIndex(minute);
      setAmpmSelectedIndex(initialAmpm === 'AM' ? 0 : 1);
    } else if (isOpen) {
      setDateSelectedIndex(1);
      setHourSelectedIndex(4);
      setMinuteSelectedIndex(30);
      setAmpmSelectedIndex(1); // PM
    }
  }, [isOpen, initialDateTime, dateOptions.length]);

  // Scroll to selected positions
  useEffect(() => {
    if (!isOpen) return;

    const scrollToPositions = () => {
      if (dateScrollRef.current) {
        dateScrollRef.current.scrollTop = dateSelectedIndex * itemHeight;
      }
      if (hourScrollRef.current) {
        hourScrollRef.current.scrollTop = hourSelectedIndex * itemHeight;
      }
      if (minuteScrollRef.current) {
        minuteScrollRef.current.scrollTop = minuteSelectedIndex * itemHeight;
      }
      if (ampmScrollRef.current) {
        ampmScrollRef.current.scrollTop = ampmSelectedIndex * itemHeight;
      }
    };

    const timeoutId = setTimeout(scrollToPositions, 100);
    return () => clearTimeout(timeoutId);
  }, [isOpen, dateSelectedIndex, hourSelectedIndex, minuteSelectedIndex, ampmSelectedIndex]);

  // Handle scroll with debouncing
  const handleScroll = useCallback((ref: React.RefObject<HTMLDivElement>, setSelectedIndex: (index: number) => void, maxIndex: number) => {
    if (!ref.current) return;

    const scrollTop = ref.current.scrollTop;
    const newIndex = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(newIndex, maxIndex));
    
    setSelectedIndex(clampedIndex);
  }, []);

  // Debounced scroll handlers
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleDateScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handleScroll(dateScrollRef, setDateSelectedIndex, dateOptions.length - 1), 100);
    };

    const handleHourScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handleScroll(hourScrollRef, setHourSelectedIndex, hours.length - 1), 100);
    };

    const handleMinuteScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handleScroll(minuteScrollRef, setMinuteSelectedIndex, minutes.length - 1), 100);
    };

    const handleAmpmScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handleScroll(ampmScrollRef, setAmpmSelectedIndex, ampmOptions.length - 1), 100);
    };

    const dateRef = dateScrollRef.current;
    const hourRef = hourScrollRef.current;
    const minuteRef = minuteScrollRef.current;
    const ampmRef = ampmScrollRef.current;

    if (dateRef) dateRef.addEventListener('scroll', handleDateScroll, { passive: true });
    if (hourRef) hourRef.addEventListener('scroll', handleHourScroll, { passive: true });
    if (minuteRef) minuteRef.addEventListener('scroll', handleMinuteScroll, { passive: true });
    if (ampmRef) ampmRef.addEventListener('scroll', handleAmpmScroll, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      if (dateRef) dateRef.removeEventListener('scroll', handleDateScroll);
      if (hourRef) hourRef.removeEventListener('scroll', handleHourScroll);
      if (minuteRef) minuteRef.removeEventListener('scroll', handleMinuteScroll);
      if (ampmRef) ampmRef.removeEventListener('scroll', handleAmpmScroll);
    };
  }, [handleScroll, dateOptions.length, hours.length, minutes.length, ampmOptions.length]);

  // Simple style based on selectedIndex - this will work
  const getItemStyle = (itemIndex: number, selectedIndex: number) => {
    const distance = Math.abs(itemIndex - selectedIndex);
    
    if (distance === 0) {
      return { opacity: 1, fontWeight: '600', fontSize: '26px' };
    } else if (distance === 1) {
      return { opacity: 0.5, fontWeight: '400', fontSize: '17px' };
    } else if (distance === 2) {
      return { opacity: 0.25, fontWeight: '400', fontSize: '15px' };
    } else {
      return { opacity: 0.1, fontWeight: '400', fontSize: '15px' };
    }
  };

  // Add scroll position state for real-time updates
  const [scrollPositions, setScrollPositions] = useState({
    date: 0,
    hour: 0,
    minute: 0,
    ampm: 0
  });

  // Real-time scroll listeners for visual feedback
  useEffect(() => {
    const handleDateScroll = () => {
      if (dateScrollRef.current) {
        setScrollPositions(prev => ({ ...prev, date: dateScrollRef.current!.scrollTop }));
      }
    };

    const handleHourScroll = () => {
      if (hourScrollRef.current) {
        setScrollPositions(prev => ({ ...prev, hour: hourScrollRef.current!.scrollTop }));
      }
    };

    const handleMinuteScroll = () => {
      if (minuteScrollRef.current) {
        setScrollPositions(prev => ({ ...prev, minute: minuteScrollRef.current!.scrollTop }));
      }
    };

    const handleAmpmScroll = () => {
      if (ampmScrollRef.current) {
        setScrollPositions(prev => ({ ...prev, ampm: ampmScrollRef.current!.scrollTop }));
      }
    };

    const dateRef = dateScrollRef.current;
    const hourRef = hourScrollRef.current;
    const minuteRef = minuteScrollRef.current;
    const ampmRef = ampmScrollRef.current;

    if (dateRef) dateRef.addEventListener('scroll', handleDateScroll, { passive: true });
    if (hourRef) hourRef.addEventListener('scroll', handleHourScroll, { passive: true });
    if (minuteRef) minuteRef.addEventListener('scroll', handleMinuteScroll, { passive: true });
    if (ampmRef) ampmRef.addEventListener('scroll', handleAmpmScroll, { passive: true });

    return () => {
      if (dateRef) dateRef.removeEventListener('scroll', handleDateScroll);
      if (hourRef) hourRef.removeEventListener('scroll', handleHourScroll);
      if (minuteRef) minuteRef.removeEventListener('scroll', handleMinuteScroll);
      if (ampmRef) ampmRef.removeEventListener('scroll', handleAmpmScroll);
    };
  }, []);

  const handleSet = () => {
    const selectedDate = dateOptions[dateSelectedIndex];
    const selectedHour = hours[hourSelectedIndex];
    const selectedMinute = minutes[minuteSelectedIndex];
    const selectedAmpm = ampmOptions[ampmSelectedIndex];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const actualDate = new Date(today);
    actualDate.setDate(actualDate.getDate() + (dateSelectedIndex - 1));

    let hour24 = selectedHour;
    if (selectedAmpm === 'PM' && selectedHour !== 12) {
      hour24 += 12;
    } else if (selectedAmpm === 'AM' && selectedHour === 12) {
      hour24 = 0;
    }

    const timeString = `${hour24.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    const dateString = actualDate.toISOString().split('T')[0];

    let displayString = selectedDate;
    if (dateSelectedIndex === 1) displayString = 'Today';
    else if (dateSelectedIndex === 0) displayString = 'Yesterday';
    else if (dateSelectedIndex === 2) displayString = 'Tomorrow';

    displayString += `, ${selectedHour}:${selectedMinute.toString().padStart(2, '0')} ${selectedAmpm}`;

    onSelect({
      date: dateString,
      time: timeString,
      display: displayString,
    });
    onClose();
  };

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
      <div
        className="fixed bottom-0 left-0 right-0 z-[301] rounded-t-3xl bg-[var(--surface-base)] touch-manipulation animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-12 rounded-full bg-[var(--border-soft)]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--accent-teal)] text-sm font-medium"
          >
            Cancel
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={handleSet}
            className="text-[var(--accent-teal)] text-sm font-medium"
          >
            Set
          </button>
        </div>

        {/* Drum Pickers */}
        <div className="relative flex justify-center px-4 pb-8">
          <div className="flex gap-2">
            {/* Date Column */}
            <div className="relative h-64 w-40">
              <div
                ref={dateScrollRef}
                className="h-full overflow-y-auto scrollbar-hide touch-manipulation"
                style={{ 
                  scrollSnapType: 'y mandatory',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                <div style={{ height: dateOptions.length * itemHeight + 200 }}>
                  {dateOptions.map((date, index) => (
                    <div
                      key={date}
                      className="flex items-center justify-center px-2"
                      style={{ 
                        height: itemHeight,
                        scrollSnapAlign: 'center',
                        marginTop: index === 0 ? '100px' : undefined,
                        marginBottom: index === dateOptions.length - 1 ? '100px' : undefined,
                        ...getItemStyle(index, dateSelectedIndex),
                        color: 'var(--text-strong-alt)'
                      }}
                    >
                      <span className="text-center">{date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hour Column */}
            <div className="relative h-64 w-16">
              <div
                ref={hourScrollRef}
                className="h-full overflow-y-auto scrollbar-hide touch-manipulation"
                style={{ 
                  scrollSnapType: 'y mandatory',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                <div style={{ height: hours.length * itemHeight + 200 }}>
                  {hours.map((hour, index) => (
                    <div
                      key={hour}
                      className="flex items-center justify-center"
                      style={{ 
                        height: itemHeight,
                        scrollSnapAlign: 'center',
                        marginTop: index === 0 ? '100px' : undefined,
                        marginBottom: index === hours.length - 1 ? '100px' : undefined,
                        ...getItemStyle(index, hourSelectedIndex),
                        color: 'var(--text-strong-alt)'
                      }}
                    >
                      <span>{hour}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Minute Column */}
            <div className="relative h-64 w-16">
              <div
                ref={minuteScrollRef}
                className="h-full overflow-y-auto scrollbar-hide touch-manipulation"
                style={{ 
                  scrollSnapType: 'y mandatory',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                <div style={{ height: minutes.length * itemHeight + 200 }}>
                  {minutes.map((minute, index) => (
                    <div
                      key={minute}
                      className="flex items-center justify-center"
                      style={{ 
                        height: itemHeight,
                        scrollSnapAlign: 'center',
                        marginTop: index === 0 ? '100px' : undefined,
                        marginBottom: index === minutes.length - 1 ? '100px' : undefined,
                        ...getItemStyle(index, minuteSelectedIndex),
                        color: 'var(--text-strong-alt)'
                      }}
                    >
                      <span>{minute.toString().padStart(2, '0')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AM/PM Column */}
            <div className="relative h-64 w-16">
              <div
                ref={ampmScrollRef}
                className="h-full overflow-y-auto scrollbar-hide touch-manipulation"
                style={{ 
                  scrollSnapType: 'y mandatory',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                <div style={{ height: ampmOptions.length * itemHeight + 200 }}>
                  {ampmOptions.map((ampm, index) => (
                    <div
                      key={ampm}
                      className="flex items-center justify-center"
                      style={{ 
                        height: itemHeight,
                        scrollSnapAlign: 'center',
                        marginTop: index === 0 ? '100px' : undefined,
                        marginBottom: index === ampmOptions.length - 1 ? '100px' : undefined,
                        ...getItemStyle(index, ampmSelectedIndex),
                        color: 'var(--text-strong-alt)'
                      }}
                    >
                      <span>{ampm}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default DateTimePickerModal;
