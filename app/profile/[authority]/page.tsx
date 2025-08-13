"use client";

import { useParams } from "next/navigation";
import React from "react";

import { ErrorBoundaryPage } from "@/components/ErrorBoundaryPage";
import { Feed } from "@/components/feed";
import { InfiniteScrollTrigger } from "@/components/InfiniteScrollTrigger";
import { LoadingFallback } from "@/components/LoadingFallback";
import { ProfileBanner } from "@/components/profile/Banner";
import { useAuthorFeed, useProfile } from "@/lib/hooks/useBluesky";
import { createFeedKey } from "@/lib/utils";

type FeedData = NonNullable<ReturnType<typeof useAuthorFeed>["data"]>;
const FeedList = React.memo(({ feeds }: { feeds: FeedData }) => (
  <>
    {feeds.pages.map((group, i) => (
      <React.Fragment key={i}>
        {group.feed.map((feed) => (
          <Feed key={createFeedKey(feed)} feed={feed} />
        ))}
      </React.Fragment>
    ))}
  </>
));
FeedList.displayName = "FeedList";

export default function Page() {
  const { authority } = useParams();

  if (typeof authority !== "string") {
    throw new Error("Invalid parameters");
  }

  const at = decodeURIComponent(authority);
  const { data, error, status, refetch } = useProfile(at);

  const {
    data: authorFeed,
    error: authorFeedError,
    fetchNextPage,
    hasNextPage,
    isFetching,
    status: authorFeedStatus,
    refetch: authorFeedRefetch,
  } = useAuthorFeed({
    actor: at,
    limit: 30,
  });

  return status === "pending" && authorFeedStatus === "pending" ? (
    <LoadingFallback />
  ) : (
    <>
      {status === "pending" ? (
        <LoadingFallback />
      ) : status === "error" ? (
        <div>
          <ErrorBoundaryPage error={error} onReset={refetch} />
        </div>
      ) : (
        <>
          <ProfileBanner profile={data} />
          <hr />
        </>
      )}

      {authorFeedStatus === "pending" ? (
        <LoadingFallback />
      ) : authorFeedStatus === "error" ? (
        <div>
          <ErrorBoundaryPage
            error={authorFeedError}
            onReset={authorFeedRefetch}
          />
        </div>
      ) : (
        <>
          <FeedList feeds={authorFeed} />
          <InfiniteScrollTrigger
            onTrigger={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetching={isFetching}
          />
        </>
      )}
    </>
  );
}
