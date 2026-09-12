import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  X, 
  ExternalLink, 
  ChevronRight, 
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { AIApp, ChatMessage } from '../types';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: AIApp[];
  onSelectApp: (appId: string) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  catalog,
  onSelectApp,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: "Hello! I am your AI Store Assistant. Ask me anything about our 350 apps, including 200 real AI tools and 150 standard Android essentials. I can recommend top apps for coding, photo editing, video creation, study, or social communication!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  // Search strictly inside the 350 catalog to ensure no fake apps or links are ever hallucinated
  const findAppsForQuery = (query: string): AIApp[] => {
    const q = query.toLowerCase();
    const scored = catalog.map((app) => {
      let score = 0;
      const name = app.name.toLowerCase();
      const cat = app.category.toLowerCase();
      const subCat = (app.aiSubCategory || '').toLowerCase();
      const tagline = app.tagline.toLowerCase();
      const desc = app.description.toLowerCase();
      const tags = app.tags.map((t) => t.toLowerCase());

      if (name.includes(q)) score += 10;
      if (subCat.includes(q)) score += 8;
      if (cat.includes(q)) score += 6;
      if (tags.some((t) => q.includes(t) || t.includes(q))) score += 5;
      if (tagline.includes(q)) score += 4;
      if (desc.includes(q)) score += 2;

      // Check specific keyword tokens
      const words = q.split(/\s+/).filter((w) => w.length > 2);
      for (const word of words) {
        if (name.includes(word)) score += 3;
        if (subCat.includes(word)) score += 3;
        if (tags.some((t) => t.includes(word))) score += 2;
        if (tagline.includes(word)) score += 1;
      }

      return { app, score };
    });

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || b.app.rating - a.app.rating)
      .slice(0, 4)
      .map((item) => item.app);
  };

  const handleSend = (textToSend?: string) => {
    const queryText = (textToSend || inputValue).trim();
    if (!queryText) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const matches = findAppsForQuery(queryText);
      let responseText = '';
      let recommendedIds: string[] = [];

      if (matches.length > 0) {
        recommendedIds = matches.map((m) => m.id);
        const appNames = matches.map((m) => `${m.name} (${m.aiSubCategory || m.category})`).join(', ');
        responseText = `Based on our verified 350-app catalog, here are the best matches for "${queryText}":\n\n` +
          matches.map((m, idx) => `${idx + 1}. **${m.name}** — ${m.tagline} (${m.platform === 'web' ? 'Web AI Tool' : 'Available on Google Play Store'}, ${m.pricing})`).join('\n\n') +
          `\n\nAll Android apps install securely via their official Google Play Store page. Tap any recommendation below to view details and launch!`;
      } else {
        responseText = `I couldn't find an exact match for "${queryText}" in our 350-app catalog. Try browsing categories like "AI Image Generation", "AI Coding", "AI Chatbots", "Productivity & Work", or ask for recommendations like "best coding assistants" or "photo enhancers".`;
      }

      const botMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedAppIds: recommendedIds,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const samplePrompts = [
    'Best AI chatbots',
    'AI image generators',
    'Top coding assistants',
    'Video & photo editing AI',
    'Popular social media apps',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-xl h-[85vh] max-h-[700px] flex flex-col shadow-2xl overflow-hidden"
        id="ai-assistant-modal"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-zinc-900 dark:text-white">
                  AI Store Assistant
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Online
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Ground-truth intelligence across 350 verified apps
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            id="close-assistant-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-none border border-zinc-200/60 dark:border-zinc-700/50'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Interactive Recommended App Cards */}
                {msg.recommendedAppIds && msg.recommendedAppIds.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-zinc-200/60 dark:border-zinc-700/60 space-y-2">
                    <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Recommended from catalog:
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {msg.recommendedAppIds.map((id) => {
                        const app = catalog.find((a) => a.id === id);
                        if (!app) return null;
                        return (
                          <div
                            key={app.id}
                            onClick={() => {
                              onSelectApp(app.id);
                              onClose();
                            }}
                            className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer group transition"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <img
                                src={app.iconUrl}
                                alt={app.name}
                                className="w-8 h-8 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                              />
                              <div className="truncate">
                                <h4 className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">
                                  {app.name}
                                </h4>
                                <p className="text-[10px] text-zinc-400 truncate">
                                  {app.aiSubCategory || app.category} • {app.pricing}
                                </p>
                              </div>
                            </div>
                            <span className="shrink-0 flex items-center text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                              View <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div
                  className={`text-[10px] mt-1.5 ${
                    msg.sender === 'user' ? 'text-indigo-200 text-right' : 'text-zinc-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-zinc-400 text-xs italic">
              <Bot className="w-4 h-4 animate-spin text-indigo-500" />
              <span>AI Store Assistant is searching catalog...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-zinc-50/50 dark:bg-zinc-800/20 border-t border-zinc-100 dark:border-zinc-800/80 overflow-x-auto flex gap-1.5 no-scrollbar">
          {samplePrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-medium whitespace-nowrap transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 bg-white dark:bg-zinc-900"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about AI tools, photo enhancers, coding bots..."
            className="flex-1 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-2xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            id="assistant-chat-input"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-2xl shadow-md transition shrink-0"
            id="assistant-chat-send-btn"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
