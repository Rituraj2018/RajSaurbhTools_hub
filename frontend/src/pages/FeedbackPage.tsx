import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  Bug,
  Lightbulb,
  Wrench,
  PlusCircle,
  Heart,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Send,
  ArrowLeft,
  ChevronDown,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../features/store';
import { fetchTools } from '../features/tools';
import { feedbackApi, FeedbackSubmissionPayload } from '../api/feedbackApi';
import { mockTools } from '../utils/mockData';

type FeedbackType = 'bug' | 'feature' | 'improve_tool' | 'new_tool' | 'praise' | 'other';
type RatingEmoji = 'poor' | 'okay' | 'good' | 'great' | 'excellent';

interface RatingOption {
  value: number;
  emojiKey: RatingEmoji;
  emoji: string;
  label: string;
  color: string;
  activeBg: string;
  activeBorder: string;
}

const RATING_OPTIONS: RatingOption[] = [
  {
    value: 1,
    emojiKey: 'poor',
    emoji: '😞',
    label: 'Poor',
    color: 'text-rose-400',
    activeBg: 'bg-rose-500/15',
    activeBorder: 'border-rose-500/60 ring-1 ring-rose-500/30',
  },
  {
    value: 2,
    emojiKey: 'okay',
    emoji: '😐',
    label: 'Okay',
    color: 'text-amber-400',
    activeBg: 'bg-amber-500/15',
    activeBorder: 'border-amber-500/60 ring-1 ring-amber-500/30',
  },
  {
    value: 3,
    emojiKey: 'good',
    emoji: '🙂',
    label: 'Good',
    color: 'text-blue-400',
    activeBg: 'bg-blue-500/15',
    activeBorder: 'border-blue-500/60 ring-1 ring-blue-500/30',
  },
  {
    value: 4,
    emojiKey: 'great',
    emoji: '😍',
    label: 'Great',
    color: 'text-purple-400',
    activeBg: 'bg-purple-500/15',
    activeBorder: 'border-purple-500/60 ring-1 ring-purple-500/30',
  },
  {
    value: 5,
    emojiKey: 'excellent',
    emoji: '🤩',
    label: 'Excellent',
    color: 'text-emerald-400',
    activeBg: 'bg-emerald-500/15',
    activeBorder: 'border-emerald-500/60 ring-1 ring-emerald-500/30',
  },
];

interface FeedbackTypeOption {
  id: FeedbackType;
  title: string;
  emoji: string;
  icon: React.ComponentType<{ className?: string }>;
  activeBorder: string;
  iconBg: string;
}

const FEEDBACK_TYPE_OPTIONS: FeedbackTypeOption[] = [
  {
    id: 'bug',
    title: 'Report a Problem',
    emoji: '🐛',
    icon: Bug,
    activeBorder: 'border-rose-500/60 bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/30',
    iconBg: 'bg-rose-500/20 text-rose-400',
  },
  {
    id: 'feature',
    title: 'Suggest a Feature',
    emoji: '🚀',
    icon: Lightbulb,
    activeBorder: 'border-blue-500/60 bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/30',
    iconBg: 'bg-blue-500/20 text-blue-400',
  },
  {
    id: 'improve_tool',
    title: 'Improve a Tool',
    emoji: '🛠️',
    icon: Wrench,
    activeBorder: 'border-indigo-500/60 bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/30',
    iconBg: 'bg-indigo-500/20 text-indigo-400',
  },
  {
    id: 'new_tool',
    title: 'Suggest a New Tool',
    emoji: '✨',
    icon: PlusCircle,
    activeBorder: 'border-purple-500/60 bg-purple-500/10 text-purple-300 ring-1 ring-purple-500/30',
    iconBg: 'bg-purple-500/20 text-purple-400',
  },
  {
    id: 'praise',
    title: 'Tell Us What You Like',
    emoji: '❤️',
    icon: Heart,
    activeBorder: 'border-pink-500/60 bg-pink-500/10 text-pink-300 ring-1 ring-pink-500/30',
    iconBg: 'bg-pink-500/20 text-pink-400',
  },
  {
    id: 'other',
    title: 'Other Feedback',
    emoji: '💬',
    icon: MessageSquare,
    activeBorder: 'border-teal-500/60 bg-teal-500/10 text-teal-300 ring-1 ring-teal-500/30',
    iconBg: 'bg-teal-500/20 text-teal-400',
  },
];

export const FeedbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { tools } = useAppSelector((state) => state.tools);
  const { user } = useAppSelector((state) => state.auth);

  // Form states
  const [selectedRating, setSelectedRating] = useState<RatingOption | null>(RATING_OPTIONS[3]); // Default: Great
  const [selectedType, setSelectedType] = useState<FeedbackType>('improve_tool');
  const [selectedToolId, setSelectedToolId] = useState<string>('');
  const [selectedToolName, setSelectedToolName] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [featureTitle, setFeatureTitle] = useState<string>('');
  const [featureBenefit, setFeatureBenefit] = useState<string>('');
  const [newToolName, setNewToolName] = useState<string>('');
  const [newToolUse, setNewToolUse] = useState<string>('');
  const [expectedResult, setExpectedResult] = useState<string>('');
  const [actualResult, setActualResult] = useState<string>('');
  const [email, setEmail] = useState<string>(user?.email || '');

  // UI / Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchTools());
  }, [dispatch]);

  const availableTools = useMemo(() => {
    const list: { id: string; name: string; category?: string }[] = [];
    const seen = new Set<string>();

    if (tools && tools.length > 0) {
      for (const t of tools) {
        const id = String(t.slug || (t as any)._id || (t as any).id);
        const name = t.name || (t as any).title || id;
        if (!seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          list.push({ id, name, category: t.category });
        }
      }
    }

    for (const mt of mockTools) {
      if (!seen.has(mt.title.toLowerCase())) {
        seen.add(mt.title.toLowerCase());
        list.push({ id: mt.id, name: mt.title, category: mt.category });
      }
    }

    return list;
  }, [tools]);

  useEffect(() => {
    const paramType = searchParams.get('type') as FeedbackType | null;
    const paramTool = searchParams.get('tool');

    if (paramType && FEEDBACK_TYPE_OPTIONS.some((o) => o.id === paramType)) {
      setSelectedType(paramType);
    }

    if (paramTool) {
      const match = availableTools.find(
        (t) =>
          t.id.toLowerCase() === paramTool.toLowerCase() ||
          t.name.toLowerCase().includes(paramTool.toLowerCase())
      );
      if (match) {
        setSelectedToolId(match.id);
        setSelectedToolName(match.name);
      } else {
        setSelectedToolId(paramTool);
        setSelectedToolName(paramTool);
      }
    }
  }, [searchParams, availableTools]);

  const handleToolChange = (toolIdValue: string) => {
    setSelectedToolId(toolIdValue);
    const found = availableTools.find((t) => t.id === toolIdValue);
    setSelectedToolName(found ? found.name : toolIdValue);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!selectedRating) {
      errors.rating = 'Please rate your experience';
    }

    if (!message || message.trim().length === 0) {
      errors.message = 'Please provide your feedback message';
    } else if (message.trim().length > 1000) {
      errors.message = 'Message must be 1000 characters or fewer';
    }

    if (email && email.trim().length > 0) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please enter a valid email address';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm() || !selectedRating) {
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: FeedbackSubmissionPayload = {
        feedbackType: selectedType,
        rating: selectedRating.value,
        ratingEmoji: selectedRating.emojiKey,
        toolId: selectedToolId || undefined,
        toolName: selectedToolName || undefined,
        message: message.trim(),
        featureTitle: featureTitle.trim() || undefined,
        featureBenefit: featureBenefit.trim() || undefined,
        newToolName: newToolName.trim() || undefined,
        newToolUse: newToolUse.trim() || undefined,
        expectedResult: expectedResult.trim() || undefined,
        actualResult: actualResult.trim() || undefined,
        email: email.trim() || undefined,
      };

      await feedbackApi.submitFeedback(payload);
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Failed to submit feedback:', err);
      setFormError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to send feedback. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSelectedRating(RATING_OPTIONS[3]);
    setSelectedType('improve_tool');
    setSelectedToolId('');
    setSelectedToolName('');
    setMessage('');
    setFeatureTitle('');
    setFeatureBenefit('');
    setNewToolName('');
    setNewToolUse('');
    setExpectedResult('');
    setActualResult('');
    setFieldErrors({});
    setFormError(null);
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 text-slate-100 selection:bg-blue-600 selection:text-white">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Top Header Row (Compact) */}
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-medium">
            <Sparkles className="w-3 h-3" />
            <span>Tools_Hub Feedback</span>
          </div>
        </div>

        {/* Success State */}
        {isSubmitted ? (
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl text-center space-y-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Thank you for helping us improve.
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your feedback has been received. Our team reviews every submission to make
                Tools_Hub better.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 max-w-sm mx-auto text-left text-xs text-slate-300 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span>Category:</span>
                <span className="font-semibold text-white capitalize">
                  {selectedType.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Rating:</span>
                <span className="font-semibold text-emerald-400">
                  {selectedRating?.emoji} {selectedRating?.label} ({selectedRating?.value}/5)
                </span>
              </div>
              {selectedToolName && (
                <div className="flex items-center justify-between text-slate-400">
                  <span>Tool:</span>
                  <span className="font-semibold text-blue-400">{selectedToolName}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleResetForm}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Send Another</span>
              </button>
              <Link
                to="/tools"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Tools</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Streamlined & Compact Feedback Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Page Header Banner */}
            <div className="text-center space-y-1 pb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Help us make Tools_Hub better
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                Your feedback helps us improve our tools and build features that are actually useful.
              </p>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Combined Single Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-xl space-y-4">
              {/* 1. Rating Selector (Compact Horizontal) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1">
                    <span>1. Experience Rating</span>
                    <span className="text-rose-400">*</span>
                  </span>
                  {selectedRating && (
                    <span className={`font-bold ${selectedRating.color}`}>
                      {selectedRating.label} ({selectedRating.value}/5)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {RATING_OPTIONS.map((opt) => {
                    const isSelected = selectedRating?.value === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSelectedRating(opt)}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? `${opt.activeBg} ${opt.activeBorder} shadow-sm scale-102`
                            : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xl sm:text-2xl">{opt.emoji}</span>
                        <span
                          className={`text-[10px] font-semibold mt-1 truncate ${
                            isSelected ? opt.color : 'text-slate-400'
                          }`}
                        >
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Feedback Type Selector (Compact 3x2 Grid) */}
              <div className="space-y-2 pt-2 border-t border-slate-800/60">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-200">
                  2. What do you want to tell us? <span className="text-rose-400">*</span>
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FEEDBACK_TYPE_OPTIONS.map((opt) => {
                    const isSelected = selectedType === opt.id;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedType(opt.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer text-xs ${
                          isSelected
                            ? `${opt.activeBorder} font-bold`
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-900/60 hover:border-slate-700'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? opt.iconBg : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{opt.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Conditional Fields & Message */}
              <div className="space-y-3 pt-2 border-t border-slate-800/60">
                {/* Tool Selection */}
                {(selectedType === 'improve_tool' || selectedType === 'bug') && (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300">
                      Which tool are you talking about?
                    </label>
                    <div className="relative">
                      <select
                        value={selectedToolId}
                        onChange={(e) => handleToolChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                      >
                        <option value="">— Select a tool (Optional) —</option>
                        {availableTools.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} {t.category ? `(${t.category})` : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Feature Mode */}
                {selectedType === 'feature' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-300">
                        What would you like us to add?
                      </label>
                      <input
                        type="text"
                        value={featureTitle}
                        onChange={(e) => setFeatureTitle(e.target.value)}
                        placeholder="Feature name or idea..."
                        maxLength={200}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-300">
                        How would this feature help you?
                      </label>
                      <input
                        type="text"
                        value={featureBenefit}
                        onChange={(e) => setFeatureBenefit(e.target.value)}
                        placeholder="Impact or use-case..."
                        maxLength={500}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                )}

                {/* New Tool Mode */}
                {selectedType === 'new_tool' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-300">
                        Which tool would you like to see?
                      </label>
                      <input
                        type="text"
                        value={newToolName}
                        onChange={(e) => setNewToolName(e.target.value)}
                        placeholder="e.g. SVG Editor, Audio Transcriber..."
                        maxLength={200}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-300">
                        Tell us how you would use it
                      </label>
                      <input
                        type="text"
                        value={newToolUse}
                        onChange={(e) => setNewToolUse(e.target.value)}
                        placeholder="Planned workflow or task..."
                        maxLength={500}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                )}

                {/* Bug Mode */}
                {selectedType === 'bug' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-300">
                        Expected result <span className="text-slate-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={expectedResult}
                        onChange={(e) => setExpectedResult(e.target.value)}
                        placeholder="What should have happened..."
                        maxLength={500}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-300">
                        Actual result <span className="text-slate-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={actualResult}
                        onChange={(e) => setActualResult(e.target.value)}
                        placeholder="What went wrong or error text..."
                        maxLength={500}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                )}

                {/* Main Message */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-300">
                      {selectedType === 'bug'
                        ? 'What went wrong?'
                        : "Tell us what happened or what you'd like us to improve..."}{' '}
                      <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">
                      {message.length} / 1000
                    </span>
                  </div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder={
                      selectedType === 'bug'
                        ? 'Describe the issue or error you encountered...'
                        : selectedType === 'feature'
                        ? 'Explain your feature request in a few sentences...'
                        : selectedType === 'new_tool'
                        ? 'Tell us what tool you need and how it helps...'
                        : selectedType === 'praise'
                        ? 'Share what you enjoyed or what worked well...'
                        : 'Share your feedback or suggestions...'
                    }
                    className={`w-full px-3 py-2 rounded-xl bg-slate-950 border text-slate-200 text-xs focus:outline-none resize-y min-h-[75px] placeholder:text-slate-600 ${
                      fieldErrors.message
                        ? 'border-rose-500 focus:border-rose-500'
                        : 'border-slate-800 focus:border-blue-500'
                    }`}
                  />
                  {fieldErrors.message && (
                    <p className="text-[11px] text-rose-400">{fieldErrors.message}</p>
                  )}
                </div>

                {/* Email (Optional) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-300">
                      Email <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <span className="text-[10px] text-slate-500">
                      Add email if you'd like us to follow up
                    </span>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    maxLength={100}
                    className={`w-full px-3 py-2 rounded-xl bg-slate-950 border text-slate-200 text-xs focus:outline-none placeholder:text-slate-600 ${
                      fieldErrors.email
                        ? 'border-rose-500 focus:border-rose-500'
                        : 'border-slate-800 focus:border-blue-500'
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-[11px] text-rose-400">{fieldErrors.email}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 truncate">
                  Your feedback helps improve Tools_Hub.
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-60 cursor-pointer shrink-0 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
