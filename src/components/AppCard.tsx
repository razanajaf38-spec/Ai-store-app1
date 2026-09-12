import React from 'react';
import { 
  Star, 
  ExternalLink, 
  Sparkles, 
  ChevronRight, 
  ShieldCheck 
} from 'lucide-react';
import { StarRating } from './StarRating';
import { AIApp } from '../types';

interface AppCardProps {
  app: AIApp;
  onClick: () => void;
}

export const AppCard: React.FC<AppCardProps> = ({ app, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group relative bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer flex flex-col justify-between"
      id={`app-card-${app.id}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <img
              src={app.iconUrl}
              alt={app.name}
              className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shadow-sm shrink-0 group-hover:scale-105 transition-transform"
            />
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                {app.name}
              </h3>
              <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium flex-wrap">
                <span>{app.aiSubCategory || app.category}</span>
                <span>•</span>
                <span className="font-semibold text-zinc-600 dark:text-zinc-300">{app.pricing}</span>
                <span>•</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  app.platform === 'web' 
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' 
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {app.platform === 'web' ? 'Web Tool' : 'Play Store'}
                </span>
              </div>
            </div>
          </div>

          {app.featured && (
            <span className="p-1 rounded-lg bg-amber-500/10 text-amber-500" title="Featured AI">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
          {app.tagline}
        </p>
      </div>

      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <StarRating rating={app.rating} size="sm" />
          <span className="text-xs font-bold text-zinc-900 dark:text-white">
            {app.rating.toFixed(1)}
          </span>
          <span className="text-[11px] text-zinc-400">
            ({app.ratingCount})
          </span>
        </div>

        <span className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
          Details
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
