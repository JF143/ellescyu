"use client";

import { usePathname } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useMounted } from "@/hooks/useMounted";
import { formatCurrency } from "@/lib/formatCurrency";

export function OrderListPanel() {
  const mounted = useMounted();
  const pathname = usePathname();
  const {
    cart,
    cartTotal,
    cartCount,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
  } = useCart();

  if (!mounted || pathname.startsWith("/admin")) {
    return null;
  }

  const handleTotal = () => {
    clearCart();
  };

  return (
    <aside
      aria-label="Order list"
      className="fixed bottom-0 right-0 top-0 z-50 flex w-[25%] min-w-[300px] flex-col bg-white shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-kiosk-muted bg-kiosk-lighter px-4 py-4">
        <h2 className="text-2xl font-bold text-kiosk-primary">Order List</h2>
        <span className="rounded-full bg-kiosk-primary px-3 py-1 text-sm font-bold text-white">
          {cartCount}
        </span>
      </div>

      <ul className="flex-1 space-y-3 overflow-y-auto p-4">
        {cart.map((item) => (
          <li
            key={item.variantId}
            className="rounded-xl border border-kiosk-muted bg-kiosk-lighter p-3 text-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-bold text-gray-900">{item.productName}</p>
                <p className="text-xs text-kiosk-primary">{item.variantLabel}</p>
                <p className="mt-1 font-semibold text-kiosk-accent">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.variantId)}
                aria-label={`Remove ${item.productName} ${item.variantLabel}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-lg font-bold text-red-500 shadow-sm transition hover:bg-red-50 active:scale-95"
              >
                ×
              </button>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => decrementItem(item.variantId)}
                aria-label={`Decrease quantity of ${item.productName}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-kiosk-muted text-xl font-bold text-kiosk-primary transition hover:bg-kiosk-accent hover:text-white active:scale-95"
              >
                −
              </button>
              <span className="min-w-6 text-center font-bold text-gray-900">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => incrementItem(item.variantId)}
                aria-label={`Increase quantity of ${item.productName}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-kiosk-muted text-xl font-bold text-kiosk-primary transition hover:bg-kiosk-accent hover:text-white active:scale-95"
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="border-t border-kiosk-muted bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-700">Total</span>
          <span className="text-2xl font-bold text-kiosk-primary">
            {formatCurrency(cartTotal)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleTotal}
          className="w-full rounded-xl bg-kiosk-primary py-3 text-lg font-bold text-white shadow-lg transition hover:bg-kiosk-accent active:scale-[0.98]"
        >
          Total
        </button>
      </div>
    </aside>
  );
}
