import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockCreateChatSocket = vi.fn();
const mockDisconnectChatSocket = vi.fn();
const mockGetChatConversations = vi.fn();
const mockGetConversationMessages = vi.fn();
const mockGetConversationLockStatus = vi.fn();
const mockGetMyChatConversation = vi.fn();

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({
    status: "authenticated",
    session: {
      accessToken: "token",
      user: { id: "staff-1", email: "staff@example.com", role: "staff", isActive: true, fullName: "Staff One", phone: null },
    },
  }),
}));

vi.mock("@/lib/socket", () => ({
  createChatSocket: (...args: unknown[]) => mockCreateChatSocket(...args),
  disconnectChatSocket: () => mockDisconnectChatSocket(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@/lib/chat", () => ({
  getChatConversations: () => mockGetChatConversations(),
  getConversationMessages: (conversationId: string) => mockGetConversationMessages(conversationId),
  getConversationLockStatus: (conversationId: string) => mockGetConversationLockStatus(conversationId),
  getMyChatConversation: () => mockGetMyChatConversation(),
}));

const mockSocket = {
  connected: true,
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
};

beforeEach(() => {
  mockCreateChatSocket.mockReturnValue(mockSocket);
  mockDisconnectChatSocket.mockClear();
  mockSocket.on.mockClear();
  mockSocket.off.mockClear();
  mockSocket.emit.mockClear();
  mockGetChatConversations.mockReset();
  mockGetConversationMessages.mockReset();
  mockGetConversationLockStatus.mockReset();
  mockGetMyChatConversation.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("ChatPage", () => {
  it("renders staff conversation list and joins a conversation", async () => {
    mockGetChatConversations.mockResolvedValue({
      success: true,
      data: [
        {
          id: "conv-1",
          customerId: "cust-1",
          customerName: "Khách 1",
          staffId: null,
          staffName: null,
          status: "open",
          updatedAt: "2026-01-01T00:00:00.000Z",
          lastMessage: { id: "msg-1", conversation_id: "conv-1", sender_id: "cust-1", content: "Xin chào", created_at: "2026-01-01T00:00:00.000Z" },
          unreadCount: 1,
        },
      ],
    });

    mockGetConversationMessages.mockResolvedValue({
      success: true,
      data: [
        {
          id: "msg-1",
          conversation_id: "conv-1",
          sender_id: "cust-1",
          content: "Xin chào",
          created_at: "2026-01-01T00:00:00.000Z",
        },
      ],
    });

    mockGetConversationLockStatus.mockResolvedValue({
      success: true,
      data: { isLocked: false, lockedBy: null, lockedAt: null, expiresAt: null },
    });

    const { default: ChatPage } = await import("./page");

    render(<ChatPage />);

    await waitFor(() => expect(mockGetChatConversations).toHaveBeenCalled());

    expect(screen.getByText("Cần trả lời")).toBeInTheDocument();
    expect(screen.getByText("Chờ tiếp nhận")).toBeInTheDocument();

    // Verify count badges are displayed
    expect(screen.getAllByText("0")).toHaveLength(3); // needs_reply + awaiting_reply + resolved
    expect(screen.getByText("1")).toBeInTheDocument(); // unassigned count

    await userEvent.click(screen.getByText("Chờ tiếp nhận"));
    expect(await screen.findByText("Khách hàng: Khách 1")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Khách hàng: Khách 1"));
    await waitFor(() => expect(mockGetConversationMessages).toHaveBeenCalledWith("conv-1"));
    expect(mockSocket.emit).toHaveBeenCalledWith("join_room", { conversationId: "conv-1" });
  });
});
