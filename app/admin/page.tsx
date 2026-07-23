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
    <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b border-slate-200 bg-white px-4 py-6 lg:px-8 lg:py-8 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="mt-2 text-sm font-medium text-slate-500 uppercase tracking-wide">Manage your menu items and operations</p>
          </div>
          <Link
            href="/"
            className="rounded-lg bg-slate-100 px-4 py-2.5 lg:px-6 lg:py-3 text-sm lg:text-base font-semibold text-slate-700 smooth-transition tap-scale hover:bg-slate-200 flex items-center gap-2"
          >
            ← Back to Kiosk
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:gap-8 lg:px-8 lg:py-12 lg:grid-cols-3">
        <section className="rounded-lg bg-white p-6 lg:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900">Add Category</h2>
          </div>
          <form onSubmit={handleAddSection} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Category Name</span>
              <input
                value={newSectionName}
                onChange={(event) => setNewSectionName(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent smooth-transition"
                placeholder="e.g. Beverages, Snacks"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Icon (Optional)</span>
              <input
                value={newSectionIcon}
                onChange={(event) => setNewSectionIcon(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent smooth-transition"
                placeholder="e.g. 🍿 or 🥤"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-3 text-base font-semibold text-white smooth-transition tap-scale hover:bg-blue-700"
            >
              Add Category
            </button>
          </form>
        </section>

        <section className="rounded-lg bg-white p-6 lg:p-8 shadow-sm border border-slate-200 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900">Add Product</h2>
              <p className="text-xs text-slate-500 mt-1">Starts with one variant. Add more variants below.</p>
            </div>
          </div>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Category *</span>
                <select
                  value={productSectionId}
                  onChange={(event) => setProductSectionId(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent smooth-transition"
                >
                  <option value="">Select category</option>
                  {sections.sort((a, b) => a.name.localeCompare(b.name)).map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Brand</span>
                <select
                  value={productBrandId}
                  onChange={(event) => setProductBrandId(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent smooth-transition"
                >
                  <option value="">No brand</option>
                  {brands.sort((a, b) => a.name.localeCompare(b.name)).map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Product Name *</span>
              <input
                value={productName}
                onChange={(event) => setProductName(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent smooth-transition"
                placeholder="e.g. Nescafe Creamy White"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Variant Label *</span>
                <input
                  value={productVariantLabel}
                  onChange={(event) => setProductVariantLabel(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent smooth-transition"
                  placeholder="e.g. Single"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Price *</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productVariantPrice}
                  onChange={(event) => setProductVariantPrice(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent smooth-transition"
                  placeholder="0.00"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Variant Image (Optional)</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setProductImageFile(file);
                  setProductImagePreview(file ? URL.createObjectURL(file) : null);
                }}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent smooth-transition"
              />
              {productImagePreview && (
                <img
                  src={productImagePreview}
                  alt="Preview"
                  className="mt-3 h-24 w-24 rounded-lg object-cover border border-slate-200"
                />
              )}
            </label>

            <button
              type="submit"
              disabled={isUploadingImage}
              className="w-full rounded-lg bg-green-600 py-3 text-base font-semibold text-white smooth-transition tap-scale disabled:opacity-50 hover:bg-green-700"
            >
              {isUploadingImage ? "Uploading..." : "Save Product"}
            </button>
          </form>
        </section>

        <section className="rounded-lg bg-white p-6 lg:p-8 shadow-sm border border-slate-200 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900">Add Variant</h2>
          </div>
          <form onSubmit={handleAddExistingVariant} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Category *</span>
                <select
                  value={existingSectionId}
                  onChange={(event) => {
                    setExistingSectionId(event.target.value);
                    setExistingProductId("");
                  }}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent smooth-transition"
                >
                  <option value="">Select category</option>
                  {sections.sort((a, b) => a.name.localeCompare(b.name)).map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Product *</span>
                <select
                  value={existingProductId}
                  onChange={(event) => setExistingProductId(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent smooth-transition disabled:bg-slate-50 disabled:text-slate-500"
                  disabled={!existingSectionId}
                >
                  <option value="">Select product</option>
                  {productsInSection.sort((a, b) => a.name.localeCompare(b.name)).map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Variant Label *</span>
                <input
                  value={existingVariantLabel}
                  onChange={(event) => setExistingVariantLabel(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent smooth-transition"
                  placeholder="e.g. Medium"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Price *</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={existingVariantPrice}
                  onChange={(event) => setExistingVariantPrice(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent smooth-transition"
                  placeholder="0.00"
                />
              </label>
            </div>
            
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Variant Image (Optional)</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setExistingVariantImageFile(file);
                  setExistingVariantImagePreview(file ? URL.createObjectURL(file) : null);
                }}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent smooth-transition"
              />
              {existingVariantImagePreview && (
                <img
                  src={existingVariantImagePreview}
                  alt="Preview"
                  className="mt-3 h-24 w-24 rounded-lg object-cover border border-slate-200"
                />
              )}
            </label>
            
            <button
              type="submit"
              disabled={isUploadingExistingImage}
              className="w-full rounded-lg bg-purple-600 py-3 text-base font-semibold text-white smooth-transition tap-scale disabled:opacity-50 hover:bg-purple-700"
            >
              {isUploadingExistingImage ? "Uploading..." : "Add Variant"}
            </button>
          </form>
        </section>

        <section className="rounded-lg bg-white p-6 lg:p-8 shadow-sm border border-slate-200 lg:col-span-3">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900">Manage Brands</h2>
          </div>

          <form onSubmit={handleAddBrand} className="mb-6 flex flex-col sm:flex-row gap-3">
            <input
              value={newBrandName}
              onChange={(event) => setNewBrandName(event.target.value)}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent smooth-transition"
              placeholder="e.g. Nescafe"
            />
            <button
              type="submit"
              className="rounded-lg bg-orange-600 px-6 py-2.5 text-base font-semibold text-white smooth-transition tap-scale hover:bg-orange-700 whitespace-nowrap"
            >
              Add Brand
            </button>
          </form>

          <div className="relative mb-6">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
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
              className="w-full rounded-lg border border-slate-300 pl-11 pr-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent smooth-transition"
            />
          </div>

          {(() => {
            const filteredBrands = brands
              .filter((brand) =>
                brand.name.toLowerCase().includes(brandSearchQuery.toLowerCase()),
              )
              .sort((a, b) => a.name.localeCompare(b.name));

            if (brands.length === 0) {
              return <p className="text-slate-500 py-6 text-center">No brands yet.</p>;
            }

            if (filteredBrands.length === 0) {
              return <p className="text-slate-500 py-6 text-center">No brands match your search.</p>;
            }

            return (
              <ul className="space-y-2">
                {filteredBrands.map((brand) => (
                  <li
                    key={brand.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-slate-100 smooth-transition"
                  >
                    <input
                      defaultValue={brand.name}
                      onBlur={async (event) => {
                        const name = event.target.value.trim();
                        if (name && name !== brand.name) {
                          try {
                            await updateBrand(brand.id, name);
                            showToast("Brand updated");
                          } catch (error) {
                            console.error("Failed to update brand:", error);
                            showToast("Failed to update brand");
                          }
                        }
                      }}
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setPendingDelete({ type: "brand", id: brand.id, name: brand.name })}
                      className="rounded-lg bg-red-100 px-4 py-2 font-semibold text-red-600 transition hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            );
          })()}
        </section>

        <section className="rounded-lg bg-white p-6 lg:p-8 shadow-sm border border-slate-200 lg:col-span-3">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-pink-100 rounded-lg">
              <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900">Manage Categories</h2>
          </div>

          <div className="relative mb-6">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
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
              className="w-full rounded-lg border border-slate-300 pl-11 pr-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent smooth-transition"
            />
          </div>

          {(() => {
            const filteredCategories = sections
              .filter((section) =>
                section.name.toLowerCase().includes(categorySearchQuery.toLowerCase()),
              )
              .sort((a, b) => a.name.localeCompare(b.name));

            if (sections.length === 0) {
              return <p className="text-slate-500 py-6 text-center">No categories yet.</p>;
            }

            if (filteredCategories.length === 0) {
              return <p className="text-slate-500 py-6 text-center">No categories match your search.</p>;
            }

            return (
              <ul className="space-y-2">
                {filteredCategories.map((section) => (
                  <li
                    key={section.id}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-slate-100 smooth-transition"
                  >
                    <input
                      defaultValue={section.icon ?? ""}
                      onBlur={async (event) => {
                        const icon = event.target.value.trim();
                        if (icon !== (section.icon ?? "")) {
                          try {
                            await updateSection(section.id, { icon: icon || undefined });
                            showToast("Category updated");
                          } catch (error) {
                            console.error("Failed to update category:", error);
                            showToast("Failed to update category");
                          }
                        }
                      }}
                      className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-2 text-center text-lg outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Icon"
                    />
                    <input
                      defaultValue={section.name}
                      onBlur={async (event) => {
                        const name = event.target.value.trim();
                        if (name && name !== section.name) {
                          try {
                            await updateSection(section.id, { name });
                            showToast("Category updated");
                          } catch (error) {
                            console.error("Failed to update category:", error);
                            showToast("Failed to update category");
                          }
                        }
                      }}
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2.5 py-1 rounded whitespace-nowrap">
                      {products.filter((p) => p.section_id === section.id).length} items
                    </span>
                    <button
                      type="button"
                      onClick={() => setPendingDelete({ type: "section", id: section.id, name: section.name })}
                      className="rounded-lg bg-red-100 px-4 py-2 font-semibold text-red-600 transition hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            );
          })()}
        </section>

        <section className="rounded-lg bg-white p-6 lg:p-8 shadow-sm border border-slate-200 lg:col-span-3">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8 4m-8-4v10M8 7l8 4" />
              </svg>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900">Manage Products</h2>
          </div>

          <div className="relative mb-6">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
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
              className="w-full rounded-lg border border-slate-300 pl-11 pr-4 py-2.5 text-base outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent smooth-transition"
            />
          </div>

          <div className="space-y-6">
            {sections.sort((a, b) => a.name.localeCompare(b.name)).map((section) => {
              const sectionProducts = products
                .filter(
                  (product) =>
                    product.section_id === section.id &&
                    product.name.toLowerCase().includes(manageSearchQuery.toLowerCase()),
                )
                .sort((a, b) => a.name.localeCompare(b.name));

              if (manageSearchQuery && sectionProducts.length === 0) return null;

              return (
                <div key={section.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <h3 className="flex-1 text-lg font-bold text-slate-900">
                      <span className="text-xl mr-2">{section.icon ?? "📦"}</span>
                      {section.name}
                    </h3>
                  </div>

                  {sectionProducts.length === 0 ? (
                    <p className="text-slate-500 text-sm">No products in this category.</p>
                  ) : (
                    <ul className="space-y-3">
                      {sectionProducts.map((product) => {
                        const productVariants = variants
                          .filter((variant) => variant.product_id === product.id)
                          .sort((a, b) => a.label.localeCompare(b.label));

                        return (
                          <li
                            key={product.id}
                            className="rounded-lg border border-slate-200 bg-white p-4"
                          >
                            <div className="mb-4 flex flex-wrap items-center gap-3">
                              <input
                                defaultValue={product.name}
                                onBlur={async (event) => {
                                  const name = event.target.value.trim();
                                  if (name && name !== product.name) {
                                    try {
                                      await updateProduct(product.id, { name });
                                      showToast("Product updated");
                                    } catch (error) {
                                      console.error("Failed to update product:", error);
                                      showToast("Failed to update product");
                                    }
                                  }
                                }}
                                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                              />
                              <select
                                defaultValue={product.brand_id ?? ""}
                                onChange={async (event) => {
                                  const brandId = event.target.value || null;
                                  try {
                                    await updateProduct(product.id, { brand_id: brandId });
                                    showToast("Brand updated");
                                  } catch (error) {
                                    console.error("Failed to update product brand:", error);
                                    showToast("Failed to update brand");
                                  }
                                }}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                              >
                                <option value="">No brand</option>
                                {brands.sort((a, b) => a.name.localeCompare(b.name)).map((brand) => (
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
                                className="rounded-lg bg-red-100 px-4 py-2 font-semibold text-red-600 transition hover:bg-red-200 text-sm"
                              >
                                Delete
                              </button>
                            </div>

                            <ul className="space-y-2 bg-slate-50 rounded-lg p-3">
                              {productVariants.length === 0 ? (
                                <p className="text-slate-400 text-sm">No variants</p>
                              ) : (
                                productVariants.map((variant) => (
                                  <li
                                    key={variant.id}
                                    className="flex flex-wrap items-center gap-2 rounded-lg bg-white p-3 border border-slate-200"
                                  >
                                    {variant.image_url && (
                                      <img
                                        src={variant.image_url}
                                        alt={variant.label}
                                        className="h-10 w-10 rounded-lg object-cover border border-slate-200"
                                      />
                                    )}
                                    <label className="cursor-pointer rounded-lg bg-slate-100 border border-slate-300 px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition">
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
                                      className="flex-1 min-w-24 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
                                      className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    />
                                    <span className="font-semibold text-slate-900 whitespace-nowrap text-sm">
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
                                      className="rounded-lg bg-red-100 px-2 py-1.5 font-semibold text-red-600 transition hover:bg-red-200 text-xs"
                                    >
                                      Delete
                                    </button>
                                  </li>
                                ))
                              )}
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
