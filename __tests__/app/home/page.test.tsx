// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUseTimeline = vi.fn();

vi.mock("@/lib/hooks/useBluesky", () => ({
  useTimeline: (params: any) => mockUseTimeline(params),
}));

vi.mock("@/components/feed", () => ({
  Feed: ({ feed }: any) => <div data-testid="feed-item">{feed.post.record.text}</div>,
}));

vi.mock("@/components/home/HomeHeader", () => ({
  HomeHeader: () => <div data-testid="home-header">Header</div>,
}));

vi.mock("@/components/InfiniteScrollTrigger", () => ({
  InfiniteScrollTrigger: ({ onTrigger, hasNextPage, isFetching }: any) => (
    <div data-testid="scroll-trigger" data-has-next={hasNextPage} data-fetching={isFetching} />
  ),
}));

vi.mock("@/components/ErrorBoundaryPage", () => ({
  ErrorBoundaryPage: ({ error, onReset }: any) => (
    <div data-testid="error-page">{error.message}</div>
  ),
}));

vi.mock("@/components/LoadingFallback", () => ({
  LoadingFallback: () => <div data-testid="loading">Loading</div>,
}));

vi.mock("@/lib/utils", () => ({
  createFeedKey: (feed: any) => feed.post.uri,
}));

describe("Home Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importPage() {
    const mod = await import("@/app/home/page");
    return mod.default;
  }

  it("should show loading state", async () => {
    mockUseTimeline.mockReturnValue({
      data: undefined,
      error: null,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      status: "pending",
      refetch: vi.fn(),
    });

    const Home = await importPage();
    render(<Home />);

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(screen.getByTestId("home-header")).toBeInTheDocument();
  });

  it("should show error state", async () => {
    mockUseTimeline.mockReturnValue({
      data: undefined,
      error: { message: "Failed to load" },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      status: "error",
      refetch: vi.fn(),
    });

    const Home = await importPage();
    render(<Home />);

    expect(screen.getByTestId("error-page")).toBeInTheDocument();
    expect(screen.getByText("Failed to load")).toBeInTheDocument();
  });

  it("should render feed items on success", async () => {
    mockUseTimeline.mockReturnValue({
      data: {
        pages: [
          {
            feed: [
              { post: { uri: "at://a/b/1", record: { text: "Post 1" } } },
              { post: { uri: "at://a/b/2", record: { text: "Post 2" } } },
            ],
          },
        ],
      },
      error: null,
      fetchNextPage: vi.fn(),
      hasNextPage: true,
      isFetching: false,
      status: "success",
      refetch: vi.fn(),
    });

    const Home = await importPage();
    render(<Home />);

    expect(screen.getByText("Post 1")).toBeInTheDocument();
    expect(screen.getByText("Post 2")).toBeInTheDocument();
    expect(screen.getByTestId("scroll-trigger")).toBeInTheDocument();
  });

  it("should render infinite scroll trigger with correct props", async () => {
    const fetchNextPage = vi.fn();
    mockUseTimeline.mockReturnValue({
      data: { pages: [{ feed: [] }] },
      error: null,
      fetchNextPage,
      hasNextPage: true,
      isFetching: true,
      status: "success",
      refetch: vi.fn(),
    });

    const Home = await importPage();
    render(<Home />);

    const trigger = screen.getByTestId("scroll-trigger");
    expect(trigger).toHaveAttribute("data-has-next", "true");
    expect(trigger).toHaveAttribute("data-fetching", "true");
  });

  it("should pass limit 30 to useTimeline", async () => {
    mockUseTimeline.mockReturnValue({
      data: undefined,
      error: null,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      status: "pending",
      refetch: vi.fn(),
    });

    const Home = await importPage();
    render(<Home />);

    expect(mockUseTimeline).toHaveBeenCalledWith({ limit: 30 });
  });
});
