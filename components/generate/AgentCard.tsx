"use client";

import { CheckCircle, Loader2, AlertCircle, RotateCcw, Circle } from "lucide-react";
import { AgentEvent } from "@/lib/types";

interface AgentLogProps {
  events: AgentEvent[];
}

function getEventIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle size={14} className="text-green-400 shrink-0" />;
    case "running":
      return <Loader2 size={14} className="text-green-300 animate-spin shrink-0" />;
    case "error":
    case "failed":
      return <AlertCircle size={14} className="text-red-400 shrink-0" />;
    case "feedback":
      return <RotateCcw size={14} className="text-amber-400 shrink-0" />;
    case "warning":
      return <AlertCircle size={14} className="text-amber-400 shrink-0" />;
    default:
      return <Circle size={14} className="shrink-0" style={{ color: "var(--text-secondary)" }} />;
  }
}

function getEventBg(status: string): string {
  switch (status) {
    case "completed":
      return "rgba(74, 222, 128, 0.08)";
    case "running":
      return "rgba(74, 222, 128, 0.05)";
    case "error":
    case "failed":
      return "rgba(248, 113, 113, 0.08)";
    case "feedback":
      return "rgba(251, 191, 36, 0.08)";
    default:
      return "var(--bg-primary)";
  }
}

function deduplicateEvents(events: AgentEvent[]): AgentEvent[] {
  const completedAgents = new Set<string>();
  events.forEach(e => {
    if (e.status === "completed" || e.status === "error" || e.status === "failed") {
      completedAgents.add(e.current_agent);
    }
  });

  return events.filter(e => {
    if (e.status === "running" && completedAgents.has(e.current_agent)) {
      return false;
    }
    return true;
  });
}

export default function AgentLog({ events }: AgentLogProps) {
  const filtered = deduplicateEvents(events);

  if (filtered.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Agent activity will appear here...</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {filtered.map((event, index) => (
        <div
          key={index}
          className="flex items-start gap-2 px-3 py-2 rounded-md"
          style={{ background: getEventBg(event.status) }}
        >
          <div className="mt-0.5">{getEventIcon(event.status)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                {event.current_agent}
              </span>
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{event.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
