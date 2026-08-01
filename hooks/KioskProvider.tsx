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
import type { CartItem, Variant } from "@/types";

export type CheckoutStage = "cart" | "payment" | "change";

type CartContextValue = {
  cart: CartItem[];
  addToCart: (variant: Variant, productName: string) => boolean;
  incrementItem: (variantId: string) => void;
  decrementItem: (variantId: string) => void;
  removeItem: (variantId: string) => void;
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
            price: variant.price,
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

  const clearCart = useCallback(() => {
    let snapshot: CartItem[] = [];
    setCart((prev) => {
      snapshot = prev;
      return [];
    });
    return snapshot;
  }, []);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
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
  const {
    cart,
    addToCart,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
    cartTotal,
    cartCount,
    checkoutStage,
    setCheckoutStage,
    appReady,
    setAppReady,
  } = useCartContext();

  return {
    cart,
    addToCart,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
    cartTotal,
    cartCount,
    checkoutStage,
    setCheckoutStage,
    appReady,
    setAppReady,
  };
}