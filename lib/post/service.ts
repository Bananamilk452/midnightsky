import { CreatePostParams } from "@/lib/bluesky/types";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ApiError, decryptData, encryptData } from "@/lib/utils.server";

export async function getPublicPostById(id: string) {
  await getSession();

  const post = await prisma.publicPost.findUnique({
    where: {
      id,
    },
  });

  if (!post) {
    throw new ApiError("Post not found", 404);
  }

  return post;
}

export async function getPrivatePostById(id: string) {
  await getSession();

  const post = await prisma.privatePost.findUnique({
    where: {
      id,
    },
  });

  if (!post) {
    throw new ApiError("Post not found", 404);
  }

  const content = decryptData(post.encryptedContent, post.iv);

  return {
    id,
    blueskyContent: post.blueskyContent,
    content,
    authorDid: post.authorDid,
    rkey: post.rkey,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

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
