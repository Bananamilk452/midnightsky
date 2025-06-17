import { $Typed } from "@atproto/api";
import {
  FeedViewPost,
  ReasonRepost,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import Image from "next/image";

import { Feed } from "@/components/timeline/Feed";
import { getAgent } from "@/lib/bluesky/action";
import getSession from "@/lib/session";

export default async function Home() {
  const session = await getSession();
  if (!session.user || !session.user.did) {
    throw new Error("User is not authenticated or did is missing");
  }
  const agent = await getAgent(session.user.did);

  const user = session.user;
  const timeline = await agent.getTimeline({
    limit: 30,
    algorithm: "reverse-chronological",
  });

  function createFeedKey(post: FeedViewPost) {
    let key = post.post.uri;

    if (
      post.reason &&
      post.reason.$type === "app.bsky.feed.defs#reasonRepost"
    ) {
      key += `-${(post.reason as $Typed<ReasonRepost>).uri}`;
    }

    return key;
  }

  console.log("Timeline Data:", timeline);
  return (
    <div>
      <div>
        <h2>Welcome, {user.displayName || user.handle}!</h2>
        <p>Your handle: {user.handle}</p>
        <Image
          unoptimized
          src={user.avatar || "/default-avatar.png"}
          alt="Avatar"
          width={50}
          height={50}
        />
      </div>

      <div className="w-2/5">
        {timeline.data.feed.map((feed) => (
          <Feed key={createFeedKey(feed)} feed={{ ...feed }} />
        ))}
      </div>
    </div>
  );
}
