"use client";

import { isPostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import React from "react";

import { ErrorBoundaryPage } from "@/components/ErrorBoundaryPage";
import { FeedRecord } from "@/components/feed";
import { HomeHeader } from "@/components/home/HomeHeader";
import { InfiniteScrollTrigger } from "@/components/InfiniteScrollTrigger";
import { LoadingFallback } from "@/components/LoadingFallback";
import { useBookmarks } from "@/lib/hooks/useBluesky";

type BookmarkData = NonNullable<ReturnType<typeof useBookmarks>["data"]>;
const FeedList = React.memo(({ bookmarks }: { bookmarks: BookmarkData }) => (
  <>
    {bookmarks.pages.map((group, i) => (
      <React.Fragment key={i}>
        {group.bookmarks.map((bookmark) => {
          const feed = bookmark.item;
          if (isPostView(feed)) {
            return <FeedRecord key={feed.uri} post={feed} />;
          }
        })}
      </React.Fragment>
    ))}
  </>
));
FeedList.displayName = "FeedList";

export default function Home() {
  const {
    data: bookmarks,
    error: bookmarksError,
    fetchNextPage,
    hasNextPage,
    isFetching,
    status,
    refetch,
  } = useBookmarks({
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
        <ErrorBoundaryPage error={bookmarksError} onReset={refetch} />
      </>
    );
  }

  return (
    <>
      <FeedList bookmarks={bookmarks} />

      <InfiniteScrollTrigger
        onTrigger={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetching={isFetching}
      />
    </>
  );
}
