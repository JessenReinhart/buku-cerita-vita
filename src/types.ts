export type MoodId = 'Happy' | 'Inspired' | 'Cozy' | 'Dreamy' | 'Calm';

export interface Mood {
  id: MoodId;
  emoji: string;
  label: string;
  color: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: MoodId;
  isPublic: boolean;
  createdAt: number;
  ownerId?: string;
}
