import { describe, expect, it } from "vitest";

import { createPostSchema } from "@/lib/bluesky/types";

const schema = createPostSchema("Max 250 characters");

describe("createPostSchema", () => {
  describe("public post", () => {
    it("should validate a valid public post", () => {
      const result = schema.safeParse({
        content: "Hello world",
        blueskyContent: "Hello world",
        type: "public",
      });

      expect(result.success).toBe(true);
    });

    it("should validate a public post with reply", () => {
      const result = schema.safeParse({
        content: "Reply text",
        blueskyContent: "Reply text",
        type: "public",
        reply: {
          root: { cid: "cid1", uri: "at://did:plc:a/app.bsky.feed.post/1" },
          parent: { cid: "cid2", uri: "at://did:plc:a/app.bsky.feed.post/2" },
        },
      });

      expect(result.success).toBe(true);
    });
  });

  describe("private post", () => {
    it("should validate a valid private post", () => {
      const result = schema.safeParse({
        content: "Private message",
        blueskyContent: "Private message",
        type: "private",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("list post", () => {
    it("should validate a valid list post with listId", () => {
      const result = schema.safeParse({
        content: "List post",
        blueskyContent: "List post",
        type: "list",
        listId: "list-123",
      });

      expect(result.success).toBe(true);
    });

    it("should reject list post without listId", () => {
      const result = schema.safeParse({
        content: "List post",
        blueskyContent: "List post",
        type: "list",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("reply post", () => {
    it("should validate a valid reply post", () => {
      const result = schema.safeParse({
        content: "Reply",
        blueskyContent: "Reply",
        type: "reply",
        reply: {
          root: { cid: "cid1", uri: "at://did:plc:a/app.bsky.feed.post/1" },
          parent: { cid: "cid2", uri: "at://did:plc:a/app.bsky.feed.post/2" },
        },
      });

      expect(result.success).toBe(true);
    });
  });

  describe("validation errors", () => {
    it("should reject missing content", () => {
      const result = schema.safeParse({
        blueskyContent: "text",
        type: "public",
      });

      expect(result.success).toBe(false);
    });

    it("should reject missing blueskyContent", () => {
      const result = schema.safeParse({
        content: "text",
        type: "public",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid type", () => {
      const result = schema.safeParse({
        content: "text",
        blueskyContent: "text",
        type: "invalid",
      });

      expect(result.success).toBe(false);
    });

    it("should reject blueskyContent exceeding 250 characters", () => {
      const result = schema.safeParse({
        content: "a".repeat(300),
        blueskyContent: "a".repeat(251),
        type: "public",
      });

      expect(result.success).toBe(false);
    });

    it("should accept blueskyContent at exactly 250 characters", () => {
      const result = schema.safeParse({
        content: "a".repeat(250),
        blueskyContent: "a".repeat(250),
        type: "public",
      });

      expect(result.success).toBe(true);
    });

    it("should reject empty object", () => {
      const result = schema.safeParse({});

      expect(result.success).toBe(false);
    });
  });
});
