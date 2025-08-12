"use client";

import { CircleUserRoundIcon, HomeIcon, LogOutIcon } from "lucide-react";
import Link from "next/link";

import { Avatar } from "@/components/primitive/Avatar";
import { Spinner } from "@/components/Spinner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { signOut } from "@/lib/bluesky/action";
import { useSession } from "@/lib/hooks/useBluesky";

export function HomeSidebar() {
  const { data: user } = useSession();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          {!user ? (
            <Spinner className="size-6 p-4" />
          ) : (
            <div className="flex flex-col items-start p-4 pb-0">
              <Avatar
                className="size-11"
                src={user.avatar}
                alt={user.displayName || user.handle}
              />
              <h2 className="mt-2 w-full overflow-hidden text-ellipsis font-semibold">
                {user.displayName || user.handle}
              </h2>
              <h3 className="w-full overflow-hidden text-ellipsis text-sm text-gray-400">
                @{user.handle}
              </h3>
            </div>
          )}
        </SidebarGroup>
        <div className="pl-4 pr-6">
          <SidebarSeparator />
        </div>
        <SidebarGroup className="p-4 pt-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-12">
                <Link href="/home">
                  <HomeIcon className="!size-6" />
                  <span className="text-lg font-semibold">홈</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild className="h-12">
                <Link href={user ? `/profile/${user.handle}` : ""}>
                  <CircleUserRoundIcon className="!size-6" />
                  <span className="text-lg font-semibold">프로필</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton className="h-12" onClick={signOut}>
                <LogOutIcon className="!size-6" />
                <span className="text-lg font-semibold">로그아웃</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
