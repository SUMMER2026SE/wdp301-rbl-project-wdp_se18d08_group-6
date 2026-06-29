import { apiRequest } from "./api";
import { readStoredAccessToken } from "./auth";
import { getChatSocket } from "./socket";

export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  deleted_at?: string | null;
  deleted_by?: string | null;
  message_type?: string;
  metadata?: {
    bucket?: string;
    path?: string;
    mimetype?: string;
    size?: number;
    url?: string | null;
  } | null;
  user_accounts?: {
    id: string;
    email: string;
    role: string;
    profile?: { fullName?: string | null };
  };
};

export type ChatConversation = {
  id: string;
  customerId: string;
  customerName: string;
  staffId: string | null;
  staffName: string | null;
  status: string;
  updatedAt: string;
  lastMessage: ChatMessage | null;
  unreadCount: number;
  topic?: string;
  garmentId?: string | null;
  garmentName?: string | null;
  bookingId?: string | null;
};

export type ConversationLockStatus = {
  isLocked: boolean;
  lockedBy: { staffId: string; name: string } | null;
  lockedAt: string | null;
  expiresAt: string | null;
};

export type ProductCardMessage = {
  type: "product_card";
  product: {
    id: string;
    name: string;
    image: string;
    size: string | null;
    price: number;
    detailUrl: string;
  };
};

export type BookingCardMessage = {
  type: "booking_card";
  topic?: string;
  booking: {
    id: string;
    code: string;
    status: string;
    statusLabel: string;
    rentalStartDate: string;
    rentalEndDate: string;
    days: number;
    itemCount: number;
    rentalTotal: number;
    depositTotal: number;
    detailUrl?: string;
  };
};

const DEFAULT_PRODUCT_IMAGE = "https://dep.com.vn/wp-content/uploads/2020/11/ao-dai-9.jpg";

/**
 * Detect if a message content is a product card.
 */
export function isProductCardContent(content: string): boolean {
  try {
    const parsed = JSON.parse(content);
    return parsed?.type === "product_card";
  } catch {
    return false;
  }
}

/**
 * Parse product card data from message content.
 */
export function parseProductCard(content: string): ProductCardMessage["product"] | null {
  try {
    const parsed = JSON.parse(content);
    if (parsed?.type === "product_card" && parsed?.product) {
      return parsed.product;
    }
    return null;
  } catch {
    return null;
  }
}

export function isBookingCardContent(content: string): boolean {
  try {
    const parsed = JSON.parse(content);
    return parsed?.type === "booking_card";
  } catch {
    return false;
  }
}

export function parseBookingCard(content: string): BookingCardMessage["booking"] | null {
  try {
    const parsed = JSON.parse(content);
    if (parsed?.type === "booking_card" && parsed?.booking) {
      return parsed.booking;
    }
    return null;
  } catch {
    return null;
  }
}

export async function sendBookingCardMessage(params: {
  conversationId: string;
  bookingId: string;
  topic: "booking_support" | "complaint";
}) {
  return apiRequest<ChatMessage>(`/chat/conversations/${params.conversationId}/booking-card`, {
    method: "POST",
    body: JSON.stringify({ bookingId: params.bookingId, topic: params.topic }),
  });
}

/**
 * Send a product card message to the chat conversation via REST API.
 * The backend will query the real garment data from DB and create the message,
 * preventing clients from forging product details.
 *
 * Dispatches a custom DOM event so that CustomerChatProvider can add the
 * message to local state immediately, regardless of socket timing.
 */
export async function sendProductCardMessage(params: {
  conversationId: string;
  productId: string;
}) {
  const result = await apiRequest<ChatMessage>(`/chat/conversations/${params.conversationId}/product-card`, {
    method: "POST",
    body: JSON.stringify({ garmentId: params.productId }),
  });

  // Dispatch custom event so CustomerChatProvider picks it up in real time
  // if (result.success && result.data) {
  //   window.dispatchEvent(
  //     new CustomEvent("chat:message_received", {
  //       detail: {
  //         conversationId: params.conversationId,
  //         message: result.data,
  //       },
  //     }),
  //   );
  // }

  return result;
}

export async function getMyChatConversation() {
  return apiRequest<ChatConversation>("/chat/conversations/me");
}

export async function createChatConversation() {
  return apiRequest<ChatConversation>("/chat/conversations", { method: "POST" });
}

export async function getChatConversations() {
  return apiRequest<ChatConversation[]>("/chat/conversations");
}

export async function getConversationMessages(conversationId: string, before?: string, limit = 15) {
  const searchParams = new URLSearchParams();
  if (before) searchParams.set("before", before);
  if (limit) searchParams.set("limit", String(limit));

  return apiRequest<ChatMessage[]>(`/chat/conversations/${conversationId}/messages?${searchParams.toString()}`);
}

export async function markConversationRead(conversationId: string) {
  return apiRequest<{ id: string }>(`/chat/conversations/${conversationId}/read`, {
    method: "PATCH",
  });
}

export async function getConversationLockStatus(conversationId: string) {
  return apiRequest<ConversationLockStatus>(`/chat/conversations/${conversationId}/lock-status`);
}

export async function uploadChatFile(conversationId: string, file: File) {
  const token = readStoredAccessToken();
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${apiBase}/chat/conversations/${conversationId}/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Upload failed");
  }

  return (await res.json()) as { success: boolean; data: ChatMessage };
}