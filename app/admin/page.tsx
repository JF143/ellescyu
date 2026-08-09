"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
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
import { useInvoices } from "@/hooks/useInvoices";

type PendingDelete =
  | { type: "brand"; id: string; name: string }
  | { type: "section"; id: string; name: string }
  | { type: "product"; id: string; name: string }
  | { type: "variant"; id: string; name: string };

type NewVariantRow = {
  key: string;
  label: string;
  retailPrice: string;
  wholesalePrice: string;
  boxQuantity: string;
  boxPrice: string;
  imageFile: File | null;
  imagePreview: string | null;
};

const inputClass =
  "w-full rounded-xl border-2 border-kiosk-muted px-4 py-3 text-base outline-none focus:border-kiosk-primary transition bg-kiosk-canvas";
const labelClass = "mb-2 block text-sm font-semibold text-kiosk-accent";

export default function AdminPage() {
  const { sections, addSection, updateSection, deleteSection } = useSections();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { variants, addVariant, updateVariant, deleteVariant, fetchVariants } = useVariants();
  const { brands, addBrand, updateBrand, deleteBrand } = useBrands();
  const { showToast } = useToast();
  const { invoices, isLoading: invoicesLoading, updateInvoiceCustomerName } = useInvoices();

  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const filteredInvoices = useMemo(() => {
    const query = invoiceSearchQuery.trim().toLowerCase();
    if (!query) return invoices;
    return invoices.filter((invoice) => {
      const customer = (invoice.customer_name ?? "walk-in customer").toLowerCase();
      const itemMatch = invoice.items.some((item) => item.product_name.toLowerCase().includes(query));
      return customer.includes(query) || itemMatch;
    });
  }, [invoices, invoiceSearchQuery]);

  const selectedInvoice = filteredInvoices.find((inv) => inv.id === selectedInvoiceId) ?? filteredInvoices[0] ?? null;

  const handlePrintInvoice = () => window.print();

  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [resumeDrawer, setResumeDrawer] = useState<(() => void) | null>(null);
  const [activeTab, setActiveTab] = useState<"categories" | "brands" | "products" | "invoices">("categories");

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

  const makeEmptyVariantRow = (): NewVariantRow => ({
    key: uuidv4(),
    label: "",
    retailPrice: "",
    wholesalePrice: "",
    boxQuantity: "",
    boxPrice: "",
    imageFile: null,
    imagePreview: null,
  });

  const [newProductVariants, setNewProductVariants] = useState<NewVariantRow[]>([makeEmptyVariantRow()]);

  const [newVariantLabel, setNewVariantLabel] = useState("");
  const [newVariantPrice, setNewVariantPrice] = useState("");
  const [newVariantImageFile, setNewVariantImageFile] = useState<File | null>(null);
  const [newVariantImagePreview, setNewVariantImagePreview] = useState<string | null>(null);
  const [newVariantImageInputKey, setNewVariantImageInputKey] = useState(0);
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
    setNewProductVariants([makeEmptyVariantRow()]);
    setNewVariantLabel("");
    setNewVariantPrice("");
    setNewVariantImageFile(null);
    setNewVariantImagePreview(null);
    setNewVariantImageInputKey((key) => key + 1);
  };

  const addNewProductVariantRow = () => {
    setNewProductVariants((prev) => [...prev, makeEmptyVariantRow()]);
  };

  const removeNewProductVariantRow = (key: string) => {
    setNewProductVariants((prev) => (prev.length <= 1 ? prev : prev.filter((row) => row.key !== key)));
  };

  const updateNewProductVariantRow = (key: string, updates: Partial<NewVariantRow>) => {
    setNewProductVariants((prev) => prev.map((row) => (row.key === key ? { ...row, ...updates } : row)));
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
    setProductFormSectionId(product.section_id ?? "");
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
        const validRows = newProductVariants.filter((row) => row.label.trim() && row.retailPrice.trim());
        if (validRows.length === 0) {
          showToast("Add at least one variant label and retail price");
          setSavingProduct(false);
          return;
        }

        const parsedRows: {
          label: string;
          retail_price: number;
          wholesale_price?: number;
          box_quantity?: number;
          box_price?: number;
          image_url?: string;
        }[] = [];
        for (const row of validRows) {
          const retailPrice = Number(row.retailPrice);
          if (Number.isNaN(retailPrice) || retailPrice < 0) {
            showToast(`Invalid retail price for "${row.label.trim()}"`);
            setSavingProduct(false);
            return;
          }

          let wholesalePrice: number | undefined;
          if (row.wholesalePrice.trim()) {
            wholesalePrice = Number(row.wholesalePrice);
            if (Number.isNaN(wholesalePrice) || wholesalePrice < 0) {
              showToast(`Invalid wholesale price for "${row.label.trim()}"`);
              setSavingProduct(false);
              return;
            }
          }

          let boxQuantity: number | undefined;
          if (row.boxQuantity.trim()) {
            boxQuantity = Number(row.boxQuantity);
            if (Number.isNaN(boxQuantity) || boxQuantity <= 0) {
              showToast(`Invalid pieces per box for "${row.label.trim()}"`);
              setSavingProduct(false);
              return;
            }
          }

          let boxPrice: number | undefined;
          if (row.boxPrice.trim()) {
            boxPrice = Number(row.boxPrice);
            if (Number.isNaN(boxPrice) || boxPrice < 0) {
              showToast(`Invalid box price for "${row.label.trim()}"`);
              setSavingProduct(false);
              return;
            }
          }

          let imageUrl: string | undefined;
          if (row.imageFile) {
            imageUrl = await uploadProductImage(row.imageFile);
          }
          parsedRows.push({
            label: row.label.trim(),
            retail_price: retailPrice,
            wholesale_price: wholesalePrice,
            box_quantity: boxQuantity,
            box_price: boxPrice,
            image_url: imageUrl,
          });
        }

        await addProduct(
          productFormSectionId,
          productFormName.trim(),
          parsedRows,
          productFormBrandId || undefined,
        );
        await fetchVariants();
        showToast(`Product added with ${parsedRows.length} variant${parsedRows.length === 1 ? "" : "s"}`);
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
      setNewVariantImageInputKey((key) => key + 1);
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
    const prices = productVariants.map((v) => v.retail_price);
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

      <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 lg:flex-row lg:gap-6 lg:px-8 lg:py-10">
        {/* ===== Navigation: horizontal chips on mobile, vertical sidebar on lg+ ===== */}
        <nav className="flex flex-none gap-2 overflow-x-auto pb-1 lg:sticky lg:top-24 lg:w-56 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:self-start lg:rounded-2xl lg:bg-white lg:p-3 lg:shadow-sm lg:border lg:border-kiosk-muted">
          {[
            { key: "categories" as const, label: "Categories", icon: "🗂️" },
            { key: "brands" as const, label: "Brands", icon: "🏷️" },
            { key: "products" as const, label: "Products", icon: "📦" },
            { key: "invoices" as const, label: "Invoices", icon: "🧾" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-none items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition lg:w-full lg:justify-start lg:rounded-xl lg:px-4 lg:py-3 lg:text-left ${
                activeTab === tab.key
                  ? "bg-kiosk-primary text-white shadow"
                  : "bg-white text-kiosk-accent border border-kiosk-muted lg:border-0 lg:bg-transparent hover:bg-kiosk-lighter hover:text-foreground"
              }`}
            >
              <span className="text-base lg:text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* ===== Content ===== */}
        <div className="min-w-0 flex-1">
          {activeTab === "categories" && (
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
          )}

          {activeTab === "brands" && (
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
          )}

          {activeTab === "products" && (
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
                              const productVariants = variants.filter((v) => v.product_id === product.id);
                              const displayVariant =
                                productVariants.find((v) => v.image_url) ?? productVariants[0];
                              return (
                                <button
                                  key={product.id}
                                  type="button"
                                  onClick={() => openEditProduct(product)}
                                  className="w-full flex items-center gap-4 p-4 text-left transition hover:bg-kiosk-lighter/60"
                                >
                                  <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-kiosk-lighter flex items-center justify-center">
                                    {displayVariant?.image_url ? (
                                      <img src={displayVariant.image_url} alt={product.name} className="h-full w-full object-cover" />
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
          )}

          {activeTab === "invoices" && (
            <section>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
                <h2 className="text-lg lg:text-xl font-bold text-foreground">Invoices</h2>
                <span className="text-xs font-semibold text-kiosk-accent bg-kiosk-lighter px-3 py-1.5 rounded-full">
                  {invoices.length} recorded
                </span>
              </div>

              {invoicesLoading ? (
                <p className="text-kiosk-accent">Loading invoices...</p>
              ) : invoices.length === 0 ? (
                <p className="text-kiosk-accent">No invoices recorded yet. They're created automatically when a payment is confirmed at checkout.</p>
              ) : (
                <div className="flex flex-col lg:flex-row gap-4 lg:h-[calc(100vh-260px)]">
                  {/* ===== Master: invoice list ===== */}
                  <div className="lg:w-80 shrink-0 flex flex-col rounded-2xl bg-white shadow-sm border border-kiosk-muted overflow-hidden print:hidden">
                    <div className="p-3 border-b border-kiosk-muted">
                      <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-kiosk-accent pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          value={invoiceSearchQuery}
                          onChange={(event) => setInvoiceSearchQuery(event.target.value)}
                          placeholder="Search by customer or item..."
                          className="w-full rounded-xl border border-kiosk-muted pl-9 pr-3 py-2 text-sm outline-none focus:border-kiosk-primary bg-kiosk-canvas"
                        />
                      </div>
                    </div>

                    <ul className="flex-1 overflow-y-auto divide-y divide-kiosk-muted">
                      {filteredInvoices.length === 0 ? (
                        <li className="px-4 py-8 text-center text-sm text-kiosk-accent">No invoices match your search.</li>
                      ) : (
                        filteredInvoices.map((invoice) => {
                          const isSelected = invoice.id === selectedInvoice?.id;
                          return (
                            <li key={invoice.id}>
                              <button
                                type="button"
                                onClick={() => setSelectedInvoiceId(invoice.id)}
                                className={`w-full text-left px-4 py-3 transition ${
                                  isSelected ? "bg-kiosk-primary text-white" : "hover:bg-kiosk-lighter"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`text-sm font-bold truncate ${isSelected ? "text-white" : "text-foreground"}`}>
                                    {invoice.customer_name?.trim() || "Walk-in customer"}
                                  </span>
                                  <span className={`text-sm font-bold shrink-0 ${isSelected ? "text-white" : "text-kiosk-primary"}`}>
                                    {formatCurrency(invoice.subtotal)}
                                  </span>
                                </div>
                                <p className={`text-xs mt-0.5 ${isSelected ? "text-white/70" : "text-kiosk-accent"}`}>
                                  {invoice.created_at
                                    ? new Date(invoice.created_at).toLocaleString([], {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : ""}
                                  {" · "}
                                  {invoice.item_count} {invoice.item_count === 1 ? "item" : "items"}
                                </p>
                              </button>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </div>

                  {/* ===== Detail: selected invoice ===== */}
                  <div className="flex-1 min-w-0 rounded-2xl bg-white shadow-sm border border-kiosk-muted overflow-y-auto print:border-none print:shadow-none">
                    {!selectedInvoice ? (
                      <div className="h-full flex items-center justify-center p-8 text-center text-kiosk-accent">
                        Select an invoice to view details.
                      </div>
                    ) : (
                      <div className="p-6 lg:p-8 max-w-xl mx-auto">
                        <div className="flex items-start justify-between gap-3 mb-6">
                          <div>
                            <h3 className="text-2xl font-bold text-foreground">Receipt</h3>
                            <p className="text-sm text-kiosk-accent mt-1">
                              {selectedInvoice.created_at
                                ? new Date(selectedInvoice.created_at).toLocaleString([], { dateStyle: "long", timeStyle: "short" })
                                : ""}
                            </p>
                            <p className="text-sm text-kiosk-accent mt-0.5 font-medium">Cashier: —</p>
                          </div>
                          <div className="flex gap-2 print:hidden">
                            <button
                              type="button"
                              onClick={handlePrintInvoice}
                              className="rounded-xl border border-kiosk-muted px-4 py-2 text-sm font-semibold text-kiosk-primary hover:bg-kiosk-lighter transition"
                            >
                              Print
                            </button>
                            <button
                              type="button"
                              onClick={handlePrintInvoice}
                              className="rounded-xl bg-kiosk-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
                            >
                              Download PDF
                            </button>
                          </div>
                        </div>

                        <label className="block mb-6">
                          <span className="mb-1 block text-xs font-semibold text-kiosk-accent uppercase tracking-wide">Customer</span>
                          <input
                            defaultValue={selectedInvoice.customer_name ?? ""}
                            placeholder="Walk-in customer"
                            onBlur={(e) => {
                              const name = e.target.value.trim();
                              if (name !== (selectedInvoice.customer_name ?? "")) {
                                updateInvoiceCustomerName(selectedInvoice.id, name);
                              }
                            }}
                            className="w-full font-bold text-foreground text-lg bg-transparent outline-none focus:underline decoration-dashed underline-offset-4"
                          />
                        </label>

                        <div className="space-y-2 border-t border-dashed border-kiosk-muted pt-4 mb-4">
                          <p className="text-xs font-semibold text-kiosk-accent uppercase tracking-wide mb-2">Items</p>
                          {selectedInvoice.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">
                                {item.quantity}x {item.product_name}
                                <span className="text-kiosk-accent"> ({item.variant_label})</span>
                              </span>
                              <span className="font-semibold text-foreground">
                                {formatCurrency(item.retail_price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t-2 border-dashed border-kiosk-muted pt-4 space-y-2">
                          <div className="flex items-center justify-between text-sm text-kiosk-accent">
                            <span>Cash Received</span>
                            <span>{formatCurrency(selectedInvoice.cash_received)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-kiosk-accent">
                            <span>Change</span>
                            <span>{formatCurrency(selectedInvoice.change_due)}</span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-kiosk-muted">
                            <span className="font-bold text-foreground">Total</span>
                            <span className="text-2xl font-bold text-kiosk-primary">
                              {formatCurrency(selectedInvoice.subtotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
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
          <div className="space-y-3">
            {newProductVariants.map((row, index) => (
              <div key={row.key} className="rounded-2xl border-2 border-dashed border-kiosk-muted p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-kiosk-accent">
                    {index === 0 ? "Variant" : `Variant ${index + 1}`}
                  </p>
                  {newProductVariants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeNewProductVariantRow(row.key)}
                      className="text-xs font-semibold text-red-600 hover:opacity-80"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={row.label}
                    onChange={(event) => updateNewProductVariantRow(row.key, { label: event.target.value })}
                    className={inputClass}
                    placeholder="Label (e.g. Single)"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.retailPrice}
                    onChange={(event) => updateNewProductVariantRow(row.key, { retailPrice: event.target.value })}
                    className={inputClass}
                    placeholder="Retail Price"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.wholesalePrice}
                    onChange={(event) => updateNewProductVariantRow(row.key, { wholesalePrice: event.target.value })}
                    className={inputClass}
                    placeholder="Wholesale Price (optional)"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.boxPrice}
                    onChange={(event) => updateNewProductVariantRow(row.key, { boxPrice: event.target.value })}
                    className={inputClass}
                    placeholder="Box Price (optional)"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={row.boxQuantity}
                    onChange={(event) => updateNewProductVariantRow(row.key, { boxQuantity: event.target.value })}
                    className={inputClass}
                    placeholder="Pieces per box (optional)"
                  />
                </div>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold text-kiosk-accent">Photo (optional)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      updateNewProductVariantRow(row.key, {
                        imageFile: file,
                        imagePreview: file ? URL.createObjectURL(file) : null,
                      });
                    }}
                    className="w-full text-sm"
                  />
                  {row.imagePreview && (
                    <img
                      src={row.imagePreview}
                      alt="Preview"
                      className="mt-2 h-20 w-20 rounded-xl object-cover border border-kiosk-muted"
                    />
                  )}
                </label>
              </div>
            ))}

            <button
              type="button"
              onClick={addNewProductVariantRow}
              className="w-full h-11 rounded-xl border-2 border-dashed border-kiosk-muted text-kiosk-primary font-bold text-sm transition hover:bg-kiosk-lighter"
            >
              + Add Another Variant
            </button>
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
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-kiosk-accent">Retail Price</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={variant.retail_price}
                      onBlur={(event) => {
                        const price = Number(event.target.value);
                        if (!Number.isNaN(price) && price !== variant.retail_price) updateVariant(variant.id, { retail_price: price });
                      }}
                      className="w-20 rounded-lg border border-kiosk-muted bg-white px-2 py-1.5 text-sm outline-none focus:border-kiosk-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-kiosk-accent">Wholesale</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={variant.wholesale_price ?? ""}
                      placeholder="—"
                      onBlur={(event) => {
                        const value = event.target.value.trim();
                        const wholesalePrice = value === "" ? null : Number(value);
                        if (wholesalePrice === null || !Number.isNaN(wholesalePrice)) {
                          if (wholesalePrice !== (variant.wholesale_price ?? null)) {
                            updateVariant(variant.id, { wholesale_price: wholesalePrice });
                          }
                        }
                      }}
                      className="w-20 rounded-lg border border-kiosk-muted bg-white px-2 py-1.5 text-sm outline-none focus:border-kiosk-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-kiosk-accent">Box Price</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={variant.box_price ?? ""}
                      placeholder="—"
                      onBlur={(event) => {
                        const value = event.target.value.trim();
                        const boxPrice = value === "" ? null : Number(value);
                        if (boxPrice === null || !Number.isNaN(boxPrice)) {
                          if (boxPrice !== (variant.box_price ?? null)) {
                            updateVariant(variant.id, { box_price: boxPrice });
                          }
                        }
                      }}
                      className="w-20 rounded-lg border border-kiosk-muted bg-white px-2 py-1.5 text-sm outline-none focus:border-kiosk-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-kiosk-accent">Pcs/Box</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      defaultValue={variant.box_quantity ?? ""}
                      placeholder="—"
                      onBlur={(event) => {
                        const value = event.target.value.trim();
                        const boxQuantity = value === "" ? null : Number(value);
                        if (boxQuantity === null || !Number.isNaN(boxQuantity)) {
                          if (boxQuantity !== (variant.box_quantity ?? null)) {
                            updateVariant(variant.id, { box_quantity: boxQuantity });
                          }
                        }
                      }}
                      className="w-20 rounded-lg border border-kiosk-muted bg-white px-2 py-1.5 text-sm outline-none focus:border-kiosk-primary"
                    />
                  </div>
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
                    className="ml-auto rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-200"
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
                key={newVariantImageInputKey}
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