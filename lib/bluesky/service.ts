import { RichText } from "@atproto/api";
import {
  isThreadViewPost,
  validateThreadViewPost,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";
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
import { addReadArticleFacets } from "./utils";

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
    text: blueskyContent,
  });
  rt.detectFacets(agent);

  const facets = addReadArticleFacets(rt, link).facets;

  const embed = {
    $type: "app.midnightsky.post",
    id: postId,
    type: params.type,
  };

  const post = {
    $type: "app.bsky.feed.post",
    text: rt.text,
    facets,
    langs: ["ko"],
    embed,
    createdAt: new Date().toISOString(),
    reply: params.reply,
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
    // List 포스트인 경우
    if (params.type === "list" && params.listId) {
      const listWrites = {
        $type: "com.atproto.repo.applyWrites#create",
        collection: "app.bsky.feed.threadgate",
        rkey,
        value: {
          $type: "app.bsky.feed.threadgate",
          allow: [
            {
              $type: "app.bsky.feed.threadgate#listRule",
              list: params.listId,
            },
          ],
          createdAt: new Date().toISOString(),
          hiddenReplies: [],
          post: `at://${session.user.did}/app.bsky.feed.post/${rkey}`,
        },
      };

      if (validateCreate(listWrites).success && isCreate(listWrites)) {
        const listRecord = await agent.com.atproto.repo.applyWrites({
          repo: session.user.did,
          validate: true,
          writes: [writes, listWrites],
        });

        return listRecord;
      } else {
        console.error("List post validation failed:", {
          listWritesValidation: validateCreate(listWrites),
        });
        throw new ApiError("Invalid list post data", 400);
      }
    }

    // Private
    else if (params.type === "private") {
      const privateWrites = {
        $type: "com.atproto.repo.applyWrites#create",
        collection: "app.bsky.feed.threadgate",
        rkey,
        value: {
          $type: "app.bsky.feed.threadgate",
          allow: [
            {
              $type: "app.bsky.feed.threadgate#followingRule",
            },
            {
              $type: "app.bsky.feed.threadgate#followerRule",
            },
          ],
          createdAt: new Date().toISOString(),
          hiddenReplies: [],
          post: `at://${session.user.did}/app.bsky.feed.post/${rkey}`,
        },
      };

      if (validateCreate(privateWrites).success && isCreate(privateWrites)) {
        const privateRecord = await agent.com.atproto.repo.applyWrites({
          repo: session.user.did,
          validate: true,
          writes: [writes, privateWrites],
        });

        return privateRecord;
      } else {
        console.error("Private post validation failed:", {
          privateWritesValidation: validateCreate(privateWrites),
        });
        throw new ApiError("Invalid private post data", 400);
      }
    }

    // Public
    else {
      const record = await agent.com.atproto.repo.applyWrites({
        repo: session.user.did,
        validate: true,
        writes: [writes],
      });

      return record;
    }
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

export async function getPostIsReplyDisabled(uri: string) {
  const session = await getSession();
  const agent = await getAgent(session.user.did);

  const postThread = await agent.app.bsky.feed.getPostThread({
    uri,
    depth: 0,
    parentHeight: 0,
  });

  const thread = postThread.data.thread;

  if (
    !thread ||
    !isThreadViewPost(thread) ||
    !validateThreadViewPost(thread).success
  ) {
    throw new ApiError("Thread not found", 404);
  }

  return thread.post.viewer?.replyDisabled ?? false;
}
