import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";

import {
  createPost,
  getPostThread,
  getPrivatePost,
  getPublicPost,
  getTimeline,
} from "@/lib/bluesky/action";
import { getSession } from "@/lib/session";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: getSession,
    select: (session) => session.user,
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
      return getTimeline(limit, cursor);
    },
    initialPageParam: { limit, cursor },
    getNextPageParam: (lastPage) => ({
      limit,
      cursor: lastPage.cursor,
    }),
  });
}

export function usePostThread(authority: string, rkey: string) {
  return useQuery({
    queryKey: ["postThread", authority, rkey],
    queryFn: () => getPostThread(authority, rkey),
  });
}

export function useCreatePost() {
  return useMutation({
    mutationFn: createPost,
    onError: (error) => {
      console.error("Error creating post:", error);
    },
  });
}

export function usePublicPost(id: string) {
  return useSuspenseQuery({
    queryKey: ["publicPost", id],
    queryFn: () => getPublicPost(id),
  });
}

export function usePrivatePost(id: string) {
  return useSuspenseQuery({
    queryKey: ["privatePost", id],
    queryFn: () => getPrivatePost(id),
  });
}
