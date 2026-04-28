// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  makeFeedPostRecord,
  makePostView,
  makeThreadViewPost,
  wrapWithFeedContext,
} from "@/__tests__/helpers/feed";

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

vi.mock("@/components/feed", () => ({
  FeedRecord: ({
    post,
    line,
    className,
  }: {
    post: { uri: string; record?: { text?: string } };
    line?: { top?: boolean; bottom?: boolean };
    className?: string;
  }) => (
    <div
      data-testid="feed-record"
      data-uri={post.uri}
      data-rkey={post.uri.split("/").pop()}
    >
      {line?.top && <span data-testid="line-top" />}
      {line?.bottom && <span data-testid="line-bottom" />}
      {post.record?.text}
    </div>
  ),
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
  FeedFooter: ({ className }: { className?: string }) => (
    <div data-testid="feed-footer" className={className}>
      Footer
    </div>
  ),
}));

vi.mock("@/components/feed/Label", () => ({
  FeedLabel: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

vi.mock("@/components/feed/embed/Post", () => ({
  FeedPost: () => <div data-testid="feed-post" />,
}));

vi.mock("@/lib/utils", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/utils")>("@/lib/utils");
  return {
    ...actual,
    parseAtUri: (uri: string) => {
      const parts = uri.replace("at://", "").split("/");
      return { authority: parts[0], collection: parts[1], rkey: parts[2] };
    },
  };
});

vi.mock("date-fns", () => ({
  format: () => "Jan 1, 2024 12:00 AM",
}));

vi.mock("date-fns/locale/ko", () => ({ ko: {} }));
vi.mock("date-fns/locale/en-US", () => ({ enUS: {} }));

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
    render(
      <FeedThread
        thread={{ $type: "app.bsky.feed.defs#notFoundPost" } as never}
      />,
    );

    expect(screen.getByText("Post not found")).toBeInTheDocument();
  });

  it("should render blocked message", async () => {
    const FeedThread = await importComponent();
    render(
      <FeedThread
        thread={{ $type: "app.bsky.feed.defs#blockedPost" } as never}
      />,
    );

    expect(screen.getByText("Post blocked")).toBeInTheDocument();
  });

  it("should render main thread post", async () => {
    const FeedThread = await importComponent();
    const post = makePostView({
      uri: "at://did:plc:test/app.bsky.feed.post/main1",
      cid: "cid-main1",
      record: makeFeedPostRecord({ text: "Main post" }),
    });

    render(
      wrapWithFeedContext(<FeedThread thread={makeThreadViewPost(post)} />, {
        post,
        record: post.record as never,
      }),
    );

    expect(screen.getByTestId("feed-content")).toBeInTheDocument();
  });

  it("should render parent posts", async () => {
    const FeedThread = await importComponent();
    const parentPost = makePostView({
      uri: "at://did:plc:test/app.bsky.feed.post/parent1",
      cid: "cid-parent1",
      record: makeFeedPostRecord({ text: "Parent post" }),
    });
    const mainPost = makePostView({
      uri: "at://did:plc:test/app.bsky.feed.post/main1",
      cid: "cid-main1",
      record: makeFeedPostRecord({ text: "Main post" }),
    });
    const parentThread = makeThreadViewPost(parentPost);
    const mainThread = makeThreadViewPost(mainPost, parentThread);

    render(<FeedThread thread={mainThread} />);

    expect(screen.getByText("Parent post")).toBeInTheDocument();
    expect(screen.getByTestId("feed-content")).toBeInTheDocument();
  });

  it("should render replies", async () => {
    const FeedThread = await importComponent();
    const mainPost = makePostView({
      uri: "at://did:plc:test/app.bsky.feed.post/main1",
      cid: "cid-main1",
      record: makeFeedPostRecord({ text: "Main post" }),
    });
    const replyPost = makePostView({
      uri: "at://did:plc:test/app.bsky.feed.post/reply1",
      cid: "cid-reply1",
      record: makeFeedPostRecord({ text: "Reply post" }),
    });
    const replyThread = makeThreadViewPost(replyPost);
    const mainThread = makeThreadViewPost(mainPost, undefined, [replyThread]);

    render(<FeedThread thread={mainThread} />);

    expect(screen.getByTestId("feed-content")).toBeInTheDocument();
    expect(screen.getByText("Reply post")).toBeInTheDocument();
  });

  it("should throw for invalid record in thread", async () => {
    const FeedThread = await importComponent();
    const invalidPost = makePostView({
      record: { $type: "invalid" },
    });
    const invalidThread = makeThreadViewPost(invalidPost);

    expect(() => render(<FeedThread thread={invalidThread} />)).toThrow();
  });

  it("should pass threadgate to children", async () => {
    const FeedThread = await importComponent();
    const mainPost = makePostView({
      record: makeFeedPostRecord({ text: "Main" }),
    });
    const threadgate = { record: {} };

    render(
      <FeedThread
        thread={makeThreadViewPost(mainPost)}
        threadgate={threadgate as never}
      />,
    );

    expect(screen.getByTestId("feed-content")).toBeInTheDocument();
  });

  it("should handle not-found reply", async () => {
    const FeedThread = await importComponent();
    const mainPost = makePostView({
      record: makeFeedPostRecord({ text: "Main" }),
    });
    const mainThread = makeThreadViewPost(mainPost, undefined, [
      { $type: "app.bsky.feed.defs#notFoundPost" } as never,
    ]);

    render(<FeedThread thread={mainThread} />);

    expect(screen.getByText("Post not found")).toBeInTheDocument();
  });
});
