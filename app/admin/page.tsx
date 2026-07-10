"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useSections } from "@/hooks/useSections";
import { useVariants } from "@/hooks/useVariants";
import { formatCurrency } from "@/lib/formatCurrency";

type VariantRow = { label: string; price: string };

const emptyVariantRow = (): VariantRow => ({ label: "", price: "" });

export default function AdminPage() {
  const { sections, addSection, updateSection, deleteSection } = useSections();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { variants, addVariant, updateVariant, deleteVariant } = useVariants();

  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionIcon, setNewSectionIcon] = useState("");

  const [productSectionId, setProductSectionId] = useState("");
  const [productName, setProductName] = useState("");
  const [productVariants, setProductVariants] = useState<VariantRow[]>([
    emptyVariantRow(),
  ]);

  const [existingSectionId, setExistingSectionId] = useState("");
  const [existingProductId, setExistingProductId] = useState("");
  const [existingVariantLabel, setExistingVariantLabel] = useState("");
  const [existingVariantPrice, setExistingVariantPrice] = useState("");

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
    } catch (error) {
      console.error("Failed to add section:", error);
    }
  };

  const handleAddProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!productSectionId || !productName.trim()) return;

    const rows = productVariants
      .filter((row) => row.label.trim() && row.price.trim())
      .map((row) => ({ label: row.label.trim(), price: Number(row.price) }))
      .filter((row) => !Number.isNaN(row.price) && row.price >= 0);

    if (rows.length === 0) return;

    try {
      await addProduct(productSectionId, productName.trim(), rows);
      setProductName("");
      setProductVariants([emptyVariantRow()]);
    } catch (error) {
      console.error("Failed to add product:", error);
    }
  };

  const handleAddExistingVariant = async (event: React.FormEvent) => {
    event.preventDefault();
    const price = Number(existingVariantPrice);
    if (!existingProductId || !existingVariantLabel.trim() || Number.isNaN(price)) return;

    try {
      await addVariant(existingProductId, existingVariantLabel.trim(), price);
      setExistingVariantLabel("");
      setExistingVariantPrice("");
    } catch (error) {
      console.error("Failed to add variant:", error);
    }
  };

  return (
    <div className="min-h-screen bg-kiosk-lighter">
      <header className="border-b border-kiosk-muted bg-white px-8 py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-kiosk-primary">Admin</h1>
            <p className="mt-1 text-lg text-gray-600">Manage menu sections, products, and variants</p>
          </div>
          <Link
            href="/"
            className="rounded-2xl bg-kiosk-muted px-6 py-4 text-lg font-bold text-kiosk-primary transition hover:bg-kiosk-accent hover:text-white"
          >
            ← Back to Kiosk
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-8 py-10 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 shadow-md">
          <h2 className="mb-6 text-2xl font-bold text-kiosk-primary">Add New Section</h2>
          <form onSubmit={handleAddSection} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-lg font-medium text-gray-700">Section name</span>
              <input
                value={newSectionName}
                onChange={(event) => setNewSectionName(event.target.value)}
                className="w-full rounded-xl border-2 border-kiosk-muted px-4 py-3 text-lg outline-none focus:border-kiosk-accent"
                placeholder="e.g. Snacks"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-lg font-medium text-gray-700">Icon (optional)</span>
              <input
                value={newSectionIcon}
                onChange={(event) => setNewSectionIcon(event.target.value)}
                className="w-full rounded-xl border-2 border-kiosk-muted px-4 py-3 text-lg outline-none focus:border-kiosk-accent"
                placeholder="e.g. 🍿"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-2xl bg-kiosk-primary py-4 text-lg font-bold text-white transition hover:bg-kiosk-accent"
            >
              Add Section
            </button>
          </form>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-md">
          <h2 className="mb-6 text-2xl font-bold text-kiosk-primary">Add New Product</h2>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-lg font-medium text-gray-700">Section</span>
              <select
                value={productSectionId}
                onChange={(event) => setProductSectionId(event.target.value)}
                className="w-full rounded-xl border-2 border-kiosk-muted px-4 py-3 text-lg outline-none focus:border-kiosk-accent"
              >
                <option value="">Select section</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-lg font-medium text-gray-700">Product name</span>
              <input
                value={productName}
                onChange={(event) => setProductName(event.target.value)}
                className="w-full rounded-xl border-2 border-kiosk-muted px-4 py-3 text-lg outline-none focus:border-kiosk-accent"
                placeholder="e.g. Nescafe Creamy White"
              />
            </label>

            <div className="space-y-3">
              <p className="text-lg font-medium text-gray-700">Variants</p>
              {productVariants.map((row, index) => (
                <div key={index} className="grid grid-cols-2 gap-3">
                  <input
                    value={row.label}
                    onChange={(event) => {
                      const next = [...productVariants];
                      next[index] = { ...next[index], label: event.target.value };
                      setProductVariants(next);
                    }}
                    className="rounded-xl border-2 border-kiosk-muted px-4 py-3 text-lg outline-none focus:border-kiosk-accent"
                    placeholder="Label (e.g. Single)"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.price}
                    onChange={(event) => {
                      const next = [...productVariants];
                      next[index] = { ...next[index], price: event.target.value };
                      setProductVariants(next);
                    }}
                    className="rounded-xl border-2 border-kiosk-muted px-4 py-3 text-lg outline-none focus:border-kiosk-accent"
                    placeholder="Price"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setProductVariants((prev) => [...prev, emptyVariantRow()])}
                className="rounded-xl bg-kiosk-muted px-4 py-3 text-lg font-semibold text-kiosk-primary transition hover:bg-kiosk-light"
              >
                + Add another variant
              </button>
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-kiosk-primary py-4 text-lg font-bold text-white transition hover:bg-kiosk-accent"
            >
              Save Product
            </button>
          </form>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-md">
          <h2 className="mb-6 text-2xl font-bold text-kiosk-primary">Add Variant to Existing Product</h2>
          <form onSubmit={handleAddExistingVariant} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-lg font-medium text-gray-700">Section</span>
              <select
                value={existingSectionId}
                onChange={(event) => {
                  setExistingSectionId(event.target.value);
                  setExistingProductId("");
                }}
                className="w-full rounded-xl border-2 border-kiosk-muted px-4 py-3 text-lg outline-none focus:border-kiosk-accent"
              >
                <option value="">Select section</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-lg font-medium text-gray-700">Product</span>
              <select
                value={existingProductId}
                onChange={(event) => setExistingProductId(event.target.value)}
                className="w-full rounded-xl border-2 border-kiosk-muted px-4 py-3 text-lg outline-none focus:border-kiosk-accent"
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
                className="rounded-xl border-2 border-kiosk-muted px-4 py-3 text-lg outline-none focus:border-kiosk-accent"
                placeholder="Variant label"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={existingVariantPrice}
                onChange={(event) => setExistingVariantPrice(event.target.value)}
                className="rounded-xl border-2 border-kiosk-muted px-4 py-3 text-lg outline-none focus:border-kiosk-accent"
                placeholder="Price"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-2xl bg-kiosk-primary py-4 text-lg font-bold text-white transition hover:bg-kiosk-accent"
            >
              Add Variant
            </button>
          </form>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-md lg:col-span-2">
          <h2 className="mb-6 text-2xl font-bold text-kiosk-primary">Manage Menu</h2>

          <div className="space-y-8">
            {sections.map((section) => {
              const sectionProducts = products.filter((product) => product.section_id === section.id);

              return (
                <div key={section.id} className="rounded-2xl border border-kiosk-muted bg-kiosk-lighter p-5">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <input
                      defaultValue={section.name}
                      onBlur={async (event) => {
                        const name = event.target.value.trim();
                        if (name && name !== section.name) {
                          try {
                            await updateSection(section.id, { name });
                          } catch (error) {
                            console.error("Failed to update section:", error);
                          }
                        }
                      }}
                      className="flex-1 rounded-xl border-2 border-white bg-white px-4 py-3 text-xl font-bold text-kiosk-primary outline-none focus:border-kiosk-accent"
                    />
                    <input
                      defaultValue={section.icon ?? ""}
                      onBlur={async (event) => {
                        const icon = event.target.value.trim();
                        if (icon !== (section.icon ?? "")) {
                          try {
                            await updateSection(section.id, { icon: icon || undefined });
                          } catch (error) {
                            console.error("Failed to update section:", error);
                          }
                        }
                      }}
                      className="w-24 rounded-xl border-2 border-white bg-white px-4 py-3 text-center text-xl outline-none focus:border-kiosk-accent"
                      placeholder="Icon"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm(`Delete section "${section.name}" and all its products?`)) {
                          try {
                            await deleteSection(section.id);
                          } catch (error) {
                            console.error("Failed to delete section:", error);
                          }
                        }
                      }}
                      className="rounded-xl bg-red-100 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-200"
                    >
                      Delete Section
                    </button>
                  </div>

                  {sectionProducts.length === 0 ? (
                    <p className="text-gray-500">No products in this section.</p>
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
                              <button
                                type="button"
                                onClick={async () => {
                                  if (
                                    window.confirm(`Delete product "${product.name}" and all variants?`)
                                  ) {
                                    try {
                                      await deleteProduct(product.id);
                                    } catch (error) {
                                      console.error("Failed to delete product:", error);
                                    }
                                  }
                                }}
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
                                  <span className="font-semibold text-kiosk-accent">
                                    {formatCurrency(variant.price)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => deleteVariant(variant.id)}
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
    </div>
  );
}
