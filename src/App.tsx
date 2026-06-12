import { useState, useEffect, useRef, Fragment } from 'react';
import confetti from 'canvas-confetti';
import { AnimatePresence } from 'motion/react';
import { Trophy, VolumeX, Volume2 } from 'lucide-react';

import LanguagePicker, { isRTL } from '@/components/layout/LanguagePicker';
import AgeSelector from '@/components/content/AgeSelector';
import BadgeBoard, { BADGES } from '@/components/gamification/BadgeBoard';

// ── New split views ────────────────────────────────────────────────────────────
import LandingPage from '@/components/views/LandingPage';
import TopicGrid from '@/components/views/TopicGrid';
import TopicReader from '@/components/views/TopicReader';
import CelebrationOverlays from '@/components/layout/CelebrationOverlays';

import { useAppStore } from '@/lib/store';
import { t, getCategoryName } from '@/lib/translations';
import { CATEGORIES, TOPICS } from '@/lib/topics';
import { getContent } from '@/lib/content';
import { LANGUAGE_NAMES } from '@/lib/locales';

export default function App() {
  // ── Global store ─────────────────────────────────────────────────────────────
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
    toggleSaveChapter,
  } = useAppStore();

  // ── View / navigation state ───────────────────────────────────────────────────
  const [currentView, setCurrentView] = useState<'landing' | 'grid' | 'topic'>('landing');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('shahada');

  // ── Overlay state ─────────────────────────────────────────────────────────────
  const [showBadges, setShowBadges] = useState(false);
  const [unlockedBadgeName, setUnlockedBadgeName] = useState<string | null>(null);
  const [masteredCategory, setMasteredCategory] = useState<{ name: string; emoji: string } | null>(null);

  // ── Grid filter state ─────────────────────────────────────────────────────────
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Category-mastery tracking ─────────────────────────────────────────────────
  const [completedQuizCategories, setCompletedQuizCategories] = useState<string[]>([]);
  const hasInitializedCompletedCategories = useRef(false);

  useEffect(() => {
    const currentCompleted = CATEGORIES.filter(cat => {
      const topicsInCat = TOPICS.filter(tp => tp.category === cat.id);
      return (
        topicsInCat.length > 0 &&
        topicsInCat.every(tp => progress.quizzesCompleted[tp.id] !== undefined)
      );
    }).map(cat => cat.id);

    if (!hasInitializedCompletedCategories.current) {
      setCompletedQuizCategories(currentCompleted);
      hasInitializedCompletedCategories.current = true;
      return;
    }

    const newlyCompleted = currentCompleted.find(
      catId => !completedQuizCategories.includes(catId),
    );
    if (newlyCompleted) {
      setCompletedQuizCategories(currentCompleted);
      const category = CATEGORIES.find(c => c.id === newlyCompleted);
      if (category) {
        triggerCategoryCelebration(getCategoryName(category.id, locale), category.emoji);
      }
    } else if (currentCompleted.length < completedQuizCategories.length) {
      setCompletedQuizCategories(currentCompleted);
    }
  }, [progress.quizzesCompleted, locale]);

  // ── Browser online status ─────────────────────────────────────────────────────
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

  // ── Translation cache & loading state ────────────────────────────────────────
  const [translatedTopics, setTranslatedTopics] = useState<Record<string, any>>(() => {
    try {
      const cached = localStorage.getItem('translated_topics_cache_v2');
      if (!cached) return {};
      const parsed = JSON.parse(cached);
      if (typeof parsed !== 'object' || parsed === null) return {};

      const validated: Record<string, any> = {};
      let hasChanges = false;
      const englishContent = getContent('en');

      Object.entries(parsed).forEach(([key, val]: [string, any]) => {
        if (typeof key !== 'string' || !key.includes('-')) {
          hasChanges = true;
          return;
        }
        const [loc, topicId] = key.split('-');
        const engTopic = englishContent.find(tp => tp.id === topicId);

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
          // Discard untranslated English fallbacks stored in non-English slots
          if (loc !== 'en' && engTopic) {
            const isTitleIdentical = val.title === engTopic.title;
            const isStarterIdentical = val.content?.starter === engTopic.content?.starter;
            if (isTitleIdentical && isStarterIdentical) {
              hasChanges = true;
              console.warn(`[Cache] Discarding untranslated entry: ${key}`);
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

  const [translating, setTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [translationRetryCount, setTranslationRetryCount] = useState(0);

  // ── Derived content values ────────────────────────────────────────────────────
  const isRtlLayout = isRTL(locale);
  const content = getContent(locale);
  const baseActiveTopic = content.find(tp => tp.id === selectedTopicId) ?? content[0];
  const cacheKey = `${locale}-${selectedTopicId}`;
  const activeTopic =
    locale !== 'en' && translatedTopics[cacheKey]
      ? translatedTopics[cacheKey]
      : baseActiveTopic;
  const topicsReadCount = progress.topicsRead.length;
  const totalTopics = TOPICS.length;
  const currentIdx = content.findIndex(tp => tp.id === selectedTopicId);

  // ── On-demand translation effect ─────────────────────────────────────────────
  useEffect(() => {
    let active = true;

    const fetchTranslation = async () => {
      if (locale === 'en') {
        setTranslationError(null);
        return;
      }
      const topicToTranslate = content.find(tp => tp.id === selectedTopicId);
      if (!topicToTranslate) return;
      if (translatedTopics[cacheKey]) {
        setTranslationError(null);
        return;
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
          // Guard: reject if API silently returned untranslated English
          const engTopic = getContent('en').find(tp => tp.id === selectedTopicId);
          if (engTopic) {
            const isTitleIdentical = data.topic.title === engTopic.title;
            const isStarterIdentical =
              data.topic.content?.starter === engTopic.content?.starter;
            if (isTitleIdentical && isStarterIdentical) {
              throw new Error('API returned untranslated content. Retrying...');
            }
          }
          setTranslatedTopics(prev => {
            const updated = { ...prev, [cacheKey]: data.topic };
            try {
              localStorage.setItem('translated_topics_cache_v2', JSON.stringify(updated));
            } catch (e) {
              console.error('Translation localStorage write failed:', e);
            }
            return updated;
          });
          setTranslationError(null);
        }
      } catch (err: any) {
        console.error('Translation fetch failed:', err);
        if (active) setTranslationError(err.message ?? 'Translation failed');
      } finally {
        if (active) setTranslating(false);
      }
    };

    fetchTranslation();
    return () => { active = false; };
  }, [locale, selectedTopicId, translationRetryCount]);

  // ── Mark topic read when entering topic view ──────────────────────────────────
  useEffect(() => {
    if (currentView === 'topic' && activeTopic) {
      if (!progress.topicsRead.includes(activeTopic.id)) {
        markTopicRead(activeTopic.id);
        checkBadgeTriggers();
      }
    }
  }, [currentView, selectedTopicId]);

  // ── Badge checker ─────────────────────────────────────────────────────────────
  /**
   * Uses Zustand's getState() instead of a setTimeout hack so the score is
   * always read from the store's committed state, not a stale React closure.
   */
  const checkBadgeTriggers = () => {
    const updatedProgress = useAppStore.getState().progress;
    for (const badge of BADGES) {
      if (
        !updatedProgress.badges.includes(badge.id) &&
        badge.condition(updatedProgress)
      ) {
        addBadge(badge.id);
        setUnlockedBadgeName(badge.name);
      }
    }
  };

  // ── Category celebration ──────────────────────────────────────────────────────
  const triggerCategoryCelebration = (name: string, emoji: string) => {
    const duration = 4_000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({
        particleCount: 5, angle: 60, spread: 60,
        origin: { x: 0, y: 0.8 },
        colors: ['#34D399', '#059669', '#FBBF24', '#F59E0B', '#3B82F6', '#EC4899'],
      });
      confetti({
        particleCount: 5, angle: 120, spread: 60,
        origin: { x: 1, y: 0.8 },
        colors: ['#34D399', '#059669', '#FBBF24', '#F59E0B', '#3B82F6', '#EC4899'],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    confetti({
      particleCount: 150, spread: 90, origin: { y: 0.6 },
      colors: ['#34D399', '#059669', '#FBBF24', '#F59E0B', '#3B82F6', '#9333EA'],
    });
    frame();
    setMasteredCategory({ name, emoji });
  };

  // ── Navigation handlers ───────────────────────────────────────────────────────
  const handleTopicSelect = (topicId: string) => {
    setSelectedTopicId(topicId);
    setCurrentView('topic');
    // No explicit quiz reset needed: TopicReader uses key={selectedTopicId},
    // so it fully remounts (and QuizPanel resets) whenever the topic changes.
  };

  const handleNavigateNext = () => {
    if (currentIdx !== -1 && currentIdx < content.length - 1) {
      setSelectedTopicId(content[currentIdx + 1].id);
    }
  };

  const handleNavigatePrev = () => {
    if (currentIdx > 0) {
      setSelectedTopicId(content[currentIdx - 1].id);
    }
  };

  const handleHeaderBack = () => {
    if (currentView === 'topic') setCurrentView('grid');
    else setCurrentView('landing');
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div
      className={`min-h-screen ${
        currentView === 'topic' ? 'lg:h-screen lg:max-h-screen lg:overflow-hidden' : ''
      } flex flex-col antialiased relative selection:bg-emerald-500/10 selection:text-emerald-700 bg-[#F8FAF5]`}
      dir={isRtlLayout ? 'rtl' : 'ltr'}
    >
      {/* ── Sticky navigation header ── */}
      <header className="sticky top-0 z-40 bg-[#F8FAF5]/90 backdrop-blur-md border-b border-emerald-100/40 shadow-sm no-print shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Left: logo / back button */}
          <button
            onClick={handleHeaderBack}
            className="flex items-center gap-2 text-emerald-800 hover:scale-[1.03] transition-transform font-bold text-sm cursor-pointer uppercase tracking-wider"
          >
            {currentView !== 'landing' ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-full hover:bg-emerald-100 transition-colors">
                <span className="text-base">←</span>
                <span className="hidden sm:inline text-xs">
                  {currentView === 'topic' ? 'Topic Index' : 'Home'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xl leading-none">🕌</span>
                <span className="hidden sm:inline font-serif tracking-tight">
                  ABC of Islam
                </span>
              </div>
            )}
          </button>

          {/* Right: controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Online/offline indicator */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              {isOnline ? 'Online' : 'Offline'}
            </div>

            {/* Audio toggle */}
            <button
              id="header-audio-toggle"
              onClick={toggleAudio}
              title={audioEnabled ? 'Disable audio' : 'Enable audio'}
              className="p-2 rounded-full hover:bg-emerald-50 transition-colors text-emerald-700 cursor-pointer"
            >
              {audioEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {/* Age selector (desktop) */}
            <div className="hidden md:block">
              <AgeSelector />
            </div>

            {/* Badge cabinet */}
            <button
              id="header-badges-btn"
              onClick={() => setShowBadges(true)}
              className="relative flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-full border border-amber-200 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">{t(locale, 'badges')}</span>
              {progress.badges.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center bg-rose-500 text-white text-[8px] font-bold rounded-full">
                  {progress.badges.length}
                </span>
              )}
            </button>

            <LanguagePicker />
          </div>
        </div>
      </header>

      {/* ── Main content area ── */}
      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {currentView === 'landing' && (
            <Fragment key="landing">
              <LandingPage
                locale={locale}
                onStart={() => setCurrentView('grid')}
              />
            </Fragment>
          )}

          {currentView === 'grid' && (
            <Fragment key="grid">
              <TopicGrid
                locale={locale}
                content={content}
                progress={progress}
                isRtlLayout={isRtlLayout}
                showSavedOnly={showSavedOnly}
                setShowSavedOnly={setShowSavedOnly}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                topicsReadCount={topicsReadCount}
                totalTopics={totalTopics}
                onTopicSelect={handleTopicSelect}
              />
            </Fragment>
          )}

          {currentView === 'topic' && activeTopic && (
            <Fragment key="topic-shell">
              <TopicReader
                activeTopic={activeTopic}
                locale={locale}
                ageLevel={ageLevel}
                content={content}
                selectedTopicId={selectedTopicId}
                progress={progress}
                toggleSaveChapter={toggleSaveChapter}
                translating={translating}
                translationError={translationError}
                onRetryTranslation={() =>
                  setTranslationRetryCount(prev => prev + 1)
                }
                languageNames={LANGUAGE_NAMES}
                onNavigatePrev={handleNavigatePrev}
                onNavigateNext={handleNavigateNext}
                hasPrev={currentIdx > 0}
                hasNext={currentIdx < content.length - 1}
                onBackToGrid={() => setCurrentView('grid')}
                onSaveQuizScore={(topicId, score) => {
                  setQuizScore(topicId, score);
                }}
                onBadgeCheck={checkBadgeTriggers}
              />
            </Fragment>
          )}
        </AnimatePresence>
      </main>

      {/* ── All celebration + badge overlays ── */}
      <CelebrationOverlays
        locale={locale}
        progress={progress}
        showBadges={showBadges}
        setShowBadges={setShowBadges}
        unlockedBadgeName={unlockedBadgeName}
        setUnlockedBadgeName={setUnlockedBadgeName}
        masteredCategory={masteredCategory}
        setMasteredCategory={setMasteredCategory}
      />
    </div>
  );
}
