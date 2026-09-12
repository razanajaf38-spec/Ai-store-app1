import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Star, 
  ExternalLink, 
  Share2, 
  ShieldCheck, 
  Sparkles, 
  MessageSquarePlus, 
  Layers, 
  Clock, 
  Check, 
  Info
} from 'lucide-react';
import { StarRating } from './StarRating';
import { ReviewCard } from './ReviewCard';
import { AIApp, Review, UserProfile } from '../types';

interface AppDetailsViewProps {
  app: AIApp;
  reviews: Review[];
  currentUser: UserProfile | null;
  onBack: () => void;
  onOpenReviewModal: () => void;
  onModerateStatus: (reviewId: string, newStatus: 'approved' | 'hidden' | 'flagged') => Promise<void>;
  onDeleteReview: (reviewId: string) => Promise<void>;
  onOwnerReply: (reviewId: string, replyText: string) => Promise<void>;
  onEditReview: (review: Review) => void;
}

export const AppDetailsView: React.FC<AppDetailsViewProps> = ({
  app,
  reviews,
  currentUser,
  onBack,
  onOpenReviewModal,
  onModerateStatus,
  onDeleteReview,
  onOwnerReply,
  onEditReview,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter reviews for this specific app
  const appReviews = reviews.filter((r) => r.appId === app.id);
  const visibleReviews = appReviews.filter(
    (r) => r.status === 'approved' || (currentUser && (r.userId === currentUser.uid || currentUser.isOwner))
  );

  const userReview = currentUser ? appReviews.find((r) => r.userId === currentUser.uid) : null;

  // Calculate rating breakdown
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = appReviews.filter((r) => Math.round(r.rating) === star).length;
    const percentage = appReviews.length > 0 ? (count / appReviews.length) * 100 : 0;
    return { star, count, percentage };
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6" id="app-details-view">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
        id="back-to-store-btn"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to AI Store catalog
      </button>

      {/* Main App Hero Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <img
              src={app.iconUrl}
              alt={app.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-800 shadow-md shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                  {app.name}
                </h1>
                {app.featured && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Sparkles className="w-3 h-3" /> Featured AI
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300 mt-1 max-w-xl">
                {app.tagline}
              </p>

              {/* Rating summary */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5">
                  <StarRating rating={app.rating} size="md" />
                  <span className="text-sm font-black text-zinc-900 dark:text-white ml-1">
                    {app.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-zinc-400">
                  Based on {appReviews.length} community reviews
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  {app.category}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {app.pricing}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5 shrink-0 min-w-[200px]">
            {app.playStoreUrl ? (
              <a
                href={app.playStoreUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition"
                id="get-app-playstore-btn"
              >
                <span>Get App on Google Play</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : null}

            {app.websiteUrl ? (
              <a
                href={app.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 font-bold text-xs rounded-xl shadow-sm transition ${
                  app.playStoreUrl
                    ? 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md py-3 text-sm'
                }`}
                id="open-official-website-btn"
              >
                <span>{app.playStoreUrl ? 'Visit Official Website' : 'Open Official Web Tool'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : null}

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl transition"
                id="share-app-btn"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                {copiedLink ? 'Link Copied' : 'Share App'}
              </button>
            </div>

            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center leading-tight mt-1">
              {app.playStoreUrl
                ? 'Opens official Google Play Store page. AI Store does not host or redistribute APK files.'
                : 'Directs to official certified developer website.'}
            </p>
          </div>
        </div>

        {/* Detailed Overview */}
        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/80">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Tool Overview & Features
          </h3>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-3xl">
            {app.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-4">
            {app.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Ratings & Reviews Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              Ratings & User Reviews
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                {visibleReviews.length} Reviews
              </span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Verified community experiences and owner moderated feedback
            </p>
          </div>

          <button
            onClick={onOpenReviewModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs rounded-xl shadow transition"
            id="write-review-btn"
          >
            <MessageSquarePlus className="w-4 h-4" />
            {userReview ? 'Edit Your Review' : 'Write a Review'}
          </button>
        </div>

        {/* Rating Breakdown card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/50">
          <div className="flex flex-col items-center justify-center text-center p-2">
            <span className="text-5xl font-black text-zinc-900 dark:text-white">
              {app.rating.toFixed(1)}
            </span>
            <div className="mt-2">
              <StarRating rating={app.rating} size="md" />
            </div>
            <span className="text-xs text-zinc-400 mt-1 font-medium">
              {appReviews.length} total customer ratings
            </span>
          </div>

          <div className="md:col-span-2 space-y-2">
            {ratingDistribution.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-12 text-zinc-600 dark:text-zinc-400 font-medium flex items-center gap-1">
                  {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-zinc-400">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User's existing review notice */}
        {userReview && (
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <p className="text-xs text-indigo-950 dark:text-indigo-200">
                You reviewed this application with <strong>{userReview.rating} stars</strong>.
              </p>
            </div>
            <button
              onClick={onOpenReviewModal}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Modify Review
            </button>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4 pt-2" id="reviews-list-container">
          {visibleReviews.length === 0 ? (
            <div className="text-center py-10 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                No reviews yet for {app.name}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Be the first to share your experience with other AI Store users!
              </p>
              <button
                onClick={onOpenReviewModal}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
              >
                Rate this App
              </button>
            </div>
          ) : (
            visibleReviews.map((rev) => (
              <ReviewCard
                key={rev.id}
                review={rev}
                currentUser={currentUser}
                onModerateStatus={onModerateStatus}
                onDeleteReview={onDeleteReview}
                onOwnerReply={onOwnerReply}
                onEditReview={onEditReview}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
