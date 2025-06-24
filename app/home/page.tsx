"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { HomeContent } from "@/components/home/HomeContent";
import { Spinner } from "@/components/Spinner";

import Error from "./error";

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="size-6" />
    </div>
  );
}

export default function Home() {
  return (
    <ErrorBoundary FallbackComponent={Error}>
      <Suspense fallback={<LoadingFallback />}>
        <HomeContent />
      </Suspense>
    </ErrorBoundary>
  );
}
