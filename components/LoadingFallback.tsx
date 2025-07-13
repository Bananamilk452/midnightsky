import { Spinner } from "@/components/Spinner";

export function LoadingFallback() {
  return (
    <div className="flex h-32 items-center justify-center">
      <Spinner className="size-6" />
    </div>
  );
}
