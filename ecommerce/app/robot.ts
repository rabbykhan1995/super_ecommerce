import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://yourdomain.com/sitemap.xml", // pointing to index sitemap
  };
}

// Google, Bing, etc. সব crawler এখানে sitemap index পাবেন, তারপর তারা /blog/sitemap.xml এবং /product/sitemap.xml follow করবে।
// `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
//     `https://www.bing.com/webmaster/ping.aspx?siteMap=${encodeURIComponent(sitemapUrl)}`, ei url a amra google ba bing a fresh ping pathiye google ke bole dite pari je- "amr site a tumi crawl kore dekhte paro, tobe best approach  shudhu product/blog/trainign create howar por e ping korano, ghono ghono update na korano"
