"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import ErrorState from "@/components/shared/ErrorState";
import { PenTool, CheckCircle, XCircle, BarChart3, Clock, Zap } from "lucide-react";
import { getBlogs } from "@/lib/api";
import { Blog } from "@/lib/types";

export default function DashboardPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [todayBlogs, setTodayBlogs] = useState<Blog[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, failed: 0, avgSeo: 0, thisWeek: 0, successRate: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getBlogs(0, 100);
      setBlogs(data.blogs);

      const completed = data.blogs.filter((b) => b.status === "completed");
      const failed = data.blogs.filter((b) => b.status === "failed");
      const seoScores = completed
        .map((b) => b.seo_score)
        .filter((s): s is number => s !== null);
      const avgSeo =
        seoScores.length > 0
          ? Math.round(seoScores.reduce((a, b) => a + b, 0) / seoScores.length)
          : 0;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const todayList = data.blogs.filter((b) => new Date(b.created_at) >= today);
      const thisWeekList = data.blogs.filter((b) => new Date(b.created_at) >= weekAgo);

      setTodayBlogs(todayList);
      setStats({
        total: data.total,
        completed: completed.length,
        failed: failed.length,
        avgSeo,
        thisWeek: thisWeekList.length,
        successRate: data.total > 0 ? Math.round((completed.length / data.total) * 100) : 0,
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
              <StatCard label="Total Blogs" value={stats.total} color="green" loading={loading} />
              <StatCard label="Completed" value={stats.completed} color="green" loading={loading} />
              <StatCard label="Failed" value={stats.failed} color="maroon" loading={loading} />
              <StatCard label="Avg SEO" value={stats.avgSeo} color="green" loading={loading} suffix="/100" />
              <StatCard label="This Week" value={stats.thisWeek} color="green" loading={loading} />
              <StatCard label="Success Rate" value={stats.successRate} color="green" loading={loading} suffix="%" />
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
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Browse full history with filters</p>
                </div>
              </Link>
            </div>

            {/* Today's Activity */}
            <div className="rounded-xl border p-4 sm:p-6" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap size={16} style={{ color: "#4ade80" }} />
                  <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Today&apos;s Activity</h3>
                </div>
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(74, 222, 128, 0.1)", color: "#4ade80" }}>
                  {todayBlogs.length} blog{todayBlogs.length !== 1 ? "s" : ""} today
                </span>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: "var(--bg-primary)" }} />
                  ))}
                </div>
              ) : todayBlogs.length === 0 ? (
                <div className="text-center py-8">
                  <Clock size={32} className="mx-auto mb-3" style={{ color: "var(--text-secondary)" }} />
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    No blogs generated today yet.
                  </p>
                  <Link href="/generate" className="text-sm mt-2 inline-block hover:underline" style={{ color: "#4ade80" }}>
                    Generate one now
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayBlogs.map((blog) => (
                    <Link
                      key={blog.id}
                      href={blog.status === "completed" ? `/blog/${blog.id}` : `/blog/${blog.id}/logs`}
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
                        <div className="min-w-0">
                          <span className="text-sm truncate block" style={{ color: "var(--text-primary)" }}>
                            {blog.title || blog.topic}
                          </span>
                          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            {new Date(blog.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            {blog.subject && ` · ${blog.subject}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        {blog.seo_score ? (
                          <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: "rgba(74, 222, 128, 0.1)", color: "#4ade80" }}>
                            SEO {blog.seo_score}
                          </span>
                        ) : null}
                        <span
                          className="text-xs px-2 py-0.5 rounded font-medium"
                          style={{
                            background: blog.status === "completed" ? "rgba(74, 222, 128, 0.1)" : "rgba(248, 113, 113, 0.1)",
                            color: blog.status === "completed" ? "#4ade80" : "#f87171",
                          }}
                        >
                          {blog.status}
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
  suffix,
}: {
  label: string;
  value: number;
  color: string;
  loading?: boolean;
  suffix?: string;
}) {
  const bg = color === "maroon" ? "var(--accent-maroon)" : "var(--accent-green)";

  return (
    <div className="p-3 sm:p-4 rounded-xl border" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
      <p className="text-xs font-medium uppercase" style={{ color: "var(--text-secondary)" }}>{label}</p>
      {loading ? (
        <div className="h-8 w-12 rounded mt-1 animate-pulse" style={{ background: "var(--bg-primary)" }} />
      ) : (
        <p className="text-xl sm:text-2xl font-bold mt-1" style={{ color: bg === "var(--accent-maroon)" ? "#f87171" : "#4ade80" }}>
          {value}{suffix || ""}
        </p>
      )}
    </div>
  );
}
