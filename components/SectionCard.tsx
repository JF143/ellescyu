import Link from "next/link";
import type { Section } from "@/types";

type SectionCardProps = {
  section: Section;
};

export function SectionCard({ section }: SectionCardProps) {
  return (
    <Link
      href={`/section/${section.id}`}
      className="group flex min-h-56 flex-col items-center justify-center gap-6 rounded-2xl bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:bg-kiosk-light hover:shadow-md active:scale-[0.98]"
    >
      <span className="text-6xl" aria-hidden>
        {section.icon ?? "📦"}
      </span>
      <span className="text-3xl font-bold text-kiosk-primary">
        {section.name}
      </span>
    </Link>
  );
}
