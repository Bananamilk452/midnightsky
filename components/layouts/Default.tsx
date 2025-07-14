"use client";

import React from "react";

import { WriterButton } from "@/components/home/WriterButton";

import { useWriter, WriterProvider } from "../providers/WriterProvider";

export function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="root" className="h-dvh w-dvw overflow-auto">
      <div className="relative mx-auto min-h-full max-w-[600px] bg-black/50">
        <WriterProvider>
          {children}
          <WriterButtonWrapper />
        </WriterProvider>
      </div>
    </div>
  );
}

function WriterButtonWrapper() {
  const { openWriter } = useWriter();

  return (
    <>
      <WriterButton onClick={openWriter} />
    </>
  );
}
