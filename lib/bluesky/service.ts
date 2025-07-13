import { RichText } from "@atproto/api";
import {
  isRecord as isPost,
  validateRecord as validatePost,
} from "@atproto/api/dist/client/types/app/bsky/feed/post";
import {
  isCreate,
  validateCreate,
} from "@atproto/api/dist/client/types/com/atproto/repo/applyWrites";

import { getAgent } from "@/lib/bluesky/action";
import {
  isRecord,
  validateRecord,
} from "@/lib/lexicon/types/app/midnightsky/post";
import { getSession } from "@/lib/session";
import { ApiError } from "@/lib/utils.server";

import { CreatePostParams } from "./types";

export async function applyWrites(
  postId: string,
  rkey: string,
  params: CreatePostParams,
) {
  const session = await getSession();
  const agent = await getAgent(session.user.did);

  const { blueskyContent } = params;
  const link = `https://midnightsky.app/post/${session.user.did}/${rkey}`;

  const rt = new RichText({
    text: `${blueskyContent}\n\n${link}`,
  });
  rt.detectFacets(agent);

  const embed = {
    $type: "app.midnightsky.post",
    id: postId,
    type: params.type,
  };

  const post = {
    $type: "app.bsky.feed.post",
    text: rt.text,
    facets: rt.facets,
    langs: ["ko"],
    embed,
    createdAt: new Date().toISOString(),
  };

  const writes = {
    $type: "com.atproto.repo.applyWrites#create",
    collection: "app.bsky.feed.post",
    rkey,
    value: post,
  };

  const postValidation = validatePost(post);
  const embedValidation = validateRecord(embed);
  const writesValidation = validateCreate(writes);

  if (
    postValidation.success &&
    embedValidation.success &&
    writesValidation.success &&
    isPost(post) &&
    isRecord(embed) &&
    isCreate(writes)
  ) {
    const record = await agent.com.atproto.repo.applyWrites({
      repo: session.user.did,
      validate: true,
      writes: [writes],
    });

    return record;
  } else {
    console.error("Post validation failed:", {
      postValidation,
      embedValidation,
      writesValidation,
    });
    throw new ApiError("Invalid post data", 400);
  }
}

export async function getRelationship(did1: string, did2: string) {
  const agent = await getAgent(did1);

  const relationships = await agent.app.bsky.graph.getRelationships({
    actor: did1,
    others: [did2],
  });

  return relationships;
}
