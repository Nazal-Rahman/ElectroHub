"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import SiteNav from "@/components/site/SiteNav";
import GlassCard from "@/components/ui/GlassCard";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/admin";

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error?.message ?? "Login failed");
        toast.error(data?.error?.message ?? "Login failed");
        return;
      }
      toast.success("Welcome back");
      router.push(nextPath);
    } catch {
      setError("Login failed");
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <SiteNav />
      <main className="mx-auto w-full max-w-md px-5 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Admin Login</h1>
          <p className="mt-1 text-sm text-muted-2">Protected access to upload projects.</p>
        </div>

        <GlassCard className="p-5">
          <form onSubmit={onSubmit}>
            <label className="block text-xs font-medium text-white/70" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/90 outline-none focus:border-white/20"
              autoComplete="current-password"
              required
            />

            {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </GlassCard>
      </main>
    </div>
  );
}

