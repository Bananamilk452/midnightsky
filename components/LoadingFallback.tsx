import { Spinner } from "@/components/Spinner";

export function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="size-6" />
    </div>
  );
}
