"use client";

import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { parseAtUri } from "@/lib/utils";

export function FeedThreadEllipsis({ post }: { post: PostView }) {
  const at = parseAtUri(post.uri);
  const t = useTranslations("Feed");

  return (
    <Link
      onClick={(e) => e.stopPropagation()}
      href={`/post/${post.author.handle}/${at.rkey}`}
      className="group flex px-4 py-2 hover:cursor-pointer hover:bg-white/5"
    >
      <div className="mr-3 flex h-6 w-10 justify-center">
        <div className="border-l-2 border-dotted border-gray-400"></div>
      </div>
      <p className="text-blue-500 group-hover:underline">
        {t("viewFullThread")}
      </p>
    </Link>
  );
}
