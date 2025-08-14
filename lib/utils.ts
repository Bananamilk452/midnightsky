import {
  FeedViewPost,
  isReasonRepost,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { ClassValue } from "clsx";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

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

export function formatNumber(num: number) {
  return new Intl.NumberFormat("ko-KR").format(num);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serverActionErrorHandler<T, P extends any[]>(
  action: (...args: P) => Promise<ActionResult<T>>,
) {
  return async (...args: P) => {
    const result = await action(...args);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  };
}
