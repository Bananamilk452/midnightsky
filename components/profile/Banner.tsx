import { AppBskyRichtextFacet, RichText } from "@atproto/api";
import { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import Link from "next/link";

import BackButton from "@/components/BackButton";
import { Avatar } from "@/components/primitive/Avatar";
import { formatNumber } from "@/lib/utils";

type ProfileData = ProfileViewDetailed & {
  facets?: AppBskyRichtextFacet.Main[];
};

export function ProfileBanner({ profile }: { profile: ProfileData }) {
  return (
    <div>
      <div className="relative">
        <BackButton buttonClassName="absolute left-3 top-3 hover:cursor-pointer" />
        {profile.banner ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.banner}
              alt={`${profile.displayName}의 배너`}
              className="h-[150px] w-full object-cover"
            />
          </>
        ) : (
          <div className="h-[150px] bg-black/20" />
        )}
      </div>

      <div className="relative bg-black/40 px-4 py-3">
        <ProfileAvatar profile={profile} />
        <div className="h-[30px]" />
        <h1 className="text-[30px] font-bold">
          {profile.displayName ?? profile.handle}
        </h1>
        <h2 className="leading-tight text-gray-400">@{profile.handle}</h2>
        <ProfileCounts profile={profile} />
        <ProfileBio profile={profile} />
      </div>
    </div>
  );
}

function ProfileAvatar({ profile }: { profile: ProfileData }) {
  return (
    <Avatar
      src={profile.avatar}
      className="absolute top-0 -ml-1 size-[90px] -translate-y-1/2 border-2 border-gray-900"
    />
  );
}

function ProfileCounts({ profile }: { profile: ProfileData }) {
  return (
    <dl className="mt-2 flex items-center gap-2">
      <div className="flex items-center gap-1">
        <dt className="font-semibold">
          {formatNumber(profile.followersCount ?? 0)}
        </dt>
        <dd className="text-gray-400">팔로워</dd>
      </div>

      <div className="flex items-center gap-1">
        <dt className="font-semibold">
          {formatNumber(profile.followsCount ?? 0)}
        </dt>
        <dd className="text-gray-400">팔로우 중</dd>
      </div>

      <div className="flex items-center gap-1">
        <dt className="font-semibold">
          {formatNumber(profile.postsCount ?? 0)}
        </dt>
        <dd className="text-gray-400">게시물</dd>
      </div>
    </dl>
  );
}

function ProfileBio({ profile }: { profile: ProfileData }) {
  const rt = new RichText({
    text: profile.description ?? "",
    facets: profile.facets,
  });

  const content = [];

  for (const segment of rt.segments()) {
    if (segment.isLink()) {
      content.push(
        <Link
          onClick={(e) => e.stopPropagation()}
          href={segment.link!.uri}
          target="_blank"
          className="text-blue-500 hover:underline"
        >
          {segment.text}
        </Link>,
      );
    } else if (segment.isMention()) {
      content.push(
        <Link
          onClick={(e) => e.stopPropagation()}
          href={`/profile/${segment.mention!.did}`}
          className="text-blue-500 hover:underline"
        >
          {segment.text}
        </Link>,
      );
    } else if (segment.isTag()) {
      content.push(
        <span
          onClick={(e) => e.stopPropagation()}
          className="text-blue-500 hover:underline"
        >
          {segment.text}
        </span>,
      );
    } else {
      content.push(segment.text);
    }
  }

  return (
    <p className="mt-2 whitespace-pre-wrap">
      <>{...content}</>
    </p>
  );
}
