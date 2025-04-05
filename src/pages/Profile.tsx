import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuthStore } from '../lib/store';
import { InvestorProfileForm } from '../components/InvestorProfileForm';
import { SyndicatorProfileForm } from '../components/SyndicatorProfileForm';
import { EmailUpdateForm } from '../components/EmailUpdateForm';

export function Profile() {
  const { user, profile } = useAuthStore();
  const [message, setMessage] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Email Update Form */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Account Settings</h2>
              <button
                onClick={() => setShowEmailForm(!showEmailForm)}
                className="text-blue-600 hover:text-blue-700"
              >
                {showEmailForm ? 'Cancel' : 'Update Email'}
              </button>
            </div>

            {showEmailForm ? (
              <EmailUpdateForm
                currentEmail={user.email!}
                onSuccess={() => setShowEmailForm(false)}
              />
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-500">Email Address</div>
                    <div className="font-medium">{user.email}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
            
            {message && (
              <div 
                className={`p-4 rounded-md mb-6 ${
                  message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                }`}
              >
                {message}
              </div>
            )}

            {profile?.user_type === 'investor' ? (
              <InvestorProfileForm setMessage={setMessage} />
            ) : (
              <SyndicatorProfileForm setMessage={setMessage} />
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}