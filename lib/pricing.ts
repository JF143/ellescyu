// import type { CartItem, CustomerType } from "@/types";

// export function getLineUnitPrice(item: CartItem, customerType: CustomerType): number {
//   if (item.sellingUnit === "box") {
//     return item.boxPrice ?? item.retailPrice;
//   }
//   if (customerType === "wholesale" && item.wholesalePrice != null) {
//     return item.wholesalePrice;
//   }
//   return item.retailPrice;
// }

// export function getLineTotal(item: CartItem, customerType: CustomerType): number {
//   return getLineUnitPrice(item, customerType) * item.quantity;
// }