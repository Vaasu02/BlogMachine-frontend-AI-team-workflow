import { Blog, BlogListResponse, AgentLog } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export async function generateBlog(topic: string): Promise<Blog> {
  const res = await fetch(`${API_BASE}/api/blog/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to generate blog");
  }

  return res.json();
}

export async function getBlog(id: string): Promise<Blog> {
  const res = await fetch(`${API_BASE}/api/blog/${id}`);

  if (!res.ok) {
    throw new Error("Blog not found");
  }

  return res.json();
}

export async function getBlogs(skip = 0, limit = 20): Promise<BlogListResponse> {
  const res = await fetch(`${API_BASE}/api/blogs/?skip=${skip}&limit=${limit}`);

  if (!res.ok) {
    throw new Error("Failed to fetch blogs");
  }

  return res.json();
}

export async function deleteBlog(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/blog/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete blog");
  }
}

export async function getBlogLogs(id: string): Promise<AgentLog[]> {
  const res = await fetch(`${API_BASE}/api/blog/${id}/logs`);

  if (!res.ok) {
    throw new Error("Failed to fetch logs");
  }

  return res.json();
}

export function getStreamUrl(blogId: string): string {
  return `${API_BASE}/api/blog/stream/${blogId}`;
}
