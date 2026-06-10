import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Locale, AgeLevel, UserProgress } from '@/types';

interface AppState {
  locale: Locale;
  ageLevel: AgeLevel;
  progress: UserProgress;
  isOnline: boolean;
  audioEnabled: boolean;

  setLocale: (locale: Locale) => void;
  setAgeLevel: (level: AgeLevel) => void;
  markTopicRead: (topicId: string) => void;
  setQuizScore: (topicId: string, score: number) => void;
  addBadge: (badgeId: string) => void;
  setOnline: (online: boolean) => void;
  toggleAudio: () => void;
  toggleSaveChapter: (topicId: string) => void;
}

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = localStorage.getItem('islam-abc-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.locale || 'en';
    }
  } catch {}
  return 'en';
}

function getInitialAgeLevel(): AgeLevel {
  if (typeof window === 'undefined') return 'starter';
  try {
    const stored = localStorage.getItem('islam-abc-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.ageLevel || 'starter';
    }
  } catch {}
  return 'starter';
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      locale: getInitialLocale(),
      ageLevel: getInitialAgeLevel(),
      progress: {
        topicsRead: [],
        quizzesCompleted: {},
        badges: [],
        currentStreak: 0,
        lastReadDate: null,
        savedChapters: [],
      },
      isOnline: true,
      audioEnabled: true,

      setLocale: (locale) => set({ locale }),
      setAgeLevel: (ageLevel) => set({ ageLevel }),
      markTopicRead: (topicId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            topicsRead: [...new Set([...state.progress.topicsRead, topicId])],
          },
        })),
      setQuizScore: (topicId, score) =>
        set((state) => ({
          progress: {
            ...state.progress,
            quizzesCompleted: { ...state.progress.quizzesCompleted, [topicId]: score },
          },
        })),
      addBadge: (badgeId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            badges: [...new Set([...state.progress.badges, badgeId])],
          },
        })),
      setOnline: (isOnline) => set({ isOnline }),
      toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),
      toggleSaveChapter: (topicId) =>
        set((state) => {
          const savedChapters = state.progress.savedChapters || [];
          const updated = savedChapters.includes(topicId)
            ? savedChapters.filter((id) => id !== topicId)
            : [...savedChapters, topicId];
          return {
            progress: {
              ...state.progress,
              savedChapters: updated,
            },
          };
        }),
    }),
    {
      name: 'islam-abc-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);
