import {
  FeedViewPost,
  isReasonRepost,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { Repeat2Icon } from "lucide-react";

export function FeedRepost({ feed }: { feed: FeedViewPost }) {
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
