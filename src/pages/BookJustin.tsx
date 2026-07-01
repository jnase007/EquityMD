import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { Calendar, Clock, Video, CheckCircle2, Building2, Users, TrendingUp } from 'lucide-react';

const BOOKING_URL = 'https://calendar.app.google/8LAesJ7mk4iZrJgv5';

export function BookJustin() {
  return (
    <div className="relative min-h-screen">
      {/* Multifamily building background */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=80')",
        }}
        aria-hidden="true"
      />
      {/* Readability overlay */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            'linear-gradient(to bottom right, rgba(248,250,252,0.82), rgba(255,255,255,0.72), rgba(238,242,255,0.82))',
        }}
        aria-hidden="true"
      />
      <SEO
        title="Meet Justin | Founder of EquityMD"
        description="Justin Nassie has been in commercial real estate since 2007, connecting syndicators with accredited investors. Learn his story and book a time to connect."
      />
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-start">

            {/* LEFT: Name + Photo + Story */}
            <div className="lg:col-span-3">
              {/* Header: photo + name */}
              <div className="flex items-center gap-5 mb-8">
                <img
                  src="/images/justin.jpg"
                  alt="Justin Nassie, Founder of EquityMD"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover object-top ring-4 ring-white shadow-lg shrink-0"
                />
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                    Justin Nassie
                  </h1>
                  <p className="text-base sm:text-lg text-blue-600 font-medium mt-1">
                    Founder of EquityMD
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Connecting syndicators with accredited investors
                  </p>
                </div>
              </div>

              {/* Story */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 sm:p-9">
                <h2 className="text-2xl font-bold text-gray-900 mb-5">
                  How I came up with EquityMD
                </h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    I've been in real estate since <strong className="text-gray-900">2007</strong>. I got
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
                    { icon: Building2, stat: 'Since 2007', desc: 'In commercial real estate' },
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
            </div>

            {/* RIGHT: Booking */}
            <div className="lg:col-span-2 lg:sticky lg:top-24">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
                {/* Gradient CTA header */}
                <div className="p-8 text-center bg-gradient-to-br from-blue-600 to-indigo-600">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/15 mb-4">
                    <Calendar className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Grab a time on my calendar
                  </h3>
                  <p className="text-blue-100 text-sm mb-6">
                    See my availability and pick a slot that works for you.
                  </p>
                  <a
                    href={BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-blue-700 font-semibold px-7 py-3.5 rounded-lg transition shadow-md w-full justify-center"
                  >
                    <Calendar className="h-5 w-5" />
                    Book a Time with Justin
                  </a>
                </div>

                {/* What to expect */}
                <div className="p-6 space-y-4">
                  {[
                    { icon: Clock, title: 'Quick & focused', desc: 'A short call to understand your goals.' },
                    { icon: Video, title: 'Video or phone', desc: 'Meet however is easiest for you.' },
                    { icon: CheckCircle2, title: 'No pressure', desc: 'Just a real conversation.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="shrink-0 w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                        <item.icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
                        <div className="text-sm text-gray-500">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
