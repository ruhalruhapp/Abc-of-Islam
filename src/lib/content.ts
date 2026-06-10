import type { Locale, Topic } from '@/types';

import en from '@/content/en.json';
import ar from '@/content/ar.json';
import ur from '@/content/ur.json';
import tr from '@/content/tr.json';
import fr from '@/content/fr.json';
import es from '@/content/es.json';
import hi from '@/content/hi.json';
import id from '@/content/id.json';
import de from '@/content/de.json';
import ru from '@/content/ru.json';
import bn from '@/content/bn.json';
import pt from '@/content/pt.json';
import zh from '@/content/zh.json';
import ja from '@/content/ja.json';
import sw from '@/content/sw.json';
import ko from '@/content/ko.json';

const CONTENT_MAP: Record<string, Topic[]> = {
  en: en as unknown as Topic[],
  ar: ar as unknown as Topic[],
  ur: ur as unknown as Topic[],
  tr: tr as unknown as Topic[],
  fr: fr as unknown as Topic[],
  es: es as unknown as Topic[],
  hi: hi as unknown as Topic[],
  id: id as unknown as Topic[],
  de: de as unknown as Topic[],
  ru: ru as unknown as Topic[],
  bn: bn as unknown as Topic[],
  pt: pt as unknown as Topic[],
  zh: zh as unknown as Topic[],
  ja: ja as unknown as Topic[],
  sw: sw as unknown as Topic[],
  ko: ko as unknown as Topic[],
};

export function getContent(locale: Locale): Topic[] {
  if (CONTENT_MAP[locale]) return CONTENT_MAP[locale];
  return CONTENT_MAP.en;
}

export function getTopicById(locale: Locale, id: string): Topic | undefined {
  return getContent(locale).find(t => t.id === id);
}
