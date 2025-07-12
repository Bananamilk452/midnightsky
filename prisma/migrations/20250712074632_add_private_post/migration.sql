-- CreateTable
CREATE TABLE "private_posts" (
    "id" TEXT NOT NULL,
    "blueskyContent" TEXT NOT NULL,
    "encryptedcontent" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "authorDid" TEXT NOT NULL,
    "rkey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "private_posts_pkey" PRIMARY KEY ("id")
);
