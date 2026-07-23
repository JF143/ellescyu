"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useSections } from "@/hooks/useSections";
import { useVariants } from "@/hooks/useVariants";
import { useBrands } from "@/hooks/useBrands";
import { useToast } from "@/components/Toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { uploadProductImage } from "@/lib/uploadImage";
import { formatCurrency } from "@/lib/formatCurrency";

type PendingDelete =
  | { type: "brand"; id: string; name: string }
  | { type: "section"; id: string; name: string }
  | { type: "product"; id: string; name: string }
  | { type: "variant"; id: string; name: string };

export default function AdminPage() {
  const { sections, addSection, updateSection, deleteSection } = useSections();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { variants, addVariant, updateVariant, deleteVariant } = useVariants();
  const { brands, addBrand, updateBrand, deleteBrand } = useBrands();
  const { showToast } = useToast();

  const [newBrandName, setNewBrandName] = useState("");
  const [productBrandId, setProductBrandId] = useState("");

  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionIcon, setNewSectionIcon] = useState("");

  const [productSectionId, setProductSectionId] = useState("");
  const [productName, setProductName] = useState("");
  const [productVariantLabel, setProductVariantLabel] = useState("");
  const [productVariantPrice, setProductVariantPrice] = useState("");
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [existingSectionId, setExistingSectionId] = useState("");
  const [existingProductId, setExistingProductId] = useState("");
  const [existingVariantLabel, setExistingVariantLabel] = useState("");
  const [existingVariantPrice, setExistingVariantPrice] = useState("");
  const [existingVariantImageFile, setExistingVariantImageFile] = useState<File | null>(null);
  const [existingVariantImagePreview, setExistingVariantImagePreview] = useState<string | null>(null);
  const [isUploadingExistingImage, setIsUploadingExistingImage] = useState(false);

  const [manageSearchQuery, setManageSearchQuery] = useState("");
  const [manageCategoryFilter, setManageCategoryFilter] = useState("");
  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  const [categorySearchQuery, setCategorySearchQuery] = useState("");

  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const productsInSection = useMemo(
    () => products.filter((product) => product.section_id === existingSectionId),
    [products, existingSectionId],
  );

  const handleAddSection = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newSectionName.trim()) return;
    try {
      await addSection(newSectionName.trim(), newSectionIcon.trim() || undefined);
      setNewSectionName("");
      setNewSectionIcon("");
      showToast("Category added successfully");
    } catch (error) {
      const isDuplicate =
        typeof error === "object" && error !== null && "code" in error && error.code === "23505";
      showToast(isDuplicate ? "That category already exists" : "Failed to add category");
      console.error("Failed to add category:", error);
    }
  };

  const handleAddBrand = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newBrandName.trim()) return;
    try {
      await addBrand(newBrandName.trim());
      setNewBrandName("");
      showToast("Brand added successfully");
    } catch (error) {
      const isDuplicate =
        typeof error === "object" && error !== null && "code" in error && error.code === "23505";
      showToast(isDuplicate ? "That brand already exists" : "Failed to add brand");
      console.error("Failed to add brand:", error);
    }
  };

  const handleAddProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!productSectionId || !productName.trim() || !productVariantLabel.trim() || !productVariantPrice.trim())
      return;

    const price = Number(productVariantPrice);
    if (Number.isNaN(price) || price < 0) return;

    try {
      let imageUrl: string | undefined;
      if (productImageFile) {
        setIsUploadingImage(true);
        imageUrl = await uploadProductImage(productImageFile);
        setIsUploadingImage(false);
      }

      await addProduct(
        productSectionId,
        productName.trim(),
        [{ label: productVariantLabel.trim(), price, image_url: imageUrl }],
        productBrandId || undefined,
      );
      setProductName("");
      setProductVariantLabel("");
      setProductVariantPrice("");
      setProductBrandId("");
      setProductImageFile(null);
      setProductImagePreview(null);
      showToast("Product added successfully");
    } catch (error) {
      setIsUploadingImage(false);
      console.error("Failed to add product:", error);
      showToast("Failed to add product");
    }
  };

  const handleAddExistingVariant = async (event: React.FormEvent) => {
    event.preventDefault();
    const price = Number(existingVariantPrice);
    if (!existingProductId || !existingVariantLabel.trim() || Number.isNaN(price)) return;

    try {
      let imageUrl: string | undefined;
      if (existingVariantImageFile) {
        setIsUploadingExistingImage(true);
        imageUrl = await uploadProductImage(existingVariantImageFile);
        setIsUploadingExistingImage(false);
      }

      await addVariant(existingProductId, existingVariantLabel.trim(), price, imageUrl);
      setExistingVariantLabel("");
      setExistingVariantPrice("");
      setExistingVariantImageFile(null);
      setExistingVariantImagePreview(null);
      showToast("Variant added successfully");
    } catch (error) {
      setIsUploadingExistingImage(false);
      console.error("Failed to add variant:", error);
      showToast("Failed to add variant");
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      switch (pendingDelete.type) {
        case "brand":
          await deleteBrand(pendingDelete.id);
          showToast("Brand deleted");
          break;
        case "section":
          await deleteSection(pendingDelete.id);
          showToast("Category deleted");
          break;
        case "product":
          await deleteProduct(pendingDelete.id);
          showToast("Product deleted");
          break;
        case "variant":
          await deleteVariant(pendingDelete.id);
          showToast("Variant deleted");
          break;
      }
    } catch (error) {
      console.error(`Failed to delete ${pendingDelete.type}:`, error);
      showToast(`Failed to delete ${pendingDelete.type}`);
    } finally {
      setPendingDelete(null);
    }
  };

  const getDeleteMessage = () => {
    if (!pendingDelete) return "";
    switch (pendingDelete.type) {
      case "brand":
        return `Delete "${pendingDelete.name}"? Products using it will show as "Other".`;
      case "section":
        return `Delete "${pendingDelete.name}" and all its products?`;
      case "product":
        return `Delete "${pendingDelete.name}" and all its variants?`;
      case "variant":
        return `Delete "${pendingDelete.name}"?`;
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-kiosk-lighter">
      <header className="border-b-2 border-kiosk-muted bg-white px-4 py-4 lg:px-8 lg:py-6 shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold text-kiosk-primary">Admin</h1>
            <p className="mt-1 text-xs lg:text-sm font-medium text-gray-600 uppercase tracking-wide">Manage categories, products, and variants</p>
          </div>
          <Link
            href="/"
            className="rounded-[14px] lg:rounded-[16px] bg-kiosk-muted px-4 py-2.5 lg:px-6 lg:py-4 text-sm lg:text-lg font-bold text-kiosk-primary smooth-transition tap-scale hover:bg-kiosk-accent hover:text-white"
          >
            ← Back to Kiosk
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-6 lg:gap-8 lg:px-8 lg:py-10 lg:grid-cols-2">
        <section className="rounded-[18px] lg:rounded-[24px] bg-white p-4 lg:p-8 card-shadow">
          <h2 className="mb-4 lg:mb-6 text-lg lg:text-2xl font-bold text-kiosk-primary">Add New Category</h2>
          <form onSubmit={handleAddSection} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm lg:text-lg font-semibold text-gray-700">Category name</span>
              <input
                value={newSectionName}
                onChange={(event) => setNewSectionName(event.target.value)}
                className="w-full rounded-[12px] border-2 border-kiosk-muted px-3 py-2.5 text-base lg:px-4 lg:py-3 lg:text-lg outline-none focus:ring-2 focus:ring-kiosk-primary focus:border-transparent smooth-transition"
                placeholder="e.g. Snacks"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm lg:text-lg font-semibold text-gray-700">Icon (optional)</span>
              <input
                value={newSectionIcon}
                onChange={(event) => setNewSectionIcon(event.target.value)}
                className="w-full rounded-[12px] border-2 border-kiosk-muted px-3 py-2.5 text-base lg:px-4 lg:py-3 lg:text-lg outline-none focus:ring-2 focus:ring-kiosk-primary focus:border-transparent smooth-transition"
                placeholder="e.g. 🍿"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-[14px] bg-kiosk-primary py-4 text-lg font-bold text-white card-shadow smooth-transition tap-scale hover:shadow-[0_8px_24px_rgba(80,129,190,0.12)]"
            >
              Add Category
            </button>
          </form>
        </section>

        <section className="rounded-[18px] lg:rounded-[24px] bg-white p-4 lg:p-8 card-shadow">
          <h2 className="mb-4 lg:mb-6 text-lg lg:text-2xl font-bold text-kiosk-primary">Add New Product</h2>
          <p className="mb-4 -mt-2 text-xs text-gray-500">
            Each product starts with one variant + photo. Add more variants later from "Add Variant to Existing Product" below.
          </p>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm lg:text-lg font-semibold text-gray-700">Category</span>
              <select
                value={productSectionId}
                onChange={(event) => setProductSectionId(event.target.value)}
                className="w-full rounded-[12px] border-2 border-kiosk-muted px-3 py-2.5 text-base lg:px-4 lg:py-3 lg:text-lg outline-none focus:ring-2 focus:ring-kiosk-primary focus:border-transparent smooth-transition"
              >
                <option value="">Select category</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm lg:text-lg font-semibold text-gray-700">Product name</span>
              <input
                value={productName}
                onChange={(event) => setProductName(event.target.value)}
                className="w-full rounded-[12px] border-2 border-kiosk-muted px-3 py-2.5 text-base lg:px-4 lg:py-3 lg:text-lg outline-none focus:ring-2 focus:ring-kiosk-primary focus:border-transparent smooth-transition"
                placeholder="e.g. Nescafe Creamy White"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm lg:text-lg font-semibold text-gray-700">Brand</span>
              <select
                value={productBrandId}
                onChange={(event) => setProductBrandId(event.target.value)}
                className="w-full rounded-[12px] border-2 border-kiosk-muted px-3 py-2.5 text-base lg:px-4 lg:py-3 lg:text-lg outline-none focus:ring-2 focus:ring-kiosk-primary focus:border-transparent smooth-transition"
              >
                <option value="">No brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <input
                value={productVariantLabel}
                onChange={(event) => setProductVariantLabel(event.target.value)}
                className="rounded-[12px] border-2 border-kiosk-muted px-3 py-2.5 text-base lg:px-4 lg:py-3 lg:text-lg outline-none focus:ring-2 focus:ring-kiosk-primary focus:border-transparent smooth-transition"
                placeholder="Label (e.g. Single)"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={productVariantPrice}
                onChange={(event) => setProductVariantPrice(event.target.value)}
                className="rounded-[12px] border-2 border-kiosk-muted px-3 py-2.5 text-base lg:px-4 lg:py-3 lg:text-lg outline-none focus:ring-2 focus:ring-kiosk-primary focus:border-transparent smooth-transition"
                placeholder="Price"
              />
            </div>

            <label className="block">
              <span className="mb-2 block text-sm lg:text-lg font-semibold text-gray-700">Variant Image (optional)</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setProductImageFile(file);
                  setProductImagePreview(file ? URL.createObjectURL(file) : null);
                }}
                className="w-full rounded-[12px] border-2 border-kiosk-muted px-3 py-2.5 text-sm lg:text-base outline-none focus:ring-2 focus:ring-kiosk-primary focus:border-transparent smooth-transition"
              />
              {productImagePreview && (
                <img
                  src={productImagePreview}
                  alt="Preview"
                  className="mt-3 h-24 w-24 rounded-[12px] object-cover card-shadow"
                />
              )}
            </label>

            <button
              type="submit"
              disabled={isUploadingImage}
              className="w-full rounded-[14px] bg-kiosk-primary py-4 text-lg font-bold text-white card-shadow smooth-transition tap-scale disabled:opacity-50 hover:shadow-[0_8px_24px_rgba(80,129,190,0.12)]"
            >
              {isUploadingImage ? "Uploading image..." : "Save Product"}
            </button>
          </form>
        </section>

        <section className="rounded-[18px] lg:rounded-[24px] bg-white p-4 lg:p-8 card-shadow">
          <h2 className="mb-4 lg:mb-6 text-lg lg:text-2xl font-bold text-kiosk-primary">Add Variant to Existing Product</h2>
          <form onSubmit={handleAddExistingVariant} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm lg:text-lg font-semibold text-gray-700">Category</span>
              <select
                value={existingSectionId}
                onChange={(event) => {
                  setExistingSectionId(event.target.value);
                  setExistingProductId("");
                }}
                className="w-full rounded-[12px] border-2 border-kiosk-muted px-3 py-2.5 text-base lg:px-4 lg:py-3 lg:text-lg outline-none focus:ring-2 focus:ring-kiosk-primary focus:border-transparent smooth-transition"
              >
                <option value="">Select category</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm lg:text-lg font-semibold text-gray-700">Product</span>
              <select
                value={existingProductId}
                onChange={(event) => setExistingProductId(event.target.value)}
                className="w-full rounded-[12px] border-2 border-kiosk-muted px-3 py-2.5 text-base lg:px-4 lg:py-3 lg:text-lg outline-none focus:ring-2 focus:ring-kiosk-primary focus:border-transparent smooth-transition"
                disabled={!existingSectionId}
              >
                <option value="">Select product</option>
                {productsInSection.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={existingVariantLabel}
                onChange={(event) => setExistingVariantLabel(event.target.value)}
                className="rounded-[12px] border-2 border-kiosk-muted px-3 py-2.5 text-base lg:px-4 lg:py-3 lg:text-lg outline-none focus:ring-2 focus:ring-kiosk-primary focus:border-transparent smooth-transition"
                placeholder="Variant label"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={existingVariantPrice}
                onChange={(event) => setExistingVariantPrice(event.target.value)}
                className="rounded-[12px] border-2 border-kiosk-muted px-3 py-2.5 text-base lg:px-4 lg:py-3 lg:text-lg outline-none focus:ring-2 focus:ring-kiosk-primary focus:border-transparent smooth-transition"
                placeholder="Price"
              />
            </div>
            <label className="block">
              <span className="mb-2 block text-sm lg:text-lg font-semibold text-gray-700">Variant Image (optional)</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setExistingVariantImageFile(file);
                  setExistingVariantImagePreview(file ? URL.createObjectURL(file) : null);
                }}
                className="w-full rounded-[12px] border-2 border-kiosk-muted px-3 py-2.5 text-sm lg:text-base outline-none focus:ring-2 focus:ring-kiosk-primary focus:border-transparent smooth-transition"
              />
              {existingVariantImagePreview && (
                <img
                  src={existingVariantImagePreview}
                  alt="Preview"
                  className="mt-3 h-24 w-24 rounded-[12px] object-cover card-shadow"
                />
              )}
            </label>
            <button
              type="submit"
              disabled={isUploadingExistingImage}
              className="w-full rounded-[14px] bg-kiosk-primary py-4 text-lg font-bold text-white card-shadow smooth-transition tap-scale disabled:opacity-50 hover:shadow-[0_8px_24px_rgba(80,129,190,0.12)]"
            >
              {isUploadingExistingImage ? "Uploading image..." : "Add Variant"}
            </button>
          </form>
        </section>

        <section className="rounded-[18px] lg:rounded-[24px] bg-white p-4 lg:p-8 card-shadow lg:col-span-2">
          <h2 className="mb-4 lg:mb-6 text-lg lg:text-2xl font-bold text-kiosk-primary">Manage Brands</h2>

          <form onSubmit={handleAddBrand} className="mb-6 flex gap-3">
            <input
              value={newBrandName}
              onChange={(event) => setNewBrandName(event.target.value)}
              className="flex-1 rounded-[12px] border-2 border-kiosk-muted px-3 py-2.5 text-base lg:px-4 lg:py-3 lg:text-lg outline-none focus:ring-2 focus:ring-kiosk-primary focus:border-transparent smooth-transition"
              placeholder="e.g. Nescafe"
            />
            <button
              type="submit"
              className="rounded-[14px] bg-kiosk-primary px-6 py-3 text-lg font-bold text-white card-shadow smooth-transition tap-scale hover:shadow-[0_8px_24px_rgba(80,129,190,0.12)]"
            >
              Add Brand
            </button>
          </form>

          <div className="relative mb-6">
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
              value={brandSearchQuery}
              onChange={(event) => setBrandSearchQuery(event.target.value)}
              placeholder="Search brands..."
              className="w-full rounded-xl border-2 border-kiosk-muted pl-11 pr-4 py-3 text-lg outline-none focus:border-kiosk-accent"
            />
          </div>

          {(() => {
            const filteredBrands = brands.filter((brand) =>
              brand.name.toLowerCase().includes(brandSearchQuery.toLowerCase()),
            );

            if (brands.length === 0) {
              return <p className="text-gray-500">No brands yet.</p>;
            }

            if (filteredBrands.length === 0) {
              return <p className="text-gray-500">No brands match your search.</p>;
            }

            return (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredBrands.map((brand) => (
                  <li
                    key={brand.id}
                    className="flex items-center gap-2 rounded-xl border border-kiosk-muted bg-kiosk-lighter px-4 py-2"
                  >
                    <input
                      defaultValue={brand.name}
                      onBlur={async (event) => {
                        const name = event.target.value.trim();
                        if (name && name !== brand.name) {
                          try {
                            await updateBrand(brand.id, name);
                          } catch (error) {
                            console.error("Failed to update brand:", error);
                          }
                        }
                      }}
                      className="rounded-lg border border-white bg-white px-3 py-2 font-semibold outline-none focus:border-kiosk-accent"
                    />
                    <button
                      type="button"
                      onClick={() => setPendingDelete({ type: "brand", id: brand.id, name: brand.name })}
                      className="rounded-lg bg-red-100 px-3 py-2 font-semibold text-red-600 transition hover:bg-red-200"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            );
          })()}
        </section>

        <section className="rounded-2xl lg:rounded-3xl bg-white p-4 lg:p-6 shadow-md lg:col-span-2">
          <h2 className="mb-4 lg:mb-6 text-lg lg:text-2xl font-bold text-kiosk-primary">Manage Categories</h2>

          <div className="relative mb-6">
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
              value={categorySearchQuery}
              onChange={(event) => setCategorySearchQuery(event.target.value)}
              placeholder="Search categories..."
              className="w-full rounded-xl border-2 border-kiosk-muted pl-11 pr-4 py-3 text-lg outline-none focus:border-kiosk-accent"
            />
          </div>

          {(() => {
            const filteredCategories = sections.filter((section) =>
              section.name.toLowerCase().includes(categorySearchQuery.toLowerCase()),
            );

            if (sections.length === 0) {
              return <p className="text-gray-500">No categories yet.</p>;
            }

            if (filteredCategories.length === 0) {
              return <p className="text-gray-500">No categories match your search.</p>;
            }

            return (
              <ul className="space-y-3">
                {filteredCategories.map((section) => (
                  <li
                    key={section.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-kiosk-muted bg-kiosk-lighter px-4 py-3"
                  >
                    <input
                      defaultValue={section.icon ?? ""}
                      onBlur={async (event) => {
                        const icon = event.target.value.trim();
                        if (icon !== (section.icon ?? "")) {
                          try {
                            await updateSection(section.id, { icon: icon || undefined });
                          } catch (error) {
                            console.error("Failed to update category:", error);
                          }
                        }
                      }}
                      className="w-16 rounded-lg border border-white bg-white px-3 py-2 text-center text-xl outline-none focus:border-kiosk-accent"
                      placeholder="Icon"
                    />
                    <input
                      defaultValue={section.name}
                      onBlur={async (event) => {
                        const name = event.target.value.trim();
                        if (name && name !== section.name) {
                          try {
                            await updateSection(section.id, { name });
                          } catch (error) {
                            console.error("Failed to update category:", error);
                          }
                        }
                      }}
                      className="flex-1 rounded-lg border border-white bg-white px-3 py-2 font-semibold outline-none focus:border-kiosk-accent"
                    />
                    <span className="text-sm text-gray-500">
                      {products.filter((p) => p.section_id === section.id).length} products
                    </span>
                    <button
                      type="button"
                      onClick={() => setPendingDelete({ type: "section", id: section.id, name: section.name })}
                      className="rounded-lg bg-red-100 px-3 py-2 font-semibold text-red-600 transition hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            );
          })()}
        </section>

        <section className="rounded-2xl lg:rounded-3xl bg-white p-4 lg:p-6 shadow-md lg:col-span-2">
          <h2 className="mb-4 lg:mb-6 text-lg lg:text-2xl font-bold text-kiosk-primary">Manage Products</h2>

          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
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
                value={manageSearchQuery}
                onChange={(event) => setManageSearchQuery(event.target.value)}
                placeholder="Search products..."
                className="w-full rounded-xl border-2 border-kiosk-muted pl-11 pr-4 py-3 text-lg outline-none focus:border-kiosk-accent"
              />
            </div>
            <select
              value={manageCategoryFilter}
              onChange={(event) => setManageCategoryFilter(event.target.value)}
              className="rounded-xl border-2 border-kiosk-muted px-4 py-3 text-lg outline-none focus:border-kiosk-accent sm:w-56"
            >
              <option value="">All Categories</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.icon ?? "📦"} {section.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-8">
            {sections
              .filter((section) => !manageCategoryFilter || section.id === manageCategoryFilter)
              .map((section) => {
                const sectionProducts = products.filter(
                  (product) =>
                    product.section_id === section.id &&
                    product.name.toLowerCase().includes(manageSearchQuery.toLowerCase()),
                );

                if (manageSearchQuery && sectionProducts.length === 0) return null;

                return (
                  <div key={section.id} className="rounded-2xl border border-kiosk-muted bg-kiosk-lighter p-5">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <h3 className="flex-1 text-xl font-bold text-kiosk-primary">
                        {section.icon ?? "📦"} {section.name}
                      </h3>
                    </div>

                    {sectionProducts.length === 0 ? (
                      <p className="text-gray-500">No products in this category.</p>
                    ) : (
                      <ul className="space-y-4">
                        {sectionProducts.map((product) => {
                          const productVariants = variants.filter(
                            (variant) => variant.product_id === product.id,
                          );

                          return (
                            <li
                              key={product.id}
                              className="rounded-2xl border border-kiosk-muted bg-white p-4"
                            >
                              <div className="mb-3 flex flex-wrap items-center gap-3">
                                <input
                                  defaultValue={product.name}
                                  onBlur={async (event) => {
                                    const name = event.target.value.trim();
                                    if (name && name !== product.name) {
                                      try {
                                        await updateProduct(product.id, { name });
                                      } catch (error) {
                                        console.error("Failed to update product:", error);
                                      }
                                    }
                                  }}
                                  className="flex-1 rounded-xl border-2 border-kiosk-muted px-4 py-2 text-lg font-semibold outline-none focus:border-kiosk-accent"
                                />
                                <select
                                  defaultValue={product.brand_id ?? ""}
                                  onChange={async (event) => {
                                    const brandId = event.target.value || null;
                                    try {
                                      await updateProduct(product.id, { brand_id: brandId });
                                    } catch (error) {
                                      console.error("Failed to update product brand:", error);
                                    }
                                  }}
                                  className="rounded-xl border-2 border-kiosk-muted px-3 py-2 outline-none focus:border-kiosk-accent"
                                >
                                  <option value="">No brand</option>
                                  {brands.map((brand) => (
                                    <option key={brand.id} value={brand.id}>
                                      {brand.name}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPendingDelete({ type: "product", id: product.id, name: product.name })
                                  }
                                  className="rounded-xl bg-red-100 px-4 py-2 font-semibold text-red-600 transition hover:bg-red-200"
                                >
                                  Delete Product
                                </button>
                              </div>

                              <ul className="space-y-2">
                                {productVariants.map((variant) => (
                                  <li
                                    key={variant.id}
                                    className="flex flex-wrap items-center gap-3 rounded-xl bg-kiosk-lighter p-3"
                                  >
                                    {variant.image_url && (
                                      <img
                                        src={variant.image_url}
                                        alt={variant.label}
                                        className="h-12 w-12 rounded-lg object-cover border border-kiosk-muted"
                                      />
                                    )}
                                    <label className="cursor-pointer rounded-lg bg-white border border-kiosk-muted px-3 py-2 text-xs font-semibold text-kiosk-primary hover:bg-kiosk-light transition">
                                      {variant.image_url ? "Change" : "Add Photo"}
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (event) => {
                                          const file = event.target.files?.[0];
                                          if (!file) return;
                                          try {
                                            const imageUrl = await uploadProductImage(file);
                                            await updateVariant(variant.id, { image_url: imageUrl });
                                            showToast("Image updated");
                                          } catch (error) {
                                            console.error("Failed to upload image:", error);
                                            showToast("Failed to upload image");
                                          }
                                        }}
                                      />
                                    </label>
                                    <input
                                      defaultValue={variant.label}
                                      onBlur={(event) => {
                                        const label = event.target.value.trim();
                                        if (label && label !== variant.label) {
                                          updateVariant(variant.id, { label });
                                        }
                                      }}
                                      className="flex-1 rounded-lg border border-kiosk-muted bg-white px-3 py-2 outline-none focus:border-kiosk-accent"
                                    />
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      defaultValue={variant.price}
                                      onBlur={(event) => {
                                        const price = Number(event.target.value);
                                        if (!Number.isNaN(price) && price !== variant.price) {
                                          updateVariant(variant.id, { price });
                                        }
                                      }}
                                      className="w-28 rounded-lg border border-kiosk-muted bg-white px-3 py-2 outline-none focus:border-kiosk-accent"
                                    />
                                    <span className="font-semibold text-black">
                                      {formatCurrency(variant.price)}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPendingDelete({
                                          type: "variant",
                                          id: variant.id,
                                          name: `${product.name} (${variant.label})`,
                                        })
                                      }
                                      className="rounded-lg bg-red-100 px-3 py-2 font-semibold text-red-600 transition hover:bg-red-200"
                                    >
                                      Delete
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
          </div>
        </section>
      </main>

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title={
          pendingDelete
            ? `Delete ${
                pendingDelete.type === "section"
                  ? "Category"
                  : pendingDelete.type.charAt(0).toUpperCase() + pendingDelete.type.slice(1)
              }`
            : ""
        }
        message={getDeleteMessage()}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}