"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import BlogContent, { TableOfContents } from "@/components/blog/BlogContent";
import BlogMeta from "@/components/blog/BlogMeta";
import MCQSection from "@/components/blog/MCQSection";
import ImageGallery from "@/components/blog/ImageGallery";
import { getBlog } from "@/lib/api";
import { Blog, MCQ, BlogImage } from "@/lib/types";

export default function BlogViewPage() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = params.id as string;

  useEffect(() => {
    async function fetchBlog() {
      try {
        const data = await getBlog(id);
        setBlog(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load blog");
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header title="Blog" />
        <div className="p-4 sm:p-6 flex justify-center">
          <div className="space-y-4 w-full max-w-3xl">
            <div className="h-8 rounded w-3/4 animate-pulse" style={{ background: "var(--bg-card)" }} />
            <div className="h-4 rounded w-1/2 animate-pulse" style={{ background: "var(--bg-card)" }} />
            <div className="h-64 rounded animate-pulse" style={{ background: "var(--bg-card)" }} />
            <div className="h-4 rounded animate-pulse" style={{ background: "var(--bg-card)" }} />
            <div className="h-4 rounded w-5/6 animate-pulse" style={{ background: "var(--bg-card)" }} />
          </div>
        </div>
      </>
    );
  }

  if (error || !blog) {
    return (
      <>
        <Header title="Blog" />
        <div className="p-6 text-center">
          <p className="text-red-400 mb-4">{error || "Blog not found"}</p>
          <Link href="/history" className="hover:underline" style={{ color: "#4ade80" }}>
            Back to History
          </Link>
        </div>
      </>
    );
  }

  const mcqs: MCQ[] = blog.mcqs ? JSON.parse(blog.mcqs).questions || [] : [];
  const images: BlogImage[] = blog.images ? JSON.parse(blog.images).images || [] : [];

  return (
    <>
      <Header title="Blog" />
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg transition-colors hover:bg-white/5"
          >
            <ArrowLeft size={20} style={{ color: "var(--text-secondary)" }} />
          </button>
          <Link
            href={`/blog/${id}/logs`}
            className="ml-auto flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors hover:bg-white/5"
            style={{ color: "var(--text-secondary)", borderColor: "var(--border-color)" }}
          >
            <FileText size={14} />
            View Logs
          </Link>
        </div>

        <div className="rounded-xl border p-4 sm:p-6 md:p-8" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          {blog.title && (
            <h1 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              {blog.title}
            </h1>
          )}

          <BlogMeta blog={blog} />

          <div className="mt-6">
            <ImageGallery images={images} />
          </div>

          {blog.content && (
            <>
              <TableOfContents content={blog.content} />
              <BlogContent content={blog.content} />
            </>
          )}

          {blog.gs_paper && (
            <div className="mt-8 p-4 rounded-lg" style={{ background: "var(--accent-green)", border: "1px solid #2d7a50" }}>
              <p className="text-sm font-semibold text-green-200 mb-1">
                UPSC Mains Relevance
              </p>
              <p className="text-sm text-green-100">
                This topic is relevant for {blog.gs_paper} — {blog.subject}.
                Understanding this will help in both Prelims and Mains preparation.
              </p>
            </div>
          )}

          <MCQSection mcqs={mcqs} />
        </div>
      </div>
    </>
  );
}
