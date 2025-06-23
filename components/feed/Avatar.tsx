import { AppBskyEmbedRecord } from "@atproto/api";
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

import { Avatar } from "@/components/primitive/Avatar";

export function FeedAvatar({
  post,
}: {
  post: PostView | AppBskyEmbedRecord.ViewRecord;
  className?: string;
}) {
  return (
    <Avatar
      src={post.author.avatar}
      alt={post.author.displayName || post.author.handle}
    />
  );
}
