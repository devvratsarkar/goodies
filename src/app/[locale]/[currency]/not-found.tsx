import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-24">
      <h1 className="flex items-center text-heading">
        <span className="border-e border-heading/30 pe-6 text-2xl font-medium leading-12.25">404</span>
        <span className="ps-6 text-sm font-normal leading-12.25">{t("description")}</span>
      </h1>
    </div>
  );
}
