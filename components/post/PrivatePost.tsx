"use client";

import DOMPurify from "dompurify";
import { LockIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { usePrivatePost } from "@/lib/hooks/useBluesky";
import * as Post from "@/lib/lexicon/types/app/midnightsky/post";

export function PrivatePost({ post }: { post: Post.Record }) {
  const { data } = usePrivatePost(post.id);
  const t = useTranslations("Post");

  if (!data.isViewable) {
    return (
      <div className="rounded-lg border border-gray-400 bg-gray-50 p-4 shadow">
        <p className="text-black">{t("noPermissionMutual")}</p>
      </div>
    );
  }

  const html = DOMPurify.sanitize(data.content);

  return (
    <div className="relative">
      <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs text-gray-600">
        <LockIcon className="size-4" />
        {t("private")}
      </div>
      <div
        className="prose rounded-lg border border-gray-400 bg-gray-50 p-3 pb-8 shadow"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
