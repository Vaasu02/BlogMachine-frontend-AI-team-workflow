"use client";

import { useState } from "react";
import { Loader2, CheckCircle, AlertCircle, RotateCcw, ChevronDown, ChevronRight } from "lucide-react";
import { AgentEvent } from "@/lib/types";

interface AgentStreamProps {
  events: AgentEvent[];
}

const AGENT_LABELS: Record<string, string> = {
  topic_scout: "Researching topic",
  narrative_planner: "Planning blog structure",
  content_writer: "Writing blog content",
  fact_checker: "Verifying factual claims",
  humanizer: "Humanizing content",
  seo_optimizer: "Optimizing for SEO",
  mcq_generator: "Generating practice questions",
  image_selector: "Finding relevant images",
  system: "Finalizing",
};

function getStepIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle size={16} className="text-green-400 shrink-0" />;
    case "running":
      return <Loader2 size={16} className="text-[var(--text-secondary)] animate-spin shrink-0" />;
    case "error":
    case "failed":
      return <AlertCircle size={16} className="text-red-400 shrink-0" />;
    case "feedback":
      return <RotateCcw size={16} className="text-amber-400 shrink-0" />;
    default:
      return <Loader2 size={16} className="text-[var(--text-secondary)] animate-spin shrink-0" />;
  }
}

interface AgentStep {
  agent: string;
  label: string;
  status: string;
  message: string;
  feedback?: { from: string; to: string; reason: string; retry_count: number };
}

function collapseEvents(events: AgentEvent[]): AgentStep[] {
  const steps: AgentStep[] = [];
  const agentLatest: Record<string, AgentStep> = {};

  for (const event of events) {
    const agent = event.current_agent;
    if (agent === "system" && event.status !== "completed" && event.status !== "failed") continue;

    if (event.feedback_loop?.active) {
      steps.push({
        agent,
        label: `Feedback: ${event.feedback_loop.from} → ${event.feedback_loop.to}`,
        status: "feedback",
        message: event.feedback_loop.reason,
        feedback: event.feedback_loop,
      });
      continue;
    }

    const step: AgentStep = {
      agent,
      label: AGENT_LABELS[agent] || agent,
      status: event.status,
      message: event.message,
    };

    if (agentLatest[agent]) {
      const idx = steps.indexOf(agentLatest[agent]);
      if (idx !== -1) {
        steps[idx] = step;
      }
    } else {
      steps.push(step);
    }
    agentLatest[agent] = step;
  }

  return steps;
}

function StepItem({ step }: { step: AgentStep }) {
  const [expanded, setExpanded] = useState(false);

  if (step.status === "feedback") {
    return (
      <div className="relative flex items-start gap-3 py-3 pl-8">
        <div className="absolute left-0 top-[14px] z-10 p-[2px] rounded-full" style={{ background: "var(--bg-card)" }}>
          {getStepIcon("feedback")}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {step.label}
            </span>
            <span className="text-xs text-amber-400">
              Retry {step.feedback?.retry_count}/3
            </span>
          </div>
          {step.message && (
            <p className="text-xs mt-1 italic" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>
              &quot;{step.message}&quot;
            </p>
          )}
        </div>
      </div>
    );
  }

  const hasDetail = step.message && step.status === "completed";

  return (
    <div className="relative py-3 pl-8">
      <div className="absolute left-0 top-[14px] z-10 p-0.5 rounded-full" style={{ background: "var(--bg-card)" }}>
        {getStepIcon(step.status)}
      </div>
      <div
        className={`flex items-center gap-3 ${hasDetail ? "cursor-pointer" : ""}`}
        onClick={() => hasDetail && setExpanded(!expanded)}
      >
        <span className="text-sm flex-1" style={{ color: step.status === "running" ? "var(--text-secondary)" : "var(--text-primary)" }}>
          {step.label}
        </span>
        {hasDetail && (
          <span style={{ color: "var(--text-secondary)" }}>
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}
      </div>
      {expanded && step.message && (
        <div className="mt-2 p-3 rounded-lg text-xs" style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}>
          {step.message}
        </div>
      )}
    </div>
  );
}

export default function AgentStream({ events }: AgentStreamProps) {
  const steps = collapseEvents(events);

  return (
    <div className="relative ml-4">
      {/* Vertical connecting line */}
      <div
        className="absolute left-[9px] top-4 bottom-4 w-[2px]"
        style={{ background: "var(--border-color)" }}
      />
      <div className="space-y-0">
        {steps.map((step, index) => (
          <StepItem key={`${step.agent}-${index}`} step={step} />
        ))}
      </div>
    </div>
  );
}
