import { describe, expect, it } from "vitest";

import { cn, createFeedKey, parseAtUri, serverActionErrorHandler, PAYLOAD_TOO_LARGE } from "@/lib/utils";
import type { ActionResult } from "@/lib/utils";

describe("cn", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("should merge tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("should handle undefined and null", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });

  it("should return empty string for no input", () => {
    expect(cn()).toBe("");
  });
});

describe("parseAtUri", () => {
  it("should parse a valid AT URI", () => {
    const result = parseAtUri("at://did:plc:abc123/app.bsky.feed.post/3k1234");
    expect(result).toEqual({
      authority: "did:plc:abc123",
      collection: "app.bsky.feed.post",
      rkey: "3k1234",
    });
  });

  it("should parse with handle authority", () => {
    const result = parseAtUri("at://alice.bsky.social/app.bsky.feed.post/xyz");
    expect(result).toEqual({
      authority: "alice.bsky.social",
      collection: "app.bsky.feed.post",
      rkey: "xyz",
    });
  });

  it("should throw for invalid AT URI with wrong format", () => {
    expect(() => parseAtUri("at://only/two")).toThrow("Invalid AT URI format");
  });

  it("should throw for AT URI with too many parts", () => {
    expect(() => parseAtUri("at://a/b/c/d")).toThrow("Invalid AT URI format");
  });

  it("should throw for AT URI with too few parts", () => {
    expect(() => parseAtUri("at://only")).toThrow("Invalid AT URI format");
  });
});

describe("createFeedKey", () => {
  it("should return post uri as key when no repost reason", () => {
    const post = {
      post: { uri: "at://did:plc:abc/app.bsky.feed.post/123" },
    } as any;

    expect(createFeedKey(post)).toBe("at://did:plc:abc/app.bsky.feed.post/123");
  });

  it("should append repost uri when reason is a repost", () => {
    const post = {
      post: { uri: "at://did:plc:abc/app.bsky.feed.post/123" },
      reason: {
        $type: "app.bsky.feed.defs#reasonRepost",
        uri: "at://did:plc:abc/app.bsky.feed.repost/456",
      },
    } as any;

    expect(createFeedKey(post)).toBe(
      "at://did:plc:abc/app.bsky.feed.post/123-at://did:plc:abc/app.bsky.feed.repost/456",
    );
  });
});

describe("serverActionErrorHandler", () => {
  it("should return data on success", async () => {
    const action = vi.fn().mockResolvedValue({ success: true, data: "ok" });
    const wrapped = serverActionErrorHandler(action);

    const result = await wrapped();
    expect(result).toBe("ok");
  });

  it("should throw error message on failure", async () => {
    const action = vi.fn().mockResolvedValue({
      success: false,
      error: "something went wrong",
    });
    const wrapped = serverActionErrorHandler(action);

    await expect(wrapped()).rejects.toThrow("something went wrong");
  });

  it("should throw PAYLOAD_TOO_LARGE on exception", async () => {
    const action = vi.fn().mockRejectedValue(new Error("network error"));
    const wrapped = serverActionErrorHandler(action);

    await expect(wrapped()).rejects.toThrow(PAYLOAD_TOO_LARGE);
  });

  it("should pass arguments to the original action", async () => {
    const action = vi.fn().mockResolvedValue({ success: true, data: "ok" });
    const wrapped = serverActionErrorHandler(action);

    await wrapped("arg1", "arg2");
    expect(action).toHaveBeenCalledWith("arg1", "arg2");
  });
});
