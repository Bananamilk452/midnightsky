// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const mockBack = vi.fn();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
}));

vi.mock("lucide-react", () => ({
  ArrowLeftIcon: ({ onClick, className }: { onClick?: () => void; className?: string }) => (
    <svg data-testid="arrow-left" onClick={onClick} className={className} />
  ),
}));

import BackButton from "@/components/BackButton";

describe("BackButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the button with arrow icon", () => {
    render(<BackButton />);

    expect(screen.getByTestId("arrow-left")).toBeInTheDocument();
  });

  it("should call router.back when history has entries", () => {
    Object.defineProperty(window, "history", {
      value: { length: 5 },
      writable: true,
    });

    render(<BackButton />);
    fireEvent.click(screen.getByTestId("arrow-left"));

    expect(mockBack).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should call router.push('/') when history is empty", () => {
    Object.defineProperty(window, "history", {
      value: { length: 1 },
      writable: true,
    });

    render(<BackButton />);
    fireEvent.click(screen.getByTestId("arrow-left"));

    expect(mockPush).toHaveBeenCalledWith("/");
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("should apply custom class names", () => {
    const { container } = render(
      <BackButton buttonClassName="btn-class" iconClassName="icon-class" />,
    );

    const button = container.querySelector("button");
    expect(button).toHaveClass("btn-class");

    const icon = screen.getByTestId("arrow-left");
    expect(icon).toHaveClass("icon-class");
  });
});
