import { AppBskyEmbedRecord, RichText } from "@atproto/api";
import {
  FeedViewPost,
  isPostView,
  isReasonRepost,
  PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { Record } from "@atproto/api/dist/client/types/app/bsky/feed/post";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Repeat2Icon } from "lucide-react";
import Link from "next/link";

import { isValidateRecord } from "@/lib/bluesky/utils";
import { cn } from "@/lib/utils";

import { FeedEmbed } from "./Embed";

interface FeedProps {
  feed: FeedViewPost;
}

export function Feed({ feed }: FeedProps) {
  console.log("Feed Data:", feed, feed.post.record.text);

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

  const parentRecord = isValidateRecord(replyParent?.record);
  const parentReplyUri = parentRecord?.reply?.parent.uri;
  // 쓰레드 길이가 4개 이상이라 쓰레드 전체 보기가 필요한 경우
  // -3번째 reply(replyParent.reply.parent)가 root와 같지 않은 경우
  const hasLongThread =
    hasReplyThread && hasMultipleReplies && parentReplyUri !== replyRoot?.uri;

  return (
    <div className="flex flex-col border-b border-gray-200 p-4">
      {isReasonRepost(feed.reason) && <FeedRepost feed={feed} />}
      {hasMultipleReplies && replyRoot && <FeedRecord post={replyRoot} />}
      {hasLongThread && <div>쓰레드 전체 보기</div>}
      {replyParent && <FeedRecord post={replyParent} />}
      <FeedRecord post={post} />
    </div>
  );
}

function FeedRecord({ post }: { post: PostView }) {
  const record = isValidateRecord(post.record);

  if (!record) {
    throw new Error("Invalid post record");
  }

  return (
    <div className="flex gap-2">
      <FeedAvatar post={post} />
      <div className="flex w-full min-w-0 flex-col gap-1">
        <FeedHeader post={post} createdAt={record.createdAt} />
        <FeedContent text={record.text} facets={record.facets} />
        {post.embed && <FeedEmbed embed={post.embed} />}
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
  const embeds = AppBskyEmbedRecord.isViewRecord(post)
    ? post.embeds
    : undefined;
  const value = isValidateRecord(post.value);

  if (!embeds || !value) {
    throw new Error("Invalid post embed or value");
  }

  return (
    <div className="flex gap-2 rounded-lg border border-gray-200 p-3">
      <div className="flex min-w-0 flex-col gap-1">
        <FeedHeader post={post} createdAt={value.createdAt} className="gap-0.5">
          <FeedAvatar post={post} className="size-4" />
        </FeedHeader>
        <FeedContent text={value.text} facets={value.facets} />
        {children}
      </div>
    </div>
  );
}

function FeedRepost({ feed }: { feed: FeedViewPost }) {
  return (
    isReasonRepost(feed.reason) && (
      <div className="ml-13 flex items-center gap-1 text-gray-400">
        <Repeat2Icon className="h-4 w-4" />
        <span className="text-xs font-medium">
          {feed.reason.by.displayName || feed.reason.by.handle} 님이 재게시함
        </span>
      </div>
    )
  );
}

function FeedAvatar({
  post,
  className = "",
}: {
  post: PostView | AppBskyEmbedRecord.ViewRecord;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={post.author.avatar || "/default-avatar.png"}
      alt={post.author.displayName || post.author.handle}
      className={cn("mr-1 size-10 rounded-full", className)}
    />
  );
}

function FeedHeader({
  post,
  createdAt,
  children,
  className = "",
}: {
  post: PostView | AppBskyEmbedRecord.ViewRecord;
  createdAt: string;
  children?: React.ReactNode;
  className?: string;
}) {
  function getRelativeTimeBasic(postDate: Date | string): string {
    const date = typeof postDate === "string" ? new Date(postDate) : postDate;

    return formatDistanceToNow(date, {
      locale: ko,
    });
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {children}
      <h3 className="overflow-hidden overflow-ellipsis whitespace-nowrap text-sm font-semibold">
        {post.author.displayName || post.author.handle}
      </h3>
      <p className="overflow-hidden overflow-ellipsis whitespace-nowrap text-xs text-gray-400">
        @{post.author.handle}
      </p>
      &middot;
      <span className="shrink-0 text-xs text-gray-400">
        {getRelativeTimeBasic(createdAt)}
      </span>
    </div>
  );
}

function FeedContent({
  text,
  facets,
}: {
  text: string;
  facets: Record["facets"];
}) {
  const rt = new RichText({
    text,
    facets,
  });

  const content = [];

  for (const segment of rt.segments()) {
    if (segment.isLink()) {
      content.push(
        <Link
          href={segment.link!.uri}
          target="_blank"
          className="text-blue-500 hover:underline"
        >
          {segment.text}
        </Link>,
      );
    } else if (segment.isMention()) {
      content.push(
        <Link
          href={`/user/${segment.mention!.did}`}
          className="text-blue-500 hover:underline"
        >
          {segment.text}
        </Link>,
      );
    } else if (segment.isTag()) {
      content.push(
        <span className="text-blue-500 hover:underline">{segment.text}</span>,
      );
    } else {
      content.push(segment.text);
    }
  }

  return (
    <div>
      <p className="whitespace-pre-wrap text-base">
        <>{...content}</>
      </p>
    </div>
  );
}
