"use client";

import {
  isBlockedPost,
  isNotFoundPost,
  isThreadViewPost,
  PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { OutputSchema as PostThreadData } from "@atproto/api/dist/client/types/app/bsky/feed/getPostThread";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

import { FeedRecord } from "@/components/feed";
import { FeedEmbed } from "@/components/feed/Embed";
import { FeedPost } from "@/components/feed/embed/Post";
import { FeedFooter } from "@/components/feed/Footer";
import { FeedLabel } from "@/components/feed/Label";
import { FeedThreadContent } from "@/components/feed/thread/Content";
import { FeedThreadHeader } from "@/components/feed/thread/Header";
import { validateRecord } from "@/lib/bluesky/utils";
import * as Post from "@/lib/lexicon/types/app/midnightsky/post";

export function FeedThread({ thread }: { thread: PostThreadData["thread"] }) {
  // 1. Not Found
  if (isNotFoundPost(thread)) {
    return <p>해당 게시글을 찾을 수 없습니다.</p>;
  }

  // 2. Blocked Post
  if (isBlockedPost(thread)) {
    return <p>해당 게시글은 차단된 게시글입니다.</p>;
  }

  // 3. ThreadViewPost
  if (isThreadViewPost(thread)) {
    const { post } = thread;

    const record = validateRecord(post.record);

    if (!record) {
      throw new Error("Invalid post record");
    }

    // 왠지 모르게 bsky.app에서 렌더링 하는 것과
    // 서버에서 오는 값 순서가 반대라서 reverse 추가함
    const replies = thread.replies?.toReversed() || [];

    return (
      <>
        {thread.parent && <FeedThreadParent reply={thread.parent} />}
        <FeedThreadRecord
          post={post}
          line={{
            top: Boolean(thread.parent),
            bottom: false,
          }}
        />
        {replies.map((reply, i) => (
          <div key={i}>
            <FeedThreadReply reply={reply} />
          </div>
        ))}
      </>
    );
  }
}

function FeedThreadRecord({
  post,
  line,
}: {
  post: PostView;
  line?: { top?: boolean; bottom?: boolean };
}) {
  const record = validateRecord(post.record);

  if (!record) {
    throw new Error("Invalid post record");
  }

  return (
    <div className="flex flex-col border-b border-white/30 px-4 pb-2">
      <div className="flex h-4 w-[40px] justify-center">
        {line?.top && <div className="h-full w-0.5 bg-gray-400" />}
      </div>
      <div className="flex w-full min-w-0 flex-col gap-2">
        <FeedThreadHeader post={post} />
        <FeedLabel labels={post.labels}>
          <FeedThreadContent text={record.text} facets={record.facets} />
          {post.embed && <FeedEmbed embed={post.embed} />}
          {Post.isRecord(record.embed) && <FeedPost content={record.embed} />}
        </FeedLabel>
        <p className="text-xs text-gray-400">
          {format(new Date(post.indexedAt), "yyyy년 MM월 dd일 a h:mm", {
            locale: ko,
          })}
        </p>
        <FeedFooter post={post} className="mt-2" />
      </div>
    </div>
  );
}

function FeedThreadReply({
  reply,
  depth = 1,
}: {
  reply: PostThreadData["thread"];
  depth?: number;
}) {
  // 1. Not Found
  if (isNotFoundPost(reply)) {
    return <p>해당 게시글을 찾을 수 없습니다.</p>;
  }

  // 2. Blocked Post
  if (isBlockedPost(reply)) {
    return <p>해당 게시글은 차단된 게시글입니다.</p>;
  }

  // 3. ThreadViewPost
  if (isThreadViewPost(reply)) {
    const { post } = reply;

    const record = validateRecord(post.record);

    if (!record) {
      throw new Error("Invalid post record");
    }

    return (
      <>
        <FeedRecord
          post={post}
          className="last:border-b last:border-white/30 last:pb-2"
          line={{
            top: depth === 1 ? false : true,
            bottom: Boolean(reply.replies?.length),
          }}
        />
        {reply.replies && (
          <FeedThreadReply reply={reply.replies[0]} depth={depth + 1} />
        )}
      </>
    );
  }
}

function FeedThreadParent({
  reply,
  depth = 1,
}: {
  reply: PostThreadData["thread"];
  depth?: number;
}) {
  // 1. Not Found
  if (isNotFoundPost(reply)) {
    return <p>해당 게시글을 찾을 수 없습니다.</p>;
  }

  // 2. Blocked Post
  if (isBlockedPost(reply)) {
    return <p>해당 게시글은 차단된 게시글입니다.</p>;
  }

  // 3. ThreadViewPost
  if (isThreadViewPost(reply)) {
    const { post } = reply;

    const record = validateRecord(post.record);

    if (!record) {
      throw new Error("Invalid post record");
    }

    return (
      <>
        {reply.parent && (
          <FeedThreadParent reply={reply.parent} depth={depth + 1} />
        )}
        <FeedRecord
          post={post}
          className="last:border-b last:border-white/30 last:pb-2"
          line={{
            top: depth === 1 ? true : false,
            bottom: true,
          }}
        />
      </>
    );
  }
}
