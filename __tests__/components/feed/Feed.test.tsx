// @vitest-environment jsdom
import { AppBskyEmbedRecord } from "@atproto/api";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  makeFeedPostRecord,
  makeFeedViewPost,
  makePostView,
  makeReasonPin,
  makeReasonRepost,
} from "@/__tests__/helpers/feed";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

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
  useTranslations: () => (key: string, params?: Record<string, string>) => {
    if (key === "reposted" && params) return `Reposted by ${params.name}`;
    if (key === "pinned") return "Pinned";
    if (key === "viewFullThread") return "View full thread";
    return key;
  },
  useLocale: () => "en",
}));

vi.mock("lucide-react", () => ({
  Repeat2Icon: () => <svg data-testid="repeat-icon" />,
  PinIcon: () => <svg data-testid="pin-icon" />,
  CircleAlertIcon: () => <svg data-testid="alert-icon" />,
}));

vi.mock("@/components/feed/Avatar", () => ({
  FeedAvatar: () => <div data-testid="feed-avatar" />,
}));

vi.mock("@/components/feed/Content", () => ({
  FeedContent: () => <div data-testid="feed-content" />,
}));

vi.mock("@/components/feed/Embed", () => ({
  FeedEmbed: ({ embed }: { embed?: unknown }) => (
    <div data-testid="feed-embed">{embed ? "embed" : "no-embed"}</div>
  ),
}));

vi.mock("@/components/feed/Footer", () => ({
  FeedFooter: () => <div data-testid="feed-footer" />,
}));

vi.mock("@/components/feed/Header", () => ({
  FeedHeader: () => <div data-testid="feed-header">Header</div>,
}));

vi.mock("@/components/feed/Label", () => ({
  FeedLabel: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

vi.mock("@/components/feed/Repost", () => ({
  FeedRepost: ({ feed }: { feed: unknown }) => (
    <div data-testid="feed-repost">Reposted</div>
  ),
}));

vi.mock("@/components/feed/Pin", () => ({
  FeedPin: () => <div data-testid="feed-pin">Pinned</div>,
}));

vi.mock("@/components/feed/ThreadEllipsis", () => ({
  FeedThreadEllipsis: () => <div data-testid="thread-ellipsis" />,
}));

vi.mock("@/components/feed/embed/Post", () => ({
  FeedPost: () => <div data-testid="feed-post" />,
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
  parseAtUri: (uri: string) => {
    const parts = uri.replace("at://", "").split("/");
    return { authority: parts[0], collection: parts[1], rkey: parts[2] };
  },
  createFeedKey: (feed: { post: { uri: string } }) => feed.post.uri,
}));

describe("Feed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importComponent() {
    const mod = await import("@/components/feed");
    return mod;
  }

  it("should render a simple feed item", async () => {
    const { Feed } = await importComponent();
    render(<Feed feed={makeFeedViewPost()} />);

    expect(screen.getByTestId("feed-content")).toBeInTheDocument();
    expect(screen.getByTestId("feed-footer")).toBeInTheDocument();
  });

  it("should render repost reason", async () => {
    const { Feed } = await importComponent();
    render(
      <Feed
        feed={makeFeedViewPost({
          reason: makeReasonRepost({
            by: {
              displayName: "Alice",
              handle: "alice.bsky.social",
              did: "did:plc:alice",
            },
          }),
        })}
      />,
    );

    expect(screen.getByTestId("feed-repost")).toBeInTheDocument();
  });

  it("should render pin reason", async () => {
    const { Feed } = await importComponent();
    render(
      <Feed
        feed={makeFeedViewPost({
          reason: makeReasonPin(),
        })}
      />,
    );

    expect(screen.getByTestId("feed-pin")).toBeInTheDocument();
  });

  it("should render reply parent when present", async () => {
    const { Feed } = await importComponent();
    const parent = makePostView({
      uri: "at://did:plc:test/app.bsky.feed.post/parent1",
      record: makeFeedPostRecord({ text: "Parent post" }),
    });
    const root = makePostView({
      uri: "at://did:plc:test/app.bsky.feed.post/root1",
      record: makeFeedPostRecord({ text: "Root post" }),
    });

    render(
      <Feed
        feed={makeFeedViewPost({
          reply: { parent, root },
        })}
      />,
    );

    expect(screen.getAllByTestId("feed-content").length).toBeGreaterThanOrEqual(
      2,
    );
    expect(document.getElementById("parent1")).toBeInTheDocument();
  });
});

describe("FeedRecord", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importComponent() {
    const mod = await import("@/components/feed");
    return mod;
  }

  it("should render post content", async () => {
    const { FeedRecord } = await importComponent();
    render(<FeedRecord post={makePostView()} />);

    expect(screen.getByTestId("feed-content")).toBeInTheDocument();
    expect(screen.getByTestId("feed-avatar")).toBeInTheDocument();
    expect(screen.getByTestId("feed-footer")).toBeInTheDocument();
  });

  it("should throw for invalid record", async () => {
    const { FeedRecord } = await importComponent();
    const invalidPost = makePostView({ record: { $type: "invalid" } });

    expect(() => render(<FeedRecord post={invalidPost} />)).toThrow(
      "Invalid post record",
    );
  });

  it("should render top line when line.top is true", async () => {
    const { FeedRecord } = await importComponent();
    const { container } = render(
      <FeedRecord post={makePostView()} line={{ top: true, bottom: false }} />,
    );

    const lines = container.querySelectorAll(".bg-gray-400");
    expect(lines.length).toBeGreaterThanOrEqual(1);
  });

  it("should render children", async () => {
    const { FeedRecord } = await importComponent();
    render(
      <FeedRecord post={makePostView()}>
        <span data-testid="child-element">Child</span>
      </FeedRecord>,
    );

    expect(screen.getByTestId("child-element")).toBeInTheDocument();
  });
});

describe("EmbedPost", () => {
  async function importComponent() {
    const mod = await import("@/components/feed");
    return mod;
  }

  it("should render embedded post content", async () => {
    const { EmbedPost } = await importComponent();
    const embedPost: AppBskyEmbedRecord.ViewRecord = {
      $type: "app.bsky.embed.record#viewRecord",
      uri: "at://did:plc:test/app.bsky.feed.post/embed1",
      cid: "cid-embed1",
      author: {
        did: "did:plc:test",
        handle: "test.bsky.social",
        displayName: "Test",
      },
      value: makeFeedPostRecord({ text: "Embedded text" }),
      indexedAt: "2024-01-01T00:00:00Z",
    };

    render(<EmbedPost post={embedPost} />);

    expect(screen.getByTestId("feed-content")).toBeInTheDocument();
  });

  it("should throw for invalid embed value", async () => {
    const { EmbedPost } = await importComponent();
    const invalidPost: AppBskyEmbedRecord.ViewRecord = {
      $type: "app.bsky.embed.record#viewRecord",
      uri: "at://did:plc:test/app.bsky.feed.post/embed1",
      cid: "cid-embed1",
      author: { did: "did:plc:test", handle: "test.bsky.social" },
      value: { $type: "invalid" },
      indexedAt: "2024-01-01T00:00:00Z",
    };

    expect(() => render(<EmbedPost post={invalidPost} />)).toThrow();
  });
});
