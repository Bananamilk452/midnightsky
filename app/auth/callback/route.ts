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

    if (!state) {
      throw new Error("Missing state in OAuth callback");
    }

    const rt = JSON.parse(state).redirectTo;
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
    if (isReAuthorizableOAuthCallbackError(err)) {
      return reAuthorizeWhenSilentSignInFailed(err);
    }

    return handleError(err);
  }
}

function isReAuthorizableOAuthCallbackError(
  err: unknown,
): err is OAuthCallbackError {
  return Boolean(
    err instanceof OAuthCallbackError &&
      ["login_required", "consent_required"].includes(
        err.params.get("error") || "",
      ) &&
      err.state,
  );
}

async function reAuthorizeWhenSilentSignInFailed(err: OAuthCallbackError) {
  try {
    if (!err.state) {
      throw new Error("Missing state in OAuthCallbackError");
    }

    const { handle, redirectTo } = JSON.parse(err.state);

    const url = await blueskyClient.authorize(handle, {
      state: JSON.stringify({
        handle,
        redirectTo,
      }),
    });

    return NextResponse.redirect(url);
  } catch (error) {
    return handleError(error);
  }
}

function handleError(err: unknown) {
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
