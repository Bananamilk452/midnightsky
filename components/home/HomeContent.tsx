"use client";

import {
  FeedViewPost,
  isReasonRepost,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";

import { Feed } from "@/components/feed";
import { Avatar } from "@/components/primitive/Avatar";
import { useSession, useTimeline } from "@/lib/hooks/useBluesky";

export function HomeContent() {
  const { data: user } = useSession();
  const { data: timeline } = useTimeline({
    limit: 30,
  });

  function createFeedKey(post: FeedViewPost) {
    let key = post.post.uri;

    if (isReasonRepost(post.reason)) {
      key += `-${post.reason.uri}`;
    }

    return key;
  }

  return (
    <div>
      <div className="mx-auto max-w-[600px]">
        <div className="flex w-full items-center justify-start bg-black/30 p-4">
          <Avatar src={user.avatar} alt={user.displayName || user.handle} />
        </div>
        <div className="w-full bg-black/50">
          {timeline.feed.map((feed) => (
            <Feed key={createFeedKey(feed)} feed={{ ...feed }} />
          ))}
        </div>
      </div>
    </div>
  );
}
