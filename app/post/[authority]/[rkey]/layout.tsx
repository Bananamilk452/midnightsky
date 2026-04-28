import { getTranslations } from "next-intl/server";

import BackButton from "@/components/BackButton";
import { Header } from "@/components/Header";
import { DefaultLayout } from "@/components/layouts/Default";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("Profile");

  return (
    <DefaultLayout>
      <Header>
        <BackButton />
        <p className="ml-4 text-lg font-semibold">{t("posts")}</p>
      </Header>
      {children}
    </DefaultLayout>
  );
}
