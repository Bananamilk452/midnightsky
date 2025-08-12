"use client";

import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

export default function BackButton({
  buttonClassName = "",
  iconClassName = "",
}: {
  buttonClassName?: string;
  iconClassName?: string;
}) {
  const router = useRouter();

  function onGoBack() {
    if (history.length > 2) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <button className={buttonClassName}>
      <ArrowLeftIcon
        onClick={onGoBack}
        className={cn("size-6 cursor-pointer", iconClassName)}
      />
    </button>
  );
}
