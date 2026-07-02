"use client";

interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Progress</span>
        <span className="text-sm font-semibold" style={{ color: "#4ade80" }}>{progress}%</span>
      </div>
      <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: "var(--bg-primary)" }}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, background: "linear-gradient(to right, #174D38, #4ade80)" }}
        />
      </div>
    </div>
  );
}
