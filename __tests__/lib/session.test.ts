import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mockGetIronSession = vi.fn();
vi.mock("iron-session", () => ({
  getIronSession: (...args: unknown[]) => mockGetIronSession(...args),
}));

const mockCookies = vi.fn();
vi.mock("next/headers", () => ({
  cookies: (...args: unknown[]) => mockCookies(...args),
}));

describe("session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.COOKIE_PASSWORD =
      "test-cookie-password-that-is-long-enough-32chars";
  });

  describe("getOptionalSession", () => {
    it("should return session from iron-session", async () => {
      const mockSession = { user: null, save: vi.fn(), destroy: vi.fn() };
      mockCookies.mockResolvedValue({});
      mockGetIronSession.mockResolvedValue(mockSession);

      const { getOptionalSession } = await import("@/lib/session");
      const session = await getOptionalSession();

      expect(session).toBe(mockSession);
      expect(mockGetIronSession).toHaveBeenCalledWith(
        {},
        {
          cookieName: "sid",
          password: process.env.COOKIE_PASSWORD,
        },
      );
    });
  });

  describe("getSession", () => {
    it("should return session when user is authenticated", async () => {
      const mockSession = {
        user: { did: "did:plc:abc", handle: "alice.bsky.social" },
        save: vi.fn(),
        destroy: vi.fn(),
      };
      mockCookies.mockResolvedValue({});
      mockGetIronSession.mockResolvedValue(mockSession);

      const { getSession } = await import("@/lib/session");
      const session = await getSession();

      expect(session.user.did).toBe("did:plc:abc");
    });

    it("should throw ApiError when user is not authenticated", async () => {
      const mockSession = {
        user: null,
        save: vi.fn(),
        destroy: vi.fn(),
      };
      mockCookies.mockResolvedValue({});
      mockGetIronSession.mockResolvedValue(mockSession);

      const { getSession } = await import("@/lib/session");

      await expect(getSession()).rejects.toThrow(
        "User is not authenticated or did is missing",
      );
    });

    it("should throw ApiError when user has no did", async () => {
      const mockSession = {
        user: { handle: "alice.bsky.social" },
        save: vi.fn(),
        destroy: vi.fn(),
      };
      mockCookies.mockResolvedValue({});
      mockGetIronSession.mockResolvedValue(mockSession);

      const { getSession } = await import("@/lib/session");

      await expect(getSession()).rejects.toThrow(
        "User is not authenticated or did is missing",
      );
    });
  });
});
