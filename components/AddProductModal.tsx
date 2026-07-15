"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useBrands } from "@/hooks/useBrands";

type VariantRow = { label: string; price: string };

const emptyVariantRow = (): VariantRow => ({ label: "", price: "" });

type AddProductModalProps = {
  sectionId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function AddProductModal({ sectionId, isOpen, onClose, onSuccess }: AddProductModalProps) {
  const { addProduct } = useProducts();
  const { brands } = useBrands();
  const [productName, setProductName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [productVariants, setProductVariants] = useState<VariantRow[]>([emptyVariantRow()]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setProductName("");
    setBrandId("");
    setProductVariants([emptyVariantRow()]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!productName.trim()) return;

    const rows = productVariants
      .filter((row) => row.label.trim() && row.price.trim())
      .map((row) => ({ label: row.label.trim(), price: Number(row.price) }))
      .filter((row) => !Number.isNaN(row.price) && row.price >= 0);

    if (rows.length === 0) return;

    setIsSubmitting(true);
    try {
      await addProduct(sectionId, productName.trim(), rows, brandId || undefined);
      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to add product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-kiosk-primary">Add New Item</h2>
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
            <span className="mb-2 block text-lg font-medium text-gray-700">Item name</span>
            <input
              value={productName}
              onChange={(event) => setProductName(event.target.value)}
              className="w-full rounded-xl border-2 border-kiosk-muted px-4 py-3 text-lg outline-none focus:border-kiosk-accent"
              placeholder="e.g. Nescafe Creamy White"
              autoFocus
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-lg font-medium text-gray-700">Brand</span>
            <select
              value={brandId}
              onChange={(event) => setBrandId(event.target.value)}
              className="w-full rounded-xl border-2 border-kiosk-muted px-4 py-3 text-lg outline-none focus:border-kiosk-accent"
            >
              <option value="">No brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-3">
            <p className="text-lg font-medium text-gray-700">Variants</p>
            {productVariants.map((row, index) => (
              <div key={index} className="grid grid-cols-2 gap-3">
                <input
                  value={row.label}
                  onChange={(event) => {
                    const next = [...productVariants];
                    next[index] = { ...next[index], label: event.target.value };
                    setProductVariants(next);
                  }}
                  className="rounded-xl border-2 border-kiosk-muted px-4 py-3 text-lg outline-none focus:border-kiosk-accent"
                  placeholder="Label (e.g. Single)"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={row.price}
                  onChange={(event) => {
                    const next = [...productVariants];
                    next[index] = { ...next[index], price: event.target.value };
                    setProductVariants(next);
                  }}
                  className="rounded-xl border-2 border-kiosk-muted px-4 py-3 text-lg outline-none focus:border-kiosk-accent"
                  placeholder="Price"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setProductVariants((prev) => [...prev, emptyVariantRow()])}
              className="rounded-xl bg-kiosk-muted px-4 py-3 text-lg font-semibold text-kiosk-primary transition hover:bg-kiosk-light"
            >
              + Add another variant
            </button>
          </div>

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
              disabled={isSubmitting || !productName.trim()}
              className="flex-1 rounded-2xl bg-kiosk-primary py-4 text-lg font-bold text-white transition hover:bg-kiosk-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Adding..." : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}