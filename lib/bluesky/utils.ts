import { AppBskyActorDefs, AppBskyFeedPost } from "@atproto/api";

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
    const res = AppBskyFeedPost.validateRecord(data);
    if (res.success) {
      return res.value;
    }
  }
}
