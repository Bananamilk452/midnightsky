// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUseProfile = vi.fn();
const mockUseAuthorFeed = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => ({ authority: "test.bsky.social" }),
}));

vi.mock("@/lib/hooks/useBluesky", () => ({
  useProfile: (actor: string) => mockUseProfile(actor),
  useAuthorFeed: (params: any) => mockUseAuthorFeed(params),
}));

vi.mock("@/components/feed", () => ({
  Feed: ({ feed }: any) => <div data-testid="feed-item">{feed.post.record.text}</div>,
}));

vi.mock("@/components/InfiniteScrollTrigger", () => ({
  InfiniteScrollTrigger: () => <div data-testid="scroll-trigger" />,
}));

vi.mock("@/components/LoadingFallback", () => ({
  LoadingFallback: () => <div data-testid="loading">Loading</div>,
}));

vi.mock("@/components/ErrorBoundaryPage", () => ({
  ErrorBoundaryPage: ({ error }: any) => (
    <div data-testid="error-page">{error.message}</div>
  ),
}));

vi.mock("@/components/profile/Banner", () => ({
  ProfileBanner: ({ profile }: any) => (
    <div data-testid="profile-banner">{profile.handle}</div>
  ),
}));

vi.mock("@/lib/utils", () => ({
  createFeedKey: (feed: any) => feed.post.uri,
}));

describe("Profile Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importPage() {
    const mod = await import("@/app/profile/[authority]/page");
    return mod.default;
  }

  it("should show loading when both profile and feed are pending", async () => {
    mockUseProfile.mockReturnValue({ data: undefined, error: null, status: "pending", refetch: vi.fn() });
    mockUseAuthorFeed.mockReturnValue({
      data: undefined, error: null, status: "pending",
      fetchNextPage: vi.fn(), hasNextPage: false, isFetching: false, refetch: vi.fn(),
    });

    const Page = await importPage();
    render(<Page />);

    expect(screen.getAllByTestId("loading")).toHaveLength(1);
  });

  it("should show profile error state", async () => {
    mockUseProfile.mockReturnValue({
      data: undefined, error: { message: "Profile not found" }, status: "error", refetch: vi.fn(),
    });
    mockUseAuthorFeed.mockReturnValue({
      data: { pages: [{ feed: [] }] }, error: null, status: "success",
      fetchNextPage: vi.fn(), hasNextPage: false, isFetching: false, refetch: vi.fn(),
    });

    const Page = await importPage();
    render(<Page />);

    expect(screen.getByText("Profile not found")).toBeInTheDocument();
  });

  it("should show profile banner on success", async () => {
    mockUseProfile.mockReturnValue({
      data: { handle: "test.bsky.social", displayName: "Test" },
      error: null, status: "success", refetch: vi.fn(),
    });
    mockUseAuthorFeed.mockReturnValue({
      data: { pages: [{ feed: [] }] }, error: null, status: "success",
      fetchNextPage: vi.fn(), hasNextPage: false, isFetching: false, refetch: vi.fn(),
    });

    const Page = await importPage();
    render(<Page />);

    expect(screen.getByTestId("profile-banner")).toBeInTheDocument();
    expect(screen.getByText("test.bsky.social")).toBeInTheDocument();
  });

  it("should render feed items", async () => {
    mockUseProfile.mockReturnValue({
      data: { handle: "test.bsky.social" },
      error: null, status: "success", refetch: vi.fn(),
    });
    mockUseAuthorFeed.mockReturnValue({
      data: {
        pages: [{
          feed: [
            { post: { uri: "at://a/b/1", record: { text: "My post" } } },
          ],
        }],
      },
      error: null, status: "success",
      fetchNextPage: vi.fn(), hasNextPage: false, isFetching: false, refetch: vi.fn(),
    });

    const Page = await importPage();
    render(<Page />);

    expect(screen.getByText("My post")).toBeInTheDocument();
  });

  it("should show feed error state", async () => {
    mockUseProfile.mockReturnValue({
      data: { handle: "test.bsky.social" },
      error: null, status: "success", refetch: vi.fn(),
    });
    mockUseAuthorFeed.mockReturnValue({
      data: undefined, error: { message: "Feed error" }, status: "error",
      fetchNextPage: vi.fn(), hasNextPage: false, isFetching: false, refetch: vi.fn(),
    });

    const Page = await importPage();
    render(<Page />);

    expect(screen.getByText("Feed error")).toBeInTheDocument();
  });
});
