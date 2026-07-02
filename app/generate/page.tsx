"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import TopicInput from "@/components/generate/TopicInput";
import AgentStream from "@/components/generate/AgentStream";
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
    events,
    blogId,
    startGeneration,
    processEvent,
  } = useBlogGeneration();

  const eventSourceRef = useRef<EventSource | null>(null);
  const hasConnected = useRef(false);

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

  const handleGenerate = async (topic: string) => {
    toast("Generation started", "info");
    startGeneration(topic);
  };

  return (
    <>
      <Header title="Generate Blog" />
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        {/* Topic Input */}
        <div className="rounded-xl border p-4 sm:p-6 mb-6" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <TopicInput onSubmit={handleGenerate} disabled={isGenerating} />
          {error && (
            <ErrorState
              title="Generation Failed"
              message={error}
              onRetry={() => window.location.reload()}
            />
          )}
        </div>

        {/* Claude-style vertical stream */}
        {events.length > 0 && (
          <AgentStream events={events} />
        )}
      </div>
    </>
  );
}
