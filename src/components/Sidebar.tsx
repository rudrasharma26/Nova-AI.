import React, { useState } from 'react';
import {
  Plus,
  Search,
  Settings,
  Trash2,
  Edit2,
  Check,
  X,
  MessageSquare,
} from 'lucide-react';
import { Conversation, formatRelativeTime } from '../utils/chatLogic';
import { BrandLogo } from './BrandLogo';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onOpenSettings: () => void;
  onOpenSignIn: () => void;
  user: { name: string; email: string; avatarUrl?: string };
  usageCount: number;
  maxUsage: number;
  isOpen: boolean;
  onToggleSidebar: () => void;
  isDark?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  searchQuery,
  onSearchChange,
  onSelectConversation,
  onNewConversation,
  onRenameConversation,
  onDeleteConversation,
  onOpenSettings,
  onOpenSignIn,
  user,
  usageCount,
  maxUsage,
  isOpen,
  onToggleSidebar,
  isDark = false,
}) => {
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitleDraft, setEditTitleDraft] = useState('');

  const startRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConvId(conv.id);
    setEditTitleDraft(conv.title);
  };

  const submitRename = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitleDraft.trim()) {
      onRenameConversation(id, editTitleDraft.trim());
    }
    setEditingConvId(null);
  };

  const cancelRename = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingConvId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteConversation(id);
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          onClick={onToggleSidebar}
          className="fixed inset-0 z-40 bg-black/40 md:hidden backdrop-blur-sm"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel: single personal account, frosted glass surface with tight structural radius ~8px */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-72 bg-[#FFFFFF]/90 dark:bg-[#121318]/90 backdrop-blur-xl border-r border-[#E4E2DC]/80 dark:border-[#24262D]/80 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header: Nova brand mark + name */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#E4E2DC]/80 dark:border-[#24262D]/80">
          <div className="flex items-center gap-2.5">
            <BrandLogo size={28} isDark={isDark} />
            <div className="flex flex-col">
              <span className="font-semibold text-base tracking-tight text-[#15161A] dark:text-[#EDECE8]">
                Nova
              </span>
            </div>
          </div>
        </div>

        {/* Primary Action: New Chat button with hover micro-interaction */}
        <div className="p-3">
          <button
            onClick={onNewConversation}
            className="flex items-center justify-center gap-2 w-full px-3.5 py-2.5 rounded-lg bg-[#5B47E0] dark:bg-[#8577FF] text-white font-medium text-xs shadow-xs hover:opacity-95 hover:shadow-md active:scale-[0.98] transition-all duration-150"
            aria-label="New chat"
          >
            <Plus className="w-4 h-4" />
            <span>New chat</span>
          </button>
        </div>

        {/* Search Field with clear */}
        <div className="px-3 pb-2">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-[#5A5C66] dark:text-[#9A9CA6]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-[#F7F6F3]/80 dark:bg-[#0B0C10]/80 border border-[#E4E2DC] dark:border-[#24262D] text-[#15161A] dark:text-[#EDECE8] placeholder-[#5A5C66] dark:placeholder-[#9A9CA6] outline-none focus:border-[#5B47E0] dark:focus:border-[#8577FF] transition-colors"
              aria-label="Search conversations"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 text-[#5A5C66] dark:text-[#9A9CA6] hover:text-[#15161A] dark:hover:text-[#EDECE8]"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
          {conversations.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-[#5A5C66] dark:text-[#9A9CA6]">
              {searchQuery ? (
                <>
                  <p className="font-medium text-[#15161A] dark:text-[#EDECE8] mb-1">No results</p>
                  <p>No conversations matched &quot;{searchQuery}&quot;</p>
                </>
              ) : (
                <>
                  <MessageSquare className="w-6 h-6 mx-auto mb-2 text-[#5A5C66] dark:text-[#9A9CA6] opacity-40" />
                  <p className="font-medium text-[#15161A] dark:text-[#EDECE8] mb-0.5">No conversations yet</p>
                  <p>Click &quot;New chat&quot; to begin your first thread</p>
                </>
              )}
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeId;
              const isRenaming = editingConvId === conv.id;

              if (isRenaming) {
                return (
                  <form
                    key={conv.id}
                    onSubmit={(e) => submitRename(conv.id, e)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F7F6F3] dark:bg-[#0B0C10] border border-[#5B47E0] dark:border-[#8577FF]"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={editTitleDraft}
                      onChange={(e) => setEditTitleDraft(e.target.value)}
                      className="flex-1 bg-transparent text-xs text-[#15161A] dark:text-[#EDECE8] outline-none"
                      aria-label="Conversation title input"
                    />
                    <button
                      type="submit"
                      className="p-1 text-[#5B47E0] dark:text-[#8577FF] hover:opacity-80"
                      aria-label="Confirm rename"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelRename}
                      className="p-1 text-[#5A5C66] dark:text-[#9A9CA6] hover:text-[#15161A] dark:hover:text-[#EDECE8]"
                      aria-label="Cancel rename"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                );
              }

              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 text-xs ${
                    isActive
                      ? 'bg-[#F7F6F3] dark:bg-[#0B0C10] text-[#15161A] dark:text-[#EDECE8] font-medium shadow-xs border-l-2 border-[#5B47E0] dark:border-[#8577FF]'
                      : 'text-[#5A5C66] dark:text-[#9A9CA6] hover:bg-[#F7F6F3]/70 dark:hover:bg-[#0B0C10]/70 hover:text-[#15161A] dark:hover:text-[#EDECE8]'
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-selected={isActive}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="truncate text-xs font-medium text-[#15161A] dark:text-[#EDECE8]">
                      {conv.title}
                    </div>
                    <div className="text-[11px] text-[#5A5C66] dark:text-[#9A9CA6] mt-0.5">
                      {formatRelativeTime(conv.updatedAt)}
                    </div>
                  </div>

                  {/* Actions on hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => startRename(conv, e)}
                      className="p-1 rounded hover:bg-[#E4E2DC]/60 dark:hover:bg-[#24262D] text-[#5A5C66] dark:text-[#9A9CA6] hover:text-[#15161A] dark:hover:text-[#EDECE8] transition-colors"
                      title="Rename conversation"
                      aria-label={`Rename ${conv.title}`}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(conv.id, e)}
                      className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/40 text-[#5A5C66] dark:text-[#9A9CA6] hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      title="Delete conversation"
                      aria-label={`Delete ${conv.title}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer: Usage indicator + User avatar + Settings icon */}
        <div className="p-3 border-t border-[#E4E2DC]/80 dark:border-[#24262D]/80 bg-[#FFFFFF]/80 dark:bg-[#121318]/80 backdrop-blur-md space-y-2.5">
          {/* Visible Usage Indicator */}
          <div className="px-1">
            <div className="flex items-center justify-between text-[11px] text-[#5A5C66] dark:text-[#9A9CA6] mb-1">
              <span>Messages</span>
              <span className="font-mono text-[#15161A] dark:text-[#EDECE8]">
                {usageCount}/{maxUsage} today
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#E4E2DC] dark:bg-[#24262D] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#5B47E0] dark:bg-[#8577FF] transition-all duration-300"
                style={{ width: `${Math.min(100, (usageCount / maxUsage) * 100)}%` }}
              />
            </div>
          </div>

          {/* User profile & Settings */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={onOpenSignIn}
              className="flex items-center gap-2 min-w-0 text-left p-1.5 rounded-lg hover:bg-[#F7F6F3] dark:hover:bg-[#0B0C10] transition-colors"
              title="Account / Sign in details"
              aria-label="View user profile"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#5B47E0] to-[#8577FF] text-white flex items-center justify-center font-medium text-xs shrink-0 shadow-xs">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-[#15161A] dark:text-[#EDECE8] truncate max-w-[120px]">
                  {user.name}
                </div>
                <div className="text-[10px] text-[#5A5C66] dark:text-[#9A9CA6] truncate max-w-[120px]">
                  {user.email}
                </div>
              </div>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg text-[#5A5C66] dark:text-[#9A9CA6] hover:text-[#15161A] dark:hover:text-[#EDECE8] hover:bg-[#F7F6F3] dark:hover:bg-[#0B0C10] transition-colors"
              title="Settings"
              aria-label="Open settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
