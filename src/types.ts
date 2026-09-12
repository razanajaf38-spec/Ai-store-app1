export interface AIApp {
  id: string;
  name: string;
  category: AppCategory;
  aiSubCategory?: AISubCategory;
  tagline: string;
  description: string;
  developer: string;
  platform?: 'android' | 'web'; // 'android' has Play Store, 'web' has official site (defaults to 'android')
  playStoreUrl?: string;
  websiteUrl?: string;
  iconUrl: string;
  featured: boolean;
  pricing: 'Free' | 'Freemium' | 'Paid' | 'Free Trial';
  tags: string[];
  rating: number; // Average rating (1-5)
  ratingCount: number; // Total number of reviews
  popularityScore: number;
  dateAdded: string;
}

export type AppCategory =
  | 'AI Apps'
  | 'Social Media'
  | 'Messaging & Communication'
  | 'Video & Streaming'
  | 'Music & Audio'
  | 'Education & Learning'
  | 'Productivity & Work'
  | 'Shopping & Food'
  | 'Finance & Payments'
  | 'Games'
  | 'Utilities & Other';

export type AISubCategory =
  | 'AI Chatbots'
  | 'AI Writing'
  | 'AI Image Generation'
  | 'AI Photo Editing'
  | 'AI Video'
  | 'AI Audio & Music'
  | 'AI Coding'
  | 'AI Education'
  | 'AI Productivity'
  | 'AI Design'
  | 'AI Business'
  | 'AI Translation'
  | 'AI Search'
  | 'AI Assistant'
  | 'Other AI Tools';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recommendedAppIds?: string[];
}

export interface Review {
  id: string;
  appId: string;
  appName: string;
  userId: string;
  userEmail: string;
  userName: string;
  rating: number; // 1 - 5
  comment: string;
  createdAt: string; // ISO string
  updatedAt?: string;
  status: 'approved' | 'hidden' | 'flagged';
  ownerReply?: {
    text: string;
    repliedAt: string;
    author: string;
  };
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  isOwner: boolean;
  emailVerified: boolean;
  twoFactorEnabled?: boolean;
  createdAt: string;
}

export interface SecurityLogEvent {
  id: string;
  timestamp: string;
  eventType: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | '2FA_VERIFIED' | 'REVIEW_SUBMITTED' | 'REVIEW_MODERATED' | 'APP_ADDED' | 'APP_EDITED' | 'APP_DELETED';
  userEmail: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}
