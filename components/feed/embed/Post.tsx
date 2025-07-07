import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { ErrorBoundaryPage } from "@/components/ErrorBoundaryPage";
import { LoadingFallback } from "@/components/LoadingFallback";
import { PublicPost } from "@/components/post/PublicPost";
import * as Post from "@/lib/lexicon/types/app/midnightsky/post";

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
            {content.type === "public" ? <PublicPost post={content} /> : <></>}
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
