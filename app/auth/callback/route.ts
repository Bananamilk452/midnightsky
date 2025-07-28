import { Agent } from "@atproto/api";
import { OAuthCallbackError } from "@atproto/oauth-client-node";
import { NextRequest, NextResponse } from "next/server";

import { blueskyClient } from "@/lib/bluesky";
import { createUser } from "@/lib/bluesky/utils";
import { getOptionalSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const nextUrl = request.nextUrl;

  try {
    const { session, state } = await blueskyClient.callback(
      nextUrl.searchParams,
    );

    const rt = JSON.parse(state!).redirectTo;
    const redirectTo = rt ? rt : "/home";

    const agent = new Agent(session);

    const { data } = await agent.getProfile({
      actor: session.did,
    });

    const ironSession = await getOptionalSession();
    ironSession.user = createUser(data);

    await ironSession.save();

    return NextResponse.redirect(`${process.env.PUBLIC_URL}${redirectTo}`);
  } catch (err: unknown) {
    if (err instanceof OAuthCallbackError) {
      const oauthError = err.params.get("error");
      if (
        err instanceof OAuthCallbackError &&
        oauthError &&
        ["login_required", "consent_required"].includes(oauthError) &&
        err.state
      ) {
        const { handle } = JSON.parse(err.state);

        const url = await blueskyClient.authorize(handle, {
          state: JSON.stringify({
            handle,
          }),
        });

        return NextResponse.redirect(url);
      }
    }

    console.error("Error during Bluesky OAuth callback:", err);

    if (err instanceof Error) {
      // Bluesky error
      return NextResponse.redirect(
        `${process.env.PUBLIC_URL}/auth/error?error=${err.message}`,
      );
    } else {
      // Unknown error
      return NextResponse.redirect(
        `${process.env.PUBLIC_URL}/auth/error?error=Unknown error`,
      );
    }
  }
}
