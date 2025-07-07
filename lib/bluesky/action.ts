"use server";

import { Agent } from "@atproto/api";
import { TID } from "@atproto/common";

import { blueskyClient } from "@/lib/bluesky";
import { applyWrites } from "@/lib/bluesky/service";
import { CreatePostParams } from "@/lib/bluesky/types";
import { createPublicPostRecord } from "@/lib/post/service";
import { getOptionalSession } from "@/lib/session";
import { ApiError } from "@/lib/utils.server";

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
    throw new ApiError("User is not authenticated or did is missing", 401);
  }

  const agent = await getAgent(session.user.did);

  return agent;
}

export async function createPublicPost(params: CreatePostParams) {
  const rkey = TID.nextStr();

  const post = await createPublicPostRecord(rkey, params);
  const blueskyPost = await applyWrites(post.id, rkey, params);

  return {
    post,
    blueskyPost,
  };
}
