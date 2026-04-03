import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Plus, Check, X, Timer, MoreHorizontal } from 'lucide-react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import type { Todo } from '../App';
import type { CanopyPriorityTag } from '../lib/canopyPriorityTags';
import DateTimePickerModal from './DateTimePickerModal';
import FocusTaskModal from './FocusTaskModal';
import FocusTaskScreen from './FocusTaskScreen';

const FOCUS_MODE_STORAGE_KEY = 'lifelevel-focus-mode';
const FOCUS_MODE_UPDATED_EVENT = 'canopy-focus-mode-updated';

interface TodoListScreenProps {
  todos: Todo[];
  userName?: string;
  onAddTodo: (text: string, isFirstTime?: boolean) => void;
  onToggleTodo: (id: string) => void;
  onEditTodo: (id: string, newText: string) => void;
  onReorderTodos: (dragIndex: number, hoverIndex: number) => void;
  onDeleteTodo: (id: string) => void;
  onOpenFocusTask: (todo: Todo, priorityTag?: CanopyPriorityTag) => void;
}

export default function TodoListScreen({
  todos,
  userName,
  onAddTodo,
  onToggleTodo,
  onEditTodo,
  onReorderTodos,
  onDeleteTodo,
  onOpenFocusTask,
}: TodoListScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const visibleTodos = todos.filter((todo) => !todo.destroyedAt);
  const [activeFilter, setActiveFilter] = useState<'todo' | 'completed'>('todo');
  const [newTodoText, setNewTodoText] = useState('');
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [newTodoNotes, setNewTodoNotes] = useState('');
  const [newTodoDueDate, setNewTodoDueDate] = useState('');
  const [newTodoDueTime, setNewTodoDueTime] = useState('');
  const [pendingDraft, setPendingDraft] = useState<{
    title: string;
    notes: string;
    dueDate: string;
  } | null>(null);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [xpBurstTaskId, setXpBurstTaskId] = useState<string | null>(null);
  const [notesByTask, setNotesByTask] = useState<Record<string, string | undefined>>({});
  const [dueDateByTask, setDueDateByTask] = useState<Record<string, string | undefined>>({});
  const [focusPromptFor, setFocusPromptFor] = useState<string | null>(null);
  const [focusSelectionIds, setFocusSelectionIds] = useState<string[]>([]);
  const hasInitializedFocus = useRef(false);
  const [focusSelectionLocked, setFocusSelectionLocked] = useState(false);
  const [showFocusSelectionOverlay, setShowFocusSelectionOverlay] = useState(false);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [dateTimeDisplay, setDateTimeDisplay] = useState('');
  
  // Focus Task Mode state
  const [showFocusTaskModal, setShowFocusTaskModal] = useState(false);
  const [focusTaskTodo, setFocusTaskTodo] = useState<Todo | null>(null);
  const [showFocusTaskScreen, setShowFocusTaskScreen] = useState(false);
  const [pendingTargetTime, setPendingTargetTime] = useState<number>(25);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [longPressTask, setLongPressTask] = useState<Todo | null>(null);

  const [focusMode, setFocusMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(FOCUS_MODE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : false; // Default to OFF
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const syncFocusMode = () => {
      try {
        const stored = localStorage.getItem(FOCUS_MODE_STORAGE_KEY);
        setFocusMode(stored ? JSON.parse(stored) : true);
      } catch {
        setFocusMode(true);
      }
    };

    window.addEventListener('storage', syncFocusMode);
    window.addEventListener('focus', syncFocusMode);
    window.addEventListener(FOCUS_MODE_UPDATED_EVENT, syncFocusMode);

    return () => {
      window.removeEventListener('storage', syncFocusMode);
      window.removeEventListener('focus', syncFocusMode);
      window.removeEventListener(FOCUS_MODE_UPDATED_EVENT, syncFocusMode);
    };
  }, []);

  useEffect(() => {
    if (!focusPromptFor) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('[data-focus-session-root="true"]')) {
        setFocusPromptFor(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [focusPromptFor]);

  useEffect(() => {
    if (!focusMode) {
      hasInitializedFocus.current = false;
      setFocusSelectionIds([]);
      setFocusSelectionLocked(false);
      setShowFocusSelectionOverlay(false);
    }
  }, [focusMode]);

  useEffect(() => {
    if (!pendingDraft) return;
    const match = [...visibleTodos]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .find((todo) => todo.text === pendingDraft.title && !dueDateByTask[todo.id] && !notesByTask[todo.id]);
    if (!match) return;
    setDueDateByTask((prev) => ({ ...prev, [match.id]: pendingDraft.dueDate || undefined }));
    if (pendingDraft.notes.trim()) {
      setNotesByTask((prev) => ({ ...prev, [match.id]: pendingDraft.notes.trim() }));
    }
    setPendingDraft(null);
  }, [pendingDraft, visibleTodos, dueDateByTask, notesByTask]);

  const openCreateSheet = () => {
    window.scrollTo(0, 0);
    setEditingTodoId(null);
    setNewTodoText('');
    setNewTodoNotes('');
    setNewTodoDueDate('');
    setNewTodoDueTime('');
    setShowCreateSheet(true);
  };

  const openEditSheet = (todo: Todo) => {
    window.scrollTo(0, 0);
    setEditingTodoId(todo.id);
    setNewTodoText(todo.text);
    setNewTodoNotes(notesByTask[todo.id] ?? '');
    const due = dueDateByTask[todo.id] ?? '';
    if (due) {
      const [datePart, timePart] = due.split('T');
      setNewTodoDueDate(datePart || '');
      setNewTodoDueTime(timePart || '');
      
      // Create display string for existing date/time
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(datePart);
      dueDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      let displayDate = '';
      if (diffDays === -1) displayDate = 'Yesterday';
      else if (diffDays === 0) displayDate = 'Today';
      else if (diffDays === 1) displayDate = 'Tomorrow';
      else {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        displayDate = `${dayNames[dueDate.getDay()]} ${monthNames[dueDate.getMonth()]} ${dueDate.getDate()}`;
      }
      
      if (timePart) {
        const [hourStr, minuteStr] = timePart.split(':');
        let hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        if (hour > 12) hour -= 12;
        if (hour === 0) hour = 12;
        
        setDateTimeDisplay(`${displayDate}, ${hour}:${minute.toString().padStart(2, '0')} ${ampm}`);
      } else {
        setDateTimeDisplay(displayDate);
      }
    } else {
      setNewTodoDueDate('');
      setNewTodoDueTime('');
      setDateTimeDisplay('');
    }
    setShowCreateSheet(true);
  };

  const closeTaskSheet = () => {
    setShowCreateSheet(false);
    setEditingTodoId(null);
    setDateTimeDisplay('');
  };

  // Focus Task Mode handlers
  const handleLongPressStart = (todo: Todo) => {
    if (todo.completed) return;
    
    setLongPressTask(todo);
    const timer = setTimeout(() => {
      setFocusTaskTodo(todo);
      setShowFocusTaskModal(true);
    }, 500); // 500ms long press
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setLongPressTask(null);
  };

  const handleFocusTaskConfirm = (targetTime?: number) => {
    console.log('handleFocusTaskConfirm - received targetTime:', targetTime);
    setShowFocusTaskModal(false);
    
    if (targetTime) {
      console.log('Setting pendingTargetTime to:', targetTime);
      setPendingTargetTime(targetTime);
    }
    setShowFocusTaskScreen(true);
  };

  const handleFocusTaskClose = () => {
    setShowFocusTaskScreen(false);
    setFocusTaskTodo(null);
  };

  const incompleteTodos = visibleTodos.filter((todo) => !todo.completed);
  const completedTodos = visibleTodos.filter((todo) => todo.completed);
  const rankedIncompleteTodos = useMemo(
    () =>
      [...incompleteTodos].sort((a, b) => {
        const aDue = dueDateByTask[a.id];
        const bDue = dueDateByTask[b.id];
        if (aDue && bDue) return new Date(aDue).getTime() - new Date(bDue).getTime();
        if (aDue) return -1;
        if (bDue) return 1;
        return a.createdAt.getTime() - b.createdAt.getTime();
      }),
    [incompleteTodos, dueDateByTask]
  );

  useEffect(() => {
    if (!focusMode || hasInitializedFocus.current) return;
    if (rankedIncompleteTodos.length > 0) {
      hasInitializedFocus.current = true;
      setFocusSelectionIds(rankedIncompleteTodos.slice(0, 3).map((t) => t.id));
    }
  }, [focusMode, rankedIncompleteTodos]);

  const focusSelectedSet = new Set(focusSelectionIds);
  const focusModeLimitedTodos = focusMode
    ? rankedIncompleteTodos.filter((todo) => focusSelectionLocked ? focusSelectedSet.has(todo.id) : true)
    : rankedIncompleteTodos;
  const filteredTodos = activeFilter === 'completed' ? completedTodos : focusModeLimitedTodos;
  const hasFocusModeOverflow = activeFilter === 'todo' && focusMode && rankedIncompleteTodos.length > 3;

  const handleSubmitNewTask = () => {
    if (newTodoText.trim()) {
      const title = newTodoText.trim();
      if (editingTodoId) {
        const todo = visibleTodos.find((t) => t.id === editingTodoId);
        if (todo && todo.text !== title) {
          onEditTodo(editingTodoId, title);
        }
        setNotesByTask((prev) => ({ ...prev, [editingTodoId]: newTodoNotes.trim() || undefined }));
        const dueIso = newTodoDueDate
          ? `${newTodoDueDate}T${newTodoDueTime || '00:00'}`
          : '';
        setDueDateByTask((prev) => ({ ...prev, [editingTodoId]: dueIso || undefined }));
        closeTaskSheet();
        toast.success('Task updated', { duration: 2000 });
      } else {
        const dueIso = newTodoDueDate
          ? `${newTodoDueDate}T${newTodoDueTime || '00:00'}`
          : '';
        onAddTodo(title);
        setPendingDraft({
          title,
          notes: newTodoNotes,
          dueDate: dueIso,
        });
        setNewTodoText('');
        setNewTodoNotes('');
        setNewTodoDueDate('');
        setNewTodoDueTime('');
        closeTaskSheet();
        toast.success('Task added', { duration: 2000 });
      }
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmitNewTask();
    }
  };

  const handleDateTimeSelect = (dateTime: { date: string; time: string; display: string }) => {
    setNewTodoDueDate(dateTime.date);
    setNewTodoDueTime(dateTime.time);
    setDateTimeDisplay(dateTime.display);
  };

  const handleToggle = (id: string, completed: boolean) => {
    if (!completed) {
      setCompletingId(id);
      setXpBurstTaskId(id);
      setTimeout(() => setXpBurstTaskId(null), 420);
      setTimeout(() => {
        onToggleTodo(id);
        setCompletingId(null);
      }, prefersReducedMotion ? 80 : 260);
      toast.success('Task complete', { duration: 2000 });
      return;
    }
    onToggleTodo(id);
  };

  const toggleFocusMode = () => {
    const next = !focusMode;
    setFocusMode(next);
    if (next) {
      setFocusSelectionLocked(false);
      setFocusSelectionIds(rankedIncompleteTodos.slice(0, 3).map((t) => t.id));
      setShowFocusSelectionOverlay(true);
    } else {
      setShowFocusSelectionOverlay(false);
      setFocusSelectionLocked(false);
    }
    try {
      localStorage.setItem(FOCUS_MODE_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(FOCUS_MODE_UPDATED_EVENT));
    } catch {
      // no-op
    }
  };

  const toggleFocusPrompt = (id: string) => {
    setFocusPromptFor((current) => (current === id ? null : id));
  };

  const confirmFocusPrompt = (todo: Todo) => {
    setFocusPromptFor(null);
    onOpenFocusTask(todo);
  };

  const toggleFocusSelection = (id: string) => {
    const current = focusSelectionIds;
    const selected = new Set(current);
    if (selected.has(id)) {
      if (selected.size <= 1) return;
      selected.delete(id);
    } else if (selected.size < 3) {
      selected.add(id);
    } else {
      const first = current[0];
      selected.delete(first);
      selected.add(id);
    }
    setFocusSelectionIds(Array.from(selected));
  };

  const overlayRoot = typeof document !== 'undefined' ? document.body : null;

  return (
    <div className={`relative flex h-full flex-col ${showCreateSheet ? 'z-[80]' : 'z-0'}`} style={{ minHeight: '100dvh' }}>
      {/* Header - pinned to top */}
      <div className="shrink-0 px-[var(--space-4)] pt-4 pb-2">
        <h2 className="mb-3 text-xs uppercase tracking-widest text-gray-400">Hi {userName || 'there'}</h2>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="mb-0 font-serif text-[2.6rem] leading-none text-gray-900">Tasks</h2>
            <p className="mt-2 text-[14px] font-normal leading-[1.4] text-[var(--text-caption-2)]">What needs to get done today?</p>
          </div>
          <button
            type="button"
            onClick={toggleFocusMode}
            className={`inline-flex items-center gap-[var(--space-2)] rounded-[var(--radius-full)] border px-[var(--space-3)] py-[var(--space-2)] shadow-sm transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-accent-35)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${
              focusMode
                ? 'border-[var(--accent-teal)] bg-[var(--surface-card-subtle-2)] hover:bg-[var(--surface-card-subtle-3)]'
                : 'border-[var(--border-soft)] bg-[var(--surface-base)] hover:bg-[var(--surface-hover-panel)]'
            }`}
            aria-label="Toggle focus mode"
            aria-pressed={focusMode}
          >
            <span className={`text-[12px] font-medium ${focusMode ? 'text-[var(--accent-teal-deep)]' : 'text-[var(--text-body-muted-2)]'}`}>
              Focus mode
            </span>
          </button>
        </div>
      </div>

      {/* Middle content - flexible space that absorbs keyboard */}
      <div className="flex-1 overflow-hidden">
        <div className="custom-scrollbar h-full overflow-y-auto overscroll-y-contain px-[var(--space-4)] pb-6 relative z-10">
          <div className="mb-6 flex gap-[var(--space-1)] rounded-[var(--radius-full)] border border-[var(--border-soft)] bg-[var(--surface-base-85)] p-[var(--space-2)]">
          {[
            { id: 'todo' as const, label: 'To Do' },
            { id: 'completed' as const, label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`flex-1 rounded-[var(--radius-full)] py-[var(--space-2)] text-sm transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base-85)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${
                activeFilter === tab.id ? 'bg-[var(--text-strong-alt)] text-white hover:bg-[var(--text-strong-alt)]' : 'text-[var(--text-body-muted-2)] hover:bg-[var(--surface-hover-panel-soft)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredTodos.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg text-gray-400">No tasks here yet</p>
            <p className="mt-2 text-sm text-gray-300">
              {activeFilter === 'completed' ? 'Completed tasks will appear here' : 'Add your first task above'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {filteredTodos.map((todo) => {
                const showFocusPrompt = focusPromptFor === todo.id;
                return (
                  <motion.div
                    key={todo.id}
                    layout={!prefersReducedMotion}
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                    animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    exit={
                      prefersReducedMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: -8, height: 0, marginBottom: 0 }
                    }
                    transition={{ duration: 0.28 }}
                    className="relative rounded-[var(--radius-md)] border border-[var(--border-soft-panel-3)] bg-[var(--surface-base)] p-[var(--space-3)] shadow-[var(--shadow-card-soft)]"
                    drag={!todo.completed && activeFilter === 'todo' ? true : false}
                    onPointerDown={() => handleLongPressStart(todo)}
                    onPointerUp={handleLongPressEnd}
                    onPointerLeave={handleLongPressEnd}
                    style={{ 
                      cursor: longPressTask?.id === todo.id ? 'pointer' : 'default',
                      backgroundColor: longPressTask?.id === todo.id ? 'var(--surface-hover-panel)' : undefined
                    }}
                    dragConstraints={{ left: -140, right: 0, top: 0, bottom: 0 }}
                    dragElastic={0.06}
                    onDragEnd={(_, info) => {
                      if (todo.completed || activeFilter !== 'todo') return;
                      const absX = Math.abs(info.offset.x);
                      const absY = Math.abs(info.offset.y);
                      if (info.offset.x < -92 && absX > absY) {
                        onDeleteTodo(todo.id);
                        toast.success('Task deleted', { duration: 1800 });
                        return;
                      }
                      if (absY > absX && absY > 24) {
                        const currentIndex = incompleteTodos.findIndex((t) => t.id === todo.id);
                        if (currentIndex < 0) return;
                        const nextIndex =
                          info.offset.y > 0
                            ? Math.min(currentIndex + 1, incompleteTodos.length - 1)
                            : Math.max(currentIndex - 1, 0);
                        if (nextIndex !== currentIndex) {
                          onReorderTodos(currentIndex, nextIndex);
                        }
                      }
                    }}
                  >
                    <div className="flex items-center gap-[var(--space-3)]">
                      <motion.button
                        type="button"
                        onClick={() => handleToggle(todo.id, todo.completed)}
                        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[var(--radius-full)] border-2 transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-accent-35)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${
                          todo.completed
                            ? 'border-[var(--accent-teal)] bg-[var(--accent-teal)] hover:bg-[var(--accent-teal-hover)] hover:border-[var(--accent-teal-hover)]'
                            : 'border-[var(--accent-soft-border)] bg-[var(--surface-base)] hover:border-[color:var(--accent-teal)]/50'
                        }`}
                        whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                        animate={
                          completingId === todo.id && !prefersReducedMotion
                            ? {
                                scale: [1, 1.12, 1],
                                backgroundColor: ['var(--bg-priority-flash-start)', 'var(--bg-priority-flash-mid)', 'var(--bg-priority-flash-end)'],
                              }
                            : {}
                        }
                        transition={{ duration: 0.28 }}
                        aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {todo.completed && <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />}
                      </motion.button>

                      <div className="min-w-0 flex-1" data-focus-session-root="true">
                        <div className="relative min-w-0">
                          {completingId === todo.id && (
                            <motion.span
                              aria-hidden
                              className="pointer-events-none absolute left-0 right-0 top-[0.55em] h-[1.5px] bg-teal-500"
                              initial={prefersReducedMotion ? { opacity: 0 } : { scaleX: 0, opacity: 0.9 }}
                              animate={prefersReducedMotion ? { opacity: 1 } : { scaleX: 1, opacity: 1 }}
                              transition={{ duration: 0.28 }}
                              style={{ transformOrigin: 'left' }}
                            />
                          )}
                          <p
                            className={`text-[15px] font-medium leading-snug ${
                              todo.completed ? 'text-gray-400 line-through' : 'text-[var(--text-strong-alt)]'
                            } text-left`}
                          >
                            {todo.text}
                          </p>
                        </div>
                        <AnimatePresence>
                          {showFocusPrompt && !todo.completed ? (
                            <motion.div
                              data-focus-session-root="true"
                              className="absolute left-0 top-[calc(100%+var(--space-2))] z-10 flex h-9 w-[min(100%,17.5rem)] items-center gap-[var(--space-2)] rounded-[var(--radius-full)] border border-[var(--border-soft)] bg-[var(--surface-base-95)] px-[var(--space-3)] py-[var(--space-2)] shadow-[var(--shadow-card-soft)]"
                              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.12, ease: 'easeOut' }}
                            >
                              <Timer className="h-3.5 w-3.5 shrink-0 text-[var(--text-caption-2)]" strokeWidth={1.9} />
                              <span className="min-w-0 flex-1 truncate text-[13px] leading-none text-[var(--text-body-muted-2)]">
                                Start focus session?
                              </span>
                              <button
                                type="button"
                                onClick={() => confirmFocusPrompt(todo)}
                                className="shrink-0 text-[13px] font-medium text-[var(--accent-teal)] transition-all duration-150 ease-out hover:text-[var(--accent-teal-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-accent-35)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)] active:scale-[0.97]"
                              >
                                Start
                              </button>
                              <button
                                type="button"
                                onClick={() => setFocusPromptFor(null)}
                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-full)] text-[var(--text-caption-2)] transition-all duration-150 ease-out hover:text-[var(--text-body-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)] active:scale-[0.97]"
                                aria-label="Dismiss focus session prompt"
                              >
                                <X className="h-3.5 w-3.5" strokeWidth={1.9} />
                              </button>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setFocusPromptFor(null);
                          openEditSheet(todo);
                        }}
                        className="flex h-11 min-h-[44px] w-11 min-w-[44px] flex-shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-body-muted)] transition-all duration-150 ease-out hover:bg-[var(--surface-hover-panel-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Edit task ${todo.text}`}
                      >
                        <MoreHorizontal className="h-5 w-5" strokeWidth={1.75} />
                      </button>
                    </div>

                    <AnimatePresence>
                      {xpBurstTaskId === todo.id && (
                        <motion.span
                          className="absolute right-16 top-4 text-xs font-medium text-teal-600"
                          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: -6 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          +10 pts
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {hasFocusModeOverflow && focusSelectionLocked ? (
              <p className="px-1 pt-1 text-xs text-[var(--text-caption-2)]">
                Focus mode is on - showing top 3 tasks first
              </p>
            ) : null}
          </div>
        )}
        </div>
      </div>

      {activeFilter === 'todo' && (
        <button
          type="button"
          onClick={openCreateSheet}
          className="fixed z-[120] flex h-14 w-14 items-center justify-center rounded-[var(--radius-full)] bg-[var(--text-strong-alt)] text-white shadow-[var(--shadow-card-soft)] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2"
          style={{
            right: '20px',
            bottom: 'calc(env(safe-area-inset-bottom) + 16px + 96px)',
          }}
          aria-label="Create new task"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      {overlayRoot
        ? createPortal(
            <AnimatePresence>
              {showFocusSelectionOverlay && activeFilter === 'todo' && focusMode && rankedIncompleteTodos.length > 0 && (
                <>
                  <motion.button
                    type="button"
                    aria-label="Dismiss focus mode selection"
                    className="fixed inset-0 z-[145]"
                    style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => {
                      setShowFocusSelectionOverlay(false);
                      setFocusMode(false);
                      setFocusSelectionLocked(false);
                      try {
                        localStorage.setItem(FOCUS_MODE_STORAGE_KEY, JSON.stringify(false));
                        window.dispatchEvent(new Event(FOCUS_MODE_UPDATED_EVENT));
                      } catch {
                        // no-op
                      }
                    }}
                  />
                  <motion.div
                    className="fixed left-4 right-4 top-1/2 z-[146] max-w-md -translate-y-1/2 transform mx-auto rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--surface-base)] p-[var(--space-4)] shadow-[var(--shadow-card-soft)]"
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                    transition={{ duration: 0.22 }}
                  >
                    <p className="mb-3 text-sm text-[var(--text-body-muted-2)]">Choose up to 3 focus tasks</p>
                    <p className="mb-4 text-xs text-[var(--text-caption-2)] leading-relaxed">
                      Focusing on only three tasks at a time helps combat cognitive overload, reduce mental fatigue, and manage executive dysfunction.
                    </p>
                    <div className="max-h-[45dvh] space-y-2 overflow-y-auto pr-1">
                      {rankedIncompleteTodos.map((todo) => {
                        const isSelected = focusSelectedSet.has(todo.id);
                        const dueText = dueDateByTask[todo.id]
                          ? new Date(dueDateByTask[todo.id] as string).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })
                          : 'No due date';
                        return (
                          <button
                            key={todo.id}
                            type="button"
                            onClick={() => toggleFocusSelection(todo.id)}
                            className="flex w-full items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-soft)] bg-[var(--surface-base-90)] px-3 h-14 text-left"
                          >
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-[var(--radius-full)] border ${
                                isSelected
                                  ? 'border-[var(--accent-teal)] bg-[var(--accent-teal)] text-white'
                                  : 'border-[var(--border-soft)] bg-[var(--surface-base)]'
                              }`}
                            >
                              {isSelected ? <Check className="h-3 w-3" /> : null}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm text-[var(--text-strong-alt)]">{todo.text}</span>
                            <span className="text-xs text-[var(--text-caption-2)]">{dueText}</span>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFocusSelectionLocked(true);
                        setShowFocusSelectionOverlay(false);
                      }}
                      className="mt-3 h-11 w-full rounded-[var(--radius-full)] bg-[var(--accent-teal)] text-sm font-medium text-white"
                    >
                      Lock in focus list
                    </button>
                  </motion.div>
                </>
              )}
              {showCreateSheet && (
                <>
                  <motion.button
                    type="button"
                    aria-label="Dismiss new task sheet"
                    className="fixed inset-0 z-[150]"
                    style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={closeTaskSheet}
                  />
                  <motion.div
                    className="fixed inset-x-0 bottom-0 z-[220] max-h-[calc(100dvh-3rem)] overflow-y-auto rounded-t-[24px] bg-[var(--surface-base)] px-[var(--space-5)] pb-[calc(var(--space-6)+env(safe-area-inset-bottom))] pt-[var(--space-3)]"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={prefersReducedMotion ? { duration: 0.2 } : { type: 'spring', stiffness: 360, damping: 32, duration: 0.25 }}
                  >
                    <div className="mx-auto mb-3 h-1.5 w-10 rounded-[var(--radius-full)] bg-[var(--border-soft)]" />
                    <h3 className="mb-3 font-serif text-xl text-[var(--text-strong-alt)]">{editingTodoId ? 'Edit Task' : 'New Task'}</h3>
                    <input
                      type="text"
                      value={newTodoText}
                      onChange={(e) => setNewTodoText(e.target.value)}
                      placeholder="Task title"
                      className="mb-3 w-full border-0 border-b border-[var(--border-soft)] bg-transparent pb-2 text-[var(--text-strong-alt)] outline-none focus:border-[var(--accent-teal)]"
                      autoFocus
                    />
                    <textarea
                      value={newTodoNotes}
                      onChange={(e) => setNewTodoNotes(e.target.value)}
                      placeholder="Notes"
                      rows={3}
                      className="mb-3 w-full resize-none border-0 border-b border-[var(--border-soft)] bg-transparent pb-2 text-[var(--text-strong-alt)] outline-none focus:border-[var(--accent-teal)]"
                    />
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--text-caption-2)]">Due</p>
                    <div className="mb-4">
                      <input
                        type="text"
                        value={dateTimeDisplay}
                        readOnly
                        onClick={() => setShowDateTimePicker(true)}
                        placeholder=""
                        className="w-full h-11 rounded-[var(--radius-full)] border border-[var(--border-soft)] bg-[var(--surface-base-90)] px-3 text-sm text-[var(--text-strong-alt)] outline-none transition-all duration-150 ease-out focus:border-[var(--accent-teal)] focus:ring-2 focus:ring-[color:var(--shadow-focus-ring-accent-25)] cursor-pointer placeholder:text-[var(--text-placeholder)]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSubmitNewTask}
                      disabled={!newTodoText.trim()}
                      className="h-12 w-full rounded-[var(--radius-full)] bg-[var(--accent-teal)] text-sm font-medium text-white disabled:opacity-50"
                    >
                      {editingTodoId ? 'Save Changes' : 'Create Task'}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>,
            overlayRoot
          )
        : null}
      
      <DateTimePickerModal
        isOpen={showDateTimePicker}
        onClose={() => setShowDateTimePicker(false)}
        onSelect={handleDateTimeSelect}
        initialDateTime={newTodoDueDate && newTodoDueTime ? { date: newTodoDueDate, time: newTodoDueTime } : undefined}
      />

      {/* Focus Task Mode Modal */}
      <FocusTaskModal
        isOpen={showFocusTaskModal}
        onClose={() => setShowFocusTaskModal(false)}
        onConfirm={handleFocusTaskConfirm}
        todo={focusTaskTodo}
      />

      {/* Focus Task Screen */}
      {showFocusTaskScreen && focusTaskTodo && (
        <>
          {console.log('Rendering FocusTaskScreen with pendingTargetTime:', pendingTargetTime)}
          <FocusTaskScreen
            todo={focusTaskTodo}
            onClose={handleFocusTaskClose}
            targetTime={pendingTargetTime}
          />
        </>
      )}
    </div>
  );
}
