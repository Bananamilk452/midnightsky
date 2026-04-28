"use client";

import { AppBskyEmbedRecord, AppBskyFeedPost } from "@atproto/api";
import {
  PostView,
  ThreadgateView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { createContext, useContext } from "react";

export interface FeedContextValue {
  post: PostView | AppBskyEmbedRecord.ViewRecord;
  threadgate?: ThreadgateView;
  record: AppBskyFeedPost.Record;
}

export const FeedContext = createContext<FeedContextValue | null>(null);

export function useFeedContext(): FeedContextValue {
  const ctx = useContext(FeedContext);
  if (!ctx) {
    throw new Error(
      "Feed sub-components must be used within a Feed.Record or Feed.EmbedPost",
    );
  }
  return ctx;
}
