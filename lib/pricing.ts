import type { CartItem } from "@/types";

export function getItemUnitPrice(item: CartItem): number {
  if (item.isBox && item.boxPrice != null) {
    return item.boxPrice;
  }
  if (item.priceType === "wholesale" && item.wholesalePrice != null) {
    return item.wholesalePrice;
  }
  return item.retailPrice;
}

export function getItemLineTotal(item: CartItem): number {
  return getItemUnitPrice(item) * item.quantity;
}