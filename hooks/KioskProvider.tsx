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

type CartContextValue = {
  cart: CartItem[];
  addToCart: (variant: Variant, productName: string) => void;
  incrementItem: (variantId: string) => void;
  decrementItem: (variantId: string) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => CartItem[];
  cartTotal: number;
  cartCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function KioskProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(storageGet(STORAGE_KEYS.cart, []));
  }, []);

  useEffect(() => {
    storageSet(STORAGE_KEYS.cart, cart);
  }, [cart]);

  const addToCart = useCallback((variant: Variant, productName: string) => {
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
  }, []);

  const incrementItem = useCallback((variantId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.variantId === variantId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }, []);

  const decrementItem = useCallback((variantId: string) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.variantId === variantId ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setCart((prev) => prev.filter((item) => item.variantId !== variantId));
  }, []);

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
    }),
    [cart, addToCart, incrementItem, decrementItem, removeItem, clearCart, cartTotal, cartCount],
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
  };
}
