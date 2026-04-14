import type { Context } from "https://edge.netlify.com";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") || "https://fzacguhxadpvjrmycwes.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "";
const SITE_URL = "https://equitymd.com";
const DEFAULT_IMAGE = "https://auth.equitymd.com/storage/v1/object/public/images/shutterstock_2568276509.jpg";

const USER_AGENTS = [
  "linkedinbot", "facebookexternalhit", "twitterbot", "slackbot",
  "whatsapp", "telegrambot", "discordbot", "pinterest",
  "googlebot", "bingbot",
];

function isBot(userAgent: string): boolean {
  return USER_AGENTS.some((bot) => userAgent.toLowerCase().includes(bot));
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function fetchSupabase(query: string) {
  const url = `${SUPABASE_URL}/rest/v1${query}`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  return res.ok ? res.json() : null;
}

interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  image?: string;
  bodyContent: string;
  jsonLd?: object | object[];
}

function generateFullHtml(meta: PageMeta): string {
  const jsonLdScript = meta.jsonLd
    ? Array.isArray(meta.jsonLd)
      ? meta.jsonLd.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n  ")
      : `<script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>`
    : "";
  const image = meta.image || DEFAULT_IMAGE;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}">
  <link rel="canonical" href="${escapeHtml(meta.canonical)}">
  <meta property="og:title" content="${escapeHtml(meta.title)}">
  <meta property="og:description" content="${escapeHtml(meta.description)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:secure_url" content="${escapeHtml(image)}">
  <meta property="og:url" content="${escapeHtml(meta.canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="EquityMD">
  <meta property="og:locale" content="en_US">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(meta.title)}">
  <meta name="twitter:description" content="${escapeHtml(meta.description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  ${jsonLdScript ? `  ${jsonLdScript}` : ""}
</head>
<body>
  <main>
    ${meta.bodyContent}
  </main>
  <noscript>
    <p>Please enable JavaScript to view the full experience at <a href="${escapeHtml(meta.canonical)}">${escapeHtml(meta.canonical)}</a></p>
  </noscript>
</body>
</html>`;
}

const STATIC_PAGES: Record<string, PageMeta> = {
  "/": {
    title: "EquityMD — Real Estate Syndication Platform for Accredited Investors",
    description: "EquityMD connects accredited investors with institutional-quality real estate investment opportunities. Browse verified syndicators, discover curated deals, and build passive income through commercial real estate.",
    canonical: SITE_URL,
    bodyContent: `
<h1>EquityMD — Connect with Verified Real Estate Syndicators</h1>
<p>EquityMD connects accredited investors with institutional-quality real estate investment opportunities. Browse verified syndicators, discover curated deals, and build passive income through commercial real estate.</p>
<h2>Why EquityMD?</h2>
<ul>
<li>Verified syndicator directory with track records</li>
<li>Curated multifamily and commercial real estate deals</li>
<li>Due diligence tools and market reports</li>
<li>Free for investors — browse deals and connect directly</li>
</ul>
<p><a href="${SITE_URL}">View full site</a></p>`,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "EquityMD",
        "url": SITE_URL,
        "description": "EquityMD connects accredited investors with institutional-quality real estate investment opportunities through verified syndicators.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${SITE_URL}/find?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "EquityMD",
        "url": SITE_URL,
        "logo": `${SITE_URL}/favicon.svg`,
      },
    ],
  },
  "/find": {
    title: "Browse Real Estate Deals | Multifamily & CRE Investments | EquityMD",
    description: "Browse curated real estate syndication deals. Multifamily, commercial, industrial — find passive income opportunities from verified syndicators.",
    canonical: `${SITE_URL}/find`,
    bodyContent: `
<h1>Browse Real Estate Deals</h1>
<p>Discover multifamily and commercial real estate syndication opportunities from verified syndicators. Filter by property type, location, and investment terms.</p>
<p><a href="${SITE_URL}/find">Browse deals</a></p>`,
  },
  "/directory": {
    title: "Real Estate Syndicator Directory | Verified CRE Sponsors | EquityMD",
    description: "Browse 400+ verified real estate syndicators. Compare track records, reviews, minimum investments, and specialties. Free for investors.",
    canonical: `${SITE_URL}/directory`,
    bodyContent: ``,
    jsonLd: { "@context": "https://schema.org", "@type": "CollectionPage", "name": "Real Estate Syndicator Directory", "url": `${SITE_URL}/directory` },
  },
  "/how-it-works": {
    title: "How Real Estate Syndication Works | EquityMD",
    description: "Learn how real estate syndication works. From discovery to investment — understand the process and start building passive income.",
    canonical: `${SITE_URL}/how-it-works`,
    bodyContent: `
<h1>How Real Estate Syndication Works</h1>
<p>Real estate syndication pools capital from multiple investors to purchase properties. Syndicators find and manage deals; investors receive passive returns.</p>
<p><a href="${SITE_URL}/how-it-works">Learn more</a></p>`,
  },
  "/about": {
    title: "About EquityMD | Connecting Investors with Syndicators",
    description: "EquityMD is the premier marketplace connecting accredited investors with verified real estate syndicators. Learn about our mission and team.",
    canonical: `${SITE_URL}/about`,
    bodyContent: `
<h1>About EquityMD</h1>
<p>EquityMD connects accredited investors with verified real estate syndicators. We provide a transparent marketplace for commercial real estate investments.</p>
<p><a href="${SITE_URL}/about">About us</a></p>`,
  },
  "/contact": {
    title: "Contact EquityMD | Get in Touch",
    description: "Contact EquityMD for investor or syndicator support. We typically respond within 24-48 hours.",
    canonical: `${SITE_URL}/contact`,
    bodyContent: `
<h1>Contact EquityMD</h1>
<p>Get in touch with our team. We respond to all inquiries within 24-48 business hours.</p>
<p><a href="${SITE_URL}/contact">Contact us</a></p>`,
  },
  "/pricing": {
    title: "Syndicator Pricing & Plans | EquityMD",
    description: "Pricing plans for syndicators to list deals on EquityMD. Reach thousands of accredited investors.",
    canonical: `${SITE_URL}/pricing`,
    bodyContent: `
<h1>Syndicator Pricing & Plans</h1>
<p>List your deals on EquityMD and reach accredited investors. Flexible plans for syndicators.</p>
<p><a href="${SITE_URL}/pricing">View pricing</a></p>`,
  },
};

export default async function handler(request: Request, context: Context) {
  const userAgent = request.headers.get("user-agent") || "";
  if (!isBot(userAgent)) return context.next();

  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/$/, "") || "/";

  // Static page
  const staticMeta = STATIC_PAGES[pathname];
  if (staticMeta) {
    let meta = { ...staticMeta };
    if (pathname === "/directory" && SUPABASE_ANON_KEY) {
      const syndicators = await fetchSupabase("/syndicators?select=company_name,city,state,active_deals&verification_status=in.(verified,premier)&limit=30") as any[] | null;
      if (syndicators && syndicators.length > 0) {
        const list = syndicators.slice(0, 30).map((s) =>
          `${escapeHtml(s.company_name || "")} — ${escapeHtml(s.city || "")}, ${escapeHtml(s.state || "")} (${s.active_deals || 0} deals)`
        ).join("; ");
        meta.bodyContent = `
<h1>Real Estate Syndicator Directory</h1>
<p>Browse verified real estate syndicators. Compare track records, reviews, and specialties.</p>
<h2>Featured Syndicators</h2>
<p>${list}</p>
<p><a href="${SITE_URL}/directory">View full directory</a></p>`;
      }
    }
    return new Response(generateFullHtml(meta), {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  // Blog listing
  if (pathname === "/blog") {
    const posts = await fetchSupabase("/blog_posts?is_published=eq.true&order=published_at.desc&limit=10&select=slug,title,excerpt") as any[] | null;
    let body = `<h1>Real Estate Investing Blog | Syndication Insights | EquityMD</h1><p>Educational articles on real estate syndication, deal analysis, and passive investing.</p>`;
    if (posts && posts.length > 0) {
      body += "<h2>Recent Articles</h2><ul>";
      for (const p of posts) {
        body += `<li><a href="${SITE_URL}/blog/${escapeHtml(p.slug || "")}">${escapeHtml(p.title || "")}</a> — ${escapeHtml((p.excerpt || "").substring(0, 120))}...</li>`;
      }
      body += "</ul>";
    }
    body += `<p><a href="${SITE_URL}/blog">View all posts</a></p>`;
    return new Response(generateFullHtml({
      title: "Real Estate Investing Blog | Syndication Insights | EquityMD",
      description: "Educational articles on real estate syndication, deal analysis, market trends, and passive investing.",
      canonical: `${SITE_URL}/blog`,
      bodyContent: body,
    }), { headers: { "content-type": "text/html; charset=utf-8" } });
  }

  // Blog post
  if (pathname.startsWith("/blog/") && pathname !== "/blog") {
    const slug = pathname.replace("/blog/", "").replace(/\/$/, "");
    const posts = await fetchSupabase(`/blog_posts?slug=eq.${encodeURIComponent(slug)}&select=title,excerpt,image_url,published_at,author,category,meta_description`) as any[] | null;
    if (posts && posts.length > 0) {
      const post = posts[0];
      const title = `${post.title} | EquityMD Blog`;
      const desc = post.meta_description || post.excerpt || "Read this article on EquityMD";
      const img = post.image_url || DEFAULT_IMAGE;
      const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "description": desc,
        "image": img,
        "datePublished": post.published_at,
        "author": { "@type": "Person", "name": post.author || "EquityMD" },
      };
      return new Response(generateFullHtml({
        title,
        description: desc.substring(0, 160),
        canonical: `${SITE_URL}/blog/${slug}`,
        image: img,
        bodyContent: `
<h1>${escapeHtml(post.title)}</h1>
<p><em>By ${escapeHtml(post.author || "EquityMD")}${post.published_at ? ` · ${new Date(post.published_at).toLocaleDateString()}` : ""}</em></p>
<p>${escapeHtml((post.excerpt || desc).substring(0, 500))}</p>
<p><a href="${SITE_URL}/blog/${slug}">Read full article</a></p>`,
        jsonLd: articleSchema,
      }), { headers: { "content-type": "text/html; charset=utf-8" } });
    }
  }

  // Deal page
  if (pathname.startsWith("/deals/") && pathname !== "/deals") {
    const slug = pathname.replace("/deals/", "").replace(/\/$/, "");
    const deals = await fetchSupabase(`/deals?slug=eq.${encodeURIComponent(slug)}&select=id,name,tagline,description,city,state,property_type`) as any[] | null;
    if (deals && deals.length > 0) {
      const deal = deals[0];
      let image = DEFAULT_IMAGE;
      const media = await fetchSupabase(`/deal_media?deal_id=eq.${deal.id}&is_cover=eq.true&select=url`) as any[] | null;
      if (media && media[0]?.url) image = media[0].url;
      const title = `${deal.name} | EquityMD`;
      const desc = deal.tagline || (deal.description || "").substring(0, 160) || `${deal.property_type} in ${deal.city}, ${deal.state}`;
      const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": deal.name,
        "description": desc,
        "image": image,
      };
      return new Response(generateFullHtml({
        title,
        description: desc,
        canonical: `${SITE_URL}/deals/${slug}`,
        image,
        bodyContent: `
<h1>${escapeHtml(deal.name)}</h1>
<p>${escapeHtml(desc)}</p>
<p>${escapeHtml(deal.property_type || "")} investment in ${escapeHtml(deal.city || "")}, ${escapeHtml(deal.state || "")}</p>
<p><a href="${SITE_URL}/deals/${slug}">View deal details</a></p>`,
        jsonLd: productSchema,
      }), { headers: { "content-type": "text/html; charset=utf-8" } });
    }
  }

  // Syndicator profile (use company_name, company_description, company_logo_url)
  if (pathname.startsWith("/syndicators/") && pathname !== "/syndicators") {
    const slug = pathname.replace("/syndicators/", "").replace(/\/$/, "");
    const syndicators = await fetchSupabase(`/syndicators?slug=eq.${encodeURIComponent(slug)}&select=company_name,company_description,company_logo_url,city,state,years_in_business`) as any[] | null;
    if (syndicators && syndicators.length > 0) {
      const s = syndicators[0];
      const title = `${s.company_name} Reviews & Ratings 2026 | EquityMD`;
      const desc = (s.company_description || `${s.company_name} is a verified real estate syndicator`).substring(0, 160);
      const img = s.company_logo_url || DEFAULT_IMAGE;
      const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": s.company_name,
        "description": desc,
        "image": img,
      };
      return new Response(generateFullHtml({
        title,
        description: desc,
        canonical: `${SITE_URL}/syndicators/${slug}`,
        image: img,
        bodyContent: `
<h1>${escapeHtml(s.company_name)}</h1>
<p>${escapeHtml((s.company_description || "").substring(0, 400))}</p>
<p>${s.city || ""}, ${s.state || ""} · ${s.years_in_business || "—"} years in business</p>
<p><a href="${SITE_URL}/syndicators/${slug}">View full profile</a></p>`,
        jsonLd: orgSchema,
      }), { headers: { "content-type": "text/html; charset=utf-8" } });
    }
  }

  // City page
  if (pathname.startsWith("/cities/")) {
    const citySlug = pathname.replace("/cities/", "").replace(/\/$/, "");
    const cities = await fetchSupabase(`/cities?slug=eq.${encodeURIComponent(citySlug)}&select=name,state,median_price,sales_change,market_trends`) as any[] | null;
    if (cities && cities.length > 0) {
      const c = cities[0];
      const title = `${c.name} Real Estate Market | EquityMD`;
      const desc = `Market data for ${c.name}, ${c.state}. Median price, sales trends, and investment insights.`;
      return new Response(generateFullHtml({
        title,
        description: desc,
        canonical: `${SITE_URL}/cities/${citySlug}`,
        bodyContent: `
<h1>${escapeHtml(c.name)} Real Estate Market</h1>
<p>${escapeHtml(c.market_trends || desc)}</p>
<p><a href="${SITE_URL}/cities/${citySlug}">View full market report</a></p>`,
      }), { headers: { "content-type": "text/html; charset=utf-8" } });
    }
  }

  // Resources (glossary, due-diligence, etc.)
  if (pathname.startsWith("/resources/")) {
    const resource = pathname.replace("/resources/", "").replace(/\/$/, "") || "glossary";
    const titles: Record<string, string> = {
      glossary: "Real Estate Syndication Glossary | EquityMD",
      "due-diligence": "Due Diligence Guide | EquityMD",
      calculator: "Investment Calculator | EquityMD",
    };
    const title = titles[resource] || `Resources | EquityMD`;
    return new Response(generateFullHtml({
      title,
      description: `EquityMD resources for real estate investors. ${resource === "glossary" ? "Glossary of syndication terms." : "Tools and guides."}`,
      canonical: `${SITE_URL}/resources/${resource}`,
      bodyContent: `<h1>${escapeHtml(title)}</h1><p><a href="${SITE_URL}/resources/${resource}">View full page</a></p>`,
    }), { headers: { "content-type": "text/html; charset=utf-8" } });
  }

  // Success stories
  if (pathname === "/success-stories") {
    return new Response(generateFullHtml({
      title: "Real Estate Investing Success Stories | EquityMD",
      description: "Read real success stories from investors who built passive income through real estate syndication on EquityMD.",
      canonical: `${SITE_URL}/success-stories`,
      bodyContent: `<h1>Real Estate Investing Success Stories</h1><p>Discover how investors are building passive income through real estate syndication.</p><p><a href="${SITE_URL}/success-stories">Read stories</a></p>`,
    }), { headers: { "content-type": "text/html; charset=utf-8" } });
  }

  // Market map
  if (pathname === "/market-map") {
    return new Response(generateFullHtml({
      title: "Real Estate Investment Market Map | EquityMD",
      description: "Interactive map showing real estate syndication deals and syndicators across the US. Find investment opportunities near you.",
      canonical: `${SITE_URL}/market-map`,
      bodyContent: `<h1>Real Estate Investment Market Map</h1><p>Explore syndication opportunities across the US on our interactive market map.</p><p><a href="${SITE_URL}/market-map">View map</a></p>`,
    }), { headers: { "content-type": "text/html; charset=utf-8" } });
  }

  // Compare syndicators
  if (pathname === "/compare") {
    return new Response(generateFullHtml({
      title: "Compare Real Estate Syndicators | EquityMD",
      description: "Side-by-side comparison of real estate syndicators. Compare track records, fees, minimum investments, and reviews.",
      canonical: `${SITE_URL}/compare`,
      bodyContent: `<h1>Compare Real Estate Syndicators</h1><p>Compare syndicators side-by-side to find the best fit for your investment goals.</p><p><a href="${SITE_URL}/compare">Compare now</a></p>`,
    }), { headers: { "content-type": "text/html; charset=utf-8" } });
  }

  // New pricing
  if (pathname === "/new-pricing") {
    return new Response(generateFullHtml({
      title: "Syndicator Plans & Pricing 2026 | EquityMD",
      description: "Affordable plans for syndicators to list deals on EquityMD and reach thousands of accredited investors.",
      canonical: `${SITE_URL}/new-pricing`,
      bodyContent: `<h1>Syndicator Plans & Pricing</h1><p>List your deals on EquityMD. Free to start, premium plans for more visibility.</p><p><a href="${SITE_URL}/new-pricing">View plans</a></p>`,
    }), { headers: { "content-type": "text/html; charset=utf-8" } });
  }

  // Legal pages
  if (pathname.startsWith("/legal/")) {
    const page = pathname.replace("/legal/", "").replace(/\/$/, "");
    const legalTitles: Record<string, string> = {
      privacy: "Privacy Policy | EquityMD",
      terms: "Terms of Service | EquityMD",
      disclaimer: "Investment Disclaimer | EquityMD",
      accreditation: "Accreditation Requirements | EquityMD",
      compliance: "Compliance & Regulatory | EquityMD",
    };
    const title = legalTitles[page] || "Legal | EquityMD";
    return new Response(generateFullHtml({
      title,
      description: `${title.replace(" | EquityMD", "")} for EquityMD real estate syndication platform.`,
      canonical: `${SITE_URL}/legal/${page}`,
      bodyContent: `<h1>${escapeHtml(title.replace(" | EquityMD", ""))}</h1><p><a href="${SITE_URL}/legal/${page}">Read full document</a></p>`,
    }), { headers: { "content-type": "text/html; charset=utf-8" } });
  }

  // Rankings
  if (pathname.startsWith("/rankings")) {
    const cat = pathname.replace("/rankings", "").replace(/^\//, "").replace(/\/$/, "");
    const title = cat ? `Best ${cat.replace(/-/g, " ")} 2026 | EquityMD` : "Best Real Estate Syndicators 2026 | EquityMD";
    return new Response(generateFullHtml({
      title,
      description: `Compare top real estate syndicators. Ranked by reviews, track record, and deal volume.`,
      canonical: `${SITE_URL}/rankings${cat ? `/${cat}` : ""}`,
      bodyContent: `<h1>${escapeHtml(title)}</h1><p><a href="${SITE_URL}/rankings${cat ? `/${cat}` : ""}">View rankings</a></p>`,
    }), { headers: { "content-type": "text/html; charset=utf-8" } });
  }

  return context.next();
}
