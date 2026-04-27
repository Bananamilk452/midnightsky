// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("lucide-react", () => ({
  ImageIcon: () => <svg data-testid="image-icon" />,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key === "addImage" ? "Add Image" : key,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe("ImageButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importComponent() {
    const { ImageButton } = await import("@/components/writer/ImageButton");
    return ImageButton;
  }

  it("should render button with image icon", async () => {
    const ImageButton = await importComponent();
    render(<ImageButton setImage={vi.fn()} />);

    expect(screen.getByTestId("image-icon")).toBeInTheDocument();
    expect(screen.getByText("Add Image")).toBeInTheDocument();
  });

  it("should have a hidden file input", async () => {
    const ImageButton = await importComponent();
    const { container } = render(<ImageButton setImage={vi.fn()} />);

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("accept", "image/*");
    expect(input).toHaveClass("hidden");
  });

  it("should trigger file input on button click", async () => {
    const ImageButton = await importComponent();
    render(<ImageButton setImage={vi.fn()} />);

    const button = screen.getByRole("button");
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click");

    fireEvent.click(button);

    expect(clickSpy).toHaveBeenCalled();
  });
});
