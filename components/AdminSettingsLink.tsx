import Link from "next/link";

export function AdminSettingsLink() {
  return (
    <Link
      href="/admin"
      aria-label="Admin settings"
      className="fixed right-6 top-6 z-20 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-2xl text-kiosk-primary shadow-md backdrop-blur transition hover:bg-kiosk-light hover:shadow-lg active:scale-95"
    >
      ⚙️
    </Link>
  );
}
