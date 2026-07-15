import type { Brand, Product } from "@/types";

/**
 * Returns the display name for a product's brand, looked up from the brands list.
 * Falls back to "Other" if the product has no brand_id set (e.g. legacy data
 * that hasn't been assigned a brand yet).
 */
export function getBrand(product: Product, brands: Brand[]): string {
  if (!product.brand_id) return "Other";
  const match = brands.find((b) => b.id === product.brand_id);
  return match?.name ?? "Other";
}