// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUsePostThread = vi.fn();
const mockScrollTo = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => ({ authority: "test.bsky.social", rkey: "3kabc123" }),
}));

vi.mock("@/lib/hooks/useBluesky", () => ({
  usePostThread: (authority: string, rkey: string) =>
    mockUsePostThread(authority, rkey),
}));

vi.mock("@/components/feed/thread", () => ({
  FeedThread: ({ thread }: { thread: unknown }) => (
    <div data-testid="feed-thread">Thread</div>
  ),
}));

vi.mock("@/components/ErrorBoundaryPage", () => ({
  ErrorBoundaryPage: ({ error }: { error: { message: string } }) => (
    <div data-testid="error-page">{error.message}</div>
  ),
}));

vi.mock("@/components/LoadingFallback", () => ({
  LoadingFallback: () => <div data-testid="loading">Loading</div>,
}));

describe("Post Detail Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockReturnValue({ top: 100 });
    const mockEl = {
      scrollTo: mockScrollTo,
      scrollTop: 0,
      getBoundingClientRect: () => ({ top: 100 }),
    };
    document.getElementById = vi.fn().mockReturnValue(mockEl);
  });

  async function importPage() {
    const mod = await import("@/app/post/[authority]/[rkey]/page");
    return mod.default;
  }

  it("should show loading state", async () => {
    mockUsePostThread.mockReturnValue({
      data: undefined,
      error: null,
      status: "pending",
    });

    const Page = await importPage();
    render(<Page />);

    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("should show error state", async () => {
    mockUsePostThread.mockReturnValue({
      data: undefined,
      error: { message: "Post not found" },
      status: "error",
    });

    const Page = await importPage();
    render(<Page />);

    expect(screen.getByTestId("error-page")).toBeInTheDocument();
    expect(screen.getByText("Post not found")).toBeInTheDocument();
  });

  it("should render thread on success", async () => {
    mockUsePostThread.mockReturnValue({
      data: {
        thread: { $type: "app.bsky.feed.defs#threadViewPost", post: {} },
        threadgate: undefined,
      },
      error: null,
      status: "success",
    });

    const Page = await importPage();
    render(<Page />);

    expect(screen.getByTestId("feed-thread")).toBeInTheDocument();
  });

  it("should decode authority parameter", async () => {
    mockUsePostThread.mockReturnValue({
      data: undefined,
      error: null,
      status: "pending",
    });

    const Page = await importPage();
    render(<Page />);

    expect(mockUsePostThread).toHaveBeenCalledWith(
      "test.bsky.social",
      "3kabc123",
    );
  });

  it("should render bottom spacer on success", async () => {
    mockUsePostThread.mockReturnValue({
      data: {
        thread: { $type: "app.bsky.feed.defs#threadViewPost", post: {} },
        threadgate: undefined,
      },
      error: null,
      status: "success",
    });

    const Page = await importPage();
    const { container } = render(<Page />);

    const spacer = container.querySelector(".h-\\[calc\\(50dvh\\)\\]");
    expect(spacer).toBeInTheDocument();
  });
});
