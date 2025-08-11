"use client";

import { ReplyRef } from "@atproto/api/dist/client/types/app/bsky/feed/post";
import { zodResolver } from "@hookform/resolvers/zod";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Editor } from "@tinymce/tinymce-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Editor as TinyMCEEditor } from "tinymce";
import { z } from "zod";

import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CreatePostParams, CreatePostSchema } from "@/lib/bluesky/types";
import { BLUESKY_CONTENT_LIMIT } from "@/lib/constants";
import { useCreatePost, useMyLists } from "@/lib/hooks/useBluesky";

export function Writer({
  id = "main",
  open,
  setOpen,
  reply,
  hideTypeSelect,
}: {
  id?: string;
  open: boolean;
  setOpen: (value: boolean) => void;
  reply?: ReplyRef;
  hideTypeSelect?: boolean;
}) {
  const router = useRouter();
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

  const { data: listsData, status: listsStatus } = useMyLists();
  const { mutate, status } = useCreatePost();
  const form = useForm<CreatePostParams>({
    resolver: zodResolver(CreatePostSchema),
    defaultValues: {
      blueskyContent: "",
      content: "",
      type: reply ? "reply" : "private",
      reply,
    },
  });

  useEffect(() => {
    if (hideTypeSelect) {
      form.setValue("type", "reply");
    }
    if (reply) {
      form.setValue("reply", reply);
    }
  }, [hideTypeSelect, reply, form]);

  const blueskyContent = form.watch("blueskyContent");

  function onSubmit(data: z.infer<typeof CreatePostSchema>) {
    if (status === "pending") return;

    const body =
      data.type === "list"
        ? { ...data, listId: data.listId, reply }
        : { ...data, reply };

    mutate(body, {
      onSuccess: (data) => {
        editorRef.current?.plugins.autosave.removeDraft(false);
        handleModalClose(false);
        form.reset();
        router.push(`/post/${data.post.authorDid}/${data.post.rkey}`);
      },
      onError: (error) => {
        toast.error(
          `글 작성에 실패했습니다. 다시 시도해주세요. (${error.message})`,
        );
        console.error("Error creating post:", error);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="max-h-[calc(100vh-48px)] max-w-full overflow-auto bg-gray-900 p-4 sm:max-w-2xl [&>button]:hidden"
      >
        <DialogHeader>
          <div className="flex w-full items-center gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              취소
            </Button>
            <div className="flex-grow"></div>
            {status === "pending" && <Spinner className="size-4" />}
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={!isEditorReady || status === "pending"}
            >
              게시
            </Button>
          </div>
          <VisuallyHidden>
            <DialogTitle>글 작성</DialogTitle>
            <DialogDescription className="sr-only">글 작성</DialogDescription>
          </VisuallyHidden>
        </DialogHeader>

        <Form {...form}>
          <form>
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
                {blueskyContent.length}/{BLUESKY_CONTENT_LIMIT}
              </div>
            </div>

            <hr className="my-3" />

            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <h2 className="font-medium">추가 글</h2>

                <div className="flex-grow"></div>

                {!hideTypeSelect && (
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="pb-2 sm:pb-0">
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
                                맞팔만 공개
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center">
                              <FormControl>
                                <RadioGroupItem value="list" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                리스트
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
                {form.watch("type") === "list" &&
                  !hideTypeSelect &&
                  (listsStatus === "success" ? (
                    <FormField
                      control={form.control}
                      name="listId"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="리스트 선택" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {listsData.lists.map((list) => (
                                <SelectItem key={list.uri} value={list.uri}>
                                  {list.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <Spinner className="size-4" />
                  ))}
              </div>

              <div className="flex flex-col gap-2">
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
                      language: "ko_KR",
                    }}
                    onInit={(evt, editor) => {
                      editorRef.current = editor;
                      setIsEditorReady(true);
                      setTimeout(() => {
                        editorRef.current?.plugins.autosave.restoreDraft();
                        editorRef.current?.plugins.autosave.removeDraft(false);
                        const content = editorRef.current?.getContent();
                        if (content) {
                          form.setValue("content", content);
                        }
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
                    onChange={(e) => {
                      const content = e.target.getContent();
                      form.setValue("content", content);
                    }}
                  />
                </div>
                <FormMessage>
                  {form.formState.errors.content?.message}
                </FormMessage>
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
