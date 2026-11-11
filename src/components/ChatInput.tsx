import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Paperclip, Square, Sparkles, X, FileText } from 'lucide-react';
import { MessageAttachment } from '../utils/chatLogic';

interface ChatInputProps {
  onSend: (message: string, researchEnabled: boolean, attachments: MessageAttachment[]) => void;
  onStop: () => void;
  isGenerating: boolean;
  isDark?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onStop,
  isGenerating,
  isDark = false,
}) => {
  const [text, setText] = useState('');
  const [researchEnabled, setResearchEnabled] = useState(false);
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 180);
      textareaRef.current.style.height = `${Math.max(newHeight, 24)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isGenerating) {
      onStop();
      return;
    }
    const clean = text.trim();
    if (!clean && attachments.length === 0) return;

    onSend(clean, researchEnabled, [...attachments]);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleAddMockAttachment = () => {
    // Offer quick mock attachment choices or trigger file select
    const mockFiles: MessageAttachment[] = [
      { id: `att-${Date.now()}-1`, name: 'architecture_spec.md', size: '14 KB', type: 'text/markdown' },
      { id: `att-${Date.now()}-2`, name: 'retention_cohorts_q3.csv', size: '82 KB', type: 'text/csv' },
      { id: `att-${Date.now()}-3`, name: 'system_topology.pdf', size: '1.2 MB', type: 'application/pdf' },
    ];
    // Pick the one not already attached
    const unattached = mockFiles.find((m) => !attachments.some((a) => a.name === m.name)) || mockFiles[0];
    setAttachments((prev) => [...prev, { ...unattached, id: `att-${Date.now()}` }]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const newAtt: MessageAttachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
        type: file.type || 'document',
      };
      setAttachments((prev) => [...prev, newAtt]);
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const emberColor = isDark ? '#FF8A66' : '#FF6B4A';
  const signalColor = isDark ? '#8577FF' : '#5B47E0';

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      {/* Outer wrapper: when generating, holds the rotating ignition sweep ring */}
      <div className={`relative rounded-[20px] transition-all ${
        isGenerating
          ? 'p-[2px] overflow-hidden'
          : 'border border-[#E4E2DC] dark:border-[#24262D] focus-within:border-[#5B47E0] dark:focus-within:border-[#8577FF]'
      }`}>
        {/* Ignition Ring: sweeps around the chat input while Nova is generating a reply */}
        {isGenerating && (
          <div
            className="absolute -inset-[150%] animate-ignition-sweep pointer-events-none"
            style={{
              background: `conic-gradient(from 0deg, ${emberColor} 0deg, ${signalColor} 60deg, transparent 120deg, transparent 360deg)`,
            }}
            aria-hidden="true"
          />
        )}

        {/* Floating conversational composer surface with soft/conversational ~18px radius */}
        <div
          className="relative rounded-[18px] bg-[#FFFFFF]/90 dark:bg-[#121318]/90 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] z-10 transition-shadow"
        >
          {/* Attached Files Chips */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 px-4 pt-3 pb-1">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F7F6F3] dark:bg-[#0B0C10] border border-[#E4E2DC] dark:border-[#24262D] text-xs text-[#15161A] dark:text-[#EDECE8]"
                >
                  <FileText className="w-3.5 h-3.5 text-[#5A5C66] dark:text-[#9A9CA6]" />
                  <span className="max-w-[140px] truncate">{att.name}</span>
                  <span className="text-[10px] text-[#5A5C66] dark:text-[#9A9CA6]">{att.size}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="p-0.5 ml-1 rounded hover:bg-[#E4E2DC] dark:hover:bg-[#24262D] text-[#5A5C66] dark:text-[#9A9CA6]"
                    aria-label={`Remove attachment ${att.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Text Area */}
          <div className="px-4 pt-3 pb-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Nova anything, draft code, or analyze data..."
              className="w-full bg-transparent resize-none outline-none text-sm text-[#15161A] dark:text-[#EDECE8] placeholder-[#5A5C66] dark:placeholder-[#9A9CA6] leading-relaxed max-h-[180px]"
              aria-label="Message prompt input"
            />
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
            <div className="flex items-center gap-1.5">
              {/* File Attachment Button */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                aria-label="Upload file"
              />
              <button
                type="button"
                onClick={handleAddMockAttachment}
                className="p-1.5 rounded-md text-[#5A5C66] dark:text-[#9A9CA6] hover:text-[#15161A] dark:hover:text-[#EDECE8] hover:bg-[#F7F6F3] dark:hover:bg-[#0B0C10] transition-colors"
                title="Attach document or dataset"
                aria-label="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Research Toggle (visual toggle inside composer) */}
              <button
                type="button"
                onClick={() => setResearchEnabled(!researchEnabled)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  researchEnabled
                    ? 'bg-[#5B47E0]/10 dark:bg-[#8577FF]/15 text-[#5B47E0] dark:text-[#8577FF]'
                    : 'text-[#5A5C66] dark:text-[#9A9CA6] hover:bg-[#F7F6F3] dark:hover:bg-[#0B0C10] hover:text-[#15161A] dark:hover:text-[#EDECE8]'
                }`}
                aria-pressed={researchEnabled}
                aria-label="Toggle Research mode"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Research</span>
              </button>
            </div>

            {/* Send / Stop Button */}
            <div className="flex items-center gap-2">
              {isGenerating ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#15161A] dark:bg-[#EDECE8] text-[#FFFFFF] dark:text-[#0B0C10] hover:opacity-90 active:scale-95 transition-all text-xs font-medium shadow-xs"
                  aria-label="Stop generation"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={!text.trim() && attachments.length === 0}
                  className={`p-2 rounded-full transition-all duration-150 ${
                    text.trim() || attachments.length > 0
                      ? 'bg-[#5B47E0] dark:bg-[#8577FF] text-white hover:opacity-95 hover:scale-105 active:scale-95 shadow-md shadow-[#5B47E0]/20 dark:shadow-[#8577FF]/25 cursor-pointer'
                      : 'bg-[#E4E2DC]/80 dark:bg-[#24262D]/80 text-[#5A5C66] dark:text-[#9A9CA6] cursor-not-allowed opacity-60'
                  }`}
                  aria-label="Send message"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
