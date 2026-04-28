// @vitest-environment jsdom
import { AppBskyEmbedImages } from "@atproto/api";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeEmbedImagesView } from "@/__tests__/helpers/feed";

vi.mock("@radix-ui/react-visually-hidden", () => ({
  VisuallyHidden: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
}));

vi.mock("@radix-ui/react-dialog", () => ({
  DialogTitle: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

vi.mock("lucide-react", () => ({
  XIcon: () => <button data-testid="close-button">Close</button>,
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({
    children,
    open,
    onOpenChange,
  }: React.PropsWithChildren<{
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }>) => (
    <div data-testid="dialog" data-open={open}>
      {children}
    </div>
  ),
  DialogClose: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  DialogContent: ({
    children,
    onClick,
  }: React.PropsWithChildren<{ onClick?: React.MouseEventHandler }>) => (
    <div data-testid="dialog-content" onClick={onClick}>
      {children}
    </div>
  ),
  DialogDescription: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  DialogTrigger: ({
    children,
    onClick,
  }: React.PropsWithChildren<{ onClick?: React.MouseEventHandler }>) => (
    <div data-testid="dialog-trigger" onClick={onClick}>
      {children}
    </div>
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
    const content = makeEmbedImagesView({
      images: [
        { fullsize: "https://example.com/img1.jpg", alt: "Image 1", thumb: "" },
      ],
    });

    const { container } = render(<FeedImage content={content} />);

    const imgs = container.querySelectorAll("img[alt='Image 1']");
    expect(imgs.length).toBeGreaterThanOrEqual(1);
    expect(imgs[0]).toHaveAttribute("src", "https://example.com/img1.jpg");
  });

  it("should render two images in grid", async () => {
    const FeedImage = await importComponent();
    const content = makeEmbedImagesView({
      images: [
        { fullsize: "https://example.com/img1.jpg", alt: "Image 1", thumb: "" },
        { fullsize: "https://example.com/img2.jpg", alt: "Image 2", thumb: "" },
      ],
    });

    const { container } = render(<FeedImage content={content} />);

    const imgs1 = container.querySelectorAll("img[alt='Image 1']");
    const imgs2 = container.querySelectorAll("img[alt='Image 2']");
    expect(imgs1.length).toBeGreaterThanOrEqual(1);
    expect(imgs2.length).toBeGreaterThanOrEqual(1);
  });

  it("should render four images in 2x2 grid", async () => {
    const FeedImage = await importComponent();
    const content = makeEmbedImagesView({
      images: [
        { fullsize: "https://example.com/1.jpg", alt: "1", thumb: "" },
        { fullsize: "https://example.com/2.jpg", alt: "2", thumb: "" },
        { fullsize: "https://example.com/3.jpg", alt: "3", thumb: "" },
        { fullsize: "https://example.com/4.jpg", alt: "4", thumb: "" },
      ],
    });

    const { container } = render(<FeedImage content={content} />);

    for (const alt of ["1", "2", "3", "4"]) {
      const imgs = container.querySelectorAll(`img[alt='${alt}']`);
      expect(imgs.length).toBeGreaterThanOrEqual(1);
    }
  });
});
