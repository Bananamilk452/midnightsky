import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import {
  EllipsisIcon,
  HeartIcon,
  MessageSquareIcon,
  Repeat2Icon,
} from "lucide-react";

import { cn } from "@/lib/utils";

export function FeedFooter({
  post,
  className,
}: {
  post: PostView;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-4", className)}>
      <div className="flex items-center">
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 rounded-full p-1 text-gray-400 hover:cursor-pointer hover:bg-white/10"
        >
          <MessageSquareIcon className="size-4" />
          {post.replyCount && post.replyCount > 0 ? post.replyCount : ""}
        </button>
      </div>
      <div className="flex items-center">
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 rounded-full p-1 text-gray-400 hover:cursor-pointer hover:bg-white/10"
        >
          <Repeat2Icon className="size-5" />
          {post.repostCount && post.repostCount > 0 ? post.repostCount : ""}
        </button>
      </div>
      <div className="flex items-center">
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 rounded-full p-1 text-gray-400 hover:cursor-pointer hover:bg-white/10"
        >
          <HeartIcon className="size-4" />
          {post.likeCount && post.likeCount > 0 ? post.likeCount : ""}
        </button>
      </div>
      <div className="flex items-center">
        <button onClick={(e) => e.stopPropagation()} className="text-gray-400">
          <EllipsisIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
