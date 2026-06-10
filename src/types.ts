export type AgeLevel = 'starter' | 'explorer' | 'thinker';

export type Locale =
  | 'en'
  | 'ar'
  | 'ur'
  | 'tr'
  | 'fr'
  | 'es'
  | 'hi'
  | 'id'
  | 'de'
  | 'ru'
  | 'bn'
  | 'pt'
  | 'zh'
  | 'ja'
  | 'sw'
  | 'ko';

export interface Category {
  id: string;
  name: string;
  emoji: string;
}

export interface QuizQuestion {
  q: any; // Can be string or Record<Locale, string>
  options: any[]; // Array of strings or Record<Locale, string>
  correct: number;
  explanation: any; // Can be string or Record<Locale, string>
}

export interface Topic {
  id: string;
  emoji: string;
  title: any; // Can be string or Record<Locale, string>
  image: string;
  category: string;
  content: Record<AgeLevel, any>; // Record of AgeLevel to content maps
  funFact: any; // Can be string or Record<Locale, string>
  quiz: QuizQuestion[];
}

export interface UserProgress {
  topicsRead: string[];
  quizzesCompleted: Record<string, number>; // Maps topicId to highest quiz score (0-3)
  badges: string[];
  currentStreak?: number;
  lastReadDate?: string | null;
  savedChapters?: string[]; // Bookmarked for offline caching and fast review
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  condition: (progress: UserProgress) => boolean;
}
