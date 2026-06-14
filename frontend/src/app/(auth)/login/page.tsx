"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { apiRequest } from "@/lib/api";
import { resolveDashboardPath, toAuthenticatedUser, type AppRole } from "@/lib/auth";

type LoginResult = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: AppRole;
  };
};

function getSafeRedirectPath(value: string | null, fallbackPath: string) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : fallbackPath;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, signIn, status } = useAuth();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace(getSafeRedirectPath(searchParams.get("next"), resolveDashboardPath(session.user.role)));
    }
  }, [router, searchParams, session, status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const result = await apiRequest<LoginResult>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      if (!result.success || !result.data) {
        setError(result.message ?? "Login failed");
        return;
      }

      signIn({ accessToken: result.data.accessToken, user: toAuthenticatedUser(result.data.user) });
      router.push(getSafeRedirectPath(searchParams.get("next"), resolveDashboardPath(result.data.user.role)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold text-ink">Login</h1>
      <p className="mt-2 text-sm text-slate-600">Sign in through the Node.js backend API.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          className="focus-ring w-full rounded-md bg-ink px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        No account yet? <Link className="font-medium text-lotus" href="/register">Register</Link>
      </p>
    </div>
  );
}
