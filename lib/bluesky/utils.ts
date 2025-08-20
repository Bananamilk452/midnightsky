import { AppBskyActorDefs, AppBskyFeedPost, RichText } from "@atproto/api";
import {
  isRecord as isThreadgateRecord,
  Record as ThreadgateRecord,
  validateRecord as validateThreadgateRecord,
} from "@atproto/api/dist/client/types/app/bsky/feed/threadgate";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

import { getAgent } from "@/lib/bluesky/action";
import { getSession } from "@/lib/session";

export type User = {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
  description?: string;
  banner?: string;
};

export function createUser(data: AppBskyActorDefs.ProfileViewDetailed) {
  return {
    did: data.did,
    handle: data.handle,
    displayName: data.displayName,
    avatar: data.avatar,
    description: data.description,
    banner: data.banner,
  };
}

export function validateRecord(data: unknown) {
  if (AppBskyFeedPost.isRecord(data)) {
    return data as AppBskyFeedPost.Record;
    // 아래 코드는 validateRecord 함수가 데이터를 Server Action이 아닌
    // API Route로 데이터를 받으면 자꾸 터져서 주석 처리했습니다.
    // const res = AppBskyFeedPost.validateRecord(data);
    // if (res.success) {
    //   return res.value;
    // } else {
    //   console.error("Invalid post record:", res.error);
    // }
  }
}

export function getRelativeTimeBasic(postDate: Date | string): string {
  const date = typeof postDate === "string" ? new Date(postDate) : postDate;

  return formatDistanceToNow(date, {
    locale: ko,
  });
}

function utf16IndexToUtf8Index(content: string, i: number) {
  const encoder = new TextEncoder();
  return encoder.encode(content.slice(0, i)).byteLength;
}

export function addReadArticleFacets(rt: RichText, link: string) {
  const text = "글 보기";

  if (rt.text.length === 0) {
    rt.insert(0, text);
  } else {
    rt.insert(utf16IndexToUtf8Index(rt.text, rt.text.length), `\n\n${text}`);
  }

  if (!rt.facets) {
    rt.facets = [];
  }

  rt.facets.push({
    index: {
      byteStart: utf16IndexToUtf8Index(rt.text, rt.text.length - text.length),
      byteEnd: utf16IndexToUtf8Index(rt.text, rt.text.length),
    },
    features: [
      {
        $type: "app.bsky.richtext.facet#link",
        uri: link,
      },
    ],
  });

  return rt;
}

export async function createRecord({
  collection,
  cid,
  uri,
}: {
  collection: string;
  cid: string;
  uri: string;
}) {
  const session = await getSession();
  const agent = await getAgent(session.user.did);

  return await agent.com.atproto.repo.createRecord({
    collection,
    record: {
      $type: collection,
      createdAt: new Date().toISOString(),
      subject: {
        cid,
        uri,
      },
    },
    repo: session.user.did,
  });
}

export async function deleteRecord({
  collection,
  rkey,
}: {
  collection: string;
  rkey: string;
}) {
  const session = await getSession();
  const agent = await getAgent(session.user.did);

  return await agent.com.atproto.repo.deleteRecord({
    collection,
    repo: session.user.did,
    rkey,
  });
}

export function getValidThreadgateRecord(
  record: unknown,
): ThreadgateRecord | undefined {
  if (isThreadgateRecord(record) && validateThreadgateRecord(record)) {
    return record as ThreadgateRecord;
  }
  return undefined;
}
