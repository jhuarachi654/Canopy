import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Todo, JournalEntry } from '../App';

interface TaskHistoryScreenProps {
  todos: Todo[];
  onRestoreTask: (id: string) => void;
  journalEntries?: JournalEntry[];
}

export default function TaskHistoryScreen({ 
  todos, 
  onRestoreTask,
  journalEntries
}: TaskHistoryScreenProps) {
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const QUOTES = [
    { text: 'Start where you are. Use what you have. Do what you can.', source: 'Arthur Ashe' },
    { text: "Believe you can and you're halfway there.", source: 'Theodore Roosevelt' },
    { text: 'You are never too old to set another goal or to dream a new dream.', source: 'C. S. Lewis' },
    { text: "It always seems impossible until it's done.", source: 'Nelson Mandela' },
    { text: 'Keep your face always toward the sunshine—and shadows will fall behind you.', source: 'Walt Whitman' },
    { text: 'Do what you can, with what you have, where you are.', source: 'Theodore Roosevelt' },
    { text: 'Success is the sum of small efforts, repeated day in and day out.', source: 'Robert Collier' },
    { text: 'Nothing is impossible. The word itself says “I’m possible!”', source: 'Audrey Hepburn' },
    { text: 'Act as if what you do makes a difference. It does.', source: 'William James' },
    { text: 'You miss 100% of the shots you don’t take.', source: 'Wayne Gretzky' },
  ];
  const today = new Date();
  const daySeed = Math.floor(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 86400000);
  const quoteIndex = daySeed % QUOTES.length;

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getJournalEntriesForMonth = () => {
    if (!journalEntries) return new Map<string, JournalEntry[]>();
    
    const { year, month } = getDaysInMonth(calendarMonth);
    const entriesMap = new Map<string, JournalEntry[]>();
    
    journalEntries.forEach(entry => {
      const entryDate = new Date(entry.createdAt);
      if (entryDate.getFullYear() === year && entryDate.getMonth() === month) {
        const dateString = getLocalDateString(entryDate);
        const existing = entriesMap.get(dateString) || [];
        entriesMap.set(dateString, [...existing, entry]);
      }
    });
    
    return entriesMap;
  };

  const getTasksForMonth = () => {
    const { year, month } = getDaysInMonth(calendarMonth);
    const tasksMap = new Map<string, Todo[]>();
    
    todos.forEach(todo => {
      // Check completed date
      if (todo.completedAt) {
        const completedDate = new Date(todo.completedAt);
        if (completedDate.getFullYear() === year && completedDate.getMonth() === month) {
          const dateString = getLocalDateString(completedDate);
          const existing = tasksMap.get(dateString) || [];
          tasksMap.set(dateString, [...existing, todo]);
        }
      }
    });
    
    return tasksMap;
  };

  const previousMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const isToday = (year: number, month: number, day: number) => {
    const today = new Date();
    return today.getFullYear() === year && 
           today.getMonth() === month && 
           today.getDate() === day;
  };

  const handleDateClick = (year: number, month: number, day: number) => {
    const clickedDate = new Date(year, month, day);
    setSelectedDate(clickedDate);
  };

  const handleDateHover = (year: number, month: number, day: number) => {
    const hoveredDate = new Date(year, month, day);
    setHoveredDate(hoveredDate);
  };

  const handleDateLeave = () => {
    setHoveredDate(null);
  };

  const getSelectedDateEntries = () => {
    if (!selectedDate) return { journal: [], tasks: [] };
    
    const dateString = getLocalDateString(selectedDate);
    const journalMap = getJournalEntriesForMonth();
    const tasksMap = getTasksForMonth();
    
    return {
      journal: journalMap.get(dateString) || [],
      tasks: tasksMap.get(dateString) || []
    };
  };

  const getHoveredDateEntries = () => {
    if (!hoveredDate) return { journal: [], tasks: [] };
    
    const dateString = getLocalDateString(hoveredDate);
    const journalMap = getJournalEntriesForMonth();
    const tasksMap = getTasksForMonth();
    
    return {
      journal: journalMap.get(dateString) || [],
      tasks: tasksMap.get(dateString) || []
    };
  };

  const formatDateHeader = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const selectedEntries = getSelectedDateEntries();
  const hoveredEntries = getHoveredDateEntries();
  const journalMap = getJournalEntriesForMonth();
  const tasksMap = getTasksForMonth();
  const selectedHasContent = selectedEntries.journal.length > 0 || selectedEntries.tasks.length > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="custom-scrollbar flex-1 overflow-y-auto overscroll-y-contain px-4 pb-24 pt-4">
        <h2 className="mb-3 text-xs uppercase tracking-widest text-gray-400">YOUR LOG</h2>
        {/* Header */}
        <h2 className="mb-0 font-serif text-[2.6rem] leading-none text-[var(--text-strong-alt)]">Log</h2>
        <p className="mb-6 mt-2 text-[14px] font-normal leading-[1.4] text-[var(--text-caption-2)]">Tap a date to revisit your day.</p>

        <div className="mb-6 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-base-85)] px-5 py-5 shadow-sm backdrop-blur-sm">
          <p className="mb-3 text-xs uppercase tracking-widest text-[var(--text-caption-2)]">Quote of the day</p>
          <motion.p
            key={quoteIndex}
            className="line-clamp-1 text-sm italic text-[var(--text-body-muted)]"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
          >
            {QUOTES[quoteIndex].text}
          </motion.p>
          <p className="mt-3 text-xs text-[var(--text-caption)]">Source: {QUOTES[quoteIndex].source}</p>
        </div>

        {/* Calendar Card */}
        <div className="mb-6 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-base-90)] px-5 py-5 shadow-sm backdrop-blur-sm">
          {/* Month Navigation */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={previousMonth}
              className="rounded-full p-2 transition-all duration-150 ease-out hover:bg-[var(--surface-hover-panel-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base-90)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5 text-[var(--text-caption-2)]" />
            </button>
            <h3 className="text-lg font-serif text-[var(--text-strong-alt)]">
              {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={nextMonth}
              className="rounded-full p-2 transition-all duration-150 ease-out hover:bg-[var(--surface-hover-panel-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base-90)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5 text-[var(--text-caption-2)]" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="pb-3 text-center text-sm font-light text-[var(--text-caption-2)]">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {(() => {
              const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(calendarMonth);
              const days = [];
              
              // Empty cells for days before month starts
              for (let i = 0; i < startingDayOfWeek; i++) {
                days.push(<div key={`empty-${i}`} className="aspect-square" />);
              }
              
              // Actual day cells
              for (let day = 1; day <= daysInMonth; day++) {
                const dateString = getLocalDateString(new Date(year, month, day));
                const hasJournal = journalMap.has(dateString);
                const hasTasks = tasksMap.has(dateString);
                const today = isToday(year, month, day);
                const isSelected = selectedDate && 
                  selectedDate.getFullYear() === year &&
                  selectedDate.getMonth() === month &&
                  selectedDate.getDate() === day;

                // Brand: journal uses the canopy pill accent; tasks use the teal completion accent.
                const journalDotClass = today
                  ? 'bg-[var(--surface-panel-track)] ring-1 ring-[color:var(--accent-pill)]/55'
                  : isSelected
                    ? 'bg-[var(--accent-pill-dark)]'
                    : 'bg-[var(--accent-pill)]';
                const taskDotClass = today
                  ? 'bg-teal-100 ring-1 ring-teal-300/90'
                  : isSelected
                    ? 'bg-teal-700'
                    : 'bg-teal-600';
                
                days.push(
                  <button
                    key={day}
                    onClick={() => handleDateClick(year, month, day)}
                    onMouseEnter={() => handleDateHover(year, month, day)}
                    onMouseLeave={handleDateLeave}
                    className={`
                      aspect-square rounded-full flex flex-col items-center justify-center relative
                      transition-all duration-150 ease-out font-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-accent-35)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base-90)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40
                      ${today 
                        ? isSelected 
                          ? 'bg-teal-500 text-white ring-2 ring-teal-300' 
                          : 'bg-teal-500 text-white'
                        : isSelected
                          ? 'bg-[var(--surface-hover-panel-muted)] ring-2 ring-[color:var(--accent-pill)]/45'
                          : 'hover:bg-[var(--surface-hover-panel-muted-50)]'
                      }
                      ${!today && !isSelected ? 'text-[var(--text-strong-alt)]' : ''}
                    `}
                  >
                    <span className={`text-sm ${today || isSelected ? '' : ''}`}>
                      {day}
                    </span>
                    
                    {/* Dot indicators: journal (brand) vs completed tasks (teal) */}
                    {(hasJournal || hasTasks) && (
                      <div className="absolute bottom-1 flex gap-0.5">
                        {hasJournal && (
                          <div title="Journal" className={`w-1 h-1 rounded-full ${journalDotClass}`} />
                        )}
                        {hasTasks && (
                          <div title="Tasks" className={`w-1 h-1 rounded-full ${taskDotClass}`} />
                        )}
                      </div>
                    )}
                  </button>
                );
              }
              
              return days;
            })()}
          </div>

          {/* Selected Date Preview */}
          {selectedDate && selectedHasContent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-100"
            >
              <p className="text-sm text-gray-500 mb-3">
                {formatDateHeader(selectedDate)}
              </p>
              
              {selectedEntries.journal.length > 0 && (
                <div className="mb-4">
                  <p className="mb-3 text-xs font-light uppercase tracking-wider text-[var(--accent-pill)]">Journal</p>
                  {selectedEntries.journal.map((entry, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      {entry.prompt && (
                        <p className="mb-1 font-serif text-sm italic text-[var(--text-caption-2)]">
                          {entry.prompt}
                        </p>
                      )}
                      <p className="mb-2 text-sm text-[var(--text-strong-alt)]">
                        {entry.response}
                      </p>
                      {entry.photoUrl && (
                        <div 
                          className="relative bg-white p-2 shadow-md inline-block mt-2"
                          style={{
                            maxWidth: '150px',
                          }}
                        >
                          <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                            <img
                              src={entry.photoUrl}
                              alt="Journal entry photo"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {selectedEntries.tasks.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-teal-700 mb-2">Tasks</p>
                  {selectedEntries.tasks.map((task, index) => (
                    <p key={index} className="text-sm text-teal-900/90 mb-1">
                      • {task.text}
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Hovered Date Preview - Only show when nothing is selected */}
          {!selectedDate && hoveredDate && (hoveredEntries.journal.length > 0 || hoveredEntries.tasks.length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-100"
            >
              <p className="text-sm text-gray-500 mb-3">
                {formatDateHeader(hoveredDate)}
              </p>
              
              {hoveredEntries.journal.length > 0 && (
                <div className="mb-4">
                  <p className="mb-3 text-xs font-light uppercase tracking-wider text-[var(--accent-pill)]">Journal</p>
                  {hoveredEntries.journal.map((entry, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      {entry.prompt && (
                        <p className="mb-1 font-serif text-sm italic text-[var(--text-caption-2)]">
                          {entry.prompt}
                        </p>
                      )}
                      <p className="mb-2 line-clamp-2 text-sm text-[var(--text-strong-alt)]">
                        {entry.response}
                      </p>
                      {entry.photoUrl && (
                        <div 
                          className="relative bg-white p-2 shadow-md inline-block mt-2"
                          style={{
                            maxWidth: '150px',
                          }}
                        >
                          <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                            <img
                              src={entry.photoUrl}
                              alt="Journal entry photo"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {hoveredEntries.tasks.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-teal-700 mb-2">Tasks</p>
                  {hoveredEntries.tasks.map((task, index) => (
                    <p key={index} className="text-sm text-teal-900/90 mb-1">
                      • {task.text}
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Legend */}
          <div className="mt-6 flex items-center gap-4 border-t border-[var(--border-soft-panel-2)] pt-4 text-xs font-light">
            <div className="flex items-center gap-1.5 text-teal-800">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />
              <span>tasks</span>
            </div>
            <div className="flex items-center gap-1.5 text-[var(--accent-pill)]">
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent-pill)]" />
              <span>journal</span>
            </div>
          </div>
          
          
        </div>
      </div>
    </div>
  );
}
