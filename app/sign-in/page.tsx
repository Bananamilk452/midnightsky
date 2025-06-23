"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signInWithBluesky } from "@/lib/bluesky/action";

const formSchema = z.object({
  handle: z.string().min(1, "Bluesky 핸들을 입력해주세요."),
});

export default function SignIn() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      handle: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const url = await signInWithBluesky(values.handle);

    startTransition(() => {
      router.push(url);
    });
  }

  return (
    <Card className="border bg-white/10 shadow-md backdrop-blur-md">
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
                      placeholder="Bluesky 핸들"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormDescription />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter>
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
      </CardFooter>
    </Card>
  );
}
