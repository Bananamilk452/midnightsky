"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Editor } from "@tinymce/tinymce-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Editor as TinyMCEEditor } from "tinymce";
import { z } from "zod";

import { Spinner } from "@/components/Spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  blueskyContent: z.string(),
  content: z.string(),
  type: z.enum(["public", "private"]),
});

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      blueskyContent: "",
      content: "",
      type: "private",
    },
  });

  const blueskyContent = form.watch("blueskyContent");

  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log("Submitted data:", data);
  }

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="max-w-full bg-gray-900 p-4 sm:max-w-2xl [&>button]:hidden"
      >
        <DialogHeader>
          <div className="flex w-full justify-between">
            <Button variant="ghost">취소</Button>
            <Button>게시</Button>
          </div>
          <VisuallyHidden>
            <DialogTitle>글 작성</DialogTitle>
            <DialogDescription className="sr-only">글 작성</DialogDescription>
          </VisuallyHidden>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2">
              <h2 className="font-medium">본문</h2>
              <FormField
                name="blueskyContent"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        className="h-24 resize-none rounded-lg border border-gray-400 !text-base"
                        placeholder="무슨 일이 일어나고 있나요?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="text-sm text-gray-400">
                {blueskyContent.length}/290
              </div>
            </div>
            <hr className="my-4" />
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2 className="font-medium">추가 글</h2>

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-3"
                        >
                          <FormItem className="flex items-center">
                            <FormControl>
                              <RadioGroupItem value="public" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              전체 공개
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center">
                            <FormControl>
                              <RadioGroupItem value="private" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              팔로워만 공개
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className={!isEditorReady ? "hidden" : ""}>
                <Editor
                  tinymceScriptSrc="/tinymce/tinymce.min.js"
                  licenseKey="gpl"
                  init={{
                    height: 400,
                    menubar: "file edit insert format table",
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
                    content_css: "dark",
                    skin: "oxide-dark",
                    language: "ko_KR",
                    color_default_foreground: "white",
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
                      document
                        .querySelector('[role="dialog"]')
                        ?.appendChild(menu);
                    }
                  }}
                />
              </div>
            </div>
          </form>
        </Form>
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
