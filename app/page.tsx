"use client";

import Link from "next/link";
import { useState } from "react";
import { useMounted } from "@/hooks/useMounted";
import { AdminSettingsLink } from "@/components/AdminSettingsLink";
import { SectionCard } from "@/components/SectionCard";
import { useSections } from "@/hooks/useSections";

export default function HomePage() {
  const mounted = useMounted();
  const [searchQuery, setSearchQuery] = useState("");
  const { sections, isLoading, error, isReady } = useSections();

  const filteredSections = sections.filter((section) =>
    section.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kiosk-lighter">
        <p className="text-2xl font-semibold text-kiosk-primary">Loading menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kiosk-lighter">
        <p className="text-2xl font-semibold text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-kiosk-lighter to-kiosk-light">
      {/* Left Sidebar - Categories */}
      <aside className="fixed left-0 top-0 bottom-0 z-40 w-72 overflow-y-auto bg-white shadow-xl border-r border-kiosk-muted">
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-kiosk-muted">
          <AdminSettingsLink />
          <h2 className="text-2xl font-bold text-kiosk-primary mb-4">Categories</h2>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-kiosk-muted pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-kiosk-muted bg-kiosk-lighter text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-kiosk-primary focus:border-transparent transition"
            />
          </div>
        </div>
        <div className="p-4 space-y-1">
          {filteredSections.map((section) => (
            <Link
              key={section.id}
              href={`/section/${section.id}`}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-kiosk-lighter hover:text-kiosk-primary active:bg-kiosk-light"
            >
              <span className="text-2xl">{section.icon ?? "📦"}</span>
              <span className="truncate">{section.name}</span>
            </Link>
          ))}
          {filteredSections.length === 0 && searchQuery && (
            <p className="px-4 py-8 text-center text-sm text-gray-500">No categories found</p>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-72 pr-[28%] flex-1">
        <div className="px-8 py-12">
          <header className="mb-12">
            <p className="text-sm font-semibold text-kiosk-accent uppercase tracking-wide mb-2">Welcome</p>
            <h1 className="text-6xl font-bold text-kiosk-primary mb-3">Select Your Items</h1>
            <p className="text-lg text-gray-600">Browse through our collection and build your order</p>
          </header>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSections.map((section) => (
              <SectionCard key={section.id} section={section} />
            ))}
          </div>

          {sections.length === 0 ? (
            <p className="mt-12 text-center text-xl text-gray-500">
              No sections yet. Add some in Admin settings.
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
