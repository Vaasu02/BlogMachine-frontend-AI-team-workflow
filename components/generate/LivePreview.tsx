"use client";

import { CheckCircle, Loader2, FileText, BookOpen, Search, PenTool, Shield, Sparkles, BarChart3, Image, HelpCircle } from "lucide-react";
import { AgentState } from "@/hooks/useBlogGeneration";
import { AgentEvent } from "@/lib/types";

interface LivePreviewProps {
  agentStates: AgentState[];
  events: AgentEvent[];
  progress: number;
}

const AGENT_INFO: Record<string, { icon: React.ReactNode; description: string }> = {
  topic_scout: { icon: <Search size={16} />, description: "Researching topic and gathering context..." },
  narrative_planner: { icon: <BookOpen size={16} />, description: "Planning blog structure and sections..." },
  content_writer: { icon: <PenTool size={16} />, description: "Writing content for each section..." },
  fact_checker: { icon: <Shield size={16} />, description: "Verifying factual claims and data..." },
  humanizer: { icon: <Sparkles size={16} />, description: "Making content natural and engaging..." },
  seo_optimizer: { icon: <BarChart3 size={16} />, description: "Optimizing for search engines..." },
  mcq_generator: { icon: <HelpCircle size={16} />, description: "Creating practice questions..." },
  image_selector: { icon: <Image size={16} />, description: "Finding relevant images..." },
};

export default function LivePreview({ agentStates, events, progress }: LivePreviewProps) {
  const completedAgents = agentStates.filter(a => a.status === "completed");
  const activeAgent = agentStates.find(a => a.status === "running" || a.status === "feedback");

  const latestMessages: Record<string, string> = {};
  events.forEach(e => {
    if (e.current_agent !== "system") {
      latestMessages[e.current_agent] = e.message;
    }
  });

  return (
    <div className="space-y-4">
      {/* Current agent working indicator */}
      {activeAgent && (
        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "rgba(74, 222, 128, 0.08)", border: "1px solid rgba(74, 222, 128, 0.2)" }}>
          <Loader2 size={18} className="text-green-400 animate-spin shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {activeAgent.label}
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {AGENT_INFO[activeAgent.key]?.description || "Working..."}
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: "var(--bg-primary)", color: "#4ade80" }}>
            {progress}%
          </span>
        </div>
      )}

      {/* Completed agents summary */}
      {completedAgents.length > 0 && (
        <div className="space-y-2">
          {completedAgents.map(agent => (
            <div
              key={agent.key}
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{ background: "var(--bg-primary)" }}
            >
              <CheckCircle size={16} className="text-green-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {AGENT_INFO[agent.key]?.icon}
                  </span>
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {agent.label}
                  </span>
                  {agent.completedAt && (
                    <span className="text-xs ml-auto" style={{ color: "var(--text-secondary)" }}>
                      {new Date(agent.completedAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                {latestMessages[agent.key] && (
                  <p className="text-xs mt-1 truncate" style={{ color: "var(--text-secondary)" }}>
                    {latestMessages[agent.key]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Waiting state */}
      {completedAgents.length === 0 && !activeAgent && (
        <div className="flex flex-col items-center justify-center py-12">
          <FileText size={32} style={{ color: "var(--text-secondary)" }} className="mb-3 opacity-50" />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Blog preview will appear as agents complete their work...
          </p>
        </div>
      )}

      {/* Progress complete */}
      {progress === 100 && (
        <div className="p-4 rounded-lg text-center" style={{ background: "rgba(74, 222, 128, 0.1)", border: "1px solid rgba(74, 222, 128, 0.3)" }}>
          <CheckCircle size={24} className="text-green-400 mx-auto mb-2" />
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            All agents completed! Redirecting to your blog...
          </p>
        </div>
      )}
    </div>
  );
}
