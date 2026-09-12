import { AIApp, Review, AppCategory, AISubCategory } from './types';
import { ALL_350_APPS, STANDARD_150_APPS, AI_200_APPS } from './data/allApps';

export const OWNER_EMAIL = 'razanajaf38@gmail.com';
export const OWNER_NAME = 'Najaf Raza';

export const MAIN_CATEGORIES: (AppCategory | 'All')[] = [
  'All',
  'AI Apps',
  'Social Media',
  'Messaging & Communication',
  'Video & Streaming',
  'Music & Audio',
  'Education & Learning',
  'Productivity & Work',
  'Shopping & Food',
  'Finance & Payments',
  'Games',
  'Utilities & Other',
];

export const AI_SUBCATEGORIES: (AISubCategory | 'All AI Subcategories')[] = [
  'All AI Subcategories',
  'AI Chatbots',
  'AI Writing',
  'AI Image Generation',
  'AI Photo Editing',
  'AI Video',
  'AI Audio & Music',
  'AI Coding',
  'AI Education',
  'AI Productivity',
  'AI Design',
  'AI Business',
  'AI Translation',
  'AI Search',
  'AI Assistant',
  'Other AI Tools',
];

export const CATEGORIES = MAIN_CATEGORIES;

export const INITIAL_AI_APPS: AIApp[] = ALL_350_APPS;

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    appId: 'ai-chatgpt',
    appName: 'ChatGPT',
    userId: 'usr-demo-1',
    userEmail: 'dev.sarah@gmail.com',
    userName: 'Sarah Jenkins',
    rating: 5,
    comment: 'The reasoning upgrade has cut down my debugging time tremendously. Multimodal document analysis is extraordinarily accurate.',
    createdAt: '2026-09-08T14:32:00Z',
    status: 'approved',
    ownerReply: {
      text: 'Thank you Sarah! We are committed to curating the best reasoning tools here in AI Store.',
      repliedAt: '2026-09-09T09:15:00Z',
      author: 'Najaf Raza (Owner)'
    }
  },
  {
    id: 'rev-2',
    appId: 'ai-gemini',
    appName: 'Google Gemini',
    userId: 'usr-demo-2',
    userEmail: 'alex.code@proton.me',
    userName: 'Alex Rivera',
    rating: 5,
    comment: 'Real-time 2M token context window and seamless Google Workspace integration makes this our go-to assistant.',
    createdAt: '2026-09-10T11:20:00Z',
    status: 'approved',
  },
  {
    id: 'rev-3',
    appId: 'ai-claude',
    appName: 'Claude by Anthropic',
    userId: 'usr-demo-3',
    userEmail: 'dr.marcus@mit.edu',
    userName: 'Dr. Marcus Vance',
    rating: 5,
    comment: 'Flawless output for complex algorithmic proofs and nuanced technical writing. By far the cleanest architectural assistant available.',
    createdAt: '2026-09-11T16:45:00Z',
    status: 'approved',
  },
  {
    id: 'rev-4',
    appId: 'ai-midjourney',
    appName: 'Midjourney v7',
    userId: 'usr-demo-4',
    userEmail: 'elena.art@designstudio.io',
    userName: 'Elena Rostova',
    rating: 5,
    comment: 'Texture fidelity and ambient rim-lighting handling is unmatched. Web editor workflow is far superior to old Discord bot prompting.',
    createdAt: '2026-09-09T18:10:00Z',
    status: 'approved',
  },
  {
    id: 'rev-5',
    appId: 'ai-runway-gen3',
    appName: 'Runway Gen-3 Alpha',
    userId: 'usr-demo-5',
    userEmail: 'tariq.visuals@media.tv',
    userName: 'Tariq Al-Mansoor',
    rating: 4,
    comment: 'Camera controls and cinematic depth are high grade. Motion brush controls are revolutionary for video editors.',
    createdAt: '2026-09-11T08:00:00Z',
    status: 'approved',
  }
];
