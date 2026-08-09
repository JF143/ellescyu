"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { STORAGE_KEYS, storageGet, storageSet } from "@/lib/storage";
import { getItemUnitPrice } from "@/lib/pricing";
import type { CartItem, PriceType, SellingUnit, Variant } from "@/types";

export type CheckoutStage = "cart" | "payment" | "change";

type CartContextValue = {
  cart: CartItem[];
  addToCart: (variant: Variant, productName: string) => boolean;
  incrementItem: (variantId: string) => void;
  decrementItem: (variantId: string) => void;
  removeItem: (variantId: string) => void;
  setLinePriceType: (variantId: string, priceType: PriceType) => void;
  setLineSellingUnit: (variantId: string, sellingUnit: SellingUnit) => void;
  clearCart: () => CartItem[];
  cartTotal: number;
  cartCount: number;
  checkoutStage: CheckoutStage;
  setCheckoutStage: (stage: CheckoutStage) => void;
  appReady: boolean;
  setAppReady: (ready: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function KioskProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutStage, setCheckoutStage] = useState<CheckoutStage>("cart");
  const [appReady, setAppReady] = useState(true);

  useEffect(() => {
    setCart(storageGet(STORAGE_KEYS.cart, []));
  }, []);

  useEffect(() => {
    storageSet(STORAGE_KEYS.cart, cart);
  }, [cart]);

  const addToCart = useCallback(
    (variant: Variant, productName: string) => {
      // Block adding new items once checkout (payment/change) has started
      if (checkoutStage !== "cart") {
        return false;
      }
      setCart((prev) => {
        const existing = prev.find((item) => item.variantId === variant.id);
        if (existing) {
          return prev.map((item) =>
            item.variantId === variant.id ? { ...item, quantity: item.quantity + 1 } : item,
          );
        }
        return [
          ...prev,
          {
            variantId: variant.id,
            productName,
            variantLabel: variant.label,
            retailPrice: variant.retail_price,
            wholesalePrice: variant.wholesale_price ?? null,
            boxQuantity: variant.box_quantity ?? null,
            boxPrice: variant.box_price ?? null,
            // Default: Piece + Retail, per spec
            priceType: "retail",
            sellingUnit: "piece",
            quantity: 1,
          },
        ];
      });
      return true;
    },
    [checkoutStage],
  );

  const incrementItem = useCallback(
    (variantId: string) => {
      if (checkoutStage !== "cart") return;
      setCart((prev) =>
        prev.map((item) =>
          item.variantId === variantId ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      );
    },
    [checkoutStage],
  );

  const decrementItem = useCallback(
    (variantId: string) => {
      if (checkoutStage !== "cart") return;
      setCart((prev) =>
        prev
          .map((item) =>
            item.variantId === variantId ? { ...item, quantity: item.quantity - 1 } : item,
          )
          .filter((item) => item.quantity > 0),
      );
    },
    [checkoutStage],
  );

  const removeItem = useCallback(
    (variantId: string) => {
      if (checkoutStage !== "cart") return;
      setCart((prev) => prev.filter((item) => item.variantId !== variantId));
    },
    [checkoutStage],
  );

  // Only meaningful while sellingUnit === "piece" — Box is wholesale-only,
  // so the price type selector is disabled in the UI whenever a line is in
  // Box mode. This guard is a second line of defense against that same rule.
  const setLinePriceType = useCallback(
    (variantId: string, priceType: PriceType) => {
      if (checkoutStage !== "cart") return;
      setCart((prev) =>
        prev.map((item) => {
          if (item.variantId !== variantId) return item;
          if (item.sellingUnit === "box") return item;
          if (priceType === "wholesale" && item.wholesalePrice == null) return item;
          return { ...item, priceType };
        }),
      );
    },
    [checkoutStage],
  );

  // Switching to Box always forces the price type to wholesale, since
  // Retail + Box is not a valid combination. Switching back to Piece leaves
  // whatever price type was last selected untouched and unlocks the toggle.
  const setLineSellingUnit = useCallback(
    (variantId: string, sellingUnit: SellingUnit) => {
      if (checkoutStage !== "cart") return;
      setCart((prev) =>
        prev.map((item) => {
          if (item.variantId !== variantId) return item;
          if (sellingUnit === "box") {
            if (item.boxPrice == null) return item;
            // Note: priceType is intentionally left untouched here. Box always
            // uses the box price regardless of priceType, and leaving the
            // stored value alone means switching back to Piece restores
            // whichever Retail/Wholesale choice was active before Box mode.
            return { ...item, sellingUnit: "box" };
          }
          return { ...item, sellingUnit: "piece" };
        }),
      );
    },
    [checkoutStage],
  );

  const clearCart = useCallback(() => {
    let snapshot: CartItem[] = [];
    setCart((prev) => {
      snapshot = prev;
      return [];
    });
    return snapshot;
  }, []);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + getItemUnitPrice(item) * item.quantity, 0),
    [cart],
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      addToCart,
      incrementItem,
      decrementItem,
      removeItem,
      setLinePriceType,
      setLineSellingUnit,
      clearCart,
      cartTotal,
      cartCount,
      checkoutStage,
      setCheckoutStage,
      appReady,
      setAppReady,
    }),
    [
      cart,
      addToCart,
      incrementItem,
      decrementItem,
      removeItem,
      setLinePriceType,
      setLineSellingUnit,
      clearCart,
      cartTotal,
      cartCount,
      checkoutStage,
      appReady,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function useCartContext(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a KioskProvider");
  }
  return context;
}

export function useCart() {
  return useCartContext();
}