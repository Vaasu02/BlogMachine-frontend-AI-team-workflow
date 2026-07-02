"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import ErrorState from "@/components/shared/ErrorState";
import { PenTool, CheckCircle, XCircle, BarChart3 } from "lucide-react";
import { getBlogs } from "@/lib/api";
import { Blog } from "@/lib/types";

export default function DashboardPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, failed: 0, avgSeo: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getBlogs(0, 100);
      setBlogs(data.blogs.slice(0, 5));

      const completed = data.blogs.filter((b) => b.status === "completed");
      const failed = data.blogs.filter((b) => b.status === "failed");
      const seoScores = completed
        .map((b) => b.seo_score)
        .filter((s): s is number => s !== null);
      const avgSeo =
        seoScores.length > 0
          ? Math.round(seoScores.reduce((a, b) => a + b, 0) / seoScores.length)
          : 0;

      setStats({
        total: data.total,
        completed: completed.length,
        failed: failed.length,
        avgSeo,
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Header title="Dashboard" />
      <div className="p-4 sm:p-6">
        {error && !loading ? (
          <ErrorState
            title="Cannot reach backend"
            message="Make sure the backend server is running on port 8001."
            onRetry={fetchData}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
              <StatCard label="Total Blogs" value={stats.total} color="green" loading={loading} />
              <StatCard label="Completed" value={stats.completed} color="green" loading={loading} />
              <StatCard label="Failed" value={stats.failed} color="maroon" loading={loading} />
              <StatCard label="Avg SEO" value={stats.avgSeo} color="green" loading={loading} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
              <Link
                href="/generate"
                className="flex items-center gap-4 p-5 sm:p-6 rounded-xl border transition-all hover:scale-[1.02]"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
              >
                <div className="p-3 rounded-lg" style={{ background: "var(--accent-green)" }}>
                  <PenTool className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Generate Blog</h3>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Create a new AI-generated blog</p>
                </div>
              </Link>

              <Link
                href="/history"
                className="flex items-center gap-4 p-5 sm:p-6 rounded-xl border transition-all hover:scale-[1.02]"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
              >
                <div className="p-3 rounded-lg" style={{ background: "var(--accent-maroon)" }}>
                  <BarChart3 className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>View All Blogs</h3>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Browse history and stats</p>
                </div>
              </Link>
            </div>

            <div className="rounded-xl border p-4 sm:p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Recent Blogs</h3>
                <Link href="/history" className="text-sm hover:underline" style={{ color: "#4ade80" }}>
                  View All
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: "var(--bg-primary)" }} />
                  ))}
                </div>
              ) : blogs.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: "var(--text-secondary)" }}>
                  No blogs yet. Generate your first blog!
                </p>
              ) : (
                <div className="space-y-2">
                  {blogs.map((blog) => (
                    <Link
                      key={blog.id}
                      href={`/blog/${blog.id}`}
                      className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-white/5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {blog.status === "completed" ? (
                          <CheckCircle size={16} className="text-green-400 shrink-0" />
                        ) : blog.status === "failed" ? (
                          <XCircle size={16} className="text-red-400 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin shrink-0" />
                        )}
                        <span className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
                          {blog.title || blog.topic}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        {blog.seo_score && (
                          <span className="text-xs font-medium text-green-400">
                            {blog.seo_score}
                          </span>
                        )}
                        <span className="text-xs hidden sm:inline" style={{ color: "var(--text-secondary)" }}>
                          {new Date(blog.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  color,
  loading,
}: {
  label: string;
  value: number;
  color: string;
  loading?: boolean;
}) {
  const bg = color === "maroon" ? "var(--accent-maroon)" : "var(--accent-green)";

  return (
    <div className="p-3 sm:p-4 rounded-xl border" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
      <p className="text-xs font-medium uppercase" style={{ color: "var(--text-secondary)" }}>{label}</p>
      {loading ? (
        <div className="h-8 w-12 rounded mt-1 animate-pulse" style={{ background: "var(--bg-primary)" }} />
      ) : (
        <p className="text-xl sm:text-2xl font-bold mt-1" style={{ color: bg === "var(--accent-maroon)" ? "#f87171" : "#4ade80" }}>{value}</p>
      )}
    </div>
  );
}
