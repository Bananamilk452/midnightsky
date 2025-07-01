/*
  Warnings:

  - You are about to drop the `posts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "posts";

-- CreateTable
CREATE TABLE "public_posts" (
    "id" TEXT NOT NULL,
    "blueskyContent" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorDid" TEXT NOT NULL,
    "rkey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "public_posts_pkey" PRIMARY KEY ("id")
);
