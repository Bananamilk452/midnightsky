import { NextRequest, NextResponse } from "next/server";

import { createPublicPost } from "@/lib/bluesky/action";
import { CreatePostSchema } from "@/lib/bluesky/types";
import { getSession } from "@/lib/session";
import { ApiError, handleApiError } from "@/lib/utils.server";

export async function POST(request: NextRequest) {
  try {
    await getSession();

    const body = await request.json();

    const parsed = CreatePostSchema.safeParse(body);
    if (parsed.success) {
    } else {
      throw new ApiError("Invalid post data", 400);
    }

    if (parsed.data.type === "public") {
      const response = await createPublicPost(body);

      if (Object.keys(response.blueskyPost).length === 0) {
        throw new ApiError("Failed to create post", 500);
      }

      return NextResponse.json(response);
    }
  } catch (error) {
    return handleApiError(error);
  }
}
