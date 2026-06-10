import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/lib/store';

interface AudioNarratorProps {
  text: string;
}

// Clean emojis or special characters from reading text
function getCleanText(text: string): string {
  return text.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '');
}

// Float32 PCM Player function to play raw audio from Gemini TTS
function playRawPCM(base64Data: string, sampleRate = 24000): { stop: () => void; finishedPromise: Promise<void> } | null {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
    const binary = atob(base64Data);
    const len = binary.length;
    const buffer = new ArrayBuffer(len);
    const view = new DataView(buffer);
    for (let i = 0; i < len; i++) {
      view.setUint8(i, binary.charCodeAt(i));
    }

    const samplesCount = len / 2;
    const float32Data = new Float32Array(samplesCount);
    for (let i = 0; i < samplesCount; i++) {
      const sample = view.getInt16(i * 2, true);
      float32Data[i] = sample / 32768;
    }

    const audioBuffer = audioCtx.createBuffer(1, samplesCount, sampleRate);
    audioBuffer.copyToChannel(float32Data, 0);

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);

    let resolveFinished: () => void;
    const finishedPromise = new Promise<void>((resolve) => {
      resolveFinished = resolve;
    });

    source.onended = () => {
      audioCtx.close();
      resolveFinished();
    };

    source.start(0);

    return {
      stop: () => {
        try {
          source.stop();
          audioCtx.close();
        } catch (e) {
          // ignore
        }
        resolveFinished();
      },
      finishedPromise
    };
  } catch (err) {
    console.error('Failed to play raw PCM:', err);
    return null;
  }
}

// Fallback search algorithm for local browser female speech synthesizers
function getFemaleVoice(voices: SpeechSynthesisVoice[], locale: string): SpeechSynthesisVoice | null {
  const localeLower = locale.toLowerCase().replace('_', '-');
  let candidates = voices.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith(localeLower));
  
  if (candidates.length === 0 && localeLower.length > 2) {
    const mainLang = localeLower.substring(0, 2);
    candidates = voices.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith(mainLang));
  }
  
  if (candidates.length === 0) {
    candidates = voices;
  }

  const femaleKeywords = [
    'female', 'woman', 'girl', 'lady', 'samantha', 'zira', 'hazel', 'susan', 'tessa', 'victoria', 
    'moira', 'karen', 'fiona', 'siri', 'veena', 'haruka', 'kyoko', 'ting-ting', 'sin-ji', 'mei-jia', 
    'yating', 'melina', 'noora', 'ioana', 'milena', 'yelena', 'liana', 'sara', 'laura', 'clara', 
    'aurélie', 'amelie', 'anna', 'petra', 'monica', 'alva', 'paulina', 'hoda', 'leila', 'ayushi', 
    'kalpana', 'dilara', 'filiz', 'yolda', 'kiko', 'nanami', 'heun-chae', 'sun-hi', 'amina', 'sahar',
    'fatima', 'yasmin', 'nadia', 'mary', 'elizabeth', 'sarah', 'alice', 'emily', 'charlotte', 'heather',
    'kristina', 'helena', 'solene', 'maja', 'zofia', 'katya', 'tatyana', 'olga', 'linda', 'heka', 
    'sherazade', 'zoe', 'chloe', 'sophie', 'kendra', 'amy', 'stephanie', 'nicole', 'jessica', 'kirsten'
  ];

  const maleKeywords = [
    'male', 'man', 'boy', 'guy', 'bruce', 'david', 'mark', 'george', 'ravi', 'sean', 'bengt', 'stefan',
    'pavel', 'andrzej', 'danylo', 'heera', 'tarik', 'zayd', 'maged', 'kurt', 'karl', 'filippo', 'daniel',
    'oliver', 'thomas', 'mathieu', 'nicolas', 'paul', 'pierre', 'jacques', 'mikhail', 'dmitry', 'igor',
    'hans', 'dieter', 'wolfgang', 'francesco', 'giovanni', 'luigi', 'antonio', 'carlos', 'javier', 'manuel',
    'robert', 'john', 'william', 'james', 'charles', 'joseph', 'richard', 'alex', 'albert', 'stefanos', 'pino'
  ];

  const scoredCandidates = candidates.map(v => {
    const nameLower = v.name.toLowerCase();
    const isMale = maleKeywords.some(kw => nameLower.includes(kw));
    
    let score = 0;
    
    if (isMale) {
      score -= 200;
    }
    
    const hasFemaleKeyword = femaleKeywords.some(kw => nameLower.includes(kw));
    if (hasFemaleKeyword) {
      score += 100;
    }
    
    const premiumKeywords = ['natural', 'online', 'neural', 'siri', 'premium', 'high quality', 'synthesized', '3d', 'super'];
    const isPremium = premiumKeywords.some(kw => nameLower.includes(kw));
    if (isPremium) {
      score += 250;
    }
    
    const premiumFemaleNames = ['samantha', 'zira', 'hazel', 'victoria', 'aria', 'natasha', 'sara', 'jenny', 'karen', 'clara', 'amelie', 'anna'];
    if (premiumFemaleNames.some(name => nameLower.includes(name))) {
      score += 50;
    }

    if (nameLower.includes('google') || nameLower.includes('microsoft') || nameLower.includes('apple') || nameLower.includes('chrome')) {
      score += 30;
    }

    return { voice: v, score };
  });

  scoredCandidates.sort((a, b) => b.score - a.score);

  if (scoredCandidates.length > 0) {
    return scoredCandidates[0].voice;
  }

  return null;
}

export default function AudioNarrator({ text }: AudioNarratorProps) {
  const { locale, audioEnabled } = useAppStore();
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const currentPCMHandle = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setReady(true);
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const speakNativeFallback = useCallback((cleanText: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = locale;
    
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = getFemaleVoice(voices, locale);
    
    if (matchedVoice) {
      utterance.voice = matchedVoice;
      
      const nameLower = matchedVoice.name.toLowerCase();
      const isNeuralOrOnline = ['natural', 'online', 'neural', 'siri', 'premium'].some(kw => nameLower.includes(kw));
      
      if (isNeuralOrOnline) {
        utterance.rate = 0.98;
        utterance.pitch = 1.05;
      } else {
        utterance.rate = 1.02;
        utterance.pitch = 1.12;
      }
    } else {
      utterance.rate = 1.0;
      utterance.pitch = 1.08;
    }

    utterance.onend = () => {
      setSpeaking(false);
      setLoading(false);
    };
    utterance.onerror = () => {
      setSpeaking(false);
      setLoading(false);
    };

    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }, [locale]);

  const speak = useCallback(async () => {
    if (!text) return;

    if (currentPCMHandle.current) {
      currentPCMHandle.current.stop();
      currentPCMHandle.current = null;
    }
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
    }

    const cleanText = getCleanText(text);

    setLoading(true);
    setSpeaking(true);

    try {
      // Fire request to our premium natural server-side Google GenAI TTS engine
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, locale }),
      });

      if (!res.ok) {
        throw new Error('TTS response error');
      }

      const data = await res.json();
      if (!data.audio) {
        throw new Error('No audio voice stream found');
      }

      const handle = playRawPCM(data.audio);
      if (handle) {
        currentPCMHandle.current = handle;
        setLoading(false);
        await handle.finishedPromise;
        setSpeaking(false);
        currentPCMHandle.current = null;
      } else {
        throw new Error('Audio PCM playback initialization failed');
      }
    } catch (err) {
      console.warn('Advanced Google TTS model failed. Activating native fallback...', err);
      speakNativeFallback(cleanText);
    }
  }, [text, locale, speakNativeFallback]);

  const stop = useCallback(() => {
    if (currentPCMHandle.current) {
      currentPCMHandle.current.stop();
      currentPCMHandle.current = null;
    }
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      if (currentPCMHandle.current) {
        currentPCMHandle.current.stop();
      }
      if (typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!audioEnabled || !text) return null;

  return (
    <button
      id="btn-voice-narration"
      disabled={loading}
      onClick={speaking ? stop : speak}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm shadow-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer ${
        loading
          ? 'bg-amber-500 text-white animate-pulse'
          : speaking
          ? 'bg-rose-500 text-white animate-pulse'
          : 'bg-teal-600 text-white hover:bg-teal-700'
      }`}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Tuning Voice...</span>
        </>
      ) : speaking ? (
        <>
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
          <span>Stop Narration</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4 fill-none stroke-current" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6l-4 4H4v4h4l4 4V6z" />
          </svg>
          <span>Read Aloud</span>
        </>
      )}
    </button>
  );
}
