import { cva } from "class-variance-authority";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
} from "lucide-react";

import type { VariantProps } from "class-variance-authority";

const noteVariants = cva("flex flex-col text-sm p-4 gap-2 rounded-md", {
  variants: {
    variant: {
      info: "bg-gray-100/50 border border-gray-400 text-gray-600",
      success: "bg-green-100/50 border border-green-400 text-green-600",
      warning: "bg-yellow-100/50 border border-yellow-400 text-yellow-600",
      error: "bg-red-100/50 border border-red-400 text-red-600",
    },
  },
  defaultVariants: { variant: "info" },
});

const noteVariantComponents = {
  info: {
    Icon: InfoIcon,
    title: "정보",
  },
  success: {
    Icon: CircleCheckIcon,
    title: "성공",
  },
  warning: {
    Icon: TriangleAlertIcon,
    title: "경고",
  },
  error: {
    Icon: CircleAlertIcon,
    title: "오류",
  },
};

export function Note({
  className,
  variant,
  children,
}: React.ComponentProps<"div"> & VariantProps<typeof noteVariants>) {
  const { Icon, title } = noteVariantComponents[variant ?? "info"];

  return (
    <div className={noteVariants({ variant, className })}>
      <h2 className="inline-flex items-center gap-1 font-bold">
        <Icon className="size-4" />
        {title}
      </h2>
      <p className="whitespace-pre-line">{children}</p>
    </div>
  );
}
