"use client";

import { useEffect, useRef, useState } from "react";

type ShippingMapProps = {
  storeLat: number;
  storeLng: number;
  customerLat: number;
  customerLng: number;
  storeName?: string;
  distanceText?: string;
};

let leafletCssInjected = false;

function injectLeafletCss() {
  if (leafletCssInjected || typeof document === "undefined") return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
  link.crossOrigin = "";
  document.head.appendChild(link);
  leafletCssInjected = true;
}

export function ShippingMap({
  storeLat,
  storeLng,
  customerLat,
  customerLng,
  storeName = "Atelier",
  distanceText,
}: ShippingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    injectLeafletCss();

    let cancelled = false;

    async function render() {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      // Clean up previous map
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const container = containerRef.current as any;
      if (container && container._leaflet_id) {
        container._leaflet_id = null;
      }

      const centerLat = (storeLat + customerLat) / 2;
      const centerLng = (storeLng + customerLng) / 2;

      const map = L.map(containerRef.current).setView([centerLat, centerLng], 14);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Store marker
      const storeIcon = L.divIcon({
        html: `<div style="background:#8B0000;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🏠</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        className: "",
      });
      L.marker([storeLat, storeLng], { icon: storeIcon })
        .addTo(map)
        .bindPopup(`<b>${storeName}</b><br>Điểm giao/nhận đồ`);

      // Customer marker
      const customerIcon = L.divIcon({
        html: `<div style="background:#1a73e8;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">📍</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        className: "",
      });
      L.marker([customerLat, customerLng], { icon: customerIcon })
        .addTo(map)
        .bindPopup("<b>Địa chỉ của bạn</b>");

      // Line
      const bounds = L.latLngBounds([
        [storeLat, storeLng],
        [customerLat, customerLng],
      ]);
      L.polyline(
        [
          [storeLat, storeLng],
          [customerLat, customerLng],
        ],
        { color: "#8B0000", weight: 3, opacity: 0.7, dashArray: "8 4" },
      ).addTo(map);

      map.fitBounds(bounds.pad(0.3));
      setReady(true);
    }

    render();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [storeLat, storeLng, customerLat, customerLng, storeName]);

  return (
    <div className="relative w-full">
      {!ready ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-stone-50">
          <span className="text-sm text-stone-400">Đang tải bản đồ...</span>
        </div>
      ) : null}
      <div
        ref={containerRef}
        className="h-56 w-full rounded-xl border border-sand"
        style={{ minHeight: 224 }}
      />
      {distanceText ? (
        <p className="mt-1 text-center text-xs text-stone-500">
          Khoảng cách: {distanceText} (đường chim bay)
        </p>
      ) : null}
    </div>
  );
}
