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
        className="flex w-full flex-col items-start gap-3 rounded-[18px] bg-white p-5 text-left card-shadow hover-lift tap-scale touch-manipulation"
      >
        <div className="flex w-full flex-col gap-1">
          <p className="text-base font-bold text-gray-900 leading-snug">{productName}</p>
          <p className="text-xs font-medium text-kiosk-accent uppercase tracking-wide">{variant.label}</p>
        </div>

        <div className="w-full flex justify-center py-3">
          {variant.image_url ? (
            <img
              src={variant.image_url}
              alt={`${productName} - ${variant.label}`}
              className="h-32 w-32 rounded-[14px] object-cover"
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-[14px] bg-kiosk-lighter text-4xl">
              📦
            </div>
          )}
        </div>

        <div className="w-full pt-2">
          <p className="text-2xl font-bold text-kiosk-primary">{formatCurrency(variant.price)}</p>
        </div>
      </button>
      <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 smooth-transition">
        {onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            aria-label="Edit variant"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-kiosk-light text-kiosk-primary hover:bg-kiosk-muted active:scale-90 smooth-transition touch-manipulation"
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
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label="Delete variant"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 active:scale-90 smooth-transition touch-manipulation"
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
