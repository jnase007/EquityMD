import React, { useState, useEffect, useMemo } from 'react';
import { Send, Users, FileText, CheckCircle, AlertCircle, Loader2, Upload, X, Search, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import toast from 'react-hot-toast';

interface MassEmailSenderProps {
  emailType: string;
  onClose?: () => void;
}

interface UserOption {
  id: string;
  email: string;
  full_name: string;
  user_type: string;
}

type RecipientFilter = 'all' | 'investors' | 'syndicators' | 'custom' | 'specific_user';

export function MassEmailSender({ emailType, onClose }: MassEmailSenderProps) {
  const { user, profile } = useAuthStore();
  const [recipientFilter, setRecipientFilter] = useState<RecipientFilter>('all');
  const [customEmails, setCustomEmails] = useState<string>('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvEmails, setCsvEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ sent: 0, total: 0, failed: 0 });
  const [results, setResults] = useState<{ success: string[]; failed: string[] } | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Check if user is admin
  const isAdmin = profile?.is_admin === true;

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Admin access required');
      onClose?.();
    }
  }, [isAdmin, onClose]);

  // Search users when search term changes
  useEffect(() => {
    if (recipientFilter === 'specific_user' && userSearchTerm.length >= 2) {
      searchUsers(userSearchTerm);
    } else {
      setUserSearchResults([]);
      setShowUserDropdown(false);
    }
  }, [userSearchTerm, recipientFilter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-search-container')) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserDropdown]);

  // Search users function
  const searchUsers = async (searchTerm: string) => {
    setSearchingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, user_type')
        .or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;

      setUserSearchResults(data || []);
      setShowUserDropdown(true);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
      setUserSearchResults([]);
    } finally {
      setSearchingUsers(false);
    }
  };

  // Handle user selection
  const handleUserSelect = (user: UserOption) => {
    setSelectedUser(user);
    setUserSearchTerm(user.full_name || user.email);
    setShowUserDropdown(false);
    setTestEmail(user.email); // Auto-fill test email
  };

  // Handle CSV file upload
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const emails: string[] = [];
      
      lines.forEach((line, index) => {
        // Skip header row
        if (index === 0 && line.toLowerCase().includes('email')) return;
        
        // Extract email from CSV line (assuming email is first column or comma-separated)
        const parts = line.split(',');
        const email = parts[0]?.trim();
        if (email && email.includes('@')) {
          emails.push(email);
        }
      });

      setCsvEmails(emails);
      toast.success(`Loaded ${emails.length} emails from CSV`);
    };
    reader.readAsText(file);
  };

  // Get recipient emails based on filter
  const getRecipientEmails = async (): Promise<string[]> => {
    if (recipientFilter === 'specific_user') {
      if (selectedUser?.email) {
        return [selectedUser.email];
      }
      return [];
    }

    if (recipientFilter === 'custom') {
      if (csvEmails.length > 0) {
        return csvEmails;
      }
      // Parse custom emails from textarea
      return customEmails
        .split('\n')
        .map(email => email.trim())
        .filter(email => email && email.includes('@'));
    }

    // Fetch from database
    let query = supabase.from('profiles').select('email');
    
    if (recipientFilter === 'investors') {
      query = query.eq('user_type', 'investor');
    } else if (recipientFilter === 'syndicators') {
      query = query.eq('user_type', 'syndicator');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching recipients:', error);
      toast.error('Failed to fetch recipients');
      return [];
    }

    return data
      .map(profile => profile.email)
      .filter(email => email && email.includes('@'));
  };

  // Send test email
  const sendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSendingTest(true);
    try {
      const emailData = getEmailDataForType(emailType, testEmail);
      
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: testEmail,
          ...emailData
        }
      });

      if (error) {
        throw error;
      }

      toast.success('Test email sent successfully!');
    } catch (error: any) {
      console.error('Error sending test email:', error);
      toast.error(`Failed to send test email: ${error.message || 'Unknown error'}`);
    } finally {
      setSendingTest(false);
    }
  };

  // Get email data based on type
  const getEmailDataForType = (type: string, recipientEmail: string) => {
    const baseData = {
      type,
      data: {}
    };

    // Use selected user's info if available, otherwise use defaults
    const userName = selectedUser?.full_name || 'Test User';
    const userType = selectedUser?.user_type || 'investor';
    const firstName = selectedUser?.full_name?.split(' ')[0] || 'Test';

    switch (type) {
      case 'welcome_investor':
        return {
          ...baseData,
          data: {
            userName: userType === 'investor' ? userName : 'Test User',
            userType: 'investor'
          }
        };
      case 'welcome_syndicator':
        return {
          ...baseData,
          data: {
            userName: userType === 'syndicator' ? userName : 'Test Syndicator',
            userType: 'syndicator'
          }
        };
      case 'investor_launch':
        return {
          ...baseData,
          data: {
            firstName: firstName
          }
        };
      case 'deal_alert':
        return {
          ...baseData,
          data: {
            investorName: userType === 'investor' ? userName : 'Test Investor',
            dealTitle: 'Sample Deal',
            dealSlug: 'sample-deal',
            propertyType: 'Multi-Family',
            location: 'Austin, TX',
            targetIrr: '18-22%',
            minimumInvestment: '$50,000',
            investmentTerm: '3-5 years',
            syndicatorName: 'Sample Syndicator'
          }
        };
      case 'weekly_digest':
        return {
          ...baseData,
          data: {
            investorName: userType === 'investor' ? userName : 'Test Investor',
            newDealsCount: 5,
            deals: [],
            savedDealsReminder: false,
            unreadMessages: 0
          }
        };
      case 'profile_incomplete':
        return {
          ...baseData,
          data: {
            userName: userName,
            completionPercentage: 50,
            missingItems: ['Complete your profile']
          }
        };
      case 'deal_closing_soon':
        return {
          ...baseData,
          data: {
            investorName: userType === 'investor' ? userName : 'Test Investor',
            dealTitle: 'Sample Deal',
            dealSlug: 'sample-deal',
            daysRemaining: 7,
            targetIrr: '18-22%',
            minimumInvestment: '$50,000'
          }
        };
      default:
        return {
          ...baseData,
          subject: `Test Email - ${type}`,
          content: 'This is a test email from EquityMD email preview system.'
        };
    }
  };

  // Send mass emails
  const sendMassEmails = async () => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    setLoading(true);
    setSending(true);
    setProgress({ sent: 0, total: 0, failed: 0 });
    setResults(null);

    try {
      const emails = await getRecipientEmails();
      
      if (emails.length === 0) {
        toast.error('No recipients found');
        setLoading(false);
        setSending(false);
        return;
      }

      // Confirm before sending
      const confirmed = window.confirm(
        `You are about to send ${emails.length} emails. This action cannot be undone. Continue?`
      );

      if (!confirmed) {
        setLoading(false);
        setSending(false);
        return;
      }

      setProgress({ sent: 0, total: emails.length, failed: 0 });
      const success: string[] = [];
      const failed: string[] = [];

      // Send emails in batches to respect rate limits
      const batchSize = 10;
      for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);
        
        await Promise.allSettled(
          batch.map(async (email) => {
            try {
              const emailData = getEmailDataForType(emailType, email);
              
              const { error } = await supabase.functions.invoke('send-email', {
                body: {
                  to: email,
                  ...emailData
                }
              });

              if (error) {
                throw error;
              }

              success.push(email);
              setProgress(prev => ({ ...prev, sent: prev.sent + 1 }));
            } catch (error) {
              console.error(`Failed to send to ${email}:`, error);
              failed.push(email);
              setProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
            }
          })
        );

        // Small delay between batches to respect rate limits
        if (i + batchSize < emails.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setResults({ success, failed });
      toast.success(`Sent ${success.length} emails successfully${failed.length > 0 ? `, ${failed.length} failed` : ''}`);
    } catch (error: any) {
      console.error('Error sending mass emails:', error);
      toast.error(`Failed to send emails: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
      setSending(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Send className="h-5 w-5 text-blue-600" />
          Mass Email Sender
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Test Email Section */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">Send Test Email</h3>
        <div className="flex gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="test@example.com"
            className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={sendTestEmail}
            disabled={sendingTest || !testEmail}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sendingTest ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send Test
          </button>
        </div>
      </div>

      {/* Recipient Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Recipients</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <button
            onClick={() => {
              setRecipientFilter('all');
              setSelectedUser(null);
              setUserSearchTerm('');
            }}
            className={`p-3 rounded-lg border-2 transition ${
              recipientFilter === 'all'
                ? 'border-blue-500 bg-blue-50 text-blue-900'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Users className="h-5 w-5 mx-auto mb-1" />
            <div className="text-xs font-medium">All Users</div>
          </button>
          <button
            onClick={() => {
              setRecipientFilter('investors');
              setSelectedUser(null);
              setUserSearchTerm('');
            }}
            className={`p-3 rounded-lg border-2 transition ${
              recipientFilter === 'investors'
                ? 'border-blue-500 bg-blue-50 text-blue-900'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Users className="h-5 w-5 mx-auto mb-1" />
            <div className="text-xs font-medium">Investors</div>
          </button>
          <button
            onClick={() => {
              setRecipientFilter('syndicators');
              setSelectedUser(null);
              setUserSearchTerm('');
            }}
            className={`p-3 rounded-lg border-2 transition ${
              recipientFilter === 'syndicators'
                ? 'border-blue-500 bg-blue-50 text-blue-900'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Users className="h-5 w-5 mx-auto mb-1" />
            <div className="text-xs font-medium">Syndicators</div>
          </button>
          <button
            onClick={() => {
              setRecipientFilter('specific_user');
              setSelectedUser(null);
              setUserSearchTerm('');
            }}
            className={`p-3 rounded-lg border-2 transition ${
              recipientFilter === 'specific_user'
                ? 'border-blue-500 bg-blue-50 text-blue-900'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <User className="h-5 w-5 mx-auto mb-1" />
            <div className="text-xs font-medium">Specific User</div>
          </button>
          <button
            onClick={() => {
              setRecipientFilter('custom');
              setSelectedUser(null);
              setUserSearchTerm('');
            }}
            className={`p-3 rounded-lg border-2 transition ${
              recipientFilter === 'custom'
                ? 'border-blue-500 bg-blue-50 text-blue-900'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <FileText className="h-5 w-5 mx-auto mb-1" />
            <div className="text-xs font-medium">Custom</div>
          </button>
        </div>

        {/* Specific User Search */}
        {recipientFilter === 'specific_user' && (
          <div className="mb-4 user-search-container">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search for User
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                onFocus={() => {
                  if (userSearchResults.length > 0) {
                    setShowUserDropdown(true);
                  }
                }}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchingUsers && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
              
              {/* User Dropdown */}
              {showUserDropdown && userSearchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {userSearchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition flex items-center justify-between border-b border-gray-100 last:border-b-0"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.full_name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                      <div className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                        {user.user_type}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Selected User Display */}
            {selectedUser && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-blue-900">
                      {selectedUser.full_name || 'No name'}
                    </div>
                    <div className="text-sm text-blue-700">{selectedUser.email}</div>
                    <div className="text-xs text-blue-600 mt-1">
                      {selectedUser.user_type === 'investor' ? 'Investor' : 'Syndicator'}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setUserSearchTerm('');
                      setTestEmail('');
                    }}
                    className="p-1 hover:bg-blue-100 rounded transition"
                  >
                    <X className="h-4 w-4 text-blue-600" />
                  </button>
                </div>
              </div>
            )}

            {userSearchTerm.length >= 2 && userSearchResults.length === 0 && !searchingUsers && (
              <p className="mt-2 text-sm text-gray-500">No users found</p>
            )}
          </div>
        )}

        {/* Custom Email Input */}
        {recipientFilter === 'custom' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload CSV File
              </label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">Choose CSV</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    className="hidden"
                  />
                </label>
                {csvFile && (
                  <span className="text-sm text-gray-600">
                    {csvFile.name} ({csvEmails.length} emails)
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Enter Emails (one per line)
              </label>
              <textarea
                value={customEmails}
                onChange={(e) => setCustomEmails(e.target.value)}
                placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Progress */}
      {sending && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Sending emails...</span>
            <span className="text-sm text-gray-600">
              {progress.sent} / {progress.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.sent / progress.total) * 100}%` }}
            />
          </div>
          {progress.failed > 0 && (
            <p className="text-sm text-red-600 mt-2">
              {progress.failed} emails failed
            </p>
          )}
        </div>
      )}

      {/* Results */}
      {results && !sending && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-gray-900">Send Complete</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="text-green-600">
              ✓ {results.success.length} emails sent successfully
            </div>
            {results.failed.length > 0 && (
              <div className="text-red-600">
                ✗ {results.failed.length} emails failed
                <details className="mt-2">
                  <summary className="cursor-pointer">View failed emails</summary>
                  <ul className="mt-2 space-y-1">
                    {results.failed.map((email, idx) => (
                      <li key={idx} className="text-xs">{email}</li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Send Button */}
      <button
        onClick={sendMassEmails}
        disabled={
          loading || 
          sending || 
          (recipientFilter === 'custom' && customEmails.trim() === '' && csvEmails.length === 0) ||
          (recipientFilter === 'specific_user' && !selectedUser)
        }
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
      >
        {sending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Send Mass Email
          </>
        )}
      </button>

      {/* Warning */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>Warning:</strong> Mass emails cannot be undone. Make sure you've tested the email template before sending to all recipients.
          </div>
        </div>
      </div>
    </div>
  );
}
