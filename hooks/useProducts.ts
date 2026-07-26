import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { deleteProductImage } from "@/lib/uploadImage";
import type { Product } from "@/types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
      console.error("Error fetching products:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = useCallback(
    async (
      sectionId: string,
      name: string,
      variantRows: Array<{ label: string; price: number; image_url?: string }>,
      brandId?: string,
    ) => {
      try {
        const product: Product = {
          id: uuidv4(),
          section_id: sectionId,
          name,
          brand_id: brandId || null,
        };
        const { error: productError } = await supabase
          .from("products")
          .insert(product);

        if (productError) throw productError;

        const newVariants = variantRows.map((row) => ({
          id: uuidv4(),
          product_id: product.id,
          label: row.label,
          price: row.price,
          image_url: row.image_url || null,
        }));

        const { error: variantsError } = await supabase
          .from("variants")
          .insert(newVariants);

        if (variantsError) throw variantsError;

        await fetchProducts();
        return product;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add product");
        console.error("Error adding product:", err);
        throw err;
      }
    },
    [fetchProducts],
  );

  const updateProduct = useCallback(
    async (id: string, updates: Partial<Pick<Product, "name" | "section_id" | "brand_id" | "image_url">>) => {
      try {
        const { error } = await supabase
          .from("products")
          .update(updates)
          .eq("id", id);

        if (error) throw error;
        await fetchProducts();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update product");
        console.error("Error updating product:", err);
        throw err;
      }
    },
    [fetchProducts],
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      try {
        // Gather this product's own image plus every variant's image before
        // the delete cascades, since we won't be able to look them up after.
        const [{ data: productRow, error: productFetchError }, { data: variantRows, error: variantsFetchError }] =
          await Promise.all([
            supabase.from("products").select("image_url").eq("id", id).single(),
            supabase.from("variants").select("image_url").eq("product_id", id),
          ]);

        if (productFetchError) throw productFetchError;
        if (variantsFetchError) throw variantsFetchError;

        const { error } = await supabase.from("products").delete().eq("id", id);

        if (error) throw error;

        const imageUrls = [
          productRow?.image_url,
          ...(variantRows ?? []).map((row) => row.image_url),
        ];
        await Promise.all(imageUrls.map((url) => deleteProductImage(url)));

        await fetchProducts();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete product");
        console.error("Error deleting product:", err);
        throw err;
      }
    },
    [fetchProducts],
  );

  return {
    products,
    isLoading,
    error,
    isReady: !isLoading && !error,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}