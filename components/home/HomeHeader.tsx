"use client";

import { MenuIcon } from "lucide-react";
import Image from "next/image";

import { Header } from "@/components/Header";
import { useSidebar } from "@/components/ui/sidebar";

export function HomeHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <Header>
      <div className="relative flex w-full items-center justify-center">
        <button
          onClick={toggleSidebar}
          className="sidebar:hidden absolute left-1 block p-1 hover:cursor-pointer"
        >
          <MenuIcon />
        </button>
        <Image
          width={32}
          height={32}
          src="/images/logo.png"
          className="size-8"
          alt="MidnightSky Logo"
          priority
        />
      </div>
    </Header>
  );
}
