/*
  Warnings:

  - You are about to drop the column `encryptedcontent` on the `private_posts` table. All the data in the column will be lost.
  - Added the required column `encryptedContent` to the `private_posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "private_posts" DROP COLUMN "encryptedcontent",
ADD COLUMN     "encryptedContent" TEXT NOT NULL;
