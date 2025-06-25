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
