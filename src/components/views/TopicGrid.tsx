import { motion } from 'motion/react';
import { X, Search, BookOpen, Check, CheckCircle2 } from 'lucide-react';
import ExportModal from '@/components/export/ExportModal';
import { t, getCategoryName } from '@/lib/translations';
import { CATEGORIES } from '@/lib/topics';
import { getContent } from '@/lib/content';
import { getDefensiveTitle, getDefensiveFunFact } from '@/lib/helpers';
import type { Topic, UserProgress, Locale } from '@/types';

// ─── Category colour themes ───────────────────────────────────────────────────
const CATEGORY_THEMES: Record<string, {
  bg: string; border: string; glow: string; badge: string; text: string;
}> = {
  pillars_of_islam: {
    bg: 'bg-gradient-to-r from-emerald-400 to-teal-400',
    border: 'border-emerald-250', glow: 'shadow-emerald-100',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200 rounded-full',
    text: 'text-emerald-800',
  },
  core_beliefs: {
    bg: 'bg-gradient-to-r from-amber-400 to-yellow-400',
    border: 'border-amber-250', glow: 'shadow-amber-100',
    badge: 'bg-amber-50 text-amber-800 border-amber-200 rounded-full',
    text: 'text-amber-800',
  },
  daily_practices: {
    bg: 'bg-gradient-to-r from-sky-400 to-blue-400',
    border: 'border-sky-250', glow: 'shadow-sky-100',
    badge: 'bg-sky-50 text-sky-800 border-sky-200 rounded-full',
    text: 'text-sky-800',
  },
  islamic_values: {
    bg: 'bg-gradient-to-r from-rose-400 to-pink-400',
    border: 'border-rose-250', glow: 'shadow-rose-100',
    badge: 'bg-rose-50 text-rose-800 border-rose-200 rounded-full',
    text: 'text-rose-800',
  },
  stories_history: {
    bg: 'bg-gradient-to-r from-fuchsia-400 to-purple-400',
    border: 'border-fuchsia-250', glow: 'shadow-fuchsia-100',
    badge: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200 rounded-full',
    text: 'text-fuchsia-800',
  },
  special_times: {
    bg: 'bg-gradient-to-r from-violet-400 to-indigo-400',
    border: 'border-violet-250', glow: 'shadow-violet-100',
    badge: 'bg-violet-50 text-violet-800 border-violet-200 rounded-full',
    text: 'text-violet-800',
  },
};

// ─── Quick-search synonym map ─────────────────────────────────────────────────
function matchesSynonym(query: string, topic: Topic): boolean {
  const id = topic.id;
  const cat = topic.category;
  if (query === 'pillars') return cat === 'pillars_of_islam';
  if (query === 'wudu') return id === 'wudu' || cat === 'daily_practices';
  if (query === 'kaaba') return id === 'hajj' || id === 'salah' || cat === 'pillars_of_islam';
  if (query === 'ramadan') return id === 'sawm' || id === 'ramadan' || cat === 'special_times';
  if (query === 'arafat') return id === 'hajj' || id === 'eid_al_adha';
  if (query === 'values') return cat === 'islamic_values';
  if (query === 'stories') return cat === 'stories_history';
  return false;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface TopicGridProps {
  locale: Locale;
  content: Topic[];
  progress: UserProgress;
  isRtlLayout: boolean;
  showSavedOnly: boolean;
  setShowSavedOnly: (v: boolean) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  topicsReadCount: number;
  totalTopics: number;
  onTopicSelect: (id: string) => void;
}

export default function TopicGrid({
  locale,
  content,
  progress,
  isRtlLayout,
  showSavedOnly,
  setShowSavedOnly,
  searchQuery,
  setSearchQuery,
  topicsReadCount,
  totalTopics,
  onTopicSelect,
}: TopicGridProps) {
  const englishContent = getContent('en');

  return (
    <motion.div
      key="grid-view"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10"
    >
      {/* ── Progress header ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-[#F9FBF8] p-6 sm:p-8 text-slate-800 border-2 border-emerald-100 shadow-md mb-12">
        <div className="absolute inset-y-0 right-0 opacity-[0.03] pointer-events-none select-none text-[320px] font-serif font-black leading-none -mr-16 -mt-16 text-emerald-600">🕌</div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-emerald-800 text-[10px] font-extrabold uppercase tracking-[0.15em] bg-emerald-50 border border-emerald-200 px-4.5 py-2 rounded-full shadow-sm">
              🎈 Little Muslim Adventure
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mt-4 leading-tight text-[#2C3E50]">My Learning Map! 🗺️</h2>
            <p className="text-sm sm:text-base text-gray-500 mt-2 font-medium">
              Read letters, play fun quizzes, and collect glowing gold badges! ✨
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => setShowSavedOnly(!showSavedOnly)}
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

          {/* Progress bar widget */}
          <div className="w-full md:max-w-xs shrink-0 bg-white border border-emerald-100 p-5 rounded-3xl shadow-md">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2 text-[#2C3E50]">
              <span className="flex items-center gap-1">🏆 Adventure Score</span>
              <span className="font-sans text-emerald-650 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                {Math.round((topicsReadCount / totalTopics) * 100)}%
              </span>
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

      {/* ── Search bar ── */}
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
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2C3E50]/70">Quick Searches:</span>
          {['Pillars', 'Wudu', 'Kaaba', 'Ramadan', 'Arafat', 'Values', 'Stories'].map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(searchQuery.toLowerCase() === tag.toLowerCase() ? '' : tag)}
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

      {/* ── Category sections ── */}
      <div className="space-y-16">
        {(() => {
          let hasResults = false;
          const query = searchQuery.toLowerCase().trim();

          const sections = CATEGORIES.map(category => {
            const topicsInCat = content.filter(topic => {
              if (topic.category !== category.id) return false;
              if (showSavedOnly && !(progress.savedChapters || []).includes(topic.id)) return false;
              if (!query) return true;

              const eng = englishContent.find(t => t.id === topic.id) || topic;
              const titleLocal = getDefensiveTitle(topic, locale).toLowerCase();
              const titleEng = (typeof eng.title === 'string' ? eng.title : eng.title?.['en'] || '').toLowerCase();
              const factLocal = getDefensiveFunFact(topic, locale).toLowerCase();
              const factEng = (typeof eng.funFact === 'string' ? eng.funFact : eng.funFact?.['en'] || '').toLowerCase();
              const starterL = ((topic.content?.starter as any)?.[locale] || (topic.content?.starter as any)?.en || (typeof topic.content?.starter === 'string' ? topic.content.starter : '')).toLowerCase();
              const explorerL = ((topic.content?.explorer as any)?.[locale] || (topic.content?.explorer as any)?.en || (typeof topic.content?.explorer === 'string' ? topic.content.explorer : '')).toLowerCase();
              const thinkerL = ((topic.content?.thinker as any)?.[locale] || (topic.content?.thinker as any)?.en || (typeof topic.content?.thinker === 'string' ? topic.content.thinker : '')).toLowerCase();
              const catNameLocal = getCategoryName(topic.category, locale).toLowerCase();
              const catNameEng = getCategoryName(topic.category, 'en').toLowerCase();

              return (
                titleLocal.includes(query) || titleEng.includes(query) ||
                factLocal.includes(query) || factEng.includes(query) ||
                starterL.includes(query) || explorerL.includes(query) || thinkerL.includes(query) ||
                catNameLocal.includes(query) || catNameEng.includes(query) ||
                topic.id.toLowerCase().includes(query) ||
                topic.category.toLowerCase().includes(query) ||
                matchesSynonym(query, topic)
              );
            });

            if (topicsInCat.length === 0) return null;
            hasResults = true;

            const theme = CATEGORY_THEMES[category.id] || CATEGORY_THEMES.pillars_of_islam;
            const readInCat = topicsInCat.filter(t => progress.topicsRead.includes(t.id)).length;
            const quizzedInCat = topicsInCat.filter(t => progress.quizzesCompleted[t.id] !== undefined).length;
            const allRead = readInCat === topicsInCat.length;
            const allQuizzed = quizzedInCat === topicsInCat.length;

            return (
              <section key={category.id} className="scroll-mt-20 text-black">
                {/* Category banner */}
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
                          📖 {readInCat} of {topicsInCat.length} Read
                        </span>
                        <span className="bg-white/15 backdrop-blur-sm px-2.5 py-0.5 rounded-full font-semibold border border-white/10">
                          🎯 {quizzedInCat} of {topicsInCat.length} Quizzes
                        </span>
                      </div>
                    </div>
                  </div>
                  {allQuizzed ? (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: [1, 1.05, 1], opacity: 1 }}
                      transition={{ repeat: Infinity, repeatType: 'reverse', duration: 3, ease: 'easeInOut' }}
                      className="relative shrink-0 self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 border border-amber-250 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-md shadow-amber-400/20"
                    >
                      <span>🏆 Category Mastered!</span>
                    </motion.div>
                  ) : allRead ? (
                    <div className="relative shrink-0 self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500/20 backdrop-blur-sm text-emerald-100 border border-emerald-400/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>All Read</span>
                    </div>
                  ) : null}
                </div>

                {/* Topic cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topicsInCat.map(topic => {
                    const isRead = progress.topicsRead.includes(topic.id);
                    const quizRecord = progress.quizzesCompleted[topic.id];
                    return (
                      <button
                        id={`topic-launcher-${topic.id}`}
                        key={topic.id}
                        onClick={() => onTopicSelect(topic.id)}
                        className="group relative text-left rounded-none overflow-hidden transition-all bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-px active:translate-y-px cursor-pointer"
                      >
                        <div className="relative aspect-[16/10] bg-[#FDFCFB] flex items-center justify-center overflow-hidden border-b border-black">
                          <img
                            src={`/images/${topic.image}`}
                            alt={getDefensiveTitle(topic, locale)}
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                            className="w-full h-full object-cover grayscale opacity-90 transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute top-3.5 left-3.5 text-lg bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded-none w-8 h-8 flex items-center justify-center select-none font-serif leading-none">
                            {topic.emoji}
                          </div>
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
                            {getDefensiveTitle(topic, locale)}
                          </h4>
                          <div className="flex items-center justify-between mt-3 text-[9px] font-bold uppercase tracking-widest text-black/50 border-t border-black/10 pt-2.5">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5 opacity-70 text-black" />
                              <span>Read details</span>
                            </span>
                            {quizRecord !== undefined ? (
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

          if (!hasResults) {
            return (
              <div className="bg-white border border-black p-10 sm:p-12 text-center rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center max-w-xl mx-auto my-8">
                <span className="text-6xl mb-6">🔍</span>
                <h3 className="text-2xl font-serif font-light italic text-black leading-tight">No Chapters Found</h3>
                <p className="text-xs sm:text-sm text-black/50 mt-3 font-medium max-w-sm">
                  We couldn't find any results for <strong className="text-black bg-amber-200 px-1.5 py-0.5 font-mono">"{searchQuery}"</strong>. Try checking your spelling or search for other pillars or values.
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

          return sections;
        })()}
      </div>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <p className="text-xs text-gray-400 font-medium">{t(locale, 'footer')}</p>
        <div className="shrink-0">
          <ExportModal content={content} />
        </div>
      </div>
    </motion.div>
  );
}
