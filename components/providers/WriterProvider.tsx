"use client";

import { ReplyRef } from "@atproto/api/dist/client/types/app/bsky/feed/post";
import { ListRule } from "@atproto/api/dist/client/types/app/bsky/feed/threadgate";
import React, { createContext, ReactNode, useContext } from "react";

import { Writer } from "@/components/Writer";

export interface OpenWriterParams {
  reply?: ReplyRef;
  hideTypeSelect: boolean;
  listRule?: ListRule;
}

interface WriterContextType {
  openWriter: (params?: OpenWriterParams) => void;
}

const WriterContext = createContext<WriterContextType | undefined>(undefined);

interface WriterProviderProps {
  children: ReactNode;
}

export const WriterProvider: React.FC<WriterProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [reply, setReply] = React.useState<ReplyRef>();
  const [hideTypeSelect, setHideTypeSelect] = React.useState<boolean>(false);
  const [listRule, setListRule] = React.useState<ListRule | undefined>();

  const openWriter = (params?: OpenWriterParams) => {
    if (params) {
      setReply(params.reply);
      setHideTypeSelect(params.hideTypeSelect);
      setListRule(params.listRule);
    } else {
      setReply(undefined);
      setHideTypeSelect(false);
      setListRule(undefined);
    }
    setIsOpen(true);
  };

  return (
    <WriterContext.Provider value={{ openWriter }}>
      {children}
      <Writer
        open={isOpen}
        setOpen={setIsOpen}
        reply={reply}
        hideTypeSelect={hideTypeSelect}
        listRule={listRule}
      />
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
