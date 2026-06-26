"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ManagerPortalShell } from "@/components/heritage/ui";
import { useAuth } from "@/components/auth/auth-provider";
import {
  getStaffAllBookings,
  getAvailableAssets,
  assignAssetToBookingItem,
  getPendingManagerRefunds,
  approveRefund,
  type RefundResponse,
getGarments,
  getGarmentById,
  getAssetsByGarment,
  getAssetById,
  getAssetInspectionHistory,
  getInspectionLog,
  getLaundryTickets,
  completeLaundryTicket,
  getMaintenanceJobs,
  completeMaintenanceJob,
  createGarment,
  updateGarment,
  addGarmentImage,
  removeGarmentImage,
  getGarmentCategories,
  createAsset,
  getAllAssets,
  updateAssetStatus,
  type StaffBookingResponse,
  type AvailableAsset,
  type GarmentSummary,
  type GarmentDetail,
  type GarmentCategory,
  type AssetDetail,
  type AssetInspectionHistory,
  type InspectionLogEntry,
  type LaundryTicketResponse,
  type MaintenanceJobResponse,

} from "@/lib/api";

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_confirmation: { label: "Chờ xác nhận",        color: "bg-amber-100 text-amber-700" },
  confirmed:            { label: "Đã xác nhận",         color: "bg-blue-100 text-blue-700" },
  awaiting_payment:     { label: "Chờ thanh toán",      color: "bg-yellow-100 text-yellow-700" },
  paid:                 { label: "Đã thanh toán",       color: "bg-green-100 text-green-700" },
  preparing:            { label: "Đang chuẩn bị",       color: "bg-purple-100 text-purple-700" },
  ready_for_pickup:     { label: "Sẵn sàng nhận",       color: "bg-teal-100 text-teal-700" },
  delivering:           { label: "Đang giao",           color: "bg-indigo-100 text-indigo-700" },
  renting:              { label: "Đang thuê",           color: "bg-lotus/10 text-lotus" },
  returned:             { label: "Đã trả",              color: "bg-stone-100 text-stone-600" },
  inspection_pending:   { label: "Chờ kiểm tra",        color: "bg-orange-100 text-orange-700" },
  completed:            { label: "Hoàn thành",          color: "bg-jade/10 text-jade" },
  cancelled:            { label: "Đã hủy",              color: "bg-red-100 text-red-600" },
  rejected:             { label: "Từ chối",             color: "bg-red-100 text-red-700" },
  overdue:              { label: "Quá hạn",             color: "bg-red-200 text-red-800" },
};

const ASSET_STATUS_META: Record<string, { label: string; color: string }> = {
  available:         { label: "Sẵn sàng",       color: "bg-state-available/10 text-state-available border border-state-available/20" },
  reserved:          { label: "Đã giữ chỗ",     color: "bg-amber-100 text-amber-700 border border-amber-200" },
  rented:            { label: "Đang thuê",      color: "bg-state-rented/10 text-state-rented border border-state-rented/20" },
  inspection_pending:{ label: "Chờ kiểm tra",   color: "bg-orange-100 text-orange-700 border border-orange-200" },
  laundry:           { label: "Giặt sấy",       color: "bg-state-laundry/10 text-state-laundry border border-state-laundry/20" },
  maintenance:       { label: "Bảo trì",        color: "bg-state-maintenance/10 text-state-maintenance border border-state-maintenance/20" },
  damaged:           { label: "Hư hỏng",        color: "bg-state-damaged/10 text-state-damaged border border-state-damaged/20" },
  retired:           { label: "Đã thanh lý",    color: "bg-stone-100 text-stone-500 border border-stone-200" },
  lost:              { label: "Mất",            color: "bg-red-100 text-red-700 border border-red-200" },
};

const ACTIVE_STATUSES = [
  "confirmed", "awaiting_payment", "paid", "preparing",
  "ready_for_pickup", "delivering", "renting", "returned", "inspection_pending",
];

const REVENUE_STATUSES = ["completed", "renting", "returned", "inspection_pending"];

type Tab = "overview" | "assets" | "inventory" | "inspection-log" | "laundry" | "damaged" | "finance" | "refunds";

const VALID_TABS: Tab[] = ["overview", "assets", "inventory", "inspection-log", "laundry", "damaged", "finance", "refunds"];

function tabFromHash(): Tab {
  const hash = window.location.hash.replace("#", "");
  return (VALID_TABS as string[]).includes(hash) ? (hash as Tab) : "overview";
}

const TAB_META: Record<Tab, { title: string; subtitle: string }> = {
  overview:      { title: "Tổng Quan Vận Hành",        subtitle: "Theo dõi doanh thu, đơn thuê và tình trạng kho theo thời gian thực." },
  assets:        { title: "Gán Tài Sản",             subtitle: "Gán tài sản vật lý cho các đơn đặt chỗ." },
  inventory:     { title: "Quản Lý Kho Trang Phục",          subtitle: "Quản lý mẫu trang phục, ảnh catalog và tài sản vật lý." },
  "inspection-log": { title: "Nhật Ký Kiểm Tra",     subtitle: "Lịch sử kiểm tra tình trạng trang phục sau khi trả." },
  laundry:       { title: "Giặt Sấy",                subtitle: "Quản lý hàng chờ giặt sấy và điều phối." },
  damaged:       { title: "Hư Hỏng & Mất",           subtitle: "Báo cáo tài sản hư hỏng, mất và bảo trì." },
  finance:       { title: "Đối Soát Tài Chính",                subtitle: "Theo dõi doanh thu, tiền cọc và phí phạt phát sinh." },
  refunds:       { title: "Duyệt Hoàn Cọc",                subtitle: "Kiểm duyệt yêu cầu hoàn tiền cọc cho khách." },
};

export default function ManagerDashboardPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);
  const [currentDateLabel, setCurrentDateLabel] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [bookings, setBookings] = useState<StaffBookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Refund approval state
  const [pendingRefunds, setPendingRefunds] = useState<RefundResponse[]>([]);
  const [loadingRefunds, setLoadingRefunds] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Inventory state
  const [garments, setGarments] = useState<GarmentSummary[]>([]);
  const [selectedGarmentId, setSelectedGarmentId] = useState<string | null>(null);
  const [assets, setAssets] = useState<AssetDetail[]>([]);
  const [allAssets, setAllAssets] = useState<AssetDetail[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);

  // Asset assignment state (gán tài sản)
  type AssetAssignState = Record<string, {
    assets: AvailableAsset[];
    loading: boolean;
    selected: string;
    open: boolean;
  }>;
  const [assetAssignState, setAssetAssignState] = useState<AssetAssignState>({});
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetDetail | null>(null);
  const [assetHistory, setAssetHistory] = useState<AssetInspectionHistory[]>([]);
  const [assetHistoryLoading, setAssetHistoryLoading] = useState(false);

  // Inspection log state
  const [inspectionLog, setInspectionLog] = useState<InspectionLogEntry[]>([]);
  const [inspectionLogLoading, setInspectionLogLoading] = useState(false);

  // Laundry state
  const [laundryTickets, setLaundryTickets] = useState<LaundryTicketResponse[]>([]);
  const [laundryLoading, setLaundryLoading] = useState(false);

  // Maintenance state
  const [maintenanceJobs, setMaintenanceJobs] = useState<MaintenanceJobResponse[]>([]);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  // Garment management state
  const [categories, setCategories] = useState<GarmentCategory[]>([]);
  const [garmentModalOpen, setGarmentModalOpen] = useState(false);
  const [editingGarment, setEditingGarment] = useState<GarmentDetail | null>(null);
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    setCurrentDateLabel(new Intl.DateTimeFormat("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date()));
  }, []);

  // ── Sync tab with URL hash ──
  useEffect(() => {
    setTab(tabFromHash());
    const onHash = () => setTab(tabFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function goToTab(next: Tab) {
    if (next === "overview") {
      history.replaceState(null, "", "/dashboard/manager");
    } else {
      window.location.hash = next;
    }
    setTab(next);
  }

  // ── Load data ──

  useEffect(() => {
    setLoading(true);
    setErrorMsg(null);
    Promise.all([
      getStaffAllBookings().then(res => { if (res.success && res.data) setBookings(res.data); }),
      getGarments().then(res => { if (res.success && res.data) setGarments(res.data); }),
      getAllAssets().then(res => { if (res.success && res.data) setAllAssets(res.data); }),
      getGarmentCategories().then(res => { if (res.success && res.data) setCategories(res.data); })
    ]).catch(() => {
      setErrorMsg("Có lỗi xảy ra khi tải dữ liệu.");
    }).finally(() => setLoading(false));
  }, []);

  function refreshGarments() {
    return getGarments().then((res) => {
      if (res.success && res.data) setGarments(res.data);
    });
  }

  function refreshAssets(garmentId: string) {
    return getAssetsByGarment(garmentId).then((res) => {
      if (res.success && res.data) setAssets(res.data);
    });
  }

  function refreshAllAssets() {
    return getAllAssets().then((res) => {
      if (res.success && res.data) setAllAssets(res.data);
    });
  }

  function refreshCategories() {
    return getGarmentCategories().then((res) => {
      if (res.success && res.data) setCategories(res.data);
    });
  }

  async function handleCreateGarment(
    payload: Parameters<typeof createGarment>[0],
    imagesToAdd: string[],
  ) {
    setSubmitting(true);
    setErrorMsg(null);
    const res = await createGarment(payload);
    if (res.success && res.data) {
      for (const imgUrl of imagesToAdd) {
        await addGarmentImage(res.data.id, { imageUrl: imgUrl });
      }
      // Re-fetch the created garment to get its updated images[]
      const fresh = await getGarmentById(res.data.id);
      if (fresh.success && fresh.data) {
        setGarments((prev) => [...prev, fresh.data!]);
      } else {
        await refreshGarments();
      }
      setSelectedGarmentId(res.data.id);
      setGarmentModalOpen(false);
      setEditingGarment(null);
    } else {
      setErrorMsg(res.message ?? "Kh\u00f4ng th\u1ec3 t\u1ea1o trang ph\u1ee5c.");
    }
    setSubmitting(false);
  }

  async function handleUpdateGarment(
    id: string,
    payload: Parameters<typeof updateGarment>[1],
    imagesToAdd: string[],
    imageIdsToRemove: string[],
  ) {
    setSubmitting(true);
    setErrorMsg(null);
    const res = await updateGarment(id, payload);
    if (res.success) {
      let imageOpsFailed = false;
      for (const imageId of imageIdsToRemove) {
        const removeRes = await removeGarmentImage(id, imageId);
        if (!removeRes.success) imageOpsFailed = true;
      }
      for (const imgUrl of imagesToAdd) {
        const addRes = await addGarmentImage(id, { imageUrl: imgUrl });
        if (!addRes.success) imageOpsFailed = true;
      }
      // Re-fetch the updated garment to get its current images[]
      const fresh = await getGarmentById(id);
      if (fresh.success && fresh.data) {
        setGarments((prev) => prev.map((g) => (g.id === id ? fresh.data! : g)));
      } else {
        await refreshGarments();
      }
      if (imageOpsFailed) {
        setErrorMsg("Kh\u00f4ng th\u1ec3 c\u1eadp nh\u1eadt \u0111\u1ea7y \u0111\u1ee7 \u1ea3nh. Vui l\u00f2ng th\u1eed l\u1ea1i.");
        setSubmitting(false);
        return;
      }
      setGarmentModalOpen(false);
      setEditingGarment(null);
    } else {
      setErrorMsg(res.message ?? "Kh\u00f4ng th\u1ec3 c\u1eadp nh\u1eadt trang ph\u1ee5c.");
    }
    setSubmitting(false);
  }

  async function handleCreateAsset(payload: Parameters<typeof createAsset>[0]) {
    setSubmitting(true);
    setErrorMsg(null);
    const res = await createAsset(payload);
    setSubmitting(false);
    if (res.success) {
      if (selectedGarmentId) await refreshAssets(selectedGarmentId);
      await refreshAllAssets();
      setAssetModalOpen(false);
    } else {
      setErrorMsg(res.message ?? "Không thể tạo tài sản.");
    }
  }

  async function handleUpdateAssetStatus(assetId: string, status: string) {
    setErrorMsg(null);
    const res = await updateAssetStatus(assetId, status);
    if (res.success) {
      if (selectedGarmentId) await refreshAssets(selectedGarmentId);
      await refreshAllAssets();
      if (selectedAssetId === assetId) {
        const detail = await getAssetById(assetId);
        if (detail.success && detail.data) setSelectedAsset(detail.data);
      }
    } else {
      setErrorMsg(res.message ?? "Không thể cập nhật trạng thái.");
    }
  }

  function openCreateGarment() {
    setEditingGarment(null);
    setGarmentModalOpen(true);
  }

  async function openEditGarment(garment: GarmentSummary) {
    const res = await getGarmentById(garment.id);
    if (res.success && res.data) {
      setEditingGarment(res.data as GarmentDetail);
    } else {
      setEditingGarment({
        ...garment,
        description: null,
        categoryId: null,
        color: null,
        isActive: true,
        images: garment.images ?? [],
      } as GarmentDetail);
    }
    setGarmentModalOpen(true);
  }

  // ── Load garments ──
  useEffect(() => {
    getGarments().then((res) => {
      if (res.success && res.data) {
        setGarments(res.data);
        if (res.data.length > 0 && !selectedGarmentId) {
          setSelectedGarmentId(res.data[0].id);
        }
      }
    });
  }, []);

  // Load pending refunds when refund tab is selected
  useEffect(() => {
    if (tab !== "refunds") return;
    setLoadingRefunds(true);
    getPendingManagerRefunds()
      .then((res) => {
        if (res.success && res.data) setPendingRefunds(res.data);
        else setPendingRefunds([]);
      })
      .finally(() => setLoadingRefunds(false));
  }, [tab]);

  async function handleApproveRefund(refundId: string, proofImageUrl: string, approveNote: string) {
    if (!proofImageUrl.trim()) return;
    setApprovingId(refundId);
    setErrorMsg(null);
    const res = await approveRefund(refundId, {
      status: "refunded",
      proofImageUrl: proofImageUrl.trim(),
      note: approveNote || undefined,
    });
    setApprovingId(null);
    if (res.success) {
      setPendingRefunds((prev) => prev.filter((r) => r.id !== refundId));
    } else {
      setErrorMsg(res.message ?? "Không thể duyệt hoàn cọc.");
    }
  }

  // ── Asset assignment helpers ──

  async function openAssetPicker(itemKey: string, garmentId: string) {
    setAssetAssignState((prev) => ({
      ...prev,
      [itemKey]: { assets: [], loading: true, selected: "", open: true },
    }));
    const res = await getAvailableAssets(garmentId);
    if (res.success && res.data) {
      const data = res.data;
      setAssetAssignState((prev) => ({
        ...prev,
        [itemKey]: { assets: data, loading: false, selected: data.length > 0 ? data[0].id : "", open: true },
      }));
    } else {
      setAssetAssignState((prev) => ({
        ...prev,
        [itemKey]: { assets: [], loading: false, selected: "", open: true },
      }));
    }
  }

  async function handleAssignAsset(bookingId: string, itemId: string, itemKey: string) {
    const state = assetAssignState[itemKey];
    if (!state?.selected) return;
    setActioningId(bookingId);
    setErrorMsg(null);
    const res = await assignAssetToBookingItem(bookingId, itemId, state.selected);
    setActioningId(null);
    if (res.success) {
      const listRes = await getStaffAllBookings();
      if (listRes.success && listRes.data) setBookings(listRes.data);
      setAssetAssignState((prev) => {
        const next = { ...prev };
        delete next[itemKey];
        return next;
      });
    } else {
      setErrorMsg(res.message ?? "Không thể gán tài sản.");
    }
  }

  function closeAssetPicker(itemKey: string) {
    setAssetAssignState((prev) => {
      const next = { ...prev };
      delete next[itemKey];
      return next;
    });
  }

  // ── Load assets when garment selected ──
  useEffect(() => {
    if (!selectedGarmentId) return;
    setAssetsLoading(true);
    getAssetsByGarment(selectedGarmentId)
      .then((res) => {
        if (res.success && res.data) setAssets(res.data);
        else setAssets([]);
      })
      .finally(() => setAssetsLoading(false));
  }, [selectedGarmentId]);

  // ── Load asset detail + history when asset selected ──
  useEffect(() => {
    if (!selectedAssetId) {
      setSelectedAsset(null);
      setAssetHistory([]);
      return;
    }
    getAssetById(selectedAssetId).then((res) => {
      if (res.success && res.data) setSelectedAsset(res.data);
    });
    setAssetHistoryLoading(true);
    getAssetInspectionHistory(selectedAssetId)
      .then((res) => {
        if (res.success && res.data) setAssetHistory(res.data);
        else setAssetHistory([]);
      })
      .finally(() => setAssetHistoryLoading(false));
  }, [selectedAssetId]);

  // ── Load inspection log ──
  useEffect(() => {
    if (tab !== "inspection-log") return;
    setInspectionLogLoading(true);
    getInspectionLog()
      .then((res) => {
        if (res.success && res.data) setInspectionLog(res.data);
      })
      .finally(() => setInspectionLogLoading(false));
  }, [tab]);

  // ── Load laundry ──
  useEffect(() => {
    if (tab !== "laundry") return;
    setLaundryLoading(true);
    getLaundryTickets()
      .then((res) => {
        if (res.success && res.data) setLaundryTickets(res.data);
      })
      .finally(() => setLaundryLoading(false));
  }, [tab]);

  // ── Load maintenance ──
  useEffect(() => {
    if (tab !== "damaged") return;
    setMaintenanceLoading(true);
    getMaintenanceJobs()
      .then((res) => {
        if (res.success && res.data) setMaintenanceJobs(res.data);
      })
      .finally(() => setMaintenanceLoading(false));
  }, [tab]);

  // ── Derived metrics ──
  const activeBookings = bookings.filter((b) => ACTIVE_STATUSES.includes(b.status));
  const bookingsNeedingAssets = activeBookings.filter((b) =>
    ["confirmed", "awaiting_payment", "paid", "preparing"].includes(b.status) &&
    b.items.some((item) => !item.garmentAssetId),
  );
  const totalRentalRevenue = bookings
    .filter((b) => REVENUE_STATUSES.includes(b.status))
    .reduce((sum, b) => sum + b.rentalTotal, 0);
  const totalDepositHeld = activeBookings.reduce((sum, b) => sum + b.depositTotal, 0);
  const totalPenalties = bookings.reduce((sum, b) => sum + (b.penaltyTotal ?? 0), 0);
  const rentedItemCount = bookings
    .filter((b) => b.status === "renting")
    .reduce((sum, b) => sum + b.items.filter((i) => i.garmentAssetId).length, 0);
  const totalAvailable = assets.filter((a) => a.status === "available").length;
  const utilizationDenominator = rentedItemCount + totalAvailable;
  const utilizationPct = utilizationDenominator > 0
    ? Math.round((rentedItemCount / utilizationDenominator) * 100)
    : 0;

  const countBy = (statuses: string[]) =>
    bookings.filter((b) => statuses.includes(b.status)).length;

  const meta = TAB_META[tab];

  return (
    <ManagerPortalShell
      active={tab as any}
      title={meta.title}
      subtitle={meta.subtitle}
      onTabChange={goToTab}
      managerName={hasMounted ? (user?.fullName ?? user?.email?.split("@")[0] ?? "Quản lý cửa hàng") : "Quản lý cửa hàng"}
      managerEmail={hasMounted ? (user?.email ?? null) : null}
      currentDateLabel={hasMounted ? currentDateLabel : ""}
      onProfile={() => router.push("/dashboard/manager/profile")}
      onSignOut={() => { signOut(); router.replace("/login"); }}
    >
      {errorMsg && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-stone-400">Đang tải dữ liệu...</div>
      ) : tab === "overview" ? (
        <OverviewTab
          totalRentalRevenue={totalRentalRevenue}
          totalDepositHeld={totalDepositHeld}
          activeBookings={activeBookings}
          utilizationPct={utilizationPct}
          rentedItemCount={rentedItemCount}
          utilizationDenominator={utilizationDenominator}
          countBy={countBy}
          garments={garments}
          onGoToTab={goToTab}
          bookingsNeedingAssets={bookingsNeedingAssets}
          allAssets={allAssets}
          laundryTickets={laundryTickets}
          maintenanceJobs={maintenanceJobs}
          assets={assets}
        />
      ) : tab === "assets" ? (
        <AssetsAssignTab
          bookingsNeedingAssets={bookingsNeedingAssets}
          assetAssignState={assetAssignState}
          actioningId={actioningId}
          onOpenPicker={openAssetPicker}
          onAssign={handleAssignAsset}
          onClosePicker={closeAssetPicker}
          onSelectChange={(itemKey, value) =>
            setAssetAssignState((prev) => ({
              ...prev,
              [itemKey]: { ...prev[itemKey], selected: value },
            }))
          }
        />
      ) : tab === "inventory" ? (
        <InventoryTab
          garments={garments}
          categories={categories}
          selectedGarmentId={selectedGarmentId}
          onSelectGarment={setSelectedGarmentId}
          assets={assets}
          assetsLoading={assetsLoading}
          selectedAssetId={selectedAssetId}
          onSelectAsset={setSelectedAssetId}
          selectedAsset={selectedAsset}
          assetHistory={assetHistory}
          assetHistoryLoading={assetHistoryLoading}
          onCreateGarment={openCreateGarment}
          onEditGarment={openEditGarment}
          onCreateAsset={() => setAssetModalOpen(true)}
          onUpdateAssetStatus={handleUpdateAssetStatus}
          garmentModalOpen={garmentModalOpen}
          editingGarment={editingGarment}
          onCloseGarmentModal={() => { setGarmentModalOpen(false); setEditingGarment(null); }}
          onSubmitGarment={(id, p, images, imageIdsToRemove) => id
            ? handleUpdateGarment(id, p, images, imageIdsToRemove)
            : handleCreateGarment(p, images)}
          submitting={submitting}
          assetModalOpen={assetModalOpen}
          onCloseAssetModal={() => setAssetModalOpen(false)}
          onSubmitAsset={handleCreateAsset}
        />
      ) : tab === "inspection-log" ? (
        <InspectionLogTab
          log={inspectionLog}
          loading={inspectionLogLoading}
        />
      ) : tab === "laundry" ? (
        <LaundryTab
          tickets={laundryTickets}
          loading={laundryLoading}
          actioningId={actioningId}
          onComplete={async (id) => {
            setActioningId(id);
            const res = await completeLaundryTicket(id);
            setActioningId(null);
            if (res.success) {
              const refresh = await getLaundryTickets();
              if (refresh.success && refresh.data) setLaundryTickets(refresh.data);
            }
          }}
        />
      ) : tab === "damaged" ? (
        <DamagedTab
          jobs={maintenanceJobs}
          loading={maintenanceLoading}
          actioningId={actioningId}
          onComplete={async (id, status) => {
            setActioningId(id);
            const res = await completeMaintenanceJob(id, status);
            setActioningId(null);
            if (res.success) {
              const refresh = await getMaintenanceJobs();
              if (refresh.success && refresh.data) setMaintenanceJobs(refresh.data);
            }
          }}
        />
      ) : tab === "refunds" ? (
        <RefundsTab
          pendingRefunds={pendingRefunds}
          loadingRefunds={loadingRefunds}
          handleApproveRefund={handleApproveRefund}
          approvingId={approvingId}
        />
      ) : (
        <FinanceTab
          totalRentalRevenue={totalRentalRevenue}
          totalDepositHeld={totalDepositHeld}
          totalPenalties={totalPenalties}
          activeBookings={activeBookings}
          bookings={bookings}
        />
      )}

      {garmentModalOpen && (
        <GarmentFormModal
          garment={editingGarment}
          categories={categories}
          submitting={submitting}
          onClose={() => { setGarmentModalOpen(false); setEditingGarment(null); }}
          onSubmit={(payload, images, removedImageIds) => {
            if (editingGarment) handleUpdateGarment(editingGarment.id, payload, images, removedImageIds);
            else handleCreateGarment(payload, images);
          }}
        />
      )}
    </ManagerPortalShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Assets Assignment (Gán tài sản)
// ═══════════════════════════════════════════════════════════════════════════════

function AssetsAssignTab({
  bookingsNeedingAssets,
  assetAssignState,
  actioningId,
  onOpenPicker,
  onAssign,
  onClosePicker,
  onSelectChange,
}: {
  bookingsNeedingAssets: StaffBookingResponse[];
  assetAssignState: Record<string, {
    assets: AvailableAsset[];
    loading: boolean;
    selected: string;
    open: boolean;
  }>;
  actioningId: string | null;
  onOpenPicker: (itemKey: string, garmentId: string) => void;
  onAssign: (bookingId: string, itemId: string, itemKey: string) => void;
  onClosePicker: (itemKey: string) => void;
  onSelectChange: (itemKey: string, value: string) => void;
}) {
  return (
    <div className="space-y-6">
      {bookingsNeedingAssets.length === 0 ? (
        <div className="py-20 text-center text-stone-400">
          <span className="material-symbols-outlined mb-4 block text-5xl text-stone-200">check_circle</span>
          Tất cả đơn đều đã được gán tài sản. Không có gì cần xử lý.
        </div>
      ) : (
        bookingsNeedingAssets.map((booking) => {
          const s = STATUS_LABELS[booking.status] ?? { label: booking.status, color: "bg-stone-100 text-stone-600" };
          const unassignedItems = booking.items.filter((item) => !item.garmentAssetId);
          return (
            <div key={booking.id} className="overflow-hidden rounded-xl border border-sand bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sand bg-[#fff8f6] px-6 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-ink">#{booking.id.slice(0, 8).toUpperCase()}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${s.color}`}>{s.label}</span>
                </div>
                <span className="text-xs text-stone-400">
                  {booking.customerName ?? "—"} · {formatDate(booking.rentalStartDate)} – {formatDate(booking.rentalEndDate)}

                </span>
              </div>
              <div className="space-y-3 px-6 py-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  {unassignedItems.length} item chưa gán tài sản
                </p>
                {unassignedItems.map((item) => {
                  const itemKey = `${booking.id}-${item.id}`;
                  const state = assetAssignState[itemKey];
                  return (
                    <div key={itemKey} className="flex items-center gap-4 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-ink">
                          {item.garmentName ?? "Trang phục"}
                          {item.sizeLabel && <span className="ml-1 text-stone-500">({item.sizeLabel})</span>}
                        </p>
                        <div className="mt-1 flex gap-4 text-xs text-stone-500">
                          <span>{formatVND(item.dailyPrice)}/ngày</span>
                          <span>Cọc: {formatVND(item.depositAmount)}</span>
                        </div>
                      </div>
                      {!state?.open ? (
                        <button type="button" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100" onClick={() => onOpenPicker(itemKey, item.garmentId)}>
                          <span className="material-symbols-outlined mr-1 align-middle text-[16px]">add</span>
                          Gán tài sản
                        </button>
                      ) : state.loading ? (
                        <span className="text-sm text-stone-400">Đang tải...</span>
                      ) : state.assets.length === 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-red-600">Hết tài sản khả dụng</span>
                          <button type="button" className="text-sm text-stone-500 underline" onClick={() => onClosePicker(itemKey)}>Đóng</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <select className="min-w-[200px] rounded-lg border border-sand bg-white px-3 py-2 text-sm outline-none focus:border-antique" value={state.selected} onChange={(e) => onSelectChange(itemKey, e.target.value)} aria-label="Chọn tài sản">
                            {state.assets.map((a) => (
                              <option key={a.id} value={a.id}>{a.assetCode} {a.conditionNote ? `— ${a.conditionNote}` : ""}</option>
                            ))}
                          </select>
                          <button type="button" disabled={actioningId === booking.id} className="rounded-lg bg-jade px-4 py-2 text-sm font-semibold text-white transition hover:bg-forest disabled:opacity-50" onClick={() => onAssign(booking.id, item.id, itemKey)}>
                            {actioningId === booking.id ? "..." : "Xác nhận gán"}
                          </button>
                          <button type="button" className="text-sm text-stone-500 underline" onClick={() => onClosePicker(itemKey)}>Hủy</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Overview
// ═══════════════════════════════════════════════════════════════════════════════

function OverviewTab({
  totalRentalRevenue, totalDepositHeld, activeBookings,
  utilizationPct, rentedItemCount, utilizationDenominator,
  countBy, garments, onGoToTab, bookingsNeedingAssets, allAssets, laundryTickets, maintenanceJobs, assets,
}: {
  totalRentalRevenue: number;
  totalDepositHeld: number;
  activeBookings: StaffBookingResponse[];
  utilizationPct: number;
  rentedItemCount: number;
  utilizationDenominator: number;
  countBy: (s: string[]) => number;
  garments: GarmentSummary[];
  onGoToTab: (t: Tab) => void;
  bookingsNeedingAssets: StaffBookingResponse[];
  allAssets: AssetDetail[];
  laundryTickets: LaundryTicketResponse[];
  maintenanceJobs: MaintenanceJobResponse[];
  assets: AssetDetail[];
}) {
  const effectiveAssets = allAssets.length > 0
    ? allAssets
    : assets.length > 0
      ? assets
      : activeBookings.flatMap((booking) => booking.items)
          .filter((item) => item.assetStatus)
          .map((item) => ({ status: item.assetStatus! }));
  const assetCounts = effectiveAssets.reduce<Record<string, number>>((acc: Record<string, number>, asset: { status: string }) => {
    acc[asset.status] = (acc[asset.status] ?? 0) + 1;
    return acc;
  }, {});
  const returnedWaiting = countBy(["returned", "inspection_pending", "overdue"]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SnapshotCard label="Doanh thu (đang phát sinh)" value={formatVND(totalRentalRevenue)} hint="Từ đơn completed + đang thuê" icon="payments" tone="lotus" />
        <SnapshotCard label="Tiền cọc đang giữ" value={formatVND(totalDepositHeld)} hint={`${activeBookings.length} đơn đang hoạt động`} icon="account_balance_wallet" tone="antique" />
        <SnapshotCard label="Đơn đặt chỗ hiện tại" value={String(activeBookings.length)} hint="Đang trong luồng vận hành" icon="calendar_month" tone="jade" />
        <SnapshotCard label="Hiệu suất lấp đầy" value={garments.length === 0 ? "—" : `${utilizationPct}%`} hint={`${rentedItemCount} đang thuê / ${utilizationDenominator} khả dụng`} icon="pie_chart" tone="bronze" progress={garments.length === 0 ? null : utilizationPct} />
      </div>

      <section className="rounded-xl border border-sand bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-ink">Việc cần xử lý</h2>
            <p className="text-sm text-stone-500">Ưu tiên vận hành trong ngày</p>
          </div>
          <span className="material-symbols-outlined text-lotus">task_alt</span>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <QuickWorkItem icon="swap_horiz" label="Cần gán tài sản" value={bookingsNeedingAssets.length} tone="amber" onClick={() => onGoToTab("assets")} />
          <QuickWorkItem icon="search_check" label="Chờ kiểm tra" value={returnedWaiting} tone="orange" onClick={() => onGoToTab("inspection-log")} />
          <QuickWorkItem icon="dry_cleaning" label="Đang giặt sấy" value={laundryTickets.length} tone="blue" onClick={() => onGoToTab("laundry")} />
          <QuickWorkItem icon="build" label="Cần bảo trì" value={maintenanceJobs.filter((j) => j.status !== "completed" && j.status !== "cannot_repair").length} tone="red" onClick={() => onGoToTab("damaged")} />
        </div>
      </section>

      <section className="rounded-xl border border-sand bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-ink">Tổng Quan Kho Tài Sản</h2>
            <p className="text-sm text-stone-500">Tình trạng hiện vật đang vận hành trong cửa hàng</p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">{effectiveAssets.length} tài sản</span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {["available", "reserved", "rented", "laundry", "maintenance", "damaged", "inspection_pending", "retired", "lost"].map((status) => {
            const meta = ASSET_STATUS_META[status] ?? { label: status, color: "bg-stone-100 text-stone-600" };
            return (
              <button key={status} type="button" onClick={() => onGoToTab("inventory")} className="rounded-lg border border-sand bg-[#fff8f6] p-3 text-left transition hover:border-lotus/50 hover:bg-white">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.color}`}>{meta.label}</span>
                <p className="mt-2 font-display text-2xl text-ink">{assetCounts[status] ?? 0}</p>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        <div className="rounded-xl border border-sand bg-white p-6 shadow-[0_4px_12px_rgba(74,4,4,0.03)] lg:col-span-2">
          <h2 className="mb-6 font-display text-2xl text-ink">Tình Trạng Vận Hành</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <StatusCell label="Chờ xử lý" value={countBy(["pending_confirmation", "awaiting_payment"])} tone="amber" />
            <StatusCell label="Đang chuẩn bị" value={countBy(["paid", "preparing", "ready_for_pickup", "delivering"])} tone="purple" />
            <StatusCell label="Đang thuê" value={countBy(["renting"])} tone="lotus" />
            <StatusCell label="Chờ kiểm tra" value={countBy(["returned", "inspection_pending"])} tone="orange" />
            <StatusCell label="Hoàn thành" value={countBy(["completed"])} tone="jade" />
          </div>
          <div className="mt-6 flex items-start gap-4 rounded-r-lg border-l-4 border-lotus bg-[#fff4ef] p-4">
            <span className="material-symbols-outlined mt-0.5 text-lotus">warning</span>
            <div>
              <h3 className="text-sm font-semibold text-ink">Cảnh Báo Vận Hành</h3>
              <p className="mt-1 text-sm text-stone-600">
                {bookingsNeedingAssets.length > 0
                  ? `${bookingsNeedingAssets.length} đơn đang chờ gán tài sản. Cần xử lý ngay để không trễ tiến độ giao trang phục.`
                  : "Không có cảnh báo. Tất cả đơn đang chờ đều đã được gán tài sản."}
              </p>
              {bookingsNeedingAssets.length > 0 && (
                <button type="button" onClick={() => onGoToTab("assets")} className="mt-2 text-sm font-semibold text-lotus underline hover:text-oxblood">
                  Đi tới kho trang phục →
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-sand bg-white p-6 shadow-[0_4px_12px_rgba(74,4,4,0.03)]">
          <h2 className="mb-6 font-display text-2xl text-ink">Truy Cập Nhanh</h2>
          <div className="flex flex-1 flex-col gap-3">
            <ShortcutButton icon="inventory_2" label="Kho trang phục" badge={bookingsNeedingAssets.length} tone="bronze" onClick={() => onGoToTab("assets")} />
            <ShortcutButton icon="fact_check" label="Nhật ký kiểm tra" tone="jade" onClick={() => onGoToTab("inspection-log")} />
            <ShortcutButton icon="bar_chart" label="Báo cáo tài chính" tone="antique" onClick={() => onGoToTab("finance")} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Inventory (split layout)
// ═══════════════════════════════════════════════════════════════════════════════

function InventoryTab({
  garments, categories, selectedGarmentId, onSelectGarment,
  assets, assetsLoading, selectedAssetId, onSelectAsset,
  selectedAsset, assetHistory, assetHistoryLoading,
  onCreateGarment, onEditGarment, onCreateAsset, onUpdateAssetStatus,
  garmentModalOpen, editingGarment, onCloseGarmentModal, onSubmitGarment, submitting,
  assetModalOpen, onCloseAssetModal, onSubmitAsset,
}: {
  garments: GarmentSummary[];
  categories: GarmentCategory[];
  selectedGarmentId: string | null;
  onSelectGarment: (id: string) => void;
  assets: AssetDetail[];
  assetsLoading: boolean;
  selectedAssetId: string | null;
  onSelectAsset: (id: string | null) => void;
  selectedAsset: AssetDetail | null;
  assetHistory: AssetInspectionHistory[];
  assetHistoryLoading: boolean;
  onCreateGarment: () => void;
  onEditGarment: (g: GarmentSummary) => void;
  onCreateAsset: () => void;
  onUpdateAssetStatus: (assetId: string, status: string) => Promise<void>;
  garmentModalOpen: boolean;
  editingGarment: GarmentDetail | null;
  onCloseGarmentModal: () => void;
  onSubmitGarment: (
    id: string | null,
    payload: Parameters<typeof createGarment>[0],
    imagesToAdd: string[],
    imageIdsToRemove: string[],
  ) => Promise<void>;
  submitting: boolean;
  assetModalOpen: boolean;
  onCloseAssetModal: () => void;
  onSubmitAsset: (payload: Parameters<typeof createAsset>[0]) => Promise<void>;
}) {
  const [garmentSearch, setGarmentSearch] = useState("");
  const [assetSearch, setAssetSearch] = useState("");
  const [assetStatusFilter, setAssetStatusFilter] = useState("all");

  const filteredGarments = useMemo(() => {
    const q = garmentSearch.trim().toLowerCase();
    return q
      ? garments.filter((g) => [g.name, g.categoryName, g.sizeLabel].some((v) => v?.toLowerCase().includes(q)))
      : garments;
  }, [garments, garmentSearch]);

  const filteredAssets = useMemo(() => {
    const q = assetSearch.trim().toLowerCase();
    return assets.filter((asset) => {
      const byText = q ? [asset.assetCode, asset.garmentName, asset.conditionNote].some((v) => v?.toLowerCase().includes(q)) : true;
      const byStatus = assetStatusFilter === "all" ? true : asset.status === assetStatusFilter;
      return byText && byStatus;
    });
  }, [assets, assetSearch, assetStatusFilter]);

  const selectedGarment = garments.find((g) => g.id === selectedGarmentId) ?? null;

  return (
    <div className="flex h-[calc(100vh-240px)] -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden border-y border-sand bg-white">
      {/* Left Pane: Garment Catalog Grid */}
      <section className="w-1/2 flex flex-col border-r border-sand bg-warm-ivory">
        <div className="p-4 border-b border-sand bg-surface-container-low sticky top-0 z-10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl text-ink">Danh mục Tuyệt tác</h2>
            <span className="text-xs text-stone-500">{garments.length} mẫu</span>
          </div>
          <button type="button" onClick={onCreateGarment} className="flex items-center gap-1 rounded-lg bg-lotus px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-oxblood">
            <span className="material-symbols-outlined text-[16px]">add</span>
            Thêm trang phục
          </button>
        </div>
        <div className="border-b border-sand bg-white px-4 py-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-stone-400">search</span>
            <input value={garmentSearch} onChange={(e) => setGarmentSearch(e.target.value)} className="w-full rounded-lg border border-sand bg-[#fff8f6] py-2 pl-10 pr-3 text-sm outline-none focus:border-antique" placeholder="Tìm trang phục, danh mục, size..." />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {filteredGarments.length === 0 ? (
            <div className="py-20 text-center text-stone-400">Chưa có trang phục.</div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredGarments.map((g) => {
                const isSelected = g.id === selectedGarmentId;
                return (
                  <div
                    key={g.id}
                    className={`group rounded-lg border overflow-hidden text-left transition relative ${
                      isSelected ? "border-lotus ring-2 ring-lotus/20" : "border-outline-variant hover:shadow-md"
                    }`}
                  >
                  <button
                    type="button"
                    onClick={() => onSelectGarment(g.id)}
                    className="w-full text-left"
                  >
                    <div className="aspect-[3/4] relative overflow-hidden bg-[#f8dcd8]">
                      {g.images && g.images.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={g.images[0].imageUrl} alt={g.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-surface-container-highest">
                          <span className="material-symbols-outlined text-[48px] text-antique/30">checkroom</span>
                        </div>
                      )}
                      <div className="absolute top-2 left-2 rounded bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-ink backdrop-blur-sm">
                        {g.categoryName ?? "Trang phục"}
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-display text-base text-ink line-clamp-1">{g.name}</h3>
                      <div className="mt-1 text-xs text-stone-500">Size: {g.sizeLabel ?? "—"}</div>
                      <div className="mt-2 flex justify-between items-center border-t border-surface-variant pt-2 text-xs">
                        <span className="font-semibold text-lotus">{formatVND(g.dailyPrice)}/ngày</span>
                        <span className="text-stone-500">Cọc {formatVND(g.depositAmount)}</span>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditGarment(g)}
                    className="absolute top-2 right-2 rounded-md bg-white/90 backdrop-blur-sm p-1.5 text-stone-500 hover:text-lotus transition"
                    aria-label="Chỉnh sửa"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Right Pane: Asset Inventory Table + Detail Drawer */}
      <section className="w-1/2 flex flex-col bg-surface">
        <div className="p-4 border-b border-sand bg-surface-container-low sticky top-0 z-10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl text-ink">Quản lý Hiện vật</h2>
            <span className="text-xs text-stone-500">{assets.length} tài sản</span>
          </div>
          {selectedGarmentId && (
            <button type="button" onClick={onCreateAsset} className="flex items-center gap-1 rounded-lg bg-lotus px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-oxblood">
              <span className="material-symbols-outlined text-[16px]">add</span>
              Thêm tài sản
            </button>
          )}
        </div>
        <div className="border-b border-sand bg-white px-4 py-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-stone-400">search</span>
              <input value={assetSearch} onChange={(e) => setAssetSearch(e.target.value)} className="w-full rounded-lg border border-sand bg-[#fff8f6] py-2 pl-10 pr-3 text-sm outline-none focus:border-antique" placeholder="Tìm mã tài sản..." />
            </div>
            <select value={assetStatusFilter} onChange={(e) => setAssetStatusFilter(e.target.value)} className="rounded-lg border border-sand bg-white px-3 py-2 text-sm outline-none focus:border-antique" aria-label="Lọc trạng thái tài sản">
              <option value="all">Tất cả</option>
              {Object.entries(ASSET_STATUS_META).map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}
            </select>
          </div>
        </div>

        {assetsLoading ? (
          <div className="flex-1 flex items-center justify-center text-sm text-stone-400">Đang tải...</div>
        ) : filteredAssets.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm text-stone-400">
            {selectedGarmentId ? "Chưa có tài sản cho mẫu này." : "Chọn một mẫu trang phục."}
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Asset table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-highest border-b border-outline-variant sticky top-0">
                  <tr>
                    <th className="font-label-sm text-label-sm text-on-surface-variant py-3 px-4 font-semibold uppercase tracking-wider">Mã hiện vật</th>
                    <th className="font-label-sm text-label-sm text-on-surface-variant py-3 px-4 font-semibold uppercase tracking-wider">Trạng thái</th>
                    <th className="font-label-sm text-label-sm text-on-surface-variant py-3 px-4 font-semibold uppercase tracking-wider">Tình trạng</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-body-sm">
                  {filteredAssets.map((a) => {
                    const sm = ASSET_STATUS_META[a.status] ?? { label: a.status, color: "bg-stone-100 text-stone-600" };
                    const isSelected = a.id === selectedAssetId;
                    return (
                      <tr
                        key={a.id}
                        onClick={() => onSelectAsset(isSelected ? null : a.id)}
                        className={`border-b border-outline-variant cursor-pointer transition-colors ${
                          isSelected ? "bg-surface-container hover:bg-surface-container-high" : "hover:bg-surface-container-high"
                        }`}
                      >
                        <td className={`py-4 px-4 font-label-md text-label-md text-on-surface border-l-4 ${isSelected ? "border-primary" : "border-transparent"}`}>
                          {a.assetCode}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${sm.color}`}>
                            {sm.label}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-on-surface-variant">
                          {a.conditionNote ?? (a.status === "available" ? "Tốt" : "—")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Side Detail Drawer */}
            {selectedAsset && (
              <aside className="w-80 bg-surface-container-low border-l border-outline-variant flex flex-col flex-shrink-0 shadow-[-4px_0_15px_-3px_rgba(74,4,4,0.05)] z-20">
                <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-warm-ivory">
                  <h3 className="font-display text-lg text-ink">{selectedAsset.assetCode}</h3>
                  <button type="button" onClick={() => onSelectAsset(null)} className="text-stone-500 hover:text-lotus">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
                  {/* Garment preview */}
                  <div className="overflow-hidden rounded border border-outline-variant bg-[#f8dcd8]">
                    <div className="aspect-square">
                      {selectedGarment?.images && selectedGarment.images.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={selectedGarment.images[0].imageUrl} alt={selectedGarment.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-surface-container-highest">
                          <span className="material-symbols-outlined text-[48px] text-antique/30">checkroom</span>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-outline-variant bg-white px-3 py-2 text-xs text-stone-500">
                      {selectedGarment?.name ?? selectedAsset.garmentName}
                    </div>
                  </div>

                  {/* Status with update control */}
                  <div>
                    <label className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1 block">Cập nhật trạng thái</label>
                    <select
                      value={selectedAsset.status}
                      onChange={(e) => onUpdateAssetStatus(selectedAsset.id, e.target.value)}
                      className="w-full rounded-lg border border-sand bg-white px-3 py-2 text-sm outline-none focus:border-antique"
                    >
                      {Object.entries(ASSET_STATUS_META).map(([key, meta]) => (
                        <option key={key} value={key}>{meta.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Trang phục</span>
                      <span className="font-medium text-ink">{selectedAsset.garmentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Size</span>
                      <span className="font-medium text-ink">{selectedAsset.sizeLabel ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Giá thuê</span>
                      <span className="font-medium text-lotus">{formatVND(selectedAsset.dailyPrice)}/ngày</span>
                    </div>
                    {selectedAsset.conditionNote && (
                      <div className="flex justify-between">
                        <span className="text-stone-500">Ghi chú</span>
                        <span className="font-medium text-ink text-right max-w-[180px]">{selectedAsset.conditionNote}</span>
                      </div>
                    )}
                  </div>

                  {/* Condition History */}
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface border-b border-outline-variant pb-2 mb-3">Lịch sử kiểm tra</h4>
                    {assetHistoryLoading ? (
                      <p className="text-xs text-stone-400">Đang tải...</p>
                    ) : assetHistory.length === 0 ? (
                      <p className="text-xs text-stone-400">Chưa có lịch kiểm tra.</p>
                    ) : (
                      <div className="relative pl-5 border-l border-outline-variant ml-2 space-y-4">
                        {assetHistory.slice(0, 5).map((h) => (
                          <div key={h.id} className="relative">
                            <div className={`absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full border-2 border-surface-container-low ${
                              h.status === "completed" ? "bg-antique-gold" : "bg-outline"
                            }`} />
                            <div className="font-label-sm text-label-sm text-on-surface-variant mb-1">
                              {h.createdAt.slice(0, 10)} — {h.status === "completed" ? "Đã kiểm tra" : h.status}
                            </div>
                            <div className="font-body-sm text-body-sm text-on-surface bg-surface p-2 rounded border border-surface-variant">
                              {h.findings.length > 0
                                ? (() => { const total = h.findings.reduce((sum, f) => sum + f.penaltyAmount, 0); return `${h.findings.length} ghi nhận${total > 0 ? ` · Phạt ${formatVND(total)}` : ""}`; })()
                                : "Không có ghi nhận"}
                              {h.inspectorName && <span className="block text-xs text-stone-400 mt-1">Bởi: {h.inspectorName}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </aside>
            )}
          </div>
        )}
      </section>

      {/* Garment Create/Edit Modal */}
      {garmentModalOpen && (
        <GarmentFormModal
          garment={editingGarment}
          categories={categories}
          submitting={submitting}
          onClose={onCloseGarmentModal}
          onSubmit={(payload, imagesToAdd, imageIdsToRemove) => onSubmitGarment(editingGarment?.id ?? null, payload, imagesToAdd, imageIdsToRemove)}
        />
      )}

      {/* Asset Create Modal */}
      {assetModalOpen && selectedGarmentId && (
        <AssetFormModal
          garmentName={garments.find((g) => g.id === selectedGarmentId)?.name ?? "—"}
          garmentId={selectedGarmentId}
          submitting={submitting}
          onClose={onCloseAssetModal}
          onSubmit={onSubmitAsset}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Modal: Garment Create/Edit
// ═══════════════════════════════════════════════════════════════════════════════

function GarmentFormModal({
  garment, categories, submitting, onClose, onSubmit,
}: {
  garment: GarmentDetail | null;
  categories: GarmentCategory[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (
    payload: Parameters<typeof createGarment>[0],
    imagesToAdd: string[],
    imageIdsToRemove: string[],
  ) => void;
}) {  const [name, setName] = useState(garment?.name ?? "");
  const [categoryId, setCategoryId] = useState(garment?.categoryId ?? "");
  const [description, setDescription] = useState(garment?.description ?? "");
  const [sizeLabel, setSizeLabel] = useState(garment?.sizeLabel ?? "");
  const [color, setColor] = useState(garment?.color ?? "");
  const [dailyPrice, setDailyPrice] = useState(String(garment?.dailyPrice ?? ""));
  const [depositAmount, setDepositAmount] = useState(String(garment?.depositAmount ?? ""));
  
  const [existingImages, setExistingImages] = useState(garment?.images ?? []);
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name,
      categoryId: categoryId || undefined,
      description: description || undefined,
      sizeLabel: sizeLabel || undefined,
      color: color || undefined,
      dailyPrice: Number(dailyPrice),
      depositAmount: Number(depositAmount),
    }, pendingImages, removedImageIds);
  }

  function handleRemoveExistingImage(imageId: string) {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    setRemovedImageIds((prev) => (prev.includes(imageId) ? prev : [...prev, imageId]));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploadingImage(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.success && data.url) {
          setPendingImages((prev) => [...prev, data.url]);
        } else {
          alert("Upload thất bại: " + (data.message || JSON.stringify(data)));
        }
      }
    } catch (err: any) {
      alert("Lỗi upload: " + err.message);
    } finally {
      e.target.value = "";
      setUploadingImage(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-sand bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-display text-2xl text-ink">{garment ? "Sửa trang phục" : "Thêm trang phục mới"}</h3>
          <button type="button" onClick={onClose} className="text-stone-500 hover:text-lotus">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500">Tên trang phục *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-antique" placeholder="Vd: Nhật Bình Hoàng Phái" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500">Danh mục</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-lg border border-sand bg-white px-3 py-2 text-sm outline-none focus:border-antique">
              <option value="">— Chọn danh mục —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <p className="mt-1 text-xs text-stone-400">Danh mục dùng để phân loại trang phục.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500">Size</label>
              <input value={sizeLabel} onChange={(e) => setSizeLabel(e.target.value)} className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-antique" placeholder="Vd: M, L" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500">Màu</label>
              <input value={color} onChange={(e) => setColor(e.target.value)} className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-antique" placeholder="Vd: Đỏ" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500">Giá thuê/ngày (VNĐ) *</label>
              <input value={dailyPrice} onChange={(e) => setDailyPrice(e.target.value)} required type="number" min={0} className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-antique" placeholder="350000" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500">Tiền cọc (VNĐ) *</label>
              <input value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} required type="number" min={0} className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-antique" placeholder="1000000" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500">Mô tả</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-antique" placeholder="Mô tả trang phục..." />
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-sand bg-[#fff8f6] p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h4 className="text-sm font-semibold text-ink">Ảnh trang phục</h4>
              <p className="text-xs text-stone-500">Ảnh hiện có và ảnh mới sẽ được quản lý riêng.</p>
            </div>
            <span className="text-xs text-stone-400">{existingImages.length + pendingImages.length} ảnh</span>
          </div>

          {existingImages.length > 0 && (
            <div className="mt-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Ảnh hiện có</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {existingImages.map((img, index) => (
                  <div key={img.id} className="group relative overflow-hidden rounded border border-sand bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.imageUrl} alt={img.altText ?? "Ảnh trang phục"} className="h-24 w-full object-cover" />
                    <div className="absolute left-2 top-2 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-ink">
                      {index === 0 ? "Ảnh chính" : `Ảnh ${index + 1}`}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(img.id)}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                      aria-label="Xóa ảnh"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pendingImages.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Ảnh mới</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {pendingImages.map((imgUrl, i) => (
                  <div key={`${imgUrl}-${i}`} className="group relative overflow-hidden rounded border border-lotus bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl} alt="Pending" className="h-24 w-full object-cover opacity-90" />
                    <button
                      type="button"
                      onClick={() => setPendingImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                      aria-label="Xóa ảnh mới"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded border border-sand bg-white p-3">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-500">Tải ảnh lên (File)</label>
              <input type="file" accept="image/*" multiple onChange={handleFileUpload} disabled={uploadingImage} className="block w-full text-xs text-stone-500 file:mr-3 file:rounded file:border-0 file:bg-sand/30 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-ink hover:file:bg-sand/50" />
              {uploadingImage && <p className="mt-1 text-[10px] text-stone-400">Đang tải lên...</p>}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-sand px-5 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-50">Hủy</button>
          <button type="submit" disabled={submitting} className="rounded-lg bg-lotus px-6 py-2.5 text-sm font-semibold text-white hover:bg-oxblood disabled:opacity-50">
            {submitting ? "Đang lưu..." : garment ? "Lưu thay đổi" : "Tạo trang phục"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Modal: Asset Create
// ═══════════════════════════════════════════════════════════════════════════════

function AssetFormModal({
  garmentId, garmentName, submitting, onClose, onSubmit,
}: {
  garmentId: string;
  garmentName: string;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: Parameters<typeof createAsset>[0]) => void;
}) {
  const [assetCode, setAssetCode] = useState("");
  const [conditionNote, setConditionNote] = useState("");
  const [purchaseCost, setPurchaseCost] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      garmentId,
      assetCode,
      conditionNote: conditionNote || undefined,
      purchaseCost: purchaseCost ? Number(purchaseCost) : undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-sand bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-display text-2xl text-ink">Thêm tài sản mới</h3>
          <button type="button" onClick={onClose} className="text-stone-500 hover:text-lotus">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <p className="mb-4 text-sm text-stone-500">Trang phục: <strong className="text-ink">{garmentName}</strong></p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500">Mã tài sản *</label>
            <input value={assetCode} onChange={(e) => setAssetCode(e.target.value)} required className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-antique" placeholder="Vd: NB-005" />
            <p className="mt-1 text-xs text-stone-400">Mã duy nhất cho món đồ vật lý.</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500">Ghi chú tình trạng</label>
            <input value={conditionNote} onChange={(e) => setConditionNote(e.target.value)} className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-antique" placeholder="Vd: Mới 100%" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-500">Giá mua (VNĐ)</label>
            <input value={purchaseCost} onChange={(e) => setPurchaseCost(e.target.value)} type="number" min={0} className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-antique" placeholder="Vd: 5000000" />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-sand px-5 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-50">Hủy</button>
          <button type="submit" disabled={submitting} className="rounded-lg bg-jade px-6 py-2.5 text-sm font-semibold text-white hover:bg-forest disabled:opacity-50">
            {submitting ? "Đang tạo..." : "Tạo tài sản"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Inspection Log
// ═══════════════════════════════════════════════════════════════════════════════

function InspectionLogTab({ log, loading }: { log: InspectionLogEntry[]; loading: boolean }) {
  return (
    <div className="space-y-4">
      {loading ? (
        <div className="py-20 text-center text-stone-400">Đang tải...</div>
      ) : log.length === 0 ? (
        <div className="py-20 text-center text-stone-400">Chưa có phiên kiểm tra nào.</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-sand bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fff8f6] text-xs uppercase tracking-[0.14em] text-stone-500">
              <tr>
                <th className="px-6 py-3">Mã tài sản</th>
                <th className="px-6 py-3">Trang phục</th>
                <th className="px-6 py-3">Trạng thái</th>
                <th className="px-6 py-3">Người kiểm tra</th>
                <th className="px-6 py-3">Ghi nhận</th>
                <th className="px-6 py-3">Phạt</th>
                <th className="px-6 py-3">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {log.map((entry) => (
                <tr key={entry.id} className="transition hover:bg-[#fff8f6]">
                  <td className="px-6 py-4 font-semibold text-ink">{entry.assetCode}</td>
                  <td className="px-6 py-4 text-stone-600">{entry.garmentName}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      entry.status === "completed" ? "bg-jade/10 text-jade" : "bg-amber-100 text-amber-700"
                    }`}>
                      {entry.status === "completed" ? "Hoàn tất" : entry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-stone-600">{entry.inspectorName ?? "—"}</td>
                  <td className="px-6 py-4 text-stone-600">{entry.findingsCount}</td>
                  <td className="px-6 py-4 text-red-700">{entry.totalPenalty > 0 ? formatVND(entry.totalPenalty) : "—"}</td>
                  <td className="px-6 py-4 text-stone-500">{entry.createdAt.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Laundry Queue
// ═══════════════════════════════════════════════════════════════════════════════

function LaundryTab({
  tickets, loading, actioningId, onComplete,
}: {
  tickets: LaundryTicketResponse[];
  loading: boolean;
  actioningId: string | null;
  onComplete: (id: string) => Promise<void>;
}) {
  return (
    <div className="space-y-4">
      {loading ? (
        <div className="py-20 text-center text-stone-400">Đang tải...</div>
      ) : tickets.length === 0 ? (
        <div className="py-20 text-center text-stone-400">Không có đồ cần giặt sấy.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((t) => (
            <div key={t.id} className="rounded-xl border border-sand bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-ink">{t.assetCode}</p>
                  <p className="text-sm text-stone-500">{t.garmentName}</p>
                </div>
                <span className="rounded-full bg-state-laundry/10 text-state-laundry px-2 py-0.5 text-xs font-semibold">
                  {t.status === "open" ? "Chờ giặt" : "Đang giặt"}
                </span>
              </div>
              {t.note && <p className="mt-2 text-xs text-stone-500">{t.note}</p>}
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  disabled={actioningId === t.id}
                  onClick={() => onComplete(t.id)}
                  className="rounded-lg bg-jade px-4 py-2 text-xs font-semibold text-white transition hover:bg-forest disabled:opacity-50"
                >
                  {actioningId === t.id ? "..." : "Hoàn tất giặt"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Damaged / Maintenance
// ═══════════════════════════════════════════════════════════════════════════════

function DamagedTab({
  jobs, loading, actioningId, onComplete,
}: {
  jobs: MaintenanceJobResponse[];
  loading: boolean;
  actioningId: string | null;
  onComplete: (id: string, status: string) => Promise<void>;
}) {
  return (
    <div className="space-y-4">
      {loading ? (
        <div className="py-20 text-center text-stone-400">Đang tải...</div>
      ) : jobs.length === 0 ? (
        <div className="py-20 text-center text-stone-400">Không có tài sản hư hỏng hoặc bảo trì.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((j) => (
            <div key={j.id} className="rounded-xl border border-sand bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-ink">{j.assetCode}</p>
                  <p className="text-sm text-stone-500">{j.garmentName}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  j.status === "open" ? "bg-red-100 text-red-700" :
                  j.status === "in_progress" ? "bg-amber-100 text-amber-700" :
                  "bg-jade/10 text-jade"
                }`}>
                  {j.status === "open" ? "Cần xử lý" : j.status === "in_progress" ? "Đang sửa" : "Hoàn tất"}
                </span>
              </div>
              {j.note && <p className="mt-2 text-xs text-stone-500">{j.note}</p>}
              <div className="mt-4 flex gap-2 justify-end">
                {j.status !== "completed" && j.status !== "cannot_repair" && (
                  <>
                    <button
                      type="button"
                      disabled={actioningId === j.id}
                      onClick={() => onComplete(j.id, "completed")}
                      className="rounded-lg bg-jade px-3 py-2 text-xs font-semibold text-white transition hover:bg-forest disabled:opacity-50"
                    >
                      {actioningId === j.id ? "..." : "Hoàn tất"}
                    </button>
                    <button
                      type="button"
                      disabled={actioningId === j.id}
                      onClick={() => onComplete(j.id, "cannot_repair")}
                      className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      Không sửa được
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Finance
// ═══════════════════════════════════════════════════════════════════════════════

function FinanceTab({
  totalRentalRevenue, totalDepositHeld, totalPenalties,
  activeBookings, bookings,
}: {
  totalRentalRevenue: number;
  totalDepositHeld: number;
  totalPenalties: number;
  activeBookings: StaffBookingResponse[];
  bookings: StaffBookingResponse[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-sand bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Doanh thu cho thuê</p>
          <p className="mt-2 font-display text-3xl text-jade">{formatVND(totalRentalRevenue)}</p>
          <p className="mt-1 text-sm text-stone-500">Từ các đơn completed + đang thuê</p>
        </div>
        <div className="rounded-xl border border-sand bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Tiền cọc đang giữ</p>
          <p className="mt-2 font-display text-3xl text-amber-700">{formatVND(totalDepositHeld)}</p>
          <p className="mt-1 text-sm text-stone-500">{activeBookings.length} đơn đang active</p>
        </div>
        <div className="rounded-xl border border-sand bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Tiền phạt phát sinh</p>
          <p className="mt-2 font-display text-3xl text-red-700">{formatVND(totalPenalties)}</p>
          <p className="mt-1 text-sm text-stone-500">Từ các lần kiểm tra phát hiện hư hỏng</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-sand bg-white shadow-sm">
        <div className="border-b border-sand px-6 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">Đối soát đơn gần đây</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fff8f6] text-xs uppercase tracking-[0.14em] text-stone-500">
              <tr>
                <th className="px-6 py-3">Mã đơn</th>
                <th className="px-6 py-3">Khách hàng</th>
                <th className="px-6 py-3">Tiền thuê</th>
                <th className="px-6 py-3">Tiền cọc</th>
                <th className="px-6 py-3">Phạt</th>
                <th className="px-6 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-stone-400">Chưa có đơn nào.</td>
                </tr>
              ) : (
                bookings.slice().reverse().map((b) => {
                  const s = STATUS_LABELS[b.status] ?? { label: b.status, color: "bg-stone-100 text-stone-600" };
                  return (
                    <tr key={b.id} className="transition hover:bg-[#fff8f6]">
                      <td className="px-6 py-4 font-semibold text-ink">#{b.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-6 py-4 text-stone-600">{b.customerName ?? "—"}</td>
                      <td className="px-6 py-4 text-ink">{formatVND(b.rentalTotal)}</td>
                      <td className="px-6 py-4 text-stone-600">{formatVND(b.depositTotal)}</td>
                      <td className="px-6 py-4 text-red-700">{(b.penaltyTotal ?? 0) > 0 ? formatVND(b.penaltyTotal ?? 0) : "—"}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${s.color}`}>{s.label}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Shared presentational components
// ═══════════════════════════════════════════════════════════════════════════════

const TONE_CLASSES: Record<string, { text: string; bg: string; bar: string }> = {
  lotus:   { text: "text-lotus",   bg: "bg-[#ffe9e6]", bar: "bg-lotus" },
  antique: { text: "text-antique", bg: "bg-[#fdf5db]", bar: "bg-antique" },
  jade:    { text: "text-jade",    bg: "bg-[#e6f0f0]", bar: "bg-jade" },
  bronze:  { text: "text-bronze",  bg: "bg-[#f0ece6]", bar: "bg-bronze" },
};

function QuickWorkItem({ icon, label, value, tone, onClick }: { icon: string; label: string; value: number; tone: "amber" | "orange" | "blue" | "red"; onClick: () => void }) {
  const cls = {
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    blue: "bg-sky-50 text-sky-700 border-sky-200",
    red: "bg-red-50 text-red-700 border-red-200",
  }[tone];
  return (
    <button type="button" onClick={onClick} className={`flex items-center justify-between rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${cls}`}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-80">{label}</p>
        <p className="mt-1 font-display text-3xl">{value}</p>
      </div>
      <span className="material-symbols-outlined text-3xl opacity-70">{icon}</span>
    </button>
  );
}

function SnapshotCard({
  label, value, hint, icon, tone, progress,
}: {
  label: string; value: string; hint: string; icon: string;
  tone: "lotus" | "antique" | "jade" | "bronze";
  progress?: number | null;
}) {
  const t = TONE_CLASSES[tone];
  return (
    <div className="relative overflow-hidden rounded-xl border border-sand bg-white p-6 shadow-[0_4px_12px_rgba(74,4,4,0.03)]">
      <div className="mb-4 flex items-start justify-between">
        <span className="text-sm font-semibold text-stone-500">{label}</span>
        <span className={`material-symbols-outlined rounded-lg p-2 ${t.text} ${t.bg}`}>{icon}</span>
      </div>
      <div className="mb-2 font-display text-3xl text-ink">{value}</div>
      {typeof progress === "number" ? (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#fee2dd]">
          <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${progress}%` }} />
        </div>
      ) : (
        <div className="text-sm text-stone-500">{hint}</div>
      )}
      {typeof progress === "number" && <div className="mt-2 text-sm text-stone-500">{hint}</div>}
    </div>
  );
}

const CELL_TONES: Record<string, { num: string; bg: string; border: string }> = {
  amber:   { num: "text-amber-700",   bg: "bg-[#fff7ed]", border: "border-[#fde6c8]" },
  purple:  { num: "text-purple-700",  bg: "bg-[#f5f3ff]", border: "border-[#e8e2ff]" },
  lotus:   { num: "text-lotus",       bg: "bg-[#ffe9e6]", border: "border-[#f7d2cd]" },
  orange:  { num: "text-orange-700",  bg: "bg-[#fff4ed]", border: "border-[#feddc6]" },
  jade:    { num: "text-jade",        bg: "bg-[#eaf5f1]", border: "border-[#cfe7df]" },
};

function StatusCell({ label, value, tone }: { label: string; value: number; tone: keyof typeof CELL_TONES }) {
  const t = CELL_TONES[tone];
  return (
    <div className={`flex flex-col items-center justify-center rounded-lg border p-4 ${t.bg} ${t.border}`}>
      <span className={`font-display text-2xl ${t.num}`}>{value}</span>
      <span className={`mt-1 text-center text-xs font-semibold uppercase ${t.num}`}>{label}</span>
    </div>
  );
}

function ShortcutButton({
  icon, label, badge, tone, onClick,
}: {
  icon: string; label: string; badge?: number;
  tone: "bronze" | "jade" | "antique";
  onClick: () => void;
}) {
  const hover = { bronze: "hover:border-bronze", jade: "hover:border-jade", antique: "hover:border-antique" }[tone];
  return (
    <button type="button" onClick={onClick}
      className={`group flex w-full items-center justify-between rounded-lg border border-sand p-4 transition hover:bg-[#fff8f6] ${hover}`}>
      <div className="flex items-center gap-3">
        <div className={`rounded-md bg-[#f4eee6] p-2 ${TONE_CLASSES[tone].text} transition group-hover:bg-current`}>
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        <span className="text-sm font-semibold text-ink">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {typeof badge === "number" && badge > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-xs text-white">{badge}</span>
        )}
        <span className="material-symbols-outlined text-stone-400 group-hover:text-current">arrow_forward</span>
      </div>
    </button>
  );
}




// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Refunds (Duyệt hoàn cọc)
// ═══════════════════════════════════════════════════════════════════════════════

function RefundCard({
  refund,
  approvingId,
  handleApproveRefund,
}: {
  refund: any;
  approvingId: string | null;
  handleApproveRefund: (id: string, proofImageUrl: string, approveNote: string) => void;
}) {
  const [proofImageUrl, setProofImageUrl] = useState("");
  const [approveNote, setApproveNote] = useState("");

  function formatVND(amount: number) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-sand bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sand bg-[#fff8f6] px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-ink">#{refund.bookingId.slice(0, 8).toUpperCase()}</span>
          <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] bg-yellow-100 text-yellow-700">
            Chờ duyệt
          </span>
        </div>
        <span className="text-xs text-stone-400">
          Yêu cầu lúc {new Date(refund.createdAt).toLocaleString("vi-VN")}
        </span>
      </div>

      <div className="grid gap-6 p-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Khách hàng</p>
          <p className="mt-1 font-medium text-ink">{refund.booking.customerName ?? "—"}</p>
          {refund.booking.customerPhone && (
            <p className="text-sm text-stone-500">{refund.booking.customerPhone}</p>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Số tiền hoàn</p>
          <p className="mt-1 font-display text-2xl text-jade">{formatVND(refund.amount)}</p>
          <p className="text-sm text-stone-500">
            Cọc: {formatVND(refund.booking.depositTotal)} — Phạt: {formatVND(refund.booking.penaltyTotal)}
          </p>
        </div>
      </div>

      <div className="border-t border-sand bg-[#fff8f6] px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 mb-3">
          Thông tin chuyển khoản
        </p>
        <div className="grid gap-3 sm:grid-cols-3 text-sm">
          <div>
            <span className="text-stone-500">Ngân hàng: </span>
            <span className="font-medium text-ink">{refund.bankName ?? "—"}</span>
          </div>
          <div>
            <span className="text-stone-500">Số TK: </span>
            <span className="font-medium text-ink">{refund.bankAccountNumber ?? "—"}</span>
          </div>
          <div>
            <span className="text-stone-500">Chủ TK: </span>
            <span className="font-medium text-ink">{refund.bankAccountHolder ?? "—"}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-sand px-6 py-4 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-stone-500">
            Ảnh bill chuyển khoản (URL)
          </label>
          <input
            className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-antique"
            placeholder="Dán URL ảnh chụp giao dịch chuyển khoản..."
            value={proofImageUrl}
            onChange={(e) => setProofImageUrl(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-stone-500">
            Ghi chú (tuỳ chọn)
          </label>
          <input
            className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-antique"
            placeholder="Ghi chú nội bộ..."
            value={approveNote}
            onChange={(e) => setApproveNote(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            disabled={approvingId === refund.id || !proofImageUrl.trim()}
            onClick={() => handleApproveRefund(refund.id, proofImageUrl, approveNote)}
            className="rounded-lg bg-jade px-6 py-3 text-sm font-semibold text-white transition hover:bg-forest disabled:opacity-50"
          >
            {approvingId === refund.id ? "Đang xử lý..." : `Duyệt hoàn cọc ${formatVND(refund.amount)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function RefundsTab({
  pendingRefunds,
  loadingRefunds,
  handleApproveRefund,
  approvingId,
}: {
  pendingRefunds: any[];
  loadingRefunds: boolean;
  handleApproveRefund: (id: string, proofImageUrl: string, approveNote: string) => void;
  approvingId: string | null;
}) {
  return (
    <div className="space-y-6">
      {loadingRefunds ? (
        <div className="py-20 text-center text-stone-400">Đang tải danh sách hoàn cọc...</div>
      ) : pendingRefunds.length === 0 ? (
        <div className="py-20 text-center text-stone-400">
          <span className="material-symbols-outlined text-5xl text-stone-200 mb-4 block">check_circle</span>
          Không có yêu cầu hoàn cọc nào đang chờ duyệt.
        </div>
      ) : (
        pendingRefunds.map((refund) => (
          <RefundCard
            key={refund.id}
            refund={refund}
            approvingId={approvingId}
            handleApproveRefund={handleApproveRefund}
          />
        ))
      )}
    </div>
  );
}
