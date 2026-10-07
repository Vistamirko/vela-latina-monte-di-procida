export interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  category: "regata" | "manifestazione" | "raduno" | "cultura";
  badge?: string;
  description: string;
  imageUrl?: string;
  result?: string;
  articleSlug?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: string;
  category: string;
  published: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseSession {
  id: string;
  courseKey: "voga" | "vela" | "rosa" | "inclusione";
  courseTitle: string;
  startDate: string;
  endDate?: string;
  schedule: string;
  totalSeats: number;
  availableSeats: number;
  status: "aperte" | "in-esaurimento" | "sold-out" | "concluso";
  instructor: string;
  notes?: string;
  price?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "superadmin" | "admin" | "editor";
  createdAt: string;
}
