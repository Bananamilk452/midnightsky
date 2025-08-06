"use client";

import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  function onGoBack() {
    if (history.length > 2) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <button>
      <ArrowLeftIcon onClick={onGoBack} className="size-6 cursor-pointer" />
    </button>
  );
}
