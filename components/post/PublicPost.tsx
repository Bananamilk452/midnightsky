import DOMPurify from "dompurify";
import { EarthIcon } from "lucide-react";

import { usePublicPost } from "@/lib/hooks/useBluesky";
import * as Post from "@/lib/lexicon/types/app/midnightsky/post";

export function PublicPost({ post }: { post: Post.Record }) {
  const { data } = usePublicPost(post.id);

  const html = DOMPurify.sanitize(data.content);

  return (
    <div className="relative">
      <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs text-gray-600">
        <EarthIcon className="size-4" />
        전체 공개
      </div>
      <div
        className="prose rounded-lg border border-gray-400 bg-gray-50 p-3 shadow"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
