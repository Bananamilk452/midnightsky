import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ErrorBoundaryPage({
  error,
  onReset,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
  onReset: () => void;
}) {
  return (
    <div className="flex size-full items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>에러가 발생했어요!</CardTitle>
        </CardHeader>
        <CardContent>
          <pre style={{ whiteSpace: "normal" }}>{error.message}</pre>
        </CardContent>
        <CardFooter>
          <Button onClick={onReset}>다시 시도</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
