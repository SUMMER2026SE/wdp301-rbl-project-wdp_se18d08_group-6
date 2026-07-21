import { describe, expect, it, vi } from "vitest";
import { ChatController } from "./chat.controller";
import { ok } from "../../common/api-response";

describe("ChatController", () => {
  const mockUser = { id: "user-1", email: "user@test.com", role: "staff" as const, isActive: true, fullName: "Staff One", phone: null };

  it("markRead calls service and returns ok response", async () => {
    const mockService = { markConversationRead: vi.fn().mockResolvedValue({ id: "conv-1" }) };
    const mockGateway = {};
    const controller = new ChatController(mockService as never, mockGateway as never);

    const result = await controller.markRead(mockUser, "conv-1");

    expect(mockService.markConversationRead).toHaveBeenCalledWith("user-1", "staff", "conv-1");
    expect(result).toEqual(ok({ id: "conv-1" }));
  });
});
