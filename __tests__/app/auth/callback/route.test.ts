import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/auth/callback/route";

const {
  mockCallback,
  mockAuthorize,
  mockSave,
  mockGetOptionalSession,
  mockCreateUser,
} = vi.hoisted(() => ({
  mockCallback: vi.fn(),
  mockAuthorize: vi.fn(),
  mockSave: vi.fn(),
  mockGetOptionalSession: vi.fn(),
  mockCreateUser: vi.fn(),
}));

vi.mock("@atproto/api", () => ({
  Agent: vi.fn().mockImplementation(function (this: {
    getProfile: ReturnType<typeof vi.fn>;
  }) {
    this.getProfile = vi.fn().mockResolvedValue({
      data: {
        did: "did:plc:abc",
        handle: "alice.bsky.social",
        displayName: "Alice",
        avatar: "https://example.com/avatar.jpg",
      },
    });
  }),
}));

vi.mock("@atproto/oauth-client-node", () => ({
  OAuthCallbackError: class OAuthCallbackError extends Error {
    params: URLSearchParams;
    state: string | undefined;
    constructor(
      message: string,
      params: Record<string, string> = {},
      state?: string,
    ) {
      super(message);
      this.params = new URLSearchParams(params);
      this.state = state;
    }
  },
}));

vi.mock("@/lib/bluesky", () => ({
  blueskyClient: {
    callback: (...args: unknown[]) => mockCallback(...args),
    authorize: (...args: unknown[]) => mockAuthorize(...args),
  },
}));

vi.mock("@/lib/session", () => ({
  getOptionalSession: () => mockGetOptionalSession(),
}));

vi.mock("@/lib/bluesky/utils", () => ({
  createUser: <T extends Record<string, unknown>>(data: T) =>
    mockCreateUser(data),
}));

const originalEnv = process.env;

describe("GET /auth/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, PUBLIC_URL: "https://example.com" };
    mockGetOptionalSession.mockResolvedValue({
      user: null,
      save: mockSave,
    });
    mockCreateUser.mockImplementation(
      <T extends Record<string, unknown>>(data: T) => ({
        did: data.did,
        handle: data.handle,
        displayName: data.displayName,
        avatar: data.avatar,
      }),
    );
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should redirect to home on successful callback", async () => {
    const mockSession = { did: "did:plc:abc" };

    mockCallback.mockResolvedValue({
      session: mockSession,
      state: JSON.stringify({ redirectTo: "/home" }),
    });

    const request = new NextRequest(
      "https://example.com/auth/callback?code=abc&state=test",
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://example.com/home");
    expect(mockSave).toHaveBeenCalled();
  });

  it("should redirect to custom redirectTo path", async () => {
    mockCallback.mockResolvedValue({
      session: { did: "did:plc:abc" },
      state: JSON.stringify({ redirectTo: "/profile/alice" }),
    });

    const request = new NextRequest(
      "https://example.com/auth/callback?code=abc",
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://example.com/profile/alice",
    );
  });

  it("should redirect to /home when no redirectTo in state", async () => {
    mockCallback.mockResolvedValue({
      session: { did: "did:plc:abc" },
      state: JSON.stringify({}),
    });

    const request = new NextRequest(
      "https://example.com/auth/callback?code=abc",
    );

    const response = await GET(request);

    expect(response.headers.get("location")).toBe("https://example.com/home");
  });

  it("should redirect to error page on missing state", async () => {
    mockCallback.mockResolvedValue({
      session: { did: "did:plc:abc" },
      state: null,
    });

    const request = new NextRequest(
      "https://example.com/auth/callback?code=abc",
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/auth/error");
  });

  it("should redirect to error page on general error", async () => {
    mockCallback.mockRejectedValue(new Error("OAuth failed"));

    const request = new NextRequest(
      "https://example.com/auth/callback?code=abc",
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/auth/error");
    expect(response.headers.get("location")).toContain("OAuth%20failed");
  });

  it("should redirect to error page for unknown non-Error errors", async () => {
    mockCallback.mockRejectedValue("string error");

    const request = new NextRequest(
      "https://example.com/auth/callback?code=abc",
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("Unknown%20error");
  });

  it("should re-authorize on login_required error", async () => {
    const { OAuthCallbackError } = await import("@atproto/oauth-client-node");

    const oauthError = new OAuthCallbackError(
      "login_required",
      { error: "login_required" },
      JSON.stringify({ handle: "alice.bsky.social", redirectTo: "/home" }),
    );

    mockCallback.mockRejectedValue(oauthError);
    mockAuthorize.mockResolvedValue("https://authorize.url/abc");

    const request = new NextRequest(
      "https://example.com/auth/callback?code=abc",
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(mockAuthorize).toHaveBeenCalledWith("alice.bsky.social", {
      state: JSON.stringify({
        handle: "alice.bsky.social",
        redirectTo: "/home",
      }),
    });
  });

  it("should re-authorize on consent_required error", async () => {
    const { OAuthCallbackError } = await import("@atproto/oauth-client-node");

    const oauthError = new OAuthCallbackError(
      "consent_required",
      { error: "consent_required" },
      JSON.stringify({ handle: "bob.bsky.social", redirectTo: "/home" }),
    );

    mockCallback.mockRejectedValue(oauthError);
    mockAuthorize.mockResolvedValue("https://authorize.url/abc");

    const request = new NextRequest(
      "https://example.com/auth/callback?code=abc",
    );

    await GET(request);

    expect(mockAuthorize).toHaveBeenCalled();
  });

  it("should redirect to error page when re-authorization fails", async () => {
    const { OAuthCallbackError } = await import("@atproto/oauth-client-node");

    const oauthError = new OAuthCallbackError(
      "login_required",
      { error: "login_required" },
      JSON.stringify({ handle: "alice.bsky.social", redirectTo: "/home" }),
    );

    mockCallback.mockRejectedValue(oauthError);
    mockAuthorize.mockRejectedValue(new Error("Authorization service down"));

    const request = new NextRequest(
      "https://example.com/auth/callback?code=abc",
    );

    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/auth/error");
  });
});
