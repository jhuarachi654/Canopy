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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-24 pt-4">
        <h2 className="text-xs tracking-widest text-gray-400 mb-3 uppercase">A record of your tasks and thoughts</h2>
        {/* Header */}
        <h2 className="font-serif text-4xl mb-6 text-[#2D2B3E]">Log</h2>

        {/* Calendar Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm p-6 mb-6 border border-[#E8E4F3]">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-[#EBE8F4] rounded-full transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5 text-[#8B86A3]" />
            </button>
            <h3 className="text-lg text-[#2D2B3E] font-serif">
              {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-[#EBE8F4] rounded-full transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5 text-[#8B86A3]" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm text-[#8B86A3] pb-2 font-light">
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

                // Brand: journal = #696A8E; tasks = teal (matches today / completion accent)
                const journalDotClass = today
                  ? 'bg-[#E4E3EF] ring-1 ring-[#696A8E]/55'
                  : isSelected
                    ? 'bg-[#5A5B78]'
                    : 'bg-[#696A8E]';
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
                      transition-all font-light
                      ${today 
                        ? isSelected 
                          ? 'bg-teal-500 text-white ring-2 ring-teal-300' 
                          : 'bg-teal-500 text-white'
                        : isSelected
                          ? 'bg-[#EBE8F4] ring-2 ring-[#696A8E]/45'
                          : 'hover:bg-[#EBE8F4]/50'
                      }
                      ${!today && !isSelected ? 'text-[#2D2B3E]' : ''}
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
          {selectedDate && (selectedEntries.journal.length > 0 || selectedEntries.tasks.length > 0) && (
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
                  <p className="text-xs uppercase tracking-wider text-[#696A8E] mb-3 font-light">Journal</p>
                  {selectedEntries.journal.map((entry, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      {entry.prompt && (
                        <p className="font-serif text-sm text-[#8B86A3] italic mb-1">
                          {entry.prompt}
                        </p>
                      )}
                      <p className="text-[#2D2B3E] text-sm mb-2">
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
                  <p className="text-xs uppercase tracking-wider text-[#696A8E] mb-3 font-light">Journal</p>
                  {hoveredEntries.journal.map((entry, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      {entry.prompt && (
                        <p className="font-serif text-sm text-[#8B86A3] italic mb-1">
                          {entry.prompt}
                        </p>
                      )}
                      <p className="text-[#2D2B3E] text-sm mb-2 line-clamp-2">
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
          <div className="mt-6 pt-4 border-t border-[#EBE8F4] flex items-center gap-4 text-xs font-light">
            <div className="flex items-center gap-1.5 text-teal-800">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />
              <span>tasks</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#696A8E]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#696A8E]" />
              <span>journal</span>
            </div>
          </div>
          
          
        </div>
      </div>
    </div>
  );
}