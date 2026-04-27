"use client";

import { useTranslations } from "next-intl";

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
  onReset?: () => void;
}) {
  const t = useTranslations("Error");

  return (
    <div className="flex size-full items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <pre style={{ whiteSpace: "normal" }}>{error.message}</pre>
        </CardContent>
        {onReset && (
          <CardFooter>
            <Button onClick={onReset}>{t("tryAgain")}</Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
