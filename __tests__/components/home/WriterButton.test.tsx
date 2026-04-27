// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockOpenWriter = vi.fn();

vi.mock("lucide-react", () => ({
  SquarePenIcon: () => <svg data-testid="pen-icon" />,
}));

vi.mock("@/components/providers/WriterProvider", () => ({
  useWriter: () => ({ openWriter: mockOpenWriter }),
}));

describe("WriterButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importComponent() {
    const { WriterButton } = await import("@/components/home/WriterButton");
    return WriterButton;
  }

  it("should render FAB button with pen icon", async () => {
    const WriterButton = await importComponent();
    render(<WriterButton />);

    expect(screen.getByTestId("pen-icon")).toBeInTheDocument();
  });

  it("should call openWriter on click", async () => {
    const WriterButton = await importComponent();
    render(<WriterButton />);

    fireEvent.click(screen.getByTestId("pen-icon").closest("div")!);

    expect(mockOpenWriter).toHaveBeenCalledOnce();
  });
});
