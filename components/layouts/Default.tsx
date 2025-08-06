import React from "react";

import { HomeSidebar } from "@/components/home/HomeSidebar";
import { HomeSidemenu } from "@/components/home/HomeSidemenu";
import { WriterButton } from "@/components/home/WriterButton";
import { WriterProvider } from "@/components/providers/WriterProvider";
import { SidebarProvider } from "@/components/ui/sidebar";

export function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="root" className="h-dvh w-dvw overflow-auto">
      <SidebarProvider defaultOpen={false}>
        <WriterProvider>
          <HomeSidemenu />
          <HomeSidebar />
          <div className="relative mx-auto min-h-full w-full max-w-[600px] bg-black/50">
            {children}
            <WriterButton />
          </div>
        </WriterProvider>
      </SidebarProvider>
    </div>
  );
}
