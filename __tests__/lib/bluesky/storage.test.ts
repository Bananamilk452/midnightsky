import { beforeEach, describe, expect, it, vi } from "vitest";

import { StateStore, SessionStore } from "@/lib/bluesky/storage";

function createMockPrisma(modelName: string) {
  return {
    [modelName]: {
      findFirst: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
  } as any;
}

describe("StateStore", () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let store: StateStore;

  beforeEach(() => {
    prisma = createMockPrisma("authState");
    store = new StateStore(prisma);
  });

  describe("get", () => {
    it("should return parsed state when found", async () => {
      const stateData = { dpopJwk: "key", redirectUri: "uri" };
      prisma.authState.findFirst.mockResolvedValue({
        key: "test-key",
        state: JSON.stringify(stateData),
      });

      const result = await store.get("test-key");

      expect(result).toEqual(stateData);
      expect(prisma.authState.findFirst).toHaveBeenCalledWith({
        where: { key: "test-key" },
      });
    });

    it("should return undefined when not found", async () => {
      prisma.authState.findFirst.mockResolvedValue(null);

      const result = await store.get("nonexistent");

      expect(result).toBeUndefined();
    });
  });

  describe("set", () => {
    it("should upsert the state as JSON", async () => {
      const val = { dpopJwk: "key", redirectUri: "uri" };
      prisma.authState.upsert.mockResolvedValue({});

      await store.set("test-key", val as any);

      expect(prisma.authState.upsert).toHaveBeenCalledWith({
        where: { key: "test-key" },
        update: { state: JSON.stringify(val) },
        create: { key: "test-key", state: JSON.stringify(val) },
      });
    });
  });

  describe("del", () => {
    it("should delete the state by key", async () => {
      prisma.authState.delete.mockResolvedValue({});

      await store.del("test-key");

      expect(prisma.authState.delete).toHaveBeenCalledWith({
        where: { key: "test-key" },
      });
    });
  });
});

describe("SessionStore", () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let store: SessionStore;

  beforeEach(() => {
    prisma = createMockPrisma("authSession");
    store = new SessionStore(prisma);
  });

  describe("get", () => {
    it("should return parsed session when found", async () => {
      const sessionData = { dpopJwk: "key", session: "data" };
      prisma.authSession.findFirst.mockResolvedValue({
        key: "test-key",
        session: JSON.stringify(sessionData),
      });

      const result = await store.get("test-key");

      expect(result).toEqual(sessionData);
      expect(prisma.authSession.findFirst).toHaveBeenCalledWith({
        where: { key: "test-key" },
      });
    });

    it("should return undefined when not found", async () => {
      prisma.authSession.findFirst.mockResolvedValue(null);

      const result = await store.get("nonexistent");

      expect(result).toBeUndefined();
    });
  });

  describe("set", () => {
    it("should upsert the session as JSON", async () => {
      const val = { dpopJwk: "key", session: "data" };
      prisma.authSession.upsert.mockResolvedValue({});

      await store.set("test-key", val as any);

      expect(prisma.authSession.upsert).toHaveBeenCalledWith({
        where: { key: "test-key" },
        update: { session: JSON.stringify(val) },
        create: { key: "test-key", session: JSON.stringify(val) },
      });
    });
  });

  describe("del", () => {
    it("should delete the session by key", async () => {
      prisma.authSession.delete.mockResolvedValue({});

      await store.del("test-key");

      expect(prisma.authSession.delete).toHaveBeenCalledWith({
        where: { key: "test-key" },
      });
    });
  });
});
