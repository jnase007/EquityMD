import React from 'react';
import { Bell, MailOpen, Building2, ChevronRight, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsDropdown({ isOpen, onClose }: NotificationsDropdownProps) {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAuthStore();
  const navigate = useNavigate();

  const handleNotificationClick = async (notification: any) => {
    try {
      // Mark as read in database
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification.id);

      if (error) throw error;
      markNotificationRead(notification.id);

      // Handle navigation based on notification type
      switch (notification.type) {
        case 'message':
          // Always navigate to inbox for messages
          navigate('/inbox');
          break;
        case 'deal_update':
          // Navigate to the deal page for deal updates
          if (notification.data?.deal_slug) {
            navigate(`/deals/${notification.data.deal_slug}`);
          }
          break;
        case 'investment_status':
          // Navigate to the deal page for investment status updates
          if (notification.data?.deal_slug) {
            navigate(`/deals/${notification.data.deal_slug}`);
          }
          break;
        default:
          // Default to inbox for unknown types
          navigate('/inbox');
      }

      // Close the dropdown
      onClose();
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };



  const handleMarkAllRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);

      if (error) throw error;
      markAllNotificationsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  if (!isOpen) return null;

  const hasItems = notifications.length > 0;

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg z-50">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="font-bold">Notifications</h3>
          {hasItems && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                !notification.read ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notification.type === 'message' ? (
                    <MailOpen className="h-6 w-6 text-blue-600" />
                  ) : (
                    <Building2 className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {notification.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}