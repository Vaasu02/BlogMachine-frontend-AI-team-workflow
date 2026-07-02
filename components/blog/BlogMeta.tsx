"use client";

import { Blog } from "@/lib/types";
import { Calendar, BarChart3, Tag } from "lucide-react";

interface BlogMetaProps {
  blog: Blog;
}

export default function BlogMeta({ blog }: BlogMetaProps) {
  const tags = blog.tags ? JSON.parse(blog.tags) : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {blog.gs_paper && (
          <span className="px-3 py-1 text-xs font-semibold rounded-full text-green-200" style={{ background: "var(--accent-green)" }}>
            {blog.gs_paper}
          </span>
        )}
        {blog.subject && (
          <span className="px-3 py-1 text-xs font-semibold rounded-full text-red-200" style={{ background: "var(--accent-maroon)" }}>
            {blog.subject}
          </span>
        )}
        {blog.seo_score && (
          <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full text-green-300" style={{ background: "rgba(74, 222, 128, 0.15)" }}>
            <BarChart3 size={12} />
            SEO: {blog.seo_score}/100
          </span>
        )}
        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
          <Calendar size={12} />
          {new Date(blog.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {blog.meta_description && (
        <p className="text-sm italic" style={{ color: "var(--text-secondary)" }}>{blog.meta_description}</p>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Tag size={14} style={{ color: "var(--text-secondary)" }} />
          {tags.map((tag: string, i: number) => (
            <span
              key={i}
              className="px-2 py-0.5 text-xs rounded"
              style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
