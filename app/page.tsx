"use client";

import Link from "next/link";
import { useState } from "react";
import { useMounted } from "@/hooks/useMounted";
import { useToast } from "@/components/Toast";
import { AdminSettingsLink } from "@/components/AdminSettingsLink";
import { SectionCard } from "@/components/SectionCard";
import { AddCategoryModal } from "@/components/AddCategoryModal";
import { CategorySettingsModal } from "@/components/CategorySettingsModal";
import { useSections } from "@/hooks/useSections";
import type { Section } from "@/types";

export default function HomePage() {
  const mounted = useMounted();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<Section | null>(null);
  const { showToast } = useToast();
  const { sections, isLoading, error, isReady, fetchSections } = useSections();

  const filteredSections = sections.filter((section) =>
    section.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCategorySuccess = async () => {
    await fetchSections();
    showToast("Category added successfully");
  };

  const handleSettingsSuccess = async () => {
    await fetchSections();
    showToast("Category updated successfully");
  };

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
      <aside className="fixed left-0 top-0 bottom-0 z-40 w-64 overflow-y-auto bg-white shadow-xl border-r border-kiosk-muted">
        <div className="sticky top-0 bg-white z-10 p-4 border-b border-kiosk-muted">
          <div className="flex items-center justify-between mb-3">
            <AdminSettingsLink />
            <button
              type="button"
              onClick={() => setSettingsSection(null)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-kiosk-muted text-kiosk-primary hover:bg-kiosk-accent hover:text-white transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
          <h2 className="text-xl font-bold text-kiosk-primary mb-3">Categories</h2>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kiosk-muted pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-kiosk-muted bg-kiosk-lighter text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-kiosk-primary focus:border-transparent transition"
            />
          </div>
        </div>
        <div className="p-3 space-y-1">
          {filteredSections.map((section) => (
            <div key={section.id} className="flex items-center gap-2">
              <Link
                href={`/section/${section.id}`}
                className="flex-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-kiosk-lighter hover:text-kiosk-primary active:bg-kiosk-light"
              >
                <span className="text-xl">{section.icon ?? "📦"}</span>
                <span className="truncate">{section.name}</span>
              </Link>
              <button
                type="button"
                onClick={() => setSettingsSection(section)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-kiosk-primary hover:bg-kiosk-muted transition"
                aria-label="Category settings"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          ))}
          {filteredSections.length === 0 && searchQuery && (
            <p className="px-4 py-8 text-center text-sm text-gray-500">No categories found</p>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-72 pr-[28%] flex-1">
        <div className="px-8 py-12">
          <header className="mb-12 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-kiosk-accent uppercase tracking-wide mb-2">Welcome</p>
              <h1 className="text-6xl font-bold text-kiosk-primary mb-3">Select Your Items</h1>
              <p className="text-lg text-gray-600">Browse through our collection and build your order</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-kiosk-primary text-4xl font-bold text-white shadow-lg transition hover:bg-kiosk-accent active:scale-[0.98]"
            >
              +
            </button>
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

      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddCategorySuccess}
      />

      <CategorySettingsModal
        section={settingsSection}
        isOpen={!!settingsSection}
        onClose={() => setSettingsSection(null)}
        onSuccess={handleSettingsSuccess}
      />
    </div>
  );
}
