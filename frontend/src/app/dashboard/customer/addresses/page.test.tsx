import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  apiRequest: vi.fn(),
}));

import { useAuth } from "@/components/auth/auth-provider";
import { apiRequest } from "@/lib/api";
import CustomerAddressesPage from "./page";

const mockedUseAuth = vi.mocked(useAuth);

describe("CustomerAddressesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      status: "authenticated",
      session: {
        accessToken: "jwt-token",
        user: {
          id: "user-1",
          email: "customer@example.com",
          role: "customer",
          isActive: true,
          fullName: "Nguyen Van A",
          phone: null,
        },
      },
      user: {
        id: "user-1",
        email: "customer@example.com",
        role: "customer",
        isActive: true,
        fullName: "Nguyen Van A",
        phone: null,
      },
      signIn: vi.fn(),
      signOut: vi.fn(),
      replaceUser: vi.fn(),
      refreshUser: vi.fn(),
    });
  });

  it("loads the address book and creates a new default address", async () => {
    vi.mocked(apiRequest)
      .mockResolvedValueOnce({
        success: true,
        data: [
          {
            id: "address-1",
            receiverName: "Nguyen Van A",
            phone: "0909000000",
            line1: "123 Le Loi",
            ward: null,
            district: "District 1",
            city: "Ho Chi Minh City",
            isDefault: true,
            createdAt: "2026-06-12T00:00:00.000Z",
          },
        ],
      })
      .mockResolvedValueOnce({
        success: true,
        data: {
          id: "address-2",
          receiverName: "Kha Tran",
          phone: "0911222333",
          line1: "456 Nguyen Hue",
          ward: null,
          district: null,
          city: "Ho Chi Minh City",
          isDefault: true,
          createdAt: "2026-06-13T00:00:00.000Z",
        },
      })
      .mockResolvedValueOnce({
        success: true,
        data: [
          {
            id: "address-2",
            receiverName: "Kha Tran",
            phone: "0911222333",
            line1: "456 Nguyen Hue",
            ward: null,
            district: null,
            city: "Ho Chi Minh City",
            isDefault: true,
            createdAt: "2026-06-13T00:00:00.000Z",
          },
          {
            id: "address-1",
            receiverName: "Nguyen Van A",
            phone: "0909000000",
            line1: "123 Le Loi",
            ward: null,
            district: "District 1",
            city: "Ho Chi Minh City",
            isDefault: false,
            createdAt: "2026-06-12T00:00:00.000Z",
          },
        ],
      });
    const user = userEvent.setup();

    render(<CustomerAddressesPage />);

    await waitFor(() => expect(screen.getByText("123 Le Loi, District 1, Ho Chi Minh City")).toBeInTheDocument());
    await user.type(screen.getByLabelText(/Tên người nhận/i), "Kha Tran");
    await user.type(screen.getByLabelText(/SĐT người nhận/i), "0911222333");
    await user.type(screen.getByLabelText(/Địa chỉ cụ thể/i), "456 Nguyen Hue");
    await user.type(screen.getByLabelText(/Tỉnh\/Thành phố/i), "Ho Chi Minh City");
    await user.click(screen.getByRole("button", { name: /Lưu địa chỉ mới/i }));

    await waitFor(() => expect(apiRequest).toHaveBeenNthCalledWith(2, "/users/me/addresses", {
      method: "POST",
      body: JSON.stringify({
        receiverName: "Kha Tran",
        phone: "0911222333",
        line1: "456 Nguyen Hue",
        ward: null,
        district: null,
        city: "Ho Chi Minh City",
        isDefault: false,
      }),
    }));
    await waitFor(() => expect(screen.getByText("456 Nguyen Hue, Ho Chi Minh City")).toBeInTheDocument());
    expect(screen.getByText(/Thêm địa chỉ thành công/i)).toBeInTheDocument();
  });
});
