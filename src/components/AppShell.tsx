"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="md:ml-[280px] min-h-screen">
        <header className="sticky top-0 z-40 h-16 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="h-full max-w-[1400px] mx-auto px-8 flex items-center">
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="md:hidden mr-4 text-text-secondary"
              aria-label="Toggle sidebar"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <SearchBar />
          </div>
        </header>
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </>
  );
}
