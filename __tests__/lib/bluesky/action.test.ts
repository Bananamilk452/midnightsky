import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockBlueskyClient, mockGetSession, mockGetOptionalSession, mockAgent } =
  vi.hoisted(() => {
    const agent = {
      getProfile: vi.fn(),
      getTimeline: vi.fn(),
      getAuthorFeed: vi.fn(),
      getPostThread: vi.fn(),
      app: {
        bsky: {
          graph: { getLists: vi.fn(), getRelationships: vi.fn() },
          bookmark: {
            createBookmark: vi.fn(),
            deleteBookmark: vi.fn(),
            getBookmarks: vi.fn(),
          },
        },
      },
      com: {
        atproto: {
          repo: {
            createRecord: vi.fn(),
            deleteRecord: vi.fn(),
          },
        },
      },
    };
    return {
      mockBlueskyClient: { authorize: vi.fn(), restore: vi.fn() },
      mockGetSession: vi.fn(),
      mockGetOptionalSession: vi.fn(),
      mockAgent: agent,
    };
  });

vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

vi.mock("@/lib/bluesky", () => ({
  blueskyClient: mockBlueskyClient,
}));

vi.mock("@/lib/session", () => ({
  getSession: (...args: unknown[]) => mockGetSession(...args),
  getOptionalSession: (...args: unknown[]) => mockGetOptionalSession(...args),
}));

vi.mock("@/lib/bluesky/service", () => ({
  applyWrites: vi.fn(),
  getRelationship: vi.fn(),
  getPostIsReplyDisabled: vi.fn(),
}));

vi.mock("@/lib/bluesky/utils", () => ({
  createUser: vi.fn((d: any) => d),
  createRecord: vi.fn(),
  deleteRecord: vi.fn(),
  addReadArticleFacets: vi.fn(),
}));

vi.mock("@/lib/post/service", () => ({
  createPublicPostRecord: vi.fn(),
  createPrivatePostRecord: vi.fn(),
  createListPostRecord: vi.fn(),
  deletePostById: vi.fn(),
  getPostByRkey: vi.fn(),
  getPublicPostById: vi.fn(),
  getPrivatePostById: vi.fn(),
  getListPostById: vi.fn(),
}));

vi.mock("@/lib/utils.server", () => ({
  ApiError: class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
      this.name = "ApiError";
    }
  },
  jsonify: vi.fn((d: any) => JSON.parse(JSON.stringify(d))),
}));

vi.mock("@atproto/api", () => ({
  Agent: vi.fn().mockImplementation(function (this: any) {
    return mockAgent;
  }),
  RichText: vi.fn().mockImplementation(function (this: any, { text }: { text: string }) {
    this.text = text;
    this.facets = [];
    this.detectFacets = vi.fn();
    this.insert = vi.fn();
  }),
  AppBskyRichtextFacet: {},
}));

vi.mock("@atproto/common", () => ({
  TID: { nextStr: vi.fn().mockReturnValue("tid123") },
}));

describe("bluesky/action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      user: { did: "did:plc:test", handle: "test.bsky.social" },
      save: vi.fn(),
      destroy: vi.fn(),
    });
    mockGetOptionalSession.mockResolvedValue({
      user: { did: "did:plc:test", handle: "test.bsky.social" },
      save: vi.fn(),
      destroy: vi.fn(),
    });
  });

  describe("signInWithBluesky", () => {
    it("should return success with auth URL", async () => {
      mockBlueskyClient.authorize.mockResolvedValue(
        new URL("https://auth.example.com/authorize"),
      );

      const { signInWithBluesky } = await import("@/lib/bluesky/action");
      const result = await signInWithBluesky("alice.bsky.social");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toContain("authorize");
      }
    });

    it("should return error on failure", async () => {
      mockBlueskyClient.authorize.mockRejectedValue(
        new Error("User not found"),
      );

      const { signInWithBluesky } = await import("@/lib/bluesky/action");
      const result = await signInWithBluesky("nonexistent.bsky.social");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("should trim handle before authorizing", async () => {
      mockBlueskyClient.authorize.mockResolvedValue(
        new URL("https://auth.example.com/authorize"),
      );

      const { signInWithBluesky } = await import("@/lib/bluesky/action");
      await signInWithBluesky("  alice.bsky.social  ");

      expect(mockBlueskyClient.authorize).toHaveBeenCalledWith(
        "alice.bsky.social",
        expect.any(Object),
      );
    });
  });

  describe("getAgent", () => {
    it("should restore session and create Agent", async () => {
      mockBlueskyClient.restore.mockResolvedValue({ did: "did:plc:test" });

      const { getAgent } = await import("@/lib/bluesky/action");
      const agent = await getAgent("did:plc:test");

      expect(mockBlueskyClient.restore).toHaveBeenCalledWith("did:plc:test");
      expect(agent).toBeDefined();
    });
  });

  describe("getSessionAgent", () => {
    it("should throw ApiError when not authenticated", async () => {
      mockGetOptionalSession.mockResolvedValue({ user: null });

      const { getSessionAgent } = await import("@/lib/bluesky/action");

      await expect(getSessionAgent()).rejects.toThrow(
        "User is not authenticated or did is missing",
      );
    });

    it("should return agent when authenticated", async () => {
      mockBlueskyClient.restore.mockResolvedValue({ did: "did:plc:test" });

      const { getSessionAgent } = await import("@/lib/bluesky/action");
      const agent = await getSessionAgent();

      expect(agent).toBeDefined();
    });
  });

  describe("getTimeline", () => {
    it("should return success with timeline data", async () => {
      mockBlueskyClient.restore.mockResolvedValue({ did: "did:plc:test" });
      mockAgent.getTimeline.mockResolvedValue({
        data: { cursor: "cursor1", feed: [] },
      });

      const { getTimeline } = await import("@/lib/bluesky/action");
      const result = await getTimeline(30);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.feed).toEqual([]);
      }
    });

    it("should return error on failure", async () => {
      mockBlueskyClient.restore.mockResolvedValue({ did: "did:plc:test" });
      mockAgent.getTimeline.mockRejectedValue(new Error("Network error"));

      const { getTimeline } = await import("@/lib/bluesky/action");
      const result = await getTimeline();

      expect(result.success).toBe(false);
    });
  });

  describe("getProfile", () => {
    it("should return success with profile data", async () => {
      mockBlueskyClient.restore.mockResolvedValue({ did: "did:plc:test" });
      mockAgent.getProfile.mockResolvedValue({
        data: {
          did: "did:plc:alice",
          handle: "alice.bsky.social",
          displayName: "Alice",
          description: "Hello",
        },
      });

      const { getProfile } = await import("@/lib/bluesky/action");
      const result = await getProfile("alice.bsky.social");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.handle).toBe("alice.bsky.social");
      }
    });
  });

  describe("getAuthorFeed", () => {
    it("should return success with feed data", async () => {
      mockBlueskyClient.restore.mockResolvedValue({ did: "did:plc:test" });
      mockAgent.getAuthorFeed.mockResolvedValue({
        data: { cursor: "c1", feed: [] },
      });

      const { getAuthorFeed } = await import("@/lib/bluesky/action");
      const result = await getAuthorFeed({
        limit: 30,
        actor: "alice.bsky.social",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("likePost / unlikePost", () => {
    it("should return success after liking a post", async () => {
      const { createRecord } = await import("@/lib/bluesky/utils");
      (createRecord as any).mockResolvedValue({ success: true });

      const { likePost } = await import("@/lib/bluesky/action");
      const result = await likePost({
        cid: "cid1",
        uri: "at://did:plc:a/app.bsky.feed.post/1",
      });

      expect(result.success).toBe(true);
    });

    it("should return success after unliking a post", async () => {
      const { deleteRecord } = await import("@/lib/bluesky/utils");
      (deleteRecord as any).mockResolvedValue({ success: true });

      const { unlikePost } = await import("@/lib/bluesky/action");
      const result = await unlikePost(
        "at://did:plc:a/app.bsky.feed.like/123",
      );

      expect(result.success).toBe(true);
    });
  });

  describe("repostPost / unrepostPost", () => {
    it("should return success after reposting", async () => {
      const { createRecord } = await import("@/lib/bluesky/utils");
      (createRecord as any).mockResolvedValue({ success: true });

      const { repostPost } = await import("@/lib/bluesky/action");
      const result = await repostPost({
        cid: "cid1",
        uri: "at://did:plc:a/app.bsky.feed.post/1",
      });

      expect(result.success).toBe(true);
    });

    it("should return success after unreposting", async () => {
      const { deleteRecord } = await import("@/lib/bluesky/utils");
      (deleteRecord as any).mockResolvedValue({ success: true });

      const { unrepostPost } = await import("@/lib/bluesky/action");
      const result = await unrepostPost(
        "at://did:plc:a/app.bsky.feed.repost/123",
      );

      expect(result.success).toBe(true);
    });
  });

  describe("createBookmark / deleteBookmark", () => {
    it("should return success after creating bookmark", async () => {
      mockBlueskyClient.restore.mockResolvedValue({ did: "did:plc:test" });
      mockAgent.app.bsky.bookmark.createBookmark.mockResolvedValue({
        success: true,
      });

      const { createBookmark } = await import("@/lib/bluesky/action");
      const result = await createBookmark({
        cid: "cid1",
        uri: "at://did:plc:a/app.bsky.feed.post/1",
      });

      expect(result.success).toBe(true);
    });

    it("should return success after deleting bookmark", async () => {
      mockBlueskyClient.restore.mockResolvedValue({ did: "did:plc:test" });
      mockAgent.app.bsky.bookmark.deleteBookmark.mockResolvedValue({
        success: true,
      });

      const { deleteBookmark } = await import("@/lib/bluesky/action");
      const result = await deleteBookmark(
        "at://did:plc:a/app.bsky.feed.post/1",
      );

      expect(result.success).toBe(true);
    });
  });

  describe("getBookmarks", () => {
    it("should return success with bookmarks", async () => {
      mockBlueskyClient.restore.mockResolvedValue({ did: "did:plc:test" });
      mockAgent.app.bsky.bookmark.getBookmarks.mockResolvedValue({
        data: { bookmarks: [], cursor: null },
      });

      const { getBookmarks } = await import("@/lib/bluesky/action");
      const result = await getBookmarks(30);

      expect(result.success).toBe(true);
    });
  });
});
