import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { deleteProductImage } from "@/lib/uploadImage";
import type { Variant } from "@/types";

export function useVariants() {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVariants = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("variants")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setVariants(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch variants");
      console.error("Error fetching variants:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const addVariant = useCallback(
    async (
      productId: string,
      label: string,
      price: number,
      imageUrl?: string,
      wholesalePrice?: number | null,
      boxQuantity?: number | null,
      boxPrice?: number | null,
    ) => {
      try {
        const variant: Variant = {
          id: uuidv4(),
          product_id: productId,
          label,
          retail_price: price,
          wholesale_price: wholesalePrice ?? null,
          box_quantity: boxQuantity ?? null,
          box_price: boxPrice ?? null,
          image_url: imageUrl || null,
        };
        const { error } = await supabase.from("variants").insert(variant);

        if (error) throw error;
        await fetchVariants();
        return variant;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add variant");
        console.error("Error adding variant:", err);
        throw err;
      }
    },
    [fetchVariants],
  );

  const updateVariant = useCallback(
  async (id: string, updates: Partial<Pick<Variant, "label" | "retail_price" | "wholesale_price" | "box_quantity" | "box_price" | "image_url">>) => {
      try {
        const { error } = await supabase
          .from("variants")
          .update(updates)
          .eq("id", id);

        if (error) throw error;
        await fetchVariants();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update variant");
        console.error("Error updating variant:", err);
        throw err;
      }
    },
    [fetchVariants],
  );

  const deleteVariant = useCallback(
    async (id: string) => {
      try {
        // Best-effort lookup — if this fails for any reason, we still want
        // the actual delete below to go through; image cleanup is secondary.
        let imageUrl: string | null | undefined = undefined;
        try {
          const { data: existing } = await supabase
            .from("variants")
            .select("image_url")
            .eq("id", id)
            .maybeSingle();
          imageUrl = existing?.image_url;
        } catch (lookupErr) {
          console.error("Could not look up variant image before delete:", lookupErr);
        }

        const { error } = await supabase.from("variants").delete().eq("id", id);

        if (error) throw error;

        await deleteProductImage(imageUrl);
        await fetchVariants();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete variant");
        console.error("Error deleting variant:", err);
        throw err;
      }
    },
    [fetchVariants],
  );

  return {
    variants,
    isLoading,
    error,
    isReady: !isLoading && !error,
    fetchVariants,
    addVariant,
    updateVariant,
    deleteVariant,
  };
}