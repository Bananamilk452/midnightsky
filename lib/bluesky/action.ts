"use server";

import { Agent, RichText } from "@atproto/api";
import { OutputSchema as getAuthorFeedData } from "@atproto/api/dist/client/types/app/bsky/feed/getAuthorFeed";
import { OutputSchema as getTimelineData } from "@atproto/api/dist/client/types/app/bsky/feed/getTimeline";
import {
  isNotFoundActor,
  isRelationship,
} from "@atproto/api/dist/client/types/app/bsky/graph/defs";
import { TID } from "@atproto/common";
import { redirect } from "next/navigation";

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
  getPostByRkey,
  getPrivatePostById,
  getPublicPostById,
} from "@/lib/post/service";
import { getOptionalSession, getSession } from "@/lib/session";
import { ActionResult, parseAtUri } from "@/lib/utils";
import { ApiError, jsonify } from "@/lib/utils.server";

export async function signInWithBluesky(
  handle: string,
  redirectTo?: string,
): Promise<ActionResult<string>> {
  try {
    const url = await blueskyClient.authorize(handle.trim(), {
      prompt: "none",
      state: JSON.stringify({
        handle,
        redirectTo,
      }),
    });

    return { success: true, data: url.toString() };
  } catch (error) {
    console.error("Error signing in:", error);
    return { success: false, error: "로그인 요청에 실패하였습니다." };
  }
}

export async function signOut(): Promise<void> {
  const session = await getSession();

  session.destroy();
  redirect("/sign-in");
}

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

export async function getTimeline(
  limit: number = 30,
  cursor?: string,
): Promise<ActionResult<getTimelineData>> {
  try {
    const agent = await getSessionAgent();

    const response = await agent.getTimeline({
      limit,
      cursor,
    });

    return {
      success: true,
      data: jsonify(response.data),
    };
  } catch (error) {
    console.error("Error fetching timeline:", error);
    return { success: false, error: "타임라인 조회에 실패했습니다." };
  }
}

export async function getProfile(actor: string) {
  const agent = await getSessionAgent();

  const response = await agent.getProfile({
    actor,
  });

  const rt = new RichText({
    text: response.data.description ?? "",
  });

  rt.detectFacets(agent);

  return jsonify({
    ...response.data,
    facets: rt.facets,
  });
}

export async function getAuthorFeed({
  limit = 30,
  cursor,
  actor,
  filter = "posts_and_author_threads",
  includePins = true,
}: {
  limit: number;
  cursor?: string;
  actor: string;
  filter?: string;
  includePins?: boolean;
}): Promise<ActionResult<getAuthorFeedData>> {
  try {
    const agent = await getSessionAgent();

    const response = await agent.getAuthorFeed({
      limit,
      cursor,
      actor,
      filter,
      includePins,
    });

    return {
      success: true,
      data: jsonify(response.data),
    };
  } catch (error) {
    console.error("Error fetching author feed:", error);
    return { success: false, error: "작성자 피드 조회에 실패했습니다." };
  }
}

async function resolveReplyParams(uri: string, params: CreatePostParams) {
  const { rkey } = parseAtUri(uri);
  const { post, type } = await getPostByRkey(rkey);

  let newParams = {
    ...params,
  };

  if (!post) {
    throw new ApiError("Post not found", 404);
  }

  if (type === "public") {
    newParams.type = "public";
  } else if (type === "private") {
    newParams.type = "private";
  } else if (type === "list") {
    newParams = {
      ...params,
      type: "list",
      listId: post.listId,
    };
  } else {
    throw new ApiError("Invalid post type", 400);
  }

  return newParams;
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

  let resolvedParams: CreatePostParams = params;

  // Reply 객체에 parent가 있으면 해당 Post의 type, listId를 inherit
  if (params.type === "reply") {
    if (!params.reply || !params.reply.parent) {
      throw new ApiError("Reply parent is required", 400);
    }

    resolvedParams = await resolveReplyParams(params.reply.parent.uri, params);
  }

  if (resolvedParams.type === "public") {
    post = await createPublicPostRecord(rkey, resolvedParams);
  } else if (resolvedParams.type === "private") {
    post = await createPrivatePostRecord(rkey, resolvedParams);
  } else if (resolvedParams.type === "list") {
    post = await createListPostRecord(rkey, resolvedParams);
  } else {
    throw new ApiError("Invalid post type", 400);
  }

  const blueskyPost = await applyWrites(post.id, rkey, resolvedParams);

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
