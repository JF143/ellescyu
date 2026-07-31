"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useSections } from "@/hooks/useSections";
import { useVariants } from "@/hooks/useVariants";
import { useBrands } from "@/hooks/useBrands";
import { useToast } from "@/components/Toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Drawer } from "@/components/Drawer";
import { uploadProductImage } from "@/lib/uploadImage";
import { formatCurrency } from "@/lib/formatCurrency";
import type { Product, Section, Brand } from "@/types";

type PendingDelete =
  | { type: "brand"; id: string; name: string }
  | { type: "section"; id: string; name: string }
  | { type: "product"; id: string; name: string }
  | { type: "variant"; id: string; name: string };

const inputClass =
  "w-full rounded-xl border-2 border-kiosk-muted px-4 py-3 text-base outline-none focus:border-kiosk-primary transition bg-kiosk-canvas";
const labelClass = "mb-2 block text-sm font-semibold text-kiosk-accent";

export default function AdminPage() {
  const { sections, addSection, updateSection, deleteSection } = useSections();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { variants, addVariant, updateVariant, deleteVariant } = useVariants();
  const { brands, addBrand, updateBrand, deleteBrand } = useBrands();
  const { showToast } = useToast();

  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [resumeDrawer, setResumeDrawer] = useState<(() => void) | null>(null);

  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("");
  const [expandedProductCategories, setExpandedProductCategories] = useState<Set<string>>(new Set());

  const toggleProductCategory = (sectionId: string) => {
    setExpandedProductCategories((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Section | null>(null);
  const [categoryFormName, setCategoryFormName] = useState("");
  const [categoryFormIcon, setCategoryFormIcon] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  const [brandDrawerOpen, setBrandDrawerOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandFormName, setBrandFormName] = useState("");
  const [savingBrand, setSavingBrand] = useState(false);

  const [productDrawerOpen, setProductDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormName, setProductFormName] = useState("");
  const [productFormSectionId, setProductFormSectionId] = useState("");
  const [productFormBrandId, setProductFormBrandId] = useState("");
  const [savingProduct, setSavingProduct] = useState(false);

  const [firstVariantLabel, setFirstVariantLabel] = useState("");
  const [firstVariantPrice, setFirstVariantPrice] = useState("");
  const [firstVariantImageFile, setFirstVariantImageFile] = useState<File | null>(null);
  const [firstVariantImagePreview, setFirstVariantImagePreview] = useState<string | null>(null);

  const [newVariantLabel, setNewVariantLabel] = useState("");
  const [newVariantPrice, setNewVariantPrice] = useState("");
  const [newVariantImageFile, setNewVariantImageFile] = useState<File | null>(null);
  const [newVariantImagePreview, setNewVariantImagePreview] = useState<string | null>(null);
  const [savingNewVariant, setSavingNewVariant] = useState(false);

  const isDuplicateError = (error: unknown) =>
    typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505";

  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormName("");
    setCategoryFormIcon("");
    setCategoryDrawerOpen(true);
  };

  const openEditCategory = (section: Section) => {
    setEditingCategory(section);
    setCategoryFormName(section.name);
    setCategoryFormIcon(section.icon ?? "");
    setCategoryDrawerOpen(true);
  };

  const saveCategory = async () => {
    if (!categoryFormName.trim()) return;
    setSavingCategory(true);
    try {
      if (editingCategory) {
        await updateSection(editingCategory.id, {
          name: categoryFormName.trim(),
          icon: categoryFormIcon.trim() || undefined,
        });
        showToast("Category updated");
      } else {
        await addSection(categoryFormName.trim(), categoryFormIcon.trim() || undefined);
        showToast("Category added successfully");
      }
      setCategoryDrawerOpen(false);
    } catch (error) {
      showToast(isDuplicateError(error) ? "That category already exists" : "Failed to save category");
      console.error("Failed to save category:", error);
    } finally {
      setSavingCategory(false);
    }
  };

  const openAddBrand = () => {
    setEditingBrand(null);
    setBrandFormName("");
    setBrandDrawerOpen(true);
  };

  const openEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setBrandFormName(brand.name);
    setBrandDrawerOpen(true);
  };

  const saveBrand = async () => {
    if (!brandFormName.trim()) return;
    setSavingBrand(true);
    try {
      if (editingBrand) {
        await updateBrand(editingBrand.id, brandFormName.trim());
        showToast("Brand updated");
      } else {
        await addBrand(brandFormName.trim());
        showToast("Brand added successfully");
      }
      setBrandDrawerOpen(false);
    } catch (error) {
      showToast(isDuplicateError(error) ? "That brand already exists" : "Failed to save brand");
      console.error("Failed to save brand:", error);
    } finally {
      setSavingBrand(false);
    }
  };

  const resetProductVariantForms = () => {
    setFirstVariantLabel("");
    setFirstVariantPrice("");
    setFirstVariantImageFile(null);
    setFirstVariantImagePreview(null);
    setNewVariantLabel("");
    setNewVariantPrice("");
    setNewVariantImageFile(null);
    setNewVariantImagePreview(null);
  };

  const openAddProduct = (sectionId?: string) => {
    setEditingProduct(null);
    setProductFormName("");
    setProductFormSectionId(sectionId ?? "");
    setProductFormBrandId("");
    resetProductVariantForms();
    setProductDrawerOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormName(product.name);
    setProductFormSectionId(product.section_id);
    setProductFormBrandId(product.brand_id ?? "");
    resetProductVariantForms();
    setProductDrawerOpen(true);
  };

  const saveProduct = async () => {
    if (!productFormSectionId || !productFormName.trim()) return;
    setSavingProduct(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: productFormName.trim(),
          section_id: productFormSectionId,
          brand_id: productFormBrandId || null,
        });
        showToast("Product updated");
      } else {
        if (!firstVariantLabel.trim() || !firstVariantPrice.trim()) {
          showToast("Add at least one variant label and price");
          setSavingProduct(false);
          return;
        }
        const price = Number(firstVariantPrice);
        if (Number.isNaN(price) || price < 0) {
          setSavingProduct(false);
          return;
        }
        let imageUrl: string | undefined;
        if (firstVariantImageFile) {
          imageUrl = await uploadProductImage(firstVariantImageFile);
        }
        await addProduct(
          productFormSectionId,
          productFormName.trim(),
          [{ label: firstVariantLabel.trim(), price, image_url: imageUrl }],
          productFormBrandId || undefined,
        );
        showToast("Product added successfully");
      }
      setProductDrawerOpen(false);
    } catch (error) {
      console.error("Failed to save product:", error);
      showToast("Failed to save product");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleAddVariantToEditingProduct = async () => {
    if (!editingProduct) return;
    const price = Number(newVariantPrice);
    if (!newVariantLabel.trim() || Number.isNaN(price)) return;

    setSavingNewVariant(true);
    try {
      let imageUrl: string | undefined;
      if (newVariantImageFile) {
        imageUrl = await uploadProductImage(newVariantImageFile);
      }
      await addVariant(editingProduct.id, newVariantLabel.trim(), price, imageUrl);
      setNewVariantLabel("");
      setNewVariantPrice("");
      setNewVariantImageFile(null);
      setNewVariantImagePreview(null);
      showToast("Variant added");
    } catch (error) {
      console.error("Failed to add variant:", error);
      showToast("Failed to add variant");
    } finally {
      setSavingNewVariant(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      switch (pendingDelete.type) {
        case "brand":
          await deleteBrand(pendingDelete.id);
          showToast("Brand deleted");
          setBrandDrawerOpen(false);
          break;
        case "section":
          await deleteSection(pendingDelete.id);
          showToast("Category deleted");
          setCategoryDrawerOpen(false);
          break;
        case "product":
          await deleteProduct(pendingDelete.id);
          showToast("Product deleted");
          setProductDrawerOpen(false);
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
      setResumeDrawer(null);
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

  const editingProductVariants = useMemo(
    () => (editingProduct ? variants.filter((v) => v.product_id === editingProduct.id) : []),
    [variants, editingProduct],
  );

  const filteredProductSections = useMemo(() => {
    return sections
      .filter((section) => !productCategoryFilter || section.id === productCategoryFilter)
      .map((section) => ({
        section,
        products: products.filter(
          (p) =>
            p.section_id === section.id &&
            p.name.toLowerCase().includes(productSearchQuery.toLowerCase()),
        ),
      }))
      .filter(({ products: p }) => !productSearchQuery || p.length > 0);
  }, [sections, products, productSearchQuery, productCategoryFilter]);

  const searchMatchedSectionIds = useMemo(() => {
    if (!productSearchQuery.trim()) return null;
    return new Set(filteredProductSections.map(({ section }) => section.id));
  }, [filteredProductSections, productSearchQuery]);

  const priceRangeFor = (productId: string) => {
    const productVariants = variants.filter((v) => v.product_id === productId);
    if (productVariants.length === 0) return "No variants";
    const prices = productVariants.map((v) => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? formatCurrency(min) : `${formatCurrency(min)} – ${formatCurrency(max)}`;
  };

  const brandNameFor = (brandId?: string | null) => brands.find((b) => b.id === brandId)?.name;

  return (
    <div className="h-dvh overflow-y-auto bg-kiosk-canvas touch-pan-y overscroll-contain [-webkit-overflow-scrolling:touch]">      <header className="border-b-2 border-kiosk-muted bg-white px-4 py-4 lg:px-8 lg:py-6 shadow-sm sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-kiosk-primary">Admin</h1>
            <p className="mt-1 text-xs lg:text-sm font-medium text-kiosk-accent">Manage categories, products, and brands</p>
          </div>
          <Link
            href="/"
            className="rounded-xl bg-kiosk-lighter px-4 py-2.5 lg:px-6 lg:py-3 text-sm lg:text-base font-bold text-kiosk-primary transition hover:bg-kiosk-primary hover:text-white"
          >
            ← Back to Kiosk
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-10 space-y-10">
        {/* ===== Categories ===== */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg lg:text-xl font-bold text-foreground">Categories</h2>
            <button
              type="button"
              onClick={openAddCategory}
              className="rounded-full bg-kiosk-primary px-5 py-2.5 text-sm font-bold text-white shadow transition hover:opacity-90"
            >
              + Add Category
            </button>
          </div>

          {sections.length === 0 ? (
            <p className="text-kiosk-accent">No categories yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => openEditCategory(section)}
                  className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm border border-kiosk-muted text-left transition hover:shadow-md hover:-translate-y-0.5"
                >
                  <span className="text-2xl">{section.icon ?? "📦"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground truncate">{section.name}</p>
                    <p className="text-xs text-kiosk-accent">
                      {products.filter((p) => p.section_id === section.id).length} products
                    </p>
                  </div>
                  <span className="text-kiosk-accent">✎</span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ===== Brands ===== */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg lg:text-xl font-bold text-foreground">Brands</h2>
            <button
              type="button"
              onClick={openAddBrand}
              className="rounded-full bg-kiosk-primary px-5 py-2.5 text-sm font-bold text-white shadow transition hover:opacity-90"
            >
              + Add Brand
            </button>
          </div>

          {brands.length === 0 ? (
            <p className="text-kiosk-accent">No brands yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => openEditBrand(brand)}
                  className="rounded-full bg-white border-2 border-kiosk-muted px-5 py-2.5 text-sm font-bold text-kiosk-primary shadow-sm transition hover:bg-kiosk-lighter"
                >
                  {brand.name}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ===== Products ===== */}
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg lg:text-xl font-bold text-foreground">Products</h2>
            <button
              type="button"
              onClick={() => openAddProduct()}
              className="rounded-full bg-kiosk-primary px-5 py-2.5 text-sm font-bold text-white shadow transition hover:opacity-90"
            >
              + Add Product
            </button>
          </div>

          <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-sm border border-kiosk-muted sm:flex-row">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-kiosk-accent pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={productSearchQuery}
                onChange={(event) => setProductSearchQuery(event.target.value)}
                placeholder="Search products..."
                className="w-full rounded-xl border-2 border-kiosk-muted pl-11 pr-4 py-2.5 outline-none focus:border-kiosk-primary bg-kiosk-canvas"
              />
            </div>
            <select
              value={productCategoryFilter}
              onChange={(event) => setProductCategoryFilter(event.target.value)}
              className="rounded-xl border-2 border-kiosk-muted px-4 py-2.5 outline-none focus:border-kiosk-primary bg-kiosk-canvas sm:w-56"
            >
              <option value="">All Categories</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.icon ?? "📦"} {section.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {filteredProductSections.map(({ section, products: sectionProducts }) => {
              const isExpanded = searchMatchedSectionIds
                ? searchMatchedSectionIds.has(section.id)
                : expandedProductCategories.has(section.id);
              return (
                <div key={section.id} className="rounded-2xl bg-white shadow-sm border border-kiosk-muted overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleProductCategory(section.id)}
                    className="w-full flex items-center gap-2 px-4 py-4 text-left transition hover:bg-kiosk-lighter/60"
                  >
                    <span className="text-lg">{section.icon ?? "📦"}</span>
                    <h3 className="font-bold text-foreground">{section.name}</h3>
                    <span className="text-xs text-kiosk-accent bg-kiosk-lighter px-2 py-0.5 rounded-full">
                      {sectionProducts.length} items
                    </span>
                    <span
                      className={`ml-auto text-xl text-kiosk-accent transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    >
                      ▾
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-kiosk-muted divide-y divide-kiosk-muted">
                      {sectionProducts.length === 0 ? (
                        <p className="px-4 py-4 text-sm text-kiosk-accent">No products in this category.</p>
                      ) : (
                        sectionProducts.map((product) => {
                          const firstVariant = variants.find((v) => v.product_id === product.id);
                          return (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => openEditProduct(product)}
                              className="w-full flex items-center gap-4 p-4 text-left transition hover:bg-kiosk-lighter/60"
                            >
                              <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-kiosk-lighter flex items-center justify-center">
                                {firstVariant?.image_url ? (
                                  <img src={firstVariant.image_url} alt={product.name} className="h-full w-full object-cover" />
                                ) : (
                                  <span className="text-xl">📦</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-foreground truncate">{product.name}</p>
                                {brandNameFor(product.brand_id) && (
                                  <span className="inline-block mt-1 rounded-full bg-kiosk-lighter px-2.5 py-0.5 text-xs font-semibold text-kiosk-primary">
                                    {brandNameFor(product.brand_id)}
                                  </span>
                                )}
                              </div>
                              <p className="shrink-0 font-bold text-black">{priceRangeFor(product.id)}</p>
                              <span className="shrink-0 text-kiosk-accent">✎</span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ===== Category Drawer ===== */}
      <Drawer
        isOpen={categoryDrawerOpen}
        onClose={() => setCategoryDrawerOpen(false)}
        title={editingCategory ? "Edit Category" : "Add New Category"}
        subtitle={editingCategory ? undefined : "Create a new section for the kiosk sidebar."}
        footer={
          <>
            {editingCategory && (
                <button
                  type="button"
                  onClick={() => {
                    setCategoryDrawerOpen(false);
                    setResumeDrawer(() => () => setCategoryDrawerOpen(true));
                    setPendingDelete({ type: "section", id: editingCategory.id, name: editingCategory.name });
                  }}
                  className="mr-auto text-sm font-semibold text-red-600 hover:opacity-80"
                >
                  Delete Category
                </button>
              )}
            <button
              type="button"
              onClick={() => setCategoryDrawerOpen(false)}
              className="h-12 px-6 rounded-xl bg-kiosk-lighter text-kiosk-primary font-bold transition hover:bg-kiosk-light"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveCategory}
              disabled={savingCategory || !categoryFormName.trim()}
              className="flex-1 h-12 rounded-xl bg-kiosk-primary text-white font-bold transition hover:opacity-90 disabled:opacity-50"
            >
              {savingCategory ? "Saving..." : "Save"}
            </button>
          </>
        }
      >
        <label className="block">
          <span className={labelClass}>Category name</span>
          <input
            value={categoryFormName}
            onChange={(event) => setCategoryFormName(event.target.value)}
            className={inputClass}
            placeholder="e.g. Snacks"
          />
        </label>
        <label className="block">
          <span className={labelClass}>Icon (emoji)</span>
          <input
            value={categoryFormIcon}
            onChange={(event) => setCategoryFormIcon(event.target.value)}
            className={inputClass}
            placeholder="e.g. 🍿"
          />
        </label>
      </Drawer>

      {/* ===== Brand Drawer ===== */}
      <Drawer
        isOpen={brandDrawerOpen}
        onClose={() => setBrandDrawerOpen(false)}
        title={editingBrand ? "Edit Brand" : "Add New Brand"}
        footer={
          <>
            {editingBrand && (
              <button
                type="button"
                onClick={() => {
                  setBrandDrawerOpen(false);
                  setResumeDrawer(() => () => setBrandDrawerOpen(true));
                  setPendingDelete({ type: "brand", id: editingBrand.id, name: editingBrand.name });
                }}
                className="mr-auto text-sm font-semibold text-red-600 hover:opacity-80"
              >
                Delete Brand
              </button>
            )}
            <button
              type="button"
              onClick={() => setBrandDrawerOpen(false)}
              className="h-12 px-6 rounded-xl bg-kiosk-lighter text-kiosk-primary font-bold transition hover:bg-kiosk-light"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveBrand}
              disabled={savingBrand || !brandFormName.trim()}
              className="flex-1 h-12 rounded-xl bg-kiosk-primary text-white font-bold transition hover:opacity-90 disabled:opacity-50"
            >
              {savingBrand ? "Saving..." : "Save"}
            </button>
          </>
        }
      >
        <label className="block">
          <span className={labelClass}>Brand name</span>
          <input
            value={brandFormName}
            onChange={(event) => setBrandFormName(event.target.value)}
            className={inputClass}
            placeholder="e.g. Nescafe"
          />
        </label>
      </Drawer>

      {/* ===== Product Drawer ===== */}
      <Drawer
        isOpen={productDrawerOpen}
        onClose={() => setProductDrawerOpen(false)}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        subtitle={
          editingProduct
            ? "Update details, or add another variant below."
            : "Create the product with its first variant."
        }
        footer={
          <>
            {editingProduct && (
              <button
                type="button"
                onClick={() => {
                  setProductDrawerOpen(false);
                  setResumeDrawer(() => () => setProductDrawerOpen(true));
                  setPendingDelete({ type: "product", id: editingProduct.id, name: editingProduct.name });
                }}
                className="mr-auto text-sm font-semibold text-red-600 hover:opacity-80"
              >
                Delete Product
              </button>
            )}
            <button
              type="button"
              onClick={() => setProductDrawerOpen(false)}
              className="h-12 px-6 rounded-xl bg-kiosk-lighter text-kiosk-primary font-bold transition hover:bg-kiosk-light"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveProduct}
              disabled={savingProduct || !productFormName.trim() || !productFormSectionId}
              className="flex-1 h-12 rounded-xl bg-kiosk-primary text-white font-bold transition hover:opacity-90 disabled:opacity-50"
            >
              {savingProduct ? "Saving..." : "Save"}
            </button>
          </>
        }
      >
        <label className="block">
          <span className={labelClass}>Product name</span>
          <input
            value={productFormName}
            onChange={(event) => setProductFormName(event.target.value)}
            className={inputClass}
            placeholder="e.g. Nescafe Creamy White"
            
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass}>Category</span>
            <select
              value={productFormSectionId}
              onChange={(event) => setProductFormSectionId(event.target.value)}
              className={inputClass}
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
            <span className={labelClass}>Brand</span>
            <select
              value={productFormBrandId}
              onChange={(event) => setProductFormBrandId(event.target.value)}
              className={inputClass}
            >
              <option value="">No brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {!editingProduct && (
          <div className="rounded-2xl border-2 border-dashed border-kiosk-muted p-4 space-y-4">
            <p className="text-sm font-semibold text-kiosk-accent">First Variant</p>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={firstVariantLabel}
                onChange={(event) => setFirstVariantLabel(event.target.value)}
                className={inputClass}
                placeholder="Label (e.g. Single)"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={firstVariantPrice}
                onChange={(event) => setFirstVariantPrice(event.target.value)}
                className={inputClass}
                placeholder="Price"
              />
            </div>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-kiosk-accent">Photo (optional)</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setFirstVariantImageFile(file);
                  setFirstVariantImagePreview(file ? URL.createObjectURL(file) : null);
                }}
                className="w-full text-sm"
              />
              {firstVariantImagePreview && (
                <img
                  src={firstVariantImagePreview}
                  alt="Preview"
                  className="mt-2 h-20 w-20 rounded-xl object-cover border border-kiosk-muted"
                />
              )}
            </label>
          </div>
        )}

        {editingProduct && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-kiosk-accent">Variants</p>

            {editingProductVariants.length === 0 ? (
              <p className="text-sm text-kiosk-accent">No variants yet — add one below.</p>
            ) : (
              <div className="space-y-3">
                {editingProductVariants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex flex-wrap items-center gap-2 rounded-xl bg-kiosk-lighter p-3"
                  >
                    {variant.image_url && (
                      <img
                        src={variant.image_url}
                        alt={variant.label}
                        className="h-11 w-11 rounded-lg object-cover border border-kiosk-muted"
                      />
                    )}
                    <label className="cursor-pointer rounded-lg bg-white border border-kiosk-muted px-2.5 py-1.5 text-xs font-semibold text-kiosk-primary hover:bg-kiosk-light transition">
                      {variant.image_url ? "Change" : "Photo"}
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
                        if (label && label !== variant.label) updateVariant(variant.id, { label });
                      }}
                      className="flex-1 min-w-[100px] rounded-lg border border-kiosk-muted bg-white px-3 py-2 text-sm outline-none focus:border-kiosk-primary"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={variant.price}
                      onBlur={(event) => {
                        const price = Number(event.target.value);
                        if (!Number.isNaN(price) && price !== variant.price) updateVariant(variant.id, { price });
                      }}
                      className="w-24 rounded-lg border border-kiosk-muted bg-white px-3 py-2 text-sm outline-none focus:border-kiosk-primary"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setProductDrawerOpen(false);
                        setResumeDrawer(() => () => setProductDrawerOpen(true));
                        setPendingDelete({
                          type: "variant",
                          id: variant.id,
                          name: `${editingProduct.name} (${variant.label})`,
                        });
                      }}
                      className="rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-2xl border-2 border-dashed border-kiosk-muted p-4 space-y-3">
              <p className="text-xs font-semibold text-kiosk-accent">+ Add another variant</p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={newVariantLabel}
                  onChange={(event) => setNewVariantLabel(event.target.value)}
                  className={inputClass}
                  placeholder="Label"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newVariantPrice}
                  onChange={(event) => setNewVariantPrice(event.target.value)}
                  className={inputClass}
                  placeholder="Price"
                />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setNewVariantImageFile(file);
                  setNewVariantImagePreview(file ? URL.createObjectURL(file) : null);
                }}
                className="w-full text-sm"
              />
              {newVariantImagePreview && (
                <img
                  src={newVariantImagePreview}
                  alt="Preview"
                  className="h-20 w-20 rounded-xl object-cover border border-kiosk-muted"
                />
              )}
              <button
                type="button"
                onClick={handleAddVariantToEditingProduct}
                disabled={savingNewVariant || !newVariantLabel.trim() || !newVariantPrice.trim()}
                className="w-full h-11 rounded-xl bg-kiosk-lighter text-kiosk-primary font-bold text-sm transition hover:bg-kiosk-light disabled:opacity-50"
              >
                {savingNewVariant ? "Adding..." : "Add Variant"}
              </button>
            </div>
          </div>
        )}
      </Drawer>

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
        onCancel={() => {
          setPendingDelete(null);
          if (resumeDrawer) {
            resumeDrawer();
            setResumeDrawer(null);
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}