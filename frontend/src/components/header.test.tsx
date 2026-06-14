import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Header } from "./header";

const usePathnameMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

describe("Header", () => {
  beforeEach(() => {
    usePathnameMock.mockReset();
  });

  it("renders public navigation links on the landing page", () => {
    usePathnameMock.mockReturnValue("/");
    render(createElement(Header));

    expect(screen.getByRole("link", { name: "Cổ Phục Rental" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Di sản" })).toHaveAttribute("href", "/#di-san");
    expect(screen.getByRole("link", { name: "Bộ sưu tập" })).toHaveAttribute("href", "/#bo-suu-tap");
    expect(screen.getByRole("link", { name: "Tài khoản" })).toHaveAttribute("href", "/login");
  });

  it("hides the header on auth routes", () => {
    usePathnameMock.mockReturnValue("/login");
    const { container } = render(createElement(Header));

    expect(container).toBeEmptyDOMElement();
  });
});
