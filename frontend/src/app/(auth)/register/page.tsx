"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { apiRequest } from "@/lib/api";
import { resolveDashboardPath } from "@/lib/auth";

type RegisterResult = {
  id: string;
  email: string;
  role: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { session, status } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace(resolveDashboardPath(session.user.role));
    }
  }, [router, session, status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await apiRequest<RegisterResult>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ fullName, email, password }),
      });

      if (!result.success) {
        setError(result.message ?? "Registration failed");
        return;
      }

      router.push(`/login?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold text-ink">Register</h1>
      <p className="mt-2 text-sm text-slate-600">Create a customer account through the backend API.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm" suppressHydrationWarning>
        <label className="block text-sm font-medium text-slate-700">
          Full name
          <input suppressHydrationWarning
            className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input suppressHydrationWarning
            className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input suppressHydrationWarning
            className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            type="password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button suppressHydrationWarning
          className="focus-ring w-full rounded-md bg-lotus px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already have an account? <Link className="font-medium text-lotus" href="/login">Login</Link>
      </p>
    </div>
  );
}
