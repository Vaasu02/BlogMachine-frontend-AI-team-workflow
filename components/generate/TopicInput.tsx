"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

interface TopicInputProps {
  onSubmit: (topic: string) => void;
  disabled: boolean;
}

export default function TopicInput({ onSubmit, disabled }: TopicInputProps) {
  const [topic, setTopic] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !disabled) {
      onSubmit(topic.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic (e.g., 'India's Digital Public Infrastructure')"
          disabled={disabled}
          className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm min-w-0"
          style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
        />
        <button
          type="submit"
          disabled={disabled || !topic.trim()}
          className="px-6 py-3 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium shrink-0"
          style={{ background: disabled ? "var(--border-color)" : "var(--accent-green)" }}
        >
          {disabled ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Generating
            </>
          ) : (
            <>
              <Send size={18} />
              Generate
            </>
          )}
        </button>
      </div>
    </form>
  );
}
