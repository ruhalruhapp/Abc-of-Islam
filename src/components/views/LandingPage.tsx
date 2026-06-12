import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Shield, Star, Heart } from 'lucide-react';
import AgeSelector from '@/components/content/AgeSelector';
import { t } from '@/lib/translations';
import type { Locale } from '@/types';

interface LandingPageProps {
  locale: Locale;
  onStart: () => void;
}

export default function LandingPage({ locale, onStart }: LandingPageProps) {
  return (
    <motion.div
      key="landing-view"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="flex-1 px-6 py-16 sm:py-24 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#F2F9F3] via-[#FAF9F5] to-[#F1F7F4]"
    >
      {/* Background giant watermark letter */}
      <div className="absolute -left-20 -top-20 text-[540px] sm:text-[640px] font-serif font-black text-emerald-500/[0.02] leading-none select-none pointer-events-none z-0">
        A
      </div>

      {/* Floating emoji decorations */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <span className="absolute top-12 left-[12%] text-6xl opacity-40 float-animation select-none" style={{ animationDelay: '0s' }}>🕌</span>
        <span className="absolute top-[20%] right-[11%] text-5xl opacity-40 float-animation select-none" style={{ animationDelay: '1.2s' }}>📖</span>
        <span className="absolute bottom-20 left-[15%] text-5xl opacity-40 float-animation select-none" style={{ animationDelay: '0.6s' }}>🌙</span>
        <span className="absolute bottom-24 right-[13%] text-6xl opacity-40 float-animation select-none" style={{ animationDelay: '1.8s' }}>🕋</span>
        <span className="absolute top-[45%] left-[8%] text-4xl opacity-25 float-animation select-none" style={{ animationDelay: '2.5s' }}>🌴</span>
        <span className="absolute top-[60%] right-[7%] text-4xl opacity-25 float-animation select-none" style={{ animationDelay: '0.9s' }}>🐪</span>
      </div>

      <div className="relative text-center max-w-3xl mx-auto z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 font-extrabold text-[10px] uppercase tracking-wider rounded-full border border-emerald-100 shadow-sm mb-8 animate-pulse">
          <span>🦄 Discovering Islam Series</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif font-extrabold mb-6 leading-tight tracking-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
          {t(locale, 'title')}
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl font-sans font-medium text-slate-700/80 leading-relaxed max-w-2xl mb-10">
          {t(locale, 'subtitle')}
        </p>

        {/* Age level selector */}
        <div className="bg-white border-2 border-emerald-100 p-2.5 rounded-full mb-10 flex items-center gap-1.5 shadow-md">
          <AgeSelector />
        </div>

        {/* Primary CTA */}
        <button
          id="landing-cta-start"
          onClick={onStart}
          className="font-sans inline-flex items-center gap-3 px-12 py-4.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white rounded-full font-bold text-sm uppercase tracking-wider hover:scale-105 hover:shadow-xl active:scale-95 transition-all duration-300 cursor-pointer shadow-md shadow-emerald-200"
        >
          <Sparkles className="w-5 h-5 text-yellow-200 animate-spin" style={{ animationDuration: '6s' }} />
          <span>{t(locale, 'startReading')}</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>

        {/* Feature stats */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-xl">
          <div className="flex flex-col items-center p-5 bg-white border border-emerald-50 rounded-2xl shadow-md transition-transform hover:-translate-y-1">
            <span className="text-3xl mb-1.5">🌍</span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">{t(locale, 'languages')}</span>
            <span className="text-[11px] text-gray-500 mt-1">Multi-lingual Support</span>
          </div>
          <div className="flex flex-col items-center p-5 bg-white border border-emerald-50 rounded-2xl shadow-md transition-transform hover:-translate-y-1">
            <span className="text-3xl mb-1.5">🔊</span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">{t(locale, 'audioNarration')}</span>
            <span className="text-[11px] text-gray-500 mt-1">Sweet Audio Reader</span>
          </div>
          <div className="flex flex-col items-center p-5 bg-white border border-emerald-50 rounded-2xl shadow-md transition-transform hover:-translate-y-1">
            <span className="text-3xl mb-1.5">🎨</span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">{t(locale, 'pdfEbook')}</span>
            <span className="text-[11px] text-gray-500 mt-1">Printable Story sheets</span>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-[#2C3E50]/70 text-[11px] font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-50 text-sky-800 rounded-full border border-sky-100">
            <Shield className="w-3.5 h-3.5 text-sky-600" /> Kid-Friendly Basics
          </span>
          <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 text-amber-800 rounded-full border border-amber-100">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> 26 Beautiful Chapters
          </span>
          <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 text-rose-800 rounded-full border border-rose-100">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> 100% Peaceful &amp; Safe
          </span>
        </div>
      </div>
    </motion.div>
  );
}
