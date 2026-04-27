import { describe, expect, it, beforeEach } from "vitest";

import { singleton } from "@/lib/singleton";

describe("singleton", () => {
  beforeEach(() => {
    const g = global as unknown as { __singletons: Record<string, unknown> };
    g.__singletons = {};
  });

  it("should return the same instance for the same name", () => {
    let callCount = 0;
    const factory = () => {
      callCount++;
      return { value: 42 };
    };

    const a = singleton("test-key", factory);
    const b = singleton("test-key", factory);

    expect(a).toBe(b);
    expect(callCount).toBe(1);
  });

  it("should return different instances for different names", () => {
    const a = singleton("key-a", () => ({ id: "a" }));
    const b = singleton("key-b", () => ({ id: "b" }));

    expect(a).not.toBe(b);
    expect(a.id).toBe("a");
    expect(b.id).toBe("b");
  });

  it("should not call factory again for same name", () => {
    let callCount = 0;
    const factory = () => {
      callCount++;
      return Math.random();
    };

    const first = singleton("reuse-key", factory);
    const second = singleton("reuse-key", factory);

    expect(first).toBe(second);
    expect(callCount).toBe(1);
  });
});
