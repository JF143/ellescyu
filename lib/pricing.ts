import type { CartItem } from "@/types";

// The unit price actually charged for one "unit" of this line — one piece,
// or one box, depending on the line's selling unit.
export function getItemUnitPrice(item: CartItem): number {
  if (item.sellingUnit === "box") {
    // Box is exclusively a wholesale selling unit — there is no such thing
    // as a retail box price. Fall back to wholesale piece price only if
    // box_price was somehow never set (shouldn't happen since the UI won't
    // let a variant switch to Box without a box price).
    return item.boxPrice ?? item.wholesalePrice ?? item.retailPrice;
  }
  if (item.priceType === "wholesale" && item.wholesalePrice != null) {
    return item.wholesalePrice;
  }
  return item.retailPrice;
}

// quantity * unit price — what shows as the line total.
export function getItemLineTotal(item: CartItem): number {
  return getItemUnitPrice(item) * item.quantity;
}

// The equivalent number of individual pieces this line represents.
// For Piece lines, quantity IS the piece count. For Box lines, quantity is
// the number of boxes, so this multiplies out by box_quantity.
// Not wired into any stock deduction yet — reserved for future inventory work.
export function getItemInventoryQuantity(item: CartItem): number {
  if (item.sellingUnit === "box") {
    return item.quantity * (item.boxQuantity ?? 1);
  }
  return item.quantity;
}