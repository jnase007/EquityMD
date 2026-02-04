import React, { useState, useEffect, useRef, useCallback } from 'react';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { Send, Building2, User, Check, CheckCheck, Smile, Paperclip, Mic, MoreVertical, Reply, Copy, Trash2, Image } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  deal_id?: string;
  deal?: {
    id: string;
    title: string;
    slug: string;
  };
}

interface MessageThreadProps {
  recipientId: string;
  recipientName: string;
  recipientType: 'investor' | 'syndicator';
  recipientAvatar?: string;
  isOnline?: boolean;
  dealContext?: {
    deal_id: string;
    deal_title: string;
  };
  onTypingChange?: (isTyping: boolean) => void;
}

// Quick reply templates
const quickReplies = [
  { id: 1, text: "Thanks for reaching out! I'll review and get back to you shortly.", icon: "👋" },
  { id: 2, text: "I'm interested in learning more. When would be a good time to connect?", icon: "📅" },
  { id: 3, text: "Could you please send me the investment deck?", icon: "📊" },
  { id: 4, text: "Thank you for the information. I need some time to review.", icon: "🤔" },
];

export function MessageThread({ 
  recipientId, 
  recipientName, 
  recipientType, 
  recipientAvatar,
  isOnline = false,
  dealContext,
  onTypingChange 
}: MessageThreadProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingUpdateRef = useRef<number>(0);

  // Sound for new messages
  const playMessageSound = useCallback(() => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1sbGtpaXB4g4+am5WOhoaLkZWSkImDgIGEiIuMjImFgoKDhYeIiIeGhISEhIWFhYWEg4ODg4ODg4OCgoKCgoKBgYGBgYGBgYGBgYGBgYGBgYGBgQ==');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore errors if audio can't play
    } catch (e) {
      // Ignore audio errors
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchMessages();
      const unsubscribe = subscribeToMessages();
      markMessagesAsRead();
      
      return unsubscribe;
    }
  }, [user, recipientId]);

  // Typing indicator - broadcast when user is typing
  const handleTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTypingUpdateRef.current > 2000) {
      lastTypingUpdateRef.current = now;
      // Broadcast typing status via Supabase Realtime
      supabase.channel(`typing-${recipientId}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: user?.id, isTyping: true }
      });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      supabase.channel(`typing-${recipientId}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: user?.id, isTyping: false }
      });
    }, 3000);
  }, [recipientId, user?.id]);

  // Subscribe to typing indicator
  useEffect(() => {
    const channel = supabase.channel(`typing-${user?.id}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.userId === recipientId) {
          setIsTyping(payload.payload.isTyping);
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [recipientId, user?.id]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          deal:deals(
            id,
            title,
            slug
          )
        `)
        .or(`and(sender_id.eq.${user!.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${user!.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }

  function subscribeToMessages() {
    const subscription = supabase
      .channel(`messages-${recipientId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, async (payload) => {
        const newMessage = payload.new as Message;
        
        const isRelevant = (newMessage.sender_id === user!.id && newMessage.receiver_id === recipientId) ||
                          (newMessage.sender_id === recipientId && newMessage.receiver_id === user!.id);
        
        if (!isRelevant) return;
        if (newMessage.id.toString().startsWith('temp-')) return;
        
        // Play sound for incoming messages
        if (newMessage.sender_id === recipientId) {
          playMessageSound();
        }

        setMessages(prevMessages => {
          const messageExists = prevMessages.some(msg => msg.id === newMessage.id);
          if (messageExists) return prevMessages;
          
          // Fetch complete message with deal info
          (async () => {
            try {
              const { data, error } = await supabase
                .from('messages')
                .select(`*, deal:deals(id, title, slug)`)
                .eq('id', newMessage.id)
                .single();

              if (error) throw error;
              
              setMessages(currentMessages => 
                currentMessages.map(msg => 
                  msg.id === newMessage.id ? data : msg
                )
              );
              
              if (newMessage.receiver_id === user!.id) {
                markMessageAsRead(newMessage.id);
              }
            } catch (error) {
              console.error('Error fetching new message details:', error);
            }
          })();
          
          return [...prevMessages, newMessage];
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        const updatedMessage = payload.new as Message;
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === updatedMessage.id ? { ...msg, read: updatedMessage.read } : msg
          )
        );
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  async function markMessagesAsRead() {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('receiver_id', user!.id)
        .eq('sender_id', recipientId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  async function markMessageAsRead(messageId: string) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId)
        .eq('receiver_id', user!.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e as any);
    }
  };

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setLoading(true);
    setShowQuickReplies(false);

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      sender_id: user.id,
      receiver_id: recipientId,
      content: messageContent,
      created_at: new Date().toISOString(),
      read: false,
      deal_id: dealContext?.deal_id,
      deal: dealContext ? {
        id: dealContext.deal_id,
        title: dealContext.deal_title,
        slug: ''
      } : undefined
    };

    setMessages(prevMessages => [...prevMessages, optimisticMessage]);

    try {
      const messageData: any = {
        sender_id: user.id,
        receiver_id: recipientId,
        content: messageContent,
        read: false
      };

      if (dealContext) {
        messageData.deal_id = dealContext.deal_id;
      }

      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select(`*, deal:deals(id, title, slug)`)
        .single();

      if (error) throw error;

      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === optimisticMessage.id ? data : msg
        )
      );

      // Send email notification to recipient
      try {
        // Get recipient's profile for email and preferences
        const { data: recipientProfile } = await supabase
          .from('profiles')
          .select('email, email_notifications, full_name')
          .eq('id', recipientId)
          .single();
        
        // Check if user has message notifications enabled (default to true)
        const notifications = recipientProfile?.email_notifications;
        const shouldSendEmail = !notifications || notifications.messages !== false;
        
        if (shouldSendEmail && recipientProfile?.email) {
          // Get sender's profile info
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('full_name, user_type')
            .eq('id', user.id)
            .single();
          
          // Send email notification via edge function
          await supabase.functions.invoke('send-email', {
            body: {
              to: recipientProfile.email,
              type: 'new_message',
              data: {
                senderName: senderProfile?.full_name || 'A User',
                senderType: senderProfile?.user_type || 'user',
                messagePreview: messageContent.substring(0, 200),
                dealTitle: dealContext?.deal_title,
                dealSlug: data?.deal?.slug,
                timestamp: new Date().toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              }
            }
          });
          console.log('Message notification email sent to:', recipientProfile.email);
        }
      } catch (emailError) {
        // Don't block on email failure - log and continue
        console.error('Failed to send message notification email:', emailError);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== optimisticMessage.id)
      );
      setNewMessage(messageContent);
    } finally {
      setLoading(false);
    }
  }

  const handleQuickReply = (text: string) => {
    setNewMessage(text);
    setShowQuickReplies(false);
    inputRef.current?.focus();
  };

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    messages.forEach(msg => {
      const msgDate = new Date(msg.created_at);
      let dateLabel = '';
      
      if (isToday(msgDate)) {
        dateLabel = 'Today';
      } else if (isYesterday(msgDate)) {
        dateLabel = 'Yesterday';
      } else {
        dateLabel = format(msgDate, 'MMMM d, yyyy');
      }

      if (dateLabel !== currentDate) {
        currentDate = dateLabel;
        groups.push({ date: dateLabel, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4">
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {/* Date Separator */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                {group.date}
              </div>
            </div>

            {/* Messages for this date */}
            <div className="space-y-3">
              {group.messages.map((message, index) => {
                const isOwn = message.sender_id === user!.id;
                const showAvatar = index === 0 || 
                  group.messages[index - 1]?.sender_id !== message.sender_id;
                const isLastInGroup = index === group.messages.length - 1 || 
                  group.messages[index + 1]?.sender_id !== message.sender_id;

                return (
                  <div
                    key={message.id}
                    className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Avatar for received messages */}
                    {!isOwn && (
                      <div className={`w-8 h-8 flex-shrink-0 ${showAvatar ? '' : 'invisible'}`}>
                        {recipientAvatar ? (
                          <img
                            src={recipientAvatar}
                            alt={recipientName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {recipientName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`group relative max-w-[70%] ${
                        isOwn
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-br-md'
                          : 'bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-sm border border-gray-100'
                      } px-4 py-2.5`}
                    >
                      {/* Deal context badge */}
                      {message.deal && (
                        <div className={`text-xs mb-1.5 flex items-center gap-1 ${
                          isOwn ? 'text-blue-200' : 'text-blue-600'
                        }`}>
                          <Building2 className="h-3 w-3" />
                          <span className="font-medium">{message.deal.title}</span>
                        </div>
                      )}

                      {/* Message content */}
                      <p className="break-words text-[15px] leading-relaxed">{message.content}</p>

                      {/* Timestamp & Read Receipt */}
                      <div className={`flex items-center gap-1 mt-1 ${
                        isOwn ? 'justify-end' : 'justify-start'
                      }`}>
                        <span className={`text-[10px] ${
                          isOwn ? 'text-blue-200' : 'text-gray-400'
                        }`}>
                          {format(new Date(message.created_at), 'h:mm a')}
                        </span>
                        
                        {/* Read receipt for sent messages */}
                        {isOwn && (
                          <span className="ml-0.5">
                            {message.read ? (
                              <CheckCheck className="h-3.5 w-3.5 text-blue-200" />
                            ) : (
                              <Check className="h-3.5 w-3.5 text-blue-300" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Spacer for own messages (to align with avatar space) */}
                    {isOwn && <div className="w-8 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 mt-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {recipientName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies Panel */}
      {showQuickReplies && (
        <div className="border-t bg-white p-3">
          <div className="text-xs text-gray-500 mb-2 font-medium">Quick Replies</div>
          <div className="grid grid-cols-2 gap-2">
            {quickReplies.map((reply) => (
              <button
                key={reply.id}
                onClick={() => handleQuickReply(reply.text)}
                className="text-left p-3 bg-gray-50 hover:bg-blue-50 rounded-xl text-sm text-gray-700 hover:text-blue-700 transition-colors border border-gray-100 hover:border-blue-200"
              >
                <span className="mr-2">{reply.icon}</span>
                {reply.text.substring(0, 50)}...
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 bg-white border-t">
        <form onSubmit={sendMessage} className="flex items-end gap-2">
          {/* Quick Reply Toggle */}
          <button
            type="button"
            onClick={() => setShowQuickReplies(!showQuickReplies)}
            className={`p-2.5 rounded-xl transition-colors ${
              showQuickReplies 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="Quick Replies"
          >
            <Reply className="h-5 w-5" />
          </button>

          {/* Input Field */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all pr-12"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="text-[10px] text-gray-400">⌘↵</span>
            </div>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>

        {/* Keyboard shortcut hint */}
        <div className="text-center mt-2">
          <span className="text-[11px] text-gray-400">
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-mono text-[10px]">Enter</kbd> to send
          </span>
        </div>
      </div>
    </div>
  );
}
