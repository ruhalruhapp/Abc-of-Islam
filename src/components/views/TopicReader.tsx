import { Fragment } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Volume2, ChevronLeft, ChevronRight } from 'lucide-react';
import AudioNarrator from '@/components/content/AudioNarrator';
import ImageCard from '@/components/content/ImageCard';
import ExportModal from '@/components/export/ExportModal';
import AgeSelector from '@/components/content/AgeSelector';
import QuizPanel from '@/components/content/QuizPanel';
import { getCategoryName } from '@/lib/translations';
import { t } from '@/lib/translations';
import { getDefensiveTitle, getDefensiveFunFact, getDefensiveContent } from '@/lib/helpers';
import type { Topic, UserProgress, Locale, AgeLevel } from '@/types';

interface TopicReaderProps {
  activeTopic: Topic;
  locale: Locale;
  ageLevel: AgeLevel;
  content: Topic[];               // full topic list (for prev/next bounds)
  selectedTopicId: string;
  progress: UserProgress;
  toggleSaveChapter: (id: string) => void;
  translating: boolean;
  translationError: string | null;
  onRetryTranslation: () => void;
  languageNames: Record<string, string>;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onBackToGrid: () => void;
  onSaveQuizScore: (topicId: string, score: number) => void;
  onBadgeCheck: () => void;
}

export default function TopicReader({
  activeTopic,
  locale,
  ageLevel,
  content,
  selectedTopicId,
  progress,
  toggleSaveChapter,
  translating,
  translationError,
  onRetryTranslation,
  languageNames,
  onNavigatePrev,
  onNavigateNext,
  hasPrev,
  hasNext,
  onBackToGrid,
  onSaveQuizScore,
  onBadgeCheck,
}: TopicReaderProps) {
  const title = getDefensiveTitle(activeTopic, locale);
  const bodyText = getDefensiveContent(activeTopic, ageLevel, locale);
  const funFact = getDefensiveFunFact(activeTopic, locale);
  const isSaved = progress.savedChapters?.includes(activeTopic.id) ?? false;

  return (
    <motion.div
      key="topic-view"
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      className="px-4 py-4 max-w-7xl mx-auto w-full flex-1 flex flex-col lg:h-[calc(100vh-64px)] lg:max-h-[calc(100vh-64px)] lg:overflow-hidden"
    >
      {/* ── Top action bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3 no-print shrink-0">
        <button
          onClick={onBackToGrid}
          className="flex items-center gap-2 text-emerald-800 hover:scale-[1.02] transition-transform font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Explore Index</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <div className="md:hidden">
            <AgeSelector />
          </div>

          {/* Save offline toggle */}
          <button
            onClick={() => toggleSaveChapter(activeTopic.id)}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 border-2 text-[10px] font-extrabold uppercase tracking-widest cursor-pointer transition-all rounded-full shadow-sm active:translate-y-px ${
              isSaved
                ? 'bg-amber-400 text-amber-950 border-amber-300'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-black/5'
            }`}
            title={isSaved ? 'Saved offline!' : 'Save chapter offline'}
          >
            <span>★ {isSaved ? 'Saved' : 'Save Offline'}</span>
          </button>

          <ExportModal content={content} currentTopicId={activeTopic.id} />
        </div>
      </div>

      {/* ── Main two-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 min-h-0 lg:overflow-hidden mb-2">

        {/* Left column: image, audio, content text */}
        <div className="lg:col-span-7 bg-white border-2 border-emerald-100 p-4 sm:p-5 space-y-4 rounded-3xl shadow-lg relative overflow-hidden flex flex-col h-full lg:overflow-y-auto custom-scrollbar">

          {/* Translation loading overlay */}
          {translating && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
              <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
              <h3 className="text-xl font-serif font-bold text-gray-800">Translating Chapter...</h3>
              <p className="text-sm text-gray-500 max-w-sm mt-3 leading-relaxed">
                Gemini AI is crafting a natural, child-friendly translation in{' '}
                <span className="font-semibold text-emerald-600">
                  {languageNames[locale] || locale}
                </span>
                . Just a second! 😊
              </p>
            </div>
          )}

          {/* Background watermark */}
          <div className="absolute right-0 top-0 text-[320px] font-sans font-black text-emerald-500/[0.015] select-none leading-none -mr-12 -mt-16 pointer-events-none">
            {activeTopic.emoji}
          </div>

          {/* Category + title */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-100/65 pb-4 relative z-10 shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-250">
                {getCategoryName(activeTopic.category, locale)}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-extrabold tracking-tight bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent mt-2 leading-none">
                {title}
              </h2>
            </div>
            <div className="text-4xl sm:text-5xl leading-none select-none filter drop-shadow-sm">
              {activeTopic.emoji}
            </div>
          </div>

          {/* Illustration */}
          <div className="relative z-10 w-full max-w-xs sm:max-w-sm mx-auto shrink-0 shadow-sm rounded-3xl overflow-hidden">
            <ImageCard src={activeTopic.image} alt={title} icon={activeTopic.emoji} />
          </div>

          {/* Audio narrator bar */}
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
            <AudioNarrator text={bodyText} />
          </div>

          {/* Translation error banner */}
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
                onClick={onRetryTranslation}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:translate-y-px text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl shadow-sm transition-all duration-150 cursor-pointer"
              >
                Try Translating Again 🔄
              </button>
            </div>
          )}

          {/* Body text */}
          <div className="prose max-w-none text-[#2C3E50]/90 selection:bg-emerald-500/10 font-sans leading-relaxed text-sm sm:text-base font-medium relative z-10">
            <p>{bodyText}</p>
          </div>

          {/* Fun fact */}
          {funFact && (
            <div className="p-4 rounded-3xl bg-amber-50 border border-amber-100/60 shadow-sm relative overflow-hidden z-10 shrink-0">
              <div className="absolute right-4 -bottom-4 text-6xl opacity-10 select-none text-amber-500">💡</div>
              <h4 className="text-xs font-bold uppercase tracking-[0.1em] text-amber-950 flex items-center gap-1.5 border-b border-amber-250 pb-2 mb-2">
                <span>🌟</span>
                <span>{t(locale, 'funFact')}</span>
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed relative z-10 font-normal">{funFact}</p>
            </div>
          )}
        </div>

        {/* Right column: quiz panel */}
        <div className="lg:col-span-5 flex flex-col h-full lg:overflow-y-auto custom-scrollbar space-y-4">
          {/*
           * key={selectedTopicId} on the Fragment — when the topic changes,
           * the Fragment unmounts, fully resetting QuizPanel's internal state
           * (quizActive, score, answers, scoreRef) with no explicit reset call.
           */}
          <Fragment key={selectedTopicId}>
            <QuizPanel
              activeTopic={activeTopic}
              locale={locale}
              progress={progress}
              onSaveScore={onSaveQuizScore}
              onBadgeCheck={onBadgeCheck}
            />
          </Fragment>
        </div>
      </div>

      {/* ── Prev / Next navigation ── */}
      <div className="flex gap-4 justify-between no-print shrink-0">
        <button
          id="btn-prev-topic"
          onClick={onNavigatePrev}
          disabled={!hasPrev}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-650 rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-sm"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          {/* FIX: these were hardcoded in English; now use the translation helper */}
          <span>{t(locale, 'previous')}</span>
        </button>
        <button
          id="btn-next-topic"
          onClick={onNavigateNext}
          disabled={!hasNext}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shadow-md"
        >
          <span>{t(locale, 'nextTopic')}</span>
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </motion.div>
  );
}
