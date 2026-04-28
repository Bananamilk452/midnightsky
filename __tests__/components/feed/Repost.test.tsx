// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeFeedViewPost, makeReasonRepost } from "@/__tests__/helpers/feed";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, string>) => {
    if (key === "reposted" && params) return `Reposted by ${params.name}`;
    return key;
  },
}));

vi.mock("lucide-react", () => ({
  Repeat2Icon: () => <svg data-testid="repeat-icon" />,
}));

describe("FeedRepost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importComponent() {
    const { FeedRepost } = await import("@/components/feed/Repost");
    return FeedRepost;
  }

  it("should render repost indicator with displayName", async () => {
    const FeedRepost = await importComponent();
    const feed = makeFeedViewPost({
      reason: makeReasonRepost({
        by: {
          displayName: "Alice",
          handle: "alice.bsky.social",
          did: "did:plc:alice",
        },
      }),
    });

    render(<FeedRepost feed={feed} />);

    expect(screen.getByTestId("repeat-icon")).toBeInTheDocument();
    expect(screen.getByText("Reposted by Alice")).toBeInTheDocument();
  });

  it("should use handle when displayName is undefined", async () => {
    const FeedRepost = await importComponent();
    const feed = makeFeedViewPost({
      reason: makeReasonRepost({
        by: {
          displayName: undefined,
          handle: "bob.bsky.social",
          did: "did:plc:bob",
        },
      }),
    });

    render(<FeedRepost feed={feed} />);

    expect(screen.getByText("Reposted by bob.bsky.social")).toBeInTheDocument();
  });

  it("should not render when reason is not repost", async () => {
    const FeedRepost = await importComponent();
    const feed = makeFeedViewPost({
      reason: { $type: "other" } as never,
    });
    const { container } = render(<FeedRepost feed={feed} />);

    expect(container.innerHTML).toBe("");
  });
});
