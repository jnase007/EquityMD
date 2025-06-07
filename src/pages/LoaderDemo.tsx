import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { LoadingSpinner, PageLoader, InlineLoader } from '../components/LoadingSpinner';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Play, Eye, Grid, Users } from 'lucide-react';

export function LoaderDemo() {
  const [showPageLoader, setShowPageLoader] = useState(false);

  const loaderVariants = [
    { 
      name: 'EquityMD (Default)', 
      variant: 'medical' as const, 
      description: 'EquityMD branded loader with spinning ring and pulse effects' 
    },
    { 
      name: 'Bouncing Dots', 
      variant: 'dots' as const, 
      description: 'Three dots bouncing in sequence - clean and modern' 
    },
    { 
      name: 'Spinning Ring', 
      variant: 'spin' as const, 
      description: 'Classic spinning circle - simple and professional' 
    },
    { 
      name: 'Pulse Effect', 
      variant: 'pulse' as const, 
      description: 'Pulsing circles with fade effect - smooth and elegant' 
    },
    { 
      name: 'Audio Bars', 
      variant: 'bars' as const, 
      description: 'Animated bars like audio visualizer - dynamic and engaging' 
    }
  ];

  const sizes = ['sm', 'md', 'lg', 'xl'] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Loading Experience Showcase</h1>
          <p className="text-gray-600">Explore EquityMD's complete loading system - from spinners to skeleton placeholders</p>
        </div>

        {/* Page Loader Demo */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Eye className="h-5 w-5 mr-2 text-blue-600" />
            Full Page Loader
          </h2>
          <p className="text-gray-600 mb-4">
            This appears when navigating between pages or loading major content.
          </p>
          <button
            onClick={() => {
              setShowPageLoader(true);
              setTimeout(() => setShowPageLoader(false), 3000);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Play className="h-4 w-4 mr-2" />
            Preview Full Page Loader (3 seconds)
          </button>
        </div>

        {/* Loader Variants */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {loaderVariants.map((loader) => (
            <div key={loader.variant} className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">{loader.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{loader.description}</p>
              
              <div className="bg-gray-50 rounded-lg p-8 flex items-center justify-center mb-4">
                <LoadingSpinner 
                  variant={loader.variant} 
                  size="lg" 
                  text="Loading deals..." 
                />
              </div>
              
              <div className="text-xs text-gray-500">
                Perfect for: {loader.variant === 'medical' ? 'Brand consistency' : 
                           loader.variant === 'dots' ? 'Button loading states' :
                           loader.variant === 'spin' ? 'Data fetching' :
                           loader.variant === 'pulse' ? 'Image loading' :
                           'Dashboard updates'}
              </div>
            </div>
          ))}
        </div>

        {/* Size Variations */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Size Variations</h2>
          <p className="text-gray-600 mb-6">The medical loader in different sizes:</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {sizes.map((size) => (
              <div key={size} className="text-center">
                <div className="bg-gray-50 rounded-lg p-6 mb-2 flex items-center justify-center">
                  <LoadingSpinner variant="medical" size={size} />
                </div>
                <span className="text-sm font-medium text-gray-700 capitalize">{size}</span>
                <div className="text-xs text-gray-500 mt-1">
                  {size === 'sm' ? 'Buttons' : 
                   size === 'md' ? 'Cards' :
                   size === 'lg' ? 'Sections' :
                   'Full page'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inline Loaders */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Inline Loaders</h2>
          <p className="text-gray-600 mb-6">For loading content within sections:</p>
          
          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Loading Investment Opportunities...</h4>
              <InlineLoader text="Fetching latest deals..." variant="dots" />
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Processing Your Investment...</h4>
              <InlineLoader text="Please wait while we process your request..." variant="spin" />
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Updating Portfolio...</h4>
              <InlineLoader text="Syncing your latest data..." variant="pulse" />
            </div>
          </div>
        </div>

        {/* Skeleton Loaders */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Grid className="h-5 w-5 mr-2 text-blue-600" />
            Skeleton Loaders
          </h2>
          <p className="text-gray-600 mb-6">
            Modern skeleton placeholders that maintain page structure while content loads. 
            Used throughout EquityMD for better UX.
          </p>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium mb-4 flex items-center">
                <Grid className="h-4 w-4 mr-2 text-green-600" />
                Property Cards (3 items)
              </h4>
              <div className="border rounded-lg p-4 bg-gray-50">
                <LoadingSkeleton type="property" count={3} />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Used on: Browse page, search results, favorites
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-4 flex items-center">
                <Users className="h-4 w-4 mr-2 text-purple-600" />
                Syndicator Cards (3 items)
              </h4>
              <div className="border rounded-lg p-4 bg-gray-50">
                <LoadingSkeleton type="syndicator" count={3} />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Used on: Directory page, syndicator listings
              </p>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Why Skeleton Loaders?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Maintain visual layout while loading</li>
              <li>• Reduce perceived loading time</li>
              <li>• Better than empty states or spinners for content</li>
              <li>• Provide visual hierarchy preview</li>
              <li>• Modern UX standard across major platforms</li>
            </ul>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">Implementation Examples</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Page Navigation:</h4>
              <code className="bg-white p-2 rounded text-xs block text-gray-800">
                &lt;PageLoader text="Loading dashboard..." /&gt;
              </code>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Button Loading:</h4>
              <code className="bg-white p-2 rounded text-xs block text-gray-800">
                &lt;LoadingSpinner variant="dots" size="sm" /&gt;
              </code>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Content Sections:</h4>
              <code className="bg-white p-2 rounded text-xs block text-gray-800">
                &lt;InlineLoader text="Loading deals..." /&gt;
              </code>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Custom Styling:</h4>
              <code className="bg-white p-2 rounded text-xs block text-gray-800">
                &lt;LoadingSpinner variant="medical" size="lg" /&gt;
              </code>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Property Skeletons:</h4>
              <code className="bg-white p-2 rounded text-xs block text-gray-800">
                &lt;LoadingSkeleton type="property" count={6} /&gt;
              </code>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Syndicator Skeletons:</h4>
              <code className="bg-white p-2 rounded text-xs block text-gray-800">
                &lt;LoadingSkeleton type="syndicator" count={3} /&gt;
              </code>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Page Loader Overlay */}
      {showPageLoader && (
        <PageLoader text="Loading your investment opportunities..." />
      )}
    </div>
  );
} 