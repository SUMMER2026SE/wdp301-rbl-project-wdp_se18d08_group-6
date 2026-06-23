"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PublicAtelierNav } from "@/components/heritage/ui";
import { getGarmentsGrouped, type GarmentGrouped } from "@/lib/api";
import { CameraCapture } from "@/components/try-on/camera-capture";
import { ImageUpload } from "@/components/try-on/image-upload";
import { apiRequest } from "@/lib/api";

type ViewState = "setup" | "processing" | "result";

type TryonMode = "face_swap" | "full_body";
type ImageSource = "camera" | "upload";

function TryOnInner() {
  const searchParams = useSearchParams();
  const preselectedGarmentSizeId = searchParams.get("garmentSizeId") ?? "";

  // Garment selection
  const [groups, setGroups] = useState<GarmentGrouped[]>([]);
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(0);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);

  // Mode & source
  const [mode, setMode] = useState<TryonMode>("face_swap");
  const [imageSource, setImageSource] = useState<ImageSource>("upload");

  // Image
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  // State
  const [viewState, setViewState] = useState<ViewState>("setup");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [consent, setConsent] = useState(true);

  // Load garments + pre-select from URL
  useEffect(() => {
    getGarmentsGrouped().then((res) => {
      if (res.success && res.data) {
        setGroups(res.data);

        // Tìm group + size từ URL param
        if (preselectedGarmentSizeId) {
          for (let i = 0; i < res.data.length; i++) {
            const g = res.data[i];
            const found = g.sizes.find((s) => s.garmentSizeId === preselectedGarmentSizeId);
            if (found) {
              setSelectedGroupIdx(i);
              setSelectedSizeId(preselectedGarmentSizeId);
              return;
            }
          }
        }

        // Fallback: chọn món đầu tiên
        if (res.data.length > 0 && res.data[0].sizes.length > 0) {
          setSelectedSizeId(res.data[0].sizes[0].garmentSizeId);
        }
      }
    });
  }, [preselectedGarmentSizeId]);

  const selectedGroup = groups[selectedGroupIdx] ?? null;
  const selectedSize = selectedGroup?.sizes.find((s) => s.garmentSizeId === selectedSizeId) ?? selectedGroup?.sizes[0];

  const canSubmit = selectedSizeId && imageBase64 && consent;

  function handleImageData(base64: string) {
    setImageBase64(base64);
    setViewState("setup");
    setErrorMsg(null);
  }

  async function handleTryOn() {
    if (!canSubmit) return;
    setViewState("processing");
    setErrorMsg(null);

    const res = await apiRequest<{
      id: string;
      status: string;
      resultImageUrl: string;
      mode: string;
      garmentName: string;
      sizeLabel: string | null;
    }>("/ai/tryon", {
      method: "POST",
      body: JSON.stringify({
        garmentSizeId: selectedSizeId,
        mode,
        imageBase64,
        source: imageSource,
      }),
    });

    if (res.success && res.data) {
      setResultImage(res.data.resultImageUrl);
      setViewState("result");
    } else {
      setErrorMsg(res.message ?? "Không thể tạo ảnh AI. Vui lòng thử lại.");
      setViewState("setup");
    }
  }

  function handleReset() {
    setViewState("setup");
    setImageBase64(null);
    setResultImage(null);
    setErrorMsg(null);
  }

  return (
    <div className="min-h-screen bg-[#fff8f6] text-ink">
      <PublicAtelierNav active="atelier" />

      <main className="mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-24 pt-24 sm:px-6 lg:px-8 lg:pt-28">
        {/* Header */}
        <section className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-5xl text-lotus sm:text-6xl">Thử Đồ AI</h1>
          <p className="mt-5 text-base leading-8 text-stone-600 sm:text-lg">
            Chụp hoặc upload ảnh chân dung để AI ghép bạn vào trang phục cổ phục.
            Trải nghiệm chân thực trước khi đặt lịch thuê.
          </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          {/* LEFT: Settings */}
          <div className="space-y-6">
            {/* Garment selector */}
            <section className="rounded-xl border border-sand bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-display text-2xl text-ink">1. Chọn trang phục</h2>
              {groups.length > 0 ? (
                <div className="space-y-3">
                  <select
                    value={selectedGroupIdx}
                    onChange={(e) => {
                      const idx = Number(e.target.value);
                      setSelectedGroupIdx(idx);
                      const firstSize = groups[idx]?.sizes[0]?.garmentSizeId ?? null;
                      setSelectedSizeId(firstSize);
                    }}
                    className="w-full rounded-lg border border-sand bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-antique"
                  >
                    {groups.map((g, i) => (
                      <option key={g.slug} value={i}>{g.name}</option>
                    ))}
                  </select>

                  {/* Size selection */}
                  {selectedGroup && selectedGroup.sizes.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedGroup.sizes.map((s) => (
                        <button
                          key={s.garmentSizeId}
                          type="button"
                          onClick={() => setSelectedSizeId(s.garmentSizeId)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            selectedSizeId === s.garmentSizeId
                              ? "bg-lotus text-white"
                              : "bg-[#fff0ee] text-stone-600 hover:bg-lotus/20"
                          }`}
                        >
                          {s.sizeLabel ?? "—"}
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedSize && (
                    <div className="mt-3 flex gap-4 text-sm text-stone-500">
                      <span>Thuê: <strong className="text-ink">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(selectedSize.dailyPrice)}/ngày</strong></span>
                      <span>Cọc: <strong className="text-ink">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(selectedSize.depositAmount)}</strong></span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-stone-400">Đang tải danh sách trang phục...</p>
              )}
            </section>

            {/* Mode selector */}
            <section className="rounded-xl border border-sand bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-display text-2xl text-ink">2. Chế độ thử đồ</h2>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { key: "face_swap", label: "Khuôn mặt", desc: "AI ghép mặt bạn vào người mẫu", icon: "face" },
                  { key: "full_body", label: "Toàn thân", desc: "AI dựng toàn bộ cơ thể với trang phục", icon: "accessibility_new" },
                ] as const).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setMode(opt.key)}
                    className={`rounded-xl border p-4 text-left transition ${
                      mode === opt.key
                        ? "border-lotus bg-[#fff0ee]"
                        : "border-sand bg-white hover:border-antique"
                    }`}
                  >
                    <span className={`material-symbols-outlined text-2xl mb-2 block ${mode === opt.key ? "text-lotus" : "text-stone-400"}`}>
                      {opt.icon}
                    </span>
                    <h3 className="font-semibold text-ink text-sm">{opt.label}</h3>
                    <p className="mt-1 text-xs text-stone-500">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Image source + Capture/Upload */}
            <section className="rounded-xl border border-sand bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-display text-2xl text-ink">3. Ảnh của bạn</h2>

              {/* Source toggle */}
              <div className="mb-4 flex rounded-lg border border-sand bg-[#fff8f6] p-1">
                {([
                  { key: "upload", label: "Upload ảnh", icon: "upload" },
                  { key: "camera", label: "Chụp ảnh", icon: "photo_camera" },
                ] as const).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => { setImageSource(opt.key); setImageBase64(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition ${
                      imageSource === opt.key ? "bg-white text-lotus shadow-sm" : "text-stone-500 hover:text-stone-700"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Camera or Upload */}
              {imageSource === "camera" ? (
                <CameraCapture onCapture={handleImageData} />
              ) : (
                <ImageUpload onUpload={handleImageData} />
              )}
            </section>

            {/* Consent + Submit */}
            <section className="rounded-xl border border-sand bg-white p-6 shadow-sm">
              <label className="flex items-start gap-3 text-sm leading-7 text-stone-600 cursor-pointer">
                <input
                  className="mt-1 h-5 w-5 rounded border-sand text-lotus focus:ring-lotus"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>Tôi đồng ý cho hệ thống dùng ảnh này để tạo bản xem thử kỹ thuật số. Ảnh chỉ được xử lý tạm thời.</span>
              </label>

              {errorMsg && (
                <p className="mt-4 text-sm text-red-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {errorMsg}
                </p>
              )}

              <button
                type="button"
                disabled={!canSubmit || viewState === "processing"}
                onClick={handleTryOn}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-lotus px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-oxblood disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                {viewState === "processing" ? "Đang xử lý..." : "Tạo hình ảnh thử đồ"}
              </button>
            </section>
          </div>

          {/* RIGHT: Preview / Result */}
          <section className="relative min-h-[600px] overflow-hidden rounded-xl border border-sand bg-[#ffe9e6]">
            {viewState === "setup" && !imageBase64 && (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <span className="material-symbols-outlined text-6xl text-stone-300">imagesmode</span>
                <p className="mt-4 max-w-md text-base leading-8 text-stone-500">
                  Hình ảnh thử đồ của bạn sẽ xuất hiện ở đây sau khi bạn chọn ảnh và bấm &quot;Tạo hình ảnh thử đồ&quot;.
                </p>
              </div>
            )}

            {viewState === "setup" && imageBase64 && (
              <div className="flex h-full flex-col items-center justify-center p-4">
                <img
                  src={`data:image/jpeg;base64,${imageBase64}`}
                  alt="Ảnh của bạn"
                  className="max-h-full w-full rounded-lg object-contain shadow-md"
                />
                <p className="mt-4 text-sm text-stone-500">
                  Ảnh của bạn — bấm &quot;Tạo hình ảnh thử đồ&quot; để AI xử lý
                </p>
              </div>
            )}

            {viewState === "processing" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 p-8 text-center backdrop-blur-sm">
                <div className="h-24 w-24 animate-spin rounded-full border-4 border-[#fff4ef] border-t-antique" />
                <h2 className="mt-6 font-display text-4xl text-lotus">Đang dệt nên hình ảnh...</h2>
                <p className="mt-2 text-sm leading-7 text-stone-600 max-w-sm">
                  AI đang {mode === "face_swap" ? "ghép khuôn mặt bạn vào người mẫu" : "dựng toàn thân với trang phục"}. Quá trình này mất khoảng 5-15 giây.
                </p>
              </div>
            )}

            {viewState === "result" && resultImage && (
              <div className="flex h-full flex-col items-center justify-center p-4">
                <img
                  alt="Kết quả thử đồ AI"
                  className="max-h-full w-full rounded-lg object-contain shadow-[0_20px_40px_rgba(0,0,0,0.16)]"
                  src={resultImage}
                />
                <div className="mt-6 flex flex-wrap justify-center gap-3 rounded-full border border-sand bg-white/90 px-5 py-3 text-sm shadow">
                  <button type="button" onClick={handleReset} className="inline-flex items-center gap-2 text-stone-700 transition hover:text-lotus">
                    <span className="material-symbols-outlined text-[18px]">replay</span>Thử lại
                  </button>
                  <a
                    href={resultImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-stone-700 transition hover:text-lotus"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>Lưu
                  </a>
                  <Link
                    href="/booking/date-selection"
                    className="inline-flex items-center gap-2 font-semibold text-lotus"
                  >
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>Đặt lịch thuê
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default function TryOnPage() {
  return (
    <Suspense>
      <TryOnInner />
    </Suspense>
  );
}
