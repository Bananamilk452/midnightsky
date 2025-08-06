"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

import { ErrorBoundaryPage } from "@/components/ErrorBoundaryPage";
import { FeedThread } from "@/components/feed/thread";
import { LoadingFallback } from "@/components/LoadingFallback";
import { usePostThread } from "@/lib/hooks/useBluesky";

export default function Page() {
  const { authority, rkey } = useParams();

  if (typeof authority !== "string" || typeof rkey !== "string") {
    throw new Error("Invalid parameters");
  }

  const { data, error, status } = usePostThread(
    decodeURIComponent(authority),
    rkey,
  );

  useEffect(() => {
    if (status === "success") {
      const element = document.getElementById(rkey);
      const scrollContainer = document.getElementById("root");
      if (element && scrollContainer) {
        const headerHeight = 60;
        const top =
          element.getBoundingClientRect().top +
          scrollContainer.scrollTop -
          headerHeight;
        scrollContainer.scrollTo({
          top: top,
        });
      } else {
        console.warn(`Element with id ${rkey} not found`);
      }
    }
  }, [status, rkey]);

  return status === "pending" ? (
    <LoadingFallback />
  ) : status === "error" ? (
    <ErrorBoundaryPage error={error} />
  ) : (
    <>
      <FeedThread thread={data.thread} />
    </>
  );
}
