import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { Calendar, Clock, Video, CheckCircle2, Building2, Users, TrendingUp } from 'lucide-react';

const BOOKING_URL = 'https://calendar.app.google/8LAesJ7mk4iZrJgv5';

export function BookJustin() {
  const [, setIframeFailed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <SEO
        title="Meet Justin | Founder of EquityMD"
        description="Justin Nassie has been in commercial real estate since 2008, connecting syndicators with accredited investors. Learn his story and book a time to connect."
      />
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600/10 mb-5">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Meet Justin
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Founder of EquityMD — connecting syndicators with a proven network
              of accredited investors.
            </p>
          </div>

          {/* Story */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-10 mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-5">
              How I came up with EquityMD
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                I've been in real estate since <strong className="text-gray-900">2008</strong>. I got
                my start at <strong className="text-gray-900">Sperry Van Ness</strong>, a commercial
                real estate firm in Irvine, California, where I worked on portfolios worth
                <strong className="text-gray-900"> over $100 million</strong>.
              </p>
              <p>
                I came in as a designer — but along the way I got really good at
                marketing. I ended up working with <strong className="text-gray-900">15 syndicators</strong>,
                helping them find and win investors for their deals. Over the years,
                I got very good at one thing in particular:{' '}
                <strong className="text-gray-900">bringing accredited investors to syndicators.</strong>
              </p>
              <p>
                That's exactly why I built <strong className="text-gray-900">EquityMD</strong>. I have
                a network of accredited investors actively looking for deals — so I created a
                platform to connect them with the syndicators who have those deals.
              </p>
              <p>
                Now I'm talking with syndicators about posting their deals on the site,
                putting up their listing, earning reviews, and being part of a real{' '}
                <strong className="text-gray-900">community and marketplace</strong> built for
                connection and dealmaking.
              </p>
              <p>
                And I'm not just building this from the outside. I{' '}
                <strong className="text-gray-900">own commercial real estate myself</strong> and
                I'm an <strong className="text-gray-900">accredited investor</strong> — so I'm
                looking for deals too. EquityMD is the place I want for myself: somewhere to find
                the opportunities that actually work for me. I built the marketplace I'd want to
                shop in.
              </p>
            </div>

            {/* Credibility strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100">
              {[
                { icon: Building2, stat: 'Since 2008', desc: 'In commercial real estate' },
                { icon: TrendingUp, stat: '$100M+', desc: 'Portfolios at Sperry Van Ness' },
                { icon: Users, stat: '15 syndicators', desc: 'Backed with investor capital' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{item.stat}</div>
                    <div className="text-sm text-gray-500">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking CTA */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's talk</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Whether you're a syndicator looking to reach investors or just want to
              learn more about EquityMD, grab a time that works for you.
            </p>
          </div>

          {/* What to expect */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
            <div className="relative">
              <iframe
                src={BOOKING_URL}
                title="Book a meeting with Justin"
                className="w-full"
                style={{ height: 720, border: 'none' }}
                onError={() => setIframeFailed(true)}
              />
            </div>

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
