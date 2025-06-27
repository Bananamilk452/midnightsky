"use client";

import React, { useState } from "react";

import { WriterButton } from "@/components/home/WriterButton";
import { Writer } from "@/components/Writer";

export function DefaultLayout({ children }: { children: React.ReactNode }) {
  const [isWriterOpen, setIsWriterOpen] = useState(false);

  return (
    <div className="h-dvh w-dvw overflow-auto">
      <div className="relative mx-auto max-w-[600px]">
        {children}
        <WriterButton onClick={() => setIsWriterOpen(true)} />
        <Writer open={isWriterOpen} setOpen={setIsWriterOpen} />
      </div>
    </div>
  );
}
