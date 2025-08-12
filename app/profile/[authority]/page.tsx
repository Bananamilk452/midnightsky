"use client";

import { useParams } from "next/navigation";

import { ErrorBoundaryPage } from "@/components/ErrorBoundaryPage";
import { LoadingFallback } from "@/components/LoadingFallback";
import { ProfileBanner } from "@/components/profile/Banner";
import { useProfile } from "@/lib/hooks/useBluesky";

export default function Page() {
  const { authority } = useParams();

  if (typeof authority !== "string") {
    throw new Error("Invalid parameters");
  }

  const { data, error, status } = useProfile(decodeURIComponent(authority));

  return status === "pending" ? (
    <LoadingFallback />
  ) : status === "error" ? (
    <ErrorBoundaryPage error={error} />
  ) : (
    <>
      <ProfileBanner profile={data} />
    </>
  );
}
