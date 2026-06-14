"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { apiRequest } from "@/lib/api";
import { normalizeNullableText } from "@/lib/auth";

type CustomerAddress = {
  id: string;
  receiverName: string;
  phone: string;
  line1: string;
  ward: string | null;
  district: string | null;
  city: string | null;
  isDefault: boolean;
  createdAt: string;
};

type AddressFormState = {
  receiverName: string;
  phone: string;
  line1: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
};

function createEmptyForm(): AddressFormState {
  return {
    receiverName: "",
    phone: "",
    line1: "",
    ward: "",
    district: "",
    city: "",
    isDefault: false,
  };
}

const createdAtFormatter = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });

export default function CustomerAddressesPage() {
  const { status } = useAuth();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [form, setForm] = useState<AddressFormState>(() => createEmptyForm());
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await apiRequest<CustomerAddress[]>("/users/me/addresses");
    if (!result.success) {
      setError(result.message ?? "Could not load your address book.");
      setLoading(false);
      return;
    }

    setAddresses(result.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    void loadAddresses();
  }, [loadAddresses, status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    try {
      const result = await apiRequest<CustomerAddress>("/users/me/addresses", {
        method: "POST",
        body: JSON.stringify({
          receiverName: form.receiverName.trim(),
          phone: form.phone.trim(),
          line1: form.line1.trim(),
          ward: normalizeNullableText(form.ward),
          district: normalizeNullableText(form.district),
          city: normalizeNullableText(form.city),
          isDefault: form.isDefault,
        }),
      });

      if (!result.success || !result.data) {
        setError(result.message ?? "Could not save the address.");
        return;
      }

      setForm(createEmptyForm());
      setMessage("Address saved successfully.");
      await loadAddresses();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-ink">Delivery addresses</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Save delivery details once so future bookings can reuse them. The first address becomes default automatically.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Receiver name
            <input
              className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={form.receiverName}
              onChange={(event) => setForm((current) => ({ ...current, receiverName: event.target.value }))}
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Phone
            <input
              className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              type="tel"
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 md:col-span-2">
            Address line
            <input
              className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={form.line1}
              onChange={(event) => setForm((current) => ({ ...current, line1: event.target.value }))}
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Ward
            <input
              className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={form.ward}
              onChange={(event) => setForm((current) => ({ ...current, ward: event.target.value }))}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            District
            <input
              className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={form.district}
              onChange={(event) => setForm((current) => ({ ...current, district: event.target.value }))}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 md:col-span-2">
            City
            <input
              className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={form.city}
              onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
            />
          </label>
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700 md:col-span-2">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(event) => setForm((current) => ({ ...current, isDefault: event.target.checked }))}
            />
            Set as default address
          </label>
          <div className="md:col-span-2">
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            {message ? <p className="mt-1 text-sm text-jade">{message}</p> : null}
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="focus-ring rounded-md bg-ink px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Add address"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-ink">Address book</h2>
        {loading ? <p className="mt-4 text-sm text-slate-600">Loading addresses...</p> : null}
        {!loading && addresses.length === 0 ? <p className="mt-4 text-sm text-slate-600">No addresses saved yet.</p> : null}
        <div className="mt-4 space-y-4">
          {addresses.map((address) => (
            <article key={address.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-ink">{address.receiverName}</h3>
                  <p className="mt-1 text-sm text-slate-600">{address.phone}</p>
                </div>
                {address.isDefault ? <span className="rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white">Default</span> : null}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {[address.line1, address.ward, address.district, address.city].filter(Boolean).join(", ")}
              </p>
              <p className="mt-3 text-xs text-slate-500">Created {createdAtFormatter.format(new Date(address.createdAt))}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
