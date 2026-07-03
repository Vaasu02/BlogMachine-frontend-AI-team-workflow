"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import TopicInput from "@/components/generate/TopicInput";
import AgentStream from "@/components/generate/AgentStream";
import AgentDetails from "@/components/generate/AgentDetails";
import ProgressBar from "@/components/shared/ProgressBar";
import ErrorState from "@/components/shared/ErrorState";
import { useBlogGeneration } from "@/hooks/useBlogGeneration";
import { useToast } from "@/components/shared/Toast";
import { AgentEvent } from "@/lib/types";
import { getStreamUrl } from "@/lib/api";

export default function GeneratePage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    isGenerating,
    error,
    progress,
    events,
    blogId,
    startGeneration,
    processEvent,
  } = useBlogGeneration();

  const eventSourceRef = useRef<EventSource | null>(null);
  const hasConnected = useRef(false);
  const detailsEndRef = useRef<HTMLDivElement>(null);

  const handleEvent = useCallback(
    (event: AgentEvent) => {
      processEvent(event);
      if (event.status === "completed" && event.current_agent === "system") {
        toast("Blog generated successfully!", "success");
        setTimeout(() => {
          router.push(`/blog/${event.blog_id}`);
        }, 1500);
      }
      if (event.status === "failed") {
        toast("Blog generation failed", "error");
      }
    },
    [processEvent, router, toast]
  );

  useEffect(() => {
    if (!blogId || hasConnected.current) return;
    hasConnected.current = true;

    const url = getStreamUrl(blogId);
    const es = new EventSource(url);
    eventSourceRef.current = es;

    const eventTypes = ["running", "completed", "failed", "feedback", "error", "warning"];

    eventTypes.forEach((type) => {
      es.addEventListener(type, (e) => {
        try {
          const data = JSON.parse((e as MessageEvent).data) as AgentEvent;
          handleEvent(data);
        } catch {
          // ignore parse errors
        }
      });
    });

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
    };
  }, [blogId, handleEvent]);

  useEffect(() => {
    return () => {
      hasConnected.current = false;
    };
  }, []);

  useEffect(() => {
    if (detailsEndRef.current) {
      detailsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [events]);

  const handleGenerate = async (topic: string) => {
    toast("Generation started", "info");
    startGeneration(topic);
  };

  return (
    <>
      <Header title="Generate Blog" />
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        {/* Topic Input */}
        <div className="rounded-xl border p-4 sm:p-6 mb-4" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <TopicInput onSubmit={handleGenerate} disabled={isGenerating} />
          {error && (
            <ErrorState
              title="Generation Failed"
              message={error}
              onRetry={() => window.location.reload()}
            />
          )}
        </div>

        {/* Two-column layout when generating */}
        {events.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-fade-in">
            {/* Left: Progress stream */}
            <div className="lg:col-span-4">
              <div
                className="rounded-xl border p-4 sticky top-4"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Progress</h3>
                  <span className="text-xs font-mono" style={{ color: "#4ade80" }}>{progress}%</span>
                </div>
                <ProgressBar progress={progress} />
                <div className="mt-4">
                  <AgentStream events={events} />
                </div>
              </div>
            </div>

            {/* Right: Details panel */}
            <div className="lg:col-span-8">
              <div
                className="rounded-xl border p-4 sm:p-6"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
              >
                <AgentDetails events={events} />
                <div ref={detailsEndRef} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
