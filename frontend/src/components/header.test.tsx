import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
const signOut = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "@/components/auth/auth-provider";
import { Header } from "./header";

const mockedUseAuth = vi.mocked(useAuth);

describe("Header", () => {
  beforeEach(() => {
    push.mockReset();
    signOut.mockReset();
    mockedUseAuth.mockReturnValue({
      status: "unauthenticated",
      session: null,
      user: null,
      signIn: vi.fn(),
      signOut,
      replaceUser: vi.fn(),
      refreshUser: vi.fn(),
    });
  });

  it("renders public navigation links for guests", () => {
    render(<Header />);

    expect(screen.getByRole("link", { name: "Co Phuc ERP" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Catalog" })).toHaveAttribute("href", "/catalog");
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute("href", "/register");
  });

  it("shows account shortcuts and logs out authenticated customers", async () => {
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
      signOut,
      replaceUser: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(<Header />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard/customer");
    expect(screen.getByRole("link", { name: "My profile" })).toHaveAttribute("href", "/dashboard/customer/profile");

    await userEvent.click(screen.getByRole("button", { name: "Logout" }));

    expect(signOut).toHaveBeenCalledOnce();
    expect(push).toHaveBeenCalledWith("/login");
  });
});
