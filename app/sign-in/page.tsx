"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Note } from "@/components/ui/note";
import { signInWithBluesky } from "@/lib/bluesky/action";

const formSchema = z.object({
  handle: z
    .string()
    .min(1, "Bluesky 핸들을 입력해주세요.")
    .regex(
      new RegExp(
        "^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$",
      ),
      {
        message: "유효한 Bluesky 핸들을 입력해주세요.",
      },
    )
    .trim(),
});

export default function SignIn() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      handle: "",
    },
  });

  const handle = form.watch("handle");

  const showHandleAutoComplete = useCallback(() => {
    return !handle.includes(".") && handle.length > 0;
  }, [handle]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const redirectTo = searchParams.get("redirectTo") || "/home";
      const url = await signInWithBluesky(values.handle, redirectTo);

      startTransition(() => {
        router.push(url);
      });
    } catch (error) {
      console.error("Sign in error:", error);
      let str = "로그인에 실패했습니다. 다시 시도해주세요.";
      if (error instanceof Error) {
        str += `\n에러: ${error.message}`;
      }
      setFormError(str);
    }
  }

  return (
    <div>
      <Card className="mx-auto w-fit border bg-white/10 shadow-md backdrop-blur-md">
        <CardHeader>
          <CardTitle>MidnightSky✨ 로그인</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="handle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bluesky 핸들</FormLabel>
                    <FormControl>
                      <Input
                        className="w-72"
                        id="handle"
                        type="text"
                        placeholder="example.bsky.social"
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <div className="flex w-full flex-col gap-3">
            {showHandleAutoComplete() && (
              <Button
                className="w-full"
                onClick={() => {
                  form.setValue("handle", `${handle}.bsky.social`);
                  form.trigger("handle");
                  form.handleSubmit(onSubmit)();
                }}
              >
                {handle}.bsky.social로 로그인
              </Button>
            )}
            <Button
              className="w-full"
              onClick={form.handleSubmit(onSubmit)}
              disabled={form.formState.isSubmitting || isPending}
            >
              로그인
              {(form.formState.isSubmitting || isPending) && (
                <Spinner className="size-4" />
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
      {formError && (
        <Note variant="error" className="mt-2">
          {formError}
        </Note>
      )}
    </div>
  );
}
