import type { Category, Topic } from '@/types';

export const CATEGORIES: Category[] = [
  { id: 'pillars_of_islam', name: 'Pillars of Islam', emoji: '🕌' },
  { id: 'core_beliefs', name: 'Core Beliefs', emoji: '📖' },
  { id: 'daily_practices', name: 'Daily Practices', emoji: '✨' },
  { id: 'islamic_values', name: 'Islamic Values', emoji: '💚' },
  { id: 'stories_history', name: 'Stories & History', emoji: '📜' },
  { id: 'special_times', name: 'Special Times', emoji: '🌙' },
];

export const TOPICS: Omit<Topic, 'content' | 'funFact' | 'quiz'>[] = [
  { id: 'shahada', emoji: '☪️', title: 'Shahada - Declaration of Faith', image: 'aqeedah.webp', category: 'pillars_of_islam' },
  { id: 'salah', emoji: '🤲', title: 'Salah - Prayer', image: 'prayer_salah.webp', category: 'pillars_of_islam' },
  { id: 'zakat', emoji: '💰', title: 'Zakat - Charity', image: 'zakat.png', category: 'pillars_of_islam' },
  { id: 'sawm', emoji: '🌙', title: 'Sawm - Fasting in Ramadan', image: 'ramadan_fasting.webp', category: 'pillars_of_islam' },
  { id: 'hajj', emoji: '🕋', title: 'Hajj - Pilgrimage to Mecca', image: 'hajj_overview.webp', category: 'pillars_of_islam' },

  { id: 'tawheed', emoji: '☝️', title: 'Tawheed - Oneness of God', image: 'aqeedah.webp', category: 'core_beliefs' },
  { id: 'angels', emoji: '👼', title: 'Angels', image: 'imgi_10_pillar_duas.webp', category: 'core_beliefs' },
  { id: 'holy_books', emoji: '📕', title: 'Holy Books', image: 'quran_arabic.webp', category: 'core_beliefs' },
  { id: 'prophets', emoji: '🧑\u200D🏫', title: 'Prophets of Allah', image: 'prophet_stories.webp', category: 'core_beliefs' },
  { id: 'day_of_judgment', emoji: '⚖️', title: 'Day of Judgment', image: 'myths_facts.webp', category: 'core_beliefs' },

  { id: 'wudu', emoji: '🚿', title: 'Wudu - Ablution', image: 'ablution_wudu.webp', category: 'daily_practices' },
  { id: 'islamic_dress', emoji: '👗', title: 'Islamic Dress', image: 'islamic_dress.webp', category: 'daily_practices' },
  { id: 'halal_food', emoji: '🍽️', title: 'Halal Food', image: 'halal_haram.webp', category: 'daily_practices' },
  { id: 'duas', emoji: '🤲', title: 'Duas - Supplications', image: 'duas.webp', category: 'daily_practices' },
  { id: 'reading_quran', emoji: '📖', title: 'Reading Quran', image: 'quran_recitation.webp', category: 'daily_practices' },

  { id: 'honesty', emoji: '🤝', title: 'Honesty', image: 'akhlaq.webp', category: 'islamic_values' },
  { id: 'kindness', emoji: '💕', title: 'Kindness', image: 'helping_poor.webp', category: 'islamic_values' },
  { id: 'respect', emoji: '🙏', title: 'Respect', image: 'respect_elders.webp', category: 'islamic_values' },
  { id: 'patience', emoji: '🧘', title: 'Patience', image: 'shared_values.webp', category: 'islamic_values' },
  { id: 'gratitude', emoji: '🙏', title: 'Gratitude', image: 'hiba_gifts.webp', category: 'islamic_values' },

  { id: 'prophet_muhammad', emoji: '☪️', title: 'Prophet Muhammad ﷺ', image: 'prophet_journey.webp', category: 'stories_history' },
  { id: 'prophet_ibrahim', emoji: '🏗️', title: 'Prophet Ibrahim', image: 'imgi_21_topic_abrahamic_religions.webp', category: 'stories_history' },
  { id: 'islamic_civilization', emoji: '🏛️', title: 'Islamic Civilization', image: 'islamic_civilization.webp', category: 'stories_history' },
  { id: 'al_khwarizmi', emoji: '📐', title: 'Al-Khwarizmi - Father of Algebra', image: 'al_khwarizmi.png', category: 'stories_history' },
  { id: 'ibn_sina', emoji: '🩺', title: 'Ibn Sina - Father of Medicine', image: 'ibn_sina.png', category: 'stories_history' },
  { id: 'al_razi', emoji: '🧪', title: 'Al-Razi - Pioneer of Chemistry', image: 'al_razi.png', category: 'stories_history' },
  { id: 'al_biruni', emoji: '🌍', title: 'Al-Biruni - Master of Sciences', image: 'al_biruni.png', category: 'stories_history' },
  { id: 'al_ghazali', emoji: '💡', title: 'Al-Ghazali - Islamic Philosophy', image: 'al_ghazali.png', category: 'stories_history' },
  { id: 'fatima_al_fihri', emoji: '🎓', title: 'Fatima al-Fihri - First University', image: 'fatima_al_fihri.png', category: 'stories_history' },
  { id: 'ibn_khaldun', emoji: '📜', title: 'Ibn Khaldun - Father of Sociology', image: 'ibn_khaldun.png', category: 'stories_history' },

  { id: 'ramadan', emoji: '🌙', title: 'Ramadan', image: 'ramadan_overview.webp', category: 'special_times' },
  { id: 'eid_al_fitr', emoji: '🎉', title: 'Eid al-Fitr', image: 'eid_fitr.webp', category: 'special_times' },
  { id: 'eid_al_adha', emoji: '🐑', title: 'Eid al-Adha', image: 'eid_adha.webp', category: 'special_times' },
];

export function getTopicsByCategory(categoryId: string): typeof TOPICS {
  return TOPICS.filter(t => t.category === categoryId);
}

export function getTopicById(id: string): typeof TOPICS[number] | undefined {
  return TOPICS.find(t => t.id === id);
}

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find(c => c.id === id);
}
