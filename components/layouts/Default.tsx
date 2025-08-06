import React from "react";

import { WriterButton } from "@/components/home/WriterButton";
import { WriterProvider } from "@/components/providers/WriterProvider";

export function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="root" className="h-dvh w-dvw overflow-auto">
      <div className="relative mx-auto min-h-full max-w-[600px] bg-black/50">
        <WriterProvider>
          {children}
          <WriterButton />
        </WriterProvider>
      </div>
    </div>
  );
}
