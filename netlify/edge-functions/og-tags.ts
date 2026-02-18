import type { Context } from "https://edge.netlify.com";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") || "https://fzacguhxadpvjrmycwes.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6YWNndWh4YWRwdmpybXljd2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzMzU4MzksImV4cCI6MjA1MDkxMTgzOX0.fWkFRqtASBU8iyA5N_5cSMIlak8uwDKCTbcmGRQqL0M";

const USER_AGENTS = [
  "linkedinbot",
  "facebookexternalhit",
  "twitterbot",
  "slackbot",
  "whatsapp",
  "telegrambot",
  "discordbot",
  "pinterest",
  "googlebot",
  "bingbot",
];

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return USER_AGENTS.some((bot) => ua.includes(bot));
}

export default async function handler(request: Request, context: Context) {
  const userAgent = request.headers.get("user-agent") || "";
  
  if (!isBot(userAgent)) {
    return context.next();
  }

  const url = new URL(request.url);
  const pathname = url.pathname;

  // Handle blog posts
  if (pathname.startsWith("/blog/") && pathname !== "/blog/") {
    const slug = pathname.replace("/blog/", "").replace(/\/$/, "");
    
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(slug)}&select=title,excerpt,image_url,published_at,author,category,meta_description`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (response.ok) {
        const posts = await response.json();
        if (posts && posts.length > 0) {
          const post = posts[0];
          const title = `${post.title} | EquityMD Blog`;
          const description = post.meta_description || post.excerpt || "Read this article on EquityMD";
          const image = post.image_url || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200&h=630";
          const canonicalUrl = `https://equitymd.com/blog/${slug}`;

          const html = generateOgHtml({
            title,
            description,
            image,
            url: canonicalUrl,
            type: "article",
            publishedTime: post.published_at,
            author: post.author,
            section: post.category,
          });

          return new Response(html, {
            headers: { "content-type": "text/html; charset=utf-8" },
          });
        }
      }
    } catch (error) {
      console.error("Error fetching blog post:", error);
    }
  }

  // Handle deal pages
  if (pathname.startsWith("/deals/") && pathname !== "/deals/") {
    const slug = pathname.replace("/deals/", "").replace(/\/$/, "");
    
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/deals?slug=eq.${encodeURIComponent(slug)}&select=id,name,tagline,description,city,state,property_type`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (response.ok) {
        const deals = await response.json();
        if (deals && deals.length > 0) {
          const deal = deals[0];
          const title = `${deal.name} | EquityMD`;
          const description = deal.tagline || deal.description?.substring(0, 160) || `${deal.property_type} investment in ${deal.city}, ${deal.state}`;
          const canonicalUrl = `https://equitymd.com/deals/${slug}`;

          // Try to get deal media
          let image = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200&h=630";
          
          const mediaResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/deal_media?deal_id=eq.${deal.id}&is_cover=eq.true&select=url`,
            {
              headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              },
            }
          );
          
          if (mediaResponse.ok) {
            const media = await mediaResponse.json();
            if (media && media.length > 0 && media[0].url) {
              image = media[0].url;
            }
          }

          const html = generateOgHtml({
            title,
            description,
            image,
            url: canonicalUrl,
            type: "website",
          });

          return new Response(html, {
            headers: { "content-type": "text/html; charset=utf-8" },
          });
        }
      }
    } catch (error) {
      console.error("Error fetching deal:", error);
    }
  }

  // Handle syndicator pages
  if (pathname.startsWith("/syndicators/") && pathname !== "/syndicators/") {
    const slug = pathname.replace("/syndicators/", "").replace(/\/$/, "");
    
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/syndicators?slug=eq.${encodeURIComponent(slug)}&select=company_name,tagline,bio,logo_url,city,state`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (response.ok) {
        const syndicators = await response.json();
        if (syndicators && syndicators.length > 0) {
          const syndicator = syndicators[0];
          const title = `${syndicator.company_name} | EquityMD`;
          const description = syndicator.tagline || syndicator.bio?.substring(0, 160) || `Real estate syndicator on EquityMD`;
          const image = syndicator.logo_url || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200&h=630";
          const canonicalUrl = `https://equitymd.com/syndicators/${slug}`;

          const html = generateOgHtml({
            title,
            description,
            image,
            url: canonicalUrl,
            type: "profile",
          });

          return new Response(html, {
            headers: { "content-type": "text/html; charset=utf-8" },
          });
        }
      }
    } catch (error) {
      console.error("Error fetching syndicator:", error);
    }
  }

  return context.next();
}

interface OgParams {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
  publishedTime?: string;
  author?: string;
  section?: string;
}

function generateOgHtml(params: OgParams): string {
  const { title, description, image, url, type, publishedTime, author, section } = params;
  
  const articleTags = type === "article" ? `
    ${publishedTime ? `<meta property="article:published_time" content="${publishedTime}" />` : ""}
    ${author ? `<meta property="article:author" content="${author}" />` : ""}
    ${section ? `<meta property="article:section" content="${section}" />` : ""}
  ` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:image:secure_url" content="${escapeHtml(image)}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(title)}" />
  <meta property="og:url" content="${escapeHtml(url)}" />
  <meta property="og:type" content="${type === 'article' ? 'article' : 'website'}" />
  <meta property="og:site_name" content="EquityMD" />
  <meta property="og:locale" content="en_US" />
  ${articleTags}
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@equitymd" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />
  <meta name="twitter:image:alt" content="${escapeHtml(title)}" />
  
  <link rel="canonical" href="${escapeHtml(url)}" />
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" />
  <p>View full content at <a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const config = {
  path: ["/blog/*", "/deals/*", "/syndicators/*"],
};
