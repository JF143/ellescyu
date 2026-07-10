"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { BackButton } from "@/components/BackButton";
import { VariantCard } from "@/components/VariantCard";
import { AddProductModal } from "@/components/AddProductModal";
import { EditVariantModal } from "@/components/EditVariantModal";
import { useToast } from "@/components/Toast";
import { useCart } from "@/hooks/useCart";
import { useMounted } from "@/hooks/useMounted";
import { useProducts } from "@/hooks/useProducts";
import { useSections } from "@/hooks/useSections";
import { useVariants } from "@/hooks/useVariants";
import type { Variant } from "@/types";

export default function SectionPage() {
  const mounted = useMounted();
  const params = useParams<{ id: string }>();
  const sectionId = params.id;
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [variantSearchQuery, setVariantSearchQuery] = useState("");

  const { sections, isLoading: sectionsLoading, error: sectionsError, updateSection } = useSections();
  const { products, isLoading: productsLoading, error: productsError, fetchProducts } = useProducts();
  const { variants, isLoading: variantsLoading, error: variantsError, fetchVariants } = useVariants();
  const { addToCart } = useCart();

  const isLoading = sectionsLoading || productsLoading || variantsLoading;
  const error = sectionsError || productsError || variantsError;

  const section = sections.find((item) => item.id === sectionId);

  const variantCards = useMemo(() => {
    const sectionProducts = products.filter((product) => product.section_id === sectionId);

    const allCards = sectionProducts.flatMap((product) =>
      variants
        .filter((variant) => variant.product_id === product.id)
        .map((variant) => ({
          key: variant.id,
          productName: product.name,
          variant,
        })),
    );

    if (!variantSearchQuery.trim()) return allCards;

    return allCards.filter(
      (card) =>
        card.productName.toLowerCase().includes(variantSearchQuery.toLowerCase()) ||
        card.variant.label.toLowerCase().includes(variantSearchQuery.toLowerCase()),
    );
  }, [products, variants, sectionId, variantSearchQuery]);

  const handleAddToCart = (variant: Variant, productName: string) => {
    addToCart(variant, productName);
    showToast(`${productName} - ${variant.label} added to order list`);
  };

  const handleStartEdit = () => {
    setEditedName(section?.name || "");
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (section && editedName.trim()) {
      updateSection(section.id, { name: editedName.trim() });
      showToast("Category name updated");
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName("");
  };

  const handleAddProductSuccess = async () => {
    await Promise.all([fetchProducts(), fetchVariants()]);
    showToast("Item added successfully");
  };

  const handleEditVariantSuccess = async () => {
    await fetchVariants();
    showToast("Variant updated successfully");
    setEditingVariant(null);
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kiosk-lighter">
        <p className="text-2xl font-semibold text-kiosk-primary">Loading items...</p>
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

  if (!section) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-kiosk-lighter">
        <p className="text-2xl font-semibold text-gray-700">Section not found.</p>
        <BackButton />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-kiosk-lighter to-kiosk-light">
      {/* Left Sidebar - Categories */}
      <aside className="fixed left-0 top-0 bottom-0 z-40 w-72 overflow-y-auto bg-white shadow-xl border-r border-kiosk-muted">
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-kiosk-muted space-y-4">
          <h2 className="text-2xl font-bold text-kiosk-primary">Categories</h2>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-kiosk-muted pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-kiosk-muted bg-kiosk-lighter text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-kiosk-primary focus:border-transparent transition"
            />
          </div>
        </div>
        <div className="p-4 space-y-1">
          {sections
            .filter((cat) => cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((cat) => (
              <Link
                key={cat.id}
                href={cat.id === sectionId ? "#" : `/section/${cat.id}`}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  cat.id === sectionId
                    ? "bg-kiosk-primary text-white"
                    : "text-gray-700 hover:bg-kiosk-lighter hover:text-kiosk-primary active:bg-kiosk-light"
                }`}
              >
                <span className="text-2xl">{cat.icon ?? "📦"}</span>
                <span className="truncate">{cat.name}</span>
              </Link>
            ))}
        </div>
      </aside>

      <button
        type="button"
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-6 left-80 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-kiosk-primary to-kiosk-accent px-6 py-3 text-lg font-bold text-white shadow-xl hover:shadow-2xl transition active:scale-[0.98]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Item
      </button>

      <main className="ml-72 pr-[28%] flex-1 px-8 py-12">
        <div className="mb-10 flex flex-wrap items-center gap-6">
          <BackButton />
          <div className="flex items-center gap-3">
            <div>
              <p className="text-lg font-medium text-kiosk-accent">Category</p>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit();
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                    className="text-4xl font-bold text-kiosk-primary bg-transparent border-b-2 border-kiosk-primary focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white text-xl font-bold hover:bg-green-600"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white text-xl font-bold hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-4xl font-bold text-kiosk-primary">
                    {section.icon ? `${section.icon} ` : ""}
                    {section.name}
                  </h1>
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    aria-label="Edit category name"
                    className="flex h-11 w-11 items-center justify-center rounded-lg bg-kiosk-muted text-kiosk-primary hover:bg-kiosk-accent hover:text-white active:scale-95 transition touch-manipulation"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      <path d="m15 5 4 4" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-kiosk-muted pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search items..."
              value={variantSearchQuery}
              onChange={(e) => setVariantSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-kiosk-muted bg-white text-gray-900 placeholder-gray-500 text-lg focus:outline-none focus:ring-2 focus:ring-kiosk-primary focus:border-transparent transition touch-manipulation"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {variantCards.map(({ key, productName, variant }) => (
            <VariantCard
              key={key}
              productName={productName}
              variant={variant}
              onAdd={() => handleAddToCart(variant, productName)}
              onEdit={() => setEditingVariant(variant)}
            />
          ))}
        </div>

        {variantCards.length === 0 ? (
          <p className="mt-12 text-center text-xl text-gray-500">
            No items in this section yet.
          </p>
        ) : null}
      </main>

      <AddProductModal
        sectionId={sectionId}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddProductSuccess}
      />

      {editingVariant && (
        <EditVariantModal
          variant={editingVariant}
          isOpen={!!editingVariant}
          onClose={() => setEditingVariant(null)}
          onSuccess={handleEditVariantSuccess}
        />
      )}
    </div>
  );
}
