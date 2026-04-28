// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  makeFeedPostRecord,
  makePostView,
  makeViewerState,
  wrapWithFeedContext,
} from "@/__tests__/helpers/feed";

const mockUseSession = vi.fn();
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
  Repeat2Icon: ({ className }: { className?: string }) => (
    <svg data-testid="repeat-icon" className={className} />
  ),
  HeartIcon: ({ className }: { className?: string }) => (
    <svg data-testid="heart-icon" className={className} />
  ),
  ShareIcon: () => <svg data-testid="share-icon" />,
  BookmarkIcon: ({ className }: { className?: string }) => (
    <svg data-testid="bookmark-icon" className={className} />
  ),
  EllipsisIcon: () => <svg data-testid="ellipsis-icon" />,
  TrashIcon: () => <svg data-testid="trash-icon" />,
}));

vi.mock("@/components/providers/WriterProvider", () => ({
  useWriter: () => ({ openWriter: mockOpenWriter }),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  DropdownMenuGroup: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
  }: React.PropsWithChildren<{ onClick?: () => void }>) => (
    <button data-testid="dropdown-item" onClick={onClick}>
      {children}
    </button>
  ),
  DropdownMenuTrigger: ({
    children,
    disabled,
  }: React.PropsWithChildren<{ disabled?: boolean }>) => (
    <div data-testid="dropdown-trigger" data-disabled={disabled}>
      {children}
    </div>
  ),
}));

vi.mock("@/lib/bluesky/utils", () => ({
  validateRecord: () => ({
    createdAt: "2024-01-01T00:00:00Z",
    text: "test",
  }),
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
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
  parseAtUri: () => ({
    rkey: "abc123",
    authority: "did:plc:test",
    collection: "app.bsky.feed.post",
  }),
}));

describe("FeedFooter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSession.mockReturnValue({ data: { did: "did:plc:test" } });
  });

  async function importModules() {
    const { FeedFooter, FeedFooterButton } = await import(
      "@/components/feed/Footer"
    );
    const { FeedContext } = await import("@/components/feed/context");
    return { FeedFooter, FeedFooterButton, FeedContext };
  }

  it("should render all action buttons", async () => {
    const { FeedFooter } = await importModules();
    render(wrapWithFeedContext(<FeedFooter />));

    expect(screen.getByTestId("msg-icon")).toBeInTheDocument();
    expect(screen.getByTestId("repeat-icon")).toBeInTheDocument();
    expect(screen.getByTestId("heart-icon")).toBeInTheDocument();
    expect(screen.getByTestId("bookmark-icon")).toBeInTheDocument();
    expect(screen.getByTestId("share-icon")).toBeInTheDocument();
    expect(screen.getByTestId("ellipsis-icon")).toBeInTheDocument();
  });

  it("should show reply count when greater than 0", async () => {
    const { FeedFooter } = await importModules();
    render(
      wrapWithFeedContext(<FeedFooter />, {
        post: makePostView({ replyCount: 5 }),
      }),
    );

    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("should open writer on mention button click", async () => {
    const { FeedFooter } = await importModules();
    render(wrapWithFeedContext(<FeedFooter />));

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);

    expect(mockOpenWriter).toHaveBeenCalled();
  });

  it("should toggle like on click", async () => {
    const { FeedFooter } = await importModules();
    render(wrapWithFeedContext(<FeedFooter />));

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[2]);

    expect(mockMutateLike).toHaveBeenCalledWith(
      { cid: "cid1", uri: "at://did:plc:test/app.bsky.feed.post/rkey1" },
      expect.any(Object),
    );
  });

  it("should toggle unlike when already liked", async () => {
    const { FeedFooter } = await importModules();
    render(
      wrapWithFeedContext(<FeedFooter />, {
        post: makePostView({
          viewer: makeViewerState({ like: "at://like" }),
        }),
      }),
    );

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[2]);

    expect(mockMutateUnlike).toHaveBeenCalledWith(
      "at://did:plc:test/app.bsky.feed.post/rkey1",
      expect.any(Object),
    );
  });

  it("should toggle repost on click", async () => {
    const { FeedFooter } = await importModules();
    render(wrapWithFeedContext(<FeedFooter />));

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[1]);

    expect(mockMutateRepost).toHaveBeenCalledWith(
      { cid: "cid1", uri: "at://did:plc:test/app.bsky.feed.post/rkey1" },
      expect.any(Object),
    );
  });

  it("should toggle bookmark on click", async () => {
    const { FeedFooter } = await importModules();
    render(wrapWithFeedContext(<FeedFooter />));

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[3]);

    expect(mockMutateCreateBookmark).toHaveBeenCalledWith(
      { cid: "cid1", uri: "at://did:plc:test/app.bsky.feed.post/rkey1" },
      expect.any(Object),
    );
  });

  it("should disable menu dropdown when user is not author", async () => {
    mockUseSession.mockReturnValue({ data: { did: "did:plc:other" } });
    const { FeedFooter } = await importModules();
    render(wrapWithFeedContext(<FeedFooter />));

    const trigger = screen.getByTestId("dropdown-trigger");
    expect(trigger).toHaveAttribute("data-disabled", "true");
  });

  it("should enable menu dropdown when user is author", async () => {
    const { FeedFooter } = await importModules();
    render(wrapWithFeedContext(<FeedFooter />));

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
