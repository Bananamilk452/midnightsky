import { useEffect, useRef } from "react";
import { useIntersectionObserver } from "usehooks-ts";

import { Spinner } from "@/components/Spinner";

export function InfiniteScrollTrigger({
  onTrigger,
  hasNextPage,
  isFetching,
}: {
  onTrigger: () => void;
  hasNextPage: boolean;
  isFetching: boolean;
}) {
  const scrollContainer = useRef<HTMLElement | null>(null);
  const lockRef = useRef(false);

  useEffect(() => {
    scrollContainer.current = document.getElementById("root");
  }, []);

  const { isIntersecting, ref } = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: "1500px",
    root: scrollContainer.current,
  });

  useEffect(() => {
    // 트리거가 화면 밖으로 나가면 잠금을 해제하여 다음 감지를 준비합니다.
    if (!isIntersecting) {
      lockRef.current = false;
      return;
    }

    // isIntersecting이 true일 때, 잠겨있지 않은 경우에만 onTrigger를 호출합니다.
    if (hasNextPage && !isFetching && !lockRef.current) {
      // 호출 직후 바로 잠급니다.
      lockRef.current = true;
      onTrigger();
    }
  }, [isIntersecting, onTrigger, hasNextPage, isFetching]);

  return (
    <>
      <div ref={ref} className="flex h-10 items-center justify-center p-4">
        {isFetching && <Spinner className="size-6" />}
      </div>
    </>
  );
}
