import React, { useState, useEffect } from 'react';
import { 
  Video, Calendar, Clock, Users, MapPin, Play,
  Plus, Edit2, Trash2, ExternalLink, Bell, Check,
  ChevronRight, Share2, Link2, AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

interface Webinar {
  id: string;
  deal_id?: string;
  syndicator_id: string;
  title: string;
  description: string;
  scheduled_date: string;
  duration_minutes: number;
  meeting_url?: string;
  recording_url?: string;
  max_attendees?: number;
  attendee_count: number;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  created_at: string;
}

interface WebinarRSVP {
  webinar_id: string;
  user_id: string;
  status: 'registered' | 'attended' | 'no_show';
  reminder_sent: boolean;
}

interface WebinarSystemProps {
  syndicatorId?: string;
  dealId?: string;
  mode?: 'manage' | 'view';
}

export function WebinarSystem({ syndicatorId, dealId, mode = 'view' }: WebinarSystemProps) {
  const { user } = useAuthStore();
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWebinar, setEditingWebinar] = useState<Webinar | null>(null);
  const [userRSVPs, setUserRSVPs] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 60,
    meeting_url: '',
    max_attendees: 100,
  });

  useEffect(() => {
    fetchWebinars();
    if (user) {
      fetchUserRSVPs();
    }
  }, [syndicatorId, dealId, user]);

  const fetchWebinars = async () => {
    try {
      let query = supabase
        .from('webinars')
        .select('*')
        .order('scheduled_date', { ascending: true });

      if (syndicatorId) {
        query = query.eq('syndicator_id', syndicatorId);
      }
      if (dealId) {
        query = query.eq('deal_id', dealId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setWebinars(data || []);
    } catch (error) {
      console.error('Error fetching webinars:', error);
      // Set empty array for demo
      setWebinars([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRSVPs = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('webinar_rsvps')
        .select('webinar_id')
        .eq('user_id', user.id);
      
      if (data) {
        setUserRSVPs(new Set(data.map(r => r.webinar_id)));
      }
    } catch (error) {
      console.error('Error fetching RSVPs:', error);
    }
  };

  const handleRSVP = async (webinarId: string) => {
    if (!user) return;

    try {
      if (userRSVPs.has(webinarId)) {
        // Cancel RSVP
        await supabase
          .from('webinar_rsvps')
          .delete()
          .eq('webinar_id', webinarId)
          .eq('user_id', user.id);
        
        setUserRSVPs(prev => {
          const next = new Set(prev);
          next.delete(webinarId);
          return next;
        });
      } else {
        // Create RSVP
        await supabase
          .from('webinar_rsvps')
          .insert({
            webinar_id: webinarId,
            user_id: user.id,
            status: 'registered',
            reminder_sent: false,
          });
        
        setUserRSVPs(prev => new Set([...prev, webinarId]));
      }
      
      fetchWebinars();
    } catch (error) {
      console.error('Error updating RSVP:', error);
    }
  };

  const createWebinar = async () => {
    if (!syndicatorId || !formData.title || !formData.scheduled_date) return;

    try {
      const scheduledDateTime = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);
      
      const webinarData = {
        syndicator_id: syndicatorId,
        deal_id: dealId || null,
        title: formData.title,
        description: formData.description,
        scheduled_date: scheduledDateTime.toISOString(),
        duration_minutes: formData.duration_minutes,
        meeting_url: formData.meeting_url,
        max_attendees: formData.max_attendees,
        attendee_count: 0,
        status: 'upcoming' as const,
      };

      if (editingWebinar) {
        await supabase
          .from('webinars')
          .update(webinarData)
          .eq('id', editingWebinar.id);
      } else {
        await supabase
          .from('webinars')
          .insert(webinarData);
      }

      setShowCreateForm(false);
      setEditingWebinar(null);
      resetForm();
      fetchWebinars();
    } catch (error) {
      console.error('Error creating webinar:', error);
    }
  };

  const deleteWebinar = async (webinarId: string) => {
    if (!confirm('Delete this webinar?')) return;
    
    try {
      await supabase
        .from('webinars')
        .delete()
        .eq('id', webinarId);
      
      fetchWebinars();
    } catch (error) {
      console.error('Error deleting webinar:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      scheduled_date: '',
      scheduled_time: '',
      duration_minutes: 60,
      meeting_url: '',
      max_attendees: 100,
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (webinar: Webinar) => {
    const now = new Date();
    const scheduled = new Date(webinar.scheduled_date);
    const endTime = new Date(scheduled.getTime() + webinar.duration_minutes * 60000);
    
    if (webinar.status === 'cancelled') {
      return { text: 'Cancelled', bg: 'bg-gray-100', color: 'text-gray-600' };
    }
    if (now >= scheduled && now <= endTime) {
      return { text: 'Live Now', bg: 'bg-red-100', color: 'text-red-600', pulse: true };
    }
    if (now > endTime) {
      return { text: 'Completed', bg: 'bg-gray-100', color: 'text-gray-600' };
    }
    
    const daysUntil = Math.ceil((scheduled.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 1) {
      return { text: 'Starting Soon', bg: 'bg-amber-100', color: 'text-amber-700' };
    }
    return { text: 'Upcoming', bg: 'bg-blue-100', color: 'text-blue-700' };
  };

  const upcomingWebinars = webinars.filter(w => 
    w.status === 'upcoming' && new Date(w.scheduled_date) > new Date()
  );
  const pastWebinars = webinars.filter(w => 
    w.status === 'completed' || new Date(w.scheduled_date) < new Date()
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Video className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Deal Webinars</h3>
              <p className="text-white/80 text-sm">Live presentations & Q&A</p>
            </div>
          </div>
          {mode === 'manage' && syndicatorId && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
            >
              <Plus className="h-4 w-4" />
              Schedule
            </button>
          )}
        </div>
      </div>

      {/* Webinars List */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading webinars...</div>
        ) : webinars.length === 0 ? (
          <div className="text-center py-8">
            <Video className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-1">No Webinars Scheduled</h4>
            <p className="text-gray-500 text-sm">
              {mode === 'manage' 
                ? 'Schedule a webinar to present your deal' 
                : 'Check back for upcoming presentations'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Upcoming */}
            {upcomingWebinars.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Upcoming</h4>
                <div className="space-y-3">
                  {upcomingWebinars.map(webinar => {
                    const status = getStatusBadge(webinar);
                    const isRegistered = userRSVPs.has(webinar.id);
                    
                    return (
                      <div 
                        key={webinar.id}
                        className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-gray-900">{webinar.title}</h5>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.bg} ${status.color} ${status.pulse ? 'animate-pulse' : ''}`}>
                                {status.text}
                              </span>
                            </div>
                            {webinar.description && (
                              <p className="text-sm text-gray-500 line-clamp-2">{webinar.description}</p>
                            )}
                          </div>
                          {mode === 'manage' && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingWebinar(webinar);
                                  const date = new Date(webinar.scheduled_date);
                                  setFormData({
                                    title: webinar.title,
                                    description: webinar.description,
                                    scheduled_date: date.toISOString().split('T')[0],
                                    scheduled_time: date.toTimeString().slice(0, 5),
                                    duration_minutes: webinar.duration_minutes,
                                    meeting_url: webinar.meeting_url || '',
                                    max_attendees: webinar.max_attendees || 100,
                                  });
                                  setShowCreateForm(true);
                                }}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteWebinar(webinar.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(webinar.scheduled_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(webinar.scheduled_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {webinar.attendee_count} registered
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {status.text === 'Live Now' && webinar.meeting_url ? (
                            <a
                              href={webinar.meeting_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                            >
                              <Play className="h-4 w-4" />
                              Join Now
                            </a>
                          ) : (
                            <button
                              onClick={() => handleRSVP(webinar.id)}
                              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                                isRegistered
                                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                  : 'bg-purple-600 text-white hover:bg-purple-700'
                              }`}
                            >
                              {isRegistered ? (
                                <>
                                  <Check className="h-4 w-4" />
                                  Registered
                                </>
                              ) : (
                                <>
                                  <Bell className="h-4 w-4" />
                                  Register
                                </>
                              )}
                            </button>
                          )}
                          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                            <Share2 className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past Webinars with Recordings */}
            {pastWebinars.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Past Webinars</h4>
                <div className="space-y-2">
                  {pastWebinars.slice(0, 5).map(webinar => (
                    <div 
                      key={webinar.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h5 className="font-medium text-gray-900">{webinar.title}</h5>
                        <div className="text-sm text-gray-500">
                          {formatDate(webinar.scheduled_date)}
                        </div>
                      </div>
                      {webinar.recording_url ? (
                        <a
                          href={webinar.recording_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                        >
                          <Play className="h-4 w-4" />
                          Watch
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">No recording</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">
                {editingWebinar ? 'Edit Webinar' : 'Schedule Webinar'}
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Investment Opportunity Overview"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What will be covered..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.scheduled_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time *
                    </label>
                    <input
                      type="time"
                      value={formData.scheduled_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <select
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: Number(e.target.value) }))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Attendees
                    </label>
                    <input
                      type="number"
                      value={formData.max_attendees}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_attendees: Number(e.target.value) }))}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting URL (Zoom, Meet, etc.)
                  </label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="url"
                      value={formData.meeting_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, meeting_url: e.target.value }))}
                      placeholder="https://zoom.us/..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingWebinar(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={createWebinar}
                disabled={!formData.title || !formData.scheduled_date}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50"
              >
                {editingWebinar ? 'Save Changes' : 'Schedule Webinar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact Webinar Widget
export function UpcomingWebinarWidget({ dealId }: { dealId?: string }) {
  const [webinar, setWebinar] = useState<Webinar | null>(null);

  useEffect(() => {
    const fetchUpcoming = async () => {
      let query = supabase
        .from('webinars')
        .select('*')
        .eq('status', 'upcoming')
        .gte('scheduled_date', new Date().toISOString())
        .order('scheduled_date', { ascending: true })
        .limit(1);

      if (dealId) {
        query = query.eq('deal_id', dealId);
      }

      const { data } = await query;
      if (data?.[0]) setWebinar(data[0]);
    };
    fetchUpcoming();
  }, [dealId]);

  if (!webinar) return null;

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
      <div className="flex items-center gap-2 mb-2">
        <Video className="h-4 w-4 text-purple-600" />
        <span className="text-sm font-medium text-purple-800">Upcoming Webinar</span>
      </div>
      <div className="mb-3">
        <div className="font-medium text-gray-900">{webinar.title}</div>
        <div className="text-sm text-gray-500">{formatDateTime(webinar.scheduled_date)}</div>
      </div>
      <button className="w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition">
        Register Now
      </button>
    </div>
  );
}

