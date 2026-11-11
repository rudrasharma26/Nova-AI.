import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Share2,
  Check,
} from 'lucide-react';
import {
  Conversation,
  ChatMessage,
  MessageAttachment,
  filterConversations,
  createNewConversation,
  deriveTitleFromMessage,
  chunkResponseText,
  GENERAL_SEEDED_CONVERSATIONS,
} from './utils/chatLogic';
import { Sidebar } from './components/Sidebar';
import { MessageThread } from './components/MessageThread';
import { ChatInput } from './components/ChatInput';
import { EmptyState } from './components/EmptyState';
import { SettingsModal } from './components/SettingsModal';
import { SignInModal } from './components/SignInModal';
import { AmbientBackground } from './components/AmbientBackground';
import { InteractiveNovaCore } from './components/InteractiveNovaCore';

export default function App() {
  // Theme State: follows system by default with manual toggle
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>('system');
  const [isDark, setIsDark] = useState<boolean>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Handle Theme Changes & Palette Switching
  useEffect(() => {
    const updateTheme = () => {
      let activeIsDark = false;
      if (themeMode === 'system') {
        activeIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        activeIsDark = themeMode === 'dark';
      }
      setIsDark(activeIsDark);
      if (activeIsDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    updateTheme();

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => updateTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [themeMode]);

  // Personal Conversations State (seeded with general relatable mix)
  const [conversations, setConversations] = useState<Conversation[]>(GENERAL_SEEDED_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>('conv-brand-creative');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Single Personal Account User
  const [user, setUser] = useState({
    name: 'Dev Sharma',
    email: 'devsharma260705@gmail.com',
  });

  // Usage Meter (mock data, starts at 38/50)
  const [usageCount, setUsageCount] = useState(38);
  const maxUsage = 50;

  // Modals & Feedback
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [simulateErrorNext, setSimulateErrorNext] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // Generation / Streaming State
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<{ abort: boolean }>({ abort: false });

  // Current active conversation
  const activeConversation = conversations.find((c) => c.id === activeConvId) || conversations[0] || null;

  // Filtered conversations for search
  const filteredConversations = filterConversations(conversations, searchQuery);

  // Switch conversation
  const handleSelectConversation = (id: string) => {
    setActiveConvId(id);
    setSidebarOpen(false);
  };

  // Create new conversation
  const handleNewConversation = () => {
    const newConv = createNewConversation();
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newConv.id);
    setSidebarOpen(false);
  };

  // Rename conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: new Date().toISOString() } : c))
    );
  };

  // Delete conversation
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      if (activeConvId === id) {
        if (remaining.length > 0) {
          setActiveConvId(remaining[0].id);
        } else {
          const empty = createNewConversation();
          setActiveConvId(empty.id);
          return [empty];
        }
      }
      return remaining;
    });
  };

  // Clear all conversations
  const handleClearAllConversations = () => {
    const fresh = createNewConversation();
    setConversations([fresh]);
    setActiveConvId(fresh.id);
    setIsSettingsOpen(false);
  };

  // Stop Generation Mid-Stream
  const handleStopGeneration = () => {
    abortControllerRef.current.abort = true;
    setIsGenerating(false);
  };

  // Stream simulated AI response
  const streamAIResponse = async (
    targetConvId: string,
    fullResponseText: string,
    researchEnabled: boolean,
    isCapacityError: boolean
  ) => {
    setIsGenerating(true);
    abortControllerRef.current = { abort: false };

    const assistantMsgId = `msg-asst-${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      researchEnabled,
      isError: false,
    };

    // Add empty assistant message container
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== targetConvId) return conv;
        return {
          ...conv,
          updatedAt: new Date().toISOString(),
          messages: [...conv.messages, initialAssistantMsg],
        };
      })
    );

    // If simulated capacity error
    if (isCapacityError) {
      await new Promise((r) => setTimeout(r, 650));
      if (!abortControllerRef.current.abort) {
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id !== targetConvId) return conv;
            return {
              ...conv,
              updatedAt: new Date().toISOString(),
              messages: conv.messages.map((m) =>
                m.id === assistantMsgId ? { ...m, isError: true, content: '' } : m
              ),
            };
          })
        );
      }
      setIsGenerating(false);
      setSimulateErrorNext(false);
      return;
    }

    // Token-by-token streaming
    const chunks = chunkResponseText(fullResponseText);
    let accumulated = '';

    for (let i = 0; i < chunks.length; i++) {
      if (abortControllerRef.current.abort) {
        break;
      }
      accumulated += chunks[i];
      const currentText = accumulated;

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== targetConvId) return conv;
          return {
            ...conv,
            messages: conv.messages.map((m) =>
              m.id === assistantMsgId ? { ...m, content: currentText } : m
            ),
          };
        })
      );

      const delay = chunks[i].includes('\n') ? 35 : 18;
      await new Promise((r) => setTimeout(r, delay));
    }

    setIsGenerating(false);
  };

  // Send message
  const handleSendMessage = (
    content: string,
    researchEnabled: boolean,
    attachments: MessageAttachment[]
  ) => {
    if (!activeConversation) return;

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      attachments,
    };

    const targetConvId = activeConversation.id;
    const isFirstMessage = activeConversation.messages.length === 0;
    const newTitle = isFirstMessage ? deriveTitleFromMessage(content) : activeConversation.title;

    // Increment usage quota
    setUsageCount((prev) => Math.min(maxUsage, prev + 1));

    // Update conversation with user message
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== targetConvId) return conv;
        return {
          ...conv,
          title: newTitle,
          updatedAt: new Date().toISOString(),
          messages: [...conv.messages, userMessage],
        };
      })
    );

    // Contextual responses based on prompt
    const lower = content.toLowerCase();
    let replyText = '';

    if (lower.includes('olive') || lower.includes('brand') || lower.includes('mallorca') || lower.includes('creative') || lower.includes('name')) {
      replyText = `Here is a creative brand concept tailored to your request:

### Brand Name: *Terra Lluc* (Earth of Sanctuary)
- **Origin**: Named after the ancient olive terraces of Lluc in northwestern Mallorca.
- **Tone**: Grounded, sensory, timeless luxury.
- **Narrative**: *"Harvested at twilight when the fruit is cool. Cold-pressed within three hours using stone millstones to capture the peppery green almond aroma."*

### Bottle Packaging & Tactile Elements
- **Silhouette**: Cylindrical apothecary glass bottle in matte forest amber.
- **Label Texture**: Recycled hemp paper with blind debossed topographic contour lines.
- **Closure**: Hand-dipped wax seal over natural Iberian cork.

> Would you like me to draft an initial email to introduce the batch to specialty culinary importers?`;
    } else if (lower.includes('caffeine') || lower.includes('sleep') || lower.includes('adenosine') || lower.includes('sws')) {
      replyText = `### Scientific Consensus on Caffeine & Sleep Neurobiology

Caffeine acts primarily as a competitive antagonist at **adenosine A1 and A2A receptors** [1]. By occupying these binding sites without activating them, it blunts the brain's perception of homeostatic sleep pressure.

### Biological Half-Life & Quarter-Life

| Metric | Range | Physiological Driver |
| :--- | :--- | :--- |
| Peak Plasma Concentration | 30 to 60 min | Rapid GI tract absorption [2] |
| Elimination Half-Life | 4.5 to 7.0 hours | Hepatic cytochrome P450 1A2 activity |
| Quarter-Life | 9.0 to 14.0 hours | Evening residual adenosine inhibition |

### Impact on Sleep Staging
Clinical trials using polysomnography show that caffeine taken even 6 hours before bedtime reduces **slow-wave deep sleep (N3)** by up to 20% [3], leading to diminished physical recovery and disrupted growth hormone secretion.

### Sources & References
1. **Nature Reviews Neuroscience**: *Adenosinergic control of sleep and circadian rhythms* (2023).
2. **Sleep Medicine Reviews**: *Caffeine kinetics and objective sleep architecture* (2022).
3. **Journal of Clinical Sleep Medicine**: *Sleep restriction and afternoon stimulant clearance* (Drake et al.).`;
    } else if (lower.includes('solar') || lower.includes('lease') || lower.includes('contract') || lower.includes('escalator') || lower.includes('agreement') || attachments.length > 0) {
      replyText = `I have analyzed the solar lease terms and key clauses:

### Financial & Risk Assessment

| Clause | Specified Rate | Risk Level |
| :--- | :--- | :--- |
| Annual Escalator | 2.9% compounded | **High Risk**: In Year 15, payments increase by ~50% |
| Transfer Requirement | Buyer credit score $\ge$ 680 | Potential friction during real estate closing |
| Buyout Schedule | Fixed fair-market-value table | Penalty if purchasing system early |

### Key Takeaways
1. **Home Resale**: If a prospective buyer cannot or will not assume the 20-year lease, you will be liable for the depreciated buyout fee ($18,000+ in early years).
2. **Net Metering Risk**: If utility export credits decrease over the 20-year term, your overall grid savings will compress unless coupled with home battery backup.`;
    } else if (lower.includes('css') || lower.includes('svg') || lower.includes('animation') || lower.includes('stroke') || lower.includes('code')) {
      replyText = `Here is how to create a pure CSS SVG outline draw animation:

\`\`\`css
/* Keyframe definition for smooth path reveal */
.signature-path {
  stroke-dasharray: 800;
  stroke-dashoffset: 800;
  animation: drawStroke 2.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes drawStroke {
  to {
    stroke-dashoffset: 0;
  }
}
\`\`\`

\`\`\`html
<svg viewBox="0 0 240 120" width="160" height="80">
  <path
    class="signature-path"
    d="M 20,60 C 80,10 160,110 220,60"
    fill="none"
    stroke="#5B47E0"
    stroke-width="3"
    stroke-linecap="round"
  />
</svg>
\`\`\`

> For complex paths, you can check the total length dynamically via \`pathElement.getTotalLength()\` in the console.`;
    } else {
      replyText = `I have evaluated your question with attention to clarity, structure, and actionable insights.

### Core Recommendations
- Focus on foundational principles before adding secondary complexities.
- Establish clean feedback loops so you can measure impact in real time.

\`\`\`typescript
// Workflow execution pattern
export interface TaskConfig {
  id: string;
  priority: 'normal' | 'high';
  execute: () => Promise<boolean>;
}

export async function processQueue(tasks: TaskConfig[]): Promise<number> {
  let completed = 0;
  for (const task of tasks) {
    if (await task.execute()) completed++;
  }
  return completed;
}
\`\`\`

> Let me know if you would like me to expand on any specific phase or tailor this further!`;
    }

    if (researchEnabled) {
      replyText = `> Researched 3 verified sources with citation cross-checks.\n\n` + replyText;
    }

    streamAIResponse(targetConvId, replyText, researchEnabled, simulateErrorNext);
  };

  // Regenerate last response
  const handleRegenerate = () => {
    if (!activeConversation || activeConversation.messages.length === 0) return;
    const messages = activeConversation.messages;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== 'assistant') return;

    const trimmed = messages.slice(0, -1);
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? { ...c, messages: trimmed } : c))
    );

    const prevUserMsg = trimmed[trimmed.length - 1];
    const promptText = prevUserMsg ? prevUserMsg.content : '';

    handleSendMessage(promptText, lastMsg.researchEnabled || false, prevUserMsg?.attachments || []);
  };

  // Edit and resend user message
  const handleEditMessage = (messageId: string, newContent: string) => {
    if (!activeConversation) return;

    const msgIndex = activeConversation.messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    const previousMessages = activeConversation.messages.slice(0, msgIndex);
    const updatedUserMsg: ChatMessage = {
      ...activeConversation.messages[msgIndex],
      content: newContent,
      timestamp: new Date().toISOString(),
    };

    const targetConvId = activeConversation.id;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === targetConvId
          ? {
              ...c,
              title: msgIndex === 0 ? deriveTitleFromMessage(newContent) : c.title,
              messages: [...previousMessages, updatedUserMsg],
            }
          : c
      )
    );

    handleSendMessage(newContent, false, updatedUserMsg.attachments || []);
  };

  // Retry last failed message
  const handleRetryLast = () => {
    if (!activeConversation) return;
    const messagesWithoutError = activeConversation.messages.filter((m) => !m.isError);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id ? { ...c, messages: messagesWithoutError } : c
      )
    );
    const lastUser = messagesWithoutError[messagesWithoutError.length - 1];
    if (lastUser) {
      handleSendMessage(lastUser.content, false, lastUser.attachments || []);
    }
  };

  const handleShareThread = () => {
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F7F6F3] dark:bg-[#0B0C10] text-[#15161A] dark:text-[#EDECE8] font-sans relative">
      {/* Subtly animated ambient background behind whole app */}
      <AmbientBackground isDark={isDark} />

      {/* Left Sidebar (Single personal account) */}
      <Sidebar
        conversations={filteredConversations}
        activeId={activeConvId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={handleDeleteConversation}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSignIn={() => setIsSignInOpen(true)}
        user={user}
        usageCount={usageCount}
        maxUsage={maxUsage}
        isOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isDark={isDark}
      />

      {/* Main Workspace Panel */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-transparent relative z-10">
        {/* Top Header Bar: Clean single-user header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-[#E4E2DC]/80 dark:border-[#24262D]/80 bg-[#FFFFFF]/80 dark:bg-[#121318]/80 backdrop-blur-md shrink-0 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg md:hidden text-[#5A5C66] dark:text-[#9A9CA6] hover:bg-[#F7F6F3] dark:hover:bg-[#0B0C10] transition-colors"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Conversation Title */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-sm text-[#15161A] dark:text-[#EDECE8] truncate">
                {activeConversation ? activeConversation.title : 'New conversation'}
              </span>
            </div>
          </div>

          {/* Right Header Zone: Actions & Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Share Thread Button */}
            <button
              onClick={handleShareThread}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4E2DC] dark:border-[#24262D] bg-[#FFFFFF]/90 dark:bg-[#121318]/90 hover:bg-[#F7F6F3] dark:hover:bg-[#0B0C10] text-xs font-medium text-[#5A5C66] dark:text-[#9A9CA6] hover:text-[#15161A] dark:hover:text-[#EDECE8] shadow-xs active:scale-95 transition-all"
              title="Share conversation"
              aria-label="Share conversation"
            >
              {shareToast ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied link</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>

            {/* Theme quick switch (light / dark) */}
            <button
              onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
              className="p-2 rounded-lg text-[#5A5C66] dark:text-[#9A9CA6] hover:text-[#15161A] dark:hover:text-[#EDECE8] hover:bg-[#F7F6F3] dark:hover:bg-[#0B0C10] active:scale-95 transition-all"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Personal Account Trigger */}
            <button
              onClick={() => setIsSignInOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5B47E0] dark:bg-[#8577FF] text-white hover:opacity-95 active:scale-95 shadow-xs transition-all text-xs font-medium"
              aria-label="User account details"
            >
              <span>{user.name.split(' ')[0]}</span>
            </button>
          </div>
        </header>

        {/* Message Thread or Empty State */}
        {activeConversation && activeConversation.messages.length > 0 ? (
          <MessageThread
            messages={activeConversation.messages}
            isGenerating={isGenerating}
            onRegenerate={handleRegenerate}
            onEditMessage={handleEditMessage}
            onRetryLast={handleRetryLast}
            isDark={isDark}
          />
        ) : (
          <EmptyState
            onSelectPrompt={(prompt, research) => handleSendMessage(prompt, research || false, [])}
            isDark={isDark}
          />
        )}

        {/* Interactive Nova Core (renders while generating near composer) */}
        <InteractiveNovaCore
          isGenerating={isGenerating}
          isDark={isDark}
        />

        {/* Floating Pill Composer with Ignition Ring Sweep */}
        <ChatInput
          onSend={handleSendMessage}
          onStop={handleStopGeneration}
          isGenerating={isGenerating}
          isDark={isDark}
        />
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={themeMode}
        onThemeChange={setThemeMode}
        onClearAllConversations={handleClearAllConversations}
        usageCount={usageCount}
        maxUsage={maxUsage}
        onResetUsage={() => setUsageCount(0)}
        simulateErrorNext={simulateErrorNext}
        onToggleSimulateError={() => setSimulateErrorNext(!simulateErrorNext)}
      />

      {/* Sign In Screen Modal */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        currentUser={user}
        onSignInMock={(name, email) => setUser({ name, email })}
        isDark={isDark}
      />
    </div>
  );
}
