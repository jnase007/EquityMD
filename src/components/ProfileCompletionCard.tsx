import React from 'react';
import { TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { ProfileCompletionResult, getCompletionBadgeColor, getCompletionBadgeIcon } from '../lib/profileCompletion';

interface ProfileCompletionCardProps {
  completion: ProfileCompletionResult;
  userType: 'investor' | 'syndicator';
}

export function ProfileCompletionCard({ completion, userType }: ProfileCompletionCardProps) {
  const { percentage, completedFields, totalFields, nextSteps } = completion;
  const badgeColor = getCompletionBadgeColor(percentage);
  const badgeIcon = getCompletionBadgeIcon(percentage);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
            <p className="text-sm text-gray-600">
              {userType === 'investor' ? 'Complete your investor profile' : 'Complete your syndicator profile'}
            </p>
          </div>
        </div>
        
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${badgeColor}`}>
          <span className="mr-1">{badgeIcon}</span>
          {percentage}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{completedFields} of {totalFields} completed</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Next Steps */}
      {percentage < 100 && nextSteps.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <CheckCircle className="h-4 w-4 mr-1 text-blue-600" />
            Next Steps to Complete
          </h4>
          <div className="space-y-2">
            {nextSteps.map((step, index) => (
              <div key={index} className="flex items-center text-sm text-gray-700">
                <ArrowRight className="h-3 w-3 mr-2 text-blue-500" />
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completion Message */}
      {percentage === 100 && (
        <div className="flex items-center text-sm text-green-700 bg-green-50 rounded-lg p-3">
          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
          <span className="font-medium">
            🎉 Profile Complete! You're ready to {userType === 'investor' ? 'explore deals' : 'list your deals'}.
          </span>
        </div>
      )}

      {/* Completion Milestone Messages */}
      {percentage >= 80 && percentage < 100 && (
        <div className="flex items-center text-sm text-blue-700 bg-blue-50 rounded-lg p-3 mt-3">
          <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
          <span>Almost there! Just a few more details to go.</span>
        </div>
      )}
    </div>
  );
} 