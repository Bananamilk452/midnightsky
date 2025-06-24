import { NextRequest, NextResponse } from "next/server";

import { getAgent } from "@/lib/bluesky/action";
import { getSession } from "@/lib/session";
import { handleApiError } from "@/lib/utils.server";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "30");
    const cursor = searchParams.get("cursor") || undefined;

    const agent = await getAgent(session.user.did);
    const timeline = await agent.getTimeline({
      limit,
      cursor,
      algorithm: "reverse-chronological",
    });

    return NextResponse.json(timeline.data);
  } catch (error) {
    return handleApiError(error);
  }
}
