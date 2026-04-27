"use client";

import { Label } from "@atproto/api";
import { CircleAlertIcon } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function FeedLabel({
  labels,
  children,
}: {
  labels?: Label[];
  children?: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const t = useTranslations("Feed");

  const contentWarningMap: Record<string, string> = {
    sexual: t("adultContent"),
    nudity: t("nudity"),
    porn: t("adultContent"),
    "graphic-media": t("graphicMedia"),
  };

  labels = labels?.filter((l) => l.val !== "!no-unauthenticated");

  if (!labels || labels.length === 0) {
    return children;
  }

  const title = labels
    .map((label) => contentWarningMap[label.val])
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
          {show ? t("hide") : t("show")}
        </button>
      </div>
      {show && children}
    </div>
  );
}
