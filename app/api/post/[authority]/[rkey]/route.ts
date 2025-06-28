import { NextRequest, NextResponse } from "next/server";

import { getSessionAgent } from "@/lib/bluesky/action";
import { handleApiError } from "@/lib/utils.server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ authority: string; rkey: string }> },
) {
  try {
    const { authority, rkey } = await params;

    const agent = await getSessionAgent();

    const res = await agent.getPostThread({
      uri: `at://${authority}/app.bsky.feed.post/${rkey}`,
      depth: 100,
    });

    return NextResponse.json(res.data);
  } catch (error) {
    return handleApiError(error);
  }
}
