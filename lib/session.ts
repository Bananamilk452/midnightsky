"use server";

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

import { User } from "@/lib/bluesky/utils";
import { ApiError } from "@/lib/utils.server";

import type { IronSession } from "iron-session";

export type Session = {
  user: User | null;
};

export async function getOptionalSession(): Promise<IronSession<Session>> {
  const cookieStore = await cookies();
  return await getIronSession<Session>(cookieStore, {
    cookieName: "sid",
    password: process.env.COOKIE_PASSWORD as string,
  });
}

export async function getSession() {
  const session = await getOptionalSession();
  if (!session.user || !session.user.did) {
    throw new ApiError("User is not authenticated or did is missing", 401);
  }
  return session as IronSession<{ user: User }>;
}
