/** Human-readable display names for every supported locale.
 *  Used on the client (App.tsx) and server (server.ts – translation prompts). */
export const LANGUAGE_NAMES: Record<string, string> = {
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

export const VALID_LOCALES = new Set(Object.keys(LANGUAGE_NAMES));

export const VALID_AGE_LEVELS = new Set(['starter', 'explorer', 'thinker']);
