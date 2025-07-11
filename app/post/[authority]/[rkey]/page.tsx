"use client";

import { ArrowLeftIcon } from "lucide-react";
import { useParams } from "next/navigation";

import { FeedThread } from "@/components/feed/thread";
import { Header } from "@/components/Header";
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
    <>
      <Header>
        <button>
          <ArrowLeftIcon className="size-6 cursor-pointer" />
        </button>
        <p className="ml-4 text-lg font-semibold">게시물</p>
      </Header>
      <FeedThread thread={data.thread} />
    </>
  );
}
