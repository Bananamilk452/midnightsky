"use client";

import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import {
  EllipsisIcon,
  HeartIcon,
  MessageSquareIcon,
  Repeat2Icon,
  ShareIcon,
} from "lucide-react";

import { useWriter } from "@/components/providers/WriterProvider";
import { validateRecord } from "@/lib/bluesky/utils";
import { cn } from "@/lib/utils";

export function FeedFooter({
  post,
  className,
}: {
  post: PostView;
  className?: string;
}) {
  const { openWriter } = useWriter();
  const record = validateRecord(post.record);

  function handleWriterOpen(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    console.log(record);
    if (record?.reply) {
      openWriter({
        root: record.reply.root,
        parent: {
          cid: post.cid,
          uri: post.uri,
        },
      });
    } else {
      openWriter({
        root: {
          cid: post.cid,
          uri: post.uri,
        },
        parent: {
          cid: post.cid,
          uri: post.uri,
        },
      });
    }
  }

  return (
    <>
      <div className={cn("flex items-center justify-between", className)}>
        <FeedFooterButton onClick={handleWriterOpen}>
          <MessageSquareIcon className="size-4" />
          {post.replyCount && post.replyCount > 0 ? post.replyCount : ""}
        </FeedFooterButton>
        <FeedFooterButton>
          <Repeat2Icon className="size-5" />
          {post.repostCount && post.repostCount > 0 ? post.repostCount : ""}
        </FeedFooterButton>
        <FeedFooterButton>
          <HeartIcon className="size-4" />
          {post.likeCount && post.likeCount > 0 ? post.likeCount : ""}
        </FeedFooterButton>
        <FeedFooterButton>
          <ShareIcon className="size-4" />
        </FeedFooterButton>
        <FeedFooterButton>
          <EllipsisIcon className="size-4" />
        </FeedFooterButton>
      </div>
    </>
  );
}

export function FeedFooterButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full p-1 text-gray-400 hover:cursor-pointer hover:bg-white/10"
    >
      {children}
    </button>
  );
}
