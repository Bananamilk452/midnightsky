import {
  FeedViewPost,
  isReasonRepost,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";

import { Feed } from "@/components/feed";
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

    if (isReasonRepost(post.reason)) {
      key += `-${post.reason.uri}`;
    }

    return key;
  }

  return (
    <div>
      <div>
        <h2>Welcome, {user.displayName || user.handle}!</h2>
        <p>Your handle: {user.handle}</p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.avatar || "/default-avatar.png"}
          alt="Avatar"
          width={50}
          height={50}
        />
      </div>

      <div className="mx-auto w-2/5 bg-black/50">
        {timeline.data.feed.map((feed) => (
          <Feed key={createFeedKey(feed)} feed={{ ...feed }} />
        ))}
      </div>
    </div>
  );
}
