import DOMPurify from "dompurify";
import { ListIcon } from "lucide-react";

import { useListPost } from "@/lib/hooks/useBluesky";
import * as Post from "@/lib/lexicon/types/app/midnightsky/post";

export function ListPost({ post }: { post: Post.Record }) {
  const { data } = useListPost(post.id);

  if (!data.isViewable) {
    return (
      <div className="rounded-lg border border-gray-400 bg-gray-50 p-4 shadow">
        <p className="text-black">
          이 게시물을 볼 수 있는 권한이 없습니다. (사용자가 리스트에 없습니다.)
        </p>
      </div>
    );
  }

  const html = DOMPurify.sanitize(data.content);

  return (
    <div className="relative">
      <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs text-gray-600">
        <ListIcon className="size-4" />
        리스트
      </div>
      <div
        className="prose rounded-lg border border-gray-400 bg-gray-50 p-3 pb-8 shadow"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
