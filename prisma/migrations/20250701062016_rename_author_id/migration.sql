/*
  Warnings:

  - You are about to drop the column `authorId` on the `posts` table. All the data in the column will be lost.
  - Added the required column `authorDid` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "posts" DROP COLUMN "authorId",
ADD COLUMN     "authorDid" TEXT NOT NULL;
