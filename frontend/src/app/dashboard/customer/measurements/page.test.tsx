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
import CustomerMeasurementsPage from "./page";

const mockedUseAuth = vi.mocked(useAuth);

describe("CustomerMeasurementsPage", () => {
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

  it("loads and saves the latest customer measurements", async () => {
    vi.mocked(apiRequest)
      .mockResolvedValueOnce({
        success: true,
        data: {
          id: "measurement-1",
          heightCm: 165.5,
          weightKg: 50,
          bustCm: 84,
          waistCm: 64,
          hipCm: 90,
          usualSize: "M",
          createdAt: "2026-06-12T00:00:00.000Z",
        },
      })
      .mockResolvedValueOnce({
        success: true,
        data: {
          id: "measurement-1",
          heightCm: 165.5,
          weightKg: 50,
          bustCm: 84,
          waistCm: 64,
          hipCm: 90,
          usualSize: "L",
          createdAt: "2026-06-13T00:00:00.000Z",
        },
      });
    const user = userEvent.setup();

    render(<CustomerMeasurementsPage />);

    await waitFor(() => expect(screen.getByLabelText("Usual size")).toHaveValue("M"));
    await user.clear(screen.getByLabelText("Usual size"));
    await user.type(screen.getByLabelText("Usual size"), "L");
    await user.click(screen.getByRole("button", { name: "Save measurements" }));

    await waitFor(() => expect(apiRequest).toHaveBeenNthCalledWith(2, "/users/me/measurements", {
      method: "PATCH",
      body: JSON.stringify({
        heightCm: 165.5,
        weightKg: 50,
        bustCm: 84,
        waistCm: 64,
        hipCm: 90,
        usualSize: "L",
      }),
    }));
    expect(screen.getByText("Measurements saved successfully.")).toBeInTheDocument();
  });
});
