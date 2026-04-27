// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@radix-ui/react-visually-hidden", () => ({
  VisuallyHidden: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@radix-ui/react-dialog", () => ({
  DialogTitle: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("lucide-react", () => ({
  XIcon: () => <button data-testid="close-button">Close</button>,
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open, onOpenChange }: any) => (
    <div data-testid="dialog" data-open={open}>{children}</div>
  ),
  DialogClose: ({ children, asChild }: any) => <div>{children}</div>,
  DialogContent: ({ children, onClick }: any) => (
    <div data-testid="dialog-content" onClick={onClick}>{children}</div>
  ),
  DialogDescription: ({ children }: any) => <div>{children}</div>,
  DialogTrigger: ({ children, onClick }: any) => (
    <div data-testid="dialog-trigger" onClick={onClick}>{children}</div>
  ),
}));

describe("FeedImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importComponent() {
    const { FeedImage } = await import("@/components/feed/embed/Image");
    return FeedImage;
  }

  it("should render single image", async () => {
    const FeedImage = await importComponent();
    const content = {
      images: [
        { fullsize: "https://example.com/img1.jpg", alt: "Image 1" },
      ],
    } as any;

    const { container } = render(<FeedImage content={content} />);

    const imgs = container.querySelectorAll("img[alt='Image 1']");
    expect(imgs.length).toBeGreaterThanOrEqual(1);
    expect(imgs[0]).toHaveAttribute("src", "https://example.com/img1.jpg");
  });

  it("should render two images in grid", async () => {
    const FeedImage = await importComponent();
    const content = {
      images: [
        { fullsize: "https://example.com/img1.jpg", alt: "Image 1" },
        { fullsize: "https://example.com/img2.jpg", alt: "Image 2" },
      ],
    } as any;

    const { container } = render(<FeedImage content={content} />);

    const imgs1 = container.querySelectorAll("img[alt='Image 1']");
    const imgs2 = container.querySelectorAll("img[alt='Image 2']");
    expect(imgs1.length).toBeGreaterThanOrEqual(1);
    expect(imgs2.length).toBeGreaterThanOrEqual(1);
  });

  it("should render four images in 2x2 grid", async () => {
    const FeedImage = await importComponent();
    const content = {
      images: [
        { fullsize: "https://example.com/1.jpg", alt: "1" },
        { fullsize: "https://example.com/2.jpg", alt: "2" },
        { fullsize: "https://example.com/3.jpg", alt: "3" },
        { fullsize: "https://example.com/4.jpg", alt: "4" },
      ],
    } as any;

    const { container } = render(<FeedImage content={content} />);

    for (const alt of ["1", "2", "3", "4"]) {
      const imgs = container.querySelectorAll(`img[alt='${alt}']`);
      expect(imgs.length).toBeGreaterThanOrEqual(1);
    }
  });
});
