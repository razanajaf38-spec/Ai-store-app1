import React, { useState } from 'react';
import { Star, Send, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { StarRating } from './StarRating';
import { Review, UserProfile } from '../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appId: string;
  appName: string;
  currentUser: UserProfile | null;
  existingReview?: Review | null;
  onSubmitReview: (rating: number, comment: string) => Promise<void>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  appName,
  currentUser,
  existingReview,
  onSubmitReview,
}) => {
  const [rating, setRating] = useState<number>(existingReview?.rating || 5);
  const [comment, setComment] = useState<string>(existingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('You must be signed in to submit a review.');
      return;
    }
    if (rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }
    if (comment.trim().length < 10) {
      setError('Please write at least 10 characters detailing your experience.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmitReview(rating, comment.trim());
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to submit review. Please try again.';
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      id="review-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-7 relative overflow-hidden"
        id="review-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          aria-label="Close review dialog"
          id="close-review-modal-btn"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <Star className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              {existingReview ? 'Update Your Review' : `Rate & Review`}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              {appName}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Your review has been successfully published to Firestore!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5" id="review-submission-form">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Overall Rating
            </label>
            <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700/50">
              <StarRating
                rating={rating}
                size="lg"
                interactive={true}
                onRatingChange={(r) => setRating(r)}
              />
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-2">
                {rating === 5 && 'Outstanding (5.0)'}
                {rating === 4 && 'Very Good (4.0)'}
                {rating === 3 && 'Average (3.0)'}
                {rating === 2 && 'Needs Improvement (2.0)'}
                {rating === 1 && 'Poor (1.0)'}
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="review-comment-textarea"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2"
            >
              Your Written Review
            </label>
            <textarea
              id="review-comment-textarea"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What do you think of this AI tool? Share its capabilities, performance, speed, or accuracy..."
              className="w-full px-4 py-3 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/70 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            <div className="flex justify-between items-center mt-1.5 text-xs text-zinc-400">
              <span>Minimum 10 characters</span>
              <span>{comment.length}/1000</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
              id="cancel-review-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || success}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md hover:shadow transition"
              id="submit-review-btn"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Publishing...' : existingReview ? 'Save Update' : 'Post Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
