import { apiRequest } from "./api";
import { getChatSocket } from "./socket";

export type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
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

/**
 * Send a product card message to the chat conversation via WebSocket.
 * The card will be displayed as a rich product preview in the chat UI.
 */
export function sendProductCardMessage(params: {
  conversationId: string;
  productId: string;
  productName: string;
  productImage: string | null;
  sizeLabel: string | null;
  price: number;
  detailUrl: string;
}) {
  const socket = getChatSocket();
  if (!socket) return;

  const productCard: ProductCardMessage = {
    type: "product_card",
    product: {
      id: params.productId,
      name: params.productName,
      image: params.productImage || DEFAULT_PRODUCT_IMAGE,
      size: params.sizeLabel,
      price: params.price,
      detailUrl: params.detailUrl,
    },
  };

  socket.emit("send_message", {
    conversationId: params.conversationId,
    content: JSON.stringify(productCard),
  });
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

export async function getConversationLockStatus(conversationId: string) {
  return apiRequest<ConversationLockStatus>(`/chat/conversations/${conversationId}/lock-status`);
}