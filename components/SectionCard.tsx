import Link from "next/link";
import type { Section } from "@/types";

type SectionCardProps = {
  section: Section;
};

export function SectionCard({ section }: SectionCardProps) {
  return (
    <Link
      href={`/section/${section.id}`}
      className="group flex min-h-60 flex-col items-center justify-center gap-4 rounded-2xl bg-white p-6 text-center shadow-md transition hover:-translate-y-2 hover:shadow-lg active:scale-[0.98]"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-kiosk-light to-kiosk-lighter text-5xl">
        <span aria-hidden>
          {section.icon ?? "📦"}
        </span>
      </div>
      <h3 className="text-2xl font-bold text-kiosk-primary leading-tight">
        {section.name}
      </h3>
    </Link>
  );
}
