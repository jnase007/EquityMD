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
  deal_title?: string;
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

  useEffect(() => {
    if (user) {
      fetchMessages();
      subscribeToMessages();
      markMessagesAsRead();
    }
  }, [user, recipientId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
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
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user!.id}`
      }, () => {
        fetchMessages();
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

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setLoading(true);
    try {
      const messageData = {
        sender_id: user.id,
        receiver_id: recipientId,
        content: newMessage.trim(),
        read: false
      };

      // Only add deal context if provided
      if (dealContext) {
        messageData.deal_id = dealContext.deal_id;
        messageData.deal_title = dealContext.deal_title;
      }

      const { error } = await supabase
        .from('messages')
        .insert([messageData]);

      if (error) throw error;

      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
              {message.deal_title && (
                <div className={`text-sm mb-2 ${
                  message.sender_id === user!.id ? 'text-blue-100' : 'text-blue-600'
                }`}>
                  Re: {message.deal_title}
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
      <div className="p-4 border-t">
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