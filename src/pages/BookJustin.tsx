import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { Calendar, Clock, Video, CheckCircle2, Building2, Users, TrendingUp } from 'lucide-react';

const BOOKING_URL = 'https://calendar.app.google/8LAesJ7mk4iZrJgv5';
const GOLD = '#B8860B';

export function BookJustin() {
  return (
    <div className="relative min-h-screen bg-white">
      <SEO
        title="Meet Justin | Founder of EquityMD"
        description="Justin Nassie has been in commercial real estate since 2007, connecting syndicators with accredited investors. Learn his story and book a time to connect."
      />
      <Navbar />

      {/* ===== HERO ===== */}
      <section
        className="pt-28 pb-16 sm:pb-20"
        style={{ background: 'linear-gradient(120deg,#ffffff 0%,#faf9f7 55%,#f3f2ef 100%)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">

            {/* LEFT: text */}
            <div>
              {/* Eyebrow */}
              <div className="flex items-center gap-3 mb-6">
                <span className="block h-px w-10" style={{ backgroundColor: GOLD }} />
                <span
                  className="text-xs font-semibold tracking-[0.18em] uppercase"
                  style={{ color: GOLD }}
                >
                  Founder &amp; Investor
                </span>
              </div>

              {/* Name */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[0.95]">
                Justin Nassie
              </h1>

              {/* Role */}
              <p className="mt-3 text-2xl sm:text-3xl font-medium" style={{ color: GOLD }}>
                Founder of EquityMD
              </p>

              {/* Headline */}
              <h2 className="mt-7 text-3xl sm:text-4xl font-bold leading-snug text-gray-900">
                <span style={{ color: GOLD }}>Your Capital Partner.</span>
                <br />
                <span>Deals Worth Doing.</span>
              </h2>

              {/* Subhead */}
              <p className="mt-5 text-lg text-gray-500 max-w-lg leading-relaxed">
                In commercial real estate since 2007. Connecting syndicators with a
                proven network of accredited investors — and investing alongside them.
              </p>

              {/* Buttons */}
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href={BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-white shadow-sm transition hover:brightness-95"
                  style={{ backgroundColor: GOLD }}
                >
                  <Calendar className="h-5 w-5" />
                  Book a Call
                </a>
                <a
                  href="#story"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-gray-900 bg-white border border-gray-300 transition hover:bg-gray-50"
                >
                  My Story
                </a>
              </div>
            </div>

            {/* RIGHT: framed portrait */}
            <div className="flex justify-center lg:justify-end">
              <div
                className="rounded-3xl overflow-hidden bg-[#faf9f7] w-full max-w-md"
                style={{ border: `2px solid ${GOLD}`, aspectRatio: '4 / 5' }}
              >
                <img
                  src="/images/justin-portrait.jpg"
                  alt="Justin Nassie, Founder of EquityMD"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== STORY + BOOKING ===== */}
      <main id="story" className="py-16 bg-white scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-start">

            {/* LEFT: Story */}
            <div className="lg:col-span-3">
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
                      <div
                        className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(184,134,11,0.1)' }}
                      >
                        <item.icon className="h-5 w-5" style={{ color: GOLD }} />
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
                {/* CTA header */}
                <div className="p-8 text-center" style={{ background: `linear-gradient(135deg,${GOLD},#8a6608)` }}>
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/15 mb-4">
                    <Calendar className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Grab a time on my calendar
                  </h3>
                  <p className="text-white/80 text-sm mb-6">
                    See my availability and pick a slot that works for you.
                  </p>
                  <a
                    href={BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 font-semibold px-7 py-3.5 rounded-lg transition shadow-md w-full justify-center"
                    style={{ color: GOLD }}
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
                      <div
                        className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(184,134,11,0.1)' }}
                      >
                        <item.icon className="h-4 w-4" style={{ color: GOLD }} />
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
