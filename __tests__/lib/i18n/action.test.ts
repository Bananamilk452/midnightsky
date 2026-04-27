import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCookiesSet = vi.fn();
const mockStore = {
  set: mockCookiesSet,
};

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue(mockStore),
}));

vi.mock("@/i18n/request", () => ({
  locales: ["ko", "en"],
}));

describe("setUserLocale", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should set locale cookie for valid locale", async () => {
    const { setUserLocale } = await import("@/lib/i18n/action");

    await setUserLocale("ko");

    expect(mockCookiesSet).toHaveBeenCalledWith("NEXT_LOCALE", "ko", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  });

  it("should set en locale cookie", async () => {
    const { setUserLocale } = await import("@/lib/i18n/action");

    await setUserLocale("en");

    expect(mockCookiesSet).toHaveBeenCalledWith("NEXT_LOCALE", "en", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  });

  it("should not set cookie for invalid locale", async () => {
    const { setUserLocale } = await import("@/lib/i18n/action");

    await setUserLocale("fr");

    expect(mockCookiesSet).not.toHaveBeenCalled();
  });
});
