import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Note } from "@/components/ui/note";

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const error = (await searchParams).error;
  const t = await getTranslations("Error");

  return (
    <div className="flex h-dvh w-dvw flex-col items-center justify-center gap-4">
      <h1 className="text-lg">{t("oops")}</h1>
      <Note variant="error">{error || t("unknownWithPeriod")}</Note>
      <Link href="/home">
        <Button>{t("goHome")}</Button>
      </Link>
    </div>
  );
}
