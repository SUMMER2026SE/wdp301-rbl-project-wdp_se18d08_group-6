import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
const replace = vi.fn();
const signIn = vi.fn();
let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
  useSearchParams: () => ({
    get: (key: string) => searchParams.get(key),
  }),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  apiRequest: vi.fn(),
}));

import { useAuth } from "@/components/auth/auth-provider";
import { apiRequest } from "@/lib/api";
import LoginPage from "./page";

const mockedUseAuth = vi.mocked(useAuth);

describe("LoginPage", () => {
  beforeEach(() => {
    push.mockReset();
    replace.mockReset();
    signIn.mockReset();
    searchParams = new URLSearchParams();
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      status: "unauthenticated",
      session: null,
      user: null,
      signIn,
      signOut: vi.fn(),
      replaceUser: vi.fn(),
      refreshUser: vi.fn(),
    });
  });

  it("normalizes the email, stores the session, and redirects to the requested page", async () => {
    searchParams = new URLSearchParams("next=/dashboard/customer/addresses");
    vi.mocked(apiRequest).mockResolvedValue({
      success: true,
      data: {
        accessToken: "jwt-token",
        user: {
          id: "user-1",
          email: "customer@example.com",
          role: "customer",
        },
      },
    });
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "  CUSTOMER@example.com  ");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => expect(apiRequest).toHaveBeenCalled());
    expect(apiRequest).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "customer@example.com", password: "password123" }),
    });
    expect(signIn).toHaveBeenCalledWith({
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
    expect(push).toHaveBeenCalledWith("/dashboard/customer/addresses");
  });

  it("redirects authenticated users away from the login page", async () => {
    searchParams = new URLSearchParams("next=/dashboard/customer/profile");
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
      signIn,
      signOut: vi.fn(),
      replaceUser: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(<LoginPage />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard/customer/profile"));
  });
});
