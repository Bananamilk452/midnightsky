import { CreatePostParams } from "@/lib/bluesky/types";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { encryptData } from "@/lib/utils.server";

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

export async function createPrivatePostRecord(
  rkey: string,
  params: CreatePostParams,
) {
  const session = await getSession();

  const { content, blueskyContent } = params;

  const encryptedData = encryptData(content);

  const post = await prisma.privatePost.create({
    data: {
      encryptedContent: encryptedData.data,
      iv: encryptedData.iv,
      blueskyContent,
      authorDid: session.user.did,
      rkey,
    },
  });

  return post;
}
