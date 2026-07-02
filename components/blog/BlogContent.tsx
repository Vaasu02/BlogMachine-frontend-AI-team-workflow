"use client";

interface BlogContentProps {
  content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
  const sections = parseContent(content);

  return (
    <article className="max-w-none">
      {sections.map((section, index) => (
        <div key={index} className="mb-6">
          {section.heading && (
            <h2
              id={`section-${index}`}
              className="text-xl font-bold mt-8 mb-3 pb-2"
              style={{ color: "var(--text-primary)", borderBottom: "1px solid var(--border-color)" }}
            >
              {section.heading}
            </h2>
          )}
          {section.paragraphs.map((para, pIndex) => (
            <p
              key={pIndex}
              className="leading-relaxed mb-3 text-base"
              style={{ color: "var(--text-secondary)" }}
            >
              {para}
            </p>
          ))}
        </div>
      ))}
    </article>
  );
}

interface ContentSection {
  heading: string | null;
  paragraphs: string[];
}

function parseContent(content: string): ContentSection[] {
  const lines = content.split("\n");
  const sections: ContentSection[] = [];
  let current: ContentSection = { heading: null, paragraphs: [] };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("## ")) {
      if (current.heading || current.paragraphs.length > 0) {
        sections.push(current);
      }
      current = { heading: trimmed.replace("## ", ""), paragraphs: [] };
    } else if (trimmed.startsWith("### ")) {
      if (current.paragraphs.length > 0 || current.heading) {
        sections.push(current);
      }
      current = { heading: trimmed.replace("### ", ""), paragraphs: [] };
    } else if (trimmed.length > 0) {
      current.paragraphs.push(trimmed);
    }
  }

  if (current.heading || current.paragraphs.length > 0) {
    sections.push(current);
  }

  return sections;
}

export function TableOfContents({ content }: { content: string }) {
  const headings = content
    .split("\n")
    .filter((line) => line.trim().startsWith("## "))
    .map((line, index) => ({
      text: line.trim().replace("## ", ""),
      id: `section-${index}`,
    }));

  if (headings.length === 0) return null;

  return (
    <nav className="rounded-lg p-4 mb-6" style={{ background: "var(--bg-primary)" }}>
      <h3 className="text-sm font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
        Table of Contents
      </h3>
      <ul className="space-y-1">
        {headings.map((heading, index) => (
          <li key={index}>
            <a
              href={`#section-${index}`}
              className="text-sm hover:underline"
              style={{ color: "#4ade80" }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
