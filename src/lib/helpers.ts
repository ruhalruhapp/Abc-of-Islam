import type { Topic, QuizQuestion, AgeLevel, Locale } from '@/types';

export function getDefensiveTitle(topic: Topic, locale: Locale | string): string {
  if (typeof topic.title === 'string') return topic.title;
  return topic.title?.[locale] || topic.title?.['en'] || 'Topic';
}

export function getDefensiveFunFact(topic: Topic, locale: Locale | string): string {
  if (typeof topic.funFact === 'string') return topic.funFact;
  return topic.funFact?.[locale] || topic.funFact?.['en'] || '';
}

export function getDefensiveContent(
  topic: Topic,
  ageLevel: AgeLevel,
  locale: Locale | string,
): string {
  const textByAge = topic.content?.[ageLevel];
  if (typeof textByAge === 'string') return textByAge;
  return textByAge?.[locale] || textByAge?.['en'] || '';
}

export function getDefensiveQuestion(q: QuizQuestion, locale: Locale | string): string {
  if (typeof q.q === 'string') return q.q;
  return q.q?.[locale] || q.q?.['en'] || '';
}

export function getDefensiveOption(opt: unknown, locale: Locale | string): string {
  if (typeof opt === 'string') return opt;
  const o = opt as Record<string, string>;
  return o?.[locale] || o?.['en'] || '';
}

export function getDefensiveExplanation(q: QuizQuestion, locale: Locale | string): string {
  if (typeof q.explanation === 'string') return q.explanation;
  return q.explanation?.[locale] || q.explanation?.['en'] || '';
}
