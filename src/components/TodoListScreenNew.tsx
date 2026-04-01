import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Plus, Check, X, Pencil, Target } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { Todo } from '../App';

interface TodoListScreenProps {
  todos: Todo[];
  onAddTodo: (text: string, isFirstTime?: boolean) => void;
  onToggleTodo: (id: string) => void;
  onEditTodo: (id: string, newText: string) => void;
  onReorderTodos: (dragIndex: number, hoverIndex: number) => void;
  onDeleteTodo: (id: string) => void;
}

export default function TodoListScreen({
  todos,
  onAddTodo,
  onToggleTodo,
  onEditTodo,
  onReorderTodos,
  onDeleteTodo,
}: TodoListScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const visibleTodos = todos.filter(todo => !todo.destroyedAt);
  const [activeFilter, setActiveFilter] = useState<'todo' | 'completed'>('todo');
  const [newTodoText, setNewTodoText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [xpBurstTaskId, setXpBurstTaskId] = useState<string | null>(null);
  const [categoryByTask, setCategoryByTask] = useState<Record<string, 'home' | 'school' | 'work' | 'other' | undefined>>({});
  const [priorityByTask, setPriorityByTask] = useState<Record<string, 'low' | 'medium' | 'high' | undefined>>({});
  const [openTagMenuFor, setOpenTagMenuFor] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('lifelevel-focus-mode');
      return stored ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  const QUOTES = [
    { text: 'Start where you are. Use what you have. Do what you can.', source: 'Arthur Ashe' },
    { text: 'Believe you can and you\'re halfway there.', source: 'Theodore Roosevelt' },
    { text: 'You are never too old to set another goal or to dream a new dream.', source: 'C. S. Lewis' },
    { text: 'It always seems impossible until it\'s done.', source: 'Nelson Mandela' },
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
  const CATEGORY_OPTIONS: Array<'home' | 'school' | 'work' | 'other'> = ['home', 'school', 'work', 'other'];
  const PRIORITY_OPTIONS: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];

  const filteredTodos = visibleTodos.filter((todo) => {
    if (activeFilter === 'completed') return todo.completed;
    return !todo.completed;
  });

  const getPriorityPillClasses = (value: 'low' | 'medium' | 'high') => {
    if (value === 'low') return 'bg-[#EEF7F3] text-[#2D6E57]';
    if (value === 'medium') return 'bg-[#FFF7E6] text-[#9A6A1B]';
    return 'bg-[#FFEDEE] text-[#A14346]';
  };

  const getCategoryPillClasses = (value: 'home' | 'school' | 'work' | 'other') => {
    if (value === 'home') return 'bg-[#EEF7F3] text-[#2D6E57]';
    if (value === 'school') return 'bg-[#EEF2FF] text-[#485AA0]';
    if (value === 'work') return 'bg-[#FFF3EA] text-[#9A5A2A]';
    return 'bg-[#F3EEF8] text-[#6B548A]';
  };

  const handleSubmitNewTask = () => {
    if (newTodoText.trim()) {
      onAddTodo(newTodoText.trim());
      setNewTodoText('');
      toast.success('Task added', { duration: 2000 });
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmitNewTask();
    }
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

  const startEditing = (id: string, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  const saveEdit = () => {
    if (editingId && editingText.trim()) {
      onEditTodo(editingId, editingText.trim());
      toast.success('Task updated', { duration: 2000 });
    }
    setEditingId(null);
    setEditingText('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditingText('');
    }
  };

  const toggleFocusMode = () => {
    const next = !focusMode;
    setFocusMode(next);
    try {
      localStorage.setItem('lifelevel-focus-mode', JSON.stringify(next));
      window.dispatchEvent(new Event('canopy-focus-mode-updated'));
    } catch {
      // no-op
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-24 pt-4">
        <h2 className="text-xs tracking-widest text-gray-400 mb-3 uppercase">Hi Johanna</h2>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-4xl text-gray-900">Tasks</h2>
          <button
            onClick={toggleFocusMode}
            className="inline-flex items-center gap-1.5 rounded-[20px] bg-white border border-[#E8E4F3] px-3 py-1.5"
            aria-label="Toggle focus mode"
          >
            <Target className={`w-[14px] h-[14px] ${focusMode ? 'text-[#1abf8f]' : 'text-gray-400'}`} />
            <span className={`text-[12px] font-medium ${focusMode ? 'text-[#1abf8f]' : 'text-gray-500'}`}>
              Focus mode
            </span>
          </button>
        </div>

        {/* Quote card */}
        <div className="bg-white/85 backdrop-blur-sm rounded-3xl shadow-sm p-4 mb-4 border border-[#E8E4F3]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs tracking-widest uppercase text-[#8B86A3]">Quote of the day</p>
          </div>
          <motion.p
            key={quoteIndex}
            className="text-sm italic text-[#5F5A74]"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
          >
            {QUOTES[quoteIndex].text}
          </motion.p>
          <p className="text-xs text-[#7A7392] mt-1">Source: {QUOTES[quoteIndex].source}</p>
        </div>

        {/* Pill filter tabs */}
        <div className="bg-white/85 rounded-full p-1.5 mb-4 border border-[#E8E4F3] flex gap-1">
          {[
            { id: 'todo' as const, label: 'To Do' },
            { id: 'completed' as const, label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex-1 py-2 rounded-full text-sm transition-colors ${
                activeFilter === tab.id ? 'bg-[#2D2B3E] text-white' : 'text-[#6F6986] hover:bg-[#F1EDF9]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Add new task card */}
        <div className="bg-white rounded-3xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmitNewTask}
              disabled={!newTodoText.trim()}
              className="w-8 h-8 flex-shrink-0 rounded-full bg-[#34A0DE] hover:bg-[#3431DE] disabled:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Add a new task..."
              className="flex-1 bg-transparent border-0 outline-none text-gray-700 placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Task list */}
        {filteredTodos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No tasks here yet</p>
            <p className="text-gray-300 text-sm mt-2">
              {activeFilter === 'completed'
                ? 'Completed tasks will appear here'
                : 'Add your first task above'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
            {filteredTodos.map((todo) => (
              <motion.div
                key={todo.id}
                layout={!prefersReducedMotion}
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl shadow-sm p-4"
              >
                <div className="flex items-start gap-3 relative">
                  {/* Checkbox */}
                  <motion.button
                    onClick={() => handleToggle(todo.id, todo.completed)}
                    className={`w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors mt-0.5 ${
                      todo.completed ? 'bg-teal-500 border-teal-500' : 'border-gray-300 hover:border-teal-500'
                    }`}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.96 }}
                    animate={
                      completingId === todo.id && !prefersReducedMotion
                        ? { scale: [1, 1.14, 1], backgroundColor: ['#ffffff', '#ccfbf1', '#99f6e4'] }
                        : {}
                    }
                    transition={{ duration: 0.28 }}
                  >
                    {todo.completed && <Check className="w-4 h-4 text-white" />}
                  </motion.button>

                  {/* Task text */}
                  {editingId === todo.id ? (
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      onBlur={saveEdit}
                      className="flex-1 bg-transparent border-0 border-b-2 border-[#34A0DE] outline-none text-gray-700"
                      autoFocus
                    />
                  ) : (
                    <motion.p
                      onClick={() => startEditing(todo.id, todo.text)}
                      className={`flex-1 cursor-text hover:text-gray-900 transition-colors ${todo.completed ? 'text-gray-400' : 'text-gray-700'}`}
                      animate={
                        completingId === todo.id
                          ? { opacity: 0.75 }
                          : { opacity: 1 }
                      }
                      transition={{ duration: 0.24 }}
                    >
                      {completingId === todo.id && (
                        <motion.span
                          aria-hidden="true"
                          className="absolute left-0 right-10 top-1/2 h-[1.5px] bg-teal-500 origin-left"
                          initial={prefersReducedMotion ? { opacity: 0 } : { scaleX: 0, opacity: 0.9 }}
                          animate={prefersReducedMotion ? { opacity: 1 } : { scaleX: 1, opacity: 1 }}
                          transition={{ duration: 0.28 }}
                        />
                      )}
                      <span className={todo.completed ? 'line-through' : ''}>{todo.text}</span>
                    </motion.p>
                  )}

                  {categoryByTask[todo.id] && (
                    <span className={`text-[11px] px-2 py-1 rounded-full capitalize ${getCategoryPillClasses(categoryByTask[todo.id]!)}`}>
                      {categoryByTask[todo.id]}
                    </span>
                  )}

                  {priorityByTask[todo.id] && (
                    <span className={`text-[11px] px-2 py-1 rounded-full capitalize ${getPriorityPillClasses(priorityByTask[todo.id]!)}`}>
                      {priorityByTask[todo.id]}
                    </span>
                  )}

                  <div className="relative">
                    {(() => {
                      const category = categoryByTask[todo.id];
                      if (!category) {
                        return (
                          <button
                            onClick={() => setOpenTagMenuFor(openTagMenuFor === todo.id ? null : todo.id)}
                            className="group inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] text-[#8B86A3] hover:bg-[#F1EDF9]"
                            aria-label="Add tags"
                          >
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">Add tag</span>
                            <Pencil className="w-3 h-3 opacity-55 group-hover:opacity-80 transition-opacity" />
                          </button>
                        );
                      }
                      return (
                        <button
                          onClick={() => setOpenTagMenuFor(openTagMenuFor === todo.id ? null : todo.id)}
                          className={`group inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] capitalize ${getCategoryPillClasses(category)}`}
                          aria-label="Edit tags"
                        >
                          <span>{category}</span>
                          <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity" />
                        </button>
                      );
                    })()}
                    <AnimatePresence>
                      {openTagMenuFor === todo.id && (
                        <motion.div
                          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.24 }}
                          className="absolute right-0 top-8 z-20 bg-white rounded-2xl border border-[#E8E4F3] shadow-lg p-3 w-44"
                        >
                          <p className="text-[11px] text-[#8B86A3] mb-2 uppercase tracking-wider">Category</p>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {CATEGORY_OPTIONS.map((category) => (
                              <button
                                key={category}
                                onClick={() => setCategoryByTask((prev) => ({ ...prev, [todo.id]: category }))}
                                className={`px-2 py-1 rounded-full text-[11px] capitalize ${getCategoryPillClasses(category)}`}
                              >
                                {category}
                              </button>
                            ))}
                            <button
                              onClick={() => setCategoryByTask((prev) => ({ ...prev, [todo.id]: undefined }))}
                              className="px-2 py-1 rounded-full text-[11px] bg-gray-100 text-gray-500"
                            >
                              clear
                            </button>
                          </div>
                          <p className="text-[11px] text-[#8B86A3] mb-2 uppercase tracking-wider">Priority</p>
                          <div className="flex flex-wrap gap-1.5">
                            {PRIORITY_OPTIONS.map((priority) => (
                              <button
                                key={priority}
                                onClick={() => setPriorityByTask((prev) => ({ ...prev, [todo.id]: priority }))}
                                className={`px-2 py-1 rounded-full text-[11px] capitalize ${getPriorityPillClasses(priority)}`}
                              >
                                {priority}
                              </button>
                            ))}
                            <button
                              onClick={() => setPriorityByTask((prev) => ({ ...prev, [todo.id]: undefined }))}
                              className="px-2 py-1 rounded-full text-[11px] bg-gray-100 text-gray-500"
                            >
                              clear
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    onClick={() => onDeleteTodo(todo.id)}
                    aria-label={`Delete task ${todo.text}`}
                    className="w-7 h-7 flex-shrink-0 rounded-full text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4 mx-auto" />
                  </button>

                  <AnimatePresence>
                    {xpBurstTaskId === todo.id && (
                      <motion.span
                        className="absolute right-10 -top-2 text-xs text-teal-600 font-medium"
                        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: -8 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.32 }}
                      >
                        +10 pts
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}