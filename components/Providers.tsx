"use client";

import { KioskProvider } from "@/hooks/KioskProvider";
import { ToastProvider } from "@/components/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <KioskProvider>
      <ToastProvider>{children}</ToastProvider>
    </KioskProvider>
  );
}
