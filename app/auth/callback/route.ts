import { Agent } from "@atproto/api";
import { NextRequest, NextResponse } from "next/server";

import { blueskyClient } from "@/lib/bluesky";

export async function GET(request: NextRequest) {
  const nextUrl = request.nextUrl;

  try {
    const { session } = await blueskyClient.callback(nextUrl.searchParams);

    const agent = new Agent(session);

    const { data } = await agent.getProfile({
      actor: session.did,
    });

    console.log(data);

    // return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/private`)
  } catch (e: unknown) {
    console.error("Error during Bluesky OAuth callback:", e);

    if (e instanceof Error) {
      // Bluesky error
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/oauth/login?error=${e.message}`,
      );
    } else {
      // Unknown error
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/oauth/login?error=Unknown error`,
      );
    }
  }
}
