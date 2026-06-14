"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { apiRequest } from "@/lib/api";
import { normalizeNullableText } from "@/lib/auth";

type CustomerMeasurement = {
  id: string;
  heightCm: number | null;
  weightKg: number | null;
  bustCm: number | null;
  waistCm: number | null;
  hipCm: number | null;
  usualSize: string | null;
  createdAt: string;
};

type MeasurementsFormState = {
  heightCm: string;
  weightKg: string;
  bustCm: string;
  waistCm: string;
  hipCm: string;
  usualSize: string;
};

function createEmptyForm(): MeasurementsFormState {
  return {
    heightCm: "",
    weightKg: "",
    bustCm: "",
    waistCm: "",
    hipCm: "",
    usualSize: "",
  };
}

function toInputValue(value: number | null) {
  return value === null ? "" : String(value);
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toFormState(data: CustomerMeasurement): MeasurementsFormState {
  return {
    heightCm: toInputValue(data.heightCm),
    weightKg: toInputValue(data.weightKg),
    bustCm: toInputValue(data.bustCm),
    waistCm: toInputValue(data.waistCm),
    hipCm: toInputValue(data.hipCm),
    usualSize: data.usualSize ?? "",
  };
}

export default function CustomerMeasurementsPage() {
  const { status } = useAuth();
  const [form, setForm] = useState<MeasurementsFormState>(() => createEmptyForm());
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const lastSavedLabel = useMemo(() => (lastSavedAt ? new Date(lastSavedAt).toLocaleString() : null), [lastSavedAt]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      const result = await apiRequest<CustomerMeasurement | null>("/users/me/measurements");
      if (cancelled) {
        return;
      }

      if (!result.success) {
        setError(result.message ?? "Could not load saved measurements.");
        setLoading(false);
        return;
      }

      if (result.data) {
        setForm(toFormState(result.data));
        setLastSavedAt(result.data.createdAt);
      } else {
        setForm(createEmptyForm());
        setLastSavedAt(null);
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const payload = Object.fromEntries(
      Object.entries({
        heightCm: parseOptionalNumber(form.heightCm),
        weightKg: parseOptionalNumber(form.weightKg),
        bustCm: parseOptionalNumber(form.bustCm),
        waistCm: parseOptionalNumber(form.waistCm),
        hipCm: parseOptionalNumber(form.hipCm),
        usualSize: normalizeNullableText(form.usualSize) ?? undefined,
      }).filter(([, value]) => value !== undefined),
    );

    if (Object.keys(payload).length === 0) {
      setError("Enter at least one measurement before saving.");
      return;
    }

    setSaving(true);
    try {
      const result = await apiRequest<CustomerMeasurement>("/users/me/measurements", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (!result.success || !result.data) {
        setError(result.message ?? "Could not save measurements.");
        return;
      }

      setForm(toFormState(result.data));
      setLastSavedAt(result.data.createdAt);
      setMessage("Measurements saved successfully.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-ink">Measurements</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Save the latest measurements the rental team should use when preparing suitable garments.
        </p>
        {loading ? <p className="mt-6 text-sm text-slate-600">Loading saved measurements...</p> : null}
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Height (cm)
            <input
              className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              type="number"
              step="0.01"
              min="0"
              value={form.heightCm}
              onChange={(event) => setForm((current) => ({ ...current, heightCm: event.target.value }))}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Weight (kg)
            <input
              className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              type="number"
              step="0.01"
              min="0"
              value={form.weightKg}
              onChange={(event) => setForm((current) => ({ ...current, weightKg: event.target.value }))}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Bust (cm)
            <input
              className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              type="number"
              step="0.01"
              min="0"
              value={form.bustCm}
              onChange={(event) => setForm((current) => ({ ...current, bustCm: event.target.value }))}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Waist (cm)
            <input
              className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              type="number"
              step="0.01"
              min="0"
              value={form.waistCm}
              onChange={(event) => setForm((current) => ({ ...current, waistCm: event.target.value }))}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Hip (cm)
            <input
              className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              type="number"
              step="0.01"
              min="0"
              value={form.hipCm}
              onChange={(event) => setForm((current) => ({ ...current, hipCm: event.target.value }))}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Usual size
            <input
              className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={form.usualSize}
              onChange={(event) => setForm((current) => ({ ...current, usualSize: event.target.value }))}
              placeholder="S, M, L, XL"
            />
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
              {saving ? "Saving..." : "Save measurements"}
            </button>
          </div>
        </form>
      </section>

      <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-ink">Latest saved record</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {lastSavedLabel ? `Last updated at ${lastSavedLabel}.` : "No measurements have been saved yet."}
        </p>
      </aside>
    </div>
  );
}
