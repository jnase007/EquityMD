import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, MapPin, TrendingUp, DollarSign, Clock, Lock } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
import { VerificationBadge, VerificationStatus } from './VerificationBadge';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition">
      <div className="inline-block p-3 bg-blue-50 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

interface DealMetrics {
  target: string;
  minimum: string;
  term: string;
}

interface DealCardProps {
  slug: string;
  image: string;
  title: string;
  location: string;
  metrics: DealMetrics;
  className?: string;
  detailed?: boolean;
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
  verificationStatus?: VerificationStatus;
}

export function DealCard({ slug, image, title, location, metrics, className = '', detailed = false, isAuthenticated = false, onAuthRequired, verificationStatus }: DealCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated && onAuthRequired) {
      e.preventDefault();
      onAuthRequired();
    }
  };

  return (
    <Link to={`/deals/${slug}`} className={`block h-full ${className}`} onClick={handleClick}>
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition h-full flex flex-col overflow-hidden scrollable-card">
        <div className="relative overflow-hidden">
          <OptimizedImage 
            src={image} 
            alt={title} 
            className="w-full h-48 object-cover"
            width={400}
            height={192}
          />
          {!isAuthenticated && (
            <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center max-w-[90%]">
              <Lock className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">Sign in</span>
            </div>
          )}
        </div>
        <div className="p-4 pt-3 flex-grow flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-800 line-clamp-2 flex-grow">{title}</h3>
            {verificationStatus && (
              <div className="ml-2 flex-shrink-0">
                <VerificationBadge status={verificationStatus} size="sm" />
              </div>
            )}
          </div>
          <p className="text-gray-600 mb-4 text-sm">{location}</p>
          
          {isAuthenticated ? (
            <div className="grid grid-cols-3 gap-2 border-t pt-3 mt-auto">
              <div>
                <p className="text-xs text-gray-500">Target Return</p>
                <p className="font-semibold text-blue-600 text-sm">{metrics.target}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Minimum</p>
                <p className="font-semibold text-blue-600 text-sm">{metrics.minimum}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Term</p>
                <p className="font-semibold text-blue-600 text-sm">{metrics.term}</p>
              </div>
            </div>
          ) : (
            <div className="border-t pt-3 mt-auto">
              <div className="text-center text-gray-500">
                <Lock className="h-4 w-4 mx-auto mb-1" />
                <p className="text-xs">Sign in to view investment details</p>
              </div>
            </div>
          )}

          {detailed && (
            <button className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center text-sm">
              View Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

interface DealListItemProps {
  slug: string;
  image: string;
  title: string;
  location: string;
  description: string;
  metrics: DealMetrics;
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
  verificationStatus?: VerificationStatus;
}

export function DealListItem({ slug, image, title, location, description, metrics, isAuthenticated = false, onAuthRequired, verificationStatus }: DealListItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated && onAuthRequired) {
      e.preventDefault();
      onAuthRequired();
    }
  };

  return (
    <Link to={`/deals/${slug}`} className="block" onClick={handleClick}>
      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition scrollable-card">
        <div className="flex gap-6">
          <div className="relative flex-shrink-0 overflow-hidden rounded-lg">
            <OptimizedImage 
              src={image} 
              alt={title} 
              className="w-48 h-48 object-cover"
              width={192}
              height={192}
            />
            {!isAuthenticated && (
              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center">
                <Lock className="h-4 w-4 mr-1" />
                Sign in
              </div>
            )}
          </div>
          <div className="flex-grow">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-800 flex-grow">{title}</h3>
              {verificationStatus && (
                <div className="ml-4 flex-shrink-0">
                  <VerificationBadge status={verificationStatus} size="sm" />
                </div>
              )}
            </div>
            <div className="flex items-center text-gray-600 mb-3">
              <MapPin className="h-4 w-4 mr-1" />
              {location}
            </div>
            <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
            
            {isAuthenticated ? (
              <div className="grid grid-cols-3 gap-8">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Target Return</p>
                    <p className="font-semibold text-blue-600">{metrics.target}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Minimum</p>
                    <p className="font-semibold text-blue-600">{metrics.minimum}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Term</p>
                    <p className="font-semibold text-blue-600">{metrics.term}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center text-gray-500">
                <Lock className="h-5 w-5 mr-2" />
                <p>Sign in to view investment details and metrics</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

interface StatCardProps {
  number: string;
  label: string;
  icon: React.ReactNode;
}

export function StatCard({ number, label, icon }: StatCardProps) {
  return (
    <div className="p-6">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-800 mb-2">{number}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}

interface InvestorCardProps {
  name: string;
  title: string;
  company?: string;
  image: string;
  portfolio: {
    totalInvested: string;
    avgReturn: string;
  };
  specialties: string[];
  location?: string;
}

export function InvestorCard({ name, title, company, image, portfolio, specialties, location }: InvestorCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition scrollable-card">
      <div className="text-center mb-4">
        <OptimizedImage 
          src={image} 
          alt={name} 
          className="w-20 h-20 object-cover rounded-full mx-auto mb-4"
          width={80}
          height={80}
        />
        <h3 className="text-xl font-bold text-gray-800">{name}</h3>
        <p className="text-gray-600">{title}</p>
        {company && <p className="text-sm text-blue-600 font-medium">{company}</p>}
      </div>
      
      <div className="border-t pt-4 mb-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Invested</p>
            <p className="font-semibold text-blue-600 text-lg">{portfolio.totalInvested}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Avg Return</p>
            <p className="font-semibold text-blue-600 text-lg">{portfolio.avgReturn}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-semibold text-blue-600 text-lg">{location || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="text-sm text-gray-500 mb-2">Investment Focus</p>
        <div className="flex flex-wrap gap-2">
          {specialties.map((specialty, index) => (
            <span 
              key={index} 
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}