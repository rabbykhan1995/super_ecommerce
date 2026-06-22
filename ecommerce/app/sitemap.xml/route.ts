import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = "https://yourdomain.com";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/blog/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/product/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}

// eta na korle nicher moto kore korbe .. jodi app/sitemap.ts diye kori, or vetor blog, product and other gular sub sitemap.ts gula jodi connect korate jay tokhon, so eta khub important

// <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
//   <url>
//     <loc>https://yourdomain.com/blog/sitemap.xml</loc>
//     <lastmod>2024-05-20T...</lastmod>
//   </url>
//   ...
// </urlset>
