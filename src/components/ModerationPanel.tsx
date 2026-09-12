import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Trash2, 
  EyeOff, 
  CheckCircle, 
  Filter, 
  Search,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { ReviewCard } from './ReviewCard';
import { Review, UserProfile } from '../types';

interface ModerationPanelProps {
  reviews: Review[];
  currentUser: UserProfile | null;
  onModerateStatus: (reviewId: string, newStatus: 'approved' | 'hidden' | 'flagged') => Promise<void>;
  onDeleteReview: (reviewId: string) => Promise<void>;
  onOwnerReply: (reviewId: string, replyText: string) => Promise<void>;
}

export const ModerationPanel: React.FC<ModerationPanelProps> = ({
  reviews,
  currentUser,
  onModerateStatus,
  onDeleteReview,
  onOwnerReply,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'hidden' | 'flagged'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!currentUser?.isOwner) {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Owner Access Restricted</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Only the authorized Owner (Najaf Raza - razanajaf38@gmail.com) can access review moderation.
        </p>
      </div>
    );
  }

  const filteredReviews = reviews.filter((rev) => {
    const matchesStatus = filterStatus === 'all' || rev.status === filterStatus;
    const matchesSearch =
      rev.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rev.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = reviews.filter((r) => r.status === 'flagged' || r.status === 'hidden').length;
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;

  return (
    <div className="space-y-6" id="owner-moderation-panel">
      {/* Header bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                Reviews & Ratings Moderation
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  {reviews.length} Total
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Manage customer feedback, reply on behalf of Owner, or hide non-compliant ratings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              {approvedCount} Approved
            </div>
            {pendingCount > 0 && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5" />
                {pendingCount} Hidden/Flagged
              </div>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews by app, reviewer, keyword..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              id="moderation-search-input"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <Filter className="w-3.5 h-3.5 text-zinc-400 ml-1 mr-0.5" />
            {(['all', 'approved', 'hidden', 'flagged'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition capitalize whitespace-nowrap ${
                  filterStatus === status
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
                id={`filter-moderation-${status}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-3" id="moderation-reviews-list">
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <MessageSquare className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              No reviews match the selected filter.
            </p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <ReviewCard
              key={rev.id}
              review={rev}
              currentUser={currentUser}
              onModerateStatus={onModerateStatus}
              onDeleteReview={onDeleteReview}
              onOwnerReply={onOwnerReply}
            />
          ))
        )}
      </div>
    </div>
  );
};
