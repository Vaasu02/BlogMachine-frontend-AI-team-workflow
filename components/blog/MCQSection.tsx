"use client";

import { useState } from "react";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { MCQ } from "@/lib/types";

interface MCQSectionProps {
  mcqs: MCQ[];
}

export default function MCQSection({ mcqs }: MCQSectionProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  if (!mcqs || mcqs.length === 0) return null;

  const handleSelect = (qId: number, option: string) => {
    if (revealed[qId]) return;
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleCheck = (qId: number) => {
    if (revealed[qId]) return;
    const mcq = mcqs.find((q) => q.id === qId);
    if (!mcq || !answers[qId]) return;

    const selectedLetter = answers[qId].charAt(0);
    const isCorrect = selectedLetter === mcq.correct_answer;

    setRevealed((prev) => ({ ...prev, [qId]: true }));
    setTotalAnswered((prev) => prev + 1);
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const getOptionStyle = (qId: number, option: string, correctAnswer: string): React.CSSProperties => {
    if (!revealed[qId]) {
      const isSelected = answers[qId] === option;
      return isSelected
        ? { borderColor: "#4ade80", background: "rgba(74, 222, 128, 0.1)" }
        : { borderColor: "var(--border-color)", background: "transparent" };
    }

    const optionLetter = option.charAt(0);
    const selectedLetter = answers[qId]?.charAt(0);

    if (optionLetter === correctAnswer) {
      return { borderColor: "#4ade80", background: "rgba(74, 222, 128, 0.15)" };
    }
    if (optionLetter === selectedLetter && selectedLetter !== correctAnswer) {
      return { borderColor: "#f87171", background: "rgba(248, 113, 113, 0.1)" };
    }
    return { borderColor: "var(--border-color)", opacity: 0.5 };
  };

  return (
    <div className="mt-8 pt-8" style={{ borderTop: "1px solid var(--border-color)" }}>
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle size={20} style={{ color: "#4ade80" }} />
        <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          Test Your Understanding
        </h2>
        {totalAnswered > 0 && (
          <span className="ml-auto text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            Score: {score}/{totalAnswered}
          </span>
        )}
      </div>

      <div className="space-y-6">
        {mcqs.map((mcq) => (
          <div
            key={mcq.id}
            className="rounded-xl border p-4 sm:p-5"
            style={{ background: "var(--bg-primary)", borderColor: "var(--border-color)" }}
          >
            <div className="flex items-start gap-2 mb-4">
              <span className="text-sm font-bold mt-0.5" style={{ color: "#4ade80" }}>
                Q{mcq.id}.
              </span>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>{mcq.question}</p>
            </div>

            <div className="space-y-2 mb-4">
              {mcq.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(mcq.id, option)}
                  disabled={revealed[mcq.id]}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm ${
                    !revealed[mcq.id] ? "cursor-pointer" : "cursor-default"
                  }`}
                  style={getOptionStyle(mcq.id, option, mcq.correct_answer)}
                >
                  <div className="flex items-center gap-2">
                    {revealed[mcq.id] && option.charAt(0) === mcq.correct_answer && (
                      <CheckCircle size={16} className="text-green-400 shrink-0" />
                    )}
                    {revealed[mcq.id] &&
                      answers[mcq.id]?.charAt(0) === option.charAt(0) &&
                      option.charAt(0) !== mcq.correct_answer && (
                        <XCircle size={16} className="text-red-400 shrink-0" />
                      )}
                    <span style={{ color: "var(--text-primary)" }}>{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {!revealed[mcq.id] && (
              <button
                onClick={() => handleCheck(mcq.id)}
                disabled={!answers[mcq.id]}
                className="px-4 py-2 text-white text-sm rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ background: "var(--accent-green)" }}
              >
                Check Answer
              </button>
            )}

            {revealed[mcq.id] && mcq.explanation && (
              <div className="mt-3 p-3 rounded-lg" style={{ background: "var(--bg-card)" }}>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Explanation: </span>
                  {mcq.explanation}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {totalAnswered === mcqs.length && (
        <div className="mt-6 p-4 rounded-xl text-center" style={{ background: "var(--accent-green)", border: "1px solid #2d7a50" }}>
          <p className="text-lg font-semibold text-white">
            You scored {score}/{mcqs.length}
          </p>
          <p className="text-sm text-green-200 mt-1">
            {score === mcqs.length
              ? "Perfect score! Excellent preparation."
              : score >= mcqs.length * 0.6
              ? "Good job! Keep revising."
              : "Keep studying — you'll get there."}
          </p>
        </div>
      )}
    </div>
  );
}
