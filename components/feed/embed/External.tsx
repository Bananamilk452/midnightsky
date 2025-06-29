import { AppBskyEmbedExternal } from "@atproto/api";
import { EarthIcon } from "lucide-react";
import Link from "next/link";

export function FeedExternal({
  content,
}: {
  content: AppBskyEmbedExternal.View;
}) {
  return (
    <Link
      onClick={(e) => e.stopPropagation()}
      href={content.external.uri}
      target="_blank"
    >
      <div className="mt-2 overflow-hidden rounded-lg border border-white/30">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="aspect-[1.91/1] w-full object-cover"
          src={content.external.thumb}
          alt={content.external.title}
        />
        <div className="p-3">
          <h3 className="text-ellipsis font-semibold">
            {content.external.title || content.external.uri}
          </h3>
          <p className="text-sm">{content.external.description}</p>
          <hr className="my-1" />
          <div className="flex items-center gap-1">
            <EarthIcon className="size-3 text-gray-400" />
            <span className="text-xs text-gray-400">
              {new URL(content.external.uri).origin}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
