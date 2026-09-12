import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Trash2, 
  EyeOff, 
  CheckCircle, 
  CornerDownRight, 
  MessageSquare,
  Send
} from 'lucide-react';
import { StarRating } from './StarRating';
import { Review, UserProfile } from '../types';

interface ReviewCardProps {
  review: Review;
  currentUser: UserProfile | null;
  onModerateStatus?: (reviewId: string, newStatus: 'approved' | 'hidden' | 'flagged') => Promise<void>;
  onDeleteReview?: (reviewId: string) => Promise<void>;
  onOwnerReply?: (reviewId: string, replyText: string) => Promise<void>;
  onEditReview?: (review: Review) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  currentUser,
  onModerateStatus,
  onDeleteReview,
  onOwnerReply,
  onEditReview,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState(review.ownerReply?.text || '');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const isAuthor = currentUser?.uid === review.userId;
  const isOwner = currentUser?.isOwner;

  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !onOwnerReply) return;
    try {
      setIsSubmittingReply(true);
      await onOwnerReply(review.id, replyText.trim());
      setIsReplying(false);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        review.status === 'hidden'
          ? 'bg-zinc-100/70 dark:bg-zinc-900/40 border-dashed border-zinc-300 dark:border-zinc-800 opacity-75'
          : review.status === 'flagged'
          ? 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/50'
          : 'bg-white dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800 shadow-sm'
      }`}
      id={`review-card-${review.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-semibold flex items-center justify-center text-sm shadow-sm">
            {review.userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                {review.userName}
              </span>
              {review.userEmail === 'razanajaf38@gmail.com' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <ShieldCheck className="w-3 h-3" /> Owner
                </span>
              )}
              {review.status !== 'approved' && (
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    review.status === 'hidden'
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      : 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {review.status}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
              <span>{review.userEmail}</span>
              <span>•</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarRating rating={review.rating} size="sm" />
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            {review.rating}.0
          </span>
        </div>
      </div>

      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed pl-1">
        {review.comment}
      </p>

      {/* Owner Reply if available */}
      {review.ownerReply && (
        <div className="mt-3.5 p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs">
          <div className="flex items-center justify-between gap-2 mb-1 text-indigo-700 dark:text-indigo-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <CornerDownRight className="w-3.5 h-3.5" />
              {review.ownerReply.author}
            </span>
            <span className="text-[10px] text-indigo-500 dark:text-indigo-400">
              {new Date(review.ownerReply.repliedAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-zinc-700 dark:text-zinc-300 pl-5">
            {review.ownerReply.text}
          </p>
        </div>
      )}

      {/* Moderation & Action Toolbar */}
      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {isAuthor && onEditReview && (
            <button
              onClick={() => onEditReview(review)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              id={`edit-review-btn-${review.id}`}
            >
              Edit Review
            </button>
          )}
          {isAuthor && onDeleteReview && (
            <button
              onClick={() => onDeleteReview(review.id)}
              className="text-zinc-500 hover:text-rose-600 transition font-medium"
              id={`delete-own-review-btn-${review.id}`}
            >
              Delete
            </button>
          )}
        </div>

        {/* Exclusive Owner Moderation Toolbar */}
        {isOwner && (
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/70 px-2.5 py-1.5 rounded-lg border border-zinc-200/80 dark:border-zinc-700/60 ml-auto">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Owner Moderation:
            </span>

            {review.status !== 'approved' && onModerateStatus && (
              <button
                onClick={() => onModerateStatus(review.id, 'approved')}
                className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded font-medium text-[11px] flex items-center gap-1 transition"
                title="Approve and publish"
                id={`approve-review-${review.id}`}
              >
                <CheckCircle className="w-3 h-3" /> Approve
              </button>
            )}

            {review.status !== 'hidden' && onModerateStatus && (
              <button
                onClick={() => onModerateStatus(review.id, 'hidden')}
                className="px-2 py-1 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 rounded font-medium text-[11px] flex items-center gap-1 transition"
                title="Hide from public view"
                id={`hide-review-${review.id}`}
              >
                <EyeOff className="w-3 h-3" /> Hide
              </button>
            )}

            <button
              onClick={() => setIsReplying(!isReplying)}
              className="px-2 py-1 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded font-medium text-[11px] flex items-center gap-1 transition"
              id={`reply-review-btn-${review.id}`}
            >
              <MessageSquare className="w-3 h-3" /> Reply
            </button>

            {onDeleteReview && (
              <button
                onClick={() => onDeleteReview(review.id)}
                className="px-2 py-1 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded font-medium text-[11px] flex items-center gap-1 transition"
                title="Permanently remove review"
                id={`owner-delete-review-${review.id}`}
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Owner Reply Input Form */}
      {isOwner && isReplying && (
        <form onSubmit={handleReplySubmit} className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write official Owner reply as Najaf Raza..."
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            id={`owner-reply-input-${review.id}`}
          />
          <button
            type="submit"
            disabled={isSubmittingReply || !replyText.trim()}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
            id={`submit-owner-reply-${review.id}`}
          >
            <Send className="w-3 h-3" />
            Post
          </button>
          <button
            type="button"
            onClick={() => setIsReplying(false)}
            className="px-2 py-1.5 text-zinc-400 hover:text-zinc-600 text-xs"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};
