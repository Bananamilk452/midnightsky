import {
  AppBskyEmbedExternal,
  AppBskyEmbedImages,
  AppBskyEmbedRecord,
  AppBskyEmbedRecordWithMedia,
  AppBskyFeedDefs,
} from "@atproto/api";
import { EarthIcon } from "lucide-react";
import Link from "next/link";

import { isValidateRecord } from "@/lib/bluesky/utils";

import { EmbedPost } from ".";

export function FeedEmbed({
  embed,
}: {
  embed: AppBskyFeedDefs.FeedViewPost["post"]["embed"];
}) {
  // 1. Image
  if (AppBskyEmbedImages.isView(embed)) {
    return <FeedImages content={embed} />;
  }

  // 2. External Link
  if (AppBskyEmbedExternal.isView(embed)) {
    return <FeedExternal content={embed} />;
  }

  // 3. Record Embed (인용)
  if (AppBskyEmbedRecord.isView(embed)) {
    const record = embed.record;

    // 3.1. Post
    if (AppBskyEmbedRecord.isViewRecord(record)) {
      const value = isValidateRecord(record.value);
      if (value) {
        return (
          <EmbedPost post={record}>
            {record.embeds?.map((embed) => (
              <FeedEmbed key={embed.$type} embed={embed} />
            ))}
          </EmbedPost>
        );
      }
    }
  }

  // 4. Record With Media (미디어 포함 인용)

  if (AppBskyEmbedRecordWithMedia.isView(embed)) {
    return (
      <div className="flex flex-col gap-2">
        <FeedEmbed embed={embed.media} />
        <FeedEmbed
          embed={{
            $type: "app.bsky.embed.record#view",
            record: embed.record.record,
          }}
        />
      </div>
    );
  }
}

function FeedImages({ content }: { content: AppBskyEmbedImages.View }) {
  return (
    <div className="mt-2">
      {content.images.map((image) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={image.fullsize}
          src={image.fullsize}
          alt={image.alt || "Image"}
          className="h-auto max-h-[515px] rounded-lg"
        />
      ))}
    </div>
  );
}

function FeedExternal({ content }: { content: AppBskyEmbedExternal.View }) {
  return (
    <Link href={content.external.uri} target="_blank">
      <div className="mt-2 overflow-hidden rounded-lg border border-gray-200">
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
