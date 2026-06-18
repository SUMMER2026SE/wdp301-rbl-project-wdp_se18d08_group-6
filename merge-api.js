const fs = require('fs');

let content = fs.readFileSync('frontend/src/lib/api.ts', 'utf8');

// The merged tail of api.ts
const mergedTail = `export async function getStaffCompletedRefundBookings() {
  return apiRequest<StaffBookingResponse[]>("/bookings/staff/completed-refunds");
}

// ---------- Refund types ----------

export type RefundResponse = {
  id: string;
  bookingId: string;
  amount: number;
  status: string;
  refundMethod: string;
  reason: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountHolder: string | null;
  proofImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  booking: {
    id: string;
    depositTotal: number;
    penaltyTotal: number;
    pickupMethod: string;
    customerName: string | null;
    customerPhone: string | null;
  };
  processedBy: string | null;
};

export type RefundCalculationResponse = {
  bookingId: string;
  depositTotal: number;
  penaltyTotal: number;
  refundAmount: number;
};

export type CustomerRefundResponse = {
  id: string;
  bookingId: string;
  amount: number;
  status: string;
  refundMethod: string;
  reason: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountHolder: string | null;
  createdAt: string;
  updatedAt: string;
};

// ---------- Refund API functions ----------

export async function calculateRefund(bookingId: string) {
  return apiRequest<RefundCalculationResponse>(\`/refunds/calculate/\${bookingId}\`, {
    method: "POST",
  });
}

export async function createRefund(payload: {
  bookingId: string;
  refundMethod: "cash" | "bank_transfer";
  reason?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
}) {
  return apiRequest<RefundResponse>("/refunds", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function approveRefund(
  refundId: string,
  payload: {
    status: "refunded" | "partially_refunded";
    proofImageUrl?: string;
    note?: string;
  },
) {
  return apiRequest<RefundResponse>(\`/refunds/\${refundId}/approve\`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getPendingStaffRefunds() {
  return apiRequest<RefundResponse[]>("/refunds/staff/pending");
}

export async function getPendingManagerRefunds() {
  return apiRequest<RefundResponse[]>("/refunds/manager/pending");
}

export async function getBookingRefunds(bookingId: string) {
  return apiRequest<RefundResponse[]>(\`/refunds/booking/\${bookingId}\`);
}

export async function getRefund(id: string) {
  return apiRequest<RefundResponse>(\`/refunds/\${id}\`);
}

export async function getCustomerRefund(bookingId: string) {
  return apiRequest<CustomerRefundResponse[]>(\`/refunds/customer/booking/\${bookingId}\`);
}

// ---------- Asset maintenance API functions ----------

export type AssetNeedingProcessing = {
  id: string;
  assetCode: string;
  status: string;
  conditionNote: string | null;
  garment: {
    id: string;
    name: string;
    sizeLabel: string | null;
  };
  hasOpenTicket: boolean;
};

export async function markAssetReady(assetId: string) {
  return apiRequest<{ id: string; assetCode: string; status: string; conditionNote: string | null }>(
    \`/inspections/assets/\${assetId}/mark-ready\`,
    { method: "PATCH" },
  );
}

export async function getAssetsNeedingProcessing() {
  return apiRequest<AssetNeedingProcessing[]>("/inspections/assets/needing-processing");
}

// ---------- Asset management types (extended) ----------

export type AssetDetail = {
  id: string;
  garmentId: string;
  garmentName: string;
  sizeLabel: string | null;
  dailyPrice: number;
  assetCode: string;
  status: string;
  conditionNote: string | null;
  purchaseCost: number | null;
  createdAt: string;
  updatedAt: string;
};

export type AssetInspectionHistory = {
  id: string;
  bookingId: string;
  status: string;
  note: string | null;
  createdAt: string;
  completedAt: string | null;
  inspectorName: string | null;
  bookingDates: { start: string; end: string };
  findings: {
    id: string;
    findingType: string;
    severity: string;
    penaltyAmount: number;
    createdAt: string;
  }[];
};

// ---------- Asset API functions (extended) ----------

export async function getAssetsByGarment(garmentId: string) {
  return apiRequest<AssetDetail[]>(\`/assets/by-garment/\${garmentId}\`);
}

export async function getAssetById(id: string) {
  return apiRequest<AssetDetail>(\`/assets/\${id}\`);
}

export async function getAssetInspectionHistory(assetId: string) {
  return apiRequest<AssetInspectionHistory[]>(\`/assets/\${assetId}/inspections\`);
}

export async function updateAssetStatus(
  assetId: string,
  status: string,
  note?: string,
) {
  return apiRequest<AssetDetail>(\`/assets/\${assetId}/status\`, {
    method: "PATCH",
    body: JSON.stringify({ status, ...(note ? { note } : {}) }),
  });
}

// ---------- Laundry types ----------

export type LaundryTicketResponse = {
  id: string;
  garmentAssetId: string;
  assetCode: string;
  garmentName: string;
  bookingId: string | null;
  bookingCode: string | null;
  status: string;
  note: string | null;
  createdAt: string;
  completedAt: string | null;
};

export async function getLaundryTickets() {
  return apiRequest<LaundryTicketResponse[]>("/inspections/laundry");
}

export async function completeLaundryTicket(
  ticketId: string,
  note?: string,
) {
  return apiRequest<LaundryTicketResponse>(\`/inspections/laundry/\${ticketId}/complete\`, {
    method: "PATCH",
    body: JSON.stringify({ ...(note ? { note } : {}) }),
  });
}

// ---------- Maintenance types ----------

export type MaintenanceJobResponse = {
  id: string;
  garmentAssetId: string;
  assetCode: string;
  garmentName: string;
  status: string;
  note: string | null;
  createdAt: string;
  completedAt: string | null;
};

export async function getMaintenanceJobs() {
  return apiRequest<MaintenanceJobResponse[]>("/inspections/maintenance");
}

export async function completeMaintenanceJob(
  jobId: string,
  status: string,
  note?: string,
) {
  return apiRequest<MaintenanceJobResponse>(\`/inspections/maintenance/\${jobId}/complete\`, {
    method: "PATCH",
    body: JSON.stringify({ status, ...(note ? { note } : {}) }),
  });
}

// ---------- Inspection log types ----------

export type InspectionLogEntry = {
  id: string;
  bookingId: string;
  assetCode: string;
  garmentName: string;
  status: string;
  inspectorName: string | null;
  findingsCount: number;
  totalPenalty: number;
  createdAt: string;
  completedAt: string | null;
};

export async function getInspectionLog() {
  return apiRequest<InspectionLogEntry[]>("/inspections/log");
}

// ---------- Garment management (Manager) ----------

export type GarmentImage = {
  id: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
};

export type GarmentDetail = GarmentSummary & {
  description: string | null;
  categoryId: string | null;
  color: string | null;
  isActive: boolean;
  images: GarmentImage[];
};

export type GarmentCategory = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

export async function getGarmentCategories() {
  return apiRequest<GarmentCategory[]>("/garments/categories");
}

export async function createGarment(payload: {
  name: string;
  categoryId?: string;
  description?: string;
  sizeLabel?: string;
  color?: string;
  dailyPrice: number;
  depositAmount: number;
  isActive?: boolean;
}) {
  return apiRequest<GarmentDetail>("/garments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateGarment(id: string, payload: {
  name?: string;
  categoryId?: string;
  description?: string;
  sizeLabel?: string;
  color?: string;
  dailyPrice?: number;
  depositAmount?: number;
  isActive?: boolean;
}) {
  return apiRequest<GarmentDetail>(\`/garments/\${id}\`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function addGarmentImage(garmentId: string, payload: {
  imageUrl: string;
  altText?: string;
  sortOrder?: string;
}) {
  return apiRequest<GarmentImage>(\`/garments/\${garmentId}/images\`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function removeGarmentImage(garmentId: string, imageId: string) {
  return apiRequest<{ id: string; deleted: boolean }>(\`/garments/\${garmentId}/images/\${imageId}\`, {
    method: "DELETE",
  });
}

export async function createGarmentCategory(name: string, description?: string) {
  return apiRequest<GarmentCategory>("/garments/categories", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
}

// ---------- Asset management (Manager) - extended ----------

export async function getAllAssets(status?: string) {
  const query = status ? \`?status=\${status}\` : "";
  return apiRequest<AssetDetail[]>(\`/assets\${query}\`);
}

export async function createAsset(payload: {
  garmentId: string;
  assetCode: string;
  conditionNote?: string;
  purchaseCost?: number;
}) {
  return apiRequest<AssetDetail>("/assets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
`;

const headMarker = '<<<<<<< HEAD';
const firstIndex = content.indexOf(headMarker);
if (firstIndex !== -1) {
  const newContent = content.substring(0, firstIndex) + mergedTail;
  fs.writeFileSync('frontend/src/lib/api.ts', newContent, 'utf8');
  console.log('Merged api.ts successfully');
} else {
  console.log('Could not find HEAD marker');
}
