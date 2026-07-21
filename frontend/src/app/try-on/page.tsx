"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CustomerNavbar } from "@/components/customer/navbar";
import { CustomerFooter } from "@/components/customer/footer";
import { getGarmentsGrouped, type GarmentGrouped } from "@/lib/api";
import { CameraCapture } from "@/components/try-on/camera-capture";
import { ImageUpload } from "@/components/try-on/image-upload";
import { apiRequest } from "@/lib/api";
import { readStoredAccessToken } from "@/lib/auth";

type ViewState = "setup" | "processing" | "result";

type TryonMode = "face_swap" | "full_body";
type ImageSource = "camera" | "upload";

type TryonHistoryItem = {
  id: string;
  requestId: string;
  status: string;
  garmentName: string;
  resultImageUrl: string | null;
  createdAt: string;
};

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
  const [hasAccessToken, setHasAccessToken] = useState(false);
  const [historyItems, setHistoryItems] = useState<TryonHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  async function loadHistory() {
    if (!readStoredAccessToken()) {
      setHistoryItems([]);
      return;
    }

    setIsHistoryLoading(true);
    const res = await apiRequest<TryonHistoryItem[]>("/ai/tryon/history");
    if (res.success && res.data) {
      setHistoryItems(res.data);
    }
    setIsHistoryLoading(false);
  }

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

  useEffect(() => {
    const token = readStoredAccessToken();
    setHasAccessToken(Boolean(token));
    if (token) void loadHistory();
  }, []);

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
    if (!readStoredAccessToken()) {
      setErrorMsg("Vui lòng đăng nhập để sử dụng tính năng thử đồ AI và lưu lịch sử.");
      return;
    }

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
      void loadHistory();
    } else {
      setErrorMsg(res.message ?? "Không thể tạo ảnh AI. Vui lòng thử lại.");
      setViewState("setup");
    }
  }

  async function handleHideHistoryItem(id: string) {
    const res = await apiRequest<{ id: string; hidden: boolean }>(`/ai/tryon/results/${id}/hide`, {
      method: "PATCH",
    });

    if (res.success) {
      setHistoryItems((items) => items.filter((item) => item.id !== id));
    } else {
      setErrorMsg(res.message ?? "Không thể ẩn ảnh này khỏi lịch sử.");
    }
  }

  function handleReset() {
    setViewState("setup");
    setImageBase64(null);
    setResultImage(null);
    setErrorMsg(null);
  }

  return (
    <div className="min-h-screen bg-mist text-ink">
      <CustomerNavbar active="tryon" />

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
                              : "bg-parchment text-stone-600 hover:bg-lotus/20"
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
                        ? "border-lotus bg-parchment"
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
              <div className="mb-4 flex rounded-lg border border-sand bg-mist p-1">
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
          <section className="relative min-h-[600px] overflow-hidden rounded-xl border border-sand bg-lotus/10">
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
                  className="max-h-full w-full rounded-lg object-contain shadow-xl"
                  src={resultImage}
                />
                <div className="mt-6 flex flex-wrap justify-center gap-3 rounded-full border border-sand bg-white/90 px-5 py-3 text-sm shadow">
                  <button
                    type="button"
                    onClick={handleTryOn}
                    disabled={!canSubmit}
                    className="inline-flex items-center gap-2 font-semibold text-lotus transition hover:text-oxblood disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>Tạo lại
                  </button>
                  <button type="button" onClick={handleReset} className="inline-flex items-center gap-2 text-stone-700 transition hover:text-lotus">
                    <span className="material-symbols-outlined text-[18px]">replay</span>Thử ảnh khác
                  </button>
                  <a
                    href={resultImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-stone-700 transition hover:text-lotus"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>Tải ảnh
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

        <section className="rounded-xl border border-sand bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl text-ink">Lịch sử thử đồ gần đây</h2>
              <p className="mt-1 text-sm text-stone-500">Các ảnh AI đã tạo sẽ tự động lưu ở đây để bạn xem lại hoặc tải về.</p>
            </div>
            <button
              type="button"
              onClick={() => void loadHistory()}
              disabled={!hasAccessToken || isHistoryLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-sand px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:border-antique disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              {isHistoryLoading ? "Đang tải..." : "Làm mới"}
            </button>
          </div>

          {isHistoryLoading && historyItems.length === 0 ? (
            <p className="mt-5 text-sm text-stone-400">Đang tải lịch sử thử đồ...</p>
          ) : historyItems.length > 0 ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {historyItems.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-xl border border-sand bg-mist">
                  <div className="aspect-[3/4] bg-lotus/10">
                    {item.resultImageUrl ? (
                      <img src={item.resultImageUrl} alt={item.garmentName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-stone-400">
                        Chưa có ảnh kết quả
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 p-3">
                    <h3 className="line-clamp-1 text-sm font-semibold text-ink">{item.garmentName}</h3>
                    <p className="text-xs text-stone-500">
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </p>
                    {item.resultImageUrl && (
                      <div className="flex flex-wrap items-center gap-3">
                        <a
                          href={item.resultImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-lotus transition hover:text-oxblood"
                        >
                          <span className="material-symbols-outlined text-[16px]">download</span>Tải ảnh
                        </a>
                        <button
                          type="button"
                          onClick={() => void handleHideHistoryItem(item.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 transition hover:text-red-500"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility_off</span>Ẩn
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : !hasAccessToken ? (
            <p className="mt-5 text-sm text-stone-400">Vui lòng đăng nhập để xem lịch sử thử đồ của bạn.</p>
          ) : (
            <p className="mt-5 text-sm text-stone-400">Bạn chưa có ảnh thử đồ nào.</p>
          )}
        </section>
      </main>
      <CustomerFooter />
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
