// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockToggleSidebar = vi.fn();

vi.mock("lucide-react", () => ({
  MenuIcon: () => <svg data-testid="menu-icon" />,
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} data-testid="logo" />,
}));

vi.mock("@/components/ui/sidebar", () => ({
  useSidebar: () => ({ toggleSidebar: mockToggleSidebar }),
}));

describe("HomeHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importComponent() {
    const { HomeHeader } = await import("@/components/home/HomeHeader");
    return HomeHeader;
  }

  it("should render logo image", async () => {
    const HomeHeader = await importComponent();
    render(<HomeHeader />);

    expect(screen.getByTestId("logo")).toHaveAttribute("src", "/images/logo.png");
    expect(screen.getByTestId("logo")).toHaveAttribute("alt", "MidnightSky Logo");
  });

  it("should render menu toggle button", async () => {
    const HomeHeader = await importComponent();
    render(<HomeHeader />);

    expect(screen.getByTestId("menu-icon")).toBeInTheDocument();
  });

  it("should call toggleSidebar on menu click", async () => {
    const HomeHeader = await importComponent();
    render(<HomeHeader />);

    const menuButton = screen.getByTestId("menu-icon").closest("button")!;
    fireEvent.click(menuButton);

    expect(mockToggleSidebar).toHaveBeenCalledOnce();
  });
});
