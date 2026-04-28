// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  makeFeedPostRecord,
  makePostView,
  makeProfileViewBasic,
  wrapWithFeedContext,
} from "@/__tests__/helpers/feed";

vi.mock("next-intl", () => ({
  useLocale: () => "en",
}));

vi.mock("@/lib/bluesky/utils", () => ({
  getRelativeTimeBasic: (_date: string, _locale: string) => "2h",
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));

describe("FeedHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importModules() {
    const { FeedHeader } = await import("@/components/feed/Header");
    return { FeedHeader };
  }

  it("should render displayName and handle", async () => {
    const { FeedHeader } = await importModules();
    render(
      wrapWithFeedContext(<FeedHeader />, {
        post: makePostView({
          author: makeProfileViewBasic({
            displayName: "Alice",
            handle: "alice.bsky.social",
          }),
        }),
      }),
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("@alice.bsky.social")).toBeInTheDocument();
  });

  it("should render handle when displayName is undefined", async () => {
    const { FeedHeader } = await importModules();
    render(
      wrapWithFeedContext(<FeedHeader />, {
        post: makePostView({
          author: makeProfileViewBasic({
            displayName: undefined,
            handle: "bob.bsky.social",
          }),
        }),
      }),
    );

    expect(screen.getByText("bob.bsky.social")).toBeInTheDocument();
    expect(screen.getByText("@bob.bsky.social")).toBeInTheDocument();
  });

  it("should render relative time", async () => {
    const { FeedHeader } = await importModules();
    render(
      wrapWithFeedContext(<FeedHeader />, {
        post: makePostView({
          author: makeProfileViewBasic({
            displayName: "Alice",
            handle: "alice.bsky.social",
          }),
        }),
      }),
    );

    expect(screen.getByText("2h")).toBeInTheDocument();
  });

  it("should render children", async () => {
    const { FeedHeader } = await importModules();
    render(
      wrapWithFeedContext(
        <FeedHeader>
          <span data-testid="child">avatar</span>
        </FeedHeader>,
        {
          post: makePostView({
            author: makeProfileViewBasic({
              displayName: "Alice",
              handle: "alice.bsky.social",
            }),
          }),
        },
      ),
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
