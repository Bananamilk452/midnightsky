"use client";

import React from "react";

import { ErrorBoundaryPage } from "@/components/ErrorBoundaryPage";
import { Feed } from "@/components/feed";
import { HomeHeader } from "@/components/home/HomeHeader";
import { InfiniteScrollTrigger } from "@/components/InfiniteScrollTrigger";
import { LoadingFallback } from "@/components/LoadingFallback";
import { useTimeline } from "@/lib/hooks/useBluesky";
import { createFeedKey } from "@/lib/utils";

type TimelineData = NonNullable<ReturnType<typeof useTimeline>["data"]>;
const FeedList = React.memo(({ timeline }: { timeline: TimelineData }) => (
  <>
    {timeline.pages.map((group, i) => (
      <React.Fragment key={i}>
        {group.feed.map((feed) => (
          <Feed key={createFeedKey(feed)} feed={feed} />
        ))}
      </React.Fragment>
    ))}
  </>
));
FeedList.displayName = "FeedList";

export default function Home() {
  const {
    data: timeline,
    error: timelineError,
    fetchNextPage,
    hasNextPage,
    isFetching,
    status,
    refetch,
  } = useTimeline({
    limit: 30,
  });

  if (status === "pending") {
    return (
      <>
        <HomeHeader />
        <LoadingFallback />
      </>
    );
  }

  if (status === "error") {
    return (
      <>
        <HomeHeader />
        <ErrorBoundaryPage error={timelineError} onReset={refetch} />
      </>
    );
  }

  return (
    <>
      <HomeHeader />

      <FeedList timeline={timeline} />

      <InfiniteScrollTrigger
        onTrigger={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetching={isFetching}
      />
    </>
  );
}
