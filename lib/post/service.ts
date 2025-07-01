import { CreatePostParams } from "@/lib/bluesky/types";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function createPostRecord(rkey: string, params: CreatePostParams) {
  const session = await getSession();

  const { content, blueskyContent, type } = params;

  const post = await prisma.post.create({
    data: {
      content,
      blueskyContent,
      type,
      authorDid: session.user.did,
      rkey,
    },
  });

  return post;
}
