import crypto from "crypto";
import { NextResponse } from "next/server";

import "server-only";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  console.error("Unexpected error:", error);
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}

export function jsonify<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

export function encryptData(data: string) {
  if (!process.env.POST_PASSWORD) {
    throw new Error("POST_PASSWORD environment variable is not set");
  }

  const password = process.env.POST_PASSWORD;
  const hash = crypto.createHash("sha256").update(password).digest("hex");
  const key = Buffer.from(hash, "hex").subarray(0, 32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    iv: iv.toString("hex"),
    data: encrypted,
  };
}

export function decryptData(encryptedData: { iv: string; data: string }) {
  if (!process.env.POST_PASSWORD) {
    throw new Error("POST_PASSWORD environment variable is not set");
  }

  const password = process.env.POST_PASSWORD;
  const hash = crypto.createHash("sha256").update(password).digest("hex");
  const key = Buffer.from(hash, "hex").subarray(0, 32);
  const iv = Buffer.from(encryptedData.iv, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

  let decrypted = decipher.update(encryptedData.data, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
