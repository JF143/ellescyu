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
      className="fixed bottom-0 right-0 top-0 z-50 flex w-[25%] min-w-[320px] flex-col bg-gradient-to-b from-white to-kiosk-lighter shadow-2xl border-l border-kiosk-muted"
    >
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-kiosk-muted px-6 py-5">
        <h2 className="text-2xl font-bold text-kiosk-primary">Order Details</h2>
        <p className="text-sm text-gray-600 mt-1">{cartCount} {cartCount === 1 ? 'item' : 'items'}</p>
      </div>

      <ul className="flex-1 space-y-3 overflow-y-auto px-6 py-6">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-4xl mb-2">📝</p>
            <p className="text-gray-600 font-medium">No items ordered yet</p>
            <p className="text-sm text-gray-500 mt-1">Add items to get started</p>
          </div>
        ) : (
          cart.map((item) => (
            <li
              key={item.variantId}
              className="rounded-xl bg-white/80 backdrop-blur border border-kiosk-muted p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{item.productName}</p>
                  <p className="text-xs text-kiosk-accent font-medium">{item.variantLabel}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.variantId)}
                  aria-label={`Remove ${item.productName} ${item.variantLabel}`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-500 hover:bg-red-100 active:scale-95 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-kiosk-primary">
                  {formatCurrency(item.price * item.quantity)}
                </p>
                <div className="flex items-center gap-1 bg-kiosk-lighter rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => decrementItem(item.variantId)}
                    aria-label={`Decrease quantity of ${item.productName}`}
                    className="flex h-7 w-7 items-center justify-center rounded bg-white text-kiosk-primary hover:bg-kiosk-light active:scale-95 transition"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-bold text-gray-900 text-sm">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => incrementItem(item.variantId)}
                    aria-label={`Increase quantity of ${item.productName}`}
                    className="flex h-7 w-7 items-center justify-center rounded bg-white text-kiosk-primary hover:bg-kiosk-light active:scale-95 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>

      <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent border-t border-kiosk-muted px-6 py-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Subtotal</span>
            <span className="text-xl font-bold text-kiosk-primary">
              {formatCurrency(cartTotal)}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleTotal}
          disabled={cartCount === 0}
          className="w-full rounded-xl bg-gradient-to-r from-kiosk-primary to-kiosk-accent py-4 px-6 text-lg font-bold text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-[0.98] min-h-14 touch-manipulation"
        >
          {cartCount === 0 ? "Add Items" : `Charge ${formatCurrency(cartTotal)}`}
        </button>
      </div>
    </aside>
  );
}
