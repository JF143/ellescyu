"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/")}
      className="inline-flex min-h-16 items-center gap-3 rounded-2xl bg-kiosk-muted px-8 text-xl font-bold text-kiosk-primary shadow-sm transition hover:bg-kiosk-accent hover:text-white active:scale-[0.98]"
    >
      <span aria-hidden className="text-2xl">
        ←
      </span>
      Back
    </button>
  );
}
