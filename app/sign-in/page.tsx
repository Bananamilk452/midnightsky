"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { useSignIn } from "@/lib/hooks/useBluesky";

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
  const t = useTranslations("SignIn");

  const { mutate: signIn, status } = useSignIn();

  const formSchema = z.object({
    handle: z
      .string()
      .min(1, t("handleRequired"))
      .regex(
        new RegExp(
          "^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$",
        ),
        {
          message: t("handleInvalid"),
        },
      )
      .trim(),
  });

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
    const redirectTo = searchParams.get("redirectTo") || "/home";
    signIn(
      { handle: values.handle, redirectTo },
      {
        onSuccess: (url) => {
          startTransition(() => {
            router.push(url);
          });
        },
        onError(error) {
          console.error("Sign in error:", error);
          setFormError(
            error instanceof Error ? error.message : t("loginFailed"),
          );
        },
      },
    );
  }

  const isLoading =
    form.formState.isSubmitting || status === "pending" || isPending;

  return (
    <div>
      <Card className="mx-auto w-fit border bg-white/10 shadow-md backdrop-blur-md">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="handle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("handleLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        className="w-72"
                        id="handle"
                        type="text"
                        placeholder={t("handlePlaceholder")}
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
                {t("loginWith", { handle })}
              </Button>
            )}
            <Button
              className="w-full"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {t("login")}
              {isLoading && <Spinner className="size-4" />}
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
