import { cn } from "@/lib/utils";

export function Avatar({
  src,
  alt,
  ...props
}: { src?: string; alt?: string } & React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src || "/images/default-avatar.jpg"}
      alt={alt || "User Avatar"}
      {...props}
      className={cn("size-10 rounded-full", props.className)}
    />
  );
}
