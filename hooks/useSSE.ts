"use client";

import { useCallback, useRef, useState } from "react";
import { AgentEvent } from "@/lib/types";
import { getStreamUrl } from "@/lib/api";

export function useSSE(blogId: string | null) {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (!blogId) return;

    const url = getStreamUrl(blogId);
    const es = new EventSource(url);
    eventSourceRef.current = es;
    setIsConnected(true);

    es.addEventListener("running", (e) => {
      const data = JSON.parse(e.data) as AgentEvent;
      setEvents((prev) => [...prev, data]);
    });

    es.addEventListener("completed", (e) => {
      const data = JSON.parse(e.data) as AgentEvent;
      setEvents((prev) => [...prev, data]);
      es.close();
      setIsConnected(false);
    });

    es.addEventListener("failed", (e) => {
      const data = JSON.parse(e.data) as AgentEvent;
      setEvents((prev) => [...prev, data]);
      es.close();
      setIsConnected(false);
    });

    es.addEventListener("feedback", (e) => {
      const data = JSON.parse(e.data) as AgentEvent;
      setEvents((prev) => [...prev, data]);
    });

    es.addEventListener("error", (e) => {
      const data = JSON.parse((e as MessageEvent).data || "{}") as AgentEvent;
      setEvents((prev) => [...prev, data]);
    });

    es.addEventListener("warning", (e) => {
      const data = JSON.parse(e.data) as AgentEvent;
      setEvents((prev) => [...prev, data]);
    });

    es.onerror = () => {
      es.close();
      setIsConnected(false);
    };
  }, [blogId]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const reset = useCallback(() => {
    disconnect();
    setEvents([]);
  }, [disconnect]);

  return { events, isConnected, connect, disconnect, reset };
}
