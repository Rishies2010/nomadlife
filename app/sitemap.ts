import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://nomadlife.qzz.io";
  const now = new Date();

  return [
    { url: `${base}/`,        lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/players`, lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${base}/teams`,   lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${base}/blog`,    lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${base}/events`,  lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
  ];
}
