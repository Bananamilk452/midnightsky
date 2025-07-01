"use client";

import { Label } from "@atproto/api";
import { CircleAlertIcon } from "lucide-react";
import { useState } from "react";

const CONTENT_WARNING = {
  sexual: "성인 콘텐츠",
  nudity: "나체",
  porn: "성인 콘텐츠",
  "graphic-media": "불쾌감을 주는 미디어",
} as Record<string, string>;

export function FeedLabel({
  labels,
  children,
}: {
  labels?: Label[];
  children?: React.ReactNode;
}) {
  const [show, setShow] = useState(false);

  // 항상 로그인 상태이므로 '!no-unauthenticated' 라벨은 제외
  labels = labels?.filter((l) => l.val !== "!no-unauthenticated");

  if (!labels || labels.length === 0) {
    return children;
  }

  const title = labels
    .map((label) => CONTENT_WARNING[label.val])
    .filter(Boolean)
    .join(", ");

  function handleClick() {
    setShow(!show);
  }

  return (
    <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-3 rounded-lg bg-black/30 p-4">
        <CircleAlertIcon className="size-6 text-gray-400" />
        <p className="flex-grow text-sm font-semibold text-gray-400">{title}</p>
        <button
          className="cursor-pointer text-sm hover:underline"
          onClick={handleClick}
        >
          {show ? "숨기기" : "표시"}
        </button>
      </div>
      {show && children}
    </div>
  );
}
