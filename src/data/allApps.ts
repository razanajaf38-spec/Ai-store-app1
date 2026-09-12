import { AIApp } from '../types';

import { SOCIAL_MEDIA_APPS } from './socialApps';
import { MESSAGING_APPS } from './messagingApps';
import { VIDEO_STREAMING_APPS } from './videoApps';
import { MUSIC_AUDIO_APPS } from './musicApps';
import { EDUCATION_APPS } from './educationApps';
import { PRODUCTIVITY_APPS } from './productivityApps';
import { SHOPPING_FOOD_APPS } from './shoppingApps';
import { FINANCE_APPS } from './financeApps';
import { GAMES_APPS } from './gamesApps';
import { UTILITIES_APPS } from './utilitiesApps';

import { AI_CHATBOT_AND_WRITING_APPS } from './aiChatAndWritingApps';
import { AI_MEDIA_APPS } from './aiMediaApps';
import { AI_CODING_AND_PRODUCTIVITY_APPS } from './aiCodingAndProductivityApps';
import { AI_EDUCATION_BUSINESS_SEARCH_APPS } from './aiEducationBusinessSearchApps';
import { AI_ADDITIONAL_APPS } from './aiAdditionalApps';
import { AI_EXPANDED_APPS } from './aiExpandedApps';
import { AI_CURATED_FINAL_APPS } from './aiCuratedFinalApps';

// Standard 150 Popular Android Apps (10 categories x 15 apps)
export const STANDARD_150_APPS: AIApp[] = [
  ...SOCIAL_MEDIA_APPS,
  ...MESSAGING_APPS,
  ...VIDEO_STREAMING_APPS,
  ...MUSIC_AUDIO_APPS,
  ...EDUCATION_APPS,
  ...PRODUCTIVITY_APPS,
  ...SHOPPING_FOOD_APPS,
  ...FINANCE_APPS,
  ...GAMES_APPS,
  ...UTILITIES_APPS,
];

// Raw combined AI apps
const ALL_AI_APPS_RAW: AIApp[] = [
  ...AI_CHATBOT_AND_WRITING_APPS,
  ...AI_MEDIA_APPS,
  ...AI_CODING_AND_PRODUCTIVITY_APPS,
  ...AI_EDUCATION_BUSINESS_SEARCH_APPS,
  ...AI_ADDITIONAL_APPS,
  ...AI_EXPANDED_APPS,
  ...AI_CURATED_FINAL_APPS,
];

// Deduplicate AI apps strictly by ID to guarantee uniqueness
function deduplicateApps(apps: AIApp[]): AIApp[] {
  const seen = new Set<string>();
  const unique: AIApp[] = [];
  for (const app of apps) {
    if (!seen.has(app.id)) {
      seen.add(app.id);
      unique.push(app);
    }
  }
  return unique;
}

const UNIQUE_AI_APPS = deduplicateApps(ALL_AI_APPS_RAW);

// Ensure EXACTLY 200 AI apps
export const AI_200_APPS: AIApp[] = UNIQUE_AI_APPS.slice(0, 200);

// Exactly 350 Total Apps (150 standard Android + 200 AI Apps)
export const ALL_350_APPS: AIApp[] = [
  ...STANDARD_150_APPS,
  ...AI_200_APPS,
];
