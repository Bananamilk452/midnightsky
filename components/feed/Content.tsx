"use client";

import { RichText } from "@atproto/api";
import Link from "next/link";

import { useFeedContext } from "@/components/feed/context";
import { cn } from "@/lib/utils";

export function FeedContent({ className = "" }: { className?: string }) {
  const { record } = useFeedContext();
  const rt = new RichText({ text: record.text, facets: record.facets });

  const content = [];

  for (const segment of rt.segments()) {
    if (segment.isLink()) {
      content.push(
        <Link
          onClick={(e) => e.stopPropagation()}
          href={segment.link!.uri}
          target="_blank"
          className="text-blue-500 hover:underline"
        >
          {segment.text}
        </Link>,
      );
    } else if (segment.isMention()) {
      content.push(
        <Link
          onClick={(e) => e.stopPropagation()}
          href={`/profile/${segment.mention!.did}`}
          className="text-blue-500 hover:underline"
        >
          {segment.text}
        </Link>,
      );
    } else if (segment.isTag()) {
      content.push(
        <span
          onClick={(e) => e.stopPropagation()}
          className="text-blue-500 hover:underline"
        >
          {segment.text}
        </span>,
      );
    } else {
      content.push(segment.text);
    }
  }

  return (
    <p className={cn("whitespace-pre-wrap break-all text-base", className)}>
      <>{...content}</>
    </p>
  );
}
