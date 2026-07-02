"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { useBlogs } from "@/hooks/useBlogs";
import { useToast } from "@/components/shared/Toast";
import { Trash2, ChevronLeft, ChevronRight, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function HistoryPage() {
  const { blogs, total, loading, page, limit, nextPage, prevPage, handleDelete } =
    useBlogs();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  const filteredBlogs = blogs.filter((blog) => {
    if (statusFilter !== "all" && blog.status !== statusFilter) return false;
    if (subjectFilter !== "all" && blog.subject !== subjectFilter) return false;
    return true;
  });

  const subjects = [...new Set(blogs.map((b) => b.subject).filter(Boolean))];

  const onDelete = async (id: string) => {
    await handleDelete(id);
    toast("Blog deleted", "success");
  };

  return (
    <>
      <Header title="Blog History" />
      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
            <option value="running">Running</option>
          </select>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s!}>
                {s}
              </option>
            ))}
          </select>

          <span className="ml-auto text-sm self-center" style={{ color: "var(--text-secondary)" }}>
            {total} blog{total !== 1 ? "s" : ""} total
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg animate-pulse" style={{ background: "var(--bg-card)" }} />
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: "var(--text-secondary)" }}>No blogs found.</p>
            <Link
              href="/generate"
              className="text-sm hover:underline mt-2 inline-block"
              style={{ color: "#4ade80" }}
            >
              Generate your first blog
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredBlogs.map((blog) => (
              <div
                key={blog.id}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-colors animate-fade-in hover:bg-white/5"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
              >
                <div className="shrink-0">
                  {blog.status === "completed" ? (
                    <CheckCircle size={20} className="text-green-400" />
                  ) : blog.status === "failed" ? (
                    <XCircle size={20} className="text-red-400" />
                  ) : (
                    <Loader2 size={20} className="text-green-400 animate-spin" />
                  )}
                </div>

                <Link
                  href={`/blog/${blog.id}`}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {blog.title || blog.topic}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {blog.subject && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--accent-green)", color: "#bbf7d0" }}>
                        {blog.subject}
                      </span>
                    )}
                    {blog.gs_paper && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--accent-maroon)", color: "#fecaca" }}>
                        {blog.gs_paper}
                      </span>
                    )}
                    {blog.seo_score && (
                      <span className="text-xs font-medium text-green-400">
                        SEO: {blog.seo_score}
                      </span>
                    )}
                  </div>
                </Link>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <span className="text-xs hidden sm:inline" style={{ color: "var(--text-secondary)" }}>
                    {new Date(blog.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    onClick={() => onDelete(blog.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {total > limit && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prevPage}
              disabled={page === 0}
              className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5"
              style={{ borderColor: "var(--border-color)" }}
            >
              <ChevronLeft size={18} style={{ color: "var(--text-secondary)" }} />
            </button>
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Page {page + 1} of {Math.ceil(total / limit)}
            </span>
            <button
              onClick={nextPage}
              disabled={(page + 1) * limit >= total}
              className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5"
              style={{ borderColor: "var(--border-color)" }}
            >
              <ChevronRight size={18} style={{ color: "var(--text-secondary)" }} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
