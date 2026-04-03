import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ChevronRight, RefreshCw, ImagePlus, Camera, Image, X, Edit } from 'lucide-react';
import { toast } from 'sonner';
import type { Todo, JournalEntry } from '../App';

interface JournalScreenProps {
  journalEntries: JournalEntry[];
  todos: Todo[];
  onAddEntry: (
    prompt: string | null,
    response: string,
    isWeeklyPrompt: boolean,
    mood?: 'heavy' | 'okay' | 'good',
    photoUrl?: string
  ) => void;
  onUpdateEntry: (
    entryId: string,
    response: string,
    photoUrl?: string
  ) => void;
}

// Daily prompts from the spec
const DAILY_PROMPTS = [
  "What's one tiny thing you could do right now that would take less than two minutes?",
  "What's one thing you're avoiding? What's the smallest first step?",
  "What's one thing that, if you did it, would make the rest of today feel easier?",
  "What's one thing circling your head that you want to set down here?",
  "What's one thing you don't want to forget tomorrow?",
  "What's one thing you're holding onto that you can let go of for now?",
  "What's one thing you did today — even if it wasn't on your list?",
  "What's one thing you started, even if you didn't finish it?",
  "What's one thing that was \"good enough\" today?",
  "What's one thing that took longer or shorter than you expected?",
  "Looking back, what actually got your time and attention today?",
  "What's one thing you thought would take forever but didn't?",
  "What's one thing that helped you focus or get started today?",
  "What's one thing that made something harder than it needed to be?",
  "What's one thing you'd do differently next time?",
  "What's one thing you're closing the door on so you can rest?",
  "What's one thing that can wait until tomorrow?",
  "What's one thing you're giving yourself permission to stop thinking about tonight?"
];

export default function JournalScreen({
  journalEntries,
  todos,
  onAddEntry,
  onUpdateEntry
}: JournalScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [activeTab, setActiveTab] = useState<'today' | 'archive'>('today');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [response, setResponse] = useState('');
  const [selectedMood, setSelectedMood] = useState<'heavy' | 'okay' | 'good' | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [inlineEditingResponse, setInlineEditingResponse] = useState('');
  const [inlineEditingPhotos, setInlineEditingPhotos] = useState<string[]>([]);

  // Close photo menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPhotoMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('.photo-menu-container')) {
          setShowPhotoMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPhotoMenu]);

  // Handle mobile keyboard with Visual Viewport API
  useEffect(() => {
    if (!window.visualViewport) return;

    const handleViewportChange = () => {
      const viewport = window.visualViewport;
      const heightDiff = window.innerHeight - viewport.height;
      setKeyboardHeight(heightDiff > 150 ? heightDiff : 0); // Only count as keyboard if significant height
    };

    // Initial check
    handleViewportChange();

    // Listen for viewport changes (keyboard open/close)
    window.visualViewport.addEventListener('resize', handleViewportChange);
    
    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
    };
  }, []);

  // Get today's date string for comparison
  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Check if there's an entry for today
  const todayEntry = journalEntries.find(entry => {
    const entryDate = new Date(entry.createdAt).toISOString().split('T')[0];
    return entryDate === getTodayDateString() && !entry.isWeeklyPrompt;
  });

  // Shuffle prompt (excluding current one)
  const shufflePrompt = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * DAILY_PROMPTS.length);
    } while (newIndex === currentPromptIndex && DAILY_PROMPTS.length > 1);
    setCurrentPromptIndex(newIndex);
  };

  // Handle photo upload (mock for now - just preview)
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos: string[] = [];
      Array.from(files).forEach((file: File) => {
        if (photoPreview.length + newPhotos.length < 3) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result;
            if (typeof result === 'string') {
              newPhotos.push(result);
              if (newPhotos.length === Math.min(files.length, 3 - photoPreview.length)) {
                setPhotoPreview([...photoPreview, ...newPhotos]);
                setShowPhotoMenu(false);
              }
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  // Remove photo
  const removePhoto = (index: number) => {
    setPhotoPreview(photoPreview.filter((_, i) => i !== index));
  };

  // Handle save
  const handleSave = () => {
    if (!response.trim()) return;

    const prompt = DAILY_PROMPTS[currentPromptIndex];
    onAddEntry(prompt, response.trim(), false, undefined, photoPreview.length > 0 ? photoPreview.join(',') : undefined);
    
    setResponse('');
    setPhotoPreview([]);
    setShowMoodSelector(true);
    
    // Automatically change to a new prompt after submission
    shufflePrompt();
    
    // Hide mood selector after 3 seconds
    setTimeout(() => {
      setShowMoodSelector(false);
      setSelectedMood(null);
    }, 3000);
  };

  // Handle mood selection
  const handleMoodSelect = (mood: 'heavy' | 'okay' | 'good') => {
    setSelectedMood(mood);
    // Update the last entry with the mood
    // Note: This would require a new function in App.tsx to update entries
    toast.success("Entry saved", { duration: 2000 });
  };

  // Format date
  const formatDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const entryDate = new Date(date);
    entryDate.setHours(0, 0, 0, 0);
    
    if (entryDate.getTime() === today.getTime()) return 'Today';
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (entryDate.getTime() === yesterday.getTime()) return 'Yesterday';
    
    return entryDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: entryDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  // Get completed tasks for a specific date
  const getCompletedTasksForDate = (date: Date) => {
    const dateString = new Date(date).toISOString().split('T')[0];
    return todos.filter(todo => {
      if (!todo.completedAt) return false;
      const completedDateString = new Date(todo.completedAt).toISOString().split('T')[0];
      return completedDateString === dateString;
    });
  };

  // Toggle entry expansion
  const toggleEntry = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  // Handle edit entry
  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntryId(entry.id);
    setInlineEditingResponse(entry.response);
    if (entry.photoUrl) {
      const photos = entry.photoUrl.split(',').filter(photo => photo.trim());
      setInlineEditingPhotos(photos);
    } else {
      setInlineEditingPhotos([]);
    }
  };

  // Handle inline save
  const handleInlineSave = () => {
    if (!inlineEditingResponse.trim() || !editingEntryId) return;
    
    const photoString = inlineEditingPhotos.length > 0 ? inlineEditingPhotos.join(',') : undefined;
    onUpdateEntry(editingEntryId, inlineEditingResponse.trim(), photoString);
    
    // Reset inline editing state
    setEditingEntryId(null);
    setInlineEditingResponse('');
    setInlineEditingPhotos([]);
  };

  // Handle inline cancel
  const handleInlineCancel = () => {
    setEditingEntryId(null);
    setInlineEditingResponse('');
    setInlineEditingPhotos([]);
  };

  // Handle update
  const handleUpdate = () => {
    if (!response.trim() || !editingEntryId) return;
    
    onUpdateEntry(editingEntryId, response.trim(), photoPreview[0]);
    
    // Reset scroll position after updating
    window.scrollTo(0, 0);
    
    setResponse('');
    setPhotoPreview([]);
    setIsEditing(false);
    setEditingEntryId(null);
    
    toast.success('Entry updated', { duration: 2000 });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setResponse('');
    setPhotoPreview([]);
    setIsEditing(false);
    setEditingEntryId(null);
  };

  // Sort entries by date, newest first
  const sortedEntries = [...journalEntries]
    .filter(entry => !entry.isWeeklyPrompt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 bg-white border-b">
        <h2 className="type-label mb-3 uppercase tracking-widest text-gray-400">TODAY'S REFLECTION</h2>
        <h2 className="mb-0 font-serif text-[2.6rem] leading-tight text-[var(--text-strong-alt)]">Journal</h2>
        <p className="mt-2 text-[14px] font-normal leading-[1.4] text-[var(--text-caption-2)]">A few words go a long way.</p>
      </div>

      {/* Content */}
      <div className="px-4 py-6" style={{ paddingBottom: `${keyboardHeight + 100}px` }}>
          {/* Prompt Card */}
          <div className="mb-5 rounded-2xl bg-white px-5 pb-5 pt-5 shadow-sm">
            {/* Editing indicator */}
            {isEditing && (
              <div className="text-center mb-4">
                <span className="type-caption text-teal-500">✏️ Editing Entry</span>
              </div>
          )}
          
          {/* Category label */}
          {!isEditing && (
            <div className="relative mb-5 flex items-center justify-center">
              <span className="type-caption text-gray-400">Daily Reflection</span>
              <motion.button
                type="button"
                onClick={shufflePrompt}
                className="type-caption absolute right-6 flex items-center text-[var(--text-caption-2)] transition-all duration-150 ease-out hover:text-[var(--accent-pill)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                aria-label="Shuffle prompt"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          )}

          {/* Prompt */}
          <div className="mb-4 flex min-h-[64px] items-start justify-center">
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentPromptIndex}
                className="w-full text-center text-[var(--text-strong)] [font-family:var(--font-family-display)] [font-size:1.375rem] [font-weight:var(--type-headline-weight)] [line-height:1.2]"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
              >
                {DAILY_PROMPTS[currentPromptIndex]}
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* Photo preview if exists */}
          {photoPreview.filter(photo => {
            return photo && 
                   photo.trim() && 
                   photo !== 'data:image/png;base64,' &&
                   photo !== 'data:image/png;base64' &&
                   photo.length > 'data:image/png;base64,'.length;
          }).length > 0 && (
            <div className="flex gap-3 mb-4 flex-wrap">
              {photoPreview.filter(photo => {
                return photo && 
                       photo.trim() && 
                       photo !== 'data:image/png;base64,' &&
                       photo !== 'data:image/png;base64' &&
                       photo.length > 'data:image/png;base64,'.length;
              }).map((photo, index) => (
                <div 
                  key={index}
                  className="relative group bg-white p-2 shadow-lg"
                  style={{
                    width: '100px',
                    paddingBottom: '12px',
                  }}
                >
                  {/* Polaroid photo */}
                  <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => {
                      const newPreview = photoPreview.filter((_, i) => i !== index);
                      setPhotoPreview(newPreview);
                    }}
                    className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--text-strong-alt)] text-white transition-all duration-200 opacity-0 group-hover:opacity-100 hover:bg-[var(--text-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Text area */}
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Answer here..."
            aria-label="Journal response"
            className="type-body min-h-[116px] w-full resize-none rounded-xl border border-[var(--accent-soft-border-2)] bg-[var(--surface-base)] p-4 text-[var(--text-strong-alt)] placeholder:text-[var(--text-caption-4)] focus:border-[var(--accent-pill)] focus:outline-none focus:ring-2 focus:ring-[color:var(--shadow-focus-ring-journal)]"
          />

          {/* Bottom actions */}
          <div className="mt-3 flex items-center justify-between">
            {/* Photo upload with menu */}
            <div className="relative photo-menu-container">
              <button
                type="button"
                onClick={() => setShowPhotoMenu(!showPhotoMenu)}
                disabled={photoPreview.length >= 3}
                className={`flex items-center gap-2 transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${
                  photoPreview.length >= 3 
                    ? 'text-gray-300' 
                    : 'cursor-pointer text-gray-400 hover:text-[var(--text-body-muted)]'
                }`}
              >
                <ImagePlus className="w-5 h-5" />
                <span className="type-caption">
                  {photoPreview.length === 0 ? 'Add a photo' : `Add photo (${photoPreview.length}/3)`}
                </span>
              </button>

              {/* Photo options menu */}
              <AnimatePresence>
                {showPhotoMenu && photoPreview.length < 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute bottom-full left-0 z-10 mb-2 overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-base)] shadow-lg"
                  >
                    {/* Camera option */}
                    <label className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-hover-panel-muted)] whitespace-nowrap">
                      <Camera className="h-5 w-5 text-[var(--text-caption-2)]" />
                      <span className="type-caption text-[var(--text-strong-alt)]">Take photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        onChange={(e) => handlePhotoSelect(e)}
                        className="hidden"
                      />
                    </label>
                    {/* Gallery option */}
                    <label className="flex cursor-pointer items-center gap-3 border-t border-[var(--border-soft)] px-4 py-3 transition-colors hover:bg-[var(--surface-hover-panel-muted)] whitespace-nowrap">
                      <Image className="h-5 w-5 text-[var(--text-caption-2)]" />
                      <span className="type-caption text-[var(--text-strong-alt)]">Choose from gallery</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handlePhotoSelect(e)}
                        className="hidden"
                      />
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Save/Update buttons */}
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="type-body rounded-full bg-[var(--surface-panel-track-disabled)] px-6 py-3 text-[var(--text-body-muted)] transition-all duration-150 ease-out hover:bg-[var(--surface-panel-track-neutral)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={!response.trim()}
                  className="type-body rounded-full bg-[var(--accent-teal)] px-8 py-3 text-white transition-all duration-150 ease-out hover:bg-[var(--accent-teal-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-accent-40)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Update
                </button>
              </div>
            ) : (
              <motion.button
                type="button"
                onClick={handleSave}
                disabled={!response.trim()}
                className="type-body rounded-full bg-[var(--accent-teal)] px-8 py-3 text-white transition-all duration-150 ease-out hover:bg-[var(--accent-teal-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-accent-40)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                animate={
                  !response.trim()
                    ? { scale: 1 }
                    : prefersReducedMotion
                      ? { opacity: 1 }
                      : { scale: [1, 1.03, 1] }
                }
                transition={{ duration: 0.32, repeat: !response.trim() || prefersReducedMotion ? 0 : Infinity, repeatDelay: 2.2 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
              >
                Save
              </motion.button>
            )}
          </div>
        </div>

          
          {/* Past entries */}
          <div className="space-y-4">
            <AnimatePresence>
              {sortedEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="rounded-2xl bg-white px-5 py-4 shadow-sm group relative"
                style={{
                  border: editingEntryId === entry.id ? '2px solid var(--accent-teal)' : 'none'
                }}
              >
                {/* Edit/Save/Cancel buttons */}
                {editingEntryId === entry.id ? (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={handleInlineSave}
                      className="text-[var(--accent-teal)] hover:text-[var(--accent-teal-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-accent-40)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      aria-label="Save entry"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleInlineCancel}
                      className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-accent-40)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      aria-label="Cancel editing"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Edit button clicked!');
                      handleEditEntry(entry);
                    }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-accent-40)] focus-visible:ring-offset-2 focus-visible:ring-offset-white cursor-pointer"
                    aria-label="Edit entry"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
                  
                  <div className="mb-2 text-xs text-gray-400">
                    {new Date(entry.createdAt).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  {entry.prompt && (
                    <p className="mb-2 text-left text-[var(--text-strong)] [font-family:var(--font-family-display)] [font-size:1rem] [font-weight:var(--type-headline-weight)] [line-height:1.2]">
                      {entry.prompt}
                    </p>
                  )}
                  
                  {/* Response - either display or edit */}
                  {editingEntryId === entry.id ? (
                    <textarea
                      value={inlineEditingResponse}
                      onChange={(e) => setInlineEditingResponse(e.target.value)}
                      className="w-full min-h-[100px] rounded-lg border border-gray-300 px-3 py-2 text-sm text-[var(--text-strong-alt)] focus:border-[var(--accent-teal)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                      placeholder="Edit your response..."
                    />
                  ) : (
                    <p className="text-sm text-[var(--text-strong-alt)] whitespace-pre-wrap">{entry.response}</p>
                  )}
                  
                  {/* Photos - either display or edit */}
                  {editingEntryId === entry.id ? (
                    <div className="mt-3">
                      {/* Current photos with remove buttons */}
                      {inlineEditingPhotos.filter(photo => {
                        return photo && 
                               photo.trim() && 
                               photo !== 'data:image/png;base64,' &&
                               photo !== 'data:image/png;base64' &&
                               photo.length > 'data:image/png;base64,'.length;
                      }).length > 0 && (
                        <div className="flex gap-3 mb-3 flex-wrap">
                          {inlineEditingPhotos.filter(photo => {
                            return photo && 
                                   photo.trim() && 
                                   photo !== 'data:image/png;base64,' &&
                                   photo !== 'data:image/png;base64' &&
                                   photo.length > 'data:image/png;base64,'.length;
                          }).map((photo, index) => (
                            <div 
                              key={index}
                              className="relative group bg-white p-2 shadow-lg"
                              style={{
                                width: '100px',
                                paddingBottom: '12px',
                              }}
                            >
                              {/* Polaroid photo */}
                              <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                                <img
                                  src={photo}
                                  alt={`Photo ${index + 1}`}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              
                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={() => {
                                  const newPhotos = inlineEditingPhotos.filter((_, i) => i !== index);
                                  setInlineEditingPhotos(newPhotos);
                                }}
                                className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--text-strong-alt)] text-white transition-all duration-200 opacity-0 group-hover:opacity-100 hover:bg-[var(--text-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--shadow-focus-ring-dark-soft)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Add photo button */}
                      {inlineEditingPhotos.length < 3 && (
                        <div className="photo-menu-container relative">
                          <button
                            type="button"
                            onClick={() => setShowPhotoMenu(!showPhotoMenu)}
                            className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600"
                          >
                            <ImagePlus className="h-4 w-4" />
                            Add Photo
                          </button>
                          
                          {/* Photo menu */}
                          {showPhotoMenu && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute bottom-full left-0 z-10 mb-2 overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-base)] shadow-lg"
                            >
                              {/* Camera option */}
                              <label className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-hover-panel-muted)] whitespace-nowrap">
                                <Camera className="h-5 w-5 text-[var(--text-caption-2)]" />
                                <span className="type-caption text-[var(--text-strong-alt)]">Take photo</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  multiple
                                  onChange={(e) => {
                                    const files = e.target.files;
                                    if (files) {
                                      const newPhotos: string[] = [];
                                      Array.from(files).forEach((file: File) => {
                                        if (inlineEditingPhotos.length + newPhotos.length < 3) {
                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                            const result = reader.result;
                                            if (typeof result === 'string') {
                                              newPhotos.push(result);
                                              if (newPhotos.length === Math.min(files.length, 3 - inlineEditingPhotos.length)) {
                                                setInlineEditingPhotos([...inlineEditingPhotos, ...newPhotos]);
                                                setShowPhotoMenu(false);
                                              }
                                            }
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      });
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>
                              {/* Gallery option */}
                              <label className="flex cursor-pointer items-center gap-3 border-t border-[var(--border-soft)] px-4 py-3 transition-colors hover:bg-[var(--surface-hover-panel-muted)] whitespace-nowrap">
                                <Image className="h-5 w-5 text-[var(--text-caption-2)]" />
                                <span className="type-caption text-[var(--text-strong-alt)]">Choose from gallery</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => {
                                    const files = e.target.files;
                                    if (files) {
                                      const newPhotos: string[] = [];
                                      Array.from(files).forEach((file: File) => {
                                        if (inlineEditingPhotos.length + newPhotos.length < 3) {
                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                            const result = reader.result;
                                            if (typeof result === 'string') {
                                              newPhotos.push(result);
                                              if (newPhotos.length === Math.min(files.length, 3 - inlineEditingPhotos.length)) {
                                                setInlineEditingPhotos([...inlineEditingPhotos, ...newPhotos]);
                                                setShowPhotoMenu(false);
                                              }
                                            }
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      });
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>
                            </motion.div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    entry.photoUrl && (
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
                              <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                                <img
                                  src={finalSrc}
                                  alt={`Journal photo ${photoIndex + 1}`}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
