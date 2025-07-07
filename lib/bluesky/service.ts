import { RichText } from "@atproto/api";
import {
  isRecord,
  validateRecord,
} from "@atproto/api/dist/client/types/app/bsky/feed/post";
import {
  isCreate,
  validateCreate,
} from "@atproto/api/dist/client/types/com/atproto/repo/applyWrites";

import { getAgent } from "@/lib/bluesky/action";
import { getSession } from "@/lib/session";
import { ApiError } from "@/lib/utils.server";

import { CreatePostParams } from "./types";

export async function applyWrites(rkey: string, params: CreatePostParams) {
  const session = await getSession();
  const agent = await getAgent(session.user.did);

  const { blueskyContent } = params;
  const link = `https://midnightsky.app/post/${session.user.did}/${rkey}`;

  const rt = new RichText({
    text: `${blueskyContent}\n\n${link}`,
  });
  rt.detectFacets(agent);

  const post = {
    $type: "app.bsky.feed.post",
    text: rt.text,
    facets: rt.facets,
    langs: ["ko"],
    createdAt: new Date().toISOString(),
  };

  const writes = {
    $type: "com.atproto.repo.applyWrites#create",
    collection: "app.bsky.feed.post",
    rkey,
    value: post,
  };

  if (
    validateRecord(post).success &&
    validateCreate(writes).success &&
    isRecord(post) &&
    isCreate(writes)
  ) {
    const record = await agent.com.atproto.repo.applyWrites({
      repo: session.user.did,
      validate: true,
      writes: [writes],
    });

    return record;
  } else {
    throw new ApiError("Invalid post data", 400);
  }
}
