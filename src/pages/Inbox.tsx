import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Search, ArrowLeft, Building2, Mail, Filter, Bell, Settings, MessageSquarePlus, Inbox as InboxIcon, Archive, Star, MoreVertical, RefreshCw, CheckCheck } from 'lucide-react';
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
  isOnline?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  dealContext?: {
    deal_id: string;
    deal_title: string;
    deal_slug?: string;
  };
}

type FilterType = 'all' | 'unread' | 'syndicators' | 'investors';

export function Inbox() {
  const { user, profile } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [selectedUserType, setSelectedUserType] = useState<'investor' | 'syndicator'>('investor');
  const [selectedUserAvatar, setSelectedUserAvatar] = useState<string | undefined>(undefined);
  const [selectedUserOnline, setSelectedUserOnline] = useState(false);
  const [selectedDealContext, setSelectedDealContext] = useState<{deal_id: string; deal_title: string; deal_slug?: string} | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileThread, setShowMobileThread] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [pinnedUsers, setPinnedUsers] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Track online presence
  useEffect(() => {
    if (!user) return;

    const presenceChannel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const online = new Set<string>();
        Object.keys(state).forEach(key => {
          online.add(key);
        });
        setOnlineUsers(online);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [user]);

  // Load pinned conversations from localStorage
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`pinned-conversations-${user.id}`);
      if (saved) {
        setPinnedUsers(new Set(JSON.parse(saved)));
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchConversations();
      
      const messagesSubscription = supabase
        .channel('inbox-updates')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`
        }, async (payload) => {
          const newMessage = payload.new as any;
          await updateConversationWithNewMessage(newMessage);
        })
        .subscribe();

      return () => {
        messagesSubscription.unsubscribe();
      };
    }
  }, [user]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchConversations();
    setTimeout(() => setIsRefreshing(false), 500);
  }, []);

  async function fetchConversations() {
    if (!user) return;

    try {
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

      const conversationsMap = new Map<string, Conversation>();
      
      messagesData?.forEach(message => {
        const isUserSender = message.sender_id === user.id;
        const partnerId = isUserSender ? message.receiver_id : message.sender_id;
        const partner = isUserSender ? message.receiver : message.sender;

        if (!conversationsMap.has(partnerId)) {
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
            isOnline: onlineUsers.has(partnerId),
            isPinned: pinnedUsers.has(partnerId),
            dealContext
          });
        } else {
          const conv = conversationsMap.get(partnerId)!;
          
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

      // Update online and pinned status
      const convArray = Array.from(conversationsMap.values()).map(conv => ({
        ...conv,
        isOnline: onlineUsers.has(conv.userId),
        isPinned: pinnedUsers.has(conv.userId)
      }));

      setConversations(convArray);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateConversationWithNewMessage(newMessage: any) {
    if (!user) return;

    try {
      const isUserSender = newMessage.sender_id === user.id;
      const partnerId = isUserSender ? newMessage.receiver_id : newMessage.sender_id;

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, user_type')
        .eq('id', partnerId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      let dealContext = undefined;
      if (newMessage.deal_id) {
        const { data: dealData, error: dealError } = await supabase
          .from('deals')
          .select('id, title, slug')
          .eq('id', newMessage.deal_id)
          .single();

        if (!dealError && dealData) {
          dealContext = {
            deal_id: dealData.id,
            deal_title: dealData.title,
            deal_slug: dealData.slug
          };
        }
      }

      setConversations(prevConversations => {
        const existingConvIndex = prevConversations.findIndex(conv => conv.userId === partnerId);
        
        if (existingConvIndex >= 0) {
          const updatedConversations = [...prevConversations];
          const existingConv = updatedConversations[existingConvIndex];
          
          updatedConversations[existingConvIndex] = {
            ...existingConv,
            lastMessage: newMessage.content,
            lastMessageDate: newMessage.created_at,
            unreadCount: !isUserSender && !newMessage.read ? 
              existingConv.unreadCount + 1 : existingConv.unreadCount,
            dealContext: dealContext || existingConv.dealContext
          };

          const [updatedConv] = updatedConversations.splice(existingConvIndex, 1);
          return [updatedConv, ...updatedConversations];
        } else {
          const newConversation: Conversation = {
            userId: partnerId,
            userName: profileData.full_name,
            userType: profileData.user_type,
            lastMessage: newMessage.content,
            lastMessageDate: newMessage.created_at,
            unreadCount: !isUserSender && !newMessage.read ? 1 : 0,
            avatarUrl: profileData.avatar_url,
            isOnline: onlineUsers.has(partnerId),
            isPinned: pinnedUsers.has(partnerId),
            dealContext
          };

          return [newConversation, ...prevConversations];
        }
      });
    } catch (error) {
      console.error('Error updating conversation:', error);
      fetchConversations();
    }
  }

  const handleSelectConversation = (userId: string) => {
    const conversation = conversations.find(c => c.userId === userId);
    if (conversation) {
      setSelectedUserId(userId);
      setSelectedUserName(conversation.userName);
      setSelectedUserType(conversation.userType);
      setSelectedUserAvatar(conversation.avatarUrl);
      setSelectedUserOnline(conversation.isOnline || false);
      setSelectedDealContext(conversation.dealContext);
      setShowMobileThread(true);

      // Mark as read in UI
      setConversations(prev => 
        prev.map(c => c.userId === userId ? { ...c, unreadCount: 0 } : c)
      );
    }
  };

  const handlePinConversation = (userId: string) => {
    setPinnedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      localStorage.setItem(`pinned-conversations-${user?.id}`, JSON.stringify([...newSet]));
      return newSet;
    });

    setConversations(prev => 
      prev.map(c => c.userId === userId ? { ...c, isPinned: !c.isPinned } : c)
    );
  };

  const handleMarkAllRead = async () => {
    if (!user || totalUnread === 0) return;

    // Update UI immediately for responsiveness
    setConversations(prev =>
      prev.map(c => ({ ...c, unreadCount: 0 }))
    );

    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('receiver_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking messages as read:', error);
        // Revert on error - refetch conversations
        fetchConversations();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Apply filters
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (filter) {
      case 'unread':
        return matchesSearch && conv.unreadCount > 0;
      case 'syndicators':
        return matchesSearch && conv.userType === 'syndicator';
      case 'investors':
        return matchesSearch && conv.userType === 'investor';
      default:
        return matchesSearch;
    }
  });

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              Messages
              {totalUnread > 0 && (
                <span className="bg-blue-600 text-white text-sm font-bold px-2.5 py-1 rounded-full">
                  {totalUnread}
                </span>
              )}
            </h1>
            <p className="text-gray-500 mt-1">Connect with syndicators and manage your investment conversations</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              disabled={totalUnread === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
            <button
              onClick={handleRefresh}
              className={`p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          <div className="flex h-[calc(100vh-220px)] min-h-[600px]">
            {/* Conversations Sidebar */}
            <div className={`w-full md:w-[380px] border-r border-gray-100 flex flex-col ${showMobileThread ? 'hidden md:flex' : 'flex'}`}>
              {/* Search & Filter Header */}
              <div className="p-4 border-b border-gray-100 space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
                  {[
                    { id: 'all', label: 'All', icon: InboxIcon },
                    { id: 'unread', label: 'Unread', icon: Bell },
                    { id: 'syndicators', label: 'Syndicators', icon: Building2 },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFilter(tab.id as FilterType)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                        filter === tab.id 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      {tab.id === 'unread' && totalUnread > 0 && (
                        <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                          {totalUnread}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <ConversationList
                    conversations={filteredConversations}
                    selectedUserId={selectedUserId}
                    onSelectConversation={handleSelectConversation}
                    onPinConversation={handlePinConversation}
                  />
                )}
              </div>
            </div>

            {/* Message Thread */}
            <div className={`flex-1 flex flex-col ${showMobileThread ? 'flex' : 'hidden md:flex'}`}>
              {selectedUserId ? (
                <>
                  {/* Thread Header */}
                  <div className="px-6 py-4 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setShowMobileThread(false)}
                        className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      
                      {/* Avatar */}
                      <div className="relative">
                        {selectedUserAvatar ? (
                          <img
                            src={selectedUserAvatar}
                            alt={selectedUserName}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow"
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow ${
                            selectedUserType === 'syndicator' 
                              ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                              : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                          }`}>
                            <span className="text-white font-semibold text-lg">
                              {selectedUserName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        {selectedUserOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="font-semibold text-gray-900">{selectedUserName}</h2>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            selectedUserType === 'syndicator' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {selectedUserType === 'syndicator' ? 'Syndicator' : 'Investor'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {selectedUserOnline ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              Online
                            </span>
                          ) : (
                            <span className="text-gray-400">Offline</span>
                          )}
                          {selectedDealContext && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="text-blue-600 flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {selectedDealContext.deal_title}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {selectedUserType === 'syndicator' && (
                          <Link
                            to={`/syndicators/${selectedUserId}`}
                            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                          >
                            View Profile
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Message Thread */}
                  <div className="flex-1 overflow-hidden">
                    <MessageThread
                      recipientId={selectedUserId}
                      recipientName={selectedUserName}
                      recipientType={selectedUserType}
                      recipientAvatar={selectedUserAvatar}
                      isOnline={selectedUserOnline}
                      dealContext={selectedDealContext}
                    />
                  </div>
                </>
              ) : (
                /* Empty State */
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="text-center max-w-md px-6">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                      <MessageSquarePlus className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Choose a conversation from the sidebar to start messaging, or browse deals to connect with new syndicators.
                    </p>
                    <Link
                      to="/find"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
                    >
                      <Building2 className="h-5 w-5" />
                      Browse Deals
                    </Link>
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
