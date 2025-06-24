import { AppBskyActorDefs, AppBskyFeedPost } from "@atproto/api";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

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
