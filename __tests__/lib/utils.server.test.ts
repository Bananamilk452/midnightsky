import crypto from "crypto";
import { describe, expect, it, vi, beforeEach } from "vitest";

import {
  ApiError,
  handleApiError,
  jsonify,
  encryptData,
  decryptData,
} from "@/lib/utils.server";

vi.mock("server-only", () => ({}));

describe("ApiError", () => {
  it("should be an instance of Error", () => {
    const err = new ApiError("test error", 400);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
  });

  it("should have correct properties", () => {
    const err = new ApiError("Not Found", 404);
    expect(err.message).toBe("Not Found");
    expect(err.status).toBe(404);
    expect(err.name).toBe("ApiError");
  });
});

describe("handleApiError", () => {
  it("should return JSON with error message for ApiError", () => {
    const error = new ApiError("Unauthorized", 401);
    const response = handleApiError(error);

    expect(response.status).toBe(401);
  });

  it("should return 500 for non-ApiError", () => {
    const error = new Error("Something broke");
    const response = handleApiError(error);

    expect(response.status).toBe(500);
  });

  it("should return 500 for non-Error thrown values", () => {
    const response = handleApiError("string error");

    expect(response.status).toBe(500);
  });
});

describe("jsonify", () => {
  it("should serialize and deserialize data", () => {
    const data = { name: "Alice", age: 30 };
    const result = jsonify(data);

    expect(result).toEqual(data);
    expect(result).not.toBe(data);
  });

  it("should handle Date by converting to string", () => {
    const date = new Date("2024-01-01");
    const result = jsonify({ date });

    expect(typeof result.date).toBe("string");
  });

  it("should handle undefined values by removing them", () => {
    const result = jsonify({ a: 1, b: undefined });

    expect(result).toEqual({ a: 1 });
  });
});

describe("encryptData / decryptData", () => {
  const originalPassword = process.env.POST_PASSWORD;

  beforeEach(() => {
    process.env.POST_PASSWORD = "test-password-for-encryption";
  });

  afterEach(() => {
    if (originalPassword) {
      process.env.POST_PASSWORD = originalPassword;
    } else {
      delete process.env.POST_PASSWORD;
    }
  });

  it("should encrypt and decrypt data roundtrip", () => {
    const plaintext = "Hello, this is a secret message!";
    const encrypted = encryptData(plaintext);
    const decrypted = decryptData(encrypted.data, encrypted.iv);

    expect(decrypted).toBe(plaintext);
  });

  it("should produce different IVs for each encryption", () => {
    const encrypted1 = encryptData("same data");
    const encrypted2 = encryptData("same data");

    expect(encrypted1.iv).not.toBe(encrypted2.iv);
    expect(encrypted1.data).not.toBe(encrypted2.data);
  });

  it("should return hex strings for encrypted data and IV", () => {
    const encrypted = encryptData("test");

    expect(encrypted.iv).toMatch(/^[0-9a-f]+$/);
    expect(encrypted.data).toMatch(/^[0-9a-f]+$/);
  });

  it("should throw if POST_PASSWORD is not set", () => {
    delete process.env.POST_PASSWORD;

    expect(() => encryptData("test")).toThrow(
      "POST_PASSWORD environment variable is not set",
    );
  });

  it("should throw if decrypt called without POST_PASSWORD", () => {
    delete process.env.POST_PASSWORD;

    expect(() => decryptData("data", "iv")).toThrow(
      "POST_PASSWORD environment variable is not set",
    );
  });

  it("should handle empty string", () => {
    const encrypted = encryptData("");
    const decrypted = decryptData(encrypted.data, encrypted.iv);

    expect(decrypted).toBe("");
  });

  it("should handle unicode content", () => {
    const plaintext = "안녕하세요 🎉 émojis";
    const encrypted = encryptData(plaintext);
    const decrypted = decryptData(encrypted.data, encrypted.iv);

    expect(decrypted).toBe(plaintext);
  });
});
