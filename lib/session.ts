"use server";

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

import { User } from "@/lib/bluesky/utils";

import type { IronSession } from "iron-session";

export type Session = {
  user: User | null;
};

const getSession = async (): Promise<IronSession<Session>> => {
  const cookieStore = await cookies();
  return await getIronSession<Session>(cookieStore, {
    cookieName: "sid",
    password: process.env.COOKIE_PASSWORD as string,
  });
};

export default getSession;
