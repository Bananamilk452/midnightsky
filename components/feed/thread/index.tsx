"use client";

import {
  isBlockedPost,
  isNotFoundPost,
  isThreadViewPost,
  PostView,
  ThreadgateView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { OutputSchema as PostThreadData } from "@atproto/api/dist/client/types/app/bsky/feed/getPostThread";
import { format } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { ko } from "date-fns/locale/ko";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

import { FeedRecord } from "@/components/feed";
import { FeedContent } from "@/components/feed/Content";
import { FeedContext } from "@/components/feed/context";
import { FeedEmbed } from "@/components/feed/Embed";
import { FeedPost } from "@/components/feed/embed/Post";
import { FeedFooter } from "@/components/feed/Footer";
import { FeedLabel } from "@/components/feed/Label";
import { FeedThreadHeader } from "@/components/feed/thread/Header";
import { validateRecord } from "@/lib/bluesky/utils";
import * as Post from "@/lib/lexicon/types/app/midnightsky/post";
import { parseAtUri } from "@/lib/utils";

import type { FeedContextValue } from "@/components/feed/context";

export function FeedThread({
  thread,
  threadgate,
}: {
  thread: PostThreadData["thread"];
  threadgate?: ThreadgateView;
}) {
  const t = useTranslations("Feed");

  if (isNotFoundPost(thread)) {
    return <p>{t("postNotFound")}</p>;
  }

  if (isBlockedPost(thread)) {
    return <p>{t("postBlocked")}</p>;
  }

  if (isThreadViewPost(thread)) {
    const { post } = thread;

    const record = validateRecord(post.record);

    if (!record) {
      throw new Error("Invalid post record");
    }

    const replies = thread.replies?.toReversed() || [];

    return (
      <>
        {thread.parent && (
          <FeedThreadParent reply={thread.parent} threadgate={threadgate} />
        )}
        <FeedThreadRecord
          post={post}
          threadgate={threadgate}
          line={{
            top: Boolean(thread.parent),
            bottom: false,
          }}
        />
        {replies.map((reply, i) => (
          <div key={i}>
            <FeedThreadReply reply={reply} threadgate={threadgate} />
          </div>
        ))}
      </>
    );
  }
}

function FeedThreadRecord({
  post,
  threadgate,
  line,
}: {
  post: PostView;
  threadgate?: ThreadgateView;
  line?: { top?: boolean; bottom?: boolean };
}) {
  const record = validateRecord(post.record);
  const { rkey } = parseAtUri(post.uri);
  const locale = useLocale();
  const dateLocale = locale === "ko" ? ko : enUS;
  const dateFormat =
    locale === "ko" ? "yyyy년 MM월 dd일 a h:mm" : "MMM d, yyyy h:mm a";

  if (!record) {
    throw new Error("Invalid post record");
  }

  const contextValue: FeedContextValue = { post, threadgate, record };

  return (
    <FeedContext.Provider value={contextValue}>
      <div
        id={rkey}
        className="flex flex-col border-b border-white/30 px-4 pb-2"
      >
        <div className="flex h-4 w-[40px] justify-center">
          {line?.top && <div className="h-full w-0.5 bg-gray-400" />}
        </div>
        <div className="flex w-full min-w-0 flex-col gap-2">
          <Link
            className="inline-block w-fit max-w-full"
            href={`/profile/${post.author.handle}`}
          >
            <FeedThreadHeader />
          </Link>
          <FeedLabel>
            <FeedContent className="text-lg" />
            <FeedEmbed />
            {Post.isRecord(record.embed) && <FeedPost content={record.embed} />}
          </FeedLabel>
          <p className="text-xs text-gray-400">
            {format(new Date(post.indexedAt), dateFormat, {
              locale: dateLocale,
            })}
          </p>
          <FeedFooter className="mt-2" />
        </div>
      </div>
    </FeedContext.Provider>
  );
}

function FeedThreadReply({
  reply,
  threadgate,
  depth = 1,
}: {
  reply: PostThreadData["thread"];
  threadgate?: ThreadgateView;
  depth?: number;
}) {
  const t = useTranslations("Feed");

  if (isNotFoundPost(reply)) {
    return <p>{t("postNotFound")}</p>;
  }

  if (isBlockedPost(reply)) {
    return <p>{t("postBlocked")}</p>;
  }

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
          threadgate={threadgate}
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
  threadgate,
}: {
  reply: PostThreadData["thread"];
  threadgate?: ThreadgateView;
}) {
  const t = useTranslations("Feed");

  if (isNotFoundPost(reply)) {
    return <p>{t("postNotFound")}</p>;
  }

  if (isBlockedPost(reply)) {
    return <p>{t("postBlocked")}</p>;
  }

  if (isThreadViewPost(reply)) {
    const { post } = reply;

    const record = validateRecord(post.record);

    if (!record) {
      throw new Error("Invalid post record");
    }

    return (
      <>
        {reply.parent && <FeedThreadParent reply={reply.parent} />}
        <FeedRecord
          post={post}
          threadgate={threadgate}
          className="last:border-b last:border-white/30 last:pb-2"
          line={{
            top: Boolean(reply.parent),
            bottom: true,
          }}
        />
      </>
    );
  }
}
