import React, { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Send, Building2, User } from 'lucide-react';
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
  dealContext?: {
    deal_id: string;
    deal_title: string;
  };
}

export function MessageThread({ recipientId, recipientName, recipientType, dealContext }: MessageThreadProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchMessages();
      const unsubscribe = subscribeToMessages();
      markMessagesAsRead();
      
      return unsubscribe;
    }
  }, [user, recipientId]);

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
        
        // Check if this message is relevant to this conversation
        const isRelevant = (newMessage.sender_id === user!.id && newMessage.receiver_id === recipientId) ||
                          (newMessage.sender_id === recipientId && newMessage.receiver_id === user!.id);
        
        if (!isRelevant) {
          return;
        }
        
        // Skip if this is an optimistic message we already added
        if (newMessage.id.toString().startsWith('temp-')) {
          return;
        }
        
        // Check if message already exists in our state (to prevent duplicates)
        setMessages(prevMessages => {
          const messageExists = prevMessages.some(msg => msg.id === newMessage.id);
          if (messageExists) {
            return prevMessages;
          }
          
          // Fetch complete message with deal information in the background
          (async () => {
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
                .eq('id', newMessage.id)
                .single();

              if (error) throw error;
              
              // Update the message with complete data
              setMessages(currentMessages => 
                currentMessages.map(msg => 
                  msg.id === newMessage.id ? data : msg
                )
              );
              
              // Mark as read if user is the receiver
              if (newMessage.receiver_id === user!.id) {
                markMessageAsRead(newMessage.id);
              }
            } catch (error) {
              console.error('Error fetching new message details:', error);
            }
          })();
          
          // Add the basic message immediately
          return [...prevMessages, newMessage];
        });
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

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setLoading(true);

    // Create optimistic message for immediate UI update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`, // Temporary ID
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

    // Add optimistic message to UI immediately
    setMessages(prevMessages => [...prevMessages, optimisticMessage]);

    try {
      const messageData: any = {
        sender_id: user.id,
        receiver_id: recipientId,
        content: messageContent,
        read: false
      };

      // Only add deal context if provided
      if (dealContext) {
        messageData.deal_id = dealContext.deal_id;
      }

      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select(`
          *,
          deal:deals(
            id,
            title,
            slug
          )
        `)
        .single();

      if (error) throw error;

      // Replace optimistic message with real message from server
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === optimisticMessage.id ? data : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
      
      // Remove optimistic message on error
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== optimisticMessage.id)
      );
      
      // Restore message content
      setNewMessage(messageContent);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === user!.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender_id === user!.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.deal && (
                <div className={`text-sm mb-2 ${
                  message.sender_id === user!.id ? 'text-blue-100' : 'text-blue-600'
                }`}>
                  Re: {message.deal.title}
                </div>
              )}
              <p className="break-words">{message.content}</p>
              <div
                className={`text-xs mt-1 ${
                  message.sender_id === user!.id ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t flex-shrink-0">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}