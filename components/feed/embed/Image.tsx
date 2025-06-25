import { AppBskyEmbedImages } from "@atproto/api";
import { DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { XIcon } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

export function FeedImage({ content }: { content: AppBskyEmbedImages.View }) {
  return (
    <div className="mt-2 h-auto max-h-[515px] w-fit overflow-hidden rounded-lg border border-white/30">
      {content.images.length === 1 && <ImageView image={content.images[0]} />}
      {content.images.length === 2 && (
        <div className="grid h-full grid-cols-2 gap-1">
          {content.images.map((image) => (
            <ImageView key={image.fullsize} image={image} />
          ))}
        </div>
      )}
      {content.images.length === 3 && (
        <div className="grid h-full grid-cols-2 gap-1">
          <ImageView image={content.images[0]} />
          <div className="grid h-full grid-rows-2 gap-1">
            {content.images.slice(1).map((image) => (
              <ImageView key={image.fullsize} image={image} />
            ))}
          </div>
        </div>
      )}
      {content.images.length > 3 && (
        <div className="grid h-full grid-cols-2 grid-rows-2 gap-1">
          {content.images.map((image) => (
            <ImageView key={image.fullsize} image={image} />
          ))}
        </div>
      )}
    </div>
  );
}

function ImageView({ image }: { image: AppBskyEmbedImages.ViewImage }) {
  const [open, setOpen] = useState(false);

  function handleDialogClick(event: React.MouseEvent<HTMLDivElement>) {
    console.log(event.target, event.currentTarget);
    event.stopPropagation();

    if (!["BUTTON", "IMG"].includes((event.target as HTMLElement).tagName)) {
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.fullsize}
          alt={image.alt || "Image"}
          className="size-full object-cover"
        />
      </DialogTrigger>
      <DialogContent
        className="max-w-[calc(100dvw-128px)]! max-h-dvh border-0 bg-transparent p-0 shadow-none [&>button:last-child]:hidden"
        onClick={handleDialogClick}
      >
        <VisuallyHidden>
          <DialogTitle />
          <DialogDescription />
        </VisuallyHidden>
        <div className="flex h-dvh flex-col items-center justify-center gap-2 p-4">
          <DialogClose asChild className="shrink-0">
            <button className="cursor-pointer">
              <XIcon className="size-4 text-white" />
            </button>
          </DialogClose>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.fullsize}
            alt={image.alt || "Image"}
            className="min-h-0 object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
