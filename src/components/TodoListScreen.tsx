import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';

import { Button } from './ui/button';
import { Input } from './ui/input';
import PixelCheckbox from './PixelCheckbox';
import { toast } from 'sonner@2.0.3';
import type { Todo } from '../App';
import pixelThumbsUp from 'figma:asset/21c806672f1b177eab013545866a7531db314cdf.png';
import pixelNoTasksIcon from 'figma:asset/5765ff71efcec8f85a51ea67d9c56fb1dafbd5a1.png';

interface TodoListScreenProps {
  todos: Todo[];
  onAddTodo: (text: string, isFirstTime?: boolean) => void;
  onToggleTodo: (id: string) => void;
  onEditTodo: (id: string, newText: string) => void;
  onReorderTodos: (dragIndex: number, hoverIndex: number) => void;
  onDeleteTodo: (id: string) => void;
}

interface DropZoneProps {
  position: 'top' | 'bottom';
  isActive: boolean;
  onDrop: () => void;
}

const DropZone: React.FC<DropZoneProps> = ({ position, isActive, onDrop }) => {
  return (
    <motion.div
      className={`drop-zone-${position} transition-all duration-200 ${
        isActive 
          ? 'h-12 opacity-100' 
          : 'h-6 opacity-30'
      }`}
      initial={{ height: 24, opacity: 0.3 }}
      animate={{ 
        height: isActive ? 48 : 24, 
        opacity: isActive ? 1 : 0.3
      }}
    >
      <div
        className={`h-full mx-3 rounded-lg border-2 border-dashed transition-all duration-200 flex items-center justify-center ${
          isActive 
            ? 'border-cyan-500 bg-gradient-to-r from-cyan-400/25 via-cyan-500/35 to-cyan-400/25 shadow-md shadow-cyan-500/30'
            : 'border-cyan-300/30 bg-cyan-100/10'
        }`}
      >
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-xs font-pixel text-cyan-700"
          >
            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
            Move to {position}
            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

interface TodoItemProps {
  todo: Todo;
  index: number;
  editingId: string | null;
  editingText: string;
  onToggleTodo: (id: string, completed: boolean) => void;
  onStartEditing: (id: string, text: string) => void;
  onEditKeyDown: (e: React.KeyboardEvent) => void;
  onSetEditingText: (text: string) => void;
  onSaveEdit: () => void;
  onMoveTask: (dragIndex: number, hoverIndex: number) => void;
  draggedIndex: number | null;
  setDraggedIndex: (index: number | null) => void;
  dragOverIndex: number | null;
  setDragOverIndex: (index: number | null) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  index,
  editingId,
  editingText,
  onToggleTodo,
  onStartEditing,
  onEditKeyDown,
  onSetEditingText,
  onSaveEdit,
  onMoveTask,
  draggedIndex,
  setDraggedIndex,
  dragOverIndex,
  setDragOverIndex,
}) => {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isPressing, setIsPressing] = useState(false);
  const [isDragMode, setIsDragMode] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [initialTouchPos, setInitialTouchPos] = useState({ x: 0, y: 0 });
  const [currentTouchPos, setCurrentTouchPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Enhanced interaction handlers for drag and edit differentiation
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Don't start drag on interactive elements or edit zones
    if (target.tagName === 'INPUT' ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'TEXTAREA' ||
        target.getAttribute('role') === 'textbox' ||
        target.closest('.pixel-checkbox') ||
        target.closest('.edit-text-area') ||
        target.closest('input[type="text"]') ||
        target.closest('input[type="email"]') ||
        editingId === todo.id) {
      return;
    }

    // Determine if this is a touch or mouse event
    const isTouchEvent = 'touches' in e;
    const clientX = isTouchEvent ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = isTouchEvent ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;

    setInitialTouchPos({ x: clientX, y: clientY });
    setCurrentTouchPos({ x: clientX, y: clientY });
    setIsPressing(true);

    // For mouse events (desktop/tablet), start drag immediately
    // For touch events (mobile), use long press
    const delay = isTouchEvent ? 200 : 0;
    
    const timer = setTimeout(() => {
      if ('vibrate' in navigator && isTouchEvent) {
        navigator.vibrate([100, 50, 100]);
      }
      setIsDragMode(true);
      setDraggedIndex(index);
      setIsDragging(true);
      
      const scrollContainer = document.getElementById('tasks-scroll-container');
      if (scrollContainer) {
        scrollContainer.style.overflow = 'hidden';
        scrollContainer.style.touchAction = 'none';
      }
      
      document.body.classList.add('dragging-active');
      document.body.style.cursor = 'grabbing';
      
      // Add drag mode feedback
      import('sonner@2.0.3').then(({ toast }) => {
        toast('Drag mode! 🎯', { duration: 2000 });
      });
    }, delay);

    setLongPressTimer(timer);
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    const isTouchEvent = 'touches' in e;
    const clientX = isTouchEvent ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = isTouchEvent ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const deltaX = Math.abs(clientX - initialTouchPos.x);
    const deltaY = Math.abs(clientY - initialTouchPos.y);
    
    setCurrentTouchPos({ x: clientX, y: clientY });

    // Cancel long press if user moves too much before drag starts (touch only)
    if (isTouchEvent && (deltaX > 20 || deltaY > 20) && longPressTimer && !isDragMode) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
      setIsPressing(false);
      return;
    }

    // Handle drag movement
    if (isDragMode && draggedIndex === index) {
      e.preventDefault();
      if ('stopPropagation' in e) e.stopPropagation();
      
      // Find which item we're hovering over
      const elements = document.elementsFromPoint(clientX, clientY);
      const taskElement = elements.find(el => 
        el.classList.contains('reorderable-task') && 
        el !== dragRef.current
      );
      
      let newDragOverIndex = null;
      
      if (taskElement) {
        const hoverIndex = parseInt(taskElement.getAttribute('data-index') || '0');
        if (hoverIndex !== index) {
          newDragOverIndex = hoverIndex;
        }
      } else {
        // Check for drop zones
        const scrollContainer = document.getElementById('tasks-scroll-container');
        const containerRect = scrollContainer?.getBoundingClientRect();
        
        if (containerRect) {
          const relativeY = clientY - containerRect.top;
          const containerHeight = containerRect.height;
          const dropZoneHeight = 60;
          
          if (relativeY < dropZoneHeight) {
            newDragOverIndex = -1;
          } else if (relativeY > containerHeight - dropZoneHeight) {
            const activeTodos = document.querySelectorAll('.reorderable-task').length;
            newDragOverIndex = activeTodos;
          }
        }
      }
      
      // Update drag over index with feedback
      if (newDragOverIndex !== dragOverIndex) {
        setDragOverIndex(newDragOverIndex);
        if ('vibrate' in navigator && isTouchEvent) {
          navigator.vibrate(30);
        }
      }
    }
  };

  const handleDragEnd = () => {
    setIsPressing(false);
    setIsDragMode(false);
    setIsDragging(false);
    
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    // Restore scrolling and cursor
    const scrollContainer = document.getElementById('tasks-scroll-container');
    if (scrollContainer) {
      scrollContainer.style.overflow = 'auto';
      scrollContainer.style.touchAction = 'auto';
    }

    document.body.classList.remove('dragging-active');
    document.body.style.cursor = '';

    // Complete the reorder
    if (draggedIndex === index && dragOverIndex !== null) {
      let targetIndex = dragOverIndex;
      
      if (dragOverIndex === -1) {
        targetIndex = 0;
      } else if (dragOverIndex >= document.querySelectorAll('.reorderable-task').length) {
        targetIndex = document.querySelectorAll('.reorderable-task').length - 1;
      }
      
      if (targetIndex !== index) {
        onMoveTask(index, targetIndex);
        
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
        
        import('sonner@2.0.3').then(({ toast }) => {
          let message = 'Task moved! 📋';
          if (dragOverIndex === -1) {
            message = 'Task moved to top! ⬆️';
          } else if (dragOverIndex >= document.querySelectorAll('.reorderable-task').length) {
            message = 'Task moved to bottom! ⬇️';
          }
          toast.success(message, { duration: 2000 });
        });
      }
    }
    
    setTimeout(() => {
      setDraggedIndex(null);
      setDragOverIndex(null);
    }, 100);
  };

  const isBeingDragged = draggedIndex === index;
  const isDropTarget = dragOverIndex === index && draggedIndex !== null && draggedIndex !== index;
  const isDragModeActive = isDragMode && isBeingDragged;

  // Enhanced global mouse event handling for desktop drag
  React.useEffect(() => {
    if (isDragMode && isBeingDragged) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleDragMove(e as any);
      };
      
      const handleGlobalMouseUp = (e: MouseEvent) => {
        handleDragEnd();
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragMode, isBeingDragged, dragOverIndex]);

  // Auto-resize textarea when editing starts
  useEffect(() => {
    if (editingId === todo.id && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [editingId, todo.id, editingText]);

  return (
    <motion.div
      ref={dragRef}
      data-index={index}
      className={`reorderable-task group relative ${isBeingDragged ? 'z-50' : 'z-10'} ${isDragModeActive ? 'touch-none' : 'touch-manipulation'}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ 
        opacity: isBeingDragged ? 0.95 : 1,
        x: 0,
        scale: isBeingDragged ? 1.05 : 1,
        rotateZ: isBeingDragged ? 2 : 0,
        y: isDragModeActive ? (currentTouchPos.y - initialTouchPos.y) * 0.3 : 0
      }}
      transition={{ 
        delay: isBeingDragged ? 0 : 0,
        type: isDragModeActive ? "tween" : "spring",
        duration: isDragModeActive ? 0 : undefined,
        stiffness: isBeingDragged ? 400 : 200,
        damping: isBeingDragged ? 30 : 25
      }}
      style={{
        zIndex: isBeingDragged ? 1000 : 1,
        willChange: isDragModeActive ? 'transform' : 'auto'
      }}
    >
      {/* Enhanced drop indicator above */}
      {isDropTarget && draggedIndex !== null && draggedIndex > index && (
        <motion.div
          initial={{ scaleX: 0, opacity: 0, height: 2 }}
          animate={{ scaleX: 1, opacity: 1, height: 4 }}
          className="absolute -top-2 left-0 right-0 bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-400 rounded-full shadow-lg shadow-cyan-500/60 drop-indicator"
          style={{ zIndex: 15 }}
        >
          <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
        </motion.div>
      )}

      <div 
        className={`flex items-center gap-1 py-0 px-2 rounded-lg transition-all duration-200 relative ${
          isBeingDragged 
            ? 'bg-white/95 shadow-2xl shadow-cyan-500/40 border-2 border-cyan-500/60 ring-4 ring-cyan-500/20' 
            : isDropTarget
              ? 'bg-cyan-50/80 border-2 border-cyan-300/60 transform scale-[1.02]' 
              : isPressing
                ? 'bg-cyan-50/40 transform scale-[0.98]'
                : 'hover:bg-white/60 border border-white/20'
        } ${isDragModeActive ? 'touch-none select-none' : 'touch-manipulation'}`}
        style={{
          cursor: isBeingDragged ? 'grabbing' : isPressing ? 'grabbing' : 'grab',
          touchAction: isDragModeActive ? 'none' : 'manipulation',
          userSelect: isDragModeActive ? 'none' : 'auto',
          WebkitUserSelect: isDragModeActive ? 'none' : 'auto'
        }}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onTouchCancel={handleDragEnd}
        onMouseDown={handleDragStart}
      >
        
        {/* Drag handle indicator - visible on press or when dragging any item */}
        {(isPressing || draggedIndex !== null) && (
          <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-cyan-500/40 rounded-full pointer-events-none transition-opacity duration-200" />
        )}
        
        {/* Visual drag feedback overlay */}
        {isBeingDragged && (
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-cyan-500/10 rounded-xl pointer-events-none" />
        )}

        <PixelCheckbox
          checked={todo.completed}
          onChange={() => onToggleTodo(todo.id, todo.completed)}
          className="flex-shrink-0"
          aria-label={`Mark task "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
        />
        
        <div className="flex-1 min-w-0 edit-zone group relative">
          {editingId === todo.id ? (
            <textarea
              ref={textareaRef}
              value={editingText}
              onChange={(e) => onSetEditingText(e.target.value)}
              onKeyDown={onEditKeyDown}
              onBlur={onSaveEdit}
              className="w-full bg-white/95 border-2 border-blue-400 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-base px-3 py-2 min-h-[44px] resize-none overflow-hidden"
              autoFocus
              aria-label="Edit task"
              rows={1}
              style={{
                height: 'auto',
                minHeight: '44px'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
          ) : (
            <div 
              className={`edit-text-area break-words text-base leading-snug rounded-md px-2 pt-0 pb-1 transition-all duration-200 ${
                todo.completed 
                  ? 'text-gray-500 line-through cursor-default' 
                  : isBeingDragged
                    ? 'text-gray-900 cursor-default pointer-events-none'
                    : 'text-gray-900 cursor-text hover:bg-blue-50/70 hover:shadow-sm border border-transparent hover:border-blue-200/50'
              }`}
              onClick={() => !todo.completed && !isBeingDragged && !isDragMode && onStartEditing(todo.id, todo.text)}
              role={todo.completed ? undefined : "button"}
              tabIndex={todo.completed || isBeingDragged ? -1 : 0}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !todo.completed && !isBeingDragged && !isDragMode) {
                  e.preventDefault();
                  onStartEditing(todo.id, todo.text);
                }
              }}
              aria-label={todo.completed ? undefined : `Click to edit task: ${todo.text}`}
              title={todo.completed ? undefined : "Click to edit"}
            >
              {/* Edit hint */}
              {!todo.completed && !isBeingDragged && (
                <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-pixel text-[8px]">
                    EDIT
                  </div>
                </div>
              )}
              {todo.text}
            </div>
          )}
          
          {todo.completed && todo.completedAt && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-green-600 mt-0"
            >
              ✓ Completed {new Date(todo.completedAt).toLocaleDateString()}
            </motion.p>
          )}
        </div>


      </div>

      {/* Enhanced drop indicator below */}
      {isDropTarget && draggedIndex !== null && draggedIndex < index && (
        <motion.div
          initial={{ scaleX: 0, opacity: 0, height: 2 }}
          animate={{ scaleX: 1, opacity: 1, height: 4 }}
          className="absolute -bottom-2 left-0 right-0 bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-400 rounded-full shadow-lg shadow-cyan-500/60 drop-indicator"
          style={{ zIndex: 15 }}
        >
          <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
        </motion.div>
      )}
    </motion.div>
  );
};

export default function TodoListScreen({
  todos,
  onAddTodo,
  onToggleTodo,
  onEditTodo,
  onReorderTodos,
  onDeleteTodo,
}: TodoListScreenProps) {
  // Only show active/incomplete tasks on main screen (exclude destroyed tasks)
  const activeTodos = todos.filter(todo => !todo.completed && !todo.destroyedAt);
  const [newTodoText, setNewTodoText] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmitNewTask();
    }
  };

  const handleSubmitNewTask = () => {
    if (newTodoText.trim()) {
      onAddTodo(newTodoText.trim(), isFirstTime);
      setNewTodoText('');
      setIsFirstTime(false); // Reset the toggle after submission
      toast.success('Task added! 🎉', { duration: 3000 });
    }
  };

  const handleToggleTodo = (id: string, completed: boolean) => {
    const task = todos.find(t => t.id === id);
    onToggleTodo(id);
    if (!completed) {
      // Show positive reinforcement messages, then task moves to game screen
      // Check if it was marked as first time
      if (task?.isFirstTime) {
        const firstTimeMessages = [
          "First time doing that — and you did it.",
          "You just did something new. That counts.",
          "First time. Done. Moving forward.",
          "New thing, handled. You showed up.",
          "That was your first time. You figured it out."
        ];
        const randomMessage = firstTimeMessages[Math.floor(Math.random() * firstTimeMessages.length)];
        toast.success(randomMessage, { duration: 3500 });
      } else {
        const encouragementMessages = [
          "That's one less thing weighing on you.",
          "You showed up today. That matters.",
          "Small win. Real progress.",
          "Adulting is hard. You're doing it anyway.",
          "One thing at a time. You're getting there.",
          "Done. What's next?"
        ];
        
        const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
        toast.success(randomMessage, { duration: 3500 });
      }
    }
  };

  const handleDeleteTodo = (id: string) => {
    onDeleteTodo(id);
    toast('Task removed', { duration: 2500 });
  };

  const startEditing = (id: string, currentText: string) => {
    setEditingId(id);
    setEditingText(currentText);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  const saveEdit = () => {
    if (editingId) {
      const trimmedText = editingText.trim();
      const originalText = todos.find(t => t.id === editingId)?.text;
      
      if (trimmedText === '') {
        // Delete task if all text is removed
        onDeleteTodo(editingId);
        toast.success('Task deleted! 🗑️', { duration: 2500 });
      } else if (trimmedText !== originalText) {
        // Update task if text changed
        onEditTodo(editingId, trimmedText);
        toast.success('Task updated! ✏️', { duration: 2500 });
      }
    }
    cancelEditing();
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  };

  const moveTask = (dragIndex: number, hoverIndex: number) => {
    onReorderTodos(dragIndex, hoverIndex);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Floating Game UI Container */}
      <div className="flex-1 p-4 flex flex-col min-h-0">
        {/* Header Container */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex-shrink-0"
        >
          <div className="pixel-notebook backdrop-blur-xl rounded-2xl shadow-lg border border-white/60 p-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-pixel text-gray-900" role="heading" aria-level="1">Tasks</h1>
                <p className="text-sm text-gray-600" aria-live="polite">
                  {activeTodos.length} remaining
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Todo List Container with Sticky Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="pixel-notebook backdrop-blur-xl rounded-2xl shadow-lg border border-white/60 flex-1 flex flex-col min-h-0">
            {/* Sticky Input Section at Top of List */}
            <div className="sticky top-0 z-10 pixel-notebook backdrop-blur-xl border-b border-white/60 p-6 flex-shrink-0 rounded-t-2xl overflow-hidden">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="What needs to be done?"
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    className="flex-1 bg-white border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    aria-label="Add new task"
                  />
                  <Button
                    onClick={handleSubmitNewTask}
                    size="sm"
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-pixel text-[10px] border-2 border-slate-800 shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg min-w-[70px]"
                  >
                    Submit
                  </Button>
                </div>
                
                {/* First time toggle - only show when typing */}
                {newTodoText.trim().length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-2 px-1 py-1"
                  >
                    <button
                      onClick={() => setIsFirstTime(!isFirstTime)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all duration-200 font-pixel text-[10px] shadow-sm hover:shadow-md ${
                        isFirstTime 
                          ? 'bg-cyan-500 border-cyan-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <span>First time doing this?</span>
                    </button>
                  </motion.div>
                )}
                
                <div className="text-xs text-gray-500 px-1">
                  💡 <span className="font-medium">Pro tip:</span> Press Enter to add • Long press any task to drag & reorder • Tap text area to edit • Delete text to remove!
                </div>
              </div>
            </div>

            {/* Scrollable Tasks Container */}
            <div 
              className="flex-1 min-h-0 overflow-y-auto custom-scrollbar" 
              style={{ WebkitOverflowScrolling: 'touch', height: 'auto', maxHeight: '100%' }}
              id="tasks-scroll-container"
            >
              <div className="px-6 pt-0 pb-0">
                {activeTodos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-600 py-8">
                    <div className="flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
                      {todos.length === 0 ? (
                        <>
                          <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center mb-4">
                        <img 
                          src={pixelNoTasksIcon}
                          alt="Pixelated notebook icon for empty task list"
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
                          <p className="text-lg font-medium text-gray-700 text-center">
                            No tasks yet
                          </p>
                          <p className="text-sm text-center text-gray-500 max-w-xs">
                            Type in the text field above to add your first task
                          </p>
                        </>
                      ) : (
                        <>
                          
                          <h2 className="text-xl font-medium text-gray-700 text-center">
                            All tasks completed!
                          </h2>
                          <p className="text-sm text-center text-gray-500 max-w-xs">
                            Great job! Add more tasks or check the game screen to destroy completed ones!
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="-space-y-6 md:-space-y-2 lg:space-y-1 py-0">
                    {/* Top Drop Zone - Only show when dragging */}
                    {draggedIndex !== null && (
                      <DropZone
                        position="top"
                        isActive={dragOverIndex === -1}
                        onDrop={() => {
                          if (draggedIndex !== null) {
                            moveTask(draggedIndex, 0);
                          }
                        }}
                      />
                    )}
                    
                    {activeTodos.map((todo, index) => (
                      <React.Fragment key={todo.id}>
                        <TodoItem
                          todo={todo}
                          index={index}
                          editingId={editingId}
                          editingText={editingText}
                          onToggleTodo={handleToggleTodo}
                          onStartEditing={startEditing}
                          onEditKeyDown={handleEditKeyDown}
                          onSetEditingText={setEditingText}
                          onSaveEdit={saveEdit}
                          onMoveTask={moveTask}
                          draggedIndex={draggedIndex}
                          setDraggedIndex={setDraggedIndex}
                          dragOverIndex={dragOverIndex}
                          setDragOverIndex={setDragOverIndex}
                        />
                        
                        {/* Drop indicator between tasks */}
                        {draggedIndex !== null && dragOverIndex === index && draggedIndex !== index && (
                          <motion.div
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ scaleX: 1, opacity: 1 }}
                            className="h-1 bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-400 rounded-full mx-4 drop-indicator my-1"
                            style={{ zIndex: 15 }}
                          />
                        )}
                      </React.Fragment>
                    ))}
                    
                    {/* Bottom Drop Zone - Only show when dragging */}
                    {draggedIndex !== null && (
                      <DropZone
                        position="bottom"
                        isActive={dragOverIndex === activeTodos.length}
                        onDrop={() => {
                          if (draggedIndex !== null) {
                            moveTask(draggedIndex, activeTodos.length - 1);
                          }
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}