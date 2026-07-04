"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AgentEvent, AGENTS } from "@/lib/types";
import { generateBlog, getStreamUrl, getBlogStatus } from "@/lib/api";
import { AgentState, AgentStatus } from "@/hooks/useBlogGeneration";

export interface Generation {
  id: string;
  topic: string;
  status: "queued" | "running" | "completed" | "failed";
  progress: number;
  events: AgentEvent[];
  agentStates: AgentState[];
  feedbackLoops: AgentEvent[];
  error: string | null;
}

function createAgentStates(): AgentState[] {
  return AGENTS.map((a) => ({
    key: a.key,
    label: a.label,
    status: "waiting" as AgentStatus,
    message: "",
    startedAt: null,
    completedAt: null,
  }));
}

export function useGenerationQueue() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const eventSources = useRef<Map<string, EventSource>>(new Map());

  const activeGeneration = generations.find((g) => g.id === activeId) || null;

  const processEvent = useCallback((blogId: string, event: AgentEvent) => {
    setGenerations((prev) =>
      prev.map((gen) => {
        if (gen.id !== blogId) return gen;

        const newEvents = [...gen.events, event];
        const newAgentStates = gen.agentStates.map((agent) => {
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
        });

        const newFeedbackLoops = event.feedback_loop?.active
          ? [...gen.feedbackLoops, event]
          : gen.feedbackLoops;

        let newStatus = gen.status;
        if (event.status === "running" && gen.status === "queued") {
          newStatus = "running";
        }
        if (event.current_agent === "system" && event.status === "completed") {
          newStatus = "completed";
        }
        if (event.status === "failed" && event.current_agent === "system") {
          newStatus = "failed";
        }

        return {
          ...gen,
          status: newStatus,
          progress: event.progress,
          events: newEvents,
          agentStates: newAgentStates,
          feedbackLoops: newFeedbackLoops,
        };
      })
    );
  }, []);

  const connectSSE = useCallback(
    (blogId: string) => {
      if (eventSources.current.has(blogId)) return;

      const url = getStreamUrl(blogId);
      const es = new EventSource(url);
      eventSources.current.set(blogId, es);

      const eventTypes = ["running", "completed", "failed", "feedback", "error", "warning", "timeout"];

      eventTypes.forEach((type) => {
        es.addEventListener(type, (e) => {
          try {
            const data = JSON.parse((e as MessageEvent).data) as AgentEvent;
            processEvent(blogId, data);

            if (data.current_agent === "system" && (data.status === "completed" || data.status === "failed")) {
              es.close();
              eventSources.current.delete(blogId);
            }
          } catch {
            // ignore
          }
        });
      });

      es.onerror = () => {
        es.close();
        eventSources.current.delete(blogId);
        // Fallback: poll status if SSE fails
        getBlogStatus(blogId).then((status) => {
          if (status.status === "completed" || status.status === "failed") {
            setGenerations((prev) =>
              prev.map((gen) =>
                gen.id === blogId ? { ...gen, status: status.status as Generation["status"] } : gen
              )
            );
          }
        }).catch(() => {});
      };
    },
    [processEvent]
  );

  const startGeneration = useCallback(
    async (topic: string) => {
      try {
        const blog = await generateBlog(topic);
        const newGen: Generation = {
          id: blog.id,
          topic: topic,
          status: "queued",
          progress: 0,
          events: [],
          agentStates: createAgentStates(),
          feedbackLoops: [],
          error: null,
        };

        setGenerations((prev) => [newGen, ...prev]);
        setActiveId(blog.id);
        connectSSE(blog.id);

        return blog.id;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to start generation";
        throw new Error(errorMsg);
      }
    },
    [connectSSE]
  );

  useEffect(() => {
    return () => {
      eventSources.current.forEach((es) => es.close());
      eventSources.current.clear();
    };
  }, []);

  return {
    generations,
    setGenerations,
    activeGeneration,
    activeId,
    setActiveId,
    startGeneration,
  };
}
