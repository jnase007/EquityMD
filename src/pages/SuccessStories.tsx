import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Star, Building2, TrendingUp, Quote } from 'lucide-react';

export function SuccessStories() {
  const stories = [
    {
      title: "The Metropolitan",
      location: "Austin, TX",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80",
      metrics: {
        irr: "22%",
        equity: "$45M",
        timeline: "24 months"
      },
      quote: "EQUITYMD enabled us to efficiently raise capital for our largest project to date, connecting us with quality investors who shared our vision.",
      author: "Sarah Chen",
      role: "Managing Partner, Horizon Capital"
    },
    {
      title: "Parkview Commons",
      location: "Denver, CO",
      image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&q=80",
      metrics: {
        irr: "19%",
        equity: "$38M",
        timeline: "18 months"
      },
      quote: "The platform's streamlined process and professional investor base helped us close our funding round in record time.",
      author: "Michael Rodriguez",
      role: "CEO, Summit Properties"
    },
    {
      title: "The Grand Residences",
      location: "Nashville, TN",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80",
      metrics: {
        irr: "21%",
        equity: "$52M",
        timeline: "30 months"
      },
      quote: "EQUITYMD's technology platform and investor network were instrumental in helping us scale our operations nationally.",
      author: "David Thompson",
      role: "President, Elite Investments"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl font-bold mb-6">
            Success Stories
          </h1>
          <p className="text-xl text-blue-100">
            Discover how real estate syndicators and investors are achieving their goals with EQUITYMD.
          </p>
        </div>
      </div>

      {/* Stories Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="space-y-16">
          {stories.map((story, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="h-full">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <Building2 className="h-5 w-5" />
                    <span>{story.location}</span>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-6">{story.title}</h2>
                  
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div>
                      <div className="text-gray-500 text-sm">IRR</div>
                      <div className="text-xl font-bold text-green-600">{story.metrics.irr}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm">Equity Raised</div>
                      <div className="text-xl font-bold">{story.metrics.equity}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm">Timeline</div>
                      <div className="text-xl font-bold">{story.metrics.timeline}</div>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <Quote className="h-8 w-8 text-blue-600 mb-4" />
                    <p className="text-gray-600 italic">"{story.quote}"</p>
                  </div>
                  
                  <div>
                    <div className="font-bold">{story.author}</div>
                    <div className="text-gray-600">{story.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">$500M+</div>
              <div className="text-gray-600">Capital Raised</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">20%</div>
              <div className="text-gray-600">Average IRR</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">150+</div>
              <div className="text-gray-600">Successful Exits</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join the growing community of successful real estate investors and syndicators.
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition">
              Start Investing
            </button>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition">
              Partner with Us
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}