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
