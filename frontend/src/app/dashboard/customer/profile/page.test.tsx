import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const replaceUser = vi.fn();

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  apiRequest: vi.fn(),
}));

import { useAuth } from "@/components/auth/auth-provider";
import { apiRequest } from "@/lib/api";
import CustomerProfilePage from "./page";

const mockedUseAuth = vi.mocked(useAuth);

describe("CustomerProfilePage", () => {
  beforeEach(() => {
    replaceUser.mockReset();
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
          phone: "0909000000",
        },
      },
      user: {
        id: "user-1",
        email: "customer@example.com",
        role: "customer",
        isActive: true,
        fullName: "Nguyen Van A",
        phone: "0909000000",
      },
      signIn: vi.fn(),
      signOut: vi.fn(),
      replaceUser,
      refreshUser: vi.fn(),
    });
  });

  it("updates the customer profile and syncs the auth session", async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      success: true,
      data: {
        id: "user-1",
        email: "customer@example.com",
        role: "customer",
        isActive: true,
        fullName: "Kha Tran",
        phone: "0911222333",
      },
    });
    const user = userEvent.setup();

    render(<CustomerProfilePage />);

    await waitFor(() => expect(screen.getByLabelText("Full name")).toHaveValue("Nguyen Van A"));
    await user.clear(screen.getByLabelText("Full name"));
    await user.type(screen.getByLabelText("Full name"), "Kha Tran");
    await user.clear(screen.getByLabelText("Phone number"));
    await user.type(screen.getByLabelText("Phone number"), "0911222333");
    await user.click(screen.getByRole("button", { name: "Save profile" }));

    await waitFor(() => expect(apiRequest).toHaveBeenCalledWith("/users/me/profile", {
      method: "PATCH",
      body: JSON.stringify({
        fullName: "Kha Tran",
        phone: "0911222333",
      }),
    }));
    expect(replaceUser).toHaveBeenCalledWith({
      id: "user-1",
      email: "customer@example.com",
      role: "customer",
      isActive: true,
      fullName: "Kha Tran",
      phone: "0911222333",
    });
    expect(screen.getByText("Profile updated successfully.")).toBeInTheDocument();
  });
});
