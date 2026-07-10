"use client";

import Link from "next/link";
import { useMounted } from "@/hooks/useMounted";
import { AdminSettingsLink } from "@/components/AdminSettingsLink";
import { SectionCard } from "@/components/SectionCard";
import { useSections } from "@/hooks/useSections";

export default function HomePage() {
  const mounted = useMounted();
  const { sections, isLoading, error, isReady } = useSections();

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
    <div className="flex min-h-screen bg-kiosk-lighter">
      {/* Left Sidebar - Categories */}
      <aside className="fixed left-0 top-0 bottom-0 z-40 w-64 overflow-y-auto bg-white shadow-lg">
        <div className="p-6">
          <AdminSettingsLink />
          <h2 className="text-xl font-bold text-kiosk-primary mb-6">All Menu</h2>
          <div className="space-y-2">
            {sections.map((section) => (
              <Link
                key={section.id}
                href={`/section/${section.id}`}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-kiosk-lighter active:bg-kiosk-light"
              >
                <span className="text-xl">{section.icon ?? "📦"}</span>
                <span>{section.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 pr-[28%] flex-1">
        <div className="px-8 py-8">
          <header className="mb-10">
            <h1 className="text-5xl font-bold text-kiosk-primary">Select Item</h1>
            <p className="mt-2 text-lg text-gray-600">Browse and choose what you&apos;d like to order</p>
          </header>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
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
