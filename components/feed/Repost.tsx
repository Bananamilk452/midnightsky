"use client";

import {
  FeedViewPost,
  isReasonRepost,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { Repeat2Icon } from "lucide-react";
import { useTranslations } from "next-intl";

export function FeedRepost({ feed }: { feed: FeedViewPost }) {
  const t = useTranslations("Feed");

  return (
    isReasonRepost(feed.reason) && (
      <div className="ml-3 mt-4 flex items-center gap-1 text-gray-400">
        <Repeat2Icon className="size-4" />
        <span className="text-xs font-medium">
          {t("reposted", { name: feed.reason.by.displayName || feed.reason.by.handle })}
        </span>
      </div>
    )
  );
}
