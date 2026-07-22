"use client";

import { useMemo, useState, useRef } from "react";
import { useMounted } from "@/hooks/useMounted";
import { useClock } from "@/hooks/useClocks";
import { VariantCard } from "@/components/VariantCard";
import { BrandRibbon } from "@/components/BrandRibbon";
import { useSections } from "@/hooks/useSections";
import { useProducts } from "@/hooks/useProducts";
import { useVariants } from "@/hooks/useVariants";
import { useBrands } from "@/hooks/useBrands";
import { useCart } from "@/hooks/useCart";
import { getBrand } from "@/lib/getBrand";
import Link from "next/link";
import type { Section } from "@/types";

export default function HomePage() {
  const mounted = useMounted();
  const now = useClock();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  const {
    sections,
    isLoading: sectionsLoading,
    error: sectionsError,
  } = useSections();
  const { products, isLoading: productsLoading, error: productsError } = useProducts();
  const { variants, isLoading: variantsLoading, error: variantsError } = useVariants();
  const { brands, isLoading: brandsLoading, error: brandsError } = useBrands();

  const isLoading = sectionsLoading || productsLoading || variantsLoading || brandsLoading;
  const error = sectionsError || productsError || variantsError || brandsError;

  const filteredSections = sections
    .filter((section) => section.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const selectedSection = sections.find((s) => s.id === selectedSectionId) ?? null;

  const allItems = useMemo(() => {
    return products.flatMap((product) =>
      variants
        .filter((v) => v.product_id === product.id)
        .map((variant) => ({ product, variant }))
    );
  }, [products, variants]);

  const categoryItems = useMemo(() => {
    if (!selectedSectionId) return allItems;
    return allItems.filter((item) => item.product.section_id === selectedSectionId);
  }, [allItems, selectedSectionId]);

  const brandsInScope = useMemo(() => {
    const set = new Set(categoryItems.map((item) => getBrand(item.product, brands)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [categoryItems, brands]);

  const visibleItems = useMemo(() => {
    let filtered = selectedBrand
      ? categoryItems.filter((item) => getBrand(item.product, brands) === selectedBrand)
      : categoryItems;

    if (productSearchQuery.trim()) {
      const query = productSearchQuery.toLowerCase();
      filtered = filtered.filter((item) => item.product.name.toLowerCase().includes(query));
    }

    return [...filtered].sort((a, b) => a.product.name.localeCompare(b.product.name));
  }, [categoryItems, selectedBrand, brands, productSearchQuery]);

  const handleSelectSection = (sectionId: string | null) => {
    setSelectedSectionId(sectionId);
    setSelectedBrand(null);
    setMobileCategoriesOpen(false);
  };

  // Swipe gesture handlers for mobile drawer
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touchCurrentX = e.touches[0].clientX;
    const diff = touchCurrentX - touchStartX;
    
    // Open drawer if swiped right more than 50px from left edge
    if (diff > 50 && touchStartX < 30 && !mobileCategoriesOpen) {
      setMobileCategoriesOpen(true);
    }
  };

  const renderCategoryButtons = () => (
    <>
      <button
        type="button"
        onClick={() => handleSelectSection(null)}
        className={`w-full flex items-center gap-3 rounded-[14px] px-4 py-3 text-sm font-semibold smooth-transition tap-scale ${
          selectedSectionId === null
            ? "bg-kiosk-primary text-white card-shadow"
            : "text-gray-700 hover:bg-kiosk-light hover:text-kiosk-primary"
        }`}
      >
        <span className="text-lg flex-shrink-0">🗂️</span>
        <span className="truncate">All Categories</span>
      </button>

      {filteredSections.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => handleSelectSection(section.id)}
          className={`w-full flex items-center gap-3 rounded-[14px] px-4 py-3 text-sm font-semibold smooth-transition tap-scale ${
            selectedSectionId === section.id
              ? "bg-kiosk-primary text-white card-shadow"
              : "text-gray-700 hover:bg-kiosk-light hover:text-kiosk-primary"
          }`}
        >
          <span className="text-lg flex-shrink-0">{section.icon ?? "📦"}</span>
          <span className="truncate">{section.name}</span>
        </button>
      ))}
      {filteredSections.length === 0 && searchQuery && (
        <p className="px-4 py-8 text-center text-sm text-gray-500">No categories found</p>
      )}
    </>
  );

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kiosk-lighter">
        <p className="text-2xl font-semibold text-kiosk-primary">Loading menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kiosk-lighter">
        <p className="text-2xl font-semibold text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-kiosk-lighter to-kiosk-light">
      {/* Mobile / portrait top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-white border-b border-kiosk-muted px-4 py-3">
        <button
          type="button"
          onClick={() => setMobileCategoriesOpen(true)}
          aria-label="Open categories"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-kiosk-primary hover:bg-kiosk-muted transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <p className="text-sm font-bold text-kiosk-primary truncate px-2">
          {selectedSection ? `${selectedSection.icon ?? "📦"} ${selectedSection.name}` : "Ellescyu's Kiosk"}
        </p>
        <button
          type="button"
          onClick={() => setMobileSearchOpen((prev) => !prev)}
          aria-label="Toggle search"
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
            mobileSearchOpen ? "bg-kiosk-light text-kiosk-primary" : "text-kiosk-primary hover:bg-kiosk-muted"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>

      {/* Mobile / portrait categories drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 flex transition-all duration-300 ease-out ${
          mobileCategoriesOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {/* Backdrop overlay */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            mobileCategoriesOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileCategoriesOpen(false)}
        />
        
        {/* Drawer panel */}
        <div
          className={`w-72 max-w-[80%] overflow-y-auto bg-white shadow-2xl transition-all duration-300 ease-out ${
            mobileCategoriesOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
            <div className="sticky top-0 bg-white z-10 p-4 border-b border-kiosk-muted">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-kiosk-primary">Categories</h2>
                <div className="flex items-center gap-1">
                  <Link
                    href="/admin"
                    aria-label="Admin settings"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-kiosk-primary hover:bg-kiosk-muted transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileCategoriesOpen(false)}
                    aria-label="Close categories"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-kiosk-primary hover:bg-kiosk-muted transition"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kiosk-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-[12px] border border-kiosk-muted bg-white text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-kiosk-primary focus:border-transparent smooth-transition card-shadow"
              />
              </div>
            </div>
            <div className="p-3 space-y-1">{renderCategoryButtons()}</div>
        </div>
      </div>

      {/* Desktop / iPad landscape sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 z-40 w-64 overflow-y-auto bg-white shadow-xl border-r border-kiosk-muted touch-pan-y overscroll-contain [-webkit-overflow-scrolling:touch] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="sticky top-0 bg-white z-10 p-4 border-b border-kiosk-muted">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-kiosk-primary">Categories</h2>
            <Link
              href="/admin"
              aria-label="Admin settings"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-kiosk-primary hover:bg-kiosk-muted transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </Link>
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kiosk-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-kiosk-muted bg-kiosk-lighter text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-kiosk-primary focus:border-transparent transition"
            />
          </div>
        </div>
        <div className="p-3 space-y-1">{renderCategoryButtons()}</div>
      </aside>

      <main
        ref={mainRef}
        className="pt-16 lg:pt-0 pb-24 lg:pb-0 lg:ml-72 lg:mr-96 flex-1 h-screen overflow-y-auto overflow-x-hidden touch-pan-y overscroll-contain [-webkit-overflow-scrolling:touch] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <div className="px-4 py-6 lg:px-8 lg:py-12">
          <header className="mb-6 hidden lg:flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-kiosk-accent uppercase tracking-wide mb-2">
                {selectedSection ? "Now Browsing" : "Welcome"}
              </p>
              <h1 className="text-6xl font-bold text-kiosk-primary mb-3">
                {selectedSection ? `${selectedSection.icon ?? "📦"} ${selectedSection.name}` : "Ellescyu's Kiosk"}
              </h1>
              <p className="text-lg text-gray-600">
                {selectedSection
                  ? `Browsing ${selectedSection.name} — tap an item to add it to your order`
                  : "Browse through the products and build the customer's order"}
              </p>
            </div>
            {now && (
              <div className="text-right shrink-0">
                <p className="text-3xl font-bold text-kiosk-primary tabular-nums">
                  {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="text-sm text-gray-500">
                  {now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
                </p>
              </div>
            )}
          </header>

          <div className={`relative mb-6 ${mobileSearchOpen ? "block" : "hidden"} lg:block`}>
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-kiosk-primary pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={productSearchQuery}
              onChange={(e) => setProductSearchQuery(e.target.value)}
              autoFocus={mobileSearchOpen}
              className="w-full rounded-full border-2 border-kiosk-primary bg-white pl-12 pr-4 py-3 text-base text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-kiosk-primary focus:border-kiosk-primary smooth-transition"
            />
          </div>

          <BrandRibbon
            brands={brandsInScope}
            selectedBrand={selectedBrand}
            onSelectBrand={setSelectedBrand}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-8 lg:grid-cols-3">
            {visibleItems.map(({ product, variant }) => (
              <VariantCard
                key={variant.id}
                productName={product.name}
                variant={variant}
                onAdd={() => addToCart(variant, product.name)}
              />
            ))}
          </div>

          {visibleItems.length === 0 && (
            <div className="mt-16 flex flex-col items-center justify-center text-center">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg font-semibold text-gray-700 mb-2">
                {productSearchQuery.trim()
                  ? `No products match "${productSearchQuery}"`
                  : selectedBrand
                  ? `No products for ${selectedBrand}`
                  : sections.length === 0
                  ? "No categories yet"
                  : "No products available"}
              </p>
              <p className="text-sm text-gray-500 max-w-md">
                {productSearchQuery.trim()
                  ? "Try adjusting your search or browse by category"
                  : selectedBrand
                  ? `${selectedSection ? `Browse other brands in ${selectedSection.name}` : "Try selecting all brands"}`
                  : sections.length === 0
                  ? "Visit Admin settings to add categories and products"
                  : "Add products in Admin settings to get started"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
