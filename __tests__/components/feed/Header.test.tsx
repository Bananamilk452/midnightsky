// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useLocale: () => "en",
}));

vi.mock("@/lib/bluesky/utils", () => ({
  getRelativeTimeBasic: (date: string, locale: string) => "2h",
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(" "),
}));

describe("FeedHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importComponent() {
    const { FeedHeader } = await import("@/components/feed/Header");
    return FeedHeader;
  }

  function mockPost(displayName: string | undefined, handle: string) {
    return {
      author: { displayName, handle },
    } as any;
  }

  it("should render displayName and handle", async () => {
    const FeedHeader = await importComponent();
    render(<FeedHeader post={mockPost("Alice", "alice.bsky.social")} createdAt="2024-01-01T00:00:00Z" />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("@alice.bsky.social")).toBeInTheDocument();
  });

  it("should render handle when displayName is undefined", async () => {
    const FeedHeader = await importComponent();
    render(<FeedHeader post={mockPost(undefined, "bob.bsky.social")} createdAt="2024-01-01T00:00:00Z" />);

    expect(screen.getByText("bob.bsky.social")).toBeInTheDocument();
    expect(screen.getByText("@bob.bsky.social")).toBeInTheDocument();
  });

  it("should render relative time", async () => {
    const FeedHeader = await importComponent();
    render(<FeedHeader post={mockPost("Alice", "alice.bsky.social")} createdAt="2024-01-01T00:00:00Z" />);

    expect(screen.getByText("2h")).toBeInTheDocument();
  });

  it("should render children", async () => {
    const FeedHeader = await importComponent();
    render(
      <FeedHeader post={mockPost("Alice", "alice.bsky.social")} createdAt="2024-01-01T00:00:00Z">
        <span data-testid="child">avatar</span>
      </FeedHeader>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
