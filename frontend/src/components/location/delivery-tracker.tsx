"use client";

import { useEffect, useRef, useState } from "react";

type DeliveryTrackData = {
  bookingId: string;
  status: "preparing" | "in_transit" | "arrived";
  progress: number;
  storeLat: number;
  storeLng: number;
  customerLat: number;
  customerLng: number;
  shipperLat: number;
  shipperLng: number;
  customerName: string;
  customerAddress: string;
  estimatedDelivery: string;
};

let cssInjected = false;

function injectCss() {
  if (cssInjected || typeof document === "undefined") return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
  link.crossOrigin = "";
  document.head.appendChild(link);
  cssInjected = true;
}

const STATUS_MAP = {
  preparing: { label: "Đang chuẩn bị", color: "bg-lotus/10 text-lotus", icon: "📦" },
  in_transit: { label: "Đang giao", color: "bg-amber-50 text-amber-700", icon: "🛵" },
  arrived: { label: "Đã đến", color: "bg-jade/10 text-jade", icon: "check_circle" },
} as const;

export function DeliveryTracker({ data }: { data: DeliveryTrackData }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const shipperMarkerRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    injectCss();

    let cancelled = false;

    async function render() {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const { storeLat, storeLng, customerLat, customerLng, shipperLat, shipperLng } = data;

      const map = L.map(containerRef.current);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OSM",
        maxZoom: 19,
      }).addTo(map);

      // Store marker
      L.marker([storeLat, storeLng], {
        icon: L.divIcon({
          html: `<div style="background:#8B0000;color:white;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">🏠</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          className: "",
        }),
      })
        .addTo(map)
        .bindPopup("<b>Atelier</b><br>Điểm xuất phát");

      // Customer marker
      L.marker([customerLat, customerLng], {
        icon: L.divIcon({
          html: `<div style="background:#1a73e8;color:white;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">📍</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          className: "",
        }),
      })
        .addTo(map)
        .bindPopup(`<b>${data.customerName}</b><br>${data.customerAddress}`);

      // Dashed line store -> customer
      L.polyline(
        [
          [storeLat, storeLng],
          [customerLat, customerLng],
        ],
        { color: "#8B0000", weight: 2, opacity: 0.4, dashArray: "6 6" },
      ).addTo(map);

      // Shipper marker (animated)
      const shipperIcon = L.divIcon({
        html: `<div style="background:#e37400;color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.4);animation:pulse 2s infinite">🛵</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        className: "",
      });

      const sm = L.marker([shipperLat, shipperLng], { icon: shipperIcon })
        .addTo(map)
        .bindPopup(`<b>Shipper</b><br>${STATUS_MAP[data.status].label}`);
      shipperMarkerRef.current = sm;

      // Fit bounds
      const bounds = L.latLngBounds([
        [storeLat, storeLng],
        [customerLat, customerLng],
      ]);
      map.fitBounds(bounds.pad(0.2));
    }

    render();

    return () => { cancelled = true; };
  }, [mounted, data]);

  // Animate shipper position updates when status changes
  useEffect(() => {
    if (!shipperMarkerRef.current) return;
    const L = (window as any).L;
    if (!L) return;
    shipperMarkerRef.current.setLatLng([data.shipperLat, data.shipperLng]);
  }, [data.shipperLat, data.shipperLng]);

  const s = STATUS_MAP[data.status];

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="rounded-xl border border-sand bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-ink flex items-center gap-2">
            {s.icon} {s.label}
          </span>
          <span className="text-xs text-stone-500">{data.progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${s.color}`}
            style={{ width: `${data.progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-stone-400">
          <span>Atelier</span>
          <span>Dự kiến: {data.estimatedDelivery}</span>
        </div>
      </div>

      {/* Map */}
      <div ref={containerRef} className="h-72 w-full rounded-xl border border-sand" style={{ minHeight: 288 }} />

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 3px 10px rgba(0,0,0,0.4); }
          50% { box-shadow: 0 3px 20px rgba(227,116,0,0.6); }
        }
      `}</style>
    </div>
  );
}
