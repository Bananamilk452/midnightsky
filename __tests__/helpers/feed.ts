import {
  AppBskyEmbedExternal,
  AppBskyEmbedImages,
  AppBskyEmbedRecord,
  AppBskyEmbedRecordWithMedia,
  AppBskyEmbedVideo,
  AppBskyFeedPost,
} from "@atproto/api";
import {
  FeedViewPost,
  PostView,
  ProfileViewBasic,
  ReasonPin,
  ReasonRepost,
  ThreadViewPost,
  ViewerState,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import React from "react";

import { FeedContext, FeedContextValue } from "@/components/feed/context";

type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

function makeProfileViewBasic(
  overrides?: DeepPartial<ProfileViewBasic>,
): ProfileViewBasic {
  return {
    $type: "app.bsky.actor.defs#profileViewBasic",
    did: "did:plc:test",
    handle: "test.bsky.social",
    displayName: "Test User",
    ...overrides,
  };
}

function makeViewerState(overrides?: DeepPartial<ViewerState>): ViewerState {
  return {
    $type: "app.bsky.feed.defs#viewerState",
    ...overrides,
  };
}

function makeFeedPostRecord(
  overrides?: DeepPartial<AppBskyFeedPost.Record>,
): AppBskyFeedPost.Record {
  return {
    $type: "app.bsky.feed.post",
    text: "Hello world",
    createdAt: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

function makePostView(overrides?: DeepPartial<PostView>): PostView {
  return {
    $type: "app.bsky.feed.defs#postView",
    uri: "at://did:plc:test/app.bsky.feed.post/rkey1",
    cid: "cid1",
    author: makeProfileViewBasic(),
    record: makeFeedPostRecord(),
    replyCount: 0,
    repostCount: 0,
    likeCount: 0,
    viewer: makeViewerState(),
    indexedAt: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeFeedViewPost(overrides?: DeepPartial<FeedViewPost>): FeedViewPost {
  return {
    $type: "app.bsky.feed.defs#feedViewPost",
    post: makePostView(),
    ...overrides,
  };
}

function makeReasonRepost(overrides?: DeepPartial<ReasonRepost>): ReasonRepost {
  return {
    $type: "app.bsky.feed.defs#reasonRepost",
    by: makeProfileViewBasic(),
    indexedAt: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeReasonPin(overrides?: DeepPartial<ReasonPin>): ReasonPin {
  return {
    $type: "app.bsky.feed.defs#reasonPin",
    ...overrides,
  };
}

function makeThreadViewPost(
  post: PostView,
  parent?: ThreadViewPost,
  replies?: ThreadViewPost[],
): ThreadViewPost {
  return {
    $type: "app.bsky.feed.defs#threadViewPost",
    post,
    parent,
    replies,
  };
}

function makeEmbedImagesView(
  overrides?: DeepPartial<AppBskyEmbedImages.View> & { $type?: string },
): AppBskyEmbedImages.View & { $type: "app.bsky.embed.images#view" } {
  return {
    $type: "app.bsky.embed.images#view",
    images: [],
    ...overrides,
  };
}

function makeEmbedExternalView(
  overrides?: DeepPartial<AppBskyEmbedExternal.View> & { $type?: string },
): AppBskyEmbedExternal.View & { $type: "app.bsky.embed.external#view" } {
  return {
    $type: "app.bsky.embed.external#view",
    external: {
      $type: "app.bsky.embed.external#viewExternal",
      uri: "https://example.com",
      title: "Test Article",
      description: "A test article",
    },
    ...overrides,
  };
}

function makeEmbedVideoView(
  overrides?: DeepPartial<AppBskyEmbedVideo.View> & { $type?: string },
): AppBskyEmbedVideo.View & { $type: "app.bsky.embed.video#view" } {
  return {
    $type: "app.bsky.embed.video#view",
    cid: "cid-video1",
    playlist: "https://example.com/playlist.m3u8",
    ...overrides,
  };
}

function makeEmbedRecordView(
  overrides?: DeepPartial<AppBskyEmbedRecord.View> & { $type?: string },
): AppBskyEmbedRecord.View & { $type: "app.bsky.embed.record#view" } {
  return {
    $type: "app.bsky.embed.record#view",
    record: {
      $type: "app.bsky.embed.record#viewRecord",
      uri: "at://did:plc:test/app.bsky.feed.post/embed1",
      cid: "cid-embed1",
      author: makeProfileViewBasic(),
      value: makeFeedPostRecord(),
      indexedAt: "2024-01-01T00:00:00Z",
    },
    ...overrides,
  };
}

function makeEmbedRecordViewRecord(
  overrides?: DeepPartial<AppBskyEmbedRecord.ViewRecord> & { $type?: string },
): AppBskyEmbedRecord.ViewRecord & {
  $type: "app.bsky.embed.record#viewRecord";
} {
  return {
    $type: "app.bsky.embed.record#viewRecord",
    uri: "at://did:plc:test/app.bsky.feed.post/embed1",
    cid: "cid-embed1",
    author: makeProfileViewBasic(),
    value: makeFeedPostRecord(),
    indexedAt: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeEmbedRecordWithMediaView(
  overrides?: DeepPartial<AppBskyEmbedRecordWithMedia.View> & {
    $type?: string;
  },
): AppBskyEmbedRecordWithMedia.View & {
  $type: "app.bsky.embed.recordWithMedia#view";
} {
  return {
    $type: "app.bsky.embed.recordWithMedia#view",
    record: makeEmbedRecordView(),
    media: makeEmbedImagesView(),
    ...overrides,
  };
}

function makeFeedContextValue(
  overrides?: DeepPartial<FeedContextValue>,
): FeedContextValue {
  return {
    post: makePostView(),
    record: makeFeedPostRecord(),
    ...overrides,
  };
}

function wrapWithFeedContext(
  ui: React.ReactElement,
  overrides?: DeepPartial<FeedContextValue>,
) {
  const value = makeFeedContextValue(overrides);
  return React.createElement(FeedContext.Provider, { value }, ui);
}

export {
  makeEmbedExternalView,
  makeEmbedImagesView,
  makeEmbedRecordView,
  makeEmbedRecordViewRecord,
  makeEmbedRecordWithMediaView,
  makeEmbedVideoView,
  makeFeedContextValue,
  makeFeedPostRecord,
  makeFeedViewPost,
  makePostView,
  makeProfileViewBasic,
  makeReasonPin,
  makeReasonRepost,
  makeThreadViewPost,
  makeViewerState,
  wrapWithFeedContext,
};
export type { DeepPartial };
