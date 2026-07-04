"use client";

import { CheckCircle, XCircle, Loader2, Clock, X } from "lucide-react";
import { Generation } from "@/hooks/useGenerationQueue";

interface GenerationQueueProps {
  generations: Generation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCancel: (id: string) => void;
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle size={14} className="text-green-400 shrink-0" />;
    case "failed":
      return <XCircle size={14} className="text-red-400 shrink-0" />;
    case "running":
      return <Loader2 size={14} className="text-green-400 animate-spin shrink-0" />;
    case "queued":
      return <Clock size={14} className="shrink-0" style={{ color: "var(--text-secondary)" }} />;
    default:
      return <Clock size={14} className="shrink-0" style={{ color: "var(--text-secondary)" }} />;
  }
}

function getStatusLabel(status: string, queuePosition?: number) {
  switch (status) {
    case "completed": return "Done";
    case "failed": return "Failed";
    case "running": return "Running";
    case "queued": return queuePosition ? `#${queuePosition} in queue` : "Queued";
    default: return status;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "completed": return "#4ade80";
    case "failed": return "#f87171";
    case "running": return "#4ade80";
    case "queued": return "var(--text-secondary)";
    default: return "var(--text-secondary)";
  }
}

export default function GenerationQueue({ generations, activeId, onSelect, onCancel }: GenerationQueueProps) {
  if (generations.length === 0) return null;

  const queuedItems = generations.filter(g => g.status === "queued");

  return (
    <div className="space-y-1.5">
      {generations.map((gen) => {
        const queuePosition = gen.status === "queued"
          ? queuedItems.indexOf(gen) + 1
          : undefined;
        const canCancel = gen.status === "queued" || gen.status === "running";

        return (
          <div
            key={gen.id}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all cursor-pointer"
            style={{
              background: gen.id === activeId ? "rgba(74, 222, 128, 0.08)" : "var(--bg-primary)",
              border: gen.id === activeId ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid transparent",
            }}
            onClick={() => onSelect(gen.id)}
          >
            {getStatusIcon(gen.status)}
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
                {gen.topic}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {gen.status === "running" && (
                <span className="text-xs font-mono" style={{ color: "#4ade80" }}>
                  {gen.progress}%
                </span>
              )}
              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ color: getStatusColor(gen.status) }}>
                {getStatusLabel(gen.status, queuePosition)}
              </span>
              {canCancel && (
                <button
                  onClick={(e) => { e.stopPropagation(); onCancel(gen.id); }}
                  className="p-1 rounded hover:bg-red-900/30 transition-colors"
                  title="Cancel"
                >
                  <X size={12} className="text-red-400" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
