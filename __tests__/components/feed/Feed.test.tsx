// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: any) => {
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
  FeedContent: ({ text }: any) => <p>{text}</p>,
}));

vi.mock("@/components/feed/Embed", () => ({
  FeedEmbed: () => <div data-testid="feed-embed" />,
}));

vi.mock("@/components/feed/Footer", () => ({
  FeedFooter: () => <div data-testid="feed-footer" />,
}));

vi.mock("@/components/feed/Header", () => ({
  FeedHeader: ({ post }: any) => (
    <div data-testid="feed-header">{post.author.displayName || post.author.handle}</div>
  ),
}));

vi.mock("@/components/feed/Label", () => ({
  FeedLabel: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/feed/Repost", () => ({
  FeedRepost: ({ feed }: any) => <div data-testid="feed-repost">Reposted</div>,
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

vi.mock("@/lib/bluesky/utils", () => ({
  validateRecord: (record: any) => {
    if (record?.$type === "app.bsky.feed.post" || record?.text) {
      return { text: record.text, createdAt: record.createdAt || "2024-01-01T00:00:00Z", facets: record.facets };
    }
    return undefined;
  },
  getRelativeTimeBasic: () => "2h",
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(" "),
  parseAtUri: (uri: string) => {
    const parts = uri.replace("at://", "").split("/");
    return { authority: parts[0], collection: parts[1], rkey: parts[2] };
  },
  createFeedKey: (feed: any) => feed.post.uri,
}));

vi.mock("@/lib/lexicon/types/app/midnightsky/post", () => ({
  isRecord: () => false,
}));

vi.mock("@atproto/api/dist/client/types/app/bsky/feed/defs", () => ({
  isPostView: (v: any) => v?.$type === "app.bsky.feed.defs#postView",
  isReasonPin: (v: any) => v?.$type === "app.bsky.feed.defs#reasonPin",
  isReasonRepost: (v: any) => v?.$type === "app.bsky.feed.defs#reasonRepost",
}));

function makePost(overrides?: Partial<any>): any {
  return {
    uri: "at://did:plc:test/app.bsky.feed.post/rkey1",
    cid: "cid1",
    $type: "app.bsky.feed.defs#postView",
    author: { did: "did:plc:test", handle: "test.bsky.social", displayName: "Test User" },
    record: { text: "Hello world", $type: "app.bsky.feed.post", createdAt: "2024-01-01T00:00:00Z" },
    replyCount: 0,
    repostCount: 0,
    likeCount: 0,
    viewer: {},
    ...overrides,
  };
}

function makeFeed(overrides?: Partial<any>): any {
  return {
    post: makePost(),
    ...overrides,
  };
}

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
    render(<Feed feed={makeFeed()} />);

    expect(screen.getByText("Hello world")).toBeInTheDocument();
    expect(screen.getByTestId("feed-footer")).toBeInTheDocument();
  });

  it("should render repost reason", async () => {
    const { Feed } = await importComponent();
    render(
      <Feed
        feed={makeFeed({
          reason: {
            $type: "app.bsky.feed.defs#reasonRepost",
            by: { displayName: "Alice", handle: "alice.bsky.social" },
          },
        })}
      />,
    );

    expect(screen.getByTestId("feed-repost")).toBeInTheDocument();
  });

  it("should render pin reason", async () => {
    const { Feed } = await importComponent();
    render(
      <Feed
        feed={makeFeed({
          reason: { $type: "app.bsky.feed.defs#reasonPin" },
        })}
      />,
    );

    expect(screen.getByTestId("feed-pin")).toBeInTheDocument();
  });

  it("should render reply parent when present", async () => {
    const { Feed } = await importComponent();
    const parent = makePost({
      uri: "at://did:plc:test/app.bsky.feed.post/parent1",
      record: { text: "Parent post", $type: "app.bsky.feed.post", createdAt: "2024-01-01T00:00:00Z" },
    });
    const root = makePost({
      uri: "at://did:plc:test/app.bsky.feed.post/root1",
      record: { text: "Root post", $type: "app.bsky.feed.post", createdAt: "2024-01-01T00:00:00Z" },
    });

    render(
      <Feed
        feed={makeFeed({
          reply: { parent, root },
        })}
      />,
    );

    expect(screen.getByText("Parent post")).toBeInTheDocument();
    expect(screen.getByText("Hello world")).toBeInTheDocument();
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
    render(<FeedRecord post={makePost()} />);

    expect(screen.getByText("Hello world")).toBeInTheDocument();
    expect(screen.getByTestId("feed-avatar")).toBeInTheDocument();
    expect(screen.getByTestId("feed-footer")).toBeInTheDocument();
  });

  it("should throw for invalid record", async () => {
    const { FeedRecord } = await importComponent();
    const invalidPost = makePost({ record: { $type: "invalid" } });

    expect(() => render(<FeedRecord post={invalidPost} />)).toThrow("Invalid post record");
  });

  it("should render top line when line.top is true", async () => {
    const { FeedRecord } = await importComponent();
    const { container } = render(
      <FeedRecord post={makePost()} line={{ top: true, bottom: false }} />,
    );

    const lines = container.querySelectorAll(".bg-gray-400");
    expect(lines.length).toBeGreaterThanOrEqual(1);
  });

  it("should render children", async () => {
    const { FeedRecord } = await importComponent();
    render(
      <FeedRecord post={makePost()}>
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
    const embedPost = {
      uri: "at://did:plc:test/app.bsky.feed.post/embed1",
      author: { did: "did:plc:test", handle: "test.bsky.social", displayName: "Test" },
      value: { text: "Embedded text", $type: "app.bsky.feed.post", createdAt: "2024-01-01T00:00:00Z" },
    } as any;

    render(<EmbedPost post={embedPost} />);

    expect(screen.getByText("Embedded text")).toBeInTheDocument();
  });

  it("should throw for invalid embed value", async () => {
    const { EmbedPost } = await importComponent();
    const invalidPost = {
      uri: "at://did:plc:test/app.bsky.feed.post/embed1",
      author: { did: "did:plc:test", handle: "test.bsky.social" },
      value: { $type: "invalid" },
    } as any;

    expect(() => render(<EmbedPost post={invalidPost} />)).toThrow();
  });
});
