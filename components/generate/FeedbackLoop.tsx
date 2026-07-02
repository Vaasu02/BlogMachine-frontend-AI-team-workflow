"use client";

import { RotateCcw } from "lucide-react";
import { AgentEvent } from "@/lib/types";

interface FeedbackLoopProps {
  feedbackEvents: AgentEvent[];
}

export default function FeedbackLoop({ feedbackEvents }: FeedbackLoopProps) {
  if (feedbackEvents.length === 0) return null;

  return (
    <div className="space-y-2">
      {feedbackEvents.map((event, index) => (
        <div
          key={index}
          className="flex items-start gap-3 p-3 rounded-lg border"
          style={{ background: "rgba(251, 191, 36, 0.08)", borderColor: "rgba(251, 191, 36, 0.3)" }}
        >
          <RotateCcw size={18} className="text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-amber-300 uppercase">
                Feedback Loop
              </span>
              <span className="text-xs text-amber-400">
                Retry {event.feedback_loop?.retry_count}/3
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color: "var(--text-primary)" }}>
              <span className="font-medium">{event.feedback_loop?.from}</span>
              {" → "}
              <span className="font-medium">{event.feedback_loop?.to}</span>
            </p>
            {event.feedback_loop?.reason && (
              <p className="text-xs mt-1 italic" style={{ color: "var(--text-secondary)" }}>
                &quot;{event.feedback_loop.reason}&quot;
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
