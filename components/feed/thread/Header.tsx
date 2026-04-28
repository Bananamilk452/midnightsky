"use client";

import { FeedAvatar } from "@/components/feed/Avatar";
import { cn } from "@/lib/utils";

import { useFeedContext } from "../context";

export function FeedThreadHeader({ className = "" }: { className?: string }) {
  const { post } = useFeedContext();

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <FeedAvatar />
      <div className="flex w-full min-w-0 flex-col">
        <h3 className="text overflow-hidden overflow-ellipsis whitespace-nowrap font-semibold">
          {post.author.displayName || post.author.handle}
        </h3>
        <p className="overflow-hidden overflow-ellipsis whitespace-nowrap text-sm text-gray-400">
          @{post.author.handle}
        </p>
      </div>
    </div>
  );
}
