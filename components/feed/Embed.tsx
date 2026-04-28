"use client";

import {
  $Typed,
  AppBskyEmbedExternal,
  AppBskyEmbedImages,
  AppBskyEmbedRecord,
  AppBskyEmbedRecordWithMedia,
  AppBskyEmbedVideo,
} from "@atproto/api";
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

import { EmbedPost } from "@/components/feed";
import { useFeedContext } from "@/components/feed/context";
import { FeedExternal } from "@/components/feed/embed/External";
import { FeedImage } from "@/components/feed/embed/Image";
import { FeedVideo } from "@/components/feed/embed/Video";
import { validateRecord } from "@/lib/bluesky/utils";

type EmbedType =
  | $Typed<AppBskyEmbedImages.View>
  | $Typed<AppBskyEmbedVideo.View>
  | $Typed<AppBskyEmbedExternal.View>
  | $Typed<AppBskyEmbedRecord.View>
  | $Typed<AppBskyEmbedRecordWithMedia.View>
  | { $type: string };

export function FeedEmbed({ embed: embedProp }: { embed?: EmbedType }) {
  const { post: _post } = useFeedContext();
  // Thread에서 내려오는 Post는 PostView 타입이지만,
  // $type이 없어서 isPostView 사용 불가능. 따라서 as 사용
  const post = _post as PostView;
  if (!embedProp && !post.embed) return null;

  const embed: EmbedType = embedProp! ?? post.embed!;

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

  if (AppBskyEmbedVideo.isView(embed)) {
    return <FeedVideo content={embed} />;
  }
}
