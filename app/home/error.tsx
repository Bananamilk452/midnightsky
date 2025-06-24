"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FallbackProps } from "react-error-boundary";

export default function Error({ error, resetErrorBoundary }: FallbackProps) {
  const router = useRouter();

  useEffect(() => {
    console.error("Home page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-md p-8 text-center">
        <div className="mb-4 text-lg font-semibold text-red-500">
          데이터를 불러오는 중 오류가 발생했습니다
        </div>
        <div className="mb-6 text-sm text-gray-400">
          {error.message || "알 수 없는 오류가 발생했습니다"}
        </div>
        <div className="space-y-3">
          <button
            onClick={resetErrorBoundary}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            다시 시도
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
