import React, { useState } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { Building2, Pin, Archive } from 'lucide-react';

interface Conversation {
  userId: string;
  userName: string;
  userType: 'investor' | 'syndicator';
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
  avatarUrl?: string;
  isOnline?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  dealContext?: {
    deal_id: string;
    deal_title: string;
    deal_slug?: string;
  };
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedUserId: string | null;
  onSelectConversation: (userId: string) => void;
  onPinConversation?: (userId: string) => void;
  onArchiveConversation?: (userId: string) => void;
}

function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return format(date, 'h:mm a');
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'MMM d');
  }
}

export function ConversationList({ 
  conversations, 
  selectedUserId, 
  onSelectConversation,
  onPinConversation,
  onArchiveConversation 
}: ConversationListProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Sort: pinned first, then by date
  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime();
  });

  // Filter out archived unless explicitly showing them
  const visibleConversations = sortedConversations.filter(c => !c.isArchived);

  return (
    <div className="h-full overflow-y-auto">
      {visibleConversations.map((conv) => (
        <div
          key={conv.userId}
          onClick={() => onSelectConversation(conv.userId)}
          onMouseEnter={() => setHoveredId(conv.userId)}
          onMouseLeave={() => {
            setHoveredId(null);
            setShowActionsId(null);
          }}
          className={`relative p-4 cursor-pointer transition-all duration-150 border-b border-gray-100 ${
            selectedUserId === conv.userId 
              ? 'bg-blue-50 border-l-4 border-l-blue-600' 
              : 'hover:bg-gray-50 border-l-4 border-l-transparent'
          }`}
        >
          {/* Pinned indicator */}
          {conv.isPinned && (
            <div className="absolute top-2 right-2">
              <Pin className="h-3 w-3 text-blue-500 fill-blue-500" />
            </div>
          )}

          <div className="flex items-start gap-3">
            {/* Avatar with online indicator */}
            <div className="relative flex-shrink-0">
              {conv.avatarUrl ? (
                <img
                  src={conv.avatarUrl}
                  alt={conv.userName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
              ) : (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white ${
                  conv.userType === 'syndicator' 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                }`}>
                  {conv.userType === 'syndicator' ? (
                    <Building2 className="h-5 w-5 text-white" />
                  ) : (
                    <span className="text-white font-semibold text-lg">
                      {conv.userName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              )}
              
              {/* Online status indicator */}
              {conv.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header row */}
              <div className="flex justify-between items-center mb-0.5">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold truncate ${
                    conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {conv.userName}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    conv.userType === 'syndicator' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {conv.userType === 'syndicator' ? 'Syndicator' : 'Investor'}
                  </span>
                </div>
                <span className={`text-xs flex-shrink-0 ${
                  conv.unreadCount > 0 ? 'text-blue-600 font-semibold' : 'text-gray-400'
                }`}>
                  {formatMessageTime(conv.lastMessageDate)}
                </span>
              </div>

              {/* Deal context */}
              {conv.dealContext && (
                <div className="flex items-center gap-1 mb-1">
                  <Building2 className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium truncate">
                    {conv.dealContext.deal_title}
                  </span>
                </div>
              )}

              {/* Last message preview */}
              <div className="flex items-center gap-2">
                <p className={`text-sm truncate flex-1 ${
                  conv.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}>
                  {conv.lastMessage}
                </p>

                {/* Unread badge */}
                {conv.unreadCount > 0 && (
                  <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions (on hover) */}
          {hoveredId === conv.userId && (onPinConversation || onArchiveConversation) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white shadow-lg rounded-lg p-1 border border-gray-200">
              {onPinConversation && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPinConversation(conv.userId);
                  }}
                  className={`p-1.5 rounded-md transition-colors ${
                    conv.isPinned 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  title={conv.isPinned ? 'Unpin' : 'Pin'}
                >
                  <Pin className="h-4 w-4" />
                </button>
              )}
              {onArchiveConversation && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchiveConversation(conv.userId);
                  }}
                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  title="Archive"
                >
                  <Archive className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Empty State */}
      {visibleConversations.length === 0 && (
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">No conversations yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Start by browsing deals and reaching out to syndicators you're interested in.
          </p>
          <a 
            href="/find"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Browse Deals
            <span>→</span>
          </a>
        </div>
      )}
    </div>
  );
}
