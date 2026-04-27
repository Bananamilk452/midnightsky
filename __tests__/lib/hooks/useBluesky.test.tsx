// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { type ReactNode } from "react";

vi.mock("@/lib/bluesky/action", () => ({
  signInWithBluesky: vi.fn(),
  signOut: vi.fn(),
  getTimeline: vi.fn().mockResolvedValue({
    success: true,
    data: { feed: [], cursor: null },
  }),
  getAuthorFeed: vi.fn().mockResolvedValue({
    success: true,
    data: { feed: [], cursor: null },
  }),
  getPostThread: vi.fn().mockResolvedValue({
    success: true,
    data: { thread: {} },
  }),
  getProfile: vi.fn().mockResolvedValue({
    success: true,
    data: { did: "did:plc:abc", handle: "alice.bsky.social" },
  }),
  createPost: vi.fn(),
  likePost: vi.fn(),
  unlikePost: vi.fn(),
  repostPost: vi.fn(),
  unrepostPost: vi.fn(),
  deletePost: vi.fn(),
  createBookmark: vi.fn(),
  deleteBookmark: vi.fn(),
  getBookmarks: vi.fn().mockResolvedValue({
    success: true,
    data: { bookmarks: [], cursor: null },
  }),
  getPublicPost: vi.fn(),
  getPrivatePost: vi.fn(),
  getListPost: vi.fn(),
  getMyLists: vi.fn().mockResolvedValue({
    success: true,
    data: { lists: [] },
  }),
}));

vi.mock("@/lib/session", () => ({
  getSession: vi.fn().mockResolvedValue({
    user: { did: "did:plc:test", handle: "test.bsky.social" },
  }),
}));

vi.mock("@/lib/utils", async () => {
  const actual = await vi.importActual<typeof import("@/lib/utils")>("@/lib/utils");
  return {
    ...actual,
    serverActionErrorHandler: (action: any) => async (...args: any[]) => {
      const result = await action(...args);
      if (result.success) return result.data;
      throw new Error(result.error);
    },
  };
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useBluesky hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useSession", () => {
    it("should have correct queryKey", async () => {
      const { useSession } = await import("@/lib/hooks/useBluesky");
      const wrapper = createWrapper();

      const { result } = renderHook(() => useSession(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual({
        did: "did:plc:test",
        handle: "test.bsky.social",
      });
    });
  });

  describe("useTimeline", () => {
    it("should fetch timeline data", async () => {
      const { useTimeline } = await import("@/lib/hooks/useBluesky");
      const wrapper = createWrapper();

      const { result } = renderHook(
        () => useTimeline({ limit: 30 }),
        { wrapper },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe("useProfile", () => {
    it("should have correct queryKey with actor", async () => {
      const { useProfile } = await import("@/lib/hooks/useBluesky");
      const wrapper = createWrapper();

      const { result } = renderHook(
        () => useProfile("alice.bsky.social"),
        { wrapper },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe("useBookmarks", () => {
    it("should fetch bookmarks data", async () => {
      const { useBookmarks } = await import("@/lib/hooks/useBluesky");
      const wrapper = createWrapper();

      const { result } = renderHook(
        () => useBookmarks({ limit: 30 }),
        { wrapper },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe("useMyLists", () => {
    it("should fetch lists data", async () => {
      const { useMyLists } = await import("@/lib/hooks/useBluesky");
      const wrapper = createWrapper();

      const { result } = renderHook(() => useMyLists(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });
});
