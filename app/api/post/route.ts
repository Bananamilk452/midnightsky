import { NextRequest, NextResponse } from "next/server";

import { createPost } from "@/lib/bluesky/action";
import { CreatePostSchema } from "@/lib/bluesky/types";
import { getSession } from "@/lib/session";
import { ApiError, handleApiError } from "@/lib/utils.server";

export async function POST(request: NextRequest) {
  try {
    await getSession();

    const body = await request.json();

    if (CreatePostSchema.safeParse(body).success) {
    } else {
      throw new ApiError("Invalid post data", 400);
    }

    const response = await createPost(body);

    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}
