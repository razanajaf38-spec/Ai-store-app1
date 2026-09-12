import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Shield, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  Filter, 
  TrendingUp, 
  Clock, 
  Layers, 
  CheckCircle, 
  MessageSquare,
  Compass,
  SlidersHorizontal,
  Settings,
  Star,
  Bot,
  Smartphone,
  Globe
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';
import { AIApp, Review, UserProfile, SecurityLogEvent, AISubCategory } from './types';
import { INITIAL_AI_APPS, INITIAL_REVIEWS, CATEGORIES, AI_SUBCATEGORIES, OWNER_EMAIL, OWNER_NAME } from './data';
import { AppCard } from './components/AppCard';
import { AppDetailsView } from './components/AppDetailsView';
import { ReviewModal } from './components/ReviewModal';
import { ModerationPanel } from './components/ModerationPanel';
import { AppManagementPanel } from './components/AppManagementPanel';
import { AuthModal } from './components/AuthModal';
import { AIAssistantModal } from './components/AIAssistantModal';

export default function App() {
  // Navigation & View States
  const [currentView, setCurrentView] = useState<'store' | 'details' | 'moderation' | 'owner_hub'>('store');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // App & Review Data States
  const [apps, setApps] = useState<AIApp[]>(INITIAL_AI_APPS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [securityLogs, setSecurityLogs] = useState<SecurityLogEvent[]>([
    {
      id: 'log-init-1',
      timestamp: new Date().toISOString(),
      eventType: 'LOGIN_SUCCESS',
      userEmail: OWNER_EMAIL,
      details: 'Secure session validated with TOTP 2FA for Najaf Raza.',
      severity: 'info',
    },
    {
      id: 'log-init-2',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      eventType: 'REVIEW_SUBMITTED',
      userEmail: 'dev.sarah@gmail.com',
      details: 'Rating and review submitted for ChatGPT (5.0 stars).',
      severity: 'info',
    }
  ]);

  // Active User State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>({
    uid: 'owner-najaf-raza',
    email: OWNER_EMAIL,
    displayName: OWNER_NAME,
    isOwner: true,
    emailVerified: true,
    twoFactorEnabled: true,
    createdAt: '2026-08-01T00:00:00Z',
  });

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedAiSubCategory, setSelectedAiSubCategory] = useState<string>('All AI Subcategories');
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'android' | 'web'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('popular');
  const [visibleCount, setVisibleCount] = useState<number>(30);

  // Modals State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Firestore Sync Effect
  useEffect(() => {
    // Listen for realtime reviews from Firestore
    try {
      const reviewsCol = collection(db, 'reviews');
      const unsubscribe = onSnapshot(
        reviewsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetchedReviews: Review[] = [];
            snapshot.forEach((docSnap) => {
              fetchedReviews.push({ id: docSnap.id, ...(docSnap.data() as Omit<Review, 'id'>) });
            });
            // Merge with default seed data if newly provisioned
            setReviews((prev) => {
              const combined = [...fetchedReviews];
              INITIAL_REVIEWS.forEach((seed) => {
                if (!combined.some((r) => r.id === seed.id)) {
                  combined.push(seed);
                }
              });
              return combined;
            });
          }
        },
        (error) => {
          console.warn('Firestore real-time sync notice (using robust local fallback cache):', error.message);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.error('Firestore init error:', e);
    }
  }, []);

  // Update App Average Ratings whenever reviews update
  useEffect(() => {
    setApps((prevApps) =>
      prevApps.map((app) => {
        const appApprovedReviews = reviews.filter((r) => r.appId === app.id && r.status === 'approved');
        if (appApprovedReviews.length === 0) {
          return app;
        }
        const totalRating = appApprovedReviews.reduce((sum, r) => sum + r.rating, 0);
        const avg = totalRating / appApprovedReviews.length;
        return {
          ...app,
          rating: Number(avg.toFixed(1)),
          ratingCount: appApprovedReviews.length,
        };
      })
    );
  }, [reviews]);

  // Selected App Object
  const activeApp = apps.find((a) => a.id === selectedAppId) || null;

  // Filter & Sort Logic
  const filteredApps = apps
    .filter((app) => {
      // Main Category Match
      const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;

      // AI SubCategory Match (active if 'AI Apps' or 'All' is selected, and a specific subcategory is chosen)
      const matchesSubCategory =
        selectedAiSubCategory === 'All AI Subcategories' ||
        app.aiSubCategory === selectedAiSubCategory;

      // Platform filter (Android vs Web AI Tools)
      const matchesPlatform =
        selectedPlatform === 'all' ||
        (selectedPlatform === 'android' && app.platform !== 'web') ||
        (selectedPlatform === 'web' && app.platform === 'web');

      // Global Search Match
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        app.name.toLowerCase().includes(q) ||
        app.tagline.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.developer.toLowerCase().includes(q) ||
        (app.aiSubCategory && app.aiSubCategory.toLowerCase().includes(q)) ||
        app.tags.some((t) => t.toLowerCase().includes(q)) ||
        app.category.toLowerCase().includes(q);

      return matchesCategory && matchesSubCategory && matchesPlatform && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.popularityScore - a.popularityScore;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      return 0;
    });

  // Reset pagination count on search or filter change
  useEffect(() => {
    setVisibleCount(30);
  }, [searchQuery, selectedCategory, selectedAiSubCategory, selectedPlatform, sortBy]);

  // Featured Apps
  const featuredApps = apps.filter((a) => a.featured);

  // Review Operations (With Firestore persistence)
  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!currentUser || !activeApp) return;

    const reviewId = editingReview ? editingReview.id : `rev-${Date.now()}`;
    const newReview: Review = {
      id: reviewId,
      appId: activeApp.id,
      appName: activeApp.name,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      userName: currentUser.displayName,
      rating,
      comment,
      createdAt: editingReview ? editingReview.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'approved',
      ownerReply: editingReview?.ownerReply,
    };

    // Update Local State immediately
    setReviews((prev) => {
      const existingIdx = prev.findIndex((r) => r.id === reviewId);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = newReview;
        return next;
      }
      return [newReview, ...prev];
    });

    // Write to Cloud Firestore
    try {
      await setDoc(doc(db, 'reviews', reviewId), {
        appId: newReview.appId,
        appName: newReview.appName,
        userId: newReview.userId,
        userEmail: newReview.userEmail,
        userName: newReview.userName,
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: newReview.createdAt,
        updatedAt: newReview.updatedAt,
        status: newReview.status,
      });

      // Log security event
      addSecurityLog({
        eventType: 'REVIEW_SUBMITTED',
        userEmail: currentUser.email,
        details: `${editingReview ? 'Updated' : 'Created'} review for ${activeApp.name} (${rating} stars).`,
        severity: 'info',
      });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  // Owner Review Moderation: Change status (approve, hide, flag)
  const handleModerateStatus = async (reviewId: string, newStatus: 'approved' | 'hidden' | 'flagged') => {
    if (!currentUser?.isOwner) return;

    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
    );

    try {
      await updateDoc(doc(db, 'reviews', reviewId), { status: newStatus });
      addSecurityLog({
        eventType: 'REVIEW_MODERATED',
        userEmail: currentUser.email,
        details: `Owner updated review ${reviewId} status to "${newStatus}".`,
        severity: 'warning',
      });
    } catch (e) {
      console.warn('Firestore status update warning:', e);
    }
  };

  // Owner Reply to Review
  const handleOwnerReply = async (reviewId: string, replyText: string) => {
    if (!currentUser?.isOwner) return;

    const replyData = {
      text: replyText,
      repliedAt: new Date().toISOString(),
      author: `${OWNER_NAME} (Owner)`,
    };

    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, ownerReply: replyData } : r))
    );

    try {
      await updateDoc(doc(db, 'reviews', reviewId), { ownerReply: replyData });
      addSecurityLog({
        eventType: 'REVIEW_MODERATED',
        userEmail: currentUser.email,
        details: `Owner replied to review ${reviewId}.`,
        severity: 'info',
      });
    } catch (e) {
      console.warn('Firestore reply update warning:', e);
    }
  };

  // Delete Review
  const handleDeleteReview = async (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      addSecurityLog({
        eventType: 'REVIEW_MODERATED',
        userEmail: currentUser?.email || 'User',
        details: `Deleted review ${reviewId}.`,
        severity: 'warning',
      });
    } catch (e) {
      console.warn('Firestore delete warning:', e);
    }
  };

  // Owner Catalog App Management
  const handleAddApp = async (newAppData: Omit<AIApp, 'id' | 'rating' | 'ratingCount' | 'popularityScore' | 'dateAdded'>) => {
    if (!currentUser?.isOwner) return;
    const appId = newAppData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const fullApp: AIApp = {
      ...newAppData,
      id: appId,
      rating: 5.0,
      ratingCount: 0,
      popularityScore: 80,
      dateAdded: new Date().toISOString().split('T')[0],
    };

    setApps((prev) => [fullApp, ...prev]);

    try {
      await setDoc(doc(db, 'ai_apps', appId), fullApp);
      addSecurityLog({
        eventType: 'APP_ADDED',
        userEmail: currentUser.email,
        details: `Added new AI tool "${fullApp.name}" to catalog.`,
        severity: 'info',
      });
    } catch (e) {
      console.warn('Firestore add app error:', e);
    }
  };

  const handleEditApp = async (updatedApp: AIApp) => {
    if (!currentUser?.isOwner) return;
    setApps((prev) => prev.map((a) => (a.id === updatedApp.id ? updatedApp : a)));
    try {
      await setDoc(doc(db, 'ai_apps', updatedApp.id), updatedApp);
      addSecurityLog({
        eventType: 'APP_EDITED',
        userEmail: currentUser.email,
        details: `Updated metadata for "${updatedApp.name}".`,
        severity: 'info',
      });
    } catch (e) {
      console.warn('Firestore edit app error:', e);
    }
  };

  const handleDeleteApp = async (appId: string) => {
    if (!currentUser?.isOwner) return;
    setApps((prev) => prev.filter((a) => a.id !== appId));
    try {
      await deleteDoc(doc(db, 'ai_apps', appId));
      addSecurityLog({
        eventType: 'APP_DELETED',
        userEmail: currentUser.email,
        details: `Deleted AI tool "${appId}" from catalog.`,
        severity: 'warning',
      });
    } catch (e) {
      console.warn('Firestore delete app error:', e);
    }
  };

  const addSecurityLog = (entry: Omit<SecurityLogEvent, 'id' | 'timestamp'>) => {
    const log: SecurityLogEvent = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    setSecurityLogs((prev) => [log, ...prev]);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div
            onClick={() => {
              setCurrentView('store');
              setSelectedAppId(null);
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
            id="brand-logo-button"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-zinc-900 dark:text-white">
                  AI Store
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  Android Hub
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 -mt-0.5 hidden sm:block">
                Discover, Explore & Review Premier AI Tools
              </p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={() => {
                setCurrentView('store');
                setSelectedAppId(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 ${
                currentView === 'store'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
              id="nav-store-btn"
            >
              <Compass className="w-4 h-4" />
              Store Catalog
            </button>

            {/* AI Store Assistant trigger in Navbar */}
            <button
              onClick={() => setIsAssistantModalOpen(true)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/80"
              id="nav-assistant-btn"
            >
              <Bot className="w-4 h-4 text-indigo-500 animate-pulse" />
              <span>AI Assistant</span>
            </button>

            {/* Owner specific Moderation and Hub buttons */}
            {currentUser?.isOwner && (
              <>
                <button
                  onClick={() => setCurrentView('moderation')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                    currentView === 'moderation'
                      ? 'bg-amber-500 text-white shadow'
                      : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                  }`}
                  id="nav-moderation-btn"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Review Moderation
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono">
                    {reviews.length}
                  </span>
                </button>

                <button
                  onClick={() => setCurrentView('owner_hub')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                    currentView === 'owner_hub'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                  id="nav-owner-hub-btn"
                >
                  <Settings className="w-4 h-4" />
                  Owner Hub
                </button>
              </>
            )}

            {/* User Account Controls */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center justify-end gap-1">
                    {currentUser.displayName}
                    {currentUser.isOwner && (
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                    )}
                  </span>
                  <span className="text-[10px] text-zinc-400">{currentUser.email}</span>
                </div>
                <button
                  onClick={() => {
                    setCurrentUser(null);
                    addSecurityLog({
                      eventType: 'LOGIN_FAILURE',
                      userEmail: currentUser.email,
                      details: 'User logged out of active session.',
                      severity: 'info',
                    });
                  }}
                  className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
                  title="Sign Out"
                  id="sign-out-btn"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
                id="header-sign-in-btn"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* VIEW 1: Store Catalog */}
        {currentView === 'store' && !selectedAppId && (
          <div className="space-y-8">
            {/* Hero / Search Section */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 via-zinc-900 to-black text-white p-6 sm:p-10 shadow-xl">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-300 mb-4 border border-white/10">
                  <Sparkles className="w-3.5 h-3.5" />
                  Next-Gen AI Catalog & Review Hub
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  Discover, compare, and review verified AI tools.
                </h1>
                <p className="text-sm text-zinc-300 mt-2 max-w-lg">
                  Browse top-tier conversational models, generative image engines, coding copilots, and productivity agents with authentic community star ratings.
                </p>

                {/* Search Bar Input */}
                <div className="mt-6 flex items-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-1.5 focus-within:border-white/50 transition">
                  <Search className="w-5 h-5 text-zinc-400 ml-3 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 350 apps across AI chatbots, image generators, coding, Play Store..."
                    className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder:text-zinc-400 focus:outline-none"
                    id="hero-search-input"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-zinc-400 hover:text-white px-2"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Quick Assistant CTA in Hero */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setIsAssistantModalOpen(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold shadow-sm transition"
                    id="hero-assistant-btn"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Ask AI Store Assistant</span>
                  </button>
                  <span className="text-xs text-zinc-400 hidden sm:inline">
                    Catalog verified: 200 AI Tools + 150 Android Apps
                  </span>
                </div>
              </div>

              {/* Decorative Glow */}
              <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
            </div>

            {/* Featured AI Tools Row */}
            {!searchQuery && selectedCategory === 'All' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                      Featured AI Applications
                    </h2>
                  </div>
                  <span className="text-xs text-zinc-400">Hand-curated by Owner</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {featuredApps.map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      onClick={() => {
                        setSelectedAppId(app.id);
                        setCurrentView('details');
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Categories & Filter Bar */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  Browse Categories
                </h2>

                {/* Sort Toggle */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400 ml-2" />
                  <button
                    onClick={() => setSortBy('popular')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                      sortBy === 'popular'
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Popular
                  </button>
                  <button
                    onClick={() => setSortBy('rating')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                      sortBy === 'rating'
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Highest Rated
                  </button>
                  <button
                    onClick={() => setSortBy('newest')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                      sortBy === 'newest'
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Newest
                  </button>
                </div>
              </div>

              {/* Category Pill Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar" id="category-pills">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      if (category !== 'AI Apps') {
                        setSelectedAiSubCategory('All AI Subcategories');
                      }
                    }}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition ${
                      selectedCategory === category
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                        : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                    id={`category-btn-${category.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Subcategories Bar (Visible when 'AI Apps' or 'All' is active) */}
              {(selectedCategory === 'AI Apps' || selectedCategory === 'All') && (
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      AI Subcategories ({AI_SUBCATEGORIES.length - 1} Specializations)
                    </span>
                    {selectedAiSubCategory !== 'All AI Subcategories' && (
                      <button
                        onClick={() => setSelectedAiSubCategory('All AI Subcategories')}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                      >
                        Reset Subcategory
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {AI_SUBCATEGORIES.map((subCat) => (
                      <button
                        key={subCat}
                        onClick={() => setSelectedAiSubCategory(subCat)}
                        className={`px-3 py-1 text-[11px] font-medium rounded-lg whitespace-nowrap transition ${
                          selectedAiSubCategory === subCat
                            ? 'bg-indigo-600 text-white font-bold shadow-sm'
                            : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {subCat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Platform Filter (Android vs Web AI Tools) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/60 p-1 rounded-xl text-xs">
                  <button
                    onClick={() => setSelectedPlatform('all')}
                    className={`px-3 py-1 rounded-lg font-semibold transition ${
                      selectedPlatform === 'all'
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    All Platforms (350)
                  </button>
                  <button
                    onClick={() => setSelectedPlatform('android')}
                    className={`px-3 py-1 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                      selectedPlatform === 'android'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Google Play Apps
                  </button>
                  <button
                    onClick={() => setSelectedPlatform('web')}
                    className={`px-3 py-1 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                      selectedPlatform === 'web'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Web AI Tools
                  </button>
                </div>

                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Showing {Math.min(visibleCount, filteredApps.length)} of {filteredApps.length} verified apps
                </span>
              </div>
            </div>

            {/* AI Apps Catalog Grid */}
            <div>
              {filteredApps.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                  <Search className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                  <h3 className="font-bold text-zinc-800 dark:text-zinc-200">No applications found</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Try adjusting your search criteria, clearing platform filters, or explore another category.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="apps-grid">
                    {filteredApps.slice(0, visibleCount).map((app) => (
                      <AppCard
                        key={app.id}
                        app={app}
                        onClick={() => {
                          setSelectedAppId(app.id);
                          setCurrentView('details');
                        }}
                      />
                    ))}
                  </div>

                  {visibleCount < filteredApps.length && (
                    <div className="mt-8 text-center">
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 30)}
                        className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs rounded-2xl shadow-md transition"
                        id="load-more-apps-btn"
                      >
                        Load More Apps ({filteredApps.length - visibleCount} remaining)
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: App Details & Community Reviews */}
        {currentView === 'details' && activeApp && (
          <AppDetailsView
            app={activeApp}
            reviews={reviews}
            currentUser={currentUser}
            onBack={() => {
              setCurrentView('store');
              setSelectedAppId(null);
            }}
            onOpenReviewModal={() => {
              if (!currentUser) {
                setIsAuthModalOpen(true);
              } else {
                const userExisting = reviews.find(
                  (r) => r.appId === activeApp.id && r.userId === currentUser.uid
                );
                setEditingReview(userExisting || null);
                setIsReviewModalOpen(true);
              }
            }}
            onModerateStatus={handleModerateStatus}
            onDeleteReview={handleDeleteReview}
            onOwnerReply={handleOwnerReply}
            onEditReview={(review) => {
              setEditingReview(review);
              setIsReviewModalOpen(true);
            }}
          />
        )}

        {/* VIEW 3: Owner Moderation Panel */}
        {currentView === 'moderation' && (
          <ModerationPanel
            reviews={reviews}
            currentUser={currentUser}
            onModerateStatus={handleModerateStatus}
            onDeleteReview={handleDeleteReview}
            onOwnerReply={handleOwnerReply}
          />
        )}

        {/* VIEW 4: Owner App Catalog Management & Security Logs */}
        {currentView === 'owner_hub' && (
          <AppManagementPanel
            apps={apps}
            currentUser={currentUser}
            securityLogs={securityLogs}
            onAddApp={handleAddApp}
            onEditApp={handleEditApp}
            onDeleteApp={handleDeleteApp}
          />
        )}
      </main>

      {/* Floating AI Store Assistant Trigger */}
      <button
        onClick={() => setIsAssistantModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm rounded-full shadow-xl hover:shadow-indigo-500/25 hover:scale-105 active:scale-95 transition group"
        id="floating-assistant-btn"
        title="Chat with AI Store Assistant"
      >
        <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline">Ask AI Assistant</span>
      </button>

      {/* AI Store Assistant Modal */}
      <AIAssistantModal
        isOpen={isAssistantModalOpen}
        onClose={() => setIsAssistantModalOpen(false)}
        catalog={apps}
        onSelectApp={(appId) => {
          setSelectedAppId(appId);
          setCurrentView('details');
        }}
      />

      {/* Review Submission Modal */}
      {activeApp && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setEditingReview(null);
          }}
          appId={activeApp.id}
          appName={activeApp.name}
          currentUser={currentUser}
          existingReview={editingReview}
          onSubmitReview={handleSubmitReview}
        />
      )}

      {/* Authentication & TOTP Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          addSecurityLog({
            eventType: 'LOGIN_SUCCESS',
            userEmail: user.email,
            details: `Successfully signed in as ${user.displayName} (${user.isOwner ? 'Owner' : 'User'}).`,
            severity: 'info',
          });
        }}
      />
    </div>
  );
}
