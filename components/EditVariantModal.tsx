"use client";

import { useState } from "react";
import { useVariants } from "@/hooks/useVariants";
import type { Variant } from "@/types";

type EditVariantModalProps = {
  variant: Variant;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function EditVariantModal({ variant, isOpen, onClose, onSuccess }: EditVariantModalProps) {
  const { updateVariant } = useVariants();
  const [label, setLabel] = useState(variant.label);
  const [price, setPrice] = useState(variant.price.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!label.trim()) return;

    const numPrice = Number(price);
    if (Number.isNaN(numPrice) || numPrice < 0) return;

    setIsSubmitting(true);
    try {
      await updateVariant(variant.id, { label: label.trim(), price: numPrice });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update variant:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-kiosk-primary">Edit Variant</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-kiosk-muted text-kiosk-primary hover:bg-kiosk-accent hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-lg font-medium text-gray-700">Label</span>
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className="w-full rounded-xl border-2 border-kiosk-muted px-4 py-3 text-lg outline-none focus:border-kiosk-accent"
              placeholder="e.g. Single"
              autoFocus
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-lg font-medium text-gray-700">Price</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="w-full rounded-xl border-2 border-kiosk-muted px-4 py-3 text-lg outline-none focus:border-kiosk-accent"
              placeholder="e.g. 10.00"
            />
          </label>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl bg-kiosk-muted py-4 text-lg font-bold text-kiosk-primary transition hover:bg-kiosk-light"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !label.trim()}
              className="flex-1 rounded-2xl bg-kiosk-primary py-4 text-lg font-bold text-white transition hover:bg-kiosk-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
