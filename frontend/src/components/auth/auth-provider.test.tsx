import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { clearAuthSession, storeAuthSession } from "@/lib/auth";

vi.mock("@/lib/api", () => ({
  apiRequest: vi.fn(),
}));

import { apiRequest } from "@/lib/api";
import { AuthProvider, useAuth } from "./auth-provider";

function Probe() {
  const { status, user } = useAuth();

  return (
    <div>
      <p data-testid="status">{status}</p>
      <p data-testid="name">{user?.fullName ?? "none"}</p>
    </div>
  );
}

describe("AuthProvider", () => {
  afterEach(() => {
    clearAuthSession();
    vi.clearAllMocks();
  });

  it("hydrates the stored session and refreshes the current user", async () => {
    storeAuthSession({
      accessToken: "jwt-token",
      user: {
        id: "user-1",
        email: "customer@example.com",
        role: "customer",
        isActive: true,
        fullName: null,
        phone: null,
      },
    });
    vi.mocked(apiRequest).mockResolvedValue({
      success: true,
      data: {
        id: "user-1",
        email: "customer@example.com",
        role: "customer",
        isActive: true,
        fullName: "Nguyen Van A",
        phone: "0909000000",
      },
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    expect(screen.getByTestId("status")).toHaveTextContent("loading");
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(screen.getByTestId("name")).toHaveTextContent("Nguyen Van A");
    expect(apiRequest).toHaveBeenCalledWith("/auth/me", {
      authToken: "jwt-token",
      cache: "no-store",
    });
  });

  it("clears the stored session when refresh fails", async () => {
    storeAuthSession({
      accessToken: "expired-token",
      user: {
        id: "user-1",
        email: "customer@example.com",
        role: "customer",
        isActive: true,
        fullName: null,
        phone: null,
      },
    });
    vi.mocked(apiRequest).mockResolvedValue({
      success: false,
      error: "UNAUTHORIZED",
      message: "Invalid token",
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"));
    expect(screen.getByTestId("name")).toHaveTextContent("none");
    expect(window.localStorage.getItem("co_phuc_auth_session")).toBeNull();
  });
});
