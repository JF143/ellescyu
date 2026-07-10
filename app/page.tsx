"use client";

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
    <div className="min-h-screen bg-kiosk-lighter">
      <AdminSettingsLink />

      <main className="mx-auto max-w-6xl px-8 py-12 pr-[28%]">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-kiosk-primary">Ellescyu App</h1>
          <p className="mt-4 text-2xl text-gray-600">What does the customer want?</p>
        </header>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>

        {sections.length === 0 ? (
          <p className="mt-12 text-center text-xl text-gray-500">
            No sections yet. Add some in Admin settings.
          </p>
        ) : null}
      </main>
    </div>
  );
}
