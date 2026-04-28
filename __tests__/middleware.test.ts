import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetOptionalSession = vi.fn();

vi.mock("@/lib/session", () => ({
  getOptionalSession: (...args: unknown[]) => mockGetOptionalSession(...args),
}));

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function importMiddleware() {
    return await import("@/middleware");
  }

  it("should redirect to sign-in when not authenticated", async () => {
    mockGetOptionalSession.mockResolvedValue({});

    const { middleware } = await importMiddleware();
    const request = new NextRequest("https://example.com/home");
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/sign-in");
    expect(response.headers.get("location")).toContain("redirectTo=/home");
  });

  it("should allow access to sign-in page when not authenticated", async () => {
    mockGetOptionalSession.mockResolvedValue({});

    const { middleware } = await importMiddleware();
    const request = new NextRequest("https://example.com/sign-in");
    const response = await middleware(request);

    expect(response).toBeInstanceOf(NextResponse);
  });

  it("should redirect to home when authenticated and visiting sign-in", async () => {
    mockGetOptionalSession.mockResolvedValue({
      user: { did: "did:plc:abc", handle: "alice.bsky.social" },
    });

    const { middleware } = await importMiddleware();
    const request = new NextRequest("https://example.com/sign-in");
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/home");
  });

  it("should allow access to protected pages when authenticated", async () => {
    mockGetOptionalSession.mockResolvedValue({
      user: { did: "did:plc:abc", handle: "alice.bsky.social" },
    });

    const { middleware } = await importMiddleware();
    const request = new NextRequest("https://example.com/home");
    const response = await middleware(request);

    expect(response).toBeInstanceOf(NextResponse);
  });
});
