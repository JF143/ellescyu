"use client";

import type { ReactNode } from "react";

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function Drawer({ isOpen, onClose, title, subtitle, children, footer }: DrawerProps) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-[#263143]/40 backdrop-blur-sm z-[70] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[560px] bg-white z-[80] shadow-2xl flex flex-col transform transition-transform duration-500 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6 lg:p-8 border-b border-[#c2c6d6]/40 flex items-start justify-between bg-[#f0f3ff]/50 shrink-0">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-[#111c2d]">{title}</h2>
            {subtitle && <p className="text-sm text-[#424754] mt-1">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#3b82f6] hover:bg-[#e7eeff] transition"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">{children}</div>

        {footer && (
          <div className="p-6 lg:p-8 border-t border-[#c2c6d6]/40 bg-white flex items-center gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}