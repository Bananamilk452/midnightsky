// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/primitive/Avatar", () => ({
  Avatar: ({ src, alt, className }: any) => (
    <img src={src} alt={alt} className={className} data-testid="avatar" />
  ),
}));

describe("FeedAvatar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importComponent() {
    const { FeedAvatar } = await import("@/components/feed/Avatar");
    return FeedAvatar;
  }

  it("should render avatar with author avatar and displayName", async () => {
    const FeedAvatar = await importComponent();
    const post = {
      author: { avatar: "https://example.com/avatar.jpg", displayName: "Alice", handle: "alice.bsky.social" },
    } as any;

    const { container } = render(<FeedAvatar post={post} />);

    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
    expect(img).toHaveAttribute("alt", "Alice");
  });

  it("should use handle as alt when displayName is undefined", async () => {
    const FeedAvatar = await importComponent();
    const post = {
      author: { avatar: undefined, displayName: undefined, handle: "bob.bsky.social" },
    } as any;

    const { container } = render(<FeedAvatar post={post} />);

    const img = container.querySelector("img");
    expect(img).toHaveAttribute("alt", "bob.bsky.social");
  });

  it("should pass className to Avatar", async () => {
    const FeedAvatar = await importComponent();
    const post = {
      author: { avatar: "url", displayName: "A", handle: "a.b" },
    } as any;

    const { container } = render(<FeedAvatar post={post} className="size-4" />);

    const img = container.querySelector("img");
    expect(img).toHaveClass("size-4");
  });
});
