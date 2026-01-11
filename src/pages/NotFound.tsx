import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, Search, ArrowRight, Building2, MapPin, TrendingUp, RefreshCw } from 'lucide-react';
import { Navbar } from '../components/Navbar';

const funnyMessages = [
  { title: "This Deal Got Away! 🏃‍♂️", subtitle: "Looks like someone beat you to it. Investors move fast around here!" },
  { title: "Property Not Found 🔍", subtitle: "Either this listing walked off, or you typed the wrong address. Happens to the best of us." },
  { title: "Oops! Wrong Floor 🛗", subtitle: "You got off on floor 404. The good stuff is elsewhere!" },
  { title: "This Unit is Ghost-ed 👻", subtitle: "This property has vanished into thin air. Spooky, right?" },
  { title: "Market Correction! 📉", subtitle: "This page depreciated to zero. Time to find a better investment." },
  { title: "Lost in the Lobby 🏢", subtitle: "Even our best investors get lost sometimes. Let's get you back on track." },
];

const realEstateJokes = [
  "Why did the house go to the doctor? It had window panes! 🏥",
  "I'm reading a book about anti-gravity apartments. It's impossible to put down! 📚",
  "What do you call a fish that owns real estate? A loan shark! 🦈",
  "Why don't apartments ever win races? They're always in a complex! 🏃",
  "What did the real estate agent say to the ghost? I've got a property you'll just die for! 👻",
  "Why was the math book sad about real estate? Too many problems, not enough solutions! 📐",
];

export function NotFound() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [jokeIndex, setJokeIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [buildingOffset, setBuildingOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Random initial message
    setMessageIndex(Math.floor(Math.random() * funnyMessages.length));
    setJokeIndex(Math.floor(Math.random() * realEstateJokes.length));

    // Floating animation for buildings
    const interval = setInterval(() => {
      setBuildingOffset({
        x: Math.sin(Date.now() / 1000) * 10,
        y: Math.cos(Date.now() / 1500) * 8,
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const shuffleMessage = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setMessageIndex((prev) => (prev + 1) % funnyMessages.length);
      setJokeIndex((prev) => (prev + 1) % realEstateJokes.length);
      setIsFlipping(false);
    }, 300);
  };

  const currentMessage = funnyMessages[messageIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden">
      {/* Tell search engines this is a 404 page - don't index it */}
      <Helmet>
        <title>Page Not Found | EquityMD</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
      </Helmet>
      <Navbar />
      
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating buildings */}
        <div 
          className="absolute left-[10%] top-[20%] opacity-10 transition-transform duration-100"
          style={{ transform: `translate(${buildingOffset.x}px, ${buildingOffset.y}px)` }}
        >
          <Building2 className="h-32 w-32 text-blue-400" />
        </div>
        <div 
          className="absolute right-[15%] top-[30%] opacity-10 transition-transform duration-100"
          style={{ transform: `translate(${-buildingOffset.x}px, ${buildingOffset.y * 1.5}px)` }}
        >
          <Building2 className="h-24 w-24 text-purple-400" />
        </div>
        <div 
          className="absolute left-[20%] bottom-[20%] opacity-10 transition-transform duration-100"
          style={{ transform: `translate(${buildingOffset.x * 0.5}px, ${-buildingOffset.y}px)` }}
        >
          <Building2 className="h-20 w-20 text-emerald-400" />
        </div>
        <div 
          className="absolute right-[25%] bottom-[15%] opacity-10 transition-transform duration-100"
          style={{ transform: `translate(${-buildingOffset.x * 1.2}px, ${-buildingOffset.y * 0.8}px)` }}
        >
          <Building2 className="h-28 w-28 text-amber-400" />
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
        
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
        {/* Giant 404 with glow effect */}
        <div className="relative mb-8">
          <div className="text-[12rem] md:text-[16rem] font-black leading-none tracking-tighter">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
              404
            </span>
          </div>
          
          {/* Animated tag */}
          <div className="absolute top-4 right-4 md:top-8 md:right-8 animate-bounce">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm md:text-lg px-4 py-2 rounded-full font-bold shadow-lg transform rotate-12 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              OFF MARKET
            </div>
          </div>
        </div>

        {/* Message card with flip animation */}
        <div 
          className={`transition-all duration-300 transform ${isFlipping ? 'scale-95 opacity-50 rotate-y-180' : 'scale-100 opacity-100'}`}
        >
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {currentMessage.title}
          </h1>
          <p className="text-lg md:text-xl text-blue-200 mb-6 max-w-2xl mx-auto">
            {currentMessage.subtitle}
          </p>
        </div>

        {/* Joke card */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
            <div className="relative">
              <p className="text-blue-100 text-lg italic">
                "{realEstateJokes[jokeIndex]}"
              </p>
            </div>
          </div>
          
          {/* Shuffle button */}
          <button
            onClick={shuffleMessage}
            className="mt-4 inline-flex items-center gap-2 text-blue-300 hover:text-white transition-colors text-sm group"
          >
            <RefreshCw className={`h-4 w-4 transition-transform ${isFlipping ? 'animate-spin' : 'group-hover:rotate-180'}`} />
            Show me another
          </button>
        </div>

        {/* Quick stats - fun version */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-12">
          <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-white">404</div>
            <div className="text-xs text-blue-300">Error Code</div>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-white">0%</div>
            <div className="text-xs text-blue-300">Page Found</div>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-white">∞</div>
            <div className="text-xs text-blue-300">Other Deals</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            to="/"
            className="group flex items-center px-8 py-4 bg-white text-gray-900 rounded-2xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Home className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
            Back to Safety
          </Link>
          <Link
            to="/find"
            className="group flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <TrendingUp className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
            Find Real Deals
            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Bottom message */}
        <p className="text-blue-300/60 text-sm">
          Pro tip: The best deals don't have 404 errors. They're on our{' '}
          <Link to="/find" className="text-blue-400 hover:text-blue-300 underline">
            Browse Deals
          </Link>{' '}
          page. Just saying. 😉
        </p>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
