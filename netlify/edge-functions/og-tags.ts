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

const STATE_ABBREVS: Record<string, string> = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
  'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
  'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
  'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
  'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new-hampshire': 'NH', 'new-jersey': 'NJ',
  'new-mexico': 'NM', 'new-york': 'NY', 'north-carolina': 'NC', 'north-dakota': 'ND', 'ohio': 'OH',
  'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode-island': 'RI', 'south-carolina': 'SC',
  'south-dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
  'virginia': 'VA', 'washington': 'WA', 'west-virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
  'district-of-columbia': 'DC',
};

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function markdownToHtml(md: string): string {
  if (!md) return "";
  // Split into blocks by double newlines
  const blocks = md.split(/\n\n+/);
  const htmlBlocks: string[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Headings
    if (trimmed.startsWith("### ")) {
      htmlBlocks.push(`<h3>${inlineFormat(trimmed.slice(4).trim())}</h3>`);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      htmlBlocks.push(`<h2>${inlineFormat(trimmed.slice(3).trim())}</h2>`);
      continue;
    }
    if (trimmed.startsWith("# ")) {
      htmlBlocks.push(`<h2>${inlineFormat(trimmed.slice(2).trim())}</h2>`);
      continue;
    }

    // List block
    const lines = trimmed.split("\n");
    if (lines.every((l) => /^\s*[-*]\s/.test(l))) {
      const items = lines.map((l) => `<li>${inlineFormat(l.replace(/^\s*[-*]\s+/, ""))}</li>`).join("\n");
      htmlBlocks.push(`<ul>${items}</ul>`);
      continue;
    }

    // Paragraph (preserve single newlines as <br>)
    const content = lines.map((l) => inlineFormat(l)).join("<br>\n");
    htmlBlocks.push(`<p>${content}</p>`);
  }

  return htmlBlocks.join("\n");
}

function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
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
<h1>EquityMD — The Marketplace for Real Estate Syndication Deals</h1>
<p>EquityMD connects accredited investors with verified real estate syndicators and institutional-quality investment opportunities. Browse curated deals, compare sponsors, and build passive income through commercial real estate.</p>
<h2>Why Investors Choose EquityMD</h2>
<ul>
<li><strong>400+ Verified Syndicators</strong> — browse the largest directory of real estate syndication sponsors with track records, reviews, and deal history</li>
<li><strong>Curated Syndication Deals</strong> — multifamily apartments, industrial, medical office, self-storage, and more</li>
<li><strong>Due Diligence Tools</strong> — investment calculator, market reports by state, and educational resources</li>
<li><strong>Free for Investors</strong> — browse deals and connect with syndicators at no cost</li>
</ul>
<h2>How Real Estate Syndication Works</h2>
<p>Real estate syndication pools capital from multiple accredited investors to acquire commercial properties. A professional syndicator (sponsor) manages the property while investors receive quarterly distributions and a share of profits at sale. Typical returns target 15-20% IRR over 3-7 year hold periods.</p>
<h2>Explore EquityMD</h2>
<ul>
<li><a href="${SITE_URL}/find">Browse Syndication Deals</a></li>
<li><a href="${SITE_URL}/directory">Syndicator Directory</a></li>
<li><a href="${SITE_URL}/rankings">Top Syndicators 2026</a></li>
<li><a href="${SITE_URL}/how-it-works">How Syndication Works</a></li>
<li><a href="${SITE_URL}/blog">Investing Blog</a></li>
<li><a href="${SITE_URL}/resources/market-reports">Market Reports by State</a></li>
<li><a href="${SITE_URL}/resources/glossary">Syndication Glossary</a></li>
<li><a href="${SITE_URL}/resources/calculator">Returns Calculator</a></li>
</ul>`,
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
    title: "Browse Real Estate Syndication Deals | Find Passive Income Investments | EquityMD",
    description: "Browse active real estate syndication deals from verified sponsors. Filter by property type, location, target IRR & minimum investment. Multifamily, industrial & more.",
    canonical: `${SITE_URL}/find`,
    bodyContent: `
<h1>Browse Real Estate Syndication Deals</h1>
<p>Discover active real estate syndication opportunities from verified syndicators on EquityMD. Filter by property type, location, target IRR, and minimum investment amount.</p>
<h2>Property Types Available</h2>
<ul>
<li>Multifamily Apartments — Value-add and stabilized</li>
<li>Industrial & Logistics — Warehouses and distribution centers</li>
<li>Medical Office — Healthcare real estate investments</li>
<li>Self-Storage — Recession-resistant asset class</li>
<li>Retail & Mixed-Use — Commercial and residential blends</li>
</ul>
<p>Minimum investments typically range from $25,000 to $100,000. Most deals target 15-20% IRR with 3-7 year hold periods and quarterly cash distributions.</p>
<p><a href="${SITE_URL}/find">Browse all deals</a> | <a href="${SITE_URL}/directory">View syndicators</a> | <a href="${SITE_URL}/how-it-works">How it works</a></p>`,
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
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Invest in Real Estate Syndications",
      "description": "A step-by-step guide to investing in real estate syndications through EquityMD.",
      "step": [
        { "@type": "HowToStep", "name": "Browse Deals", "text": "Explore verified syndication opportunities on EquityMD. Filter by property type, location, target returns, and minimum investment." },
        { "@type": "HowToStep", "name": "Due Diligence", "text": "Review syndicator track records, ratings, deal history, and investor reviews. Compare syndicators side-by-side." },
        { "@type": "HowToStep", "name": "Invest", "text": "Connect with syndicators directly, review offering documents, and fund your investment to start earning passive income." },
      ],
    },
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
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" },
    });
  }

  // Blog listing
  if (pathname === "/blog") {
    const posts = await fetchSupabase("/blog_posts?is_published=eq.true&order=published_at.desc&limit=50&select=slug,title,excerpt,category,published_at,author") as any[] | null;
    let body = `<h1>Real Estate Investing Blog — Syndication Insights & Market Analysis</h1>
<p>Educational articles on real estate syndication, deal analysis, market trends, tax strategies, and passive investing for accredited investors. Written by experienced syndicators and investment professionals.</p>`;
    if (posts && posts.length > 0) {
      // Group by category
      const byCategory: Record<string, typeof posts> = {};
      const uncategorized: typeof posts = [];
      for (const p of posts) {
        if (p.category) {
          if (!byCategory[p.category]) byCategory[p.category] = [];
          byCategory[p.category]!.push(p);
        } else {
          uncategorized.push(p);
        }
      }
      const categories = Object.keys(byCategory).sort();
      for (const cat of categories) {
        body += `\n<h2>${escapeHtml(cat)}</h2>`;
        for (const p of byCategory[cat]!) {
          const date = p.published_at ? new Date(p.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";
          body += `\n<article>
<h3><a href="${SITE_URL}/blog/${escapeHtml(p.slug || "")}">${escapeHtml(p.title || "")}</a></h3>
<p><em>${date}${p.author ? ` · By ${escapeHtml(p.author)}` : ""}</em></p>
<p>${escapeHtml((p.excerpt || "").substring(0, 300))}</p>
</article>`;
        }
      }
      if (uncategorized.length > 0) {
        body += `\n<h2>More Articles</h2>`;
        for (const p of uncategorized) {
          const date = p.published_at ? new Date(p.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";
          body += `\n<article>
<h3><a href="${SITE_URL}/blog/${escapeHtml(p.slug || "")}">${escapeHtml(p.title || "")}</a></h3>
<p><em>${date}${p.author ? ` · By ${escapeHtml(p.author)}` : ""}</em></p>
<p>${escapeHtml((p.excerpt || "").substring(0, 300))}</p>
</article>`;
        }
      }
    }
    body += `\n<h2>Explore EquityMD</h2>
<ul>
<li><a href="${SITE_URL}/find">Browse Syndication Deals</a></li>
<li><a href="${SITE_URL}/directory">Syndicator Directory</a></li>
<li><a href="${SITE_URL}/resources/glossary">Syndication Glossary</a></li>
<li><a href="${SITE_URL}/resources/calculator">Returns Calculator</a></li>
</ul>`;
    return new Response(generateFullHtml({
      title: "Real Estate Investing Blog | Syndication Insights & Market Analysis | EquityMD",
      description: "Educational articles on real estate syndication, deal analysis, market trends, tax strategies, and passive investing for accredited investors.",
      canonical: `${SITE_URL}/blog`,
      bodyContent: body,
    }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
  }

  // Blog post
  if (pathname.startsWith("/blog/") && pathname !== "/blog") {
    const slug = pathname.replace("/blog/", "").replace(/\/$/, "");
    const posts = await fetchSupabase(`/blog_posts?slug=eq.${encodeURIComponent(slug)}&select=title,excerpt,content,image_url,published_at,author,category,meta_description,faq_schema,key_takeaways,sources`) as any[] | null;
    if (posts && posts.length > 0) {
      const post = posts[0];
      const title = `${post.title} | EquityMD Blog`;
      const desc = post.meta_description || post.excerpt || "Read this article on EquityMD";
      const img = post.image_url || DEFAULT_IMAGE;
      const date = post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";

      // Convert markdown content to HTML
      const convertedMarkdownContent = markdownToHtml(post.content || post.excerpt || "");

      // FAQ section
      let faqSection = "";
      let faqItems: { question: string; answer: string }[] = [];
      if (post.faq_schema) {
        try {
          const faqData = typeof post.faq_schema === "string" ? JSON.parse(post.faq_schema) : post.faq_schema;
          if (Array.isArray(faqData) && faqData.length > 0) {
            faqItems = faqData;
            faqSection = `<h2>Frequently Asked Questions</h2>`;
            for (const faq of faqData) {
              faqSection += `\n<h3>${escapeHtml(faq.question || faq.q || "")}</h3>\n<p>${escapeHtml(faq.answer || faq.a || "")}</p>`;
            }
          }
        } catch (_e) { /* ignore parse errors */ }
      }

      // Key takeaways section
      let keyTakeawaysSection = "";
      if (post.key_takeaways) {
        try {
          const takeaways = typeof post.key_takeaways === "string" ? JSON.parse(post.key_takeaways) : post.key_takeaways;
          if (Array.isArray(takeaways) && takeaways.length > 0) {
            keyTakeawaysSection = `<h2>Key Takeaways</h2>\n<ul>${takeaways.map((t: string) => `<li>${escapeHtml(t)}</li>`).join("\n")}</ul>`;
          }
        } catch (_e) { /* ignore parse errors */ }
      }

      // Sources section
      let sourcesSection = "";
      if (post.sources) {
        try {
          const sources = typeof post.sources === "string" ? JSON.parse(post.sources) : post.sources;
          if (Array.isArray(sources) && sources.length > 0) {
            sourcesSection = `<h2>Sources</h2>\n<ol>${sources.map((s: any) => {
              if (typeof s === "string") return `<li>${escapeHtml(s)}</li>`;
              return `<li>${s.url ? `<a href="${escapeHtml(s.url)}">${escapeHtml(s.title || s.name || s.url)}</a>` : escapeHtml(s.title || s.name || "")}</li>`;
            }).join("\n")}</ol>`;
          }
        } catch (_e) { /* ignore parse errors */ }
      }

      // Related articles (same category, different slug)
      let relatedSection = "";
      if (post.category) {
        const related = await fetchSupabase(`/blog_posts?is_published=eq.true&category=eq.${encodeURIComponent(post.category)}&slug=neq.${encodeURIComponent(slug)}&order=published_at.desc&limit=5&select=slug,title,excerpt`) as any[] | null;
        if (related && related.length > 0) {
          relatedSection = `<h2>Related Articles</h2>\n<ul>${related.map((r) =>
            `<li><a href="${SITE_URL}/blog/${escapeHtml(r.slug)}">${escapeHtml(r.title)}</a>${r.excerpt ? ` — ${escapeHtml(r.excerpt.substring(0, 100))}` : ""}</li>`
          ).join("\n")}</ul>`;
        }
      }
      // If no category matches or too few, fetch recent posts
      if (!relatedSection) {
        const recent = await fetchSupabase(`/blog_posts?is_published=eq.true&slug=neq.${encodeURIComponent(slug)}&order=published_at.desc&limit=5&select=slug,title,excerpt`) as any[] | null;
        if (recent && recent.length > 0) {
          relatedSection = `<h2>More from EquityMD Blog</h2>\n<ul>${recent.map((r) =>
            `<li><a href="${SITE_URL}/blog/${escapeHtml(r.slug)}">${escapeHtml(r.title)}</a>${r.excerpt ? ` — ${escapeHtml(r.excerpt.substring(0, 100))}` : ""}</li>`
          ).join("\n")}</ul>`;
        }
      }

      // Schema.org
      const schemas: object[] = [{
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "description": desc,
        "image": img,
        "datePublished": post.published_at,
        "author": { "@type": "Person", "name": post.author || "EquityMD Team" },
        "publisher": { "@type": "Organization", "name": "EquityMD", "url": SITE_URL },
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${SITE_URL}/blog/${slug}` },
      }];
      if (faqItems.length > 0) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqItems.map((f) => ({
            "@type": "Question",
            "name": f.question || (f as any).q || "",
            "acceptedAnswer": { "@type": "Answer", "text": f.answer || (f as any).a || "" },
          })),
        });
      }

      return new Response(generateFullHtml({
        title,
        description: desc.substring(0, 160),
        canonical: `${SITE_URL}/blog/${slug}`,
        image: img,
        bodyContent: `
<h1>${escapeHtml(post.title)}</h1>
<p><em>By ${escapeHtml(post.author || "EquityMD Team")} · ${date}</em></p>
${convertedMarkdownContent}
${faqSection}
${keyTakeawaysSection}
${sourcesSection}
${relatedSection}
<p><a href="${SITE_URL}/blog">← Back to all articles</a></p>`,
        jsonLd: schemas,
      }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
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
      }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
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
      }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
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
      }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
    }
  }

  // State market reports (must be before generic /resources/* handler)
  if (pathname.startsWith("/resources/market-reports/") && pathname !== "/resources/market-reports" && pathname !== "/resources/market-reports/") {
    const stateSlug = pathname.replace("/resources/market-reports/", "").replace(/\/$/, "");
    const stateName = stateSlug.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    const stateAbbrev = STATE_ABBREVS[stateSlug.toLowerCase()] || "";

    // Fetch real data from Supabase in parallel
    const [cities, syndicators, deals] = await Promise.all([
      stateAbbrev ? fetchSupabase(`/cities?state=eq.${stateAbbrev}&select=name,slug,median_price,sales_change&limit=10&order=median_price.desc`) as Promise<any[] | null> : Promise.resolve(null),
      stateAbbrev ? fetchSupabase(`/syndicators?state=eq.${stateAbbrev}&select=company_name,slug,city,active_deals&verification_status=in.(verified,premier)&limit=10`) as Promise<any[] | null> : Promise.resolve(null),
      stateAbbrev ? fetchSupabase(`/deals?state=eq.${stateAbbrev}&select=name,slug,property_type,city&status=eq.active&limit=10`) as Promise<any[] | null> : Promise.resolve(null),
    ]);

    const cityCount = cities?.length || 0;
    const syndCount = syndicators?.length || 0;
    const dealCount = deals?.length || 0;
    const hasData = cityCount > 0 || syndCount > 0 || dealCount > 0;

    // Build unique meta description from real data
    const descParts: string[] = [];
    if (syndCount > 0) descParts.push(`${syndCount}+ verified syndicators`);
    if (dealCount > 0) descParts.push(`${dealCount} active investment opportunities`);
    if (cityCount > 0) descParts.push(`market data for ${cityCount} cities`);
    const metaDesc = hasData
      ? `${stateName} real estate syndication: ${descParts.join(", ")} on EquityMD. Explore cap rates, property trends, and investment analysis across ${stateName}.`
      : `${stateName} real estate market analysis for syndication investors. Property trends, cap rates, population growth, and investment opportunities across ${stateName}. Browse syndicators and deals on EquityMD.`;

    const title = `${stateName} Real Estate Market Report 2026 | Investment Trends & Data | EquityMD`;

    // --- Build rich body content ---
    let body = `<h1>${escapeHtml(stateName)} Real Estate Market Report 2026</h1>`;
    body += `<p>${escapeHtml(stateName)} real estate market analysis for syndication investors. Whether you're a seasoned LP or exploring your first passive real estate investment, this report covers property trends, cap rates, population growth, and investment opportunities across ${escapeHtml(stateName)}.</p>`;

    // Top Markets section
    body += `<h2>Top ${escapeHtml(stateName)} Markets for Real Estate Investment</h2>`;
    if (cities && cityCount > 0) {
      body += `<p>These are the leading real estate markets in ${escapeHtml(stateName)} based on median home prices and sales activity:</p><ul>`;
      for (const c of cities) {
        const priceStr = c.median_price ? `$${Number(c.median_price).toLocaleString("en-US")}` : "N/A";
        const changeStr = c.sales_change != null ? ` (${c.sales_change > 0 ? "+" : ""}${c.sales_change}% YoY)` : "";
        body += `<li><a href="${SITE_URL}/cities/${escapeHtml(c.slug || "")}">${escapeHtml(c.name)}</a> — Median Price: ${priceStr}${changeStr}</li>`;
      }
      body += `</ul>`;
      body += `<p>Tracking local market data helps syndication investors identify emerging opportunities before institutional capital moves in. Cities with strong population growth and employment gains often signal favorable entry points for multifamily and commercial syndications.</p>`;
    } else {
      body += `<p>Market data for ${escapeHtml(stateName)} cities is being compiled. In the meantime, explore the <a href="${SITE_URL}/cities">full city directory</a> for real-time median prices, sales trends, and investment scores across the country. Real estate syndication investors should evaluate metro-level employment data, population migration patterns, and rent-to-price ratios when assessing ${escapeHtml(stateName)} markets.</p>`;
    }

    // Active Syndicators section
    body += `<h2>Active Syndicators in ${escapeHtml(stateName)}</h2>`;
    if (syndicators && syndCount > 0) {
      body += `<p>The following verified syndicators are currently operating in ${escapeHtml(stateName)}:</p><ul>`;
      for (const s of syndicators) {
        const dealNote = s.active_deals ? ` — ${s.active_deals} active deal${s.active_deals > 1 ? "s" : ""}` : "";
        body += `<li><a href="${SITE_URL}/syndicator/${escapeHtml(s.slug || "")}">${escapeHtml(s.company_name)}</a> (${escapeHtml(s.city || stateName)})${dealNote}</li>`;
      }
      body += `</ul>`;
      body += `<p>Choosing the right syndicator is one of the most important decisions for passive investors. Look for a proven track record, transparent reporting, and alignment of interests through co-investment. EquityMD verifies syndicator credentials so you can invest with confidence.</p>`;
    } else {
      body += `<p>We're actively onboarding syndicators in ${escapeHtml(stateName)}. Browse the <a href="${SITE_URL}/directory">full syndicator directory</a> to find operators across all 50 states, or <a href="${SITE_URL}/list">list your syndication</a> to reach accredited investors looking to deploy capital in ${escapeHtml(stateName)}.</p>`;
      body += `<p>Quality syndicators typically have a consistent distribution history, conservative underwriting, and a clear value-add or development strategy. Evaluate general partners based on their exit performance and investor communication track record.</p>`;
    }

    // Current Investment Opportunities section
    body += `<h2>Current Investment Opportunities in ${escapeHtml(stateName)}</h2>`;
    if (deals && dealCount > 0) {
      body += `<p>Active syndication deals available for investment in ${escapeHtml(stateName)}:</p><ul>`;
      for (const d of deals) {
        const locStr = d.city ? ` in ${escapeHtml(d.city)}, ${stateAbbrev}` : "";
        body += `<li><a href="${SITE_URL}/deal/${escapeHtml(d.slug || "")}">${escapeHtml(d.name)}</a> — ${escapeHtml(d.property_type || "Real Estate")}${locStr}</li>`;
      }
      body += `</ul>`;
      body += `<p>Each deal on EquityMD includes detailed offering documents, projected returns, hold period, minimum investment, and sponsor background. Review the full investment thesis and risk factors before committing capital.</p>`;
    } else {
      body += `<p>There are currently no active syndication deals listed in ${escapeHtml(stateName)}. New opportunities are added regularly — <a href="${SITE_URL}/find">browse all active deals</a> or set up alerts to be notified when ${escapeHtml(stateName)} deals launch. Syndicators can <a href="${SITE_URL}/list">list deals for free</a> to reach our investor network.</p>`;
    }

    // Why Invest section (always unique with state-specific content)
    body += `<h2>Why Invest in ${escapeHtml(stateName)} Real Estate</h2>`;
    body += `<p>${escapeHtml(stateName)} presents diverse opportunities for real estate syndication investors. From multifamily apartments and industrial warehouses to retail centers and self-storage facilities, the state's economic fundamentals drive demand across multiple asset classes. Key factors investors should evaluate include:</p>`;
    body += `<ul>`;
    body += `<li><strong>Population Growth:</strong> States with net migration gains create sustained housing and commercial real estate demand.</li>`;
    body += `<li><strong>Employment Trends:</strong> Job creation in technology, healthcare, logistics, and energy sectors supports occupancy rates and rent growth.</li>`;
    body += `<li><strong>Regulatory Environment:</strong> Landlord-friendly states with lower property taxes and fewer rent control restrictions often provide stronger risk-adjusted returns.</li>`;
    body += `<li><strong>Cap Rate Spreads:</strong> Compare local cap rates against the 10-year Treasury yield to assess relative value in ${escapeHtml(stateName)} markets.</li>`;
    body += `<li><strong>Infrastructure Investment:</strong> Federal and state infrastructure spending can catalyze development in specific metros and corridors.</li>`;
    body += `</ul>`;
    body += `<p>Syndication allows investors to access institutional-quality real estate in ${escapeHtml(stateName)} with lower minimum commitments than direct ownership. By pooling capital with other accredited investors, you gain professional asset management, portfolio diversification, and potential tax advantages through depreciation and cost segregation.</p>`;

    // Getting Started section
    body += `<h2>Getting Started with ${escapeHtml(stateName)} Real Estate Syndication</h2>`;
    body += `<p>Ready to explore passive real estate investment in ${escapeHtml(stateName)}? Here's how to get started on EquityMD:</p>`;
    body += `<ol>`;
    body += `<li><strong>Create a free investor account</strong> to access deal details, syndicator profiles, and market data.</li>`;
    body += `<li><strong>Browse verified syndicators</strong> operating in ${escapeHtml(stateName)} and review their track records.</li>`;
    body += `<li><strong>Evaluate active deals</strong> with full offering documents, projected returns, and risk disclosures.</li>`;
    body += `<li><strong>Connect directly</strong> with sponsors to ask questions and complete your due diligence.</li>`;
    body += `</ol>`;
    body += `<p>EquityMD is the marketplace connecting real estate syndicators with accredited investors. All syndicators on our platform are verified, and our tools help you compare deals, track distributions, and build a diversified portfolio.</p>`;

    // Navigation links
    body += `<p><a href="${SITE_URL}/resources/market-reports">View All State Reports</a> | <a href="${SITE_URL}/find">Browse Deals</a> | <a href="${SITE_URL}/directory">Find Syndicators</a></p>`;

    return new Response(generateFullHtml({
      title,
      description: metaDesc,
      canonical: `${SITE_URL}/resources/market-reports/${stateSlug}`,
      bodyContent: body,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": metaDesc,
        "url": `${SITE_URL}/resources/market-reports/${stateSlug}`,
        "publisher": { "@type": "Organization", "name": "EquityMD", "url": SITE_URL },
        "datePublished": "2026-01-01",
        "dateModified": new Date().toISOString().split("T")[0],
      },
    }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
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
    }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
  }

  // Success stories
  if (pathname === "/success-stories") {
    return new Response(generateFullHtml({
      title: "Real Estate Investing Success Stories | EquityMD",
      description: "Read real success stories from investors who built passive income through real estate syndication on EquityMD.",
      canonical: `${SITE_URL}/success-stories`,
      bodyContent: `<h1>Real Estate Investing Success Stories</h1><p>Discover how investors are building passive income through real estate syndication.</p><p><a href="${SITE_URL}/success-stories">Read stories</a></p>`,
    }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
  }

  // Market map
  if (pathname === "/market-map") {
    return new Response(generateFullHtml({
      title: "Real Estate Investment Market Map | EquityMD",
      description: "Interactive map showing real estate syndication deals and syndicators across the US. Find investment opportunities near you.",
      canonical: `${SITE_URL}/market-map`,
      bodyContent: `<h1>Real Estate Investment Market Map</h1><p>Explore syndication opportunities across the US on our interactive market map.</p><p><a href="${SITE_URL}/market-map">View map</a></p>`,
    }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
  }

  // Compare syndicators
  if (pathname === "/compare") {
    return new Response(generateFullHtml({
      title: "Compare Real Estate Syndicators | EquityMD",
      description: "Side-by-side comparison of real estate syndicators. Compare track records, fees, minimum investments, and reviews.",
      canonical: `${SITE_URL}/compare`,
      bodyContent: `<h1>Compare Real Estate Syndicators</h1><p>Compare syndicators side-by-side to find the best fit for your investment goals.</p><p><a href="${SITE_URL}/compare">Compare now</a></p>`,
    }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
  }

  // New pricing
  if (pathname === "/new-pricing") {
    return new Response(generateFullHtml({
      title: "Syndicator Plans & Pricing 2026 | EquityMD",
      description: "Affordable plans for syndicators to list deals on EquityMD and reach thousands of accredited investors.",
      canonical: `${SITE_URL}/new-pricing`,
      bodyContent: `<h1>Syndicator Plans & Pricing</h1><p>List your deals on EquityMD. Free to start, premium plans for more visibility.</p><p><a href="${SITE_URL}/new-pricing">View plans</a></p>`,
    }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
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
    }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
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
    }), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, s-maxage=3600, max-age=0" } });
  }

  return context.next();
}
