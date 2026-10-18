import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Shift } from "@/types";

export function useShifts() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShifts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("shifts")
        .select("*")
        .order("login_at", { ascending: false });
      if (error) throw error;
      setShifts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch shifts");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  return { shifts, isLoading, error, fetchShifts };
}