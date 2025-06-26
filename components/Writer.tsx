"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useRef, useState } from "react";
import { Editor as TinyMCEEditor } from "tinymce";

import { Spinner } from "@/components/Spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function Writer({
  id = "main",
  open,
  setOpen,
}: {
  children?: React.ReactNode;
  id?: string;
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const editorRef = useRef<TinyMCEEditor>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  function handleModalClose(value: boolean) {
    if (editorRef.current) {
      if (value === false) {
        editorRef.current.plugins.autosave.storeDraft();
      }
    }

    setOpen(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="max-w-full p-4"
      >
        <DialogHeader>
          <DialogTitle>글 작성</DialogTitle>
          <DialogDescription className="sr-only">글 작성</DialogDescription>
        </DialogHeader>

        <div className={!isEditorReady ? "hidden" : ""}>
          <Editor
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            licenseKey="gpl"
            init={{
              height: 400,
              menubar: "edit insert format tools table",
              plugins: [
                "autosave",
                "autolink",
                "lists",
                "link",
                "image",
                "preview",
                "anchor",
                "searchreplace",
                "visualblocks",
                "fullscreen",
                "table",
                "code",
              ],
              toolbar:
                "undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
              content_style:
                "body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px }",
              branding: false,
              resize: false,
              elementpath: false,
              statusbar: false,
              autosave_interval: "10s",
              autosave_prefix: `editor-${id}-`,
              autosave_restore_when_empty: true,
              autosave_retention: "60m",
            }}
            onInit={(evt, editor) => {
              editorRef.current = editor;
              setIsEditorReady(true);
              setTimeout(() => {
                editorRef.current?.plugins.autosave.restoreDraft();
                editorRef.current?.plugins.autosave.removeDraft(false);
              }, 500);

              // Fix for TinyMCE menu being outside of dialog
              const menu = document.querySelector(
                ".tox.tox-silver-sink.tox-tinymce-aux",
              );
              if (menu) {
                document.querySelector('[role="dialog"]')?.appendChild(menu);
              }
            }}
          />
        </div>
        {!isEditorReady && (
          <div className="flex flex-col items-center justify-center gap-2 p-4">
            <Spinner className="size-6" />
            <p className="text-sm">에디터를 불러오는 중입니다...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
