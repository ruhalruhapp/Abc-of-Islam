import { useAppStore } from '@/lib/store';
import type { UserProgress } from '@/types';

export const BADGES = [
  { id: 'first-topic', name: 'First Step', icon: '🏵️', desc: 'Read your first Islamic topic', condition: (p: UserProgress) => (p.topicsRead || []).length >= 1 },
  { id: 'five-topics', name: 'Five Scholars', icon: '📖', desc: 'Read 5 different letters', condition: (p: UserProgress) => (p.topicsRead || []).length >= 5 },
  { id: 'ten-topics', name: 'Golden Ten', icon: '🎖️', desc: 'Read 10 different letters', condition: (p: UserProgress) => (p.topicsRead || []).length >= 10 },
  { id: 'half-book', name: 'Halfway Explorer', icon: '🏆', desc: 'Read 13 different letters', condition: (p: UserProgress) => (p.topicsRead || []).length >= 13 },
  { id: 'full-book', name: 'Knowledge Master', icon: '🎓', desc: 'Complete all 26 Islamic lessons', condition: (p: UserProgress) => (p.topicsRead || []).length >= 26 },
  { id: 'quiz-ace', name: 'Quiz Brilliance', icon: '🎯', desc: 'Get a perfect score in any topic quiz', condition: (p: UserProgress) => Object.values(p.quizzesCompleted || {}).some((score) => score === 3) },
];

export default function BadgeBoard() {
  const { progress } = useAppStore();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {BADGES.map((badge) => {
        const earned = badge.condition(progress);
        return (
          <div
            id={`badge-card-${badge.id}`}
            key={badge.id}
            className={`p-4 rounded-none text-center border transition-all duration-250 ${
              earned
                ? 'bg-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:scale-[1.01]'
                : 'bg-[#FDFCFB] border-black/10 opacity-40'
            }`}
          >
            <div className={`text-4xl block mb-2 filter drop-shadow-sm select-none transition-transform duration-500 ${earned ? 'group-hover:rotate-6 group-hover:scale-105' : ''}`}>
              {badge.icon}
            </div>
            <h4 className="text-xs font-bold text-black uppercase tracking-wider leading-tight font-mono">{badge.name}</h4>
            <p className="text-[10px] text-black/60 mt-1 leading-normal max-w-[120px] mx-auto font-medium">{badge.desc}</p>
            {earned ? (
              <div className="text-[#0A5430] text-[9px] mt-2 font-bold uppercase tracking-wider inline-flex items-center gap-0.5 px-2 py-0.5 bg-[#0A5430]/10 border border-[#0A5430]/25 rounded-none">
                ⭐ Earned
              </div>
            ) : (
              <div className="text-black/40 text-[9px] mt-2 font-bold uppercase tracking-wider">
                Locked
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
