import {
  FeedViewPost,
  isReasonRepost,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createFeedKey(post: FeedViewPost) {
  let key = post.post.uri;

  if (isReasonRepost(post.reason)) {
    key += `-${post.reason.uri}`;
  }

  return key;
}

export function parseAtUri(uri: string) {
  const parts = uri.slice(5).split("/");
  if (parts.length !== 3) {
    throw new Error("Invalid AT URI format");
  }
  return {
    authority: parts[0],
    collection: parts[1],
    rkey: parts[2],
  };
}
