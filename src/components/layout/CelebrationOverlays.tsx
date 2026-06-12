import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import BadgeBoard from '@/components/gamification/BadgeBoard';
import { t } from '@/lib/translations';
import type { UserProgress, Locale } from '@/types';

interface CelebrationOverlaysProps {
  locale: Locale;
  progress: UserProgress;
  /** Badge cabinet drawer */
  showBadges: boolean;
  setShowBadges: (v: boolean) => void;
  /** Single new-badge unlock notification */
  unlockedBadgeName: string | null;
  setUnlockedBadgeName: (v: string | null) => void;
  /** Full category mastery celebration */
  masteredCategory: { name: string; emoji: string } | null;
  setMasteredCategory: (v: { name: string; emoji: string } | null) => void;
}

export default function CelebrationOverlays({
  locale,
  progress,
  showBadges,
  setShowBadges,
  unlockedBadgeName,
  setUnlockedBadgeName,
  masteredCategory,
  setMasteredCategory,
}: CelebrationOverlaysProps) {
  return (
    <>
      {/* ── Badge cabinet drawer ── */}
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

      {/* ── New badge unlocked notification ── */}
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

      {/* ── Category mastery celebration ── */}
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
                confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
              }}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-[1.03] active:scale-[0.98] text-white font-extrabold rounded-full text-xs uppercase tracking-widest cursor-pointer transition-all duration-200 shadow-md shadow-emerald-200/50"
            >
              Wow, Awesome! ✨
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}
