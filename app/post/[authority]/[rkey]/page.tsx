"use client";

import { useParams } from "next/navigation";

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
