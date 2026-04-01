import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Check } from 'lucide-react';
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
  // Only show active/incomplete tasks
  const activeTodos = todos.filter(todo => !todo.completed && !todo.destroyedAt);
  const [newTodoText, setNewTodoText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

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
    onToggleTodo(id);
    if (!completed) {
      toast.success('Task complete', { duration: 2000 });
    }
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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-24 pt-4">
        {/* Header */}
        <h2 className="font-serif text-4xl mb-6 text-gray-900">Tasks</h2>

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
        {activeTodos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No tasks yet</p>
            <p className="text-gray-300 text-sm mt-2">Add your first task above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeTodos.map((todo) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-sm p-4"
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggle(todo.id, todo.completed)}
                    className="w-6 h-6 flex-shrink-0 rounded-full border-2 border-gray-300 hover:border-teal-500 flex items-center justify-center transition-colors mt-0.5"
                  >
                    {todo.completed && (
                      <Check className="w-4 h-4 text-teal-500" />
                    )}
                  </button>

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
                    <p
                      onClick={() => startEditing(todo.id, todo.text)}
                      className="flex-1 text-gray-700 cursor-text hover:text-gray-900 transition-colors"
                    >
                      {todo.text}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}