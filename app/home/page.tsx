"use client";

import React, { useEffect, useRef } from "react";
import { useIntersectionObserver } from "usehooks-ts";

import { ErrorBoundaryPage } from "@/components/ErrorBoundaryPage";
import { Feed } from "@/components/feed";
import { Header } from "@/components/Header";
import { LoadingFallback } from "@/components/LoadingFallback";
import { Avatar } from "@/components/primitive/Avatar";
import { Spinner } from "@/components/Spinner";
import { User } from "@/lib/bluesky/utils";
import { useSession, useTimeline } from "@/lib/hooks/useBluesky";
import { createFeedKey } from "@/lib/utils";

const InfiniteScrollTrigger = ({
  onTrigger,
  hasNextPage,
  isFetching,
}: {
  onTrigger: () => void;
  hasNextPage: boolean;
  isFetching: boolean;
}) => {
  const scrollContainer = useRef<HTMLElement | null>(null);
  const lockRef = useRef(false);

  useEffect(() => {
    scrollContainer.current = document.getElementById("root");
  }, []);

  const { isIntersecting, ref } = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: "1500px",
    root: scrollContainer.current,
  });

  useEffect(() => {
    // 트리거가 화면 밖으로 나가면 잠금을 해제하여 다음 감지를 준비합니다.
    if (!isIntersecting) {
      lockRef.current = false;
      return;
    }

    // isIntersecting이 true일 때, 잠겨있지 않은 경우에만 onTrigger를 호출합니다.
    if (hasNextPage && !isFetching && !lockRef.current) {
      // 호출 직후 바로 잠급니다.
      lockRef.current = true;
      onTrigger();
    }
  }, [isIntersecting, onTrigger, hasNextPage, isFetching]);

  return (
    <>
      <div ref={ref} className="flex h-10 items-center justify-center p-4">
        {isFetching && <Spinner className="size-6" />}
      </div>
    </>
  );
};
InfiniteScrollTrigger.displayName = "InfiniteScrollTrigger";

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

const TimelineHeader = React.memo(({ user }: { user: User | undefined }) => (
  <Header>
    {!user ? (
      <Spinner className="size-6" />
    ) : (
      <Avatar src={user.avatar} alt={user.displayName || user.handle} />
    )}
  </Header>
));
TimelineHeader.displayName = "TimelineHeader";

export default function Home() {
  const { data: user } = useSession();
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
    return <LoadingFallback />;
  }

  if (status === "error") {
    return <ErrorBoundaryPage error={timelineError} onReset={refetch} />;
  }

  return (
    <>
      <TimelineHeader user={user} />

      <FeedList timeline={timeline} />

      <InfiniteScrollTrigger
        onTrigger={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetching={isFetching}
      />
    </>
  );
}
