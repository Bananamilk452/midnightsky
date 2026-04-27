// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) =>
    key === "viewFullThread" ? "View full thread" : key,
}));

vi.mock("@/lib/utils", () => ({
  parseAtUri: (uri: string) => ({
    authority: "alice.bsky.social",
    collection: "app.bsky.feed.post",
    rkey: "3k123abc",
  }),
}));

describe("FeedThreadEllipsis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importComponent() {
    const { FeedThreadEllipsis } = await import("@/components/feed/ThreadEllipsis");
    return FeedThreadEllipsis;
  }

  it("should render 'View full thread' link", async () => {
    const FeedThreadEllipsis = await importComponent();
    const post = {
      uri: "at://did:plc:abc/app.bsky.feed.post/3k123abc",
      author: { handle: "alice.bsky.social" },
    } as any;

    render(<FeedThreadEllipsis post={post} />);

    const link = screen.getByText("View full thread");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/post/alice.bsky.social/3k123abc");
  });

  it("should render dotted line connector", async () => {
    const FeedThreadEllipsis = await importComponent();
    const { container } = render(
      <FeedThreadEllipsis post={{ uri: "at://x/y/z", author: { handle: "a" } } as any} />,
    );

    const dottedBorder = container.querySelector(".border-dotted");
    expect(dottedBorder).toBeInTheDocument();
  });
});
