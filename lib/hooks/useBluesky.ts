import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";

import {
  createBookmark,
  createPost,
  deleteBookmark,
  deletePost,
  getAuthorFeed,
  getBookmarks,
  getListPost,
  getMyLists,
  getPostThread,
  getPrivatePost,
  getProfile,
  getPublicPost,
  getTimeline,
  likePost,
  repostPost,
  signInWithBluesky,
  unlikePost,
  unrepostPost,
} from "@/lib/bluesky/action";
import { getSession } from "@/lib/session";
import { serverActionErrorHandler } from "@/lib/utils";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: getSession,
    select: (session) => session.user,
  });
}

export function useSignIn() {
  return useMutation({
    mutationFn: ({
      handle,
      redirectTo,
    }: {
      handle: string;
      redirectTo: string;
    }) => serverActionErrorHandler(signInWithBluesky)(handle, redirectTo),
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
      return serverActionErrorHandler(getTimeline)(limit, cursor);
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
      return serverActionErrorHandler(getAuthorFeed)(pageParam);
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
    queryFn: () => serverActionErrorHandler(getPostThread)(authority, rkey),
  });
}

export function useMyLists() {
  return useQuery({
    queryKey: ["lists"],
    queryFn: async () => serverActionErrorHandler(getMyLists)(),
  });
}

export function useCreatePost() {
  return useMutation({
    mutationFn: serverActionErrorHandler(createPost),
    onError: (error) => {
      console.error("Error creating post:", error);
    },
  });
}

export function usePublicPost(id: string) {
  return useSuspenseQuery({
    queryKey: ["publicPost", id],
    queryFn: () => serverActionErrorHandler(getPublicPost)(id),
  });
}

export function usePrivatePost(id: string) {
  return useSuspenseQuery({
    queryKey: ["privatePost", id],
    queryFn: () => serverActionErrorHandler(getPrivatePost)(id),
  });
}

export function useListPost(id: string) {
  return useSuspenseQuery({
    queryKey: ["listPost", id],
    queryFn: () => serverActionErrorHandler(getListPost)(id),
  });
}

export function useProfile(actor: string) {
  return useQuery({
    queryKey: ["profile", actor],
    queryFn: () => serverActionErrorHandler(getProfile)(actor),
  });
}

export function useRepost() {
  return useMutation({
    mutationFn: serverActionErrorHandler(repostPost),
  });
}

export function useUnrepost() {
  return useMutation({
    mutationFn: serverActionErrorHandler(unrepostPost),
  });
}

export function useLike() {
  return useMutation({
    mutationFn: serverActionErrorHandler(likePost),
  });
}

export function useUnlike() {
  return useMutation({
    mutationFn: serverActionErrorHandler(unlikePost),
  });
}

export function useDeletePost() {
  return useMutation({
    mutationFn: serverActionErrorHandler(deletePost),
  });
}

export function useCreateBookmark() {
  return useMutation({
    mutationFn: serverActionErrorHandler(createBookmark),
  });
}

export function useDeleteBookmark() {
  return useMutation({
    mutationFn: serverActionErrorHandler(deleteBookmark),
  });
}

export function useBookmarks({
  limit = 30,
  cursor,
}: {
  limit?: number;
  cursor?: string;
}) {
  return useInfiniteQuery({
    queryKey: ["bookmarks", limit, cursor],
    queryFn: async ({ pageParam }) => {
      const { limit, cursor } = pageParam || {};
      return serverActionErrorHandler(getBookmarks)(limit, cursor);
    },
    initialPageParam: { limit, cursor },
    getNextPageParam: (lastPage) => ({
      limit,
      cursor: lastPage.cursor,
    }),
  });
}
