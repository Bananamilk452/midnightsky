"use server";

import { blueskyClient } from "@/lib/bluesky";

export async function signInWithBluesky(handle: string) {
  const url = await blueskyClient.authorize(handle, {
    prompt: "none",
    state: JSON.stringify({
      handle,
    }),
  });

  return url.toString();
}

// export async function signOut(): Promise<void> {
//   const session = await getSession()

//   session.destroy()
// }
