import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const replace = vi.fn();
let pathname = "/dashboard/customer";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ replace }),
}));

vi.mock("./auth-provider", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "./auth-provider";
import { ProtectedPage } from "./protected-page";

const mockedUseAuth = vi.mocked(useAuth);

describe("ProtectedPage", () => {
  beforeEach(() => {
    pathname = "/dashboard/customer";
    replace.mockReset();
  });

  it("redirects guests to login with the current path", async () => {
    mockedUseAuth.mockReturnValue({
      status: "unauthenticated",
      session: null,
      user: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
      replaceUser: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(
      <ProtectedPage allowedRoles={["customer"]}>
        <div>Customer content</div>
      </ProtectedPage>,
    );

    expect(screen.getByText("Loading your account...")).toBeInTheDocument();
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login?next=%2Fdashboard%2Fcustomer"));
  });

  it("renders children when the authenticated role is allowed", () => {
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

    render(
      <ProtectedPage allowedRoles={["customer"]}>
        <div>Customer content</div>
      </ProtectedPage>,
    );

    expect(screen.getByText("Customer content")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects authenticated users away from disallowed pages", async () => {
    mockedUseAuth.mockReturnValue({
      status: "authenticated",
      session: {
        accessToken: "jwt-token",
        user: {
          id: "user-2",
          email: "staff@example.com",
          role: "staff",
          isActive: true,
          fullName: "Tran Staff",
          phone: null,
        },
      },
      user: {
        id: "user-2",
        email: "staff@example.com",
        role: "staff",
        isActive: true,
        fullName: "Tran Staff",
        phone: null,
      },
      signIn: vi.fn(),
      signOut: vi.fn(),
      replaceUser: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(
      <ProtectedPage allowedRoles={["customer"]}>
        <div>Customer content</div>
      </ProtectedPage>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard/staff"));
  });
});
