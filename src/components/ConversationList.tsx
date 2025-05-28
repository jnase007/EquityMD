import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Building2, User } from 'lucide-react';

interface Conversation {
  userId: string;
  userName: string;
  userType: 'investor' | 'syndicator';
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
  avatarUrl?: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedUserId: string | null;
  onSelectConversation: (userId: string) => void;
}

export function ConversationList({ conversations, selectedUserId, onSelectConversation }: ConversationListProps) {
  return (
    <div className="overflow-y-auto h-full">
      {conversations.map((conv) => (
        <div
          key={conv.userId}
          onClick={() => onSelectConversation(conv.userId)}
          className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
            selectedUserId === conv.userId ? 'bg-blue-50' : ''
          }`}
        >
          <div className="flex items-start">
            {conv.avatarUrl ? (
              <img
                src={conv.avatarUrl}
                alt={conv.userName}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                {conv.userType === 'syndicator' ? (
                  <Building2 className="h-5 w-5 text-blue-600" />
                ) : (
                  <User className="h-5 w-5 text-blue-600" />
                )}
              </div>
            )}
            <div className="ml-3 flex-1">
              <div className="flex justify-between items-start">
                <div className="font-medium">{conv.userName}</div>
                <div className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(conv.lastMessageDate), { addSuffix: true })}
                </div>
              </div>
              <div className="text-sm text-gray-600 line-clamp-1">
                {conv.lastMessage}
              </div>
            </div>
            {conv.unreadCount > 0 && (
              <div className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {conv.unreadCount}
              </div>
            )}
          </div>
        </div>
      ))}

      {conversations.length === 0 && (
        <div className="p-4 text-center text-gray-500">
          No conversations yet
        </div>
      )}
    </div>
  );
}