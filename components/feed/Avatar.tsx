"use client";

import { useFeedContext } from "@/components/feed/context";
import { Avatar } from "@/components/primitive/Avatar";

export function FeedAvatar({ className }: { className?: string }) {
  const { post } = useFeedContext();
  return (
    <Avatar
      src={post.author.avatar}
      alt={post.author.displayName || post.author.handle}
      className={className}
    />
  );
}
