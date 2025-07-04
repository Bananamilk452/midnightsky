"use client";

import React, { useEffect, useRef } from "react";
import { useIntersectionObserver } from "usehooks-ts";

import { Feed } from "@/components/feed";
import { Header } from "@/components/Header";
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
      <Header>
        {!user ? (
          <Spinner className="size-6" />
        ) : (
          <Avatar src={user.avatar} alt={user.displayName || user.handle} />
        )}
      </Header>

      <div ref={timelineRef}>
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
