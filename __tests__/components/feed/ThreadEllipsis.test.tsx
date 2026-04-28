// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makePostView } from "@/__tests__/helpers/feed";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.PropsWithChildren<{ href: string }>) => (
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
    const { FeedThreadEllipsis } = await import(
      "@/components/feed/ThreadEllipsis"
    );
    return FeedThreadEllipsis;
  }

  it("should render 'View full thread' link", async () => {
    const FeedThreadEllipsis = await importComponent();
    const post = makePostView({
      uri: "at://did:plc:abc/app.bsky.feed.post/3k123abc",
      author: { did: "did:plc:abc", handle: "alice.bsky.social" },
    });

    render(<FeedThreadEllipsis post={post} />);

    const link = screen.getByText("View full thread");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "/post/alice.bsky.social/3k123abc",
    );
  });

  it("should render dotted line connector", async () => {
    const FeedThreadEllipsis = await importComponent();
    const post = makePostView({
      uri: "at://did:plc:abc/app.bsky.feed.post/3k123abc",
      author: { did: "did:plc:abc", handle: "alice.bsky.social" },
    });
    const { container } = render(<FeedThreadEllipsis post={post} />);

    const dottedBorder = container.querySelector(".border-dotted");
    expect(dottedBorder).toBeInTheDocument();
  });
});
