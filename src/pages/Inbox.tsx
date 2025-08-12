import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Search, ArrowLeft, Building2 } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ConversationList } from '../components/ConversationList';
import { MessageThread } from '../components/MessageThread';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';

interface Conversation {
  userId: string;
  userName: string;
  userType: 'investor' | 'syndicator';
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
  avatarUrl?: string;
  dealContext?: {
    deal_id: string;
    deal_title: string;
    deal_slug?: string;
  };
}

export function Inbox() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [selectedUserType, setSelectedUserType] = useState<'investor' | 'syndicator'>('investor');
  const [selectedDealContext, setSelectedDealContext] = useState<{deal_id: string; deal_title: string; deal_slug?: string} | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileThread, setShowMobileThread] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversations();
      
      // Subscribe to new messages
      const messagesSubscription = supabase
        .channel('messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        }, () => {
          fetchConversations();
        })
        .subscribe();

      return () => {
        messagesSubscription.unsubscribe();
      };
    }
  }, [user]);

  async function fetchConversations() {
    if (!user) return;

    try {
      // Get all messages where user is either sender or receiver, including deal information
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          receiver_id,
          content,
          read,
          created_at,
          deal_id,
          sender:profiles!messages_sender_id_fkey(
            full_name,
            avatar_url,
            user_type
          ),
          receiver:profiles!messages_receiver_id_fkey(
            full_name,
            avatar_url,
            user_type
          ),
          deal:deals(
            id,
            title,
            slug
          )
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Group messages by conversation partner
      const conversationsMap = new Map<string, Conversation>();
      
      messagesData?.forEach(message => {
        const isUserSender = message.sender_id === user.id;
        const partnerId = isUserSender ? message.receiver_id : message.sender_id;
        const partner = isUserSender ? message.receiver : message.sender;

        if (!conversationsMap.has(partnerId)) {
          // Use deal information from the deal_id foreign key relationship
          let dealContext = undefined;
          if (message.deal_id && message.deal) {
            dealContext = {
              deal_id: message.deal_id,
              deal_title: message.deal.title,
              deal_slug: message.deal.slug
            };
          }

          conversationsMap.set(partnerId, {
            userId: partnerId,
            userName: partner.full_name,
            userType: partner.user_type,
            lastMessage: message.content,
            lastMessageDate: message.created_at,
            unreadCount: !isUserSender && !message.read ? 1 : 0,
            avatarUrl: partner.avatar_url,
            dealContext
          });
        } else {
          const conv = conversationsMap.get(partnerId)!;
          
          // Update deal context if this message has deal info and conversation doesn't have it yet
          if (message.deal_id && message.deal && !conv.dealContext) {
            conv.dealContext = {
              deal_id: message.deal_id,
              deal_title: message.deal.title,
              deal_slug: message.deal.slug
            };
          }
          
          if (!isUserSender && !message.read) {
            conv.unreadCount++;
          }
        }
      });

      setConversations(Array.from(conversationsMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectConversation = (userId: string) => {
    const conversation = conversations.find(c => c.userId === userId);
    if (conversation) {
      setSelectedUserId(userId);
      setSelectedUserName(conversation.userName);
      setSelectedUserType(conversation.userType);
      setSelectedDealContext(conversation.dealContext);
      setShowMobileThread(true);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[700px] flex flex-col">
          <div className="flex h-full">
            {/* Conversations List */}
            <div className={`w-full md:w-1/3 border-r flex flex-col ${showMobileThread ? 'hidden md:flex' : 'flex'}`}>
              {/* Search Header */}
              <div className="p-4 border-b flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Conversations List with fixed scroll */}
              <div className="flex-1 overflow-hidden">
                <ConversationList
                  conversations={filteredConversations}
                  selectedUserId={selectedUserId}
                  onSelectConversation={handleSelectConversation}
                />
              </div>
            </div>

            {/* Message Thread */}
            <div className={`w-full md:w-2/3 flex flex-col ${showMobileThread ? 'flex' : 'hidden md:flex'}`}>
              {selectedUserId ? (
                <>
                  {/* Thread Header */}
                  <div className="p-4 border-b flex items-center flex-shrink-0">
                    <button
                      onClick={() => setShowMobileThread(false)}
                      className="md:hidden mr-3 text-gray-500 hover:text-gray-700"
                    >
                      <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div>
                      <div className="font-medium">{selectedUserName}</div>
                      <div className="text-sm text-gray-500">
                        {selectedUserType === 'syndicator' ? 'Syndicator' : 'Investor'}
                      </div>
                      {selectedDealContext && (
                        <div className="flex items-center gap-1 mt-1">
                          <Building2 className="h-3 w-3 text-blue-600" />
                          <span className="text-xs text-blue-600 font-medium">
                            Re: {selectedDealContext.deal_title}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message Thread with fixed height */}
                  <div className="flex-1 overflow-hidden">
                    <MessageThread
                      recipientId={selectedUserId}
                      recipientName={selectedUserName}
                      recipientType={selectedUserType}
                      dealContext={selectedDealContext}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}