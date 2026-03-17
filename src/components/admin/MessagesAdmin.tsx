import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Building2, User, ChevronRight, ExternalLink } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface MessageWithDetails {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  deal_id: string | null;
  sender: { full_name: string; email: string; user_type: string } | null;
  receiver: { full_name: string; email: string; user_type: string } | null;
  deal: { id: string; title: string; slug: string } | null;
}

export function MessagesAdmin() {
  const [messages, setMessages] = useState<MessageWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'investor-syndicator' | 'syndicator-investor'>('all');
  const [conversationView, setConversationView] = useState<{ senderId: string; receiverId: string } | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      setLoading(true);
      setError(null);

      // Fetch messages first (no joins - avoids FK/RLS issues)
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, content, read, created_at, deal_id')
        .order('created_at', { ascending: false })
        .limit(500);

      if (messagesError) throw messagesError;

      const rawMessages = (messagesData || []) as Array<{
        id: string;
        sender_id: string;
        receiver_id: string;
        content: string;
        read: boolean;
        created_at: string;
        deal_id: string | null;
      }>;

      if (rawMessages.length === 0) {
        setMessages([]);
        setLoading(false);
        return;
      }

      // Fetch profiles for all unique sender/receiver IDs
      const profileIds = [...new Set([...rawMessages.map((m) => m.sender_id), ...rawMessages.map((m) => m.receiver_id)])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email, user_type')
        .in('id', profileIds);

      const profilesMap = new Map((profilesData || []).map((p) => [p.id, p]));

      // Fetch deals for all unique deal_ids
      const dealIds = [...new Set(rawMessages.map((m) => m.deal_id).filter(Boolean))] as string[];
      let dealsMap = new Map<string, { id: string; title: string; slug: string }>();
      if (dealIds.length > 0) {
        const { data: dealsData } = await supabase.from('deals').select('id, title, slug').in('id', dealIds);
        dealsMap = new Map((dealsData || []).map((d) => [d.id, d]));
      }

      const enriched: MessageWithDetails[] = rawMessages.map((m) => ({
        ...m,
        sender: profilesMap.get(m.sender_id) || null,
        receiver: profilesMap.get(m.receiver_id) || null,
        deal: m.deal_id ? dealsMap.get(m.deal_id) || null : null,
      }));

      setMessages(enriched);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load messages. Ensure the admin migration is applied: run the SQL in supabase/migrations/20260221000001_admin_messages_policy.sql'
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredMessages = messages.filter((msg) => {
    const senderName = msg.sender?.full_name || msg.sender?.email || '';
    const receiverName = msg.receiver?.full_name || msg.receiver?.email || '';
    const content = msg.content || '';
    const dealTitle = msg.deal?.title || '';

    const matchesSearch =
      !searchTerm ||
      senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dealTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === 'all' ||
      (filter === 'investor-syndicator' && msg.sender?.user_type === 'investor' && msg.receiver?.user_type === 'syndicator') ||
      (filter === 'syndicator-investor' && msg.sender?.user_type === 'syndicator' && msg.receiver?.user_type === 'investor');

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 font-medium">{error}</p>
        <button
          onClick={fetchMessages}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-xl font-bold text-gray-900">All Site Communications</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, content, deal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All messages</option>
            <option value="investor-syndicator">Investor → Syndicator</option>
            <option value="syndicator-investor">Syndicator → Investor</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMessages.slice(0, 100).map((msg) => (
                <tr key={msg.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.sender?.user_type === 'syndicator' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                        {msg.sender?.user_type === 'syndicator' ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{msg.sender?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{msg.sender?.email}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${msg.sender?.user_type === 'syndicator' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {msg.sender?.user_type || '—'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.receiver?.user_type === 'syndicator' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                        {msg.receiver?.user_type === 'syndicator' ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{msg.receiver?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{msg.receiver?.email}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${msg.receiver?.user_type === 'syndicator' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {msg.receiver?.user_type || '—'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {msg.deal ? (
                      <a
                        href={`/deals/${msg.deal.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {msg.deal.title}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-sm text-gray-700 truncate" title={msg.content}>
                      {msg.content || '—'}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {format(new Date(msg.created_at), 'MMM d, yyyy')}
                    <br />
                    <span className="text-xs">{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setConversationView({ senderId: msg.sender_id, receiverId: msg.receiver_id })}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                    >
                      View thread
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMessages.length > 100 && (
          <div className="px-4 py-3 bg-gray-50 text-sm text-gray-600">
            Showing 100 of {filteredMessages.length} messages. Use search to narrow results.
          </div>
        )}

        {filteredMessages.length === 0 && (
          <div className="px-4 py-12 text-center">
            <p className="text-gray-500 mb-2">
              No messages found. {searchTerm || filter !== 'all' ? 'Try adjusting your filters.' : 'No communications have been sent yet.'}
            </p>
            <p className="text-sm text-gray-400">
              If you expected to see messages, ensure the admin policy migration has been applied to Supabase (see 20260221000001_admin_messages_policy.sql).
            </p>
          </div>
        )}
      </div>

      {/* Conversation modal */}
      {conversationView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setConversationView(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Conversation Thread</h3>
              <button onClick={() => setConversationView(null)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
              {messages
                .filter((m) => (m.sender_id === conversationView.senderId && m.receiver_id === conversationView.receiverId) || (m.sender_id === conversationView.receiverId && m.receiver_id === conversationView.senderId))
                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                .map((m) => (
                  <div key={m.id} className={`p-3 rounded-lg ${m.sender_id === conversationView.senderId ? 'bg-blue-50 ml-0 mr-8' : 'bg-gray-100 mr-0 ml-8'}`}>
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      {m.sender?.full_name || m.sender?.email} → {m.receiver?.full_name || m.receiver?.email}
                      {m.deal && ` · Re: ${m.deal.title}`}
                    </p>
                    <p className="text-gray-900">{m.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{format(new Date(m.created_at), 'MMM d, yyyy h:mm a')}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
