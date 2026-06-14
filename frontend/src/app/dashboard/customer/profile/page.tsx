"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { apiRequest } from "@/lib/api";
import { normalizeNullableText, type AuthenticatedUser } from "@/lib/auth";

export default function CustomerProfilePage() {
  const { replaceUser, user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(user?.fullName ?? "");
    setPhone(user?.phone ?? "");
  }, [user?.fullName, user?.phone]);

  if (!user) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    try {
      const result = await apiRequest<AuthenticatedUser>("/users/me/profile", {
        method: "PATCH",
        body: JSON.stringify({
          fullName: normalizeNullableText(fullName),
          phone: normalizeNullableText(phone),
        }),
      });

      if (!result.success || !result.data) {
        setError(result.message ?? "Could not update your profile.");
        return;
      }

      replaceUser(result.data);
      setMessage("Profile updated successfully.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-ink">Profile details</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Keep your name and phone number up to date so booking confirmations and delivery calls reach the right person.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Full name
            <input
              className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Nguyen Van A"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Phone number
            <input
              className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="0909000000"
            />
          </label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          {message ? <p className="text-sm text-jade">{message}</p> : null}
          <button
            type="submit"
            disabled={saving}
            className="focus-ring rounded-md bg-ink px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save profile"}
          </button>
        </form>
      </section>

      <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-ink">Account summary</h2>
        <dl className="mt-4 space-y-3 text-sm text-slate-600">
          <div>
            <dt className="font-medium text-slate-500">Email</dt>
            <dd className="mt-1 text-ink">{user.email}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Current full name</dt>
            <dd className="mt-1 text-ink">{user.fullName ?? "Not updated"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Current phone</dt>
            <dd className="mt-1 text-ink">{user.phone ?? "Not updated"}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
