import BackButton from "@/components/BackButton";
import { Header } from "@/components/Header";
import { DefaultLayout } from "@/components/layouts/Default";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DefaultLayout>
      <Header>
        <BackButton />
        <p className="ml-4 text-lg font-semibold">북마크</p>
      </Header>
      {children}
    </DefaultLayout>
  );
}
