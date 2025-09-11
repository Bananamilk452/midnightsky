import { AppBskyEmbedRecord } from "@atproto/api";
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

import { FeedAvatar } from "@/components/feed/Avatar";
import { cn } from "@/lib/utils";

export function FeedThreadHeader({
  post,
  className = "",
}: {
  post: PostView | AppBskyEmbedRecord.ViewRecord;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <FeedAvatar post={post} />
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
