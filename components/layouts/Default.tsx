"use client";

import React, { useState } from "react";

import { WriterButton } from "@/components/home/WriterButton";
import { Writer } from "@/components/Writer";

export function DefaultLayout({ children }: { children: React.ReactNode }) {
  const [isWriterOpen, setIsWriterOpen] = useState(false);

  return (
    <div id="root" className="h-dvh w-dvw overflow-auto">
      <div className="relative mx-auto min-h-full max-w-[600px] bg-black/50">
        {children}
        <WriterButton onClick={() => setIsWriterOpen(true)} />
        <Writer open={isWriterOpen} setOpen={setIsWriterOpen} />
      </div>
    </div>
  );
}
