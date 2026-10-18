import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { hashPassword } from "@/lib/auth";
import type { Cashier } from "@/types";

export function useCashiers() {
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCashiers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("cashiers")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      setCashiers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch cashiers");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCashiers();
  }, [fetchCashiers]);

  const addCashier = useCallback(
    async (username: string, password: string, displayName: string) => {
      const password_hash = await hashPassword(password);
      const cashier: Cashier = {
        id: uuidv4(),
        username: username.trim().toLowerCase(),
        password_hash,
        display_name: displayName.trim(),
      };
      const { error } = await supabase.from("cashiers").insert(cashier);
      if (error) throw error;
      await fetchCashiers();
      return cashier;
    },
    [fetchCashiers],
  );

  const updateCashier = useCallback(
    async (id: string, updates: { display_name?: string; password?: string }) => {
      const payload: Partial<Pick<Cashier, "display_name" | "password_hash">> = {};
      if (updates.display_name !== undefined) payload.display_name = updates.display_name.trim();
      if (updates.password) payload.password_hash = await hashPassword(updates.password);
      const { error } = await supabase.from("cashiers").update(payload).eq("id", id);
      if (error) throw error;
      await fetchCashiers();
    },
    [fetchCashiers],
  );

  const deleteCashier = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("cashiers").delete().eq("id", id);
      if (error) throw error;
      await fetchCashiers();
    },
    [fetchCashiers],
  );

  return { cashiers, isLoading, error, fetchCashiers, addCashier, updateCashier, deleteCashier };
}