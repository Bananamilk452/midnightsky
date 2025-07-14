"use client";

import { ReplyRef } from "@atproto/api/dist/client/types/app/bsky/feed/post";
import React, { createContext, ReactNode, useContext } from "react";

import { Writer } from "@/components/Writer";

interface WriterContextType {
  openWriter: (reply?: ReplyRef) => void;
}

const WriterContext = createContext<WriterContextType | undefined>(undefined);

interface WriterProviderProps {
  children: ReactNode;
}

export const WriterProvider: React.FC<WriterProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [reply, setReply] = React.useState<ReplyRef>();

  const openWriter = (reply?: ReplyRef) => {
    setReply(reply);
    setIsOpen(true);
  };

  return (
    <WriterContext.Provider value={{ openWriter }}>
      {children}
      <Writer open={isOpen} setOpen={setIsOpen} reply={reply} />
    </WriterContext.Provider>
  );
};

export const useWriter = () => {
  const context = useContext(WriterContext);
  if (context === undefined) {
    throw new Error("useWriter must be used within a WriterProvider");
  }
  return context;
};
