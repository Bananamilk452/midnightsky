// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  makeFeedPostRecord,
  makePostView,
  makeProfileViewBasic,
  wrapWithFeedContext,
} from "@/__tests__/helpers/feed";

vi.mock("@/components/primitive/Avatar", () => ({
  Avatar: ({
    src,
    alt,
    className,
  }: {
    src?: string;
    alt?: string;
    className?: string;
  }) => <img src={src} alt={alt} className={className} data-testid="avatar" />,
}));

describe("FeedAvatar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importModules() {
    const { FeedAvatar } = await import("@/components/feed/Avatar");
    return { FeedAvatar };
  }

  it("should render avatar with author avatar and displayName", async () => {
    const { FeedAvatar } = await importModules();
    const { container } = render(
      wrapWithFeedContext(<FeedAvatar />, {
        post: makePostView({
          author: makeProfileViewBasic({
            avatar: "https://example.com/avatar.jpg",
            displayName: "Alice",
          }),
        }),
      }),
    );

    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
    expect(img).toHaveAttribute("alt", "Alice");
  });

  it("should use handle as alt when displayName is undefined", async () => {
    const { FeedAvatar } = await importModules();
    const { container } = render(
      wrapWithFeedContext(<FeedAvatar />, {
        post: makePostView({
          author: makeProfileViewBasic({
            avatar: undefined,
            displayName: undefined,
            handle: "bob.bsky.social",
          }),
        }),
      }),
    );

    const img = container.querySelector("img");
    expect(img).toHaveAttribute("alt", "bob.bsky.social");
  });

  it("should pass className to Avatar", async () => {
    const { FeedAvatar } = await importModules();
    const { container } = render(
      wrapWithFeedContext(<FeedAvatar className="size-4" />, {
        post: makePostView({
          author: makeProfileViewBasic({
            avatar: "url",
            displayName: "A",
          }),
        }),
      }),
    );

    const img = container.querySelector("img");
    expect(img).toHaveClass("size-4");
  });
});
