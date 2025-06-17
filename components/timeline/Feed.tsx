import {
  $Typed,
  AppBskyEmbedExternal,
  AppBskyEmbedImages,
  AppBskyEmbedRecord,
  AppBskyEmbedRecordWithMedia,
  AppBskyFeedPost,
  RichText,
} from "@atproto/api";
import {
  FeedViewPost,
  PostView,
  ReasonRepost,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { Record } from "@atproto/api/dist/client/types/app/bsky/feed/post";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { EarthIcon, Repeat2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface FeedProps {
  feed: FeedViewPost;
}

type Embed = PostView["embed"] | AppBskyFeedPost.Record["embed"];

export function Feed({ feed }: FeedProps) {
  console.log("Feed Data:", feed);

  const { post } = feed;
  const replyParent = feed.reply?.parent as PostView | undefined;
  const replyRoot = feed.reply?.root as PostView | undefined;

  const hasReplyThread = replyRoot && replyParent;
  // 쓰레드 길이가 3개 이상인 경우
  // -1번째 reply(replyParent)가 root와 같지 않은 경우
  const isReplyRootNeeded = hasReplyThread && replyParent.uri !== replyRoot.uri;

  const parentRecord = replyParent?.record as Record;
  const parentReplyUri = parentRecord?.reply?.parent.uri;
  // 쓰레드 길이가 4개 이상이라 쓰레드 전체 보기가 필요한 경우
  // -3번째 reply(replyParent.reply.parent)가 root와 같지 않은 경우
  const isThreadElipsisNeeded =
    hasReplyThread && isReplyRootNeeded && parentReplyUri !== replyRoot?.uri;

  return (
    <div className="flex flex-col border-b border-gray-200 p-4">
      {feed.reason &&
        feed.reason.$type === "app.bsky.feed.defs#reasonRepost" && (
          <FeedRepost feed={feed} />
        )}
      {isReplyRootNeeded && <FeedRecord post={replyRoot} />}
      {isThreadElipsisNeeded && <div>쓰레드 전체 보기</div>}
      {replyParent && <FeedRecord post={replyParent} />}
      <FeedRecord post={post} />
    </div>
  );
}

function FeedRecord({ post }: { post: PostView }) {
  const record = post.record as AppBskyFeedPost.Record;

  return (
    <div className="flex gap-2">
      <FeedAvatar post={post} />
      <div className="flex flex-col gap-1 pr-8">
        <FeedHeader post={post} createdAt={record.createdAt} />
        <FeedContent text={record.text} facets={record.facets} />
        {post.embed && <FeedEmbed embed={post.embed} author={post.author} />}
      </div>
    </div>
  );
}

function FeedEmbedRecord({
  record,
  value,
}: {
  record: AppBskyEmbedRecord.ViewRecord;
  value: AppBskyFeedPost.Record;
}) {
  console.log("Embed Record:", record, value);
  return (
    <div className="flex gap-2 rounded-lg border border-gray-200 p-3">
      <div className="flex flex-col gap-1">
        <FeedHeader
          post={record}
          createdAt={value.createdAt}
          className="gap-0.5"
        >
          <FeedAvatar post={record} className="size-4" />
        </FeedHeader>
        <FeedContent text={value.text} facets={value.facets} />
        {value.embed && (
          <FeedEmbed embed={value.embed} author={record.author} />
        )}
      </div>
    </div>
  );
}

function FeedRepost({ feed }: { feed: FeedViewPost }) {
  const reason = feed.reason as $Typed<ReasonRepost>;

  return (
    <div className="ml-13 flex items-center gap-1 text-gray-500">
      <Repeat2Icon className="h-4 w-4" />
      <span className="text-xs font-medium">
        {reason.by.displayName || reason.by.handle} 님이 재게시함
      </span>
    </div>
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
    <Image
      unoptimized
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
      <p className="overflow-hidden overflow-ellipsis whitespace-nowrap text-xs text-gray-500">
        @{post.author.handle}
      </p>
      &middot;
      <span className="shrink-0 text-xs text-gray-500">
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

function FeedEmbed({
  embed,
  author,
}: {
  embed: Embed;
  author: PostView["author"];
}) {
  // 1. Image
  if (AppBskyEmbedImages.isView(embed) || AppBskyEmbedImages.isMain(embed)) {
    return <FeedImages image={embed} author={author} />;
  }

  // 2. External Link
  if (AppBskyEmbedExternal.isView(embed)) {
    return <FeedExternal embed={embed} />;
  }

  // 3. Record Embed (인용)
  if (AppBskyEmbedRecord.isView(embed)) {
    const record = embed.record;

    // 3.1. Post
    if (AppBskyEmbedRecord.isViewRecord(record)) {
      const value = record.value;
      if (AppBskyFeedPost.isRecord(value)) {
        return (
          <FeedEmbedRecord
            record={record}
            value={value as AppBskyFeedPost.Record}
          />
        );
      }
    }
  }

  // 4. Record With Media (미디어 포함 인용)

  if (AppBskyEmbedRecordWithMedia.isView(embed)) {
    console.log(embed);
    const media = embed.media;
    const record = embed.record.record;

    const res = [];

    if (AppBskyEmbedImages.isView(media)) {
      res.push(<FeedImages image={media} author={author} />);
    }

    if (AppBskyEmbedRecord.isViewRecord(record)) {
      const value = record.value;
      if (AppBskyFeedPost.isRecord(value)) {
        res.push(
          <FeedEmbedRecord
            record={record}
            value={value as AppBskyFeedPost.Record}
          />,
        );
      }
    }

    return <>{...res}</>;
  }

  if (AppBskyEmbedRecordWithMedia.isMain(embed)) {
    const media = embed.media;

    if (AppBskyEmbedImages.isMain(media)) {
      return <FeedImages image={media} author={author} />;
    }
  }
}

function FeedImages({
  image,
  author,
}: {
  image: AppBskyEmbedImages.View | AppBskyEmbedImages.Main;
  author: PostView["author"];
}) {
  let images;

  if (AppBskyEmbedImages.isView(image)) {
    images = image.images;
  } else if (AppBskyEmbedImages.isMain(image)) {
    images = image.images.map((i) => ({
      ...image,
      fullsize: `https://cdn.bsky.app/img/feed_thumbnail/plain/${author.did}/${i.image.ref}@jpeg`,
      alt: i.alt,
    }));
  } else {
    return null; // 잘못된 embed 형식
  }

  return (
    <div className="mt-2">
      {images.map((image) => (
        <Image
          unoptimized
          key={image.fullsize}
          src={image.fullsize}
          alt={image.alt || "Image"}
          className="h-auto max-h-[515px] w-full rounded-lg"
        />
      ))}
    </div>
  );
}

function FeedExternal({ embed }: { embed: $Typed<AppBskyEmbedExternal.View> }) {
  return (
    <div className="mt-2 rounded-lg border border-gray-200 p-3">
      <Link href={embed.external.uri} target="_blank">
        <h3 className="font-semibold">{embed.external.title}</h3>
        <p className="text-sm">{embed.external.description}</p>
        <hr className="my-1" />
        <div className="flex items-center gap-1">
          <EarthIcon className="size-3 text-gray-500" />
          <span className="text-xs text-gray-500">
            {new URL(embed.external.uri).origin}
          </span>
        </div>
      </Link>
    </div>
  );
}
