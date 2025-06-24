import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Note } from "@/components/ui/note";

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const error = (await searchParams).error;

  return (
    <div className="flex h-dvh w-dvw flex-col items-center justify-center gap-4">
      <h1 className="text-lg">이런! 오류가 발생했어요🥺</h1>
      <Note variant="error">{error || "알 수 없는 오류가 발생했습니다."}</Note>
      <Link href="/home">
        <Button>홈으로 돌아가기</Button>
      </Link>
    </div>
  );
}
