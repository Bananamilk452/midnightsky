import {
  AppBskyEmbedExternal,
  AppBskyEmbedImages,
  AppBskyEmbedRecord,
  AppBskyEmbedRecordWithMedia,
  AppBskyEmbedVideo,
  AppBskyFeedDefs,
} from "@atproto/api";

import { EmbedPost } from "@/components/feed";
import { FeedExternal } from "@/components/feed/embed/External";
import { FeedImage } from "@/components/feed/embed/Image";
import { FeedVideo } from "@/components/feed/embed/Video";
import { validateRecord } from "@/lib/bluesky/utils";

export function FeedEmbed({
  embed,
}: {
  embed: AppBskyFeedDefs.FeedViewPost["post"]["embed"];
}) {
  // 1. Image
  if (AppBskyEmbedImages.isView(embed)) {
    return <FeedImage content={embed} />;
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
      <div className="mt-2 flex flex-col gap-2">
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
