import { useAppStore } from '@/lib/store';
import type { Locale } from '@/types';
import { Globe, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export const LANGUAGES: { code: Locale; name: string; nativeName: string; flag: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
];

const RTL_LOCALES: Locale[] = ['ar', 'ur'];

export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

export default function LanguagePicker() {
  const { locale, setLocale } = useAppStore();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0];

  return (
    <div className="relative">
      <button
        id="btn-lang-picker"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-none bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:scale-[1.01] active:translate-y-px transition-all text-xs font-extrabold uppercase tracking-widest text-black"
      >
        <Globe className="w-4 h-4 text-[#0A5430]" />
        <span>{current.flag} {current.nativeName}</span>
        <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2.5 z-50 bg-[#FDFCFB] border border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-2.5 grid grid-cols-2 gap-1.5 w-85 max-h-96 overflow-y-auto">
            {LANGUAGES.map(lang => (
              <button
                id={`lang-select-${lang.code}`}
                key={lang.code}
                onClick={() => { setLocale(lang.code); setOpen(false); }}
                className={`flex items-center gap-2.5 p-2 rounded-none text-left text-sm transition-all duration-150 ${
                  locale === lang.code
                    ? 'bg-black text-white font-bold shadow-none'
                    : 'hover:bg-[#0A5430]/10 text-black hover:text-[#0A5430]'
                }`}
              >
                <span className="text-xl leading-none">{lang.flag}</span>
                <div>
                  <div className="font-bold text-[11px] leading-tight uppercase font-mono">{lang.nativeName}</div>
                  <div className={`text-[9px] leading-tight opacity-85 ${locale === lang.code ? 'text-white' : 'text-black/50'} uppercase font-mono`}>{lang.name}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
