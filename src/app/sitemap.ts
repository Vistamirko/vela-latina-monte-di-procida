import type { MetadataRoute } from "next";
import { initDb, ProjectsRepo, BlogRepo } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://velalatinamontediprocida.it";

  await initDb();
  const [projects, posts] = await Promise.all([
    ProjectsRepo.getAll(true),
    BlogRepo.getAll(true),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/associazione`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/progetti`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/eventi`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/corsi`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
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
    lastModified: new Date(post.updatedAt || post.createdAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...projectRoutes, ...postRoutes];
}
