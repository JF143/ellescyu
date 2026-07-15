import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import type { Brand } from "@/types";

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setBrands(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch brands");
      console.error("Error fetching brands:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const addBrand = useCallback(
    async (name: string) => {
      try {
        const brand: Brand = { id: uuidv4(), name: name.trim() };
        const { error } = await supabase.from("brands").insert(brand);
        if (error) throw error;
        await fetchBrands();
        return brand;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add brand");
        console.error("Error adding brand:", err);
        throw err;
      }
    },
    [fetchBrands],
  );

  const updateBrand = useCallback(
    async (id: string, name: string) => {
      try {
        const { error } = await supabase
          .from("brands")
          .update({ name: name.trim() })
          .eq("id", id);
        if (error) throw error;
        await fetchBrands();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update brand");
        console.error("Error updating brand:", err);
        throw err;
      }
    },
    [fetchBrands],
  );

  const deleteBrand = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase.from("brands").delete().eq("id", id);
        if (error) throw error;
        await fetchBrands();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete brand");
        console.error("Error deleting brand:", err);
        throw err;
      }
    },
    [fetchBrands],
  );

  return {
    brands,
    isLoading,
    error,
    isReady: !isLoading && !error,
    fetchBrands,
    addBrand,
    updateBrand,
    deleteBrand,
  };
}