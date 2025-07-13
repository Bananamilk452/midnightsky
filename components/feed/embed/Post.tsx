import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { ErrorBoundaryPage } from "@/components/ErrorBoundaryPage";
import { LoadingFallback } from "@/components/LoadingFallback";
import { PrivatePost } from "@/components/post/PrivatePost";
import { PublicPost } from "@/components/post/PublicPost";
import * as Post from "@/lib/lexicon/types/app/midnightsky/post";

function PostContent({ content }: { content: Post.Record }) {
  if (content.type === "public") {
    return <PublicPost post={content} />;
  } else if (content.type === "private") {
    return <PrivatePost post={content} />;
  } else {
    return null;
  }
}

export function FeedPost({ content }: { content: Post.Record }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          fallbackRender={({ error, resetErrorBoundary }) => (
            <ErrorBoundaryPage error={error} onReset={resetErrorBoundary} />
          )}
          onReset={reset}
        >
          <Suspense fallback={<LoadingFallback />}>
            <PostContent content={content} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
