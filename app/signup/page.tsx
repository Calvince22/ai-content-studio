"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, router, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to create an account.");
      }

      router.replace("/");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to create an account.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#111827,_#020617_60%)] px-4 text-slate-100">
      <div className="w-full max-w-md rounded-[28px] border border-slate-800 bg-slate-950/90 p-8 shadow-2xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">AI Content Studio</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Create your account</h1>
        <p className="mt-2 text-sm text-slate-300">
          Sign up to generate content, save history, and manage your account securely.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm text-slate-200">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="block text-sm text-slate-200">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400"
              placeholder="At least 8 characters"
              required
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-300">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-cyan-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
