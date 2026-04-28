"use client";

import { useLocale } from "next-intl";

import { useFeedContext } from "@/components/feed/context";
import { getRelativeTimeBasic } from "@/lib/bluesky/utils";
import { cn } from "@/lib/utils";

export function FeedHeader({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { post, record } = useFeedContext();
  const locale = useLocale();
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
        {getRelativeTimeBasic(record.createdAt, locale)}
      </span>
    </div>
  );
}
