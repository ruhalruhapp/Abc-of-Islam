import { useAppStore } from '@/lib/store';
import type { AgeLevel } from '@/types';
import { Baby, BookOpen, Brain } from 'lucide-react';

const LEVELS: { key: AgeLevel; label: string; age: string; icon: typeof Baby; color: string }[] = [
  { key: 'starter', label: 'Starter', age: '5-7', icon: Baby, color: 'bg-amber-500' },
  { key: 'explorer', label: 'Explorer', age: '8-11', icon: BookOpen, color: 'bg-sky-500' },
  { key: 'thinker', label: 'Thinker', age: '12-14', icon: Brain, color: 'bg-indigo-500' },
];

export default function AgeSelector() {
  const { ageLevel, setAgeLevel } = useAppStore();

  return (
    <div className="flex gap-2">
      {LEVELS.map(level => {
        const Icon = level.icon;
        const isActive = ageLevel === level.key;
        return (
          <button
            id={`btn-age-${level.key}`}
            key={level.key}
            onClick={() => setAgeLevel(level.key)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.03] active:scale-95 ${
              isActive
                ? `${level.color} text-white shadow-md shadow-black/10`
                : 'bg-white/80 text-gray-600 border border-gray-100 hover:bg-white hover:text-gray-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{level.label}</span>
            <span className="text-[10px] opacity-80 font-normal">({level.age})</span>
          </button>
        );
      })}
    </div>
  );
}
