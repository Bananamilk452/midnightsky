import { CreatePostParams } from "@/lib/bluesky/types";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function createPublicPostRecord(
  rkey: string,
  params: CreatePostParams,
) {
  const session = await getSession();

  const { content, blueskyContent } = params;

  const post = await prisma.publicPost.create({
    data: {
      content,
      blueskyContent,
      authorDid: session.user.did,
      rkey,
    },
  });

  return post;
}
