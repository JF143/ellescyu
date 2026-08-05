import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Invoice, InvoiceItem } from "@/types";

type NewInvoiceInput = {
  customerName?: string | null;
  items: InvoiceItem[];
  itemCount: number;
  subtotal: number;
  cashReceived: number;
  changeDue: number;
};

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch invoices");
      console.error("Error fetching invoices:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const addInvoice = useCallback(async (input: NewInvoiceInput) => {
    const { error } = await supabase.from("invoices").insert({
      customer_name: input.customerName?.trim() || null,
      items: input.items,
      item_count: input.itemCount,
      subtotal: input.subtotal,
      cash_received: input.cashReceived,
      change_due: input.changeDue,
    });

    if (error) throw error;
  }, []);

  const updateInvoiceCustomerName = useCallback(async (id: string, customerName: string) => {
    const { error } = await supabase
      .from("invoices")
      .update({ customer_name: customerName.trim() || null })
      .eq("id", id);

    if (error) throw error;
    await fetchInvoices();
  }, [fetchInvoices]);

  return {
    invoices,
    isLoading,
    error,
    fetchInvoices,
    addInvoice,
    updateInvoiceCustomerName,
  };
}