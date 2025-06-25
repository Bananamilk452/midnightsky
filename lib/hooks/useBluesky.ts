import { OutputSchema as TimelineData } from "@atproto/api/dist/client/types/app/bsky/feed/getTimeline";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { User } from "@/lib/bluesky/utils";

async function fetchSession(): Promise<User> {
  const response = await fetch("/api/session");
  if (!response.ok) {
    throw new Error("Failed to fetch session data");
  }
  return response.json();
}

async function fetchTimeline(
  limit: number = 30,
  cursor?: string,
): Promise<TimelineData> {
  const seachParams = new URLSearchParams();
  seachParams.set("limit", limit.toString());
  if (cursor) {
    seachParams.set("cursor", cursor);
  }

  const response = await fetch(`/api/timeline?${seachParams.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch timeline data");
  }
  return response.json();
}

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
  });
}

export function useTimeline({
  limit = 30,
  cursor,
}: {
  limit?: number;
  cursor?: string;
}) {
  return useInfiniteQuery({
    queryKey: ["timeline", limit, cursor],
    queryFn: async ({ pageParam }) => {
      const { limit, cursor } = pageParam || {};
      return fetchTimeline(limit, cursor);
    },
    initialPageParam: { limit, cursor },
    getNextPageParam: (lastPage) => ({
      limit,
      cursor: lastPage.cursor,
    }),
  });
}
