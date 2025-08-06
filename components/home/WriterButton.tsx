"use client";

import { SquarePenIcon } from "lucide-react";

import { useWriter } from "@/components/providers/WriterProvider";

export function WriterButton() {
  const { openWriter } = useWriter();

  return (
    <div
      className="fixed bottom-4 right-4 cursor-pointer rounded-full bg-indigo-700 p-4 shadow-lg hover:bg-indigo-800"
      onClick={() => openWriter()}
    >
      <SquarePenIcon className="size-6 text-white" />
    </div>
  );
}
