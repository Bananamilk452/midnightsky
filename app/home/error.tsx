"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FallbackProps } from "react-error-boundary";
import { useTranslations } from "next-intl";

export default function Error({ error, resetErrorBoundary }: FallbackProps) {
  const router = useRouter();
  const t = useTranslations("Error");

  useEffect(() => {
    console.error("Home page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-md p-8 text-center">
        <div className="mb-4 text-lg font-semibold text-red-500">
          {t("dataLoadFailed")}
        </div>
        <div className="mb-6 text-sm text-gray-400">
          {error.message || t("unknown")}
        </div>
        <div className="space-y-3">
          <button
            onClick={resetErrorBoundary}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            {t("tryAgain")}
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
          >
            {t("goHome")}
          </button>
        </div>
      </div>
    </div>
  );
}
