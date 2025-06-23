import { AppBskyEmbedRecord } from "@atproto/api";
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

import { cn } from "@/lib/utils";

export function FeedAvatar({
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
