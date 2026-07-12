"use client";

import { formatCurrency } from "@/lib/formatCurrency";
import type { Variant } from "@/types";

type VariantCardProps = {
  productName: string;
  variant: Variant;
  onAdd: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function VariantCard({ productName, variant, onAdd, onEdit, onDelete }: VariantCardProps) {
  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onAdd}
        className="flex min-h-56 w-full flex-col items-start justify-between gap-2 rounded-2xl bg-white p-5 text-left shadow-md transition hover:-translate-y-2 hover:shadow-lg active:scale-[0.98] touch-manipulation"
      >
        <div className="flex flex-col gap-1">
          <p className="text-lg font-bold text-gray-900">{productName}</p>
          <p className="text-sm font-medium text-kiosk-primary">{variant.label}</p>
        </div>
        <p className="text-2xl font-bold text-kiosk-accent">{formatCurrency(variant.price)}</p>
      </button>
      <div className="absolute top-3 right-3 flex gap-1">
        {onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            aria-label="Edit variant"
            className="flex h-6 w-6 items-center justify-center transition hover:text-kiosk-accent touch-manipulation"
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
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label="Delete variant"
            className="flex h-6 w-6 items-center justify-center transition hover:text-red-500 touch-manipulation"
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
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
