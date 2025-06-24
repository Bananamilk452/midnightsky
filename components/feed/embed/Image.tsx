import { AppBskyEmbedImages } from "@atproto/api";

export function FeedImage({ content }: { content: AppBskyEmbedImages.View }) {
  return (
    <div className="mt-2 h-auto max-h-[515px] w-fit overflow-hidden rounded-lg border border-white/30">
      {content.images.length === 1 && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={content.images[0].fullsize}
          alt={content.images[0].alt || "Image"}
          className="h-auto max-h-[515px] rounded-lg"
        />
      )}
      {content.images.length === 2 && (
        <div className="grid h-full grid-cols-2 gap-1">
          {content.images.map((image) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={image.fullsize}
              src={image.fullsize}
              alt={image.alt || "Image"}
              className="size-full object-cover"
            />
          ))}
        </div>
      )}
      {content.images.length > 2 && (
        <div className="grid h-full grid-cols-2 grid-rows-2 gap-1">
          {content.images.map((image) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={image.fullsize}
              src={image.fullsize}
              alt={image.alt || "Image"}
              className="size-full object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
}
