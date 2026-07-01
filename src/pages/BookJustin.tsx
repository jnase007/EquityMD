import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { Calendar, Clock, Video, CheckCircle2 } from 'lucide-react';

const BOOKING_URL = 'https://calendar.app.google/8LAesJ7mk4iZrJgv5';

export function BookJustin() {
  const [iframeFailed, setIframeFailed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <SEO
        title="Book a Meeting with Justin | EquityMD"
        description="Schedule a time to connect with Justin Nassie at EquityMD. Pick a slot that works for you."
      />
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600/10 mb-5">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Book a Meeting with Justin
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Pick a time that works for you and let's talk. Whether you're an
              investor or a syndicator, I'd love to connect.
            </p>
          </div>

          {/* What to expect */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { icon: Clock, title: 'Quick & focused', desc: 'A short call to understand your goals.' },
              { icon: Video, title: 'Video or phone', desc: 'Meet however is easiest for you.' },
              { icon: CheckCircle2, title: 'No pressure', desc: 'Just a real conversation.' },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-3"
              >
                <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Booking area */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            {!iframeFailed ? (
              <div className="relative">
                <iframe
                  src={BOOKING_URL}
                  title="Book a meeting with Justin"
                  className="w-full"
                  style={{ height: 720, border: 'none' }}
                  onError={() => setIframeFailed(true)}
                />
              </div>
            ) : null}

            {/* Always-visible CTA (primary path if Google blocks the iframe) */}
            <div className="p-8 text-center border-t border-gray-100 bg-gray-50">
              <p className="text-gray-600 mb-4">
                Scheduler not loading? Open it in a new tab:
              </p>
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-lg transition shadow-sm"
              >
                <Calendar className="h-5 w-5" />
                Book a Time with Justin
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
