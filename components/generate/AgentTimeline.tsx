"use client";

import { CheckCircle, Circle, Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { AgentState, AgentStatus } from "@/hooks/useBlogGeneration";

interface AgentTimelineProps {
  agents: AgentState[];
}

function getStatusIcon(status: AgentStatus) {
  switch (status) {
    case "completed":
      return <CheckCircle size={14} className="text-green-400" />;
    case "running":
      return <Loader2 size={14} className="text-green-300 animate-spin" />;
    case "error":
      return <AlertCircle size={14} className="text-red-400" />;
    case "feedback":
      return <RotateCcw size={14} className="text-amber-400" />;
    default:
      return <Circle size={14} style={{ color: "var(--text-secondary)" }} />;
  }
}

function getStatusStyle(status: AgentStatus): React.CSSProperties {
  switch (status) {
    case "completed":
      return { borderColor: "#4ade80", background: "rgba(74, 222, 128, 0.1)" };
    case "running":
      return { borderColor: "#4ade80", background: "rgba(74, 222, 128, 0.15)", boxShadow: "0 0 8px rgba(74, 222, 128, 0.2)" };
    case "error":
      return { borderColor: "#f87171", background: "rgba(248, 113, 113, 0.1)" };
    case "feedback":
      return { borderColor: "#fbbf24", background: "rgba(251, 191, 36, 0.1)" };
    default:
      return { borderColor: "var(--border-color)", background: "transparent" };
  }
}

export default function AgentTimeline({ agents }: AgentTimelineProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {agents.map((agent) => (
        <div
          key={agent.key}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all duration-300"
          style={getStatusStyle(agent.status)}
        >
          {getStatusIcon(agent.status)}
          <span className="text-[10px] font-medium whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
            {agent.label}
          </span>
        </div>
      ))}
    </div>
  );
}
