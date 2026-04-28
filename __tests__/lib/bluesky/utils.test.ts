import { AppBskyActorDefs } from "@atproto/api";
import { describe, expect, it } from "vitest";

import { createUser } from "@/lib/bluesky/utils";

describe("createUser", () => {
  it("should extract user fields from ProfileViewDetailed", () => {
    const data: AppBskyActorDefs.ProfileViewDetailed = {
      did: "did:plc:abc123",
      handle: "alice.bsky.social",
      displayName: "Alice",
      avatar: "https://cdn.example.com/avatar.jpg",
      description: "Hello world",
      banner: "https://cdn.example.com/banner.jpg",
    };

    const user = createUser(data);

    expect(user).toEqual({
      did: "did:plc:abc123",
      handle: "alice.bsky.social",
      displayName: "Alice",
      avatar: "https://cdn.example.com/avatar.jpg",
      description: "Hello world",
      banner: "https://cdn.example.com/banner.jpg",
    });
  });

  it("should handle undefined optional fields", () => {
    const data: AppBskyActorDefs.ProfileViewDetailed = {
      did: "did:plc:abc123",
      handle: "bob.bsky.social",
      displayName: undefined,
      avatar: undefined,
      description: undefined,
      banner: undefined,
    };

    const user = createUser(data);

    expect(user).toEqual({
      did: "did:plc:abc123",
      handle: "bob.bsky.social",
      displayName: undefined,
      avatar: undefined,
      description: undefined,
      banner: undefined,
    });
  });
});

describe("getRelativeTimeBasic", () => {
  it("should return relative time in English by default", async () => {
    const { getRelativeTimeBasic } = await import("@/lib/bluesky/utils");
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const result = getRelativeTimeBasic(fiveMinutesAgo, "en");

    expect(result).toMatch(/minutes/i);
  });

  it("should return relative time in Korean for ko locale", async () => {
    const { getRelativeTimeBasic } = await import("@/lib/bluesky/utils");
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const result = getRelativeTimeBasic(fiveMinutesAgo, "ko");

    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("should accept string date", async () => {
    const { getRelativeTimeBasic } = await import("@/lib/bluesky/utils");
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const result = getRelativeTimeBasic(fiveMinutesAgo, "en");

    expect(result).toMatch(/minutes/i);
  });
});

describe("validateRecord", () => {
  it("should return undefined for invalid record data", async () => {
    const { validateRecord } = await import("@/lib/bluesky/utils");

    const result = validateRecord({ foo: "bar" });

    expect(result).toBeUndefined();
  });

  it("should return record data for valid post record", async () => {
    const { validateRecord } = await import("@/lib/bluesky/utils");

    const validRecord = {
      $type: "app.bsky.feed.post",
      text: "Hello world",
      createdAt: new Date().toISOString(),
    };

    const result = validateRecord(validRecord);

    expect(result).toBeDefined();
    if (result) {
      expect(result.text).toBe("Hello world");
    }
  });
});
