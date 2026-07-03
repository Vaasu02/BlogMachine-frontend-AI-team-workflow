"use client";

import { Globe, FileText, CheckCircle, AlertTriangle, BarChart3, BookOpen, Image, HelpCircle } from "lucide-react";
import { AgentEvent, AgentDetails as Details } from "@/lib/types";

interface AgentDetailsProps {
  events: AgentEvent[];
}

function getCompletedDetails(events: AgentEvent[]): { agent: string; details: Details }[] {
  const result: { agent: string; details: Details }[] = [];
  for (const event of events) {
    if (event.status === "completed" && event.details && event.current_agent !== "system") {
      result.push({ agent: event.current_agent, details: event.details });
    }
  }
  return result;
}

function getActiveAgent(events: AgentEvent[]): string | null {
  const latest = [...events].reverse().find(e => e.status === "running");
  return latest?.current_agent || null;
}

function ResearchDetails({ details }: { details: Details }) {
  return (
    <div className="space-y-3">
      {details.search_queries && details.search_queries.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Search Queries</p>
          {details.search_queries.map((q, i) => (
            <div key={i} className="flex items-center gap-2 py-1">
              <Globe size={12} className="text-green-400 shrink-0" />
              <span className="text-sm" style={{ color: "var(--text-primary)" }}>{q}</span>
            </div>
          ))}
        </div>
      )}
      {details.sources && details.sources.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
            Sources Found ({details.sources.length})
          </p>
          <div className="space-y-1">
            {details.sources.map((s, i) => (
              <div key={i} className="flex items-start gap-2 py-1 px-2 rounded" style={{ background: "var(--bg-primary)" }}>
                <Globe size={12} className="text-green-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs truncate" style={{ color: "var(--text-primary)" }}>{s.title}</p>
                  <p className="text-xs truncate" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>{s.url}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {details.key_points && details.key_points.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Key Points</p>
          <ul className="space-y-1">
            {details.key_points.map((p, i) => (
              <li key={i} className="text-xs flex items-start gap-2" style={{ color: "var(--text-primary)" }}>
                <span className="text-green-400 mt-0.5">•</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function NarrativeDetails({ details }: { details: Details }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {details.gs_paper && (
          <span className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--accent-green)", color: "#bbf7d0" }}>
            {details.gs_paper}
          </span>
        )}
        {details.subject && (
          <span className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--accent-maroon)", color: "#fecaca" }}>
            {details.subject}
          </span>
        )}
      </div>
      {details.sections && details.sections.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
            Planned Sections ({details.section_count})
          </p>
          <ol className="space-y-1">
            {details.sections.map((s, i) => (
              <li key={i} className="text-xs flex items-center gap-2 py-1 px-2 rounded" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
                <span className="text-green-400 font-mono text-[10px] shrink-0">{i + 1}.</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function WritingDetails({ details }: { details: Details }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        <div className="text-center p-2 rounded" style={{ background: "var(--bg-primary)" }}>
          <p className="text-lg font-bold" style={{ color: "#4ade80" }}>{details.word_count}</p>
          <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>Words</p>
        </div>
        <div className="text-center p-2 rounded" style={{ background: "var(--bg-primary)" }}>
          <p className="text-lg font-bold" style={{ color: "#4ade80" }}>{details.section_count}</p>
          <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>Sections</p>
        </div>
      </div>
      {details.sections_written && details.sections_written.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Sections Written</p>
          {details.sections_written.map((s, i) => (
            <div key={i} className="flex items-center gap-2 py-1">
              <CheckCircle size={12} className="text-green-400 shrink-0" />
              <span className="text-xs" style={{ color: "var(--text-primary)" }}>{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FactCheckDetails({ details }: { details: Details }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: details.verified ? "rgba(74, 222, 128, 0.1)" : "rgba(248, 113, 113, 0.1)" }}>
          {details.verified ? (
            <CheckCircle size={14} className="text-green-400" />
          ) : (
            <AlertTriangle size={14} className="text-red-400" />
          )}
          <span className="text-xs font-medium" style={{ color: details.verified ? "#4ade80" : "#f87171" }}>
            {details.verified ? "All claims verified" : "Issues found"}
          </span>
        </div>
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {details.claims_checked} claims checked
        </span>
      </div>

      {details.sources_used && details.sources_used.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>References Used</p>
          <div className="space-y-1">
            {details.sources_used.map((s, i) => (
              <div key={i} className="flex items-start gap-2 py-1 px-2 rounded" style={{ background: "var(--bg-primary)" }}>
                <Globe size={12} className="text-green-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs truncate" style={{ color: "var(--text-primary)" }}>{s.title}</p>
                  <p className="text-xs truncate" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>{s.url}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {details.issues && details.issues.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Issues Found</p>
          {details.issues.map((issue, i) => (
            <div key={i} className="p-2 rounded mb-1" style={{ background: "rgba(248, 113, 113, 0.05)", border: "1px solid rgba(248, 113, 113, 0.2)" }}>
              <p className="text-xs font-medium text-red-400">{issue.claim}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{issue.correction}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SEODetails({ details }: { details: Details }) {
  const scoreEntries = Object.entries(details.scores || {});
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="text-center p-2 rounded" style={{ background: "var(--bg-primary)" }}>
          <p className="text-xl font-bold" style={{ color: (details.seo_score || 0) >= 75 ? "#4ade80" : (details.seo_score || 0) >= 65 ? "#fbbf24" : "#f87171" }}>
            {details.seo_score}
          </p>
          <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>SEO Score</p>
        </div>
      </div>

      {scoreEntries.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Parameter Breakdown</p>
          <div className="space-y-1.5">
            {scoreEntries.map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs w-28 capitalize" style={{ color: "var(--text-secondary)" }}>
                  {key.replace(/_/g, " ")}
                </span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-primary)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(value as number) * 10}%`,
                      background: (value as number) >= 8 ? "#4ade80" : (value as number) >= 6 ? "#fbbf24" : "#f87171",
                    }}
                  />
                </div>
                <span className="text-xs font-mono w-6 text-right" style={{ color: "var(--text-primary)" }}>{value as number}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {details.improvements && details.improvements.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Improvements</p>
          {details.improvements.map((imp, i) => (
            <p key={i} className="text-xs py-0.5" style={{ color: "var(--text-secondary)" }}>• {imp}</p>
          ))}
        </div>
      )}

      {details.tags && details.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {details.tags.map((tag, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded" style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}>
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function MCQDetails({ details }: { details: Details }) {
  return (
    <div className="flex items-center gap-2">
      <HelpCircle size={14} className="text-green-400" />
      <span className="text-sm" style={{ color: "var(--text-primary)" }}>
        {details.question_count} practice questions generated
      </span>
    </div>
  );
}

function ImageDetails({ details }: { details: Details }) {
  return (
    <div className="space-y-2">
      <p className="text-sm" style={{ color: "var(--text-primary)" }}>
        {details.image_count} images selected
      </p>
      {details.images && details.images.length > 0 && (
        <div className="space-y-1">
          {details.images.map((img, i) => (
            <div key={i} className="flex items-center gap-2 py-1 px-2 rounded" style={{ background: "var(--bg-primary)" }}>
              <Image size={12} className="text-green-400 shrink-0" />
              <span className="text-xs truncate" style={{ color: "var(--text-primary)" }}>{img.alt}</span>
              {img.credit && (
                <span className="text-xs ml-auto shrink-0" style={{ color: "var(--text-secondary)" }}>{img.credit}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function renderDetails(type: string, details: Details) {
  switch (type) {
    case "research": return <ResearchDetails details={details} />;
    case "narrative": return <NarrativeDetails details={details} />;
    case "writing": return <WritingDetails details={details} />;
    case "fact_check": return <FactCheckDetails details={details} />;
    case "humanize": return null;
    case "seo": return <SEODetails details={details} />;
    case "mcq": return <MCQDetails details={details} />;
    case "images": return <ImageDetails details={details} />;
    default: return null;
  }
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  research: <Globe size={16} className="text-green-400" />,
  narrative: <BookOpen size={16} className="text-green-400" />,
  writing: <FileText size={16} className="text-green-400" />,
  fact_check: <CheckCircle size={16} className="text-green-400" />,
  seo: <BarChart3 size={16} className="text-green-400" />,
  mcq: <HelpCircle size={16} className="text-green-400" />,
  images: <Image size={16} className="text-green-400" />,
};

const SECTION_TITLES: Record<string, string> = {
  research: "Topic Research",
  narrative: "Blog Structure",
  writing: "Content Written",
  fact_check: "Fact Check",
  humanize: "Content Humanized",
  seo: "SEO Analysis",
  mcq: "Practice Questions",
  images: "Image Selection",
};

export default function AgentDetails({ events }: AgentDetailsProps) {
  const completed = getCompletedDetails(events);
  const activeAgent = getActiveAgent(events);

  if (completed.length === 0 && !activeAgent) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText size={32} style={{ color: "var(--text-secondary)" }} className="mb-3 opacity-50" />
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Details will appear as agents complete their work...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {completed.map(({ agent, details }, index) => {
        const content = renderDetails(details.type, details);
        if (!content) return null;
        return (
          <div key={`${agent}-${index}`}>
            <div className="flex items-center gap-2 mb-2">
              {SECTION_ICONS[details.type] || <FileText size={16} className="text-green-400" />}
              <h4 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {SECTION_TITLES[details.type] || agent}
              </h4>
            </div>
            <div className="pl-6">
              {content}
            </div>
            {index < completed.length - 1 && (
              <div className="mt-4 h-px" style={{ background: "var(--border-color)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
