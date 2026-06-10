import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import React from 'react';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import content map dynamically on the fly
import { getContent } from './src/lib/content';
import { Topic } from './src/types';

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is missing');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function callGeminiWithRetry<T>(
  apiCall: () => Promise<T>,
  retries = 3,
  delayMs = 1500,
  contextMessage = 'Gemini API call'
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await apiCall();
    } catch (err: any) {
      attempt++;
      if (attempt >= retries) {
        console.error(`[Gemini Retry Handler] Failed after ${attempt} attempts for ${contextMessage}:`, err.message || err);
        throw err;
      }
      const nextDelay = delayMs * Math.pow(2, attempt - 1);
      console.warn(`[Gemini Retry Handler] ${contextMessage} failed (attempt ${attempt}/${retries}) with error: ${err.message || err}. Retrying in ${nextDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, nextDelay));
    }
  }
}

function getText(val: any, locale?: string): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return (locale && val[locale]) || val.en || Object.values(val)[0] || '';
  return String(val);
}

const levelLabels: Record<string, string> = {
  starter: 'Starter (Ages 5-7)',
  explorer: 'Explorer (Ages 8-11)',
  thinker: 'Thinker (Ages 12-14)',
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API 1: Server-Side PDF compiling route
  app.post('/api/pdf', async (req: Request, res: Response): Promise<any> => {
    try {
      const { locale = 'en', ageLevel = 'explorer', topicId } = req.body;
      const allContent = getContent(locale);
      const filteredContent = topicId 
        ? allContent.filter(item => item.id === topicId)
        : allContent;

      if (!filteredContent || filteredContent.length === 0) {
        return res.status(404).json({ error: 'Topics content empty' });
      }

      // Dynamically translate all topics for the exported document to match the exact selected user language
      const translatedContent = await Promise.all(
        filteredContent.map(item => translateTopicCached(item, locale))
      );

      // Load react-pdf dynamically to ensure isolation
      const { pdf, Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer');

      const styles = StyleSheet.create({
        page: {
          padding: 40,
          fontFamily: 'Helvetica',
          backgroundColor: '#FFFFFF',
        },
        cover: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        title: {
          fontSize: 34,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 15,
          color: '#10B981', // Emerald primary
        },
        subtitle: {
          fontSize: 16,
          textAlign: 'center',
          color: '#4B5563',
          marginBottom: 40,
        },
        letterTitle: {
          fontSize: 24,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 15,
          color: '#059669',
        },
        icon: {
          fontSize: 48,
          textAlign: 'center',
          marginBottom: 10,
        },
        content: {
          fontSize: 12,
          lineHeight: 1.8,
          color: '#1F2937',
          marginBottom: 20,
        },
        funFact: {
          fontSize: 11,
          padding: 15,
          backgroundColor: '#FFFBEB', // amber-50
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: '#F59E0B',
          marginBottom: 20,
        },
        funFactTitle: {
          fontSize: 11,
          fontWeight: 'bold',
          color: '#D97706',
          marginBottom: 5,
        },
        divider: {
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
          marginVertical: 15,
        },
      });

      const pages = translatedContent.map((item) => {
        const title = getDefensiveTitleLocal(item, locale);
        const desc = getDefensiveContentLocal(item, ageLevel, locale);
        const funFact = getDefensiveFunFactLocal(item, locale);

        return React.createElement(Page, { key: item.id, size: "A4", style: styles.page },
          React.createElement(View, { style: styles.icon },
            React.createElement(Text, {}, item.emoji)
          ),
          React.createElement(Text, { style: styles.letterTitle }, title),
          React.createElement(Text, { style: { fontSize: 10, textAlign: 'center', color: '#6B7280', marginBottom: 20 } },
            levelLabels[ageLevel] || ageLevel
          ),
          React.createElement(View, { style: styles.divider }),
          React.createElement(Text, { style: styles.content }, desc),
          React.createElement(View, { style: styles.divider }),
          funFact ? React.createElement(View, { style: styles.funFact },
            React.createElement(Text, { style: styles.funFactTitle }, "💡 Fact!"),
            React.createElement(Text, {}, funFact)
          ) : React.createElement(View, {})
        );
      });

      // Assemble whole package
      const coverPage = React.createElement(Page, { size: "A4", style: styles.page },
        React.createElement(View, { style: styles.cover },
          React.createElement(Text, { style: { fontSize: 62, textAlign: 'center', marginBottom: 20 } }, "🕌"),
          React.createElement(Text, { style: styles.title }, "ABC Of Islam"),
          React.createElement(Text, { style: styles.subtitle }, "Educational Multi-Lingual Chapters for Young Learners"),
          React.createElement(Text, { style: { fontSize: 12, color: '#9CA3AF', textAlign: 'center' } },
            `Contains ${translatedContent.length} topics • configured for ${levelLabels[ageLevel] || ageLevel}`
          )
        )
      );

      const doc = React.createElement(Document, {}, coverPage, ...pages);

      const stream = await pdf(doc).toBuffer();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="abc_of_islam_${locale}.pdf"`);
      res.send(stream);

    } catch (err: any) {
      console.error('PDF Server generation error:', err);
      res.status(500).json({ error: err.message || 'PDF render failed' });
    }
  });

  // API 2: Server-Side ePub compiling route
  app.post('/api/epub', async (req: Request, res: Response): Promise<any> => {
    try {
      const { locale = 'en', ageLevel = 'explorer' } = req.body;
      const allContent = getContent(locale);

      if (!allContent || allContent.length === 0) {
        return res.status(404).json({ error: 'Topics content empty' });
      }

      // Dynamically translate all topics for the exported ePub ebook to match the exact selected user language
      const translatedContent = await Promise.all(
        allContent.map(item => translateTopicCached(item, locale))
      );

      const EPub = (await import('epub-gen')).default;

      const chapters = translatedContent.map((item) => {
        const title = getDefensiveTitleLocal(item, locale);
        const desc = getDefensiveContentLocal(item, ageLevel, locale);
        const funFact = getDefensiveFunFactLocal(item, locale);

        return {
          title: `${item.emoji} ${title}`,
          data: `
            <div style="font-family: sans-serif; padding: 15px; background-color: #ffffff;">
              <h2 style="color: #059669; font-size: 1.5em; margin-bottom: 20px;">${title}</h2>
              <p style="font-size: 1.1em; line-height: 1.8; color: #1F2937;">${desc}</p>
              ${funFact ? `
                <div style="margin-top: 30px; padding: 15px; background-color: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 8px;">
                  <h4 style="margin: 0 0 10px 0; color: #D97706; font-size: 1em;">💡 Fact!</h4>
                  <p style="margin: 0; color: #1F2937; font-size: 0.95em; line-height: 1.6;">${funFact}</p>
                </div>
              ` : ''}
            </div>
          `,
        };
      });

      const options = {
        title: 'ABC Of Islam',
        author: 'ABC Of Islam Platform',
        publisher: 'ABC Of Islam Publishing',
        lang: locale,
        content: chapters,
      };

      const buffer = await new Promise<Buffer>((resolve, reject) => {
        const epub = new EPub(options);
        epub.on('end', () => {
          const zip = epub.zip;
          if (zip) {
            zip.generateAsync({ type: 'nodebuffer' }).then(resolve).catch(reject);
          } else {
            reject(new Error('EPUB zip structure is undefined'));
          }
        });
        epub.on('error', reject);
        epub.write('');
      });

      res.setHeader('Content-Type', 'application/epub+zip');
      res.setHeader('Content-Disposition', `attachment; filename="abc_of_islam_${locale}.epub"`);
      res.send(buffer);

    } catch (err: any) {
      console.error('EPUB Server packaging error:', err);
      res.status(500).json({ error: err.message || 'EPUB compile failed' });
    }
  });

  // API 3: Server-side Text-To-Speech endpoint using pristine Gemini Live/TTS engine
  app.post('/api/tts', async (req: Request, res: Response): Promise<any> => {
    try {
      const { text, locale = 'en' } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Text parameter is required' });
      }

      const client = getGenAI();
      const prompt = `Read the following educational Islamic chapter content for kids in an exceptionally natural, beautiful, warm, cheerful, and motivational voice. Speak with clear, expressive human-like cadence and enthusiastic positive energy. The language and accent of your speech must be native and perfectly suited for the locale: ${locale}.
Do not sound robotic or monotone. Deliver the reading with warm, engaging, and loving mother-like flow.
The text to read is:
${text}`;

      const response = await callGeminiWithRetry(
        () => client.models.generateContent({
          model: "gemini-3.1-flash-tts-preview",
          contents: [{ parts: [{ text: prompt }] }],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
            },
          },
        }),
        3,
        1500,
        `TTS voice synthesis for ${locale}`
      );

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        return res.status(500).json({ error: 'Could not obtain voice stream from Gemini TTS' });
      }

      res.json({ audio: base64Audio });
    } catch (err: any) {
      console.error('Server side Gemini TTS failed:', err);
      res.status(500).json({ error: err.message || 'Gemini Speech generation failed' });
    }
  });

  // API 4: Dynamic high-quality translation endpoint using Gemini 3.5 Flash
  app.post('/api/translate-topic', async (req: Request, res: Response): Promise<any> => {
    try {
      const { topic, locale } = req.body;
      if (!topic || !locale) {
        return res.status(400).json({ error: 'Topic and locale parameters are required' });
      }

      if (locale === 'en') {
        return res.json({ topic });
      }

      const translated = await translateTopicCached(topic, locale);
      res.json({ topic: translated });
    } catch (err: any) {
      console.error('Dynamic translation route failed:', err);
      res.status(500).json({ error: err.message || 'Translation failed' });
    }
  });

  // Client Static/Dev serving loaders
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started successfully on http://0.0.0.0:${PORT}`);
  });
}

// Helpers for localized parsing
const languageNames: Record<string, string> = {
  ar: 'Arabic',
  ur: 'Urdu',
  tr: 'Turkish',
  fr: 'French',
  es: 'Spanish',
  hi: 'Hindi',
  id: 'Indonesian',
  de: 'German',
  ru: 'Russian',
  bn: 'Bengali',
  pt: 'Portuguese',
  zh: 'Chinese (Simplified)',
  ja: 'Japanese',
  sw: 'Swahili',
  ko: 'Korean',
};

const CACHE_FILE_PATH = path.join(process.cwd(), 'src', 'content', 'translations_cache.json');
let translationCache: Record<string, Topic> = {};

// Load translation cache from disk on startup
try {
  if (fs.existsSync(CACHE_FILE_PATH)) {
    const fileContent = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
    translationCache = JSON.parse(fileContent);
    console.log(`[Translation Cache] Loaded ${Object.keys(translationCache).length} cached entries from disk.`);
  } else {
    // Ensure parent directory exists and write empty cache
    fs.mkdirSync(path.dirname(CACHE_FILE_PATH), { recursive: true });
    fs.writeFileSync(CACHE_FILE_PATH, '{}', 'utf-8');
  }
} catch (err: any) {
  console.error('[Translation Cache] Failed to load cache file from disk:', err.message);
}

function saveTranslationCacheToDisk() {
  try {
    fs.mkdirSync(path.dirname(CACHE_FILE_PATH), { recursive: true });
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(translationCache, null, 2), 'utf-8');
    console.log('[Translation Cache] Cache saved successfully to disk.');
  } catch (err: any) {
    console.error('[Translation Cache] Failed to write cache to file:', err.message);
  }
}

async function translateTopicIfNecessary(topic: Topic, locale: string): Promise<Topic> {
  if (!locale || locale === 'en') return topic;
  const targetLanguage = languageNames[locale];
  if (!targetLanguage) return topic;

  const client = getGenAI();
  const prompt = `You are a professional child-friendly educational translator.
Translate the following English Islamic learning topic content into correct, natural, grammatically pristine and engaging ${targetLanguage}.
Please ensure the translation is perfectly suited for children.
Do not change Islamic terms such as "Salah", "Shahada", "Tawheed" but translate their surrounding context and explanations beautifully.

Translate this exact JSON object structure. Only translate the string values. Do not translate the keys:
${JSON.stringify({
  title: topic.title,
  content: topic.content,
  funFact: topic.funFact,
  quiz: topic.quiz.map(q => ({
    q: q.q,
    options: q.options,
    explanation: q.explanation
  }))
})}`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      content: {
        type: Type.OBJECT,
        properties: {
          starter: { type: Type.STRING },
          explorer: { type: Type.STRING },
          thinker: { type: Type.STRING }
        },
        required: ["starter", "explorer", "thinker"]
      },
      funFact: { type: Type.STRING },
      quiz: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            q: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            explanation: { type: Type.STRING }
          },
          required: ["q", "options", "explanation"]
        }
      }
    },
    required: ["title", "content", "funFact", "quiz"]
  };

  let response;
  try {
    // Try primary model (gemini-3.5-flash) first
    console.log(`[Translation] Attempting translation for '${topic.id}' to '${locale}' using gemini-3.5-flash...`);
    response = await callGeminiWithRetry(
      () => client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema
        }
      }),
      3,
      1500,
      `Translate topic ${topic.id} to ${locale} (gemini-3.5-flash)`
    );
  } catch (primaryErr) {
    console.warn(`[Translation] Primary model failed, falling back to backup model (gemini-flash-latest) for topic ${topic.id} to ${locale}. Error:`, primaryErr);
    // Fallback to gemini-flash-latest
    try {
      response = await callGeminiWithRetry(
        () => client.models.generateContent({
          model: "gemini-flash-latest",
          contents: [{ parts: [{ text: prompt }] }],
          config: {
            responseMimeType: "application/json",
            responseSchema
          }
        }),
        2,
        1500,
        `Translate topic ${topic.id} to ${locale} (gemini-flash-latest)`
      );
    } catch (fallbackErr) {
      console.error(`[Translation] Both primary and backup models failed for topic ${topic.id} to ${locale}:`, fallbackErr);
      throw fallbackErr; // Propagate error upward to be caught by router (returns 500)
    }
  }

  const text = response.text;
  if (!text) {
    throw new Error("Translation returned empty response");
  }

  const parsed = JSON.parse(text);
  
  // Assemble translated topic
  const translatedTopic: Topic = {
    ...topic,
    title: parsed.title,
    content: parsed.content,
    funFact: parsed.funFact,
    quiz: topic.quiz.map((q, idx) => {
      const translatedQ = parsed.quiz?.[idx];
      return {
        ...q,
        q: translatedQ?.q || q.q,
        options: translatedQ?.options || q.options,
        explanation: translatedQ?.explanation || q.explanation
      };
    })
  };

  return translatedTopic;
}

async function translateTopicCached(topic: Topic, locale: string): Promise<Topic> {
  const cacheKey = `${locale}-${topic.id}`;
  if (translationCache[cacheKey]) {
    const cached = translationCache[cacheKey];
    // Check if cached entry is just the fallback English content (untranslated)
    const isTitleIdentical = cached.title === topic.title;
    const isStarterIdentical = cached.content?.starter === topic.content?.starter;
    if (isTitleIdentical && isStarterIdentical && locale !== 'en') {
      console.warn(`[Translation Server Cache] Overwriting untranslated cache entry for: ${cacheKey}`);
      delete translationCache[cacheKey];
    } else {
      return cached;
    }
  }
  const translated = await translateTopicIfNecessary(topic, locale);
  translationCache[cacheKey] = translated;
  saveTranslationCacheToDisk();
  return translated;
}

function getDefensiveTitleLocal(topic: Topic, locale: string) {
  if (typeof topic.title === 'string') return topic.title;
  return topic.title?.[locale] || topic.title?.en || 'Topic';
}

function getDefensiveFunFactLocal(topic: Topic, locale: string) {
  if (typeof topic.funFact === 'string') return topic.funFact;
  return topic.funFact?.[locale] || topic.funFact?.en || '';
}

function getDefensiveContentLocal(topic: Topic, ageLevel: string, locale: string) {
  const textByAge = (topic.content as any)?.[ageLevel];
  if (typeof textByAge === 'string') return textByAge;
  return textByAge?.[locale] || textByAge?.en || '';
}

startServer();
