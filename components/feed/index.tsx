"use client";

import { AppBskyEmbedRecord } from "@atproto/api";
import {
  FeedViewPost,
  isPostView,
  isReasonPin,
  isReasonRepost,
  PostView,
  ThreadgateView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { FeedAvatar } from "@/components/feed/Avatar";
import { FeedContent } from "@/components/feed/Content";
import { FeedContext } from "@/components/feed/context";
import { FeedEmbed } from "@/components/feed/Embed";
import { FeedPost } from "@/components/feed/embed/Post";
import { FeedFooter } from "@/components/feed/Footer";
import { FeedHeader } from "@/components/feed/Header";
import { FeedLabel } from "@/components/feed/Label";
import { FeedPin } from "@/components/feed/Pin";
import { FeedRepost } from "@/components/feed/Repost";
import { FeedThreadEllipsis } from "@/components/feed/ThreadEllipsis";
import { validateRecord } from "@/lib/bluesky/utils";
import * as Post from "@/lib/lexicon/types/app/midnightsky/post";
import { cn, parseAtUri } from "@/lib/utils";

import type { FeedContextValue } from "@/components/feed/context";

interface FeedProps {
  feed: FeedViewPost;
}

function FeedInner({ feed }: FeedProps) {
  const { post } = feed;

  const replyParent =
    feed.reply?.parent && isPostView(feed.reply.parent)
      ? feed.reply.parent
      : undefined;

  const replyRoot =
    feed.reply?.root && isPostView(feed.reply.root)
      ? feed.reply.root
      : undefined;

  const hasReplyThread = replyRoot && replyParent;
  // 쓰레드 길이가 3개 이상인 경우
  // -1번째 reply(replyParent)가 root와 같지 않은 경우
  const hasMultipleReplies =
    replyRoot && replyParent && replyParent.uri !== replyRoot.uri;

  const parentRecord = validateRecord(replyParent?.record);
  const parentReplyUri = parentRecord?.reply?.parent.uri;
  // 쓰레드 길이가 4개 이상이라 쓰레드 전체 보기가 필요한 경우
  // -3번째 reply(replyParent.reply.parent)가 root와 같지 않은 경우
  const hasLongThread =
    hasReplyThread && hasMultipleReplies && parentReplyUri !== replyRoot?.uri;

  const root = isPostView(feed.reply?.root) ? feed.reply.root : undefined;
  const threadgate = root?.threadgate;

  return (
    <div className="flex flex-col border-b border-white/30">
      {hasMultipleReplies && replyRoot && (
        <FeedRecord
          post={replyRoot}
          threadgate={threadgate}
          line={{ top: false, bottom: true }}
        />
      )}
      {hasLongThread && <FeedThreadEllipsis post={feed.post} />}
      {replyParent && (
        <FeedRecord
          post={replyParent}
          threadgate={threadgate}
          line={
            hasMultipleReplies
              ? { top: true, bottom: true }
              : { top: false, bottom: true }
          }
        />
      )}
      <FeedRecord
        post={post}
        threadgate={threadgate}
        className="pb-2"
        line={
          replyParent
            ? { top: true, bottom: false }
            : { top: false, bottom: false }
        }
      >
        {isReasonRepost(feed.reason) && <FeedRepost feed={feed} />}
        {isReasonPin(feed.reason) && <FeedPin feed={feed} />}
      </FeedRecord>
    </div>
  );
}

function FeedRecord({
  post,
  threadgate,
  line,
  children,
  className,
}: {
  post: PostView;
  threadgate?: ThreadgateView;
  line?: { top: boolean; bottom: boolean };
  children?: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const record = validateRecord(post.record);

  if (!record) {
    throw new Error("Invalid post record");
  }

  const lineElement = <div className="h-full w-0.5 bg-gray-400" />;
  const at = parseAtUri(post.uri);

  const contextValue: FeedContextValue = { post, threadgate, record };

  return (
    <FeedContext.Provider value={contextValue}>
      <div
        id={at.rkey}
        className={cn(
          "flex flex-col px-4 hover:cursor-pointer hover:bg-white/5",
          className,
        )}
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/post/${post.author.handle}/${at.rkey}`);
        }}
        onAuxClick={(e) => {
          if (e.button === 1) {
            e.stopPropagation();
            window.open(`/post/${post.author.handle}/${at.rkey}`, "_blank");
          }
        }}
        onMouseDown={(e) => {
          e.preventDefault();
        }}
      >
        <div className="grid grid-cols-[40px_1fr]">
          <div className="flex min-h-4 justify-center">
            {line?.top && lineElement}
          </div>
          {children}
        </div>
        <div className="flex gap-2">
          <div className="mr-1 flex shrink-0 flex-col items-center">
            <Link
              href={`/profile/${post.author.handle}`}
              onClick={(e) => e.stopPropagation()}
            >
              <FeedAvatar />
            </Link>
            {line?.bottom && lineElement}
          </div>
          <div className="flex w-full min-w-0 flex-col">
            <div>
              <Link
                className="inline-block max-w-full"
                href={`/profile/${post.author.handle}`}
                onClick={(e) => e.stopPropagation()}
              >
                <FeedHeader className="w-full" />
              </Link>
            </div>
            <FeedLabel>
              <FeedContent />
              {post.embed && (
                <div className="mb-2">
                  <FeedEmbed />
                </div>
              )}
              {Post.isRecord(record.embed) && (
                <div className="my-2">
                  <FeedPost content={record.embed} />
                </div>
              )}
            </FeedLabel>
            <FeedFooter />
          </div>
        </div>
      </div>
    </FeedContext.Provider>
  );
}

function EmbedPostInner({
  post,
  children,
}: {
  post: AppBskyEmbedRecord.ViewRecord;
  children?: React.ReactNode;
}) {
  const value = validateRecord(post.value);

  if (!value) {
    throw new Error("Invalid post embed or value");
  }

  const router = useRouter();
  const at = parseAtUri(post.uri);

  const contextValue: FeedContextValue = { post, record: value };

  return (
    <FeedContext.Provider value={contextValue}>
      <div
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/post/${post.author.handle}/${at.rkey}`);
        }}
        onAuxClick={(e) => {
          if (e.button === 1) {
            e.stopPropagation();
            window.open(`/post/${post.author.handle}/${at.rkey}`, "_blank");
          }
        }}
        onMouseDown={(e) => {
          e.preventDefault();
        }}
        className="mt-2 flex gap-2 rounded-lg border border-white/30 p-3"
      >
        <div className="flex w-full min-w-0 flex-col gap-1">
          <FeedHeader className="w-fit max-w-full gap-0.5">
            <FeedAvatar className="mr-1 size-4" />
          </FeedHeader>
          <FeedContent />
          {children}
        </div>
      </div>
    </FeedContext.Provider>
  );
}

const Feed = Object.assign(FeedInner, {
  Record: FeedRecord,
  EmbedPost: EmbedPostInner,
  Avatar: FeedAvatar,
  Header: FeedHeader,
  Content: FeedContent,
  Embed: FeedEmbed,
  Label: FeedLabel,
  Footer: FeedFooter,
  Repost: FeedRepost,
  Pin: FeedPin,
  ThreadEllipsis: FeedThreadEllipsis,
});

export { Feed, FeedRecord, EmbedPostInner as EmbedPost };
export type { FeedContextValue } from "@/components/feed/context";
