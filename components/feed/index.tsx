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
import {
  EllipsisIcon,
  HeartIcon,
  MessageSquareIcon,
  Repeat2Icon,
} from "lucide-react";
import Link from "next/link";

import { validateRecord } from "@/lib/bluesky/utils";
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

  const parentRecord = validateRecord(replyParent?.record);
  const parentReplyUri = parentRecord?.reply?.parent.uri;
  // 쓰레드 길이가 4개 이상이라 쓰레드 전체 보기가 필요한 경우
  // -3번째 reply(replyParent.reply.parent)가 root와 같지 않은 경우
  const hasLongThread =
    hasReplyThread && hasMultipleReplies && parentReplyUri !== replyRoot?.uri;

  return (
    <div className="flex flex-col border-b border-gray-400">
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

function FeedThreadEllipsis({ uri }: { uri: string }) {
  return (
    <Link
      href={`/post/${uri}`}
      className="group flex px-4 py-2 hover:cursor-pointer hover:bg-white/5"
    >
      <div className="mr-3 flex h-6 w-10 justify-center">
        <div className="border-l-2 border-dotted border-gray-400"></div>
      </div>
      <p className="text-blue-500 group-hover:underline">쓰레드 전체 보기</p>
    </Link>
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
  const record = validateRecord(post.record);

  if (!record) {
    throw new Error("Invalid post record");
  }

  const lineElement = <div className="h-full w-0.5 bg-gray-400" />;

  return (
    <div
      className={cn(
        "flex flex-col px-4 hover:cursor-pointer hover:bg-white/5",
        className,
      )}
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
          <FeedContent text={record.text} facets={record.facets} />
          {post.embed && <FeedEmbed embed={post.embed} />}
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
    <div className="flex gap-2 rounded-lg border border-gray-400 p-3">
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
      <div className="ml-3 mt-4 flex items-center gap-1 text-gray-400">
        <Repeat2Icon className="size-4" />
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
      className={cn("size-10 rounded-full", className)}
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

function FeedFooter({
  post,
  className,
}: {
  post: PostView;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-4", className)}>
      <div className="flex items-center">
        <button className="flex items-center gap-1.5 rounded-full p-1 text-gray-400 hover:cursor-pointer hover:bg-white/10">
          <MessageSquareIcon className="size-4" />
          {post.replyCount && post.replyCount > 0 ? post.replyCount : ""}
        </button>
      </div>
      <div className="flex items-center">
        <button className="flex items-center gap-1.5 rounded-full p-1 text-gray-400 hover:cursor-pointer hover:bg-white/10">
          <Repeat2Icon className="size-5" />
          {post.repostCount && post.repostCount > 0 ? post.repostCount : ""}
        </button>
      </div>
      <div className="flex items-center">
        <button className="flex items-center gap-1.5 rounded-full p-1 text-gray-400 hover:cursor-pointer hover:bg-white/10">
          <HeartIcon className="size-4" />
          {post.likeCount && post.likeCount > 0 ? post.likeCount : ""}
        </button>
      </div>
      <div className="flex items-center">
        <button className="text-gray-400">
          <EllipsisIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
