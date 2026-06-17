import { readStoredAccessToken } from "./auth";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export type ApiRequestOptions = RequestInit & {
  authToken?: string | null;
};

function buildHeaders(init?: ApiRequestOptions) {
  const headers = new Headers(init?.headers);

  if (!(init?.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const accessToken = init?.authToken === undefined ? readStoredAccessToken() : init.authToken;
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return Object.fromEntries(headers.entries());
}

export async function apiRequest<T>(path: string, init?: ApiRequestOptions): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: buildHeaders(init),
  });

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok) {
    return {
      success: false,
      error: payload?.error ?? "REQUEST_FAILED",
      message: payload?.message ?? `Request failed with status ${response.status}`,
    };
  }

  return payload ?? { success: true };
}

// ---------- Garment types ----------

export type GarmentSummary = {
  id: string;
  name: string;
  categoryName: string | null;
  sizeLabel: string | null;
  dailyPrice: number;
  depositAmount: number;
};

export async function getGarments() {
  return apiRequest<GarmentSummary[]>("/garments");
}

export async function getGarmentById(id: string) {
  return apiRequest<GarmentSummary>(`/garments/${id}`);
}

// ---------- Booking types ----------

export type BookingItem = {
  id: string;
  garmentId: string;
  garmentName: string | null;
  sizeLabel: string | null;
  dailyPrice: number;
  depositAmount: number;
  garmentAssetId?: string | null;
  assetCode?: string | null;
  assetStatus?: string | null;
  conditionNote?: string | null;
};

export type BookingResponse = {
  id: string;
  status: string;
  rentalStartDate: string;
  rentalEndDate: string;
  days: number;
  pickupMethod: string;
  rentalTotal: number;
  depositTotal: number;
  penaltyTotal?: number;
  note: string | null;
  createdAt: string;
  items: BookingItem[];
};

export type AvailabilityResponse = {
  garmentId: string;
  available: boolean;
  conflictDates: { bookingId: string; startDate: string; endDate: string }[];
};

// ---------- Booking API functions ----------

export async function checkAvailability(garmentId: string, startDate: string, endDate: string) {
  return apiRequest<AvailabilityResponse>("/bookings/check-availability", {
    method: "POST",
    body: JSON.stringify({ garmentId, startDate, endDate }),
  });
}

export async function createBooking(payload: {
  garmentId: string;
  startDate: string;
  endDate: string;
  pickupMethod?: string;
  note?: string;
}) {
  return apiRequest<BookingResponse>("/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMyBookings() {
  return apiRequest<BookingResponse[]>("/bookings/me");
}

export async function getBooking(id: string) {
  return apiRequest<BookingResponse>(`/bookings/${id}`);
}

export async function cancelBooking(id: string) {
  return apiRequest<BookingResponse>(`/bookings/${id}/cancel`, { method: "PATCH" });
}

// ---------- Staff Booking types ----------

export type StaffBookingResponse = BookingResponse & {
  customerName: string | null;
  customerPhone: string | null;
};

// ---------- Staff Booking API functions ----------

export async function getStaffPendingBookings() {
  return apiRequest<StaffBookingResponse[]>("/bookings/staff/pending");
}

export async function getStaffAllBookings() {
  return apiRequest<StaffBookingResponse[]>("/bookings/staff/all");
}

export async function advanceBookingStatus(id: string, status: string, note?: string) {
  return apiRequest<BookingResponse>(`/bookings/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, ...(note ? { note } : {}) }),
  });
}

export async function markBookingPaid(
  id: string,
  paymentMethod: string,
  note?: string,
) {
  return apiRequest<BookingResponse>(`/bookings/${id}/mark-paid`, {
    method: "PATCH",
    body: JSON.stringify({ paymentMethod, ...(note ? { note } : {}) }),
  });
}

export async function getStaffReturnBookings() {
  return apiRequest<StaffBookingResponse[]>("/bookings/staff/returns");
}

// ---------- Inspection types ----------

export type InspectionAsset = {
  id: string;
  assetCode: string;
  status: string;
  conditionNote: string | null;
  garment: {
    id: string;
    name: string;
    sizeLabel: string | null;
  };
};

export type InspectionBooking = {
  id: string;
  status: string;
  customerName: null;
  rentalStartDate: string;
  rentalEndDate: string;
  items: {
    id: string;
    garmentId: string;
    garmentName: string | null;
    sizeLabel: string | null;
    assetCode: string | null;
  }[];
};

export type InspectionFindingResponse = {
  id: string;
  findingType: string;
  severity: string;
  description: string | null;
  penaltyAmount: number;
  createdAt: string;
};

export type InspectionPhotoResponse = {
  id: string;
  imageUrl: string;
  note: string | null;
  createdAt: string;
};

export type InspectionSessionResponse = {
  id: string;
  bookingId: string;
  garmentAssetId: string;
  status: string;
  note: string | null;
  createdAt: string;
  completedAt: string | null;
  inspector: {
    id: string;
    fullName: string;
  } | null;
  asset: InspectionAsset;
  booking: InspectionBooking;
  findings: InspectionFindingResponse[];
  photos: InspectionPhotoResponse[];
};

// ---------- Inspection API functions ----------

export async function getBookingInspections(bookingId: string) {
  return apiRequest<InspectionSessionResponse[]>(`/inspections/booking/${bookingId}`);
}

export async function createInspectionSession(payload: {
  bookingId: string;
  garmentAssetId: string;
  note?: string;
}) {
  return apiRequest<InspectionSessionResponse>("/inspections", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function addInspectionFinding(
  sessionId: string,
  payload: {
    findingType: string;
    severity?: string;
    description?: string;
    penaltyAmount?: number;
  },
) {
  return apiRequest<InspectionFindingResponse>(`/inspections/${sessionId}/findings`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function addInspectionPhoto(
  sessionId: string,
  payload: {
    imageUrl: string;
    note?: string;
  },
) {
  return apiRequest<InspectionPhotoResponse>(`/inspections/${sessionId}/photos`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function completeInspection(
  sessionId: string,
  payload: {
    finalAssetStatus: string;
    note?: string;
  },
) {
  return apiRequest<InspectionSessionResponse>(`/inspections/${sessionId}/complete`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// ---------- Asset management types ----------

export type AvailableAsset = {
  id: string;
  assetCode: string;
  status: string;
  conditionNote: string | null;
};

// ---------- Asset API functions ----------

export async function getAvailableAssets(garmentId: string) {
  return apiRequest<AvailableAsset[]>(`/garments/${garmentId}/assets/available`);
}

export async function assignAssetToBookingItem(
  bookingId: string,
  itemId: string,
  garmentAssetId: string,
) {
  return apiRequest<BookingResponse>(`/bookings/${bookingId}/items/${itemId}/assign-asset`, {
    method: "PATCH",
    body: JSON.stringify({ garmentAssetId }),
  });
}
