import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check, RotateCw, Edit2, AlertCircle, FileText, Globe, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { ChatMessage } from '../utils/chatLogic';
import { MarkdownRenderer } from './MarkdownRenderer';
import { BrandLogo } from './BrandLogo';

interface MessageThreadProps {
  messages: ChatMessage[];
  isGenerating: boolean;
  onRegenerate: () => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onRetryLast: () => void;
  isDark?: boolean;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  messages,
  isGenerating,
  onRegenerate,
  onEditMessage,
  onRetryLast,
  isDark = false,
}) => {
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});

  // Auto-scroll to bottom on messages change
  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleStartEdit = (message: ChatMessage) => {
    setEditingId(message.id);
    setEditDraft(message.content);
  };

  const handleSaveEdit = (messageId: string) => {
    if (editDraft.trim()) {
      onEditMessage(messageId, editDraft.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditDraft('');
  };

  const toggleCitations = (msgId: string) => {
    setExpandedCitations((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6 max-w-3xl w-full mx-auto relative z-10">
      {messages.map((message, index) => {
        const isUser = message.role === 'user';
        const isLastAssistant =
          !isUser &&
          index === messages.length - 1 &&
          !isGenerating;

        if (isUser) {
          return (
            <div key={message.id} className="flex flex-col items-end group animate-in fade-in duration-200">
              {/* Attachments preview */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="flex flex-wrap justify-end gap-2 mb-2 max-w-md">
                  {message.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFFFFF]/90 dark:bg-[#121318]/90 backdrop-blur-md border border-[#E4E2DC]/90 dark:border-[#24262D]/90 shadow-xs text-xs text-[#5A5C66] dark:text-[#9A9CA6]"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#5B47E0] dark:text-[#8577FF]" />
                      <span className="max-w-[140px] truncate text-[#15161A] dark:text-[#EDECE8] font-medium">{att.name}</span>
                      <span className="text-[10px] text-[#5A5C66] dark:text-[#9A9CA6]">{att.size}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* User Bubble with soft conversational radius ~18px, subtle depth */}
              {editingId === message.id ? (
                <div className="w-full max-w-xl p-3.5 rounded-[18px] bg-[#FFFFFF] dark:bg-[#121318] border border-[#5B47E0] dark:border-[#8577FF] shadow-md">
                  <textarea
                    rows={3}
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    className="w-full bg-transparent resize-none outline-none text-sm text-[#15161A] dark:text-[#EDECE8] leading-relaxed"
                    aria-label="Edit message"
                  />
                  <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-[#E4E2DC] dark:border-[#24262D]">
                    <button
                      onClick={handleCancelEdit}
                      className="px-2.5 py-1 rounded-md text-xs text-[#5A5C66] dark:text-[#9A9CA6] hover:bg-[#F7F6F3] dark:hover:bg-[#0B0C10] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(message.id)}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-[#5B47E0] dark:bg-[#8577FF] text-white hover:opacity-90 active:scale-95 transition-all"
                    >
                      Save & Resend
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative max-w-xl">
                  <div className="rounded-[18px] bg-[#FFFFFF]/90 dark:bg-[#121318]/90 backdrop-blur-md text-[#15161A] dark:text-[#EDECE8] border border-[#E4E2DC]/90 dark:border-[#24262D]/90 px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* Message Action affordances */}
                  <div className="flex items-center justify-end gap-1.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleStartEdit(message)}
                      className="p-1 rounded-md text-[#5A5C66] dark:text-[#9A9CA6] hover:text-[#15161A] dark:hover:text-[#EDECE8] hover:bg-[#FFFFFF]/80 dark:hover:bg-[#121318]/80 transition-colors"
                      title="Edit message"
                      aria-label="Edit this message"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopy(message.id, message.content)}
                      className="p-1 rounded-md text-[#5A5C66] dark:text-[#9A9CA6] hover:text-[#15161A] dark:hover:text-[#EDECE8] hover:bg-[#FFFFFF]/80 dark:hover:bg-[#121318]/80 transition-colors"
                      title="Copy message"
                      aria-label="Copy this message"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        }

        // Nova Assistant Reply: left-aligned flush
        return (
          <div key={message.id} className="flex gap-3.5 max-w-3xl group animate-in fade-in duration-200">
            {/* Nova Brand Mark Avatar */}
            <div className="mt-0.5 shrink-0">
              <BrandLogo size={26} isDark={isDark} />
            </div>

            <div className="flex-1 min-w-0">
              {/* Research indicator & Citations accordion if web research was used */}
              {message.researchEnabled && (
                <div className="mb-2.5">
                  <button
                    onClick={() => toggleCitations(message.id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#5B47E0]/10 dark:bg-[#8577FF]/15 text-[#5B47E0] dark:text-[#8577FF] text-xs font-medium hover:bg-[#5B47E0]/15 dark:hover:bg-[#8577FF]/25 transition-colors"
                    aria-expanded={expandedCitations[message.id]}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>3 research sources cited</span>
                    {expandedCitations[message.id] ? (
                      <ChevronUp className="w-3 h-3 ml-0.5" />
                    ) : (
                      <ChevronDown className="w-3 h-3 ml-0.5" />
                    )}
                  </button>

                  {/* Expanded citations drawer */}
                  {expandedCitations[message.id] && (
                    <div className="mt-2 p-3 rounded-lg border border-[#E4E2DC] dark:border-[#24262D] bg-[#FFFFFF]/80 dark:bg-[#121318]/80 backdrop-blur-md space-y-2 text-xs">
                      <div className="text-[11px] font-medium text-[#5A5C66] dark:text-[#9A9CA6]">
                        Verified Reference Citations:
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[#15161A] dark:text-[#EDECE8]">
                          <span className="font-medium">1. National Institutes of Health (PMC)</span>
                          <span className="text-[11px] text-[#5A5C66] dark:text-[#9A9CA6] flex items-center gap-1">
                            Adenosinergic mechanisms <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[#15161A] dark:text-[#EDECE8]">
                          <span className="font-medium">2. Sleep Medicine Reviews</span>
                          <span className="text-[11px] text-[#5A5C66] dark:text-[#9A9CA6] flex items-center gap-1">
                            Diurnal caffeine kinetics <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[#15161A] dark:text-[#EDECE8]">
                          <span className="font-medium">3. Journal of Clinical Sleep Medicine</span>
                          <span className="text-[11px] text-[#5A5C66] dark:text-[#9A9CA6] flex items-center gap-1">
                            Drake et al. (Polysomnography) <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error State check */}
              {message.isError ? (
                <div className="rounded-lg border border-rose-300 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 backdrop-blur-md p-4 text-xs text-[#15161A] dark:text-[#EDECE8] space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Nova’s at capacity right now — try again shortly</span>
                  </div>
                  <p className="text-[#5A5C66] dark:text-[#9A9CA6] pl-6 leading-relaxed">
                    We encountered high concurrent traffic on the cluster. Your prompt and attachments have been preserved.
                  </p>
                  <div className="pl-6 pt-1">
                    <button
                      onClick={onRetryLast}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#15161A] dark:bg-[#EDECE8] text-[#FFFFFF] dark:text-[#0B0C10] hover:opacity-90 font-medium text-xs active:scale-95 transition-all"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Regular Assistant Markdown Body */
                <div className="prose-container">
                  <MarkdownRenderer content={message.content} isDark={isDark} />

                  {/* Streaming cursor if currently generating this message */}
                  {isGenerating && index === messages.length - 1 && (
                    <span className="inline-block w-2 h-4 ml-1 bg-[#5B47E0] dark:bg-[#8577FF] animate-pulse align-middle" />
                  )}
                </div>
              )}

              {/* Action affordances on Assistant reply */}
              {!message.isError && (
                <div className="flex items-center gap-2 mt-3 pt-1 text-xs text-[#5A5C66] dark:text-[#9A9CA6] opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopy(message.id, message.content)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-[#FFFFFF]/80 dark:hover:bg-[#121318]/80 hover:text-[#15161A] dark:hover:text-[#EDECE8] transition-colors"
                    title="Copy response"
                    aria-label="Copy assistant response"
                  >
                    {copiedId === message.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {isLastAssistant && (
                    <button
                      onClick={onRegenerate}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-[#FFFFFF]/80 dark:hover:bg-[#121318]/80 hover:text-[#15161A] dark:hover:text-[#EDECE8] transition-colors"
                      title="Regenerate last response"
                      aria-label="Regenerate response"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Regenerate</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={scrollEndRef} />
    </div>
  );
};
