import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, CheckCircle, Circle, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import type { Todo, WeeklyReflection, JournalEntry } from '../App';
import pixelNoTasksIcon from 'figma:asset/5765ff71efcec8f85a51ea67d9c56fb1dafbd5a1.png';

interface TaskHistoryScreenProps {
  todos: Todo[];
  onRestoreTask: (id: string) => void;
  reflections: WeeklyReflection[];
  onSubmitReflection: (weekStartDate: string, prompt: string, response: string) => void;
  journalEntries?: JournalEntry[];
}

interface GroupedTodos {
  [date: string]: {
    added: Todo[];
    completed: Todo[];
    destroyed: Todo[];
  };
}

export default function TaskHistoryScreen({ 
  todos, 
  onRestoreTask,
  reflections,
  onSubmitReflection,
  journalEntries
}: TaskHistoryScreenProps) {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [reflectionResponse, setReflectionResponse] = useState('');
  const [historyView, setHistoryView] = useState<'all' | 'firsts'>('all');
  const [calendarMonth, setCalendarMonth] = useState(new Date());

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

  const getJournalEntriesForMonth = () => {
    if (!journalEntries) return new Set<string>();
    
    const { year, month } = getDaysInMonth(calendarMonth);
    const entriesSet = new Set<string>();
    
    journalEntries.forEach(entry => {
      const entryDate = new Date(entry.createdAt);
      if (entryDate.getFullYear() === year && entryDate.getMonth() === month) {
        entriesSet.add(getLocalDateString(entryDate));
      }
    });
    
    return entriesSet;
  };

  const previousMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  const isToday = (year: number, month: number, day: number) => {
    const today = new Date();
    return today.getFullYear() === year && 
           today.getMonth() === month && 
           today.getDate() === day;
  };

  // Weekly reflection prompts
  const weeklyPrompts = [
    "What's one thing you handled this week that you weren't sure you could?",
    "What did you figure out this week that you didn't know before?",
    "What's one thing that felt hard but you did anyway?",
    "What surprised you about yourself this week?",
    "What's something small you did that made a difference?"
  ];

  // Get Monday of current week
  const getMondayOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const currentWeekMonday = getMondayOfWeek(new Date());
  const currentWeekString = currentWeekMonday.toISOString().split('T')[0];

  // Check if there's a reflection for current week
  const currentWeekReflection = reflections.find(r => r.weekStartDate === currentWeekString);

  // Get prompt for current week (rotate based on week number of year)
  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const currentPrompt = weeklyPrompts[getWeekNumber(currentWeekMonday) % weeklyPrompts.length];

  // Get past reflections (not including current week)
  const pastReflections = reflections
    .filter(r => r.weekStartDate !== currentWeekString)
    .sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime());

  const handleSubmitReflection = () => {
    if (reflectionResponse.trim()) {
      onSubmitReflection(currentWeekString, currentPrompt, reflectionResponse.trim());
      setReflectionResponse('');
      toast.success('Reflection saved. You showed up this week.', { duration: 3000 });
    }
  };

  // Helper function to get local date string (YYYY-MM-DD) 
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    
    // Use local date strings for consistent comparison
    const dateString = getLocalDateString(date);
    const todayString = getLocalDateString(today);
    
    if (dateString === todayString) return 'Today';
    
    // For all other dates, show the full date format
    return date.toLocaleDateString('en-US', { 
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Group todos by date
  const groupTodosByDate = (): GroupedTodos => {
    const grouped: GroupedTodos = {};
    
    // Filter todos based on historyView
    const filteredTodos = historyView === 'firsts' 
      ? todos.filter(todo => todo.isFirstTime) 
      : todos;
    
    filteredTodos.forEach(todo => {
      // Determine the current state of the task and group accordingly
      if (todo.destroyedAt) {
        // Task was destroyed - show in destroyed section on destruction date
        const destroyedDate = getLocalDateString(todo.destroyedAt);
        if (!grouped[destroyedDate]) {
          grouped[destroyedDate] = { added: [], completed: [], destroyed: [] };
        }
        grouped[destroyedDate].destroyed.push(todo);
      } else if (todo.completed && todo.completedAt) {
        // Task is completed but not destroyed - show in completed section on completion date
        const completedDate = getLocalDateString(todo.completedAt);
        if (!grouped[completedDate]) {
          grouped[completedDate] = { added: [], completed: [], destroyed: [] };
        }
        grouped[completedDate].completed.push(todo);
      } else {
        // Task is active (not completed, not destroyed) - show in added section on creation date
        const createdDate = getLocalDateString(todo.createdAt);
        if (!grouped[createdDate]) {
          grouped[createdDate] = { added: [], completed: [], destroyed: [] };
        }
        grouped[createdDate].added.push(todo);
      }
    });
    
    return grouped;
  };

  const groupedTodos = groupTodosByDate();
  const sortedDates = Object.keys(groupedTodos).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const toggleDay = (dateString: string) => {
    // Haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    const newExpanded = new Set<string>();
    if (!expandedDays.has(dateString)) {
      // Only allow one expanded at a time
      newExpanded.add(dateString);
    }
    // If clicking the same one, it closes (newExpanded stays empty)
    setExpandedDays(newExpanded);
  };

  const handleRestoreTask = (taskId: string, taskText: string) => {
    onRestoreTask(taskId);
    toast.success(`"${taskText.length > 30 ? taskText.substring(0, 30) + '...' : taskText}" restored to active tasks!`, { duration: 3000 });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Floating Game UI Container with Notebook Background */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Header Container */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/60 p-6 pixel-notebook">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-pixel text-gray-900" role="heading" aria-level="1">Task History</h1>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Task Timeline Container - Fixed Height with Scrolling */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/60 pixel-notebook flex-1 flex flex-col overflow-hidden">
            {/* Fixed Height Scrollable Container for Date Containers */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6" style={{ 
              WebkitOverflowScrolling: 'touch',
              height: '100%',
              maxHeight: 'calc(100vh - 200px)' // Ensure it doesn't exceed viewport
            }}>
              <div className="min-h-full space-y-6">
                {/* Journal Calendar */}
                {journalEntries && journalEntries.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100/50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-700">Journal Activity</h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={previousMonth}
                          className="p-1.5 hover:bg-white/60 rounded-lg transition-colors"
                          aria-label="Previous month"
                        >
                          <ChevronLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
                          {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                        <button
                          onClick={nextMonth}
                          className="p-1.5 hover:bg-white/60 rounded-lg transition-colors"
                          aria-label="Next month"
                        >
                          <ChevronRight className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {/* Day headers */}
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                          {day}
                        </div>
                      ))}
                      
                      {/* Calendar days */}
                      {(() => {
                        const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(calendarMonth);
                        const entriesSet = getJournalEntriesForMonth();
                        const days = [];
                        
                        // Add empty cells for days before month starts
                        for (let i = 0; i < startingDayOfWeek; i++) {
                          days.push(<div key={`empty-${i}`} className="aspect-square" />);
                        }
                        
                        // Add days of month
                        for (let day = 1; day <= daysInMonth; day++) {
                          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const hasEntry = entriesSet.has(dateStr);
                          const isCurrentDay = isToday(year, month, day);
                          
                          days.push(
                            <div
                              key={day}
                              className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-all ${
                                isCurrentDay
                                  ? 'bg-blue-500 text-white font-medium ring-2 ring-blue-300'
                                  : hasEntry
                                  ? 'bg-gradient-to-br from-blue-400 to-purple-400 text-white font-medium shadow-sm'
                                  : 'text-gray-600 hover:bg-white/40'
                              }`}
                            >
                              {day}
                            </div>
                          );
                        }
                        
                        return days;
                      })()}
                    </div>
                    
                    <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-gradient-to-br from-blue-400 to-purple-400" />
                        <span>Journal entry</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-500" />
                        <span>Today</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Weekly Reflection Card */}
                

                {/* Past Reflections */}
                {pastReflections.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-medium text-gray-600 px-1">Past Reflections</h3>
                    {pastReflections.map((reflection, index) => (
                      <motion.div
                        key={reflection.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gray-100/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50"
                      >
                        <div className="text-xs text-gray-500 mb-2">
                          Week of {new Date(reflection.weekStartDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          {reflection.prompt}
                        </h4>
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {reflection.response}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Toggle Switcher for All/Firsts */}
                {sortedDates.length > 0 && (
                  <div className="flex justify-center my-4">
                    <div className="inline-flex bg-gray-200/70 rounded-lg p-1 border border-gray-300/50">
                      <button
                        onClick={() => setHistoryView('all')}
                        className={`px-4 py-2 font-pixel text-[10px] rounded-md transition-all duration-200 ${
                          historyView === 'all'
                            ? 'bg-slate-600 text-white border-2 border-slate-800 shadow-lg'
                            : 'bg-transparent text-gray-600 border-2 border-transparent hover:text-gray-900'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setHistoryView('firsts')}
                        className={`px-4 py-2 font-pixel text-[10px] rounded-md transition-all duration-200 ${
                          historyView === 'firsts'
                            ? 'bg-slate-600 text-white border-2 border-slate-800 shadow-lg'
                            : 'bg-transparent text-gray-600 border-2 border-transparent hover:text-gray-900'
                        }`}
                      >
                        Firsts
                      </button>
                    </div>
                  </div>
                )}

                {/* Task History Section */}
                {sortedDates.length === 0 && reflections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-600 py-12">
                    <div className="w-32 h-32 flex items-center justify-center mb-4">
                      <img 
                        src={pixelNoTasksIcon}
                        alt="Pixelated icon for empty task history"
                        className="w-full h-full object-contain"
                        style={{ 
                          imageRendering: 'pixelated',
                          imageRendering: '-moz-crisp-edges',
                          imageRendering: 'crisp-edges',
                          WebkitImageRendering: 'pixelated',
                          msInterpolationMode: 'nearest-neighbor'
                        }}
                      />
                    </div>
                    <p className="text-lg font-medium text-gray-700">Your story starts here. Add your first task.</p>
                  </div>
                ) : sortedDates.length === 0 && historyView === 'firsts' ? (
                  <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-600 py-8">
                    <p className="text-sm text-gray-600 text-center max-w-sm">Nothing here yet — flag a task as a first next time you're doing something new.</p>
                  </div>
                ) : sortedDates.length > 0 ? (
                  <div>
                    {pastReflections.length > 0 && (
                      <h3 className="text-xs font-medium text-gray-600 px-1 mb-3 mt-6">Task Timeline</h3>
                    )}
                    <div className="space-y-3 pb-4">
                      {sortedDates.map((dateString, dayIndex) => {
                        // Create date in local timezone by parsing YYYY-MM-DD
                        const [year, month, day] = dateString.split('-').map(Number);
                        const date = new Date(year, month - 1, day); // month is 0-indexed
                        const dayData = groupedTodos[dateString];
                        const hasActivity = dayData.added.length > 0 || dayData.completed.length > 0 || dayData.destroyed.length > 0;
                        const isExpanded = expandedDays.has(dateString);
                        
                        if (!hasActivity) return null;
                        
                        return (
                          <motion.div
                            key={dateString}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: dayIndex * 0.1 }}
                            className="overflow-hidden"
                          >
                            {/* Collapsible Date Header */}
                            <button
                              onClick={() => toggleDay(dateString)}
                              className={`w-full px-4 py-4 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-gray-400/30 text-white rounded-xl border border-gray-500/30 touch-manipulation select-none transition-all duration-200 ${
                                isExpanded 
                                  ? 'bg-gray-700 shadow-lg' 
                                  : 'bg-gray-800'
                              }`}
                              style={{
                                minHeight: '60px',
                                WebkitTapHighlightColor: 'transparent',
                                WebkitUserSelect: 'none',
                                userSelect: 'none',
                                touchAction: 'manipulation'
                              }}
                              aria-expanded={expandedDays.has(dateString)}
                              aria-label={`${expandedDays.has(dateString) ? 'Collapse' : 'Expand'} tasks for ${formatDate(date)}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-left">
                                  <h3 className="font-medium text-white text-base">
                                    {formatDate(date)}
                                  </h3>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                {/* Summary counts */}
                                <div className="flex items-center gap-3 text-xs text-gray-300">
                                  {dayData.added.length > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Circle className="w-3 h-3 text-gray-400" />
                                      {dayData.added.length}
                                    </span>
                                  )}
                                  {dayData.completed.length > 0 && (
                                    <span className="flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                                      {dayData.completed.length}
                                    </span>
                                  )}
                                  {dayData.destroyed.length > 0 && (
                                    <span className="flex items-center gap-1">
                                      <div className="w-3 h-3 bg-purple-400 rounded-sm" />
                                      {dayData.destroyed.length}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Expand/collapse icon */}
                                <motion.div
                                  animate={{ rotate: isExpanded ? 90 : 0 }}
                                  transition={{ 
                                    duration: 0.25,
                                    ease: "easeInOut"
                                  }}
                                  className="flex items-center justify-center w-6 h-6"
                                >
                                  <ChevronRight className="w-4 h-4 text-gray-300" />
                                </motion.div>
                              </div>
                            </button>

                            {/* Expandable Task Activities */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ 
                                    duration: 0.3, 
                                    ease: "easeInOut"
                                  }}
                                  className="task-history-dropdown-content bg-transparent overflow-hidden"
                                  style={{
                                    transformOrigin: 'top',
                                    backfaceVisibility: 'hidden',
                                    WebkitBackfaceVisibility: 'hidden'
                                  }}
                                >
                                  <div className="pl-4 pt-3 pb-2">
                                    {/* Fixed height scrollable container for tasks */}
                                    <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-2" style={{ WebkitOverflowScrolling: 'touch' }}>
                                    {/* Tasks Added */}
                                    <AnimatePresence mode="popLayout">
                                      {dayData.added.map((todo, todoIndex) => (
                                        <motion.div
                                          key={`added-${todo.id}`}
                                          initial={{ opacity: 0, y: -10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: -10, height: 0 }}
                                          transition={{ delay: todoIndex * 0.05, duration: 0.3 }}
                                          className="flex items-center justify-between py-3 px-4 bg-gray-100/90 rounded-lg group hover:bg-gray-100 transition-all duration-200 border border-gray-200/70 backdrop-blur-sm"
                                        >
                                        <div className="flex-1 min-w-0 pr-3">
                                          <p className="text-sm text-gray-900 break-words mb-1">
                                            {todo.text}
                                          </p>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-700 bg-gray-300/80 px-2 py-0.5 rounded-full">
                                              Added
                                            </span>
                                            {todo.isFirstTime && (
                                              <span className="text-xs text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-full border border-cyan-200">
                                                first time
                                              </span>
                                            )}
                                            <span className="text-xs text-gray-500">{formatTime(todo.createdAt)}</span>
                                          </div>
                                        </div>
                                        {/* Restore button only for inactive tasks (completed or destroyed) */}
                                        {(todo.completed || todo.destroyedAt) && (
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleRestoreTask(todo.id, todo.text)}
                                            className="opacity-90 group-hover:opacity-100 focus:opacity-100 transition-all px-3 py-1 bg-white hover:bg-gray-50 focus:bg-gray-50 text-gray-900 hover:text-black text-xs rounded-md border border-gray-200 shadow-sm flex-shrink-0"
                                            aria-label={`Restore task "${todo.text}" to active tasks`}
                                          >
                                            Restore
                                          </Button>
                                        )}
                                        </motion.div>
                                      ))}
                                    </AnimatePresence>

                                    {/* Tasks Completed */}
                                    <AnimatePresence mode="popLayout">
                                      {dayData.completed.map((todo, todoIndex) => (
                                        <motion.div
                                          key={`completed-${todo.id}`}
                                          initial={{ opacity: 0, y: -10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: -10, height: 0 }}
                                          transition={{ delay: (dayData.added.length + todoIndex) * 0.05, duration: 0.3 }}
                                          className="flex items-center justify-between py-3 px-4 bg-gray-100/90 rounded-lg group hover:bg-gray-100 transition-all duration-200 border border-gray-200/70 backdrop-blur-sm"
                                        >
                                        <div className="flex-1 min-w-0 pr-3">
                                          <p className="text-sm text-gray-900 break-words mb-1">
                                            {todo.text}
                                          </p>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-white bg-emerald-500/90 px-2 py-0.5 rounded-full">
                                              Completed
                                            </span>
                                            {todo.isFirstTime && (
                                              <span className="text-xs text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-full border border-cyan-200">
                                                first time
                                              </span>
                                            )}
                                            <span className="text-xs text-gray-600">
                                              {todo.completedAt && formatTime(todo.completedAt)}
                                            </span>
                                          </div>
                                        </div>
                                        {/* Restore button for completed tasks */}
                                        {(todo.completed || todo.destroyedAt) && (
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleRestoreTask(todo.id, todo.text)}
                                            className="opacity-90 group-hover:opacity-100 focus:opacity-100 transition-all px-3 py-1 bg-white hover:bg-gray-50 focus:bg-gray-50 text-gray-900 hover:text-black text-xs rounded-md border border-gray-200 shadow-sm flex-shrink-0"
                                            aria-label={`Restore task \"${todo.text}\" to active tasks`}
                                          >
                                            Restore
                                          </Button>
                                        )}
                                        </motion.div>
                                      ))}
                                    </AnimatePresence>

                                    {/* Tasks Destroyed */}
                                    <AnimatePresence mode="popLayout">
                                      {dayData.destroyed.map((todo, todoIndex) => (
                                        <motion.div
                                          key={`destroyed-${todo.id}`}
                                          initial={{ opacity: 0, y: -10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: -10, height: 0 }}
                                          transition={{ delay: (dayData.added.length + dayData.completed.length + todoIndex) * 0.05, duration: 0.3 }}
                                          className="flex items-center justify-between py-3 px-4 bg-gray-100/90 rounded-lg group hover:bg-gray-100 transition-all duration-200 border border-gray-200/70 backdrop-blur-sm"
                                        >
                                        <div className="flex-1 min-w-0 pr-3">
                                          <p className="text-sm text-gray-900 break-words mb-1">
                                            {todo.text}
                                          </p>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-white bg-purple-500/90 px-2 py-0.5 rounded-full">
                                              🎮 Destroyed
                                            </span>
                                            {todo.isFirstTime && (
                                              <span className="text-xs text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-full border border-cyan-200">
                                                first time
                                              </span>
                                            )}
                                            <span className="text-xs text-gray-600">
                                              {todo.destroyedAt && formatTime(todo.destroyedAt)}
                                            </span>
                                          </div>
                                        </div>
                                        {/* Restore button for destroyed tasks */}
                                        {(todo.completed || todo.destroyedAt) && (
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleRestoreTask(todo.id, todo.text)}
                                            className="opacity-90 group-hover:opacity-100 focus:opacity-100 transition-all px-3 py-1 bg-white hover:bg-gray-50 focus:bg-gray-50 text-gray-900 hover:text-black text-xs rounded-md border border-gray-200 shadow-sm flex-shrink-0"
                                            aria-label={`Restore task "${todo.text}" to active tasks`}
                                          >
                                            Restore
                                          </Button>
                                        )}
                                        </motion.div>
                                      ))}
                                    </AnimatePresence>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}