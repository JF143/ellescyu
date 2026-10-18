"use client";

import { KioskProvider } from "@/hooks/KioskProvider";
import { ToastProvider } from "@/components/Toast";
import { CashierSessionProvider } from "@/hooks/useCashierSession";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CashierSessionProvider>
      <ToastProvider>
        <KioskProvider>{children}</KioskProvider>
      </ToastProvider>
    </CashierSessionProvider>
  );
}
