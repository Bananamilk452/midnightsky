import { AppBskyEmbedRecord } from "@atproto/api";
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

import { getRelativeTimeBasic } from "@/lib/bluesky/utils";
import { cn } from "@/lib/utils";

export function FeedHeader({
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
