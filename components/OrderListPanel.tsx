"use client";

import { useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useMounted } from "@/hooks/useMounted";
import { formatCurrency } from "@/lib/formatCurrency";


const KEYPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];

const SCROLL_HIDDEN =
  "touch-pan-y overscroll-contain [-webkit-overflow-scrolling:touch] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export function OrderListPanel() {
  const mounted = useMounted();
  const pathname = usePathname();
  const router = useRouter();
  const {
    cart,
    cartTotal,
    cartCount,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
    checkoutStage: stage,
    setCheckoutStage: setStage,
    appReady,
  } = useCart();
  
  const [amountInput, setAmountInput] = useState("");
  const [changeDue, setChangeDue] = useState(0);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [sheetTranslate, setSheetTranslate] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  if (!mounted || pathname.startsWith("/admin") || !appReady) {
    return null;
  }

  const amountEntered = parseFloat(amountInput || "0");
  const isSufficient = amountEntered >= cartTotal && cartTotal > 0;

  const handleKeyPress = (key: string) => {
    if (key === "⌫") {
      setAmountInput((prev) => prev.slice(0, -1));
      return;
    }
    if (key === "." && amountInput.includes(".")) return;
    if (amountInput.length >= 10) return;
    setAmountInput((prev) => prev + key);
  };

  const handleStartPayment = () => {
    setAmountInput("");
    setStage("payment");
    setMobileExpanded(true);
  };

  const handleConfirmPayment = () => {
    if (!isSufficient) return;
    setChangeDue(amountEntered - cartTotal);
    setStage("change");
    setMobileExpanded(true);
  };

  const handleNewOrder = () => {
    clearCart();
    setAmountInput("");
    setChangeDue(0);
    setStage("cart");
    setMobileExpanded(false);
  };

  // Swipe gesture handlers for mobile sheet
  const handleTouchStartSheet = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMoveSheet = (e: React.TouchEvent) => {
    if (!sheetRef.current) return;
    const touchCurrentY = e.touches[0].clientY;
    const diff = touchStartY - touchCurrentY;
    
    // Only allow dragging upwards when sheet is collapsed
    if (!mobileExpanded && diff > 0 && diff < 400) {
      setSheetTranslate(-diff);
    }
    // Allow dragging downwards when sheet is expanded to close it
    else if (mobileExpanded && diff < 0 && diff > -100) {
      setSheetTranslate(diff);
    }
  };

  const handleTouchEndSheet = () => {
    // If dragged up more than 15% of viewport, expand it
    if (sheetTranslate < -60) {
      setMobileExpanded(true);
    }
    // If dragged down more than 10% when expanded, collapse it
    else if (mobileExpanded && sheetTranslate > 30) {
      setMobileExpanded(false);
    }
    setSheetTranslate(0);
  };

  const handleBackClick = () => {
    if (stage !== "cart") {
      setStage("cart");
      setAmountInput("");
    } else if (mobileExpanded) {
      setMobileExpanded(false);
    } else {
      // Only navigate away if on desktop and no active order
      if (cartCount === 0) {
        router.back();
      }
    }
  };

  const renderPanel = (onClose?: () => void) => (
    <>
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white/95 backdrop-blur border-b-2 border-kiosk-muted px-6 py-5">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Order Details</h2>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-2">
            {stage === "cart"
              ? `${cartCount} ${cartCount === 1 ? "item" : "items"}`
              : stage === "payment"
              ? "Enter cash received"
              : "Payment complete"}
          </p>
        </div>
        {(onClose || stage !== "cart") && (
          <button
            type="button"
            onClick={() => (stage !== "cart" ? setStage("cart") : onClose?.())}
            aria-label={stage !== "cart" ? "Back to cart" : "Close order"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-kiosk-primary hover:bg-kiosk-light smooth-transition tap-scale"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {stage !== "cart" ? (
                <path d="M15 19l-7-7 7-7" />
              ) : (
                <path d="M6 9l6 6 6-6" />
              )}
            </svg>
          </button>
        )}
      </div>

      {stage === "cart" && (
        <>
          <ul className={`flex-1 min-h-0 divide-y divide-kiosk-muted overflow-y-auto px-6 py-4 ${SCROLL_HIDDEN}`}>
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-100 text-center">
                <img src="/pochaco-removebg-preview.png" alt="" className="h-20 w-20" />
                <p className="text-gray-700 font-semibold text-lg mb-1">No items ordered yet</p>
                <p className="text-sm text-gray-500">Add items to get started</p>
              </div>
            ) : (
              cart.map((item) => (
                <li
                  key={item.variantId}
                  className="py-4 first:pt-0"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate text-sm">{item.productName}</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">{item.variantLabel}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.variantId)}
                      aria-label={`Remove ${item.productName} ${item.variantLabel}`}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 active:scale-90 smooth-transition tap-scale"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-base font-bold text-foreground">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    <div className="flex items-center gap-2 bg-kiosk-lighter rounded-[12px] p-1">
                      <button
                        type="button"
                        onClick={() => decrementItem(item.variantId)}
                        aria-label={`Decrease quantity of ${item.productName}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-kiosk-primary hover:bg-kiosk-light active:scale-90 smooth-transition tap-scale"
                      >
                        −
                      </button>
                      <span className="w-5 text-center font-bold text-gray-900 text-xs">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => incrementItem(item.variantId)}
                        aria-label={`Increase quantity of ${item.productName}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-kiosk-primary hover:bg-kiosk-light active:scale-90 smooth-transition tap-scale"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>

          <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent border-t-2 border-kiosk-muted px-6 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Subtotal</span>
              <span className="text-lg font-bold text-foreground">
                {formatCurrency(cartTotal)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleStartPayment}
              disabled={cartCount === 0}
              className="w-full flex items-center justify-center gap-3 rounded-[14px] bg-kiosk-primary py-4 px-6 text-lg font-bold text-white card-shadow-lg disabled:opacity-50 disabled:cursor-not-allowed smooth-transition tap-scale min-h-14 touch-manipulation hover:brightness-110"
            >
              {cartCount === 0 ? "Add Items" : `Charge ${formatCurrency(cartTotal)}`}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </>
      )}

      {stage === "payment" && (
        <div className="flex flex-1 flex-col overflow-y-auto px-6 py-4">
          <div className="mb-4 rounded-[14px] bg-kiosk-lighter p-4 text-center card-shadow">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Amount Due</p>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(cartTotal)}</p>
          </div>

          <div className="mb-4 rounded-[14px] border-2 border-dashed border-kiosk-muted bg-white p-4 text-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cash Received</p>
            <p className="text-3xl font-bold text-gray-900 min-h-[2.5rem]">
              {amountInput ? formatCurrency(amountEntered) : "₱0"}
            </p>
          </div>

          {amountInput && !isSufficient && (
            <p className="mb-4 text-center text-sm font-semibold text-red-600 bg-red-50 rounded-[12px] py-2 px-3">
              Insufficient — needs {formatCurrency(cartTotal - amountEntered)} more
            </p>
          )}

          <div className="grid grid-cols-3 gap-2 mb-6">
            {KEYPAD_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleKeyPress(key)}
                className="rounded-[12px] bg-white border border-kiosk-muted py-3 text-lg font-bold text-kiosk-primary card-shadow hover:bg-kiosk-light smooth-transition tap-scale touch-manipulation"
              >
                {key}
              </button>
            ))}
          </div>

          <div className="mt-auto flex gap-3">
            <button
              type="button"
              onClick={() => setStage("cart")}
              className="flex-1 rounded-[14px] bg-kiosk-muted py-4 text-lg font-bold text-kiosk-primary smooth-transition tap-scale hover:bg-kiosk-light"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmPayment}
              disabled={!isSufficient}
              className="flex-1 rounded-[14px] bg-kiosk-primary py-4 text-lg font-bold text-white card-shadow-lg disabled:opacity-50 disabled:cursor-not-allowed smooth-transition tap-scale hover:brightness-110"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {stage === "change" && (
        <div className="flex flex-1 min-h-0 flex-col px-6 py-6">
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 pb-3 border-b-2 border-dashed border-kiosk-muted text-xs font-bold uppercase tracking-wide text-gray-600 mb-2">
              <span>Qty</span>
              <span>Item</span>
              <span className="text-right">Price</span>
            </div>

            <ul className={`flex-1 min-h-0 overflow-y-auto divide-y divide-dashed divide-kiosk-muted ${SCROLL_HIDDEN}`}>
              {cart.map((item) => (
                <li key={item.variantId} className="grid grid-cols-[auto_1fr_auto] gap-x-3 py-2.5">
                  <span className="text-sm font-bold text-gray-900 pt-0.5">{item.quantity}x</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.productName}</p>
                    <p className="text-xs text-gray-500">{item.variantLabel}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 text-right">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="my-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {cartCount} {cartCount === 1 ? "item" : "items"} Sold
          </p>

          <div className="border-t-2 border-dashed border-kiosk-muted pt-4 space-y-3">
            <div className="flex items-center justify-between py-2">
              <p className="text-sm font-semibold text-gray-600">Total</p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(cartTotal)}</p>
            </div>

            <div className="border-t border-kiosk-muted" />

            <div className="flex items-center justify-between py-2">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Cash</p>
              <p className="text-base font-bold text-gray-900">{formatCurrency(amountEntered)}</p>
            </div>

            <div className="border-t-2 border-dashed border-kiosk-muted my-3" />

            <div className="flex items-center justify-between py-3 rounded-[14px] bg-green-50 px-4">
              <p className="text-sm font-bold text-gray-700">Change</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(changeDue)}</p>
            </div>

            <button
              type="button"
              onClick={handleNewOrder}
              className="w-full rounded-[14px] bg-kiosk-primary py-4 px-6 text-lg font-bold text-white card-shadow-lg smooth-transition tap-scale min-h-14 touch-manipulation mt-4 hover:brightness-110"
            >
              Start Next Order
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop / iPad landscape — always-visible fixed sidebar */}
      <aside
        aria-label="Order list"
        className="hidden lg:flex fixed bottom-0 right-0 top-0 z-50 w-96 flex-col bg-gradient-to-b from-white to-kiosk-lighter card-shadow-xl border-l-2 border-kiosk-muted overscroll-contain"
      >
        {renderPanel()}
      </aside>

      {/* Mobile / portrait — collapsed bottom bar */}
      {stage === "cart" && !mobileExpanded && (
        <button
          type="button"
          onClick={() => setMobileExpanded(true)}
          onTouchStart={handleTouchStartSheet}
          onTouchMove={handleTouchMoveSheet}
          onTouchEnd={handleTouchEndSheet}
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between bg-kiosk-primary px-5 py-4 text-white shadow-2xl touch-manipulation"
          style={{ transform: `translateY(${Math.max(0, sheetTranslate)}px)` }}
        >
          <span className="absolute left-1/2 top-1.5 h-1 w-10 -translate-x-1/2 rounded-full bg-white/40" />
          <span className="text-sm font-semibold">
            {cartCount} {cartCount === 1 ? "item" : "items"}
          </span>
          <span className="text-base font-bold">
            {cartCount === 0 ? "View Order" : `${formatCurrency(cartTotal)} — View Order`}
          </span>
        </button>
      )}

      {/* Mobile / portrait — expanded full sheet (cart when opened, always during payment/change) */}
      <div
        ref={sheetRef}
        className={`lg:hidden fixed inset-0 z-[60] flex flex-col bg-gradient-to-b from-white to-kiosk-lighter transition-all duration-300 ease-out ${
          mobileExpanded || stage !== "cart" ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-full opacity-0 pointer-events-none"
        }`}
        onTouchStart={handleTouchStartSheet}
        onTouchMove={handleTouchMoveSheet}
        onTouchEnd={handleTouchEndSheet}
      >
        {renderPanel(() => setMobileExpanded(false))}
      </div>
    </>
  );
}
