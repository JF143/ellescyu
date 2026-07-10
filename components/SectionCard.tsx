import Link from "next/link";
import type { Section } from "@/types";

type SectionCardProps = {
  section: Section;
};

export function SectionCard({ section }: SectionCardProps) {
  return (
    <Link
      href={`/section/${section.id}`}
      className="group flex min-h-48 flex-col items-center justify-center gap-4 rounded-3xl border-2 border-kiosk-muted bg-white p-8 text-center shadow-md transition hover:-translate-y-1 hover:border-kiosk-accent hover:bg-kiosk-light hover:shadow-xl active:scale-[0.98]"
    >
      <span className="text-6xl" aria-hidden>
        {section.icon ?? "📦"}
      </span>
      <span className="text-3xl font-bold text-kiosk-primary group-hover:text-kiosk-primary">
        {section.name}
      </span>
    </Link>
  );
}
