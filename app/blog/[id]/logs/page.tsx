"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Loader2,
  ChevronDown,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { getBlogLogs, getBlog } from "@/lib/api";
import { AgentLog, Blog } from "@/lib/types";

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle size={18} className="text-green-400" />;
    case "error":
      return <AlertCircle size={18} className="text-red-400" />;
    case "rejected":
      return <RotateCcw size={18} className="text-amber-400" />;
    default:
      return <Loader2 size={18} className="text-green-300" />;
  }
}

function getDuration(current: string, next: string | null): string | null {
  if (!next) return null;
  const diff = new Date(next).getTime() - new Date(current).getTime();
  if (diff < 1000) return `${diff}ms`;
  return `${(diff / 1000).toFixed(1)}s`;
}

function formatOutputSummary(outputData: string | null): string | null {
  if (!outputData) return null;
  try {
    const parsed = JSON.parse(outputData);
    if (parsed.topic) return `Topic: "${parsed.topic}"`;
    if (parsed.outline) return `${parsed.outline.length} sections outlined`;
    if (parsed.sections) return `${parsed.sections.length} sections, ${parsed.word_count || "?"} words`;
    if (parsed.verified !== undefined) return parsed.verified ? "All claims verified" : "Issues found";
    if (parsed.content) return `Content humanized (${parsed.changes_made?.length || 0} changes)`;
    if (parsed.seo_score) return `SEO Score: ${parsed.seo_score}/100`;
    if (parsed.questions) return `${parsed.questions.length} MCQs generated`;
    if (parsed.images) return `${parsed.images.length} images found`;
    return JSON.stringify(parsed).slice(0, 100) + "...";
  } catch {
    return null;
  }
}

export default function BlogLogsPage() {
  const params = useParams();
  const id = params.id as string;
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchData() {
      try {
        const [logsData, blogData] = await Promise.all([
          getBlogLogs(id),
          getBlog(id),
        ]);
        setLogs(logsData);
        setBlog(blogData);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const toggleExpand = (index: number) => {
    setExpandedLogs((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const totalDuration =
    logs.length >= 2
      ? getDuration(logs[0].timestamp, logs[logs.length - 1].timestamp)
      : null;

  return (
    <>
      <Header title="Execution Logs" />
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/blog/${id}`}
            className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80"
            style={{ color: "var(--text-secondary)" }}
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>
          {totalDuration && (
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Total time: {totalDuration}
            </span>
          )}
        </div>

        {blog && (
          <div className="rounded-xl border p-4 mb-6" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {blog.title || blog.topic}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              Status: {blog.status} | Generated:{" "}
              {new Date(blog.created_at).toLocaleString("en-IN")}
            </p>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 rounded-lg animate-pulse" style={{ background: "var(--bg-card)" }} />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <p className="text-center py-8" style={{ color: "var(--text-secondary)" }}>No logs available.</p>
        ) : (
          <div className="relative">
            <div className="absolute left-[21px] top-4 bottom-4 w-0.5" style={{ background: "var(--border-color)" }} />

            <div className="space-y-1">
              {logs.map((log, index) => {
                const duration =
                  index < logs.length - 1
                    ? getDuration(log.timestamp, logs[index + 1].timestamp)
                    : null;
                const isExpanded = expandedLogs.has(index);
                const outputSummary = formatOutputSummary(log.output_data);

                return (
                  <div key={log.id || index} className="relative pl-12">
                    <div className="absolute left-3 top-4 z-10 p-0.5" style={{ background: "var(--bg-primary)" }}>
                      {getStatusIcon(log.status)}
                    </div>

                    <div
                      className="rounded-lg p-3 sm:p-4 cursor-pointer transition-colors border hover:bg-white/5 overflow-hidden"
                      style={{ background: "var(--bg-card)", borderColor: log.status === "rejected" ? "rgba(251, 191, 36, 0.3)" : "var(--border-color)" }}
                      onClick={() => toggleExpand(index)}
                    >
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="text-xs font-mono shrink-0" style={{ color: "var(--text-secondary)" }}>
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                          {log.agent_name}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0 whitespace-nowrap"
                          style={{
                            background: log.status === "completed" ? "rgba(74, 222, 128, 0.15)" : log.status === "error" ? "rgba(248, 113, 113, 0.15)" : log.status === "rejected" ? "rgba(251, 191, 36, 0.15)" : "rgba(74, 222, 128, 0.1)",
                            color: log.status === "completed" ? "#4ade80" : log.status === "error" ? "#f87171" : log.status === "rejected" ? "#fbbf24" : "#4ade80",
                          }}
                        >
                          {log.status}
                        </span>
                        {log.retry_count > 0 && (
                          <span className="text-xs text-amber-400 font-medium shrink-0">
                            (Retry {log.retry_count}/3)
                          </span>
                        )}
                        {duration && (
                          <span className="text-xs sm:ml-auto shrink-0" style={{ color: "var(--text-secondary)" }}>
                            {duration}
                          </span>
                        )}
                        <span className="ml-auto sm:ml-0 shrink-0" style={{ color: "var(--text-secondary)" }}>
                          {isExpanded ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronRight size={14} />
                          )}
                        </span>
                      </div>

                      {outputSummary && !isExpanded && (
                        <p className="text-xs mt-1 sm:ml-[72px]" style={{ color: "var(--text-secondary)" }}>
                          {outputSummary}
                        </p>
                      )}

                      {log.feedback && (
                        <div className="flex items-center gap-2 mt-2 sm:ml-[72px] p-2 rounded-md" style={{ background: "rgba(251, 191, 36, 0.08)" }}>
                          <ArrowRight size={12} className="text-amber-400 shrink-0" />
                          <p className="text-xs text-amber-300 italic">
                            Feedback: &quot;{log.feedback}&quot;
                          </p>
                        </div>
                      )}

                      {isExpanded && (
                        <div className="mt-3 sm:ml-[72px] space-y-2">
                          {log.input_data && (
                            <div>
                              <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                                Input:
                              </p>
                              <pre className="text-xs p-2 rounded overflow-x-auto max-h-32 overflow-y-auto" style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}>
                                {JSON.stringify(JSON.parse(log.input_data), null, 2).slice(0, 500)}
                              </pre>
                            </div>
                          )}
                          {log.output_data && (
                            <div>
                              <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                                Output:
                              </p>
                              <pre className="text-xs p-2 rounded overflow-x-auto max-h-32 overflow-y-auto" style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}>
                                {JSON.stringify(JSON.parse(log.output_data), null, 2).slice(0, 500)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
