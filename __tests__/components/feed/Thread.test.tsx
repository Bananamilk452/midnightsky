// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      postNotFound: "Post not found",
      postBlocked: "Post blocked",
    };
    return map[key] || key;
  },
  useLocale: () => "en",
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/feed", () => ({
  FeedRecord: ({ post, line, className }: any) => (
    <div data-testid="feed-record" data-uri={post.uri} data-rkey={post.uri.split("/").pop()}>
      {line?.top && <span data-testid="line-top" />}
      {line?.bottom && <span data-testid="line-bottom" />}
      {post.record?.text}
    </div>
  ),
}));

vi.mock("@/components/feed/Content", () => ({
  FeedContent: ({ text }: any) => <p>{text}</p>,
}));

vi.mock("@/components/feed/Embed", () => ({
  FeedEmbed: () => <div data-testid="feed-embed" />,
}));

vi.mock("@/components/feed/Footer", () => ({
  FeedFooter: ({ post }: any) => <div data-testid="feed-footer">Footer</div>,
}));

vi.mock("@/components/feed/Label", () => ({
  FeedLabel: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/feed/thread/Header", () => ({
  FeedThreadHeader: ({ post }: any) => (
    <div data-testid="thread-header">{post.author.displayName}</div>
  ),
}));

vi.mock("@/components/feed/embed/Post", () => ({
  FeedPost: () => <div data-testid="feed-post" />,
}));

vi.mock("@/lib/bluesky/utils", () => ({
  validateRecord: (record: any) => {
    if (record?.text) return { text: record.text, createdAt: record.createdAt || "2024-01-01T00:00:00Z", facets: record.facets };
    return undefined;
  },
}));

vi.mock("@/lib/utils", () => ({
  parseAtUri: (uri: string) => {
    const parts = uri.replace("at://", "").split("/");
    return { authority: parts[0], collection: parts[1], rkey: parts[2] };
  },
}));

vi.mock("@/lib/lexicon/types/app/midnightsky/post", () => ({
  isRecord: () => false,
}));

vi.mock("date-fns", () => ({
  format: () => "Jan 1, 2024 12:00 AM",
}));

vi.mock("date-fns/locale/ko", () => ({ ko: {} }));
vi.mock("date-fns/locale/en-US", () => ({ enUS: {} }));

vi.mock("@atproto/api/dist/client/types/app/bsky/feed/defs", () => ({
  isNotFoundPost: (v: any) => v?.$type === "app.bsky.feed.defs#notFoundPost",
  isBlockedPost: (v: any) => v?.$type === "app.bsky.feed.defs#blockedPost",
  isThreadViewPost: (v: any) => v?.$type === "app.bsky.feed.defs#threadViewPost",
  isPostView: (v: any) => v?.$type === "app.bsky.feed.defs#postView",
}));

function makePost(text: string, rkey: string): any {
  return {
    $type: "app.bsky.feed.defs#postView",
    uri: `at://did:plc:test/app.bsky.feed.post/${rkey}`,
    cid: `cid-${rkey}`,
    author: { did: "did:plc:test", handle: "test.bsky.social", displayName: "Test" },
    record: { text, $type: "app.bsky.feed.post", createdAt: "2024-01-01T00:00:00Z" },
    replyCount: 0,
    repostCount: 0,
    likeCount: 0,
    viewer: {},
    indexedAt: "2024-01-01T00:00:00Z",
  };
}

function makeThread(post: any, parent?: any, replies?: any[]): any {
  return {
    $type: "app.bsky.feed.defs#threadViewPost",
    post,
    parent,
    replies,
  };
}

describe("FeedThread", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importComponent() {
    const { FeedThread } = await import("@/components/feed/thread");
    return FeedThread;
  }

  it("should render not found message", async () => {
    const FeedThread = await importComponent();
    render(<FeedThread thread={{ $type: "app.bsky.feed.defs#notFoundPost" }} />);

    expect(screen.getByText("Post not found")).toBeInTheDocument();
  });

  it("should render blocked message", async () => {
    const FeedThread = await importComponent();
    render(<FeedThread thread={{ $type: "app.bsky.feed.defs#blockedPost" }} />);

    expect(screen.getByText("Post blocked")).toBeInTheDocument();
  });

  it("should render main thread post", async () => {
    const FeedThread = await importComponent();
    const post = makePost("Main post", "main1");

    render(<FeedThread thread={makeThread(post)} />);

    expect(screen.getByText("Main post")).toBeInTheDocument();
  });

  it("should render parent posts", async () => {
    const FeedThread = await importComponent();
    const parentPost = makePost("Parent post", "parent1");
    const mainPost = makePost("Main post", "main1");
    const parentThread = makeThread(parentPost);
    const mainThread = makeThread(mainPost, parentThread);

    render(<FeedThread thread={mainThread} />);

    expect(screen.getByText("Parent post")).toBeInTheDocument();
    expect(screen.getByText("Main post")).toBeInTheDocument();
  });

  it("should render replies", async () => {
    const FeedThread = await importComponent();
    const mainPost = makePost("Main post", "main1");
    const replyPost = makePost("Reply post", "reply1");
    const replyThread = makeThread(replyPost);
    const mainThread = makeThread(mainPost, undefined, [replyThread]);

    render(<FeedThread thread={mainThread} />);

    expect(screen.getByText("Main post")).toBeInTheDocument();
    expect(screen.getByText("Reply post")).toBeInTheDocument();
  });

  it("should throw for invalid record in thread", async () => {
    const FeedThread = await importComponent();
    const invalidPost = {
      $type: "app.bsky.feed.defs#threadViewPost",
      post: {
        $type: "app.bsky.feed.defs#postView",
        uri: "at://did:plc:test/app.bsky.feed.post/inv1",
        record: { $type: "invalid" },
        author: { handle: "test.bsky.social" },
        indexedAt: "2024-01-01T00:00:00Z",
      },
    };

    expect(() => render(<FeedThread thread={invalidPost} />)).toThrow();
  });

  it("should pass threadgate to children", async () => {
    const FeedThread = await importComponent();
    const mainPost = makePost("Main", "main1");
    const threadgate = { record: {} } as any;

    render(<FeedThread thread={makeThread(mainPost)} threadgate={threadgate} />);

    expect(screen.getByText("Main")).toBeInTheDocument();
  });

  it("should handle not-found reply", async () => {
    const FeedThread = await importComponent();
    const mainPost = makePost("Main", "main1");
    const mainThread = makeThread(mainPost, undefined, [
      { $type: "app.bsky.feed.defs#notFoundPost" },
    ]);

    render(<FeedThread thread={mainThread} />);

    expect(screen.getByText("Post not found")).toBeInTheDocument();
  });
});
