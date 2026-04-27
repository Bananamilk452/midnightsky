// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUseSession = vi.fn();
const mockUseRepost = vi.fn();
const mockUseUnrepost = vi.fn();
const mockUseLike = vi.fn();
const mockUseUnlike = vi.fn();
const mockUseCreateBookmark = vi.fn();
const mockUseDeleteBookmark = vi.fn();
const mockUseDeletePost = vi.fn();
const mockOpenWriter = vi.fn();
const mockMutateRepost = vi.fn();
const mockMutateUnrepost = vi.fn();
const mockMutateLike = vi.fn();
const mockMutateUnlike = vi.fn();
const mockMutateCreateBookmark = vi.fn();
const mockMutateDeleteBookmark = vi.fn();
const mockMutateDeletePost = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      linkCopied: "Link copied",
      linkCopyFailed: "Failed",
      postDeleted: "Deleted",
      postDeleteFailed: "Failed to delete",
      deletePost: "Delete",
    };
    return map[key] || key;
  },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("usehooks-ts", () => ({
  useCopyToClipboard: () => [null, vi.fn().mockResolvedValue(true)],
}));

vi.mock("lucide-react", () => ({
  MessageSquareIcon: () => <svg data-testid="msg-icon" />,
  Repeat2Icon: ({ className }: any) => <svg data-testid="repeat-icon" className={className} />,
  HeartIcon: ({ className }: any) => <svg data-testid="heart-icon" className={className} />,
  ShareIcon: () => <svg data-testid="share-icon" />,
  BookmarkIcon: ({ className }: any) => <svg data-testid="bookmark-icon" className={className} />,
  EllipsisIcon: () => <svg data-testid="ellipsis-icon" />,
  TrashIcon: () => <svg data-testid="trash-icon" />,
}));

vi.mock("@/components/providers/WriterProvider", () => ({
  useWriter: () => ({ openWriter: mockOpenWriter }),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuGroup: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <button data-testid="dropdown-item" onClick={onClick}>{children}</button>
  ),
  DropdownMenuTrigger: ({ children, disabled }: any) => (
    <div data-testid="dropdown-trigger" data-disabled={disabled}>{children}</div>
  ),
}));

vi.mock("@/lib/bluesky/utils", () => ({
  validateRecord: () => ({ createdAt: "2024-01-01T00:00:00Z", text: "test" }),
  getValidThreadgateRecord: () => undefined,
}));

vi.mock("@/lib/hooks/useBluesky", () => ({
  useSession: () => mockUseSession(),
  useRepost: () => ({ mutate: mockMutateRepost }),
  useUnrepost: () => ({ mutate: mockMutateUnrepost }),
  useLike: () => ({ mutate: mockMutateLike }),
  useUnlike: () => ({ mutate: mockMutateUnlike }),
  useCreateBookmark: () => ({ mutate: mockMutateCreateBookmark }),
  useDeleteBookmark: () => ({ mutate: mockMutateDeleteBookmark }),
  useDeletePost: () => ({ mutate: mockMutateDeletePost }),
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(" "),
  parseAtUri: () => ({ rkey: "abc123", authority: "did:plc:test", collection: "app.bsky.feed.post" }),
}));

function mockPost(overrides?: Partial<any>): any {
  return {
    uri: "at://did:plc:test/app.bsky.feed.post/abc123",
    cid: "cid123",
    author: { did: "did:plc:test", handle: "test.bsky.social" },
    record: { text: "Hello", createdAt: "2024-01-01T00:00:00Z", $type: "app.bsky.feed.post" },
    replyCount: 5,
    repostCount: 10,
    likeCount: 20,
    viewer: { like: undefined, repost: undefined },
    ...overrides,
  };
}

describe("FeedFooter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSession.mockReturnValue({ data: { did: "did:plc:test" } });
  });

  async function importComponent() {
    const { FeedFooter, FeedFooterButton } = await import("@/components/feed/Footer");
    return { FeedFooter, FeedFooterButton };
  }

  it("should render all action buttons", async () => {
    const { FeedFooter } = await importComponent();
    render(<FeedFooter post={mockPost()} />);

    expect(screen.getByTestId("msg-icon")).toBeInTheDocument();
    expect(screen.getByTestId("repeat-icon")).toBeInTheDocument();
    expect(screen.getByTestId("heart-icon")).toBeInTheDocument();
    expect(screen.getByTestId("bookmark-icon")).toBeInTheDocument();
    expect(screen.getByTestId("share-icon")).toBeInTheDocument();
    expect(screen.getByTestId("ellipsis-icon")).toBeInTheDocument();
  });

  it("should show reply count when greater than 0", async () => {
    const { FeedFooter } = await importComponent();
    render(<FeedFooter post={mockPost({ replyCount: 5 })} />);

    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("should open writer on mention button click", async () => {
    const { FeedFooter } = await importComponent();
    render(<FeedFooter post={mockPost()} />);

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);

    expect(mockOpenWriter).toHaveBeenCalled();
  });

  it("should toggle like on click", async () => {
    const { FeedFooter } = await importComponent();
    render(<FeedFooter post={mockPost()} />);

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[2]);

    expect(mockMutateLike).toHaveBeenCalledWith(
      { cid: "cid123", uri: "at://did:plc:test/app.bsky.feed.post/abc123" },
      expect.any(Object),
    );
  });

  it("should toggle unlike when already liked", async () => {
    const { FeedFooter } = await importComponent();
    render(<FeedFooter post={mockPost({ viewer: { like: "at://like" } })} />);

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[2]);

    expect(mockMutateUnlike).toHaveBeenCalledWith(
      "at://did:plc:test/app.bsky.feed.post/abc123",
      expect.any(Object),
    );
  });

  it("should toggle repost on click", async () => {
    const { FeedFooter } = await importComponent();
    render(<FeedFooter post={mockPost()} />);

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[1]);

    expect(mockMutateRepost).toHaveBeenCalledWith(
      { cid: "cid123", uri: "at://did:plc:test/app.bsky.feed.post/abc123" },
      expect.any(Object),
    );
  });

  it("should toggle bookmark on click", async () => {
    const { FeedFooter } = await importComponent();
    render(<FeedFooter post={mockPost()} />);

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[3]);

    expect(mockMutateCreateBookmark).toHaveBeenCalledWith(
      { cid: "cid123", uri: "at://did:plc:test/app.bsky.feed.post/abc123" },
      expect.any(Object),
    );
  });

  it("should disable menu dropdown when user is not author", async () => {
    mockUseSession.mockReturnValue({ data: { did: "did:plc:other" } });
    const { FeedFooter } = await importComponent();
    render(<FeedFooter post={mockPost()} />);

    const trigger = screen.getByTestId("dropdown-trigger");
    expect(trigger).toHaveAttribute("data-disabled", "true");
  });

  it("should enable menu dropdown when user is author", async () => {
    const { FeedFooter } = await importComponent();
    render(<FeedFooter post={mockPost()} />);

    const trigger = screen.getByTestId("dropdown-trigger");
    expect(trigger).toHaveAttribute("data-disabled", "false");
  });
});

describe("FeedFooterButton", () => {
  async function importComponent() {
    const { FeedFooterButton } = await import("@/components/feed/Footer");
    return FeedFooterButton;
  }

  it("should render button with children", async () => {
    const FeedFooterButton = await importComponent();
    render(<FeedFooterButton>Click me</FeedFooterButton>);

    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("should be disabled when disabled prop is true", async () => {
    const FeedFooterButton = await importComponent();
    render(<FeedFooterButton disabled>Click</FeedFooterButton>);

    expect(screen.getByRole("button")).toBeDisabled();
  });
});
