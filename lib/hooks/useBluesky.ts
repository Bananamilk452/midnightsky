import { OutputSchema as PostThreadData } from "@atproto/api/dist/client/types/app/bsky/feed/getPostThread";
import { OutputSchema as TimelineData } from "@atproto/api/dist/client/types/app/bsky/feed/getTimeline";
import { Response as ApplyWritesResponse } from "@atproto/api/dist/client/types/com/atproto/repo/applyWrites";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

import { User } from "@/lib/bluesky/utils";

import { CreatePostParams } from "../bluesky/types";
import { PublicPost } from "../generated/prisma";

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

async function fetchPostThread(
  authority: string,
  rkey: string,
): Promise<PostThreadData> {
  const response = await fetch(`/api/post/${authority}/${rkey}`);
  if (!response.ok) {
    throw new Error("Failed to fetch post thread");
  }
  return response.json();
}

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
  });
}

async function createPost(params: CreatePostParams) {
  const response = await fetch("/api/post", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error("Failed to create post");
  }
  return response.json() as Promise<{
    post: PublicPost;
    blueskyPost: ApplyWritesResponse;
  }>;
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

export function usePostThread(authority: string, rkey: string) {
  return useQuery({
    queryKey: ["postThread", authority, rkey],
    queryFn: () => fetchPostThread(authority, rkey),
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
