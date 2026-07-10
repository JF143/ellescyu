"use client";

import { formatCurrency } from "@/lib/formatCurrency";
import type { Variant } from "@/types";

type VariantCardProps = {
  productName: string;
  variant: Variant;
  onAdd: () => void;
  onEdit?: () => void;
};

export function VariantCard({ productName, variant, onAdd, onEdit }: VariantCardProps) {
  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onAdd}
        className="flex min-h-56 w-full flex-col items-start justify-between gap-4 rounded-2xl bg-white p-8 text-left shadow-sm transition hover:-translate-y-1 hover:bg-kiosk-light hover:shadow-md active:scale-[0.98]"
      >
        <div>
          <p className="text-2xl font-bold leading-tight text-gray-900">{productName}</p>
          <p className="mt-2 text-xl font-medium text-kiosk-primary">{variant.label}</p>
        </div>
        <p className="text-3xl font-bold text-kiosk-accent">{formatCurrency(variant.price)}</p>
      </button>
      {onEdit && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          aria-label="Edit variant"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg bg-kiosk-muted text-kiosk-primary opacity-0 transition hover:bg-kiosk-accent hover:text-white group-hover:opacity-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        </button>
      )}
    </div>
  );
}
