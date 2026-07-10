import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
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
        const { error } = await supabase.from("sections").delete().eq("id", id);

        if (error) throw error;
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
    addSection,
    updateSection,
    deleteSection,
  };
}

