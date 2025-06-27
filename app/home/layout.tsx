import { DefaultLayout } from "@/components/layouts/Default";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DefaultLayout>{children}</DefaultLayout>;
}
