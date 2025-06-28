"use client";

import { useParams } from "next/navigation";

import { LoadingFallback } from "@/components/LoadingFallback";
import { usePostThread } from "@/lib/hooks/useBluesky";

export default function Page() {
  const { authority, rkey } = useParams();

  if (typeof authority !== "string" || typeof rkey !== "string") {
    throw new Error("Invalid parameters");
  }

  const { data, error, status } = usePostThread(authority, rkey);

  return status === "pending" ? (
    <LoadingFallback />
  ) : status === "error" ? (
    <p>에러: {error.message}</p>
  ) : (
    <pre>{JSON.stringify(data.thread, null, 2)}</pre>
  );
}
