"use client";

import { AppBskyEmbedRecord } from "@atproto/api";
import {
  FeedViewPost,
  isPostView,
  isReasonRepost,
  PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { useRouter } from "next/navigation";

import { FeedAvatar } from "@/components/feed/Avatar";
import { FeedContent } from "@/components/feed/Content";
import { FeedEmbed } from "@/components/feed/Embed";
import { FeedFooter } from "@/components/feed/Footer";
import { FeedHeader } from "@/components/feed/Header";
import { FeedLabel } from "@/components/feed/Label";
import { FeedRepost } from "@/components/feed/Repost";
import { FeedThreadEllipsis } from "@/components/feed/ThreadEllipsis";
import { validateRecord } from "@/lib/bluesky/utils";
import { cn, parseAtUri } from "@/lib/utils";

interface FeedProps {
  feed: FeedViewPost;
}

export function Feed({ feed }: FeedProps) {
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

  return (
    <div className="flex flex-col border-b border-white/30">
      {hasMultipleReplies && replyRoot && (
        <FeedRecord post={replyRoot} line={{ top: false, bottom: true }} />
      )}
      {hasLongThread && <FeedThreadEllipsis uri={feed.post.uri} />}
      {replyParent && (
        <FeedRecord
          post={replyParent}
          line={
            hasMultipleReplies
              ? { top: true, bottom: true }
              : { top: false, bottom: true }
          }
        />
      )}
      <FeedRecord
        post={post}
        className="pb-2"
        line={
          replyParent
            ? { top: true, bottom: false }
            : { top: false, bottom: false }
        }
      >
        {isReasonRepost(feed.reason) && <FeedRepost feed={feed} />}
      </FeedRecord>
    </div>
  );
}

function FeedRecord({
  post,
  line,
  children,
  className,
}: {
  post: PostView;
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

  return (
    <div
      className={cn(
        "flex flex-col px-4 hover:cursor-pointer hover:bg-white/5",
        className,
      )}
      onClick={() => router.push(`/post/${at.authority}/${at.rkey}`)}
    >
      <div className="grid grid-cols-[40px_1fr]">
        <div className="flex min-h-4 justify-center">
          {line?.top && lineElement}
        </div>
        {children}
      </div>
      <div className="flex gap-2">
        <div className="mr-1 flex shrink-0 flex-col items-center">
          <FeedAvatar post={post} />
          {line?.bottom && lineElement}
        </div>
        <div className="flex w-full min-w-0 flex-col gap-1">
          <FeedHeader post={post} createdAt={record.createdAt} />
          <FeedLabel labels={post.labels}>
            <FeedContent text={record.text} facets={record.facets} />
            {post.embed && <FeedEmbed embed={post.embed} />}
          </FeedLabel>
          <FeedFooter post={post} className="mt-1" />
        </div>
      </div>
    </div>
  );
}

export function EmbedPost({
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

  return (
    <div className="mt-2 flex gap-2 rounded-lg border border-white/30 p-3">
      <div className="flex min-w-0 flex-col gap-1">
        <FeedHeader post={post} createdAt={value.createdAt} className="gap-0.5">
          <FeedAvatar post={post} className="mr-1 size-4" />
        </FeedHeader>
        <FeedContent text={value.text} facets={value.facets} />
        {children}
      </div>
    </div>
  );
}
