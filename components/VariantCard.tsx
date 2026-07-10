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
        className="flex min-h-72 w-full flex-col items-start justify-between gap-3 rounded-2xl bg-white p-6 text-left shadow-md transition hover:-translate-y-2 hover:shadow-lg active:scale-[0.98] touch-manipulation"
      >
        <div className="flex flex-col gap-1">
          <p className="text-xl font-bold text-gray-900">{productName}</p>
          <p className="text-sm font-medium text-kiosk-primary">{variant.label}</p>
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
          className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-lg bg-kiosk-muted text-kiosk-primary opacity-100 transition hover:bg-kiosk-accent hover:text-white active:scale-95 shadow-md touch-manipulation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
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
