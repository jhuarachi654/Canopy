import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar, List } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  
  // Compact calendar state
  const [visibleDates, setVisibleDates] = useState<Date[]>([]);
  const [expandedJournal, setExpandedJournal] = useState<Set<string>>(new Set());

  // Initialize visible dates and reset to today
  React.useEffect(() => {
    initializeVisibleDates();
    // Always reset to today when component mounts
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setSelectedDate(today);
  }, []);

  const initializeVisibleDates = () => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Start from today and go forward 14 days
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(new Date(date));
    }
    setVisibleDates(dates);
  };

  // Helper functions for compact calendar
  const getEntriesForDate = (date: Date) => {
    const dateString = getLocalDateString(date);
    const dayTasks = todos.filter(todo => {
      if (!todo.completedAt && !todo.createdAt) return false;
      const taskDate = todo.completedAt 
        ? new Date(todo.completedAt).toISOString().split('T')[0]
        : new Date(todo.createdAt).toISOString().split('T')[0];
      return taskDate === dateString;
    });
    
    const dayJournal = journalEntries?.filter(entry => {
      const entryDate = new Date(entry.createdAt).toISOString().split('T')[0];
      return entryDate === dateString;
    }) || [];

    return { tasks: dayTasks, journal: dayJournal };
  };

  const formatDateForSelector = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (getLocalDateString(date) === getLocalDateString(today)) {
      return 'Today';
    } else if (getLocalDateString(date) === getLocalDateString(yesterday)) {
      return 'Yesterday';
    } else if (getLocalDateString(date) === getLocalDateString(tomorrow)) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatDateHeader = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (getLocalDateString(date) === getLocalDateString(today)) {
      return 'Today';
    } else if (getLocalDateString(date) === getLocalDateString(yesterday)) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const toggleJournalExpansion = (entryId: string) => {
    setExpandedJournal(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const truncateText = (text: string, maxLines: number = 3) => {
    const lines = text.split('\n');
    if (lines.length <= maxLines) return text;
    return lines.slice(0, maxLines).join('\n') + '...';
  };

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

  // List view helper functions
  const getLastSevenDays = () => {
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push(date);
    }
    return days;
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

  const selectedEntries = getSelectedDateEntries();
  const hoveredEntries = getHoveredDateEntries();
  const journalMap = getJournalEntriesForMonth();
  const tasksMap = getTasksForMonth();
  const selectedHasContent = selectedEntries.journal.length > 0 || selectedEntries.tasks.length > 0;

  return (
    <div className="flex flex-col" style={{ height: '100dvh', minHeight: '100dvh' }}>
      <div className="custom-scrollbar flex-1 overflow-y-auto overscroll-y-contain px-4 pb-24 pt-6" style={{ minHeight: 0 }}>
        <h2 className="mb-3 text-xs uppercase tracking-widest text-[var(--text-body-muted-2)]">YOUR LOG</h2>
        {/* Header */}
        <h2 className="mb-0 mt-1 font-serif text-[2.6rem] leading-none text-gray-900">Log</h2>
        <p className="mb-6 mt-2 text-[14px] font-normal leading-[1.4] text-[var(--text-caption-2)]">Tap a date to revisit your day.</p>

        <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--surface-base)] p-[var(--space-4)] shadow-[var(--shadow-card-soft)]">
          <p className="mb-3 text-xs uppercase tracking-widest text-[var(--text-body-muted-2)]">Quote of the day</p>
          <motion.p
            key={quoteIndex}
            className="text-sm italic text-[var(--text-body-muted)]"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
          >
            {QUOTES[quoteIndex].text}
          </motion.p>
          <p className="mt-3 text-xs text-[var(--text-caption)]">Source: {QUOTES[quoteIndex].source}</p>
        </div>


        {/* Calendar Card */}
        <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--surface-base)] p-[var(--space-4)] shadow-[var(--shadow-card-soft)]">

          {/* Compact Calendar View */}
          {viewMode === 'calendar' && (
            <>
              {/* Horizontal Scrollable Date Selector */}
              <div className="mb-4 overflow-x-auto overflow-y-visible scrollbar-visible" style={{ overflowX: 'auto', overflowY: 'visible' }}>
                <div className="flex gap-2 pb-2" style={{ minWidth: 'max-content', width: 'max-content' }}>
                  {visibleDates.map((date, index) => {
                    const isSelected = selectedDate && getLocalDateString(date) === getLocalDateString(selectedDate);
                    const isToday = getLocalDateString(date) === getLocalDateString(new Date());
                    const { tasks, journal } = getEntriesForDate(date);
                    const hasContent = tasks.length > 0 || journal.length > 0;
                    
                    return (
                      <button
                        key={`date-${index}`}
                        onClick={() => setSelectedDate(date)}
                        className={`flex-shrink-0 px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius-full)] border transition-all duration-200 min-w-[60px] ${
                          isSelected
                            ? 'bg-[var(--text-strong-alt)] border-[var(--text-strong-alt)] text-white'
                            : isToday
                            ? 'bg-[var(--surface-base-90)] border-[var(--accent-teal)] text-[var(--accent-teal)]'
                            : hasContent
                            ? 'bg-[var(--surface-base-90)] border-[var(--border-soft)] text-[var(--text-strong-alt)]'
                            : 'bg-[var(--surface-base-90)] border-[var(--border-soft)] text-[var(--text-caption-2)]'
                        }`}
                      >
                        <div className="text-xs font-medium">
                          {formatDateForSelector(date)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            {/* Content Display Area */}
              {selectedDate && (
                <div className="rounded-[var(--radius-lg)] bg-[var(--surface-base)]">
                  <div className="mb-4">
                    <h4 className="mb-3 text-xs uppercase tracking-widest text-[var(--text-body-muted-2)]">
                      TASKS
                    </h4>
                  </div>
                  
                  <div className="overflow-y-auto pr-1">
                    {(() => {
                      const { tasks, journal } = getEntriesForDate(selectedDate);
                      const hasContent = tasks.length > 0 || journal.length > 0;
                      
                      if (!hasContent) {
                        return (
                          <div className="text-center py-8">
                            <p className="text-[var(--text-caption-2)]">No activity on this day</p>
                          </div>
                        );
                      }
                      
                      return (
                        <>
                          {/* Tasks Section */}
                          {tasks.length > 0 && (
                            <div>
                              <div className="space-y-3">
                                {tasks.map(task => {
                                  const isCompleted = !!task.completedAt;
                                  return (
                                    <div key={task.id} className="flex items-start gap-[var(--space-3)] p-[var(--space-3)] rounded-[var(--radius-md)] border border-[var(--border-soft-panel-3)] bg-[var(--surface-base-90)]">
                                      <div className="flex items-center gap-2 mt-1">
                                      </div>
                                      <div className="flex-1">
                                        <p className={`text-sm ${isCompleted ? 'line-through text-[var(--text-caption-2)]' : 'text-[var(--text-strong-alt)]'}`}>
                                          {task.text}
                                        </p>
                                        <div className="mt-1">
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          {/* Journal Section */}
                          {journal.length > 0 && (
                            <div>
                              <p className="mb-3 text-xs font-light uppercase tracking-wider text-[var(--accent-pill)]">Journal</p>
                              <div className="space-y-4">
                                {journal.map((entry, entryIndex) => {
                                  const entryId = `${getLocalDateString(selectedDate)}-${entryIndex}`;
                                  const isExpanded = expandedJournal.has(entryId);
                                  const displayText = isExpanded ? entry.response : truncateText(entry.response, 3);
                                  
                                  return (
                                    <div key={entryIndex} className="rounded-2xl bg-white px-5 py-4 shadow-sm group relative">
                                      {/* Date */}
                                      <div className="mb-2 text-xs text-gray-400">
                                        {new Date(entry.createdAt).toLocaleDateString('en-US', {
                                          weekday: 'short',
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </div>
                                      
                                      {/* Prompt */}
                                      {entry.prompt && (
                                        <p className="mb-2 text-left text-[var(--text-strong)] [font-family:var(--font-family-display)] [font-size:1rem] [font-weight:var(--type-headline-weight)] [line-height:1.2]">
                                          {entry.prompt}
                                        </p>
                                      )}
                                      
                                      {/* Response */}
                                      <p className="text-sm text-[var(--text-strong-alt)] whitespace-pre-wrap">
                                        {displayText}
                                      </p>
                                      
                                      {/* Show more/less button */}
                                      {entry.response.split('\n').length > 3 && (
                                        <button
                                          onClick={() => toggleJournalExpansion(entryId)}
                                          className="mt-[var(--space-2)] text-xs text-[var(--accent-teal)] hover:text-[var(--accent-teal)]/80 transition-colors"
                                        >
                                          {isExpanded ? 'Show less' : 'Show more'}
                                        </button>
                                      )}
                                      
                                      {/* Photos */}
                                      {entry.photoUrl && (
                                        <div className="mt-3 flex gap-3 flex-wrap">
                                          {entry.photoUrl.split(',').filter(photo => {
                                            return photo && 
                                                   photo.trim() && 
                                                   photo !== 'data:image/png;base64,' &&
                                                   photo !== 'data:image/png;base64' &&
                                                   photo.length > 'data:image/png;base64,'.length;
                                          }).map((photo, photoIndex) => {
                                            const photoSrc = photo.trim();
                                            const finalSrc = photoSrc.startsWith('data:') ? photoSrc : `data:image/png;base64,${photoSrc}`;
                                            return (
                                              <div 
                                                key={photoIndex}
                                                className="relative bg-white p-2 shadow-lg"
                                                style={{
                                                  width: '100px',
                                                  paddingBottom: '12px',
                                                }}
                                              >
                                                {/* Polaroid photo */}
                                                <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                                                  <img
                                                    src={finalSrc}
                                                    alt={`Journal photo ${photoIndex + 1}`}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                      console.error('Failed to load photo:', photoSrc.substring(0, 100) + '...');
                                                      e.currentTarget.style.display = 'none';
                                                    }}
                                                  />
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </>
          )}  

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {getLastSevenDays().map((date, index) => {
                const { tasks, journal } = getEntriesForDate(date);
                const hasContent = tasks.length > 0 || journal.length > 0;
                
                if (!hasContent) return null;
                
                return (
                  <motion.div
                    key={getLocalDateString(date)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--surface-base)] p-[var(--space-4)] shadow-[var(--shadow-card-soft)]"
                  >
                    <div className="mb-[var(--space-3)] flex items-center justify-between">
                      <h4 className="type-caption text-[var(--text-strong)]">
                        {formatDateHeader(date)}
                      </h4>
                    </div>
                    
                    {/* Tasks */}
                    {tasks.length > 0 && (
                      <div className="mb-[var(--space-2)]">
                        <div className="space-y-2">
                          {tasks.map(task => (
                            <div key={task.id} className="flex items-center gap-[var(--space-3)] text-sm text-[var(--text-strong-alt)]">
                              <span className="line-through">{task.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Journal Entries */}
                    {journal.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-light uppercase tracking-wider text-[var(--accent-pill)]">Journal</p>
                        <div className="space-y-3">
                          {journal.map((entry, entryIndex) => (
                            <div key={entryIndex} className="rounded-2xl bg-white px-5 py-4 shadow-sm group relative">
                              {/* Date */}
                              <div className="mb-2 text-xs text-gray-400">
                                {new Date(entry.createdAt).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              
                              {/* Prompt */}
                              {entry.prompt && (
                                <p className="mb-2 text-left text-[var(--text-strong)] [font-family:var(--font-family-display)] [font-size:1rem] [font-weight:var(--type-headline-weight)] [line-height:1.2]">
                                  {entry.prompt}
                                </p>
                              )}
                              
                              {/* Response */}
                              <p className="text-sm text-[var(--text-strong-alt)] whitespace-pre-wrap">
                                {entry.response}
                              </p>
                              
                              {/* Photos */}
                              {entry.photoUrl && (
                                <div className="mt-3 flex gap-3 flex-wrap">
                                  {entry.photoUrl.split(',').filter(photo => {
                                    return photo && 
                                           photo.trim() && 
                                           photo !== 'data:image/png;base64,' &&
                                           photo !== 'data:image/png;base64' &&
                                           photo.length > 'data:image/png;base64,'.length;
                                  }).map((photo, photoIndex) => {
                                    const photoSrc = photo.trim();
                                    const finalSrc = photoSrc.startsWith('data:') ? photoSrc : `data:image/png;base64,${photoSrc}`;
                                    return (
                                      <div 
                                        key={photoIndex}
                                        className="relative bg-white p-2 shadow-lg"
                                        style={{
                                          width: '100px',
                                          paddingBottom: '12px',
                                        }}
                                      >
                                        {/* Polaroid photo */}
                                        <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                                          <img
                                            src={finalSrc}
                                            alt={`Journal photo ${photoIndex + 1}`}
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                              console.error('Failed to load photo:', photoSrc.substring(0, 100) + '...');
                                              e.currentTarget.style.display = 'none';
                                            }}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
              
              {/* Empty state for list view */}
              {getLastSevenDays().every(date => {
                const { tasks, journal } = getEntriesForDate(date);
                return tasks.length === 0 && journal.length === 0;
              }) && (
                <div className="text-center py-8">
                  <p className="text-[var(--text-caption-2)]">No activity in the last 7 days</p>
                </div>
              )}
            </div>
          )}
          
          
        </div>
      </div>
    </div>
  );
}
