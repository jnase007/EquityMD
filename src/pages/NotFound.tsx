import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowRight } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="text-9xl font-bold text-blue-600">404</div>
            <div className="absolute -top-6 -right-6 bg-amber-500 text-white text-lg px-4 py-2 rounded-lg transform rotate-12">
              SOLD OUT!
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          This Property is Off the Market!
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Looks like this investment opportunity has already been snatched up.
          But don't worry, we have plenty of other prime locations in our portfolio!
        </p>

        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-center space-x-4 text-gray-500 mb-4">
              <span>404 Not Found Street</span>
              <span>•</span>
              <span>Missing Property, 404</span>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&q=80"
                alt="Luxury apartment complex"
                className="w-full h-64 object-cover rounded-lg brightness-50"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-amber-500 text-white px-6 py-3 rounded-lg transform -rotate-12 text-xl font-bold shadow-lg">
                  UNDER CONTRACT
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between text-sm text-amber-600">
              <span>Status: Off Market</span>
              <span>Units: 404</span>
              <span>Views: ∞</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition group">
            <div className="relative overflow-hidden rounded-lg mb-4">
              <img
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80"
                alt="Modern apartment building"
                className="w-full h-48 object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute top-2 right-2 bg-amber-500 text-white px-3 py-1 rounded-full text-sm">
                Available Now
              </div>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">Similar Properties</h3>
              <p className="text-gray-600 text-sm">
                Check out our available luxury apartment complexes
              </p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition group">
            <div className="relative overflow-hidden rounded-lg mb-4">
              <img
                src="https://images.unsplash.com/photo-1594484208280-efa00f96fc21?auto=format&fit=crop&q=80"
                alt="Luxury residential complex"
                className="w-full h-48 object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute top-2 right-2 bg-amber-500 text-white px-3 py-1 rounded-full text-sm">
                Coming Soon
              </div>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">New Opportunities</h3>
              <p className="text-gray-600 text-sm">
                Discover recently listed investment properties
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Home className="h-5 w-5 mr-2" />
            Back to Homepage
          </Link>
          <Link
            to="/browse"
            className="flex items-center px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
          >
            <Search className="h-5 w-5 mr-2" />
            Browse Available Properties
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}