import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ChevronRight, RefreshCw, ImagePlus, Camera, Image, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
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
    const file = e.target.files?.[0];
    if (file && photoPreview.length < 3) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview([...photoPreview, reader.result as string]);
        setShowPhotoMenu(false);
      };
      reader.readAsDataURL(file);
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
    onAddEntry(prompt, response.trim(), false, undefined, photoPreview[0] || undefined);
    
    setResponse('');
    setPhotoPreview([]);
    setShowMoodSelector(true);
    
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
    setIsEditing(true);
    setEditingEntryId(entry.id);
    setResponse(entry.response);
    if (entry.photoUrl) {
      setPhotoPreview([entry.photoUrl]);
    }
    // Find the prompt index
    const promptIndex = DAILY_PROMPTS.indexOf(entry.prompt || '');
    if (promptIndex !== -1) {
      setCurrentPromptIndex(promptIndex);
    }
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle update
  const handleUpdate = () => {
    if (!response.trim() || !editingEntryId) return;
    
    onUpdateEntry(editingEntryId, response.trim(), photoPreview[0]);
    
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
    <div className="flex flex-col h-full overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-24 pt-4">
        {/* Header */}
        <h2 className="text-xs tracking-widest text-gray-400 mb-6 uppercase">Today's Entry</h2>

        {/* Prompt Card */}
        <div className="bg-white rounded-3xl shadow-sm p-8 mb-6">
          {/* Editing indicator */}
          {isEditing && (
            <div className="text-center mb-4">
              <span className="text-sm text-teal-500 font-medium">✏️ Editing Entry</span>
            </div>
          )}
          
          {/* Category label */}
          {!isEditing && (
            <div className="text-center mb-4 relative">
              <span className="text-sm text-gray-400">Daily Reflection</span>
              <motion.button
                onClick={shufflePrompt}
                className="absolute -top-1 right-0 flex items-center text-xs text-[#8B86A3] hover:text-[#696A8E] transition-colors"
                whileTap={prefersReducedMotion ? {} : { scale: 0.96 }}
                aria-label="Shuffle prompt"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          )}

          {/* Prompt */}
          <div className="h-[112px] mb-4 px-2 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentPromptIndex}
                className="font-serif text-2xl text-center text-gray-900 leading-tight"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
              >
                {DAILY_PROMPTS[currentPromptIndex]}
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* Text area */}
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Answer here..."
            aria-label="Journal response"
            className="w-full min-h-[220px] border border-[#D9D4E8] resize-none text-[#2D2B3E] placeholder:text-[#8F89A8] rounded-xl bg-white mx-[4px] my-[0px] p-4 leading-7 focus:outline-none focus:ring-2 focus:ring-[#696A8E]/35 focus:border-[#696A8E]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />

          {/* Photo preview if exists */}
          {photoPreview.length > 0 && (
            <div className="flex gap-3 mt-4 mb-4 flex-wrap">
              {photoPreview.map((photo, index) => (
                <div 
                  key={index}
                  className="relative bg-white p-2 shadow-lg"
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
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Remove button */}
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-teal-500 text-white rounded-full p-1 shadow-md hover:bg-teal-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bottom actions */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
            {/* Photo upload with menu */}
            <div className="relative photo-menu-container">
              <button
                onClick={() => setShowPhotoMenu(!showPhotoMenu)}
                disabled={photoPreview.length >= 3}
                className={`flex items-center gap-2 transition-colors ${
                  photoPreview.length >= 3 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-400 hover:text-gray-600 cursor-pointer'
                }`}
              >
                <ImagePlus className="w-5 h-5" />
                <span className="text-sm">
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
                    className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-lg border border-[#E8E4F3] overflow-hidden z-10"
                  >
                    {/* Camera option */}
                    <label className="flex items-center gap-3 px-4 py-3 hover:bg-[#EBE8F4] cursor-pointer transition-colors">
                      <Camera className="w-5 h-5 text-[#8B86A3]" />
                      <span className="text-sm text-[#2D2B3E] font-light">Take photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>

                    {/* Gallery option */}
                    <label className="flex items-center gap-3 px-4 py-3 hover:bg-[#EBE8F4] cursor-pointer transition-colors border-t border-[#E8E4F3]">
                      <Image className="w-5 h-5 text-[#8B86A3]" />
                      <span className="text-sm text-[#2D2B3E] font-light">Choose from gallery</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
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
                  onClick={handleCancelEdit}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full transition-colors font-light"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={!response.trim()}
                  className="px-8 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-full transition-colors font-medium"
                >
                  Update
                </button>
              </div>
            ) : (
              <motion.button
                onClick={handleSave}
                disabled={!response.trim()}
                className="px-8 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-full transition-colors font-medium"
                animate={
                  !response.trim()
                    ? { scale: 1 }
                    : prefersReducedMotion
                      ? { opacity: 1 }
                      : { scale: [1, 1.03, 1] }
                }
                transition={{ duration: 0.32, repeat: !response.trim() || prefersReducedMotion ? 0 : Infinity, repeatDelay: 2.2 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.96 }}
              >
                Save
              </motion.button>
            )}
          </div>
        </div>

        {/* Scroll hint */}
        {todayEntry && (
          <div className="text-center text-sm text-gray-400 mb-6">
            scroll to see past entries
          </div>
        )}

        {/* Saved Today Section */}
        {todayEntry && (
          <div className="mb-6">
            <h3 className="text-xs tracking-widest text-gray-400 mb-4 uppercase">Saved Today</h3>
            
            <motion.div 
              className="bg-white rounded-3xl shadow-sm p-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-gray-400">
                  {new Date(todayEntry.createdAt).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditEntry(todayEntry);
                  }}
                  className="text-sm text-teal-500 hover:text-teal-600 font-light transition-colors"
                >
                  Edit entry
                </button>
              </div>
              
              {/* Show the prompt if it exists */}
              {todayEntry.prompt && (
                <p className="font-serif text-base text-[#8B86A3] italic mb-3">
                  {todayEntry.prompt}
                </p>
              )}
              
              {/* Show the response */}
              <p className="text-[#2D2B3E] text-base mb-4 whitespace-pre-wrap">
                {todayEntry.response}
              </p>
              
              {/* Show photo if exists */}
              {todayEntry.photoUrl && (
                <div className="mt-4">
                  <div 
                    className="relative bg-white p-3 shadow-lg inline-block"
                    style={{
                      maxWidth: '200px',
                    }}
                  >
                    {/* Polaroid photo */}
                    <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={todayEntry.photoUrl}
                        alt="Journal entry photo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Archive entries (if any older entries exist) */}
        {journalEntries.filter(e => {
          const entryDate = new Date(e.createdAt).toISOString().split('T')[0];
          return entryDate !== getTodayDateString() && !e.isWeeklyPrompt;
        }).length > 0 && (
          <div>
            <h3 className="text-xs tracking-widest text-gray-400 mb-4 uppercase">Past Entries</h3>
            
            <div className="space-y-3">
              {journalEntries
                .filter(e => {
                  const entryDate = new Date(e.createdAt).toISOString().split('T')[0];
                  return entryDate !== getTodayDateString() && !e.isWeeklyPrompt;
                })
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(entry => {
                  const isExpanded = expandedEntries.has(entry.id);
                  
                  return (
                    <motion.div 
                      key={entry.id} 
                      className="bg-white rounded-3xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => toggleEntry(entry.id)}
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm text-gray-400">
                          {new Date(entry.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <motion.div
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </motion.div>
                      </div>
                      
                      {/* Show the prompt if it exists */}
                      {entry.prompt && (
                        <p className="font-serif text-base text-[#8B86A3] italic mb-2">
                          {entry.prompt}
                        </p>
                      )}
                      
                      {/* Show the response - truncated or full based on expanded state */}
                      <p className={`text-[#2D2B3E] text-base whitespace-pre-wrap ${!isExpanded ? 'line-clamp-2' : ''}`}>
                        {entry.response}
                      </p>
                      
                      {/* Show photo if exists and expanded */}
                      <AnimatePresence>
                        {isExpanded && entry.photoUrl && (
                          <motion.div 
                            className="mt-4"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div 
                              className="relative bg-white p-3 shadow-lg inline-block"
                              style={{
                                maxWidth: '200px',
                              }}
                            >
                              {/* Polaroid photo */}
                              <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                                <img
                                  src={entry.photoUrl}
                                  alt="Journal entry photo"
                                  className="w-full h-full object-cover"
                                />
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
        )}
      </div>
    </div>
  );
}