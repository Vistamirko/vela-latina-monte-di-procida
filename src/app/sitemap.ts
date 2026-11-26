import type { MetadataRoute } from "next";
import { initDb, ProjectsRepo, BlogRepo, EventsRepo } from "@/lib/db";
import { SITE_URL } from "@/lib/config";

// Rigenera sempre la sitemap dal DB (Neon Postgres) così nuovi articoli, progetti ed eventi
// compaiono immediatamente in /sitemap.xml senza dover rifare deploy
export const dynamic = "force-dynamic";

function latestDate(dates: Array<string | undefined>): Date {
  let maxTime = 0;
  for (const d of dates) {
    if (!d) continue;
    const t = new Date(d).getTime();
    if (!isNaN(t) && t > maxTime) maxTime = t;
  }
  return maxTime > 0 ? new Date(maxTime) : new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  await initDb();
  const [projects, posts, events] = await Promise.all([
    ProjectsRepo.getAll(true),
    BlogRepo.getAll(true),
    EventsRepo.getAll(true),
  ]);

  const lastProjectUpdate = latestDate(projects.map((p) => p.updatedAt || p.createdAt));
  const lastPostUpdate = latestDate(posts.map((p) => p.updatedAt || p.publishedAt || p.createdAt));
  const lastEventUpdate = latestDate(events.map((e) => e.updatedAt || e.createdAt));
  const lastOverallUpdate = latestDate([
    lastProjectUpdate.toISOString(),
    lastPostUpdate.toISOString(),
    lastEventUpdate.toISOString(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: lastOverallUpdate,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/associazione`,
      lastModified: lastOverallUpdate,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/progetti`,
      lastModified: lastProjectUpdate,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/eventi`,
      lastModified: lastEventUpdate,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/corsi`,
      lastModified: lastOverallUpdate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: lastPostUpdate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/diventa-socio`,
      lastModified: lastOverallUpdate,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rinnovo-tessera`,
      lastModified: lastOverallUpdate,
      changeFrequency: "monthly",
      priority: 0.85,
    },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((proj) => ({
    url: `${baseUrl}/progetti/${proj.slug}`,
    lastModified: new Date(proj.updatedAt || proj.createdAt),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedAt || post.createdAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...projectRoutes, ...postRoutes];
}
