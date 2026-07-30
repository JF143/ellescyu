import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import { OrderListPanel } from "@/components/OrderListPanel";
import { Providers } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ellescyu Kiosk",
  description: "Self-service ordering kiosk POS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-kiosk-lighter text-gray-900">
        <Providers>
          {children}
          <OrderListPanel />
        </Providers>
      </body>
    </html>
  );
}