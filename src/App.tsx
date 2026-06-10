import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Volume2,
  Sparkles,
  ArrowRight,
  Shield,
  Star,
  Heart,
  ArrowLeft,
  Trophy,
  X,
  CheckCircle2,
  Lock,
  Award,
  ChevronRight,
  ChevronLeft,
  VolumeX,
  Printer,
  Check,
  Search
} from 'lucide-react';
import LanguagePicker, { isRTL } from '@/components/layout/LanguagePicker';
import AgeSelector from '@/components/content/AgeSelector';
import AudioNarrator from '@/components/content/AudioNarrator';
import ImageCard from '@/components/content/ImageCard';
import BadgeBoard, { BADGES } from '@/components/gamification/BadgeBoard';
import ExportModal from '@/components/export/ExportModal';
import { useAppStore } from '@/lib/store';
import { t, getCategoryName } from '@/lib/translations';
import { CATEGORIES, TOPICS, getTopicsByCategory } from '@/lib/topics';
import { getContent } from '@/lib/content';
import type { Topic, QuizQuestion } from '@/types';

const CATEGORY_THEMES: Record<string, { bg: string; border: string; glow: string; badge: string; text: string }> = {
  pillars_of_islam: {
    bg: 'bg-gradient-to-r from-emerald-400 to-teal-400',
    border: 'border-emerald-250',
    glow: 'shadow-emerald-100',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200 rounded-full',
    text: 'text-emerald-800'
  },
  core_beliefs: {
    bg: 'bg-gradient-to-r from-amber-400 to-yellow-400',
    border: 'border-amber-250',
    glow: 'shadow-amber-100',
    badge: 'bg-amber-50 text-amber-800 border-amber-200 rounded-full',
    text: 'text-amber-800'
  },
  daily_practices: {
    bg: 'bg-gradient-to-r from-sky-400 to-blue-400',
    border: 'border-sky-250',
    glow: 'shadow-sky-100',
    badge: 'bg-sky-50 text-sky-800 border-sky-200 rounded-full',
    text: 'text-sky-800'
  },
  islamic_values: {
    bg: 'bg-gradient-to-r from-rose-400 to-pink-400',
    border: 'border-rose-250',
    glow: 'shadow-rose-100',
    badge: 'bg-rose-50 text-rose-800 border-rose-200 rounded-full',
    text: 'text-rose-800'
  },
  stories_history: {
    bg: 'bg-gradient-to-r from-fuchsia-400 to-purple-400',
    border: 'border-fuchsia-250',
    glow: 'shadow-fuchsia-100',
    badge: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200 rounded-full',
    text: 'text-fuchsia-800'
  },
  special_times: {
    bg: 'bg-gradient-to-r from-violet-400 to-indigo-400',
    border: 'border-violet-250',
    glow: 'shadow-violet-100',
    badge: 'bg-violet-50 text-violet-800 border-violet-200 rounded-full',
    text: 'text-violet-800'
  },
};

export default function App() {
  const { 
    locale, 
    ageLevel, 
    progress, 
    markTopicRead, 
    setQuizScore, 
    addBadge, 
    audioEnabled, 
    toggleAudio,
    isOnline,
    setOnline,
    toggleSaveChapter
  } = useAppStore();
  
  // Views navigation state: 'landing' | 'grid' | 'topic'
  const [currentView, setCurrentView] = useState<'landing' | 'grid' | 'topic'>('landing');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('shahada');
  const [showBadges, setShowBadges] = useState(false);
  const [unlockedBadgeName, setUnlockedBadgeName] = useState<string | null>(null);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Keep track of which categories are already completed
  const [completedQuizCategories, setCompletedQuizCategories] = useState<string[]>([]);
  const hasInitializedCompletedCategories = useRef(false);
  const [masteredCategory, setMasteredCategory] = useState<{ name: string; emoji: string } | null>(null);

  useEffect(() => {
    // Current completed category IDs based on whether ALL topics within that category have quizzesCompleted scores
    const currentCompleted = CATEGORIES.filter(cat => {
      const topicsInCat = TOPICS.filter(t => t.category === cat.id);
      return topicsInCat.length > 0 && topicsInCat.every(t => progress.quizzesCompleted[t.id] !== undefined);
    }).map(cat => cat.id);

    if (!hasInitializedCompletedCategories.current) {
      setCompletedQuizCategories(currentCompleted);
      hasInitializedCompletedCategories.current = true;
    } else {
      // Find if any category was newly completed
      const newlyCompleted = currentCompleted.find(catId => !completedQuizCategories.includes(catId));
      if (newlyCompleted) {
        setCompletedQuizCategories(currentCompleted);
        const category = CATEGORIES.find(c => c.id === newlyCompleted);
        if (category) {
          const catNameTranslated = getCategoryName(category.id, locale);
          triggerCategoryCelebration(catNameTranslated, category.emoji);
        }
      } else if (currentCompleted.length < completedQuizCategories.length) {
        // If progress is reset, update state
        setCompletedQuizCategories(currentCompleted);
      }
    }
  }, [progress.quizzesCompleted, locale]);

  const triggerCategoryCelebration = (name: string, emoji: string) => {
    // Confetti options duration
    const duration = 4 * 1000;
    const end = Date.now() + duration;

    // Side streams of flying multi-color confetti dots
    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.8 },
        colors: ['#34D399', '#059669', '#FBBF24', '#F59E0B', '#3B82F6', '#EC4899']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.8 },
        colors: ['#34D399', '#059669', '#FBBF24', '#F59E0B', '#3B82F6', '#EC4899']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    // Center instant splash
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#34D399', '#059669', '#FBBF24', '#F59E0B', '#3B82F6', '#9333EA']
    });

    frame();

    // Trigger state to show modal celebrations
    setMasteredCategory({ name, emoji });
  };

  // Synchronize browser online status to global state
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      setOnline(navigator.onLine);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, [setOnline]);

  // Quiz interactive state
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScoreLocal] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Language mapping for user friendly names
  const LANGUAGE_NAMES: Record<string, string> = {
    en: 'English',
    ar: 'العربية (Arabic)',
    ur: 'اردو (Urdu)',
    tr: 'Türkçe (Turkish)',
    fr: 'Français (French)',
    es: 'Español (Spanish)',
    hi: 'हिन्दी (Hindi)',
    id: 'Bahasa Indonesia',
    de: 'Deutsch (German)',
    ru: 'Русский (Russian)',
    bn: 'বাংলা (Bengali)',
    pt: 'Português (Portuguese)',
    zh: '简体中文 (Chinese)',
    ja: '日本語 (Japanese)',
    sw: 'Kiswahili (Swahili)',
    ko: '한국어 (Korean)',
  };

  // State to cache Gemini translations on-demand on the client, retrieving from localStorage if available
  const [translatedTopics, setTranslatedTopics] = useState<Record<string, Topic>>(() => {
    try {
      const cached = localStorage.getItem('translated_topics_cache_v2');
      if (!cached) return {};
      const parsed = JSON.parse(cached);
      if (typeof parsed !== 'object' || parsed === null) return {};

      const validated: Record<string, Topic> = {};
      let hasChanges = false;
      const englishContent = getContent('en');

      Object.entries(parsed).forEach(([key, val]: [string, any]) => {
        if (typeof key !== 'string' || !key.includes('-')) {
          hasChanges = true;
          return;
        }

        const [loc, topicId] = key.split('-');
        const engTopic = englishContent.find(t => t.id === topicId);

        // Verify full topic structural integrity
        if (
          val &&
          typeof val === 'object' &&
          val.id &&
          val.title &&
          val.content &&
          typeof val.content.starter === 'string' &&
          typeof val.content.explorer === 'string' &&
          typeof val.content.thinker === 'string' &&
          Array.isArray(val.quiz)
        ) {
          // Verify that it is not a legacy untranslated duplicate fallback which bypassed actual translation
          if (loc !== 'en' && engTopic) {
            const isTitleIdentical = val.title === engTopic.title;
            const isStarterIdentical = val.content?.starter === engTopic.content?.starter;
            if (isTitleIdentical && isStarterIdentical) {
              hasChanges = true;
              console.warn(`[Local Storage Cache Validation] Discarded untranslated entry for ${key}`);
              return;
            }
          }
          validated[key] = val;
        } else {
          hasChanges = true;
        }
      });

      if (hasChanges) {
        localStorage.setItem('translated_topics_cache_v2', JSON.stringify(validated));
      }
      return validated;
    } catch {
      return {};
    }
  });
  const [translating, setTranslating] = useState<boolean>(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [translationRetryCount, setTranslationRetryCount] = useState<number>(0);

  // Force direction check (RTL support)
  const isRtlLayout = isRTL(locale);

  // Get content parsed based on selected locale
  const content = getContent(locale);

  // Retrieve current active topic
  const baseActiveTopic = content.find(t => t.id === selectedTopicId) || content[0];
  const cacheKey = `${locale}-${selectedTopicId}`;
  const activeTopic = (locale !== 'en' && translatedTopics[cacheKey])
    ? translatedTopics[cacheKey]
    : baseActiveTopic;

  // On-demand translation loading effect
  useEffect(() => {
    let active = true;
    const fetchTranslation = async () => {
      if (locale === 'en') {
        setTranslationError(null);
        return;
      }
      
      const topicToTranslate = content.find(t => t.id === selectedTopicId);
      if (!topicToTranslate) return;

      const currentKey = `${locale}-${selectedTopicId}`;
      if (translatedTopics[currentKey]) {
        setTranslationError(null);
        return; // already translated
      }

      setTranslating(true);
      setTranslationError(null);
      try {
        const res = await fetch('/api/translate-topic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: topicToTranslate, locale }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Server translation error');
        }
        const data = await res.json();
        
        if (active && data.topic) {
          // Double check that we actually got a translation comparing to original English
          const engTopic = getContent('en').find(t => t.id === selectedTopicId);
          if (engTopic) {
            const isTitleIdentical = data.topic.title === engTopic.title;
            const isStarterIdentical = data.topic.content?.starter === engTopic.content?.starter;
            if (isTitleIdentical && isStarterIdentical) {
              throw new Error('API returned untranslated English content fallback. Retrying...');
            }
          }

          setTranslatedTopics(prev => {
            const updated = {
              ...prev,
              [currentKey]: data.topic,
            };
            try {
              localStorage.setItem('translated_topics_cache_v2', JSON.stringify(updated));
            } catch (e) {
              console.error('Failed to save translation cache to localStorage:', e);
            }
            return updated;
          });
          setTranslationError(null);
        }
      } catch (err: any) {
        console.error('Failed to dynamically translate content via Gemini:', err);
        if (active) {
          setTranslationError(err.message || 'Translation failed');
        }
      } finally {
        if (active) {
          setTranslating(false);
        }
      }
    };

    fetchTranslation();
    return () => {
      active = false;
    };
  }, [locale, selectedTopicId, translationRetryCount]);

  // Progression trackers
  const topicsReadCount = progress.topicsRead.length;
  const totalTopics = TOPICS.length;

  // Track automated read triggered upon visiting a Topic Detail Page
  useEffect(() => {
    if (currentView === 'topic' && activeTopic) {
      if (!progress.topicsRead.includes(activeTopic.id)) {
        markTopicRead(activeTopic.id);
        checkBadgeTriggers();
      }
    }
  }, [currentView, selectedTopicId]);

  // Check and unlock new badges periodically
  const checkBadgeTriggers = () => {
    // Collect updated progress object
    setTimeout(() => {
      const updatedProgress = useAppStore.getState().progress;
      for (const badge of BADGES) {
        if (!updatedProgress.badges.includes(badge.id) && badge.condition(updatedProgress)) {
          addBadge(badge.id);
          setUnlockedBadgeName(badge.name);
        }
      }
    }, 150);
  };

  const getDefensiveTitle = (topic: Topic) => {
    if (typeof topic.title === 'string') return topic.title;
    return topic.title?.[locale] || topic.title?.en || 'Topic';
  };

  const getDefensiveFunFact = (topic: Topic) => {
    if (typeof topic.funFact === 'string') return topic.funFact;
    return topic.funFact?.[locale] || topic.funFact?.en || '';
  };

  const getDefensiveContent = (topic: Topic) => {
    const textByAge = topic.content?.[ageLevel];
    if (typeof textByAge === 'string') return textByAge;
    return textByAge?.[locale] || textByAge?.en || '';
  };

  const getDefensiveQuestion = (q: QuizQuestion) => {
    if (typeof q.q === 'string') return q.q;
    return q.q?.[locale] || q.q?.en || '';
  };

  const getDefensiveOption = (opt: any) => {
    if (typeof opt === 'string') return opt;
    return opt?.[locale] || opt?.en || '';
  };

  const getDefensiveExplanation = (q: QuizQuestion) => {
    if (typeof q.explanation === 'string') return q.explanation;
    return q.explanation?.[locale] || q.explanation?.en || '';
  };

  // Navigating through alphabet lists
  const triggerNextTopic = () => {
    const currentIdx = content.findIndex(t => t.id === selectedTopicId);
    if (currentIdx !== -1 && currentIdx < content.length - 1) {
      setSelectedTopicId(content[currentIdx + 1].id);
      resetQuizState();
    }
  };

  const triggerPrevTopic = () => {
    const currentIdx = content.findIndex(t => t.id === selectedTopicId);
    if (currentIdx > 0) {
      setSelectedTopicId(content[currentIdx - 1].id);
      resetQuizState();
    }
  };

  const resetQuizState = () => {
    setQuizActive(false);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setQuizScoreLocal(0);
    setQuizCompleted(false);
  };

  const handleOptionPress = (choiceIdx: number, correctIdx: number) => {
    if (selectedOption !== null) return; // Prevent multiple presses
    setSelectedOption(choiceIdx);
    if (choiceIdx === correctIdx) {
      setQuizScoreLocal(prev => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    const totalQuestions = activeTopic.quiz?.length || 0;
    if (currentQuestionIdx < totalQuestions - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
    } else {
      // Quiz completed! Save progress
      setQuizCompleted(true);
      const previousBestScore = progress.quizzesCompleted[activeTopic.id] || 0;
      if (quizScore > previousBestScore) {
        setQuizScore(activeTopic.id, quizScore);
        checkBadgeTriggers();
      }
    }
  };

  return (
    <div className={`min-h-screen ${currentView === 'topic' ? 'lg:h-screen lg:max-h-screen lg:overflow-hidden' : ''} flex flex-col antialiased relative selection:bg-emerald-500/10 selection:text-emerald-700 bg-[#F8FAF5]`} dir={isRtlLayout ? 'rtl' : 'ltr'}>
      
      {/* Dynamic Navigation Header Bar */}
      <header className="sticky top-0 z-40 bg-[#F8FAF5]/90 backdrop-blur-md border-b border-emerald-100/40 shadow-sm no-print shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          <button
            onClick={() => {
              if (currentView === 'topic') {
                setCurrentView('grid');
              } else {
                setCurrentView('landing');
              }
              resetQuizState();
            }}
            className="flex items-center gap-2 text-emerald-800 hover:scale-[1.03] transition-transform font-bold text-sm cursor-pointer uppercase tracking-wider"
          >
            {currentView !== 'landing' ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-full hover:bg-emerald-100 transition-colors">
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span className="text-xs font-bold px-1">Back</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-700">
                <span className="text-2xl animate-pulse">🎈</span>
                <span className="font-serif text-lg font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">{t(locale, 'title')}</span>
              </div>
            )}
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            {currentView !== 'landing' && (
              <div className="hidden md:block">
                <AgeSelector />
              </div>
            )}

            {/* Connection Network status badge */}
            <div 
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border rounded-full shadow-sm ${
                isOnline 
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-700'
                  : 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
              }`}
              title={isOnline ? "Application connected to the web" : "Application working fully offline"}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            
            <LanguagePicker />

            {/* Badges Cabinet Button */}
            <button
              id="header-btn-badges"
              onClick={() => setShowBadges(true)}
              className="relative p-2.5 rounded-full bg-white hover:bg-amber-100 text-amber-600 border border-amber-200 shadow-sm transition-all cursor-pointer"
              title={t(locale, 'yourBadges')}
            >
              <Award className="w-4.5 h-4.5 stroke-[2.2]" />
              {progress.badges.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                  {progress.badges.length}
                </span>
              )}
            </button>

            {/* Audio Toggle control slider */}
            <button
              onClick={toggleAudio}
              className={`p-2.5 rounded-full text-xs font-bold border transition-colors cursor-pointer shadow-sm ${
                audioEnabled
                  ? 'bg-emerald-500 border-emerald-400 text-white hover:bg-emerald-600'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-emerald-50/50'
              }`}
              title="Toggle text speaker widgets"
            >
              {audioEnabled ? <Volume2 className="w-4.5 h-4.5 animate-pulse" /> : <VolumeX className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          
          {/* VIEW: Landing Screen */}
          {currentView === 'landing' && (
            <motion.div
              key="landing-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 px-6 py-16 sm:py-24 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#F2F9F3] via-[#FAF9F5] to-[#F1F7F4]"
            >
              {/* Background Massive Letter */}
              <div className="absolute -left-20 -top-20 text-[540px] sm:text-[640px] font-serif font-black text-emerald-500/[0.02] leading-none select-none pointer-events-none z-0">
                A
              </div>

              {/* Animated Floating letter emojis */}
              <div className="absolute inset-0 pointer-events-none z-0">
                <span className="absolute top-12 left-[12%] text-6xl opacity-40 float-animation select-none" style={{ animationDelay: '0s' }}>🕌</span>
                <span className="absolute top-[20%] right-[11%] text-5xl opacity-40 float-animation select-none" style={{ animationDelay: '1.2s' }}>📖</span>
                <span className="absolute bottom-20 left-[15%] text-5xl opacity-40 float-animation select-none" style={{ animationDelay: '0.6s' }}>🌙</span>
                <span className="absolute bottom-24 right-[13%] text-6xl opacity-40 float-animation select-none" style={{ animationDelay: '1.8s' }}>🕋</span>
                <span className="absolute top-[45%] left-[8%] text-4xl opacity-25 float-animation select-none" style={{ animationDelay: '2.5s' }}>🌴</span>
                <span className="absolute top-[60%] right-[7%] text-4xl opacity-25 float-animation select-none" style={{ animationDelay: '0.9s' }}>🐪</span>
              </div>

              <div className="relative text-center max-w-3xl mx-auto z-10 flex flex-col items-center">
                
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 font-extrabold text-[10px] uppercase tracking-wider rounded-full border border-emerald-100 shadow-sm mb-8 animate-pulse">
                  <span>🦄 Discovering Islam Series</span>
                </div>

                <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif font-extrabold mb-6 leading-tight tracking-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
                  {t(locale, 'title')}
                </h1>

                <p className="text-lg sm:text-xl md:text-2xl font-sans font-medium text-slate-700/80 leading-relaxed max-w-2xl mb-10">
                  {t(locale, 'subtitle')}
                </p>

                {/* Horizontal Level Choice */}
                <div className="bg-white border-2 border-emerald-100 p-2.5 rounded-full mb-10 flex items-center gap-1.5 shadow-md">
                  <AgeSelector />
                </div>

                {/* Primary CTA button - soft, bubbly star-themed */}
                <button
                  id="landing-cta-start"
                  onClick={() => setCurrentView('grid')}
                  className="font-sans inline-flex items-center gap-3 px-12 py-4.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white rounded-full font-bold text-sm uppercase tracking-wider hover:scale-105 hover:shadow-xl active:scale-95 transition-all duration-300 cursor-pointer shadow-md shadow-emerald-200"
                >
                  <Sparkles className="w-5 h-5 text-yellow-200 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>{t(locale, 'startReading')}</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>

                {/* Quick stats summarizing features */}
                <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-xl">
                  <div className="flex flex-col items-center p-5 bg-white border border-emerald-50 rounded-2xl shadow-md transition-transform hover:-translate-y-1">
                    <span className="text-3xl mb-1.5">🌍</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">{t(locale, 'languages')}</span>
                    <span className="text-[11px] text-gray-500 mt-1">Multi-lingual Support</span>
                  </div>
                  <div className="flex flex-col items-center p-5 bg-white border border-emerald-50 rounded-2xl shadow-md transition-transform hover:-translate-y-1">
                    <span className="text-3xl mb-1.5">🔊</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">{t(locale, 'audioNarration')}</span>
                    <span className="text-[11px] text-gray-500 mt-1">Sweet Audio Reader</span>
                  </div>
                  <div className="flex flex-col items-center p-5 bg-white border border-emerald-50 rounded-2xl shadow-md transition-transform hover:-translate-y-1">
                    <span className="text-3xl mb-1.5">🎨</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">{t(locale, 'pdfEbook')}</span>
                    <span className="text-[11px] text-gray-500 mt-1">Printable Story sheets</span>
                  </div>
                </div>

                {/* Core trust pillars */}
                <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-[#2C3E50]/70 text-[11px] font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-50 text-sky-800 rounded-full border border-sky-100"><Shield className="w-3.5 h-3.5 text-sky-600" /> Kid-Friendly Basics</span>
                  <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 text-amber-800 rounded-full border border-amber-100"><Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> 26 Beautiful Chapters</span>
                  <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 text-rose-800 rounded-full border border-rose-100"><Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> 100% Peaceful & Safe</span>
                </div>

              </div>
            </motion.div>
          )}

          {/* VIEW: Alphabet Category Grid Dashboard */}
          {currentView === 'grid' && (
            <motion.div
              key="grid-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10"
            >
              {/* Dynamic Header Badge Card showing overall progress */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-[#F9FBF8] p-6 sm:p-8 text-slate-800 border-2 border-emerald-100 shadow-md mb-12">
                <div className="absolute inset-y-0 right-0 opacity-[0.03] pointer-events-none select-none text-[320px] font-serif font-black leading-none -mr-16 -mt-16 text-emerald-600">🕌</div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <span className="text-emerald-800 text-[10px] font-extrabold uppercase tracking-[0.15em] bg-emerald-50 border border-emerald-200 px-4.5 py-2 rounded-full shadow-sm">🎈 Little Muslim Adventure</span>
                    <h2 className="text-3xl sm:text-4xl font-serif font-bold mt-4 leading-tight text-[#2C3E50]">My Learning Map! 🗺️</h2>
                    <p className="text-sm sm:text-base text-gray-500 mt-2 font-medium">Read letters, play fun quizzes, and collect glowing gold badges! ✨</p>
                    
                    {/* Offline Saved chapters filter toggle button */}
                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        onClick={() => setShowSavedOnly(prev => !prev)}
                        className={`flex items-center gap-2 px-5 py-2.5 border-2 text-[11px] font-extrabold uppercase tracking-wider rounded-full shadow-sm active:translate-y-px cursor-pointer transition-all ${
                          showSavedOnly 
                            ? 'bg-amber-400 text-amber-950 border-amber-300 shadow-amber-100' 
                            : 'bg-white text-gray-600 border-gray-250 hover:bg-gray-50'
                        }`}
                      >
                        <span>{showSavedOnly ? '★ Showing Offline Saved' : '★ Filter Offline Saved'}</span>
                        {(progress.savedChapters || []).length > 0 && (
                          <span className="ml-1.5 bg-amber-500 text-white px-2 py-0.5 text-[9px] rounded-full font-bold">
                            {(progress.savedChapters || []).length}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Reading score tracker widget */}
                  <div className="w-full md:max-w-xs shrink-0 bg-white border border-emerald-100 p-5 rounded-3xl shadow-md">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2 text-[#2C3E50]">
                      <span className="flex items-center gap-1">🏆 Adventure Score</span>
                      <span className="font-sans text-emerald-650 bg-emerald-50 px-2.5 py-0.5 rounded-full">{Math.round((topicsReadCount / totalTopics) * 100)}%</span>
                    </div>
                    <div className="h-3.5 bg-emerald-50 border border-emerald-100/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-750 ease-out"
                        style={{ width: `${(topicsReadCount / totalTopics) * 100}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-gray-500 mt-2.5 text-right font-bold uppercase tracking-wider">
                      You've unlocked {topicsReadCount} of {totalTopics} secrets! 🔑
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Interactive Search Bar & Quick Tags */}
              <div className="bg-amber-50/65 border-2 border-amber-100/60 p-5 sm:p-6 rounded-3xl shadow-sm mb-12 flex flex-col gap-4 text-[#2C3E50]">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <span className={`absolute inset-y-0 ${isRtlLayout ? 'right-4' : 'left-4'} flex items-center pointer-events-none text-amber-500/80`}>
                      <Search className="w-4 h-4 stroke-[2.5]" />
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={locale === 'ar' ? 'ابحث في الفصول بالاسم، الكلمات الرئيسية...' : 'Search chapters by name or concepts...'}
                      className={`w-full py-3 ${isRtlLayout ? 'pr-11 pl-10' : 'pl-11 pr-10'} border-2 border-amber-250 rounded-full outline-none focus:ring-2 focus:ring-amber-300 bg-white font-sans text-sm tracking-wide font-medium text-slate-800 shadow-inner`}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className={`absolute inset-y-0 ${isRtlLayout ? 'left-3' : 'right-3'} flex items-center text-gray-400 hover:text-rose-500 cursor-pointer`}
                      >
                        <X className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Popular Search Suggestion Tags */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2C3E50]/70">Quick Searches:</span>
                  {['Pillars', 'Wudu', 'Kaaba', 'Ramadan', 'Arafat', 'Values', 'Stories'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(prev => prev.toLowerCase() === tag.toLowerCase() ? '' : tag)}
                      className={`px-3.5 py-1.5 border text-[10px] font-bold uppercase tracking-wider rounded-full transition-all duration-150 cursor-pointer shadow-sm active:translate-y-px ${
                        searchQuery.toLowerCase() === tag.toLowerCase()
                          ? 'bg-amber-400 text-amber-950 border-amber-400 font-extrabold ring-2 ring-amber-300'
                          : 'bg-white text-gray-700 border-amber-200/50 hover:bg-amber-400 hover:text-amber-950 hover:border-amber-400'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categorized blocks grid */}
              <div className="space-y-16">
                {(() => {
                  let overallHasAtLeastOneTopic = false;
                  const englishContent = getContent('en');

                  const renderedCategories = CATEGORIES.map(category => {
                    const topicsInCat = content.filter(topic => {
                      const matchesCategory = topic.category === category.id;
                      const matchesSaved = !showSavedOnly || (progress.savedChapters || []).includes(topic.id);
                      if (!matchesCategory || !matchesSaved) return false;

                      const query = searchQuery.toLowerCase().trim();
                      if (!query) return true;

                      // Retrieve English reference to guarantee English terms and quick-tags match perfectly
                      const engTopic = englishContent.find(t => t.id === topic.id) || topic;

                      // Localized & English Title matching
                      const titleLocal = getDefensiveTitle(topic).toLowerCase();
                      const titleEng = (typeof engTopic.title === 'string' ? engTopic.title : engTopic.title?.en || '').toLowerCase();

                      // Localized & English Fun Fact matching
                      const funFactLocal = getDefensiveFunFact(topic).toLowerCase();
                      const funFactEng = (typeof engTopic.funFact === 'string' ? engTopic.funFact : engTopic.funFact?.en || '').toLowerCase();

                      // Content matching across ALL age levels (starter, explorer, thinker)
                      const starterLocal = (topic.content?.starter?.[locale] || topic.content?.starter?.en || (typeof topic.content?.starter === 'string' ? topic.content.starter : '')).toLowerCase();
                      const explorerLocal = (topic.content?.explorer?.[locale] || topic.content?.explorer?.en || (typeof topic.content?.explorer === 'string' ? topic.content.explorer : '')).toLowerCase();
                      const thinkerLocal = (topic.content?.thinker?.[locale] || topic.content?.thinker?.en || (typeof topic.content?.thinker === 'string' ? topic.content.thinker : '')).toLowerCase();

                      const starterEng = (engTopic.content?.starter?.[locale] || engTopic.content?.starter?.en || (typeof engTopic.content?.starter === 'string' ? engTopic.content.starter : '')).toLowerCase();
                      const explorerEng = (engTopic.content?.explorer?.[locale] || engTopic.content?.explorer?.en || (typeof engTopic.content?.explorer === 'string' ? engTopic.content.explorer : '')).toLowerCase();
                      const thinkerEng = (engTopic.content?.thinker?.[locale] || engTopic.content?.thinker?.en || (typeof engTopic.content?.thinker === 'string' ? engTopic.content.thinker : '')).toLowerCase();

                      // Category & IDs matching
                      const categoryId = topic.category.toLowerCase();
                      const categoryNameLocal = getCategoryName(topic.category, locale).toLowerCase();
                      const categoryNameEng = getCategoryName(topic.category, 'en').toLowerCase();
                      const topicId = topic.id.toLowerCase();

                      // Let's check matching synonyms & intent mapping for default English quick search buttons
                      const isPillars = query === 'pillars' && topic.category === 'pillars_of_islam';
                      const isWudu = query === 'wudu' && (topic.id === 'wudu' || topic.category === 'daily_practices');
                      const isKaaba = query === 'kaaba' && (topic.id === 'hajj' || topic.id === 'salah' || topic.category === 'pillars_of_islam');
                      const isRamadan = query === 'ramadan' && (topic.id === 'sawm' || topic.id === 'ramadan' || topic.category === 'special_times');
                      const isArafat = query === 'arafat' && (topic.id === 'hajj' || topic.id === 'eid_al_adha');
                      const isValues = query === 'values' && topic.category === 'islamic_values';
                      const isStories = query === 'stories' && topic.category === 'stories_history';

                      return (
                        titleLocal.includes(query) ||
                        titleEng.includes(query) ||
                        funFactLocal.includes(query) ||
                        funFactEng.includes(query) ||
                        starterLocal.includes(query) ||
                        explorerLocal.includes(query) ||
                        thinkerLocal.includes(query) ||
                        starterEng.includes(query) ||
                        explorerEng.includes(query) ||
                        thinkerEng.includes(query) ||
                        categoryId.includes(query) ||
                        categoryNameLocal.includes(query) ||
                        categoryNameEng.includes(query) ||
                        topicId.includes(query) ||
                        isPillars ||
                        isWudu ||
                        isKaaba ||
                        isRamadan ||
                        isArafat ||
                        isValues ||
                        isStories
                      );
                    });

                    if (topicsInCat.length === 0) return null;
                    overallHasAtLeastOneTopic = true;

                    const theme = CATEGORY_THEMES[category.id] || CATEGORY_THEMES.pillars_of_islam;
                    const completedInCat = topicsInCat.filter(t => progress.topicsRead.includes(t.id)).length;
                    const quizzesCompletedInCat = topicsInCat.filter(t => progress.quizzesCompleted[t.id] !== undefined).length;
                    const isCategoryComplete = completedInCat === topicsInCat.length;
                    const isCategoryQuizzesComplete = quizzesCompletedInCat === topicsInCat.length;

                    return (
                      <section key={category.id} className="scroll-mt-20 text-black">
                        
                        {/* Section categoric banner */}
                        <div className={`relative rounded-3xl ${theme.bg} p-6 sm:p-7 text-white mb-8 overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/20 shadow-lg`}>
                          <div className="absolute right-6 text-9xl select-none opacity-[0.12] leading-none pointer-events-none font-sans">{category.emoji}</div>
                          <div className="relative flex items-center gap-4">
                            <span className="text-4xl sm:text-5xl leading-none select-none filter drop-shadow-md">{category.emoji}</span>
                            <div>
                              <h3 className="text-xl sm:text-2xl font-serif font-extrabold tracking-tight text-white leading-tight">
                                {getCategoryName(category.id, locale)}
                              </h3>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] sm:text-xs">
                                <span className="bg-white/15 backdrop-blur-sm px-2.5 py-0.5 rounded-full font-semibold border border-white/10">
                                  📖 {completedInCat} of {topicsInCat.length} Read
                                </span>
                                <span className="bg-white/15 backdrop-blur-sm px-2.5 py-0.5 rounded-full font-semibold border border-white/10">
                                  🎯 {quizzesCompletedInCat} of {topicsInCat.length} Quizzes
                                </span>
                              </div>
                            </div>
                          </div>

                          {isCategoryQuizzesComplete ? (
                            <motion.div
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: [1, 1.05, 1], opacity: 1 }}
                              transition={{ repeat: Infinity, repeatType: 'reverse', duration: 3, ease: 'easeInOut' }}
                              className="relative shrink-0 self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 border border-amber-250 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-md shadow-amber-400/20"
                            >
                              <span>🏆 Category Mastered!</span>
                            </motion.div>
                          ) : isCategoryComplete ? (
                            <div className="relative shrink-0 self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500/20 backdrop-blur-sm text-emerald-100 border border-emerald-400/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>All Read</span>
                            </div>
                          ) : null}
                        </div>

                        {/* Letters Card Container */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {topicsInCat.map(topic => {
                            const isRead = progress.topicsRead.includes(topic.id);
                            const quizRecord = progress.quizzesCompleted[topic.id];
                            const hasQuizScore = quizRecord !== undefined;

                            return (
                              <button
                                id={`topic-launcher-${topic.id}`}
                                key={topic.id}
                                onClick={() => {
                                  setSelectedTopicId(topic.id);
                                  setCurrentView('topic');
                                  resetQuizState();
                                }}
                                className={`group relative text-left rounded-none overflow-hidden transition-all bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-px active:translate-y-px cursor-pointer`}
                              >
                                <div className="relative aspect-[16/10] bg-[#FDFCFB] flex items-center justify-center overflow-hidden border-b border-black">
                                  <img
                                    src={`/images/${topic.image}`}
                                    alt={getDefensiveTitle(topic)}
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                                    }}
                                    className="w-full h-full object-cover grayscale opacity-90 transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                                    loading="lazy"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                  <div className="absolute top-3.5 left-3.5 text-lg bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded-none w-8 h-8 flex items-center justify-center select-none font-serif leading-none">
                                    {topic.emoji}
                                  </div>

                                  {/* Checklist top tags */}
                                  <div className="absolute top-3.5 right-3.5 flex flex-col items-end gap-1.5">
                                    {isRead && (
                                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0A5430] border border-black text-white rounded-none text-[9px] font-bold uppercase tracking-wider">
                                        <Check className="w-3 h-3 stroke-[3]" />
                                        <span>Read Completed</span>
                                      </div>
                                    )}
                                    {progress.savedChapters?.includes(topic.id) && (
                                      <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-400 border border-black text-black rounded-none text-[8px] font-bold uppercase tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                        <span>★ Saved Offline</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="p-4">
                                  <h4 className="text-sm font-bold uppercase tracking-wider text-black group-hover:underline underline-offset-4 decoration-2 font-mono">
                                    {getDefensiveTitle(topic)}
                                  </h4>
                                  
                                  <div className="flex items-center justify-between mt-3 text-[9px] font-bold uppercase tracking-widest text-black/50 border-t border-black/10 pt-2.5">
                                    <span className="flex items-center gap-1">
                                      <BookOpen className="w-3.5 h-3.5 opacity-70 text-black" />
                                      <span>Read details</span>
                                    </span>
                                    {hasQuizScore ? (
                                      <span className="flex items-center gap-1 px-2 py-0.5 bg-[#0a5430]/10 border border-[#0a5430]/30 rounded-none text-[#0a5430]">
                                        ⭐ Quiz: {quizRecord}/3
                                      </span>
                                    ) : (
                                      <span className="text-black/40">Quiz pending</span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                      </section>
                    );
                  });

                  if (!overallHasAtLeastOneTopic) {
                    return (
                      <div className="bg-white border border-black p-10 sm:p-12 text-center rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center max-w-xl mx-auto my-8">
                        <span className="text-6xl mb-6">🔍</span>
                        <h3 className="text-2xl font-serif font-light italic text-black leading-tight">No Chapters Found</h3>
                        <p className="text-xs sm:text-sm text-black/50 mt-3 font-medium max-w-sm">
                          We couldn't find any results matches for <strong className="text-black bg-amber-200 px-1.5 py-0.5 font-mono">"{searchQuery}"</strong>. Try checking your spelling or search for other pillars or values.
                        </p>
                        <button
                          onClick={() => setSearchQuery('')}
                          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-none text-xs font-bold uppercase tracking-widest border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#0A5430] active:translate-y-px transition-all cursor-pointer"
                        >
                          Clear Search Bar
                        </button>
                      </div>
                    );
                  }

                  return renderedCategories;
                })()}
              </div>

              {/* Grid footer widgets */}
              <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
                <p className="text-xs text-gray-400 font-medium">
                  {t(locale, 'footer')}
                </p>
                <div className="shrink-0">
                  <ExportModal content={content} />
                </div>
              </div>

            </motion.div>
          )}

          {/* VIEW: Chapter Active Reader Sheet */}
          {currentView === 'topic' && activeTopic && (
            <motion.div
              key="topic-view"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              className="px-4 py-4 max-w-7xl mx-auto w-full flex-1 flex flex-col lg:h-[calc(100vh-64px)] lg:max-h-[calc(100vh-64px)] lg:overflow-hidden"
            >
              
              {/* Back CTA actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3 no-print shrink-0">
                <button
                  onClick={() => {
                    setCurrentView('grid');
                    resetQuizState();
                  }}
                  className="flex items-center gap-2 text-emerald-800 hover:scale-[1.02] transition-transform font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                  <span>Explore Index</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="md:hidden">
                    <AgeSelector />
                  </div>

                  {/* Bookmark Save Offline Action Icon Button */}
                  <button
                    onClick={() => toggleSaveChapter(activeTopic.id)}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2 border-2 text-[10px] font-extrabold uppercase tracking-widest cursor-pointer transition-all rounded-full shadow-sm active:translate-y-px ${
                      progress.savedChapters?.includes(activeTopic.id)
                        ? 'bg-amber-400 text-amber-950 border-amber-300'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-black/5'
                    }`}
                    title={progress.savedChapters?.includes(activeTopic.id) ? "Saved offline!" : "Save chapter offline"}
                  >
                    <span>★ {progress.savedChapters?.includes(activeTopic.id) ? 'Saved' : 'Save Offline'}</span>
                  </button>

                  <ExportModal content={content} currentTopicId={activeTopic.id} />
                </div>
              </div>

              {/* Reader panel Grid wrapper */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 min-h-0 lg:overflow-hidden mb-2">
                
                {/* Left col: Image cards, details, audio, highlights */}
                <div className="lg:col-span-7 bg-white border-2 border-emerald-100 p-4 sm:p-5 space-y-4 rounded-3xl shadow-lg relative overflow-hidden flex flex-col h-full lg:overflow-y-auto custom-scrollbar">
                  
                  {translating && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                      <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                      <h3 className="text-xl font-serif font-bold text-gray-800">Translating Chapter...</h3>
                      <p className="text-sm text-gray-500 max-w-sm mt-3 leading-relaxed">
                        Gemini AI is crafting a natural, child-friendly translation in{' '}
                        <span className="font-semibold text-emerald-600">
                          {LANGUAGE_NAMES[locale] || locale}
                        </span>
                        . Just a second! 😊
                      </p>
                    </div>
                  )}

                  {/* Background Large Watermark Letter */}
                  <div className="absolute right-0 top-0 text-[320px] font-sans font-black text-emerald-500/[0.015] select-none leading-none -mr-12 -mt-16 pointer-events-none">
                    {activeTopic.emoji}
                  </div>

                  {/* Category Title badges */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-100/65 pb-4 relative z-10 shrink-0">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-250">
                        {getCategoryName(activeTopic.category, locale)}
                      </span>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-extrabold tracking-tight bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent mt-2 leading-none">
                        {getDefensiveTitle(activeTopic)}
                      </h2>
                    </div>

                    <div className="text-4xl sm:text-5xl leading-none select-none filter drop-shadow-sm">
                      {activeTopic.emoji}
                    </div>
                  </div>

                  {/* Primary illustration display */}
                  <div className="relative z-10 w-full max-w-xs sm:max-w-sm mx-auto shrink-0 shadow-sm rounded-3xl overflow-hidden">
                    <ImageCard src={activeTopic.image} alt={getDefensiveTitle(activeTopic)} icon={activeTopic.emoji} />
                  </div>

                  {/* Audio Narrator playback bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl shadow-sm no-print relative z-10 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500 rounded-full text-white">
                        <Volume2 className="w-4 h-4 animate-bounce" style={{ animationDuration: '3s' }} />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-emerald-800 uppercase tracking-wider block">Listen to Story 🎧</span>
                        <span className="text-[10px] text-emerald-600">Cheerful young female voice</span>
                      </div>
                    </div>

                    <AudioNarrator text={getDefensiveContent(activeTopic)} />
                  </div>

                  {/* Translation Error Banner */}
                  {translationError && (
                    <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300/60 text-slate-850 relative z-10 space-y-3 shadow-sm shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⚠️</span>
                        <h4 className="font-serif font-bold text-slate-900 border-none">Translation Temp Unavailable</h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        We are currently experiencing high demand on the Gemini translation engine. The text below is shown in English. Click the button below to try translating again.
                      </p>
                      <button
                        onClick={() => setTranslationRetryCount(prev => prev + 1)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:translate-y-px text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl shadow-sm transition-all duration-150 cursor-pointer"
                      >
                        Try Translating Again 🔄
                      </button>
                    </div>
                  )}

                  {/* Body description text sheet */}
                  <div className="prose max-w-none text-[#2C3E50]/90 selection:bg-emerald-500/10 font-sans leading-relaxed text-sm sm:text-base font-medium relative z-10">
                    <p>
                      {getDefensiveContent(activeTopic)}
                    </p>
                  </div>

                  {/* Amber Fun Fact cards */}
                  {getDefensiveFunFact(activeTopic) && (
                    <div className="p-4 rounded-3xl bg-amber-50 border border-amber-100/60 shadow-sm relative overflow-hidden z-10 shrink-0">
                      <div className="absolute right-4 -bottom-4 text-6xl opacity-10 select-none text-amber-500">💡</div>
                      <h4 className="text-xs font-bold uppercase tracking-[0.1em] text-amber-950 flex items-center gap-1.5 border-b border-amber-250 pb-2 mb-2">
                        <span>🌟</span>
                        <span>{t(locale, 'funFact')}</span>
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed relative z-10 font-normal">
                        {getDefensiveFunFact(activeTopic)}
                      </p>
                    </div>
                  )}

                </div>

                {/* Right col: Quizzes and alphabet flow panels */}
                <div className="lg:col-span-5 flex flex-col h-full lg:overflow-y-auto custom-scrollbar space-y-4">
                  
                  {/* The interactive Quiz Panel */}
                  <div className="bg-white border-2 border-amber-250 p-4 sm:p-5 text-slate-800 relative overflow-hidden rounded-3xl shadow-lg flex-1 min-h-0 flex flex-col justify-center">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-rose-400 to-sky-400" />
                    
                    {!quizActive ? (
                      <div className="text-center py-4 my-auto shrink-0">
                        <div className="text-4xl mb-2 select-none">🎯</div>
                        <h3 className="text-base font-serif font-bold text-[#2C3E50]">{t(locale, 'takeQuiz')}</h3>
                        <p className="text-xs text-gray-500 mt-1.5 max-w-xs mx-auto leading-normal font-medium">
                          Let's practice what we learned about {getDefensiveTitle(activeTopic)} with a fun puzzle!
                        </p>
                        
                        {progress.quizzesCompleted[activeTopic.id] !== undefined && (
                          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-[#2C3E50] rounded-full text-[10px] font-bold uppercase tracking-wider">
                            ⭐ Best Score: {progress.quizzesCompleted[activeTopic.id]}/3
                          </div>
                        )}

                        <button
                          id="btn-start-quiz"
                          onClick={() => setQuizActive(true)}
                          className="mt-6 inline-flex items-center gap-2.5 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-xs font-extrabold uppercase tracking-wide transition-all hover:scale-105 hover:shadow-md cursor-pointer"
                        >
                          <span>Start Quiz! 🎯</span>
                          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col justify-between min-h-0">
                        {/* Header scoreboard */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3 shrink-0">
                          <span className="text-[9px] font-extrabold text-[#2C3E50]/70 tracking-wider uppercase bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                            {t(locale, 'questionOf').replace('{current}', String(currentQuestionIdx + 1)).replace('{total}', String(activeTopic.quiz?.length || 0))}
                          </span>
                          <button
                            onClick={() => resetQuizState()}
                            className="p-1 hover:bg-rose-50 rounded-full transition-colors text-gray-400 hover:text-rose-500 cursor-pointer"
                            title="Abort quiz"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Complete Quiz */}
                        {!quizCompleted ? (
                           <div className="flex-1 flex flex-col justify-center min-h-0 space-y-3">
                            {activeTopic.quiz && activeTopic.quiz[currentQuestionIdx] && (
                              <>
                                <h4 className="font-serif font-extrabold text-xs sm:text-sm text-[#2C3E50] leading-snug shrink-0">
                                  {getDefensiveQuestion(activeTopic.quiz[currentQuestionIdx])}
                                </h4>

                                <div className="space-y-2 flex-1 flex flex-col justify-center min-h-0">
                                  {activeTopic.quiz[currentQuestionIdx].options.map((opt, oIdx) => {
                                    const optionTxt = getDefensiveOption(opt);
                                    const isCorrectOpt = oIdx === activeTopic.quiz[currentQuestionIdx].correct;
                                    const hasSelectedThis = selectedOption === oIdx;
                                    const isSomeOptionSelected = selectedOption !== null;

                                    let btnStyle = 'border-amber-100 bg-[#FDFCFB]/50 hover:bg-amber-50/50 text-[#2C3E50]';
                                    if (isSomeOptionSelected) {
                                      if (isCorrectOpt) {
                                        btnStyle = 'border-emerald-400 bg-emerald-500 text-white font-extrabold shadow-md';
                                      } else if (hasSelectedThis) {
                                        btnStyle = 'border-rose-450 bg-rose-500 text-white font-extrabold shadow-md';
                                      } else {
                                        btnStyle = 'border-gray-100 bg-gray-55/40 text-gray-400 opacity-50';
                                      }
                                    }

                                    return (
                                      <button
                                        id={`quiz-option-${oIdx}`}
                                        key={oIdx}
                                        onClick={() => handleOptionPress(oIdx, activeTopic.quiz[currentQuestionIdx].correct)}
                                        disabled={isSomeOptionSelected}
                                        className={`w-full py-2.5 px-3.5 text-left rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-between gap-2 min-h-10 cursor-pointer ${btnStyle}`}
                                      >
                                        <span>{optionTxt}</span>
                                        {isSomeOptionSelected && isCorrectOpt && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />}
                                        {isSomeOptionSelected && hasSelectedThis && !isCorrectOpt && <X className="w-3.5 h-3.5 text-white shrink-0" />}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Answers explanation disclosure */}
                                {selectedOption !== null && (
                                  <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl text-[11px] text-slate-750 leading-relaxed shrink-0">
                                    <span className="font-extrabold block text-[9px] uppercase tracking-wider text-amber-800 mb-0.5">🎯 Learning Moment</span>
                                    {getDefensiveExplanation(activeTopic.quiz[currentQuestionIdx])}
                                  </div>
                                )}

                                {/* Continuation buttons */}
                                {selectedOption !== null && (
                                  <button
                                    id="btn-quiz-continue"
                                    onClick={handleNextQuizQuestion}
                                    className="w-full mt-2 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-xs font-extrabold uppercase tracking-wide shadow-md cursor-pointer transition-transform hover:scale-[1.01] shrink-0"
                                  >
                                    <span>
                                      {currentQuestionIdx < (activeTopic.quiz?.length || 0) - 1
                                        ? t(locale, 'nextQuestion')
                                        : t(locale, 'seeResults')}
                                    </span>
                                    <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        ) : (
                          // Score result dashboard
                          <div className="text-center py-4 my-auto shrink-0 space-y-3.5">
                            <div className="text-4xl select-none animate-bounce" style={{ animationDuration: '3s' }}>🏆</div>
                            
                            <h4 className="text-base font-serif font-extrabold text-[#2C3E50]">
                              {quizScore === 3
                                ? t(locale, 'perfectScore')
                                : quizScore >= 2
                                ? t(locale, 'greatJob')
                                : t(locale, 'keepTrying')}
                            </h4>

                            <p className="text-xs font-semibold text-slate-600 mt-1">
                              You answered <span className="font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">{quizScore}</span> of <span className="font-bold">3</span> answers correctly.
                            </p>

                            <div className="border-t border-b border-gray-100 py-2.5 my-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                              <BadgeBoard />
                            </div>

                            <div className="flex gap-2.5 pt-2">
                              <button
                                id="btn-quiz-retry"
                                onClick={() => resetQuizState()}
                                className="flex-1 py-2.5 bg-white hover:bg-gray-50 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-700 transition-colors cursor-pointer border border-[#ccc] shadow-sm"
                              >
                                {t(locale, 'tryAgain')}
                              </button>
                              <button
                                id="btn-quiz-complete"
                                onClick={() => {
                                  resetQuizState();
                                }}
                                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
                              >
                                {t(locale, 'continueBtn')}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Navigating Alphabet flow buttons */}
                  <div className="flex gap-4 justify-between no-print shrink-0">
                    <button
                      id="btn-prev-topic"
                      onClick={triggerPrevTopic}
                      disabled={content.findIndex(t => t.id === selectedTopicId) === 0}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-650 rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                      <span>Previous</span>
                    </button>

                    <button
                      id="btn-next-topic"
                      onClick={triggerNextTopic}
                      disabled={content.findIndex(t => t.id === selectedTopicId) === content.length - 1}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-md"
                    >
                      <span>Next Topic</span>
                      <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>

                </div>

              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* OVERLAY: Dynamic Badge Cabinet Drawer */}
      {showBadges && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4 backdrop-blur-sm no-print">
          <div
            id="badges-modal-panel"
            className="bg-white p-6 w-full max-w-md border-2 border-emerald-100 shadow-2xl relative rounded-3xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
              <h3 className="text-xl font-serif font-extrabold text-[#2C3E50]">{t(locale, 'yourBadges')}</h3>
              <button
                onClick={() => setShowBadges(false)}
                className="p-1.5 hover:bg-gray-150 rounded-full transition-colors text-gray-400 hover:text-gray-900"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
            
            <BadgeBoard />
            
            <button
              id="badges-modal-close"
              onClick={() => setShowBadges(false)}
              className="w-full mt-6 py-3.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-bold uppercase tracking-widest text-[#2C3E50] cursor-pointer transition-colors"
            >
              {t(locale, 'close')}
            </button>
          </div>
        </div>
      )}

      {/* CELEBRATION OVERLAY: New Badge unlocked animation alert */}
      {unlockedBadgeName && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white p-8 text-center border-2 border-amber-250 max-w-xs w-full shadow-2xl rounded-3xl space-y-4 animate-in zoom-in-95 duration-300">
            <div className="text-7xl animate-bounce">🏵️</div>
            <h3 className="text-xl font-extrabold text-[#2C3E50] uppercase tracking-wider">New Badge Unlocked!</h3>
            <p className="text-xs font-medium text-slate-600 leading-relaxed">
              {t(locale, 'youEarned').replace('{letter}', unlockedBadgeName)}
            </p>
            <button
              onClick={() => setUnlockedBadgeName(null)}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full text-xs uppercase tracking-widest cursor-pointer transition-all duration-200 shadow-md hover:scale-105"
            >
              Wow, Awesome! ✨
            </button>
          </div>
        </div>
      )}

      {/* Category Mastery Celebration Dialog Overlay */}
      {masteredCategory && (
        <div className="fixed inset-0 z-[120] bg-black/60 flex items-center justify-center p-4 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 text-center border-2 border-amber-250 max-w-sm w-full shadow-2xl rounded-3xl space-y-5"
          >
            <div className="text-7xl animate-bounce select-none">🏆</div>
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Category Fully Solved!
              </span>
              <h3 className="text-2xl font-serif font-extrabold text-slate-800 leading-tight">
                {masteredCategory.emoji} {masteredCategory.name} {masteredCategory.emoji}
              </h3>
              <p className="text-xs font-semibold tracking-wide text-slate-600 leading-relaxed">
                Congratulations! You scored and completed all quizzes in this realm. You are officially a Category Champion! 🥇
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-2xl border border-amber-100/50 flex items-center justify-center gap-3">
              <span className="text-3xl">🎉</span>
              <div className="text-left">
                <span className="block text-xs font-bold text-amber-950">Grand Mastery Unlocked!</span>
                <span className="text-[10px] text-amber-800 block">Earned category gold star sparkle badges.</span>
              </div>
            </div>
            <button
              onClick={() => {
                setMasteredCategory(null);
                confetti({
                  particleCount: 80,
                  spread: 60,
                  origin: { y: 0.7 }
                });
              }}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-[1.03] active:scale-[0.98] text-white font-extrabold rounded-full text-xs uppercase tracking-widest cursor-pointer transition-all duration-200 shadow-md shadow-emerald-200/50"
            >
              Wow, Awesome! ✨
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
}
