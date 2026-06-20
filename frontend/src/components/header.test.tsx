import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Header } from "./header";

const usePathnameMock = vi.fn();
const useAuthMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => useAuthMock(),
}));

describe("Header", () => {
  beforeEach(() => {
    usePathnameMock.mockReset();
    useAuthMock.mockReturnValue({
      session: null,
      signOut: vi.fn(),
      status: "unauthenticated",
    });
  });

  it("renders public navigation links on the landing page", () => {
    usePathnameMock.mockReturnValue("/");
    render(createElement(Header));

    expect(screen.getByRole("link", { name: "Cổ Phục Rental" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Di sản" })).toHaveAttribute("href", "/#di-san");
    expect(screen.getByRole("link", { name: "Bộ sưu tập" })).toHaveAttribute("href", "/#bo-suu-tap");
    expect(screen.getByRole("link", { name: "Tài khoản" })).toHaveAttribute("href", "/login");
  });

  it.each(["/login", "/register", "/verify-email", "/forgot-password", "/reset-password"])('hides the header on auth route %s', (pathname) => {
    usePathnameMock.mockReturnValue(pathname);
    const { container } = render(createElement(Header));

    expect(container).toBeEmptyDOMElement();
  });
});
