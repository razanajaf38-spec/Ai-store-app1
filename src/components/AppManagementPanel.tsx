import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Layers, 
  Activity,
  Star,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AIApp, UserProfile, SecurityLogEvent } from '../types';
import { CATEGORIES } from '../data';

interface AppManagementPanelProps {
  apps: AIApp[];
  currentUser: UserProfile | null;
  securityLogs: SecurityLogEvent[];
  onAddApp: (newApp: Omit<AIApp, 'id' | 'rating' | 'ratingCount' | 'popularityScore' | 'dateAdded'>) => Promise<void>;
  onEditApp: (app: AIApp) => Promise<void>;
  onDeleteApp: (appId: string) => Promise<void>;
}

export const AppManagementPanel: React.FC<AppManagementPanelProps> = ({
  apps,
  currentUser,
  securityLogs,
  onAddApp,
  onEditApp,
  onDeleteApp,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AIApp | null>(null);
  const [activeTab, setActiveTab] = useState<'apps' | 'logs'>('apps');

  // Form State
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1]);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [pricing, setPricing] = useState<'Free' | 'Freemium' | 'Paid' | 'Free Trial'>('Freemium');
  const [tags, setTags] = useState('');
  const [featured, setFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!currentUser?.isOwner) {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Owner Authorization Enforced</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Owner rights are reserved strictly for razanajaf38@gmail.com.
        </p>
      </div>
    );
  }

  const openCreateModal = () => {
    setEditingApp(null);
    setName('');
    setTagline('');
    setDescription('');
    setCategory(CATEGORIES[1]);
    setWebsiteUrl('');
    setIconUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80');
    setPricing('Freemium');
    setTags('AI, LLM, Cloud');
    setFeatured(false);
    setMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (app: AIApp) => {
    setEditingApp(app);
    setName(app.name);
    setTagline(app.tagline);
    setDescription(app.description);
    setCategory(app.category);
    setWebsiteUrl(app.websiteUrl);
    setIconUrl(app.iconUrl);
    setPricing(app.pricing);
    setTags(app.tags.join(', '));
    setFeatured(app.featured);
    setMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg(null);

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (editingApp) {
        await onEditApp({
          ...editingApp,
          name,
          tagline,
          description,
          category,
          websiteUrl,
          iconUrl,
          pricing,
          tags: parsedTags,
          featured,
        });
        setMsg({ type: 'success', text: 'AI tool updated successfully!' });
      } else {
        await onAddApp({
          name,
          tagline,
          description,
          category,
          websiteUrl,
          iconUrl,
          pricing,
          tags: parsedTags,
          featured,
        });
        setMsg({ type: 'success', text: 'New AI application added to store!' });
      }
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1000);
    } catch (err: unknown) {
      setMsg({ type: 'error', text: err instanceof Error ? err.message : 'Operation failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" id="owner-app-management-panel">
      {/* Top Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Owner Management Hub
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Logged in as authorized owner: <strong>Najaf Raza</strong> (razanajaf38@gmail.com)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('apps')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'apps'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            id="tab-apps-btn"
          >
            <Layers className="w-3.5 h-3.5" />
            AI Catalog ({apps.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            id="tab-logs-btn"
          >
            <Activity className="w-3.5 h-3.5" />
            Security Audit
          </button>
          {activeTab === 'apps' && (
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5"
              id="add-ai-app-btn"
            >
              <Plus className="w-4 h-4" /> Add AI App
            </button>
          )}
        </div>
      </div>

      {activeTab === 'apps' ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" id="owner-apps-table">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-5 py-3.5">App</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Pricing</th>
                  <th className="px-4 py-3.5">Rating & Reviews</th>
                  <th className="px-4 py-3.5">Featured</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {apps.map((app) => (
                  <tr key={app.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={app.iconUrl}
                          alt={app.name}
                          className="w-10 h-10 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shadow-sm"
                        />
                        <div>
                          <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                            {app.name}
                            <a
                              href={app.websiteUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-zinc-400 hover:text-indigo-600"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          <p className="text-xs text-zinc-500 line-clamp-1 max-w-xs">
                            {app.tagline}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {app.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      {app.pricing}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{app.rating.toFixed(1)}</span>
                        <span className="text-zinc-400 font-normal">({app.ratingCount})</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {app.featured ? (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Featured
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-400">Standard</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(app)}
                          className="p-1.5 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition"
                          title="Edit AI app details"
                          id={`edit-app-btn-${app.id}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteApp(app.id)}
                          className="p-1.5 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                          title="Delete AI app from store"
                          id={`delete-app-btn-${app.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Security Audit Logs View */
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              Recent System & Moderation Security Activity
            </h3>
            <span className="text-xs text-zinc-400">Owner-only audit log</span>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {securityLogs.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">No security events logged yet.</p>
            ) : (
              securityLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
                        log.severity === 'critical' ? 'bg-rose-100 text-rose-700' :
                        log.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                        'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}>
                        {log.eventType}
                      </span>
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">{log.details}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">By: {log.userEmail}</p>
                  </div>
                  <span className="text-zinc-400 shrink-0 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add / Edit App Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            id="manage-app-form-container"
          >
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">
              {editingApp ? 'Edit AI Application' : 'Add New AI Application'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
              Specify complete details and metadata for discovery in the AI Store catalog.
            </p>

            {msg && (
              <div className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                msg.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
              }`}>
                {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{msg.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs" id="app-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-600 dark:text-zinc-300 mb-1">App Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Claude 3.7 Sonnet"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-600 dark:text-zinc-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-600 dark:text-zinc-300 mb-1">Short Tagline</label>
                <input
                  type="text"
                  required
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="One sentence value proposition"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-600 dark:text-zinc-300 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comprehensive tool capabilities, model parameters, API access, etc."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-600 dark:text-zinc-300 mb-1">Website URL</label>
                  <input
                    type="url"
                    required
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-600 dark:text-zinc-300 mb-1">Pricing Model</label>
                  <select
                    value={pricing}
                    onChange={(e) => setPricing(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  >
                    <option value="Free">Free</option>
                    <option value="Freemium">Freemium</option>
                    <option value="Paid">Paid</option>
                    <option value="Free Trial">Free Trial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-600 dark:text-zinc-300 mb-1">Icon / Logo Image URL</label>
                <input
                  type="url"
                  required
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-600 dark:text-zinc-300 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Coding, LLM, OpenAI, API"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured-checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="featured-checkbox" className="font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  Feature prominently on AI Store homepage hero carousel
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition"
                >
                  {isSubmitting ? 'Saving...' : editingApp ? 'Update App' : 'Add App'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
