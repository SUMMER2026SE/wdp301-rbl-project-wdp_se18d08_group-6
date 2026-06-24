"use client";

import { useEffect, useRef, useState } from "react";

type CameraCaptureProps = {
  onCapture: (base64: string) => void;
};

function stripDataUriPrefix(dataUrl: string) {
  return dataUrl.replace(/^data:image\/[^;]+;base64,/, "");
}

function isLocalhost() {
  if (typeof window === "undefined") return false;
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

function getCameraErrorMessage(error: unknown) {
  if (typeof window !== "undefined" && !window.isSecureContext && !isLocalhost()) {
    return "Trình duyệt chỉ cho mở camera trên HTTPS hoặc localhost. Vui lòng mở bằng http://localhost hoặc dùng upload ảnh.";
  }

  if (!(error instanceof DOMException)) {
    return "Không thể mở camera. Vui lòng upload ảnh hoặc thử lại bằng trình duyệt khác.";
  }

  switch (error.name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "Bạn chưa cấp quyền camera cho trang này. Hãy bấm biểu tượng khoá/camera trên thanh địa chỉ và Allow camera.";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "Không tìm thấy camera trên thiết bị. Vui lòng kiểm tra webcam hoặc upload ảnh.";
    case "NotReadableError":
    case "TrackStartError":
      return "Camera đang được ứng dụng khác sử dụng. Hãy tắt Zoom/Meet/Camera app rồi thử lại.";
    case "OverconstrainedError":
    case "ConstraintNotSatisfiedError":
      return "Camera không hỗ trợ cấu hình yêu cầu. Hãy thử lại hoặc upload ảnh.";
    case "SecurityError":
      return "Trình duyệt đang chặn camera vì lý do bảo mật. Vui lòng dùng HTTPS/localhost hoặc upload ảnh.";
    default:
      return `Không thể mở camera (${error.name}). Vui lòng kiểm tra quyền truy cập hoặc upload ảnh.`;
  }
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  function clearCountdown() {
    if (countdownTimerRef.current) {
      window.clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
  }

  async function requestCamera() {
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 960 }, height: { ideal: 1280 } },
        audio: false,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "OverconstrainedError") {
        return navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      throw error;
    }
  }

  async function startCamera() {
    setErrorMsg(null);
    stopCamera();

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMsg("Trình duyệt không hỗ trợ camera. Vui lòng upload ảnh thay thế.");
      return;
    }

    try {
      const stream = await requestCamera();
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraReady(true);
    } catch (error) {
      setErrorMsg(getCameraErrorMessage(error));
    }
  }

  function stopCamera() {
    clearCountdown();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraReady(false);
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setPreviewUrl(dataUrl);
    onCapture(stripDataUriPrefix(dataUrl));
    stopCamera();
  }

  function startCountdown() {
    if (!isCameraReady || countdown !== null) return;

    setErrorMsg(null);
    setCountdown(3);
    countdownTimerRef.current = window.setInterval(() => {
      setCountdown((current) => {
        if (current === null) return null;
        if (current <= 1) {
          clearCountdown();
          window.setTimeout(capturePhoto, 0);
          return null;
        }
        return current - 1;
      });
    }, 1000);
  }

  function retakePhoto() {
    setPreviewUrl(null);
    void startCamera();
  }


  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl border border-sand bg-[#fff8f6]">
        {previewUrl ? (
          <img src={previewUrl} alt="Ảnh vừa chụp" className="aspect-[3/4] w-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            className="aspect-[3/4] w-full bg-stone-100 object-cover"
            playsInline
            muted
          />
        )}

        {countdown !== null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/35 text-white backdrop-blur-[1px]">
            <span className="font-display text-7xl drop-shadow-lg">{countdown}</span>
            <span className="mt-2 text-sm font-semibold uppercase tracking-[0.22em] drop-shadow">Chuẩn bị chụp</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-600">
          {errorMsg}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {!isCameraReady && !previewUrl && (
          <button
            type="button"
            onClick={startCamera}
            className="inline-flex items-center gap-2 rounded-lg bg-lotus px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-oxblood"
          >
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            Mở camera
          </button>
        )}

        {isCameraReady && (
          <>
            <button
              type="button"
              onClick={startCountdown}
              disabled={countdown !== null}
              className="inline-flex items-center gap-2 rounded-lg bg-lotus px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-oxblood disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">camera</span>
              {countdown === null ? "Chụp ảnh" : `Đang chụp sau ${countdown}s`}
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="rounded-lg border border-sand px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:border-antique"
            >
              Huỷ
            </button>
          </>
        )}

        {previewUrl && (
          <button
            type="button"
            onClick={retakePhoto}
            className="rounded-lg border border-sand px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:border-antique"
          >
            Chụp lại
          </button>
        )}
      </div>

      <p className="text-xs leading-6 text-stone-500">
        Nếu camera không mở được, hãy cấp quyền camera trên trình duyệt hoặc dùng tab Upload ảnh. Camera chỉ hoạt động ổn định trên HTTPS hoặc localhost.
      </p>
    </div>
  );
}
