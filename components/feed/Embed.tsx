import {
  AppBskyEmbedExternal,
  AppBskyEmbedImages,
  AppBskyEmbedRecord,
  AppBskyEmbedRecordWithMedia,
  AppBskyEmbedVideo,
  AppBskyFeedDefs,
} from "@atproto/api";

import { validateRecord } from "@/lib/bluesky/utils";

import { EmbedPost } from ".";
import { FeedExternal } from "./embed/External";
import { FeedVideo } from "./embed/Video";

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
      const value = validateRecord(record.value);
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

  // 5. Video
  if (AppBskyEmbedVideo.isView(embed)) {
    return <FeedVideo content={embed} />;
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
