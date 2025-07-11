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
