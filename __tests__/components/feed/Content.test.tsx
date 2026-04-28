// @vitest-environment jsdom
import { AppBskyFeedPost } from "@atproto/api";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  makeFeedContextValue,
  makeFeedPostRecord,
  makePostView,
  wrapWithFeedContext,
} from "@/__tests__/helpers/feed";

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

vi.mock("@/lib/utils", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));

describe("FeedContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importModules() {
    const { FeedContent } = await import("@/components/feed/Content");
    return { FeedContent };
  }

  it("should render plain text", async () => {
    const { FeedContent } = await importModules();
    render(
      wrapWithFeedContext(<FeedContent />, {
        record: makeFeedPostRecord({ text: "Hello world", facets: undefined }),
      }),
    );

    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("should render text with link facet", async () => {
    const { FeedContent } = await importModules();
    render(
      wrapWithFeedContext(<FeedContent />, {
        record: makeFeedPostRecord({
          text: "Check this https://example.com out",
          facets: [
            {
              index: { byteStart: 11, byteEnd: 30 },
              features: [
                {
                  $type: "app.bsky.richtext.facet#link",
                  uri: "https://example.com",
                },
              ],
            },
          ],
        }),
      }),
    );

    const link = screen.getByText("https://example.com");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "https://example.com");
  });

  it("should render text with mention facet", async () => {
    const { FeedContent } = await importModules();
    render(
      wrapWithFeedContext(<FeedContent />, {
        record: makeFeedPostRecord({
          text: "Hello @alice.bsky.social",
          facets: [
            {
              index: { byteStart: 6, byteEnd: 24 },
              features: [
                {
                  $type: "app.bsky.richtext.facet#mention",
                  did: "did:plc:abc123",
                },
              ],
            },
          ],
        }),
      }),
    );

    const mention = screen.getByText("@alice.bsky.social");
    expect(mention).toBeInTheDocument();
    expect(mention.closest("a")).toHaveAttribute(
      "href",
      "/profile/did:plc:abc123",
    );
  });

  it("should render empty text", async () => {
    const { FeedContent } = await importModules();
    const { container } = render(
      wrapWithFeedContext(<FeedContent />, {
        record: makeFeedPostRecord({ text: "", facets: undefined }),
      }),
    );

    const p = container.querySelector("p");
    expect(p).toBeInTheDocument();
    expect(p).toBeEmptyDOMElement();
  });

  it("should render text with tag facet", async () => {
    const { FeedContent } = await importModules();
    render(
      wrapWithFeedContext(<FeedContent />, {
        record: makeFeedPostRecord({
          text: "Hello #test",
          facets: [
            {
              index: { byteStart: 6, byteEnd: 11 },
              features: [{ $type: "app.bsky.richtext.facet#tag", tag: "test" }],
            },
          ],
        }),
      }),
    );

    const tag = screen.getByText("#test");
    expect(tag).toBeInTheDocument();
    expect(tag).toHaveClass("text-blue-500");
  });
});
