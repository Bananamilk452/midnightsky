import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";

import {
  createPost,
  getAuthorFeed,
  getListPost,
  getMyLists,
  getPostThread,
  getPrivatePost,
  getProfile,
  getPublicPost,
  getTimeline,
  signInWithBluesky,
} from "@/lib/bluesky/action";
import { getSession } from "@/lib/session";

import { serverActionErrorHandler } from "../utils";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: getSession,
    select: (session) => session.user,
  });
}

export function useSignIn() {
  return useMutation({
    mutationFn: serverActionErrorHandler(signInWithBluesky),
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

export function useAuthorFeed(params: {
  limit: number;
  cursor?: string;
  actor: string;
  filter?: string;
  includePins?: boolean;
}) {
  return useInfiniteQuery({
    queryKey: ["authorFeed", params.actor, params.limit, params.cursor],
    queryFn: async ({ pageParam }) => {
      return getAuthorFeed(pageParam);
    },
    initialPageParam: params,
    getNextPageParam: (lastPage) => ({
      ...params,
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

export function useMyLists() {
  return useQuery({
    queryKey: ["lists"],
    queryFn: async () => getMyLists(),
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

export function useListPost(id: string) {
  return useSuspenseQuery({
    queryKey: ["listPost", id],
    queryFn: () => getListPost(id),
  });
}

export function useProfile(actor: string) {
  return useQuery({
    queryKey: ["profile", actor],
    queryFn: () => getProfile(actor),
  });
}
