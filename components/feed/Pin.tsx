import {
  FeedViewPost,
  isReasonPin,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { PinIcon } from "lucide-react";

export function FeedPin({ feed }: { feed: FeedViewPost }) {
  return (
    isReasonPin(feed.reason) && (
      <div className="ml-3 mt-2 flex items-center gap-1 text-gray-400">
        <PinIcon className="size-4" />
        <span className="text-xs font-medium">고정됨</span>
      </div>
    )
  );
}
