"use server";

import { Agent } from "@atproto/api";

import { blueskyClient } from "@/lib/bluesky";
import { getOptionalSession } from "@/lib/session";

export async function signInWithBluesky(handle: string) {
  const url = await blueskyClient.authorize(handle, {
    prompt: "none",
    state: JSON.stringify({
      handle,
    }),
  });

  return url.toString();
}

// export async function signOut(): Promise<void> {
//   const session = await getSession()

//   session.destroy()
// }

export async function getAgent(did: string) {
  const session = await blueskyClient.restore(did);
  const agent = new Agent(session);

  return agent;
}

export async function getSessionAgent() {
  const session = await getOptionalSession();
  if (!session.user || !session.user.did) {
    throw new Error("User is not authenticated or did is missing");
  }

  const agent = await getAgent(session.user.did);

  return agent;
}
