"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import { verifyPassword } from "@/lib/auth";
import { useCashierSession } from "@/hooks/useCashierSession";

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useCashierSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError("Enter your username and password");
      return;
    }
    setIsSubmitting(true);
    try {
      const { data: cashier, error: fetchError } = await supabase
        .from("cashiers")
        .select("*")
        .eq("username", username.trim().toLowerCase())
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!cashier) {
        setError("Invalid username or password");
        setIsSubmitting(false);
        return;
      }

      const isValid = await verifyPassword(password, cashier.password_hash);
      if (!isValid) {
        setError("Invalid username or password");
        setIsSubmitting(false);
        return;
      }

      const shiftId = uuidv4();
      const { error: shiftError } = await supabase.from("shifts").insert({
        id: shiftId,
        cashier_id: cashier.id,
        cashier_name: cashier.display_name,
        login_at: new Date().toISOString(),
        logout_at: null,
      });
      if (shiftError) throw shiftError;

      setSession({
        cashierId: cashier.id,
        username: cashier.username,
        displayName: cashier.display_name,
        shiftId,
      });

      router.push("/");
    } catch (err) {
      console.error("Login failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-kiosk-lighter px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-[24px] bg-white p-8 card-shadow-xl">
        <h1 className="mb-1 text-3xl font-bold text-kiosk-primary">Ellescyu&apos;s Kiosk</h1>
        <p className="mb-6 text-sm text-gray-500">Sign in to start your shift</p>

        <label className="mb-4 block">
          <span className="mb-1.5 block text-xs font-semibold text-gray-600 uppercase tracking-wide">Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            className="w-full rounded-[12px] border border-kiosk-muted bg-white px-4 py-3 text-base outline-none focus:border-kiosk-primary transition"
          />
        </label>

        <label className="mb-6 block">
          <span className="mb-1.5 block text-xs font-semibold text-gray-600 uppercase tracking-wide">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-[12px] border border-kiosk-muted bg-white px-4 py-3 text-base outline-none focus:border-kiosk-primary transition"
          />
        </label>

        {error && (
          <p className="mb-4 rounded-[12px] bg-red-50 px-4 py-2.5 text-center text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-[14px] bg-kiosk-primary py-4 text-lg font-bold text-white card-shadow-lg smooth-transition tap-scale disabled:opacity-50"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}