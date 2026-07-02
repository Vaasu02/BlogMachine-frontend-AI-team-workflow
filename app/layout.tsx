import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import { ToastProvider } from "@/components/shared/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blog Machine",
  description: "AI-powered blog generation with multi-agent team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="h-full antialiased" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
        <ToastProvider>
          <Sidebar />
          <main className="md:ml-64 min-h-full">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
