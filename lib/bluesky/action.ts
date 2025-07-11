"use server";

import { Agent } from "@atproto/api";
import { TID } from "@atproto/common";

import { blueskyClient } from "@/lib/bluesky";
import { applyWrites } from "@/lib/bluesky/service";
import { CreatePostParams } from "@/lib/bluesky/types";
import { createPublicPostRecord } from "@/lib/post/service";
import { prisma } from "@/lib/prisma";
import { getOptionalSession, getSession } from "@/lib/session";
import { ApiError, jsonify } from "@/lib/utils.server";

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

export async function getPostThread(authority: string, rkey: string) {
  const agent = await getSessionAgent();

  const res = await agent.getPostThread({
    uri: `at://${authority}/app.bsky.feed.post/${rkey}`,
    depth: 100,
  });

  return res.data;
}

export async function getPublicPost(id: string) {
  await getSession();

  const post = await prisma.publicPost.findFirst({ where: { id } });

  if (!post) {
    throw new Error("Post not found");
  }

  return post;
}

export async function getTimeline(limit: number = 30, cursor?: string) {
  const agent = await getSessionAgent();

  const response = await agent.getTimeline({
    limit,
    cursor,
  });

  return jsonify(response.data);
}

export async function createPost(params: CreatePostParams) {
  await getSession();

  const rkey = TID.nextStr();

  if (params.type === "public") {
    const post = await createPublicPostRecord(rkey, params);
    const blueskyPost = await applyWrites(post.id, rkey, params);

    if (Object.keys(blueskyPost).length === 0) {
      throw new Error("Failed to create post");
    }

    return {
      post,
      blueskyPost,
    };
  }

  throw new Error("Invalid post type");
}
