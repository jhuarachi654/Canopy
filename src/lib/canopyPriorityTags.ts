/** Single-select priority tags for tasks & focus mode — soft muted palette */

export type CanopyPriorityTag = 'urgent' | 'important' | 'someday' | 'quick-win';

export const CANOPY_PRIORITY_OPTIONS: { id: CanopyPriorityTag; label: string }[] = [
  { id: 'urgent', label: 'Urgent' },
  { id: 'important', label: 'Important' },
  { id: 'someday', label: 'Someday' },
  { id: 'quick-win', label: 'Quick win' },
];

const pillStyles: Record<CanopyPriorityTag, string> = {
  urgent: 'bg-[#FDEDEB] text-[#9A5C52] ring-1 ring-[#F0D4D0]',
  important: 'bg-[#FFF8E8] text-[#7A6228] ring-1 ring-[#F5E6C8]',
  someday: 'bg-[#F3EDFA] text-[#6B548A] ring-1 ring-[#E0D6ED]',
  'quick-win': 'bg-[#E8F5F0] text-[#2D6E57] ring-1 ring-[#C5E4D6]',
};

export function canopyPriorityPillClass(tag: CanopyPriorityTag): string {
  return pillStyles[tag];
}

/** Slightly stronger ring when selected in a picker */
export function canopyPriorityPickerClass(tag: CanopyPriorityTag, selected: boolean): string {
  const base = pillStyles[tag];
  return selected ? `${base} ring-2 ring-[#1abf8f]/45 shadow-sm` : `${base} opacity-[0.92] hover:opacity-100`;
}
