import { RichText } from "@atproto/api";
import { Record } from "@atproto/api/dist/client/types/app/bsky/feed/post";
import Link from "next/link";

export function FeedContent({
  text,
  facets,
}: {
  text: string;
  facets: Record["facets"];
}) {
  const rt = new RichText({
    text,
    facets,
  });

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
          href={`/user/${segment.mention!.did}`}
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
    <div>
      <p className="whitespace-pre-wrap text-base">
        <>{...content}</>
      </p>
    </div>
  );
}
