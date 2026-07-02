"use client";

import { useState, useCallback } from "react";
import { Blog, AgentEvent, AGENTS } from "@/lib/types";
import { generateBlog } from "@/lib/api";

export type AgentStatus = "waiting" | "running" | "completed" | "error" | "feedback";

export interface AgentState {
  key: string;
  label: string;
  status: AgentStatus;
  message: string;
  startedAt: string | null;
  completedAt: string | null;
}

export function useBlogGeneration() {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [agentStates, setAgentStates] = useState<AgentState[]>(
    AGENTS.map((a) => ({
      key: a.key,
      label: a.label,
      status: "waiting" as AgentStatus,
      message: "",
      startedAt: null,
      completedAt: null,
    }))
  );
  const [feedbackLoops, setFeedbackLoops] = useState<AgentEvent[]>([]);
  const [blogId, setBlogId] = useState<string | null>(null);

  const processEvent = useCallback((event: AgentEvent) => {
    setProgress(event.progress);
    setEvents((prev) => [...prev, event]);

    setAgentStates((prev) =>
      prev.map((agent) => {
        if (agent.key === event.current_agent) {
          let status: AgentStatus = "running";
          if (event.status === "completed") status = "completed";
          else if (event.status === "error" || event.status === "failed") status = "error";
          else if (event.status === "feedback") status = "feedback";

          return {
            ...agent,
            status,
            message: event.message,
            startedAt: agent.startedAt || event.timestamp,
            completedAt: event.status === "completed" ? event.timestamp : agent.completedAt,
          };
        }
        return agent;
      })
    );

    if (event.feedback_loop?.active) {
      setFeedbackLoops((prev) => [...prev, event]);
    }
  }, []);

  const startGeneration = useCallback(
    async (topic: string) => {
      setError(null);
      setIsGenerating(true);
      setProgress(0);
      setEvents([]);
      setFeedbackLoops([]);
      setAgentStates(
        AGENTS.map((a) => ({
          key: a.key,
          label: a.label,
          status: "waiting" as AgentStatus,
          message: "",
          startedAt: null,
          completedAt: null,
        }))
      );

      try {
        const newBlog = await generateBlog(topic);
        setBlog(newBlog);
        setBlogId(newBlog.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to start generation");
        setIsGenerating(false);
      }
    },
    []
  );

  return {
    blog,
    isGenerating,
    error,
    progress,
    agentStates,
    feedbackLoops,
    events,
    blogId,
    startGeneration,
    processEvent,
  };
}
