"use server";

import { Agent, AppBskyRichtextFacet, RichText } from "@atproto/api";
import { Response as GetProfileData } from "@atproto/api/dist/client/types/app/bsky/actor/getProfile";
import { OutputSchema as getAuthorFeedData } from "@atproto/api/dist/client/types/app/bsky/feed/getAuthorFeed";
import { OutputSchema as getPostThreadData } from "@atproto/api/dist/client/types/app/bsky/feed/getPostThread";
import { OutputSchema as getTimelineData } from "@atproto/api/dist/client/types/app/bsky/feed/getTimeline";
import {
  isNotFoundActor,
  isRelationship,
} from "@atproto/api/dist/client/types/app/bsky/graph/defs";
import { OutputSchema as getListsData } from "@atproto/api/dist/client/types/app/bsky/graph/getLists";
import { Response as ApplyWritesData } from "@atproto/api/dist/client/types/com/atproto/repo/applyWrites";
import { TID } from "@atproto/common";
import { redirect } from "next/navigation";

import { blueskyClient } from "@/lib/bluesky";
import {
  applyWrites,
  getPostIsReplyDisabled,
  getRelationship,
} from "@/lib/bluesky/service";
import { CreatePostParams } from "@/lib/bluesky/types";
import { createRecord, deleteRecord } from "@/lib/bluesky/utils";
import { ListPost, PrivatePost, PublicPost } from "@/lib/generated/prisma";
import {
  createListPostRecord,
  createPrivatePostRecord,
  createPublicPostRecord,
  deletePostById,
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

export async function getPostThread(
  authority: string,
  rkey: string,
): Promise<ActionResult<getPostThreadData>> {
  try {
    const agent = await getSessionAgent();

    const response = await agent.getPostThread({
      uri: `at://${authority}/app.bsky.feed.post/${rkey}`,
      depth: 100,
    });

    return {
      success: true,
      data: jsonify(response.data),
    };
  } catch (error) {
    console.error("Error fetching post thread:", error);
    return { success: false, error: "게시물 스레드 조회에 실패했습니다." };
  }
}

export async function getPublicPost(
  id: string,
): Promise<ActionResult<PublicPost>> {
  try {
    await getSession();

    const post = await getPublicPostById(id);

    return {
      success: true,
      data: post,
    };
  } catch (error) {
    console.error("Error fetching public post:", error);
    return { success: false, error: "게시물 조회에 실패했습니다." };
  }
}

type GetPrivatePostReturnType =
  | (Awaited<ReturnType<typeof getPrivatePostById>> & { isViewable: true })
  | { isViewable: false };
export async function getPrivatePost(
  id: string,
): Promise<ActionResult<GetPrivatePostReturnType>> {
  try {
    const session = await getSession();

    const post = await getPrivatePostById(id);

    const isViewable =
      (await isFollowingEachOther(session.user.did, post.authorDid)) ||
      post.authorDid === session.user.did;

    return isViewable
      ? { success: true, data: { ...post, isViewable } }
      : { success: true, data: { isViewable } };
  } catch (error) {
    console.error("Error fetching private post:", error);
    return { success: false, error: "게시물 조회에 실패했습니다." };
  }
}

type GetListPostReturnType =
  | (Awaited<ReturnType<typeof getListPostById>> & { isViewable: true })
  | { isViewable: false };
export async function getListPost(
  id: string,
): Promise<ActionResult<GetListPostReturnType>> {
  try {
    await getSession();

    const post = await getListPostById(id);

    const isViewable = !(await getPostIsReplyDisabled(
      `at://${post.authorDid}/app.bsky.feed.post/${post.rkey}`,
    ));

    return isViewable
      ? { success: true, data: { ...post, isViewable } }
      : { success: true, data: { isViewable } };
  } catch (error) {
    console.error("Error fetching list post:", error);
    return { success: false, error: "게시물 조회에 실패했습니다." };
  }
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

export async function getProfile(
  actor: string,
): Promise<
  ActionResult<
    GetProfileData["data"] & { facets?: AppBskyRichtextFacet.Main[] }
  >
> {
  try {
    const agent = await getSessionAgent();

    const response = await agent.getProfile({
      actor,
    });

    const rt = new RichText({
      text: response.data.description ?? "",
    });

    rt.detectFacets(agent);

    return {
      success: true,
      data: jsonify({
        ...response.data,
        facets: rt.facets,
      }),
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return { success: false, error: "프로필 조회에 실패했습니다." };
  }
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

interface CreatePostReturnType {
  post: PublicPost | PrivatePost | ListPost;
  blueskyPost: ApplyWritesData;
}

export async function createPost(
  params: CreatePostParams,
): Promise<ActionResult<CreatePostReturnType>> {
  try {
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

      resolvedParams = await resolveReplyParams(
        params.reply.parent.uri,
        params,
      );
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
      success: true,
      data: {
        post,
        blueskyPost: jsonify(blueskyPost),
      },
    };
  } catch (error) {
    console.error("Error creating post:", error);
    return {
      success: false,
      error: "게시물 생성에 실패했습니다.",
    };
  }
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

export async function getMyLists(): Promise<ActionResult<getListsData>> {
  try {
    const session = await getSession();
    const agent = await getAgent(session.user.did);

    const response = await agent.app.bsky.graph.getLists({
      actor: session.user.did,
    });

    if (response.success) {
      return {
        success: true,
        data: jsonify(response.data),
      };
    } else {
      throw new Error("리스트 조회에 실패했습니다.");
    }
  } catch (error) {
    console.error("Error fetching lists:", error);
    return {
      success: false,
      error: "리스트 조회에 실패했습니다.",
    };
  }
}

export async function repostPost({
  cid,
  uri,
}: {
  cid: string;
  uri: string;
}): Promise<ActionResult<void>> {
  try {
    const response = await createRecord({
      collection: "app.bsky.feed.repost",
      cid,
      uri,
    });

    if (response.success) {
      return { success: true, data: undefined };
    } else {
      return { success: false, error: "게시물 리포스트에 실패했습니다." };
    }
  } catch (error) {
    console.error("Error reposting post:", error);
    return { success: false, error: "게시물 리포스트에 실패했습니다." };
  }
}

export async function unrepostPost(uri: string): Promise<ActionResult<void>> {
  try {
    const { rkey } = parseAtUri(uri);

    const response = await deleteRecord({
      collection: "app.bsky.feed.repost",
      rkey,
    });

    if (response.success) {
      return { success: true, data: undefined };
    } else {
      return { success: false, error: "게시물 리포스트 취소에 실패했습니다." };
    }
  } catch (error) {
    console.error("Error unreposting post:", error);
    return { success: false, error: "게시물 리포스트 취소에 실패했습니다." };
  }
}

export async function likePost({
  cid,
  uri,
}: {
  cid: string;
  uri: string;
}): Promise<ActionResult<void>> {
  try {
    const response = await createRecord({
      collection: "app.bsky.feed.like",
      cid,
      uri,
    });

    if (response.success) {
      return { success: true, data: undefined };
    } else {
      return { success: false, error: "게시물 좋아요에 실패했습니다." };
    }
  } catch (error) {
    console.error("Error liking post:", error);
    return { success: false, error: "게시물 좋아요에 실패했습니다." };
  }
}

export async function unlikePost(uri: string): Promise<ActionResult<void>> {
  try {
    const { rkey } = parseAtUri(uri);

    const response = await deleteRecord({
      collection: "app.bsky.feed.like",
      rkey,
    });

    if (response.success) {
      return { success: true, data: undefined };
    } else {
      return { success: false, error: "게시물 좋아요 취소에 실패했습니다." };
    }
  } catch (error) {
    console.error("Error liking post:", error);
    return { success: false, error: "게시물 좋아요 취소에 실패했습니다." };
  }
}

export async function deletePost({
  uri,
  post,
}: {
  uri: string;
  post?: { postId: string; type: string };
}): Promise<ActionResult<void>> {
  try {
    const { rkey } = parseAtUri(uri);

    const response = await deleteRecord({
      collection: "app.bsky.feed.post",
      rkey,
    });

    if (post) {
      await deletePostById(post.type, post.postId);
    }

    if (response.success) {
      return { success: true, data: undefined };
    } else {
      return { success: false, error: "게시물 삭제에 실패했습니다." };
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    return { success: false, error: "게시물 삭제에 실패했습니다." };
  }
}

export async function createBookmark({
  cid,
  uri,
}: {
  cid: string;
  uri: string;
}): Promise<ActionResult<void>> {
  try {
    const session = await getSession();
    const agent = await getAgent(session.user.did);

    const response = await agent.app.bsky.bookmark.createBookmark({
      cid,
      uri,
    });

    if (response.success) {
      return { success: true, data: undefined };
    } else {
      return { success: false, error: "북마크 생성에 실패했습니다." };
    }
  } catch (error) {
    console.error("Error creating bookmark:", error);
    return { success: false, error: "북마크 생성에 실패했습니다." };
  }
}

export async function deleteBookmark(uri: string): Promise<ActionResult<void>> {
  try {
    const session = await getSession();
    const agent = await getAgent(session.user.did);

    const response = await agent.app.bsky.bookmark.deleteBookmark({
      uri,
    });

    if (response.success) {
      return { success: true, data: undefined };
    } else {
      return { success: false, error: "북마크 삭제에 실패했습니다." };
    }
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    return { success: false, error: "북마크 삭제에 실패했습니다." };
  }
}
