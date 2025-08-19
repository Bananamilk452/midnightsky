"use client";

import {
  CircleUserRoundIcon,
  HomeIcon,
  LogOutIcon,
  SquarePenIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Avatar } from "@/components/primitive/Avatar";
import { useWriter } from "@/components/providers/WriterProvider";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/bluesky/action";
import { User } from "@/lib/bluesky/utils";
import { useSessionSuspense } from "@/lib/hooks/useBluesky";
import { cn } from "@/lib/utils";

export function HomeSidemenuClient() {
  const router = useRouter();
  const pathname = usePathname();
  const { openWriter } = useWriter();

  const { data: user } = useSessionSuspense();

  return (
    <div
      className={cn(
        "fixed right-1/2 top-0 mr-0 translate-x-[-300px]",
        "hidden w-fit flex-col items-center gap-4 px-4 py-6",
        "sidemenu:flex lg:mr-6 lg:w-[200px] lg:items-start",
      )}
    >
      <SidemenuProfile user={user} />
      <div className="flex w-full flex-col items-center gap-2 lg:items-start">
        <SidemenuButton
          active={pathname === "/home"}
          onClick={() => router.push("/home")}
        >
          <HomeIcon className="size-6" />
          <span className="hidden lg:inline">홈</span>
        </SidemenuButton>
        <SidemenuButton
          active={
            pathname === `/profile/${user.handle}` ||
            pathname === `/profile/${user.did}`
          }
          onClick={() => router.push(`/profile/${user.handle}`)}
        >
          <CircleUserRoundIcon className="size-6" />
          <span className="hidden lg:inline">프로필</span>
        </SidemenuButton>
        <SidemenuButton active={false} onClick={signOut}>
          <LogOutIcon className="size-6" />
          <span className="hidden lg:inline">로그아웃</span>
        </SidemenuButton>

        <div className="ml-2 mt-12">
          <button
            className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-indigo-700 px-5 py-3 font-semibold shadow-lg hover:bg-indigo-800 lg:px-5"
            onClick={() => openWriter()}
          >
            <SquarePenIcon className="size-6 text-white" />
            <span className="hidden lg:inline">글 쓰기</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SidemenuProfile({ user }: { user: User }) {
  return (
    <div className="flex flex-col items-center px-0 lg:items-start lg:px-3">
      <Avatar
        className="size-11"
        src={user.avatar}
        alt={user.displayName || user.handle}
      />
      <h2 className="mt-2 hidden w-full overflow-hidden text-ellipsis text-sm font-semibold lg:block">
        {user.displayName || user.handle}
      </h2>
      <h3 className="hidden w-full overflow-hidden text-ellipsis text-xs text-gray-400 lg:block">
        @{user.handle}
      </h3>
    </div>
  );
}

function SidemenuButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "h-fit w-fit justify-start text-base hover:cursor-pointer lg:w-full",
        active && "font-bold",
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
