"use client";

export default function Header({ title }: { title: string }) {
  return (
    <header className="px-4 sm:px-6 py-4" style={{ borderBottom: "1px solid var(--border-color)", background: "var(--bg-card)" }}>
      <h2 className="text-xl font-semibold md:ml-0 ml-12" style={{ color: "var(--text-primary)" }}>
        {title}
      </h2>
    </header>
  );
}
