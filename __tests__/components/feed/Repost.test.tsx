// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: any) => {
    if (key === "reposted" && params) return `Reposted by ${params.name}`;
    return key;
  },
}));

vi.mock("lucide-react", () => ({
  Repeat2Icon: () => <svg data-testid="repeat-icon" />,
}));

vi.mock("@atproto/api/dist/client/types/app/bsky/feed/defs", () => ({
  isReasonRepost: (reason: any) => reason?.$type === "app.bsky.feed.defs#reasonRepost",
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
    const feed = {
      reason: {
        $type: "app.bsky.feed.defs#reasonRepost",
        by: { displayName: "Alice", handle: "alice.bsky.social" },
      },
    } as any;

    render(<FeedRepost feed={feed} />);

    expect(screen.getByTestId("repeat-icon")).toBeInTheDocument();
    expect(screen.getByText("Reposted by Alice")).toBeInTheDocument();
  });

  it("should use handle when displayName is undefined", async () => {
    const FeedRepost = await importComponent();
    const feed = {
      reason: {
        $type: "app.bsky.feed.defs#reasonRepost",
        by: { displayName: undefined, handle: "bob.bsky.social" },
      },
    } as any;

    render(<FeedRepost feed={feed} />);

    expect(screen.getByText("Reposted by bob.bsky.social")).toBeInTheDocument();
  });

  it("should not render when reason is not repost", async () => {
    const FeedRepost = await importComponent();
    const feed = { reason: { $type: "other" } } as any;
    const { container } = render(<FeedRepost feed={feed} />);

    expect(container.innerHTML).toBe("");
  });
});
