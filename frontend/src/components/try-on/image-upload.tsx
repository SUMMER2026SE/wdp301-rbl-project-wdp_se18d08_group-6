"use client";

import { ChangeEvent, useRef, useState } from "react";

type ImageUploadProps = {
  onUpload: (base64: string) => void;
};

const MAX_IMAGE_MB = 8;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function stripDataUriPrefix(dataUrl: string) {
  return dataUrl.replace(/^data:image\/[^;]+;base64,/, "");
}

export function ImageUpload({ onUpload }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setErrorMsg(null);

    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMsg("Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setErrorMsg(`Ảnh không được vượt quá ${MAX_IMAGE_MB}MB.`);
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl) {
        setErrorMsg("Không thể đọc ảnh. Vui lòng chọn ảnh khác.");
        return;
      }
      setPreviewUrl(dataUrl);
      setFileName(file.name);
      onUpload(stripDataUriPrefix(dataUrl));
    };
    reader.onerror = () => setErrorMsg("Không thể đọc ảnh. Vui lòng chọn ảnh khác.");
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setPreviewUrl(null);
    setFileName(null);
    setErrorMsg(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {previewUrl ? (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-sand bg-mist">
            <img src={previewUrl} alt={fileName ?? "Ảnh đã upload"} className="aspect-[3/4] w-full object-cover" />
          </div>
          {fileName && <p className="text-xs text-stone-500">Đã chọn: {fileName}</p>}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border border-sand px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:border-antique"
            >
              Chọn ảnh khác
            </button>
            <button
              type="button"
              onClick={clearImage}
              className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:border-red-400"
            >
              Xoá ảnh
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-antique/50 bg-mist px-6 py-10 text-center transition hover:border-lotus hover:bg-parchment"
        >
          <span className="material-symbols-outlined text-5xl text-antique">upload</span>
          <span className="mt-3 text-sm font-semibold text-ink">Chọn ảnh từ thiết bị</span>
          <span className="mt-1 text-xs text-stone-500">JPG, PNG hoặc WebP · tối đa {MAX_IMAGE_MB}MB</span>
        </button>
      )}

      {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

      <p className="text-xs leading-6 text-stone-500">
        Ảnh rõ, đủ sáng và không bị che mặt sẽ giúp AI tạo kết quả tự nhiên hơn.
      </p>
    </div>
  );
}
