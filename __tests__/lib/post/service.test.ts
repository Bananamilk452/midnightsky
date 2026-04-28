import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mockPrisma = {
  publicPost: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  privatePost: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  listPost: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

const mockGetSession = vi.fn();
vi.mock("@/lib/session", () => ({
  getSession: (...args: unknown[]) => mockGetSession(...args),
}));

vi.mock("@/lib/utils.server", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/utils.server")>(
      "@/lib/utils.server",
    );
  return {
    ...actual,
    ApiError: actual.ApiError,
  };
});

describe("post/service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      user: { did: "did:plc:test", handle: "test.bsky.social" },
    });
  });

  describe("getPostByRkey", () => {
    it("should return public post when found", async () => {
      const publicPost = { id: "1", rkey: "rkey1", authorDid: "did:plc:test" };
      mockPrisma.publicPost.findFirst.mockResolvedValue(publicPost);
      mockPrisma.privatePost.findFirst.mockResolvedValue(null);
      mockPrisma.listPost.findFirst.mockResolvedValue(null);

      const { getPostByRkey } = await import("@/lib/post/service");
      const result = await getPostByRkey("rkey1");

      expect(result).toEqual({ type: "public", post: publicPost });
    });

    it("should return private post when found", async () => {
      mockPrisma.publicPost.findFirst.mockResolvedValue(null);
      const privatePost = {
        id: "2",
        rkey: "rkey2",
        encryptedContent: "enc",
        iv: "iv",
      };
      mockPrisma.privatePost.findFirst.mockResolvedValue(privatePost);
      mockPrisma.listPost.findFirst.mockResolvedValue(null);

      const { getPostByRkey } = await import("@/lib/post/service");
      const result = await getPostByRkey("rkey2");

      expect(result).toEqual({ type: "private", post: privatePost });
    });

    it("should return list post when found", async () => {
      mockPrisma.publicPost.findFirst.mockResolvedValue(null);
      mockPrisma.privatePost.findFirst.mockResolvedValue(null);
      const listPost = { id: "3", rkey: "rkey3", listId: "list1" };
      mockPrisma.listPost.findFirst.mockResolvedValue(listPost);

      const { getPostByRkey } = await import("@/lib/post/service");
      const result = await getPostByRkey("rkey3");

      expect(result).toEqual({ type: "list", post: listPost });
    });

    it("should throw ApiError when post not found", async () => {
      mockPrisma.publicPost.findFirst.mockResolvedValue(null);
      mockPrisma.privatePost.findFirst.mockResolvedValue(null);
      mockPrisma.listPost.findFirst.mockResolvedValue(null);

      const { getPostByRkey } = await import("@/lib/post/service");

      await expect(getPostByRkey("nonexistent")).rejects.toThrow(
        "Post not found",
      );
    });
  });

  describe("getPublicPostById", () => {
    it("should return post when found", async () => {
      const post = { id: "1", rkey: "rkey1" };
      mockPrisma.publicPost.findUnique.mockResolvedValue(post);

      const { getPublicPostById } = await import("@/lib/post/service");
      const result = await getPublicPostById("1");

      expect(result).toEqual(post);
    });

    it("should throw ApiError when not found", async () => {
      mockPrisma.publicPost.findUnique.mockResolvedValue(null);

      const { getPublicPostById } = await import("@/lib/post/service");

      await expect(getPublicPostById("nonexistent")).rejects.toThrow(
        "Post not found",
      );
    });
  });

  describe("createPublicPostRecord", () => {
    it("should create a public post in the database", async () => {
      const created = {
        id: "1",
        content: "Hello",
        blueskyContent: "Hello",
        authorDid: "did:plc:test",
        rkey: "rkey1",
      };
      mockPrisma.publicPost.create.mockResolvedValue(created);

      const { createPublicPostRecord } = await import("@/lib/post/service");
      const result = await createPublicPostRecord("rkey1", {
        content: "Hello",
        blueskyContent: "Hello",
        type: "public",
      });

      expect(result).toEqual(created);
      expect(mockPrisma.publicPost.create).toHaveBeenCalledWith({
        data: {
          content: "Hello",
          blueskyContent: "Hello",
          authorDid: "did:plc:test",
          rkey: "rkey1",
        },
      });
    });
  });

  describe("deletePostById", () => {
    it("should delete public post", async () => {
      mockPrisma.publicPost.delete.mockResolvedValue({});

      const { deletePostById } = await import("@/lib/post/service");
      await deletePostById("public", "1");

      expect(mockPrisma.publicPost.delete).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("should delete private post", async () => {
      mockPrisma.privatePost.delete.mockResolvedValue({});

      const { deletePostById } = await import("@/lib/post/service");
      await deletePostById("private", "2");

      expect(mockPrisma.privatePost.delete).toHaveBeenCalledWith({
        where: { id: "2" },
      });
    });

    it("should delete list post", async () => {
      mockPrisma.listPost.delete.mockResolvedValue({});

      const { deletePostById } = await import("@/lib/post/service");
      await deletePostById("list", "3");

      expect(mockPrisma.listPost.delete).toHaveBeenCalledWith({
        where: { id: "3" },
      });
    });

    it("should throw for invalid type", async () => {
      const { deletePostById } = await import("@/lib/post/service");

      await expect(deletePostById("invalid", "1")).rejects.toThrow(
        "Invalid post type",
      );
    });
  });
});
