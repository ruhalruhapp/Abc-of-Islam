import { useState, useRef } from 'react';
import { X, ArrowRight, CheckCircle2 } from 'lucide-react';
import BadgeBoard from '@/components/gamification/BadgeBoard';
import { t } from '@/lib/translations';
import {
  getDefensiveQuestion,
  getDefensiveOption,
  getDefensiveExplanation,
  getDefensiveTitle,
} from '@/lib/helpers';
import type { Topic, UserProgress, Locale } from '@/types';

interface QuizPanelProps {
  activeTopic: Topic;
  locale: Locale;
  progress: UserProgress;
  /** Persist the best score to the global store */
  onSaveScore: (topicId: string, score: number) => void;
  /** Notify App.tsx to check for newly earned badges */
  onBadgeCheck: () => void;
}

export default function QuizPanel({
  activeTopic,
  locale,
  progress,
  onSaveScore,
  onBadgeCheck,
}: QuizPanelProps) {
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [displayScore, setDisplayScore] = useState(0); // for rendering only
  const [quizCompleted, setQuizCompleted] = useState(false);

  /**
   * FIX: Use a ref instead of state to track the running score.
   *
   * The bug: `displayScore` is React state, so its value inside an event
   * handler is captured at render time (stale closure).  On the very last
   * question, `handleOptionPress` calls `setDisplayScore(prev + 1)` which
   * schedules a re-render.  If `handleNextQuizQuestion` reads `displayScore`
   * in the same or an adjacent microtask before that render completes, it
   * can see the old value and save a score that is 1 too low.
   *
   * A ref update is synchronous and is always the latest value, regardless
   * of whether React has flushed the state update yet.
   */
  const scoreRef = useRef(0);

  const totalQuestions = activeTopic.quiz?.length || 0;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const resetQuiz = () => {
    setQuizActive(false);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setDisplayScore(0);
    setQuizCompleted(false);
    scoreRef.current = 0; // always reset the ref alongside the state
  };

  const handleOptionPress = (choiceIdx: number, correctIdx: number) => {
    if (selectedOption !== null) return; // already answered
    setSelectedOption(choiceIdx);
    if (choiceIdx === correctIdx) {
      scoreRef.current += 1;           // update ref synchronously …
      setDisplayScore(scoreRef.current); // … then mirror into state for rendering
    }
  };

  const handleNext = () => {
    if (currentQuestionIdx < totalQuestions - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
    } else {
      // Quiz finished – use the ref value: it is always accurate, never stale.
      const finalScore = scoreRef.current;
      setQuizCompleted(true);
      const previousBest = progress.quizzesCompleted[activeTopic.id] ?? 0;
      if (finalScore > previousBest) {
        onSaveScore(activeTopic.id, finalScore);
        onBadgeCheck();
      }
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white border-2 border-amber-250 p-4 sm:p-5 text-slate-800 relative overflow-hidden rounded-3xl shadow-lg flex-1 min-h-0 flex flex-col justify-center">
      {/* Decorative top stripe */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-rose-400 to-sky-400" />

      {/* ── Pre-quiz prompt ── */}
      {!quizActive ? (
        <div className="text-center py-4 my-auto shrink-0">
          <div className="text-4xl mb-2 select-none">🎯</div>
          <h3 className="text-base font-serif font-bold text-[#2C3E50]">{t(locale, 'takeQuiz')}</h3>
          <p className="text-xs text-gray-500 mt-1.5 max-w-xs mx-auto leading-normal font-medium">
            Let's practice what we learned about {getDefensiveTitle(activeTopic, locale)} with a fun puzzle!
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
          {/* Quiz header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3 shrink-0">
            <span className="text-[9px] font-extrabold text-[#2C3E50]/70 tracking-wider uppercase bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
              {t(locale, 'questionOf')
                .replace('{current}', String(currentQuestionIdx + 1))
                .replace('{total}', String(totalQuestions))}
            </span>
            <button
              onClick={resetQuiz}
              className="p-1 hover:bg-rose-50 rounded-full transition-colors text-gray-400 hover:text-rose-500 cursor-pointer"
              title="Abort quiz"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {!quizCompleted ? (
            // ── Active question ──
            <div className="flex-1 flex flex-col justify-center min-h-0 space-y-3">
              {activeTopic.quiz && activeTopic.quiz[currentQuestionIdx] && (
                <>
                  <h4 className="font-serif font-extrabold text-xs sm:text-sm text-[#2C3E50] leading-snug shrink-0">
                    {getDefensiveQuestion(activeTopic.quiz[currentQuestionIdx], locale)}
                  </h4>

                  <div className="space-y-2 flex-1 flex flex-col justify-center min-h-0">
                    {activeTopic.quiz[currentQuestionIdx].options.map((opt, oIdx) => {
                      const optText = getDefensiveOption(opt, locale);
                      const isCorrect = oIdx === activeTopic.quiz[currentQuestionIdx].correct;
                      const isSelected = selectedOption === oIdx;
                      const answered = selectedOption !== null;

                      let btnStyle = 'border-amber-100 bg-[#FDFCFB]/50 hover:bg-amber-50/50 text-[#2C3E50]';
                      if (answered) {
                        if (isCorrect) {
                          btnStyle = 'border-emerald-400 bg-emerald-500 text-white font-extrabold shadow-md';
                        } else if (isSelected) {
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
                          disabled={answered}
                          className={`w-full py-2.5 px-3.5 text-left rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-between gap-2 min-h-10 cursor-pointer ${btnStyle}`}
                        >
                          <span>{optText}</span>
                          {answered && isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />}
                          {answered && isSelected && !isCorrect && <X className="w-3.5 h-3.5 text-white shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {selectedOption !== null && (
                    <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl text-[11px] text-slate-750 leading-relaxed shrink-0">
                      <span className="font-extrabold block text-[9px] uppercase tracking-wider text-amber-800 mb-0.5">
                        🎯 Learning Moment
                      </span>
                      {getDefensiveExplanation(activeTopic.quiz[currentQuestionIdx], locale)}
                    </div>
                  )}

                  {selectedOption !== null && (
                    <button
                      id="btn-quiz-continue"
                      onClick={handleNext}
                      className="w-full mt-2 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-xs font-extrabold uppercase tracking-wide shadow-md cursor-pointer transition-transform hover:scale-[1.01] shrink-0"
                    >
                      <span>
                        {currentQuestionIdx < totalQuestions - 1
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
            // ── Results dashboard ──
            <div className="text-center py-4 my-auto shrink-0 space-y-3.5">
              <div className="text-4xl select-none animate-bounce" style={{ animationDuration: '3s' }}>🏆</div>
              <h4 className="text-base font-serif font-extrabold text-[#2C3E50]">
                {displayScore === 3
                  ? t(locale, 'perfectScore')
                  : displayScore >= 2
                  ? t(locale, 'greatJob')
                  : t(locale, 'keepTrying')}
              </h4>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                You answered{' '}
                <span className="font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">
                  {displayScore}
                </span>{' '}
                of <span className="font-bold">3</span> answers correctly.
              </p>
              <div className="border-t border-b border-gray-100 py-2.5 my-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                <BadgeBoard />
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  id="btn-quiz-retry"
                  onClick={resetQuiz}
                  className="flex-1 py-2.5 bg-white hover:bg-gray-50 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-700 transition-colors cursor-pointer border border-[#ccc] shadow-sm"
                >
                  {t(locale, 'tryAgain')}
                </button>
                <button
                  id="btn-quiz-complete"
                  onClick={resetQuiz}
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
  );
}
