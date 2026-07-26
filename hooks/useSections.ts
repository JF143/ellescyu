import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { deleteProductImage } from "@/lib/uploadImage";
import type { Section } from "@/types";

export function useSections() {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("sections")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch sections");
      console.error("Error fetching sections:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const addSection = useCallback(async (name: string, icon?: string) => {
    try {
      const newSection: Section = { id: uuidv4(), name, icon };
      const { error } = await supabase.from("sections").insert(newSection);

      if (error) throw error;
      await fetchSections();
      return newSection;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add section");
      console.error("Error adding section:", err);
      throw err;
    }
  }, [fetchSections]);

  const updateSection = useCallback(
    async (id: string, updates: Partial<Pick<Section, "name" | "icon">>) => {
      try {
        const { error } = await supabase
          .from("sections")
          .update(updates)
          .eq("id", id);

        if (error) throw error;
        await fetchSections();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update section");
        console.error("Error updating section:", err);
        throw err;
      }
    },
    [fetchSections],
  );

  const deleteSection = useCallback(
    async (id: string) => {
      try {
        // sections -> products -> variants are both CASCADE, so deleting a
        // section wipes out every product and variant underneath it. Collect
        // every image_url two levels deep before that happens, since we
        // can't look any of it up afterward.
        const { data: productRows, error: productsFetchError } = await supabase
          .from("products")
          .select("id, image_url")
          .eq("section_id", id);

        if (productsFetchError) throw productsFetchError;

        const productIds = (productRows ?? []).map((row) => row.id);

        let variantImageUrls: (string | null | undefined)[] = [];
        if (productIds.length > 0) {
          const { data: variantRows, error: variantsFetchError } = await supabase
            .from("variants")
            .select("image_url")
            .in("product_id", productIds);

          if (variantsFetchError) throw variantsFetchError;
          variantImageUrls = (variantRows ?? []).map((row) => row.image_url);
        }

        const { error } = await supabase.from("sections").delete().eq("id", id);

        if (error) throw error;

        const allImageUrls = [
          ...(productRows ?? []).map((row) => row.image_url),
          ...variantImageUrls,
        ];
        await Promise.all(allImageUrls.map((url) => deleteProductImage(url)));

        await fetchSections();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete section");
        console.error("Error deleting section:", err);
        throw err;
      }
    },
    [fetchSections],
  );

  return {
    sections,
    isLoading,
    error,
    isReady: !isLoading && !error,
    fetchSections,
    addSection,
    updateSection,
    deleteSection,
  };
}