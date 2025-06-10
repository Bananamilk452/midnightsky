-- CreateTable
CREATE TABLE "auth_states" (
    "key" TEXT NOT NULL,
    "state" TEXT NOT NULL,

    CONSTRAINT "auth_states_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "key" TEXT NOT NULL,
    "session" TEXT NOT NULL,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("key")
);
