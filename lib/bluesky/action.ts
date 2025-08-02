"use server";

import { Agent } from "@atproto/api";
import {
  isNotFoundActor,
  isRelationship,
} from "@atproto/api/dist/client/types/app/bsky/graph/defs";
import { TID } from "@atproto/common";

import { blueskyClient } from "@/lib/bluesky";
import {
  applyWrites,
  getPostIsReplyDisabled,
  getRelationship,
} from "@/lib/bluesky/service";
import { CreatePostParams } from "@/lib/bluesky/types";
import {
  createListPostRecord,
  createPrivatePostRecord,
  createPublicPostRecord,
  getListPostById,
  getPrivatePostById,
  getPublicPostById,
} from "@/lib/post/service";
import { getOptionalSession, getSession } from "@/lib/session";
import { ApiError, jsonify } from "@/lib/utils.server";

export async function signInWithBluesky(handle: string, redirectTo?: string) {
  const url = await blueskyClient.authorize(handle, {
    prompt: "none",
    state: JSON.stringify({
      handle,
      redirectTo,
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

  return jsonify(res.data);
}

export async function getPublicPost(id: string) {
  await getSession();

  const post = await getPublicPostById(id);

  return post;
}

export async function getPrivatePost(id: string) {
  const session = await getSession();

  const post = await getPrivatePostById(id);

  const isViewable =
    (await isFollowingEachOther(session.user.did, post.authorDid)) ||
    post.authorDid === session.user.did;

  return isViewable ? { ...post, isViewable } : { isViewable };
}

export async function getListPost(id: string) {
  await getSession();

  const post = await getListPostById(id);

  const isViewable = !(await getPostIsReplyDisabled(
    `at://${post.authorDid}/app.bsky.feed.post/${post.rkey}`,
  ));

  return isViewable ? { ...post, isViewable } : { isViewable };
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

  let post: Awaited<
    ReturnType<
      | typeof createPublicPostRecord
      | typeof createPrivatePostRecord
      | typeof createListPostRecord
    >
  >;

  if (params.type === "public") {
    post = await createPublicPostRecord(rkey, params);
  } else if (params.type === "private") {
    post = await createPrivatePostRecord(rkey, params);
  } else if (params.type === "list") {
    post = await createListPostRecord(rkey, params);
  } else {
    throw new ApiError("Invalid post type", 400);
  }

  const blueskyPost = await applyWrites(post.id, rkey, params);

  if (Object.keys(blueskyPost).length === 0) {
    throw new Error("Failed to create post");
  }

  return {
    post,
    blueskyPost: jsonify(blueskyPost),
  };
}

export async function isFollowingEachOther(did1: string, did2: string) {
  await getSession();

  const relationships = await getRelationship(did1, did2);

  const relation = relationships.data.relationships[0];

  if (isNotFoundActor(relation)) {
    throw new ApiError("Relationship not found", 404);
  } else if (isRelationship(relation)) {
    return Boolean(relation.followedBy && relation.following);
  } else {
    throw new ApiError("Invalid relationship data", 500);
  }
}

export async function getMyLists() {
  const session = await getSession();
  const agent = await getAgent(session.user.did);

  const response = await agent.app.bsky.graph.getLists({
    actor: session.user.did,
  });

  if (response.success) {
    return jsonify(response.data);
  } else {
    throw new ApiError("Failed to fetch lists", 500);
  }
}
