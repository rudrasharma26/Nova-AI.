import React from 'react';
import { X, Sun, Moon, Laptop, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'system' | 'light' | 'dark';
  onThemeChange: (theme: 'system' | 'light' | 'dark') => void;
  onClearAllConversations: () => void;
  usageCount: number;
  maxUsage: number;
  onResetUsage: () => void;
  simulateErrorNext: boolean;
  onToggleSimulateError: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  onClearAllConversations,
  usageCount,
  maxUsage,
  onResetUsage,
  simulateErrorNext,
  onToggleSimulateError,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-lg bg-[#FFFFFF] dark:bg-[#121318] border border-[#E4E2DC] dark:border-[#24262D] p-6 shadow-xl text-[#15161A] dark:text-[#EDECE8]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-[#5A5C66] dark:text-[#9A9CA6] hover:bg-[#F7F6F3] dark:hover:bg-[#0B0C10] transition-colors"
          aria-label="Close settings modal"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-base font-semibold tracking-tight mb-4">
          Settings
        </h2>

        <div className="space-y-5 text-xs">
          {/* Theme Selection */}
          <div>
            <label className="block text-xs font-medium text-[#15161A] dark:text-[#EDECE8] mb-2">
              Appearance
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onThemeChange('system')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                  theme === 'system'
                    ? 'border-[#5B47E0] dark:border-[#8577FF] bg-[#5B47E0]/10 dark:bg-[#8577FF]/15 text-[#5B47E0] dark:text-[#8577FF]'
                    : 'border-[#E4E2DC] dark:border-[#24262D] text-[#5A5C66] dark:text-[#9A9CA6] hover:bg-[#F7F6F3] dark:hover:bg-[#0B0C10]'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>System</span>
              </button>
              <button
                type="button"
                onClick={() => onThemeChange('light')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                  theme === 'light'
                    ? 'border-[#5B47E0] dark:border-[#8577FF] bg-[#5B47E0]/10 dark:bg-[#8577FF]/15 text-[#5B47E0] dark:text-[#8577FF]'
                    : 'border-[#E4E2DC] dark:border-[#24262D] text-[#5A5C66] dark:text-[#9A9CA6] hover:bg-[#F7F6F3] dark:hover:bg-[#0B0C10]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => onThemeChange('dark')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                  theme === 'dark'
                    ? 'border-[#5B47E0] dark:border-[#8577FF] bg-[#5B47E0]/10 dark:bg-[#8577FF]/15 text-[#5B47E0] dark:text-[#8577FF]'
                    : 'border-[#E4E2DC] dark:border-[#24262D] text-[#5A5C66] dark:text-[#9A9CA6] hover:bg-[#F7F6F3] dark:hover:bg-[#0B0C10]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Model selection preference */}
          <div>
            <label className="block text-xs font-medium text-[#15161A] dark:text-[#EDECE8] mb-1.5">
              Default Model
            </label>
            <div className="p-3 rounded-lg bg-[#F7F6F3] dark:bg-[#0B0C10] border border-[#E4E2DC] dark:border-[#24262D] flex items-center justify-between">
              <div>
                <div className="font-medium text-[#15161A] dark:text-[#EDECE8]">Nova Flash 2.5</div>
                <div className="text-[11px] text-[#5A5C66] dark:text-[#9A9CA6]">Low latency, reasoning & synthesis</div>
              </div>
              <span className="text-[10px] text-[#5B47E0] dark:text-[#8577FF] font-medium bg-[#5B47E0]/10 dark:bg-[#8577FF]/15 px-2 py-0.5 rounded">
                Active
              </span>
            </div>
          </div>

          {/* Usage Management */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#15161A] dark:text-[#EDECE8]">
                Daily Usage Quota
              </label>
              <button
                type="button"
                onClick={onResetUsage}
                className="text-[11px] text-[#5B47E0] dark:text-[#8577FF] hover:underline"
              >
                Reset quota
              </button>
            </div>
            <div className="p-3 rounded-lg bg-[#F7F6F3] dark:bg-[#0B0C10] border border-[#E4E2DC] dark:border-[#24262D]">
              <div className="flex items-center justify-between text-xs text-[#5A5C66] dark:text-[#9A9CA6] mb-1.5">
                <span>Consumed messages</span>
                <span className="font-mono text-[#15161A] dark:text-[#EDECE8] font-medium">{usageCount}/{maxUsage}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#E4E2DC] dark:bg-[#24262D] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#5B47E0] dark:bg-[#8577FF] transition-all"
                  style={{ width: `${Math.min(100, (usageCount / maxUsage) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Error state simulation toggle for QA / inspection */}
          <div className="pt-1">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#F7F6F3] dark:bg-[#0B0C10] border border-[#E4E2DC] dark:border-[#24262D]">
              <div>
                <div className="font-medium text-[#15161A] dark:text-[#EDECE8]">Simulate capacity error</div>
                <div className="text-[11px] text-[#5A5C66] dark:text-[#9A9CA6]">Test the &quot;Nova’s at capacity&quot; fallback screen</div>
              </div>
              <input
                type="checkbox"
                checked={simulateErrorNext}
                onChange={onToggleSimulateError}
                className="w-4 h-4 accent-[#5B47E0] cursor-pointer"
                aria-label="Toggle capacity error simulation"
              />
            </div>
          </div>

          {/* Clear conversations */}
          <div className="pt-2 border-t border-[#E4E2DC] dark:border-[#24262D]">
            <button
              type="button"
              onClick={onClearAllConversations}
              className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg border border-rose-300 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all conversations</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
