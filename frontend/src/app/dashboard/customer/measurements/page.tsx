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
  return { heightCm: "", weightKg: "", bustCm: "", waistCm: "", hipCm: "", usualSize: "" };
}

function toInputValue(value: number | null) {
  return value === null ? "" : String(value);
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
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

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

/* Underline input style shared across all fields */
const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "transparent",
  border: "none",
  borderBottom: "1px solid #e3beb8",
  padding: "0.75rem 0",
  fontFamily: "Manrope, sans-serif",
  fontSize: "16px",
  color: "#261816",
  outline: "none",
  transition: "border-color 0.3s ease",
};

function AtelierInput({
  id,
  label,
  unit,
  value,
  onChange,
  placeholder = "0",
  type = "number",
}: {
  id: string;
  label: string;
  unit?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="mb-1 block text-[13px] font-semibold uppercase tracking-wider" style={{ color: "#5a403c" }}
        htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          step={type === "number" ? "0.01" : undefined}
          min={type === "number" ? "0" : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...inputStyle, borderBottomColor: focused ? "#8B0000" : "#e3beb8", paddingRight: unit ? "2rem" : "0" }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {unit && (
          <span className="absolute right-0 top-3 text-sm" style={{ color: "#5a403c" }}>{unit}</span>
        )}
      </div>
    </div>
  );
}

export default function CustomerMeasurementsPage() {
  const { status } = useAuth();
  const [form, setForm] = useState<MeasurementsFormState>(() => createEmptyForm());
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const lastSavedLabel = useMemo(() => (lastSavedAt ? new Date(lastSavedAt).toLocaleString("vi-VN") : null), [lastSavedAt]);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setMessage(null);

    void (async () => {
      try {
        const result = await apiRequest<CustomerMeasurement | null>("/users/me/measurements");
        if (cancelled) return;
        if (!result.success) {
          setError(result.message ?? "Không thể tải số đo đã lưu.");
          return;
        }
        if (result.data) {
          setForm(toFormState(result.data));
          setLastSavedAt(result.data.createdAt);
        } else {
          setForm(createEmptyForm());
        }
      } catch {
        if (!cancelled) {
          setError("Không thể kết nối đến hệ thống số đo.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
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
      setError("Vui lòng nhập ít nhất một trường số đo trước khi lưu.");
      return;
    }

    setSaving(true);
    try {
      const result = await apiRequest<CustomerMeasurement>("/users/me/measurements", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (!result.success || !result.data) {
        setError(result.message ?? "Không thể lưu số đo.");
        return;
      }

      setForm(toFormState(result.data));
      setLastSavedAt(result.data.createdAt);
      setMessage("Cập nhật số đo thành công.");
    } catch {
      setError("Không thể kết nối đến hệ thống số đo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-medium" style={{ color: "#261816", fontFamily: "EB Garamond, serif" }}>
          Số Đo Cơ Thể
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed" style={{ color: "#5a403c" }}>
          Để áo dài vừa đẹp nhất, hãy cung cấp số đo cơ thể chính xác. Các thợ may của atelier dựa vào những thông tin này để tạo nên trang phục hoàn hảo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">

        {/* Left: Form (8 cols) */}
        <div className="lg:col-span-8">
          <div className="relative overflow-hidden rounded-xl border p-8"
            style={{ backgroundColor: "#ffffff", borderColor: "#f8dcd8", boxShadow: "0 2px 12px rgba(74,4,4,0.04)" }}>
            {/* Decorative */}
            <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-bl-full opacity-40"
              style={{ backgroundColor: "#ffe9e6" }} />

            {loading ? (
              <p className="text-sm" style={{ color: "#5a403c" }}>Đang tải số đo đã lưu...</p>
            ) : (
              <form onSubmit={handleSubmit} className="relative z-10 space-y-10">

                {/* Standard Size */}
                <div>
                  <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold" style={{ color: "#261816", fontFamily: "EB Garamond, serif" }}>
                    <span className="material-symbols-outlined" style={{ color: "#C5A059" }}>accessibility_new</span>
                    Size tiêu chuẩn
                  </h3>
                  <div className="w-full sm:w-1/2">
                    <label className="mb-1 block text-[13px] font-semibold uppercase tracking-wider" style={{ color: "#5a403c" }}
                      htmlFor="usualSize">
                      Size thường dùng
                    </label>
                    <div className="relative">
                      <select
                        id="usualSize"
                        value={form.usualSize}
                        onChange={(e) => setForm((curr) => ({ ...curr, usualSize: e.target.value }))}
                        className="w-full appearance-none bg-transparent py-3 pr-8 text-base"
                        style={{
                          border: "none",
                          borderBottom: "1px solid #e3beb8",
                          outline: "none",
                          color: form.usualSize ? "#261816" : "#8e706b",
                          fontFamily: "Manrope, sans-serif",
                        }}
                      >
                        <option value="">Chọn size (S, M, L...)</option>
                        {SIZES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined pointer-events-none absolute right-0 top-2 text-[20px]"
                        style={{ color: "#8e706b" }}>expand_more</span>
                    </div>
                  </div>
                </div>

                <hr style={{ borderColor: "#e3beb8", opacity: 0.5 }} />

                {/* Core Measurements */}
                <div>
                  <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold" style={{ color: "#261816", fontFamily: "EB Garamond, serif" }}>
                    <span className="material-symbols-outlined" style={{ color: "#C5A059" }}>straighten</span>
                    Số đo cơ bản
                  </h3>
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                    <AtelierInput id="heightCm" label="Chiều cao (cm)" unit="cm" value={form.heightCm}
                      onChange={(v) => setForm((c) => ({ ...c, heightCm: v }))} placeholder="e.g. 165" />
                    <AtelierInput id="weightKg" label="Cân nặng (kg)" unit="kg" value={form.weightKg}
                      onChange={(v) => setForm((c) => ({ ...c, weightKg: v }))} placeholder="e.g. 52" />
                  </div>
                </div>

                {/* 3 curves */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                  <AtelierInput id="bustCm" label="Vòng 1 / Ngực (cm)" value={form.bustCm}
                    onChange={(v) => setForm((c) => ({ ...c, bustCm: v }))} />
                  <AtelierInput id="waistCm" label="Vòng 2 / Eo (cm)" value={form.waistCm}
                    onChange={(v) => setForm((c) => ({ ...c, waistCm: v }))} />
                  <AtelierInput id="hipCm" label="Vòng 3 / Hông (cm)" value={form.hipCm}
                    onChange={(v) => setForm((c) => ({ ...c, hipCm: v }))} />
                </div>

                {/* Messages */}
                {error && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
                )}
                {message && (
                  <p className="rounded-lg border px-4 py-3 text-sm"
                    style={{ borderColor: "#C5A059", color: "#6E5E40", backgroundColor: "#fff8f0" }}>
                    ✓ {message}
                    {lastSavedLabel && <span className="ml-2 opacity-60 text-xs">({lastSavedLabel})</span>}
                  </p>
                )}

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl px-8 py-4 text-[13px] font-semibold uppercase tracking-wider text-white shadow-sm transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ backgroundColor: "#8B0000" }}
                  >
                    {saving ? "Đang lưu..." : "Cập nhật số đo"}
                    {!saving && <span className="material-symbols-outlined text-[18px]">check</span>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right: Artisan's Guide (4 cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-8 rounded-xl border p-8" style={{ backgroundColor: "#ffe9e6", borderColor: "#e3beb8" }}>
            <span className="material-symbols-outlined text-[32px] mb-3 block" style={{ color: "#8B0000" }}>menu_book</span>
            <h3 className="mb-2 text-2xl font-semibold" style={{ color: "#261816", fontFamily: "EB Garamond, serif" }}>
              Hướng dẫn đo
            </h3>
            <p className="mb-6 text-sm leading-relaxed" style={{ color: "#5a403c" }}>
              Áo dài hoàn hảo cần số đo chính xác. Hãy làm theo hướng dẫn bên dưới để có kết quả tốt nhất.
            </p>

            <ul className="space-y-5">
              {[
                { num: "1", title: "Ngực (Bust)", desc: "Đo vòng quanh phần đầy nhất của ngực, giữ thước nằm ngang." },
                { num: "2", title: "Eo (Waist)", desc: "Đo vòng quanh eo tự nhiên (phần thon nhất), chừa ngón tay giữa thước và cơ thể." },
                { num: "3", title: "Hông (Hips)", desc: "Đứng thẳng hai gót chân chụm lại, đo vòng quanh phần đầy nhất của hông." },
              ].map((item) => (
                <li key={item.num} className="flex gap-4">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={{ backgroundColor: "#f8dcd8", color: "#8B0000" }}>
                    {item.num}
                  </div>
                  <div>
                    <strong className="block text-sm font-semibold" style={{ color: "#261816" }}>{item.title}</strong>
                    <p className="mt-0.5 text-sm leading-relaxed" style={{ color: "#5a403c" }}>{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t pt-5" style={{ borderColor: "#e3beb8" }}>
              <p className="flex items-center gap-2 text-sm italic" style={{ color: "#4F797B" }}>
                <span className="material-symbols-outlined text-[16px]">info</span>
                Cần hỗ trợ? Đặt lịch với chuyên gia đo lường của chúng tôi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
