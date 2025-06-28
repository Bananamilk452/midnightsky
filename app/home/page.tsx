"use client";

import React, { useEffect, useRef } from "react";
import { useIntersectionObserver } from "usehooks-ts";

import { Feed } from "@/components/feed";
import { LoadingFallback } from "@/components/LoadingFallback";
import { Avatar } from "@/components/primitive/Avatar";
import { Spinner } from "@/components/Spinner";
import { useSession, useTimeline } from "@/lib/hooks/useBluesky";
import { createFeedKey } from "@/lib/utils";

export default function Home() {
  const { data: user } = useSession();
  const {
    data: timeline,
    error: timelineError,
    fetchNextPage,
    hasNextPage,
    isFetching,
    status,
  } = useTimeline({
    limit: 30,
  });

  const timelineRef = useRef<HTMLDivElement>(null);
  const { isIntersecting, ref } = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: "1500px",
    root: timelineRef.current,
  });

  useEffect(() => {
    if (hasNextPage && isIntersecting) {
      fetchNextPage();
    }
  }, [isIntersecting, fetchNextPage, hasNextPage]);

  return status === "pending" ? (
    <LoadingFallback />
  ) : status === "error" ? (
    <p>에러: {timelineError.message}</p>
  ) : (
    <>
      <div className="sticky top-0 z-10 flex w-full items-center justify-start bg-black/30 p-4 backdrop-blur-sm">
        {!user ? (
          <Spinner className="size-6" />
        ) : (
          <Avatar src={user.avatar} alt={user.displayName || user.handle} />
        )}
      </div>

      <div ref={timelineRef} className="bg-black/50">
        {timeline.pages.map((group, i) => (
          <React.Fragment key={i}>
            {group.feed.map((feed) => (
              <Feed key={createFeedKey(feed)} feed={{ ...feed }} />
            ))}
          </React.Fragment>
        ))}
        {/* Intersection Observer Trigger */}
        <div ref={ref} className="h-1"></div>
        {isFetching && (
          <div className="flex items-center justify-center p-4">
            <Spinner className="size-6" />
          </div>
        )}
      </div>
    </>
  );
}
