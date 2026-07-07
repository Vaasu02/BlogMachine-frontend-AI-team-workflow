"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import TopicInput from "@/components/generate/TopicInput";
import AgentStream from "@/components/generate/AgentStream";
import AgentDetails from "@/components/generate/AgentDetails";
import GenerationQueue from "@/components/generate/GenerationQueue";
import ProgressBar from "@/components/shared/ProgressBar";
import { useGenerationQueue } from "@/hooks/useGenerationQueue";
import { useToast } from "@/components/shared/Toast";
import { cancelBlog } from "@/lib/api";

export default function GeneratePage() {
  const { toast } = useToast();
  const {
    generations,
    setGenerations,
    activeGeneration,
    activeId,
    setActiveId,
    startGeneration,
  } = useGenerationQueue();

  const detailsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (detailsEndRef.current) {
      detailsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeGeneration?.events]);

  useEffect(() => {
    if (activeGeneration?.status === "completed") {
      toast("Blog generated successfully!", "success");
    }
    if (activeGeneration?.status === "failed") {
      toast("Blog generation failed", "error");
    }
  }, [activeGeneration?.status, activeGeneration?.id, toast]);

  const handleGenerate = async (topic: string) => {
    try {
      await startGeneration(topic);
      toast("Blog queued for generation", "info");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to start", "error");
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelBlog(id);
      toast("Generation cancelled", "info");
      // Update local state immediately
      setGenerations((prev: typeof generations) =>
        prev.map((gen) =>
          gen.id === id ? { ...gen, status: "failed" as const } : gen
        )
      );
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to cancel", "error");
    }
  };

  return (
    <>
      <Header title="Generate Blog" />
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        {/* Topic Input — always enabled */}
        <div className="rounded-xl border p-4 sm:p-6 mb-4" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <TopicInput onSubmit={handleGenerate} disabled={false} />
        </div>

        {/* Queue panel */}
        {generations.length > 0 && (
          <div className="rounded-xl border p-4 mb-4" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              Generations ({generations.length})
            </h3>
            <GenerationQueue
              generations={generations}
              activeId={activeId}
              onSelect={setActiveId}
              onCancel={handleCancel}
            />
          </div>
        )}

        {/* Two-column detail view for active generation */}
        {activeGeneration && activeGeneration.events.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-fade-in">
            {/* Left: Progress stream */}
            <div className="lg:col-span-4">
              <div
                className="rounded-xl border p-4 sticky top-4"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Progress</h3>
                  <span className="text-xs font-mono" style={{ color: "#4ade80" }}>{activeGeneration.progress}%</span>
                </div>
                <ProgressBar progress={activeGeneration.progress} />
                {activeGeneration.status === "completed" && (
                  <div className="mt-4 flex flex-col gap-2">
                    <Link
                      href={`/blog/${activeGeneration.id}`}
                      className="block w-full text-center px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                      style={{ background: "#174D38" }}
                    >
                      View Blog
                    </Link>
                    <Link
                      href={`/blog/${activeGeneration.id}/logs`}
                      className="block w-full text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{ color: "var(--text-secondary)", border: "1px solid var(--border-color)" }}
                    >
                      View Execution Logs
                    </Link>
                  </div>
                )}
                <div className="mt-4">
                  <AgentStream events={activeGeneration.events} />
                </div>
              </div>
            </div>

            {/* Right: Details panel */}
            <div className="lg:col-span-8">
              <div
                className="rounded-xl border p-4 sm:p-6"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
              >
                <AgentDetails events={activeGeneration.events} />
                <div ref={detailsEndRef} />
              </div>
            </div>
          </div>
        )}

        {/* Queued state - no events yet */}
        {activeGeneration && activeGeneration.events.length === 0 && activeGeneration.status === "queued" && (
          <div className="rounded-xl border p-6 text-center animate-fade-in" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}>
            <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Queued — waiting for worker to pick up...
            </p>
          </div>
        )}
      </div>
    </>
  );
}
