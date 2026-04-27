import { describe, expect, it } from "vitest";

import { BLUESKY_CONTENT_LIMIT } from "@/lib/constants";

describe("BLUESKY_CONTENT_LIMIT", () => {
  it("should be 250", () => {
    expect(BLUESKY_CONTENT_LIMIT).toBe(250);
  });
});
