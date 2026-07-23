import { Banner } from "fumadocs-ui/components/banner";
import { Provider } from "@/components/provider";
import { i18n, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}

const wipNotice: Record<Locale, string> = {
  en: "These docs are a work in progress: some pages may still be incomplete or contain inaccuracies.",
  de: "Diese Dokumentation entsteht gerade: einzelne Seiten können noch unvollständig oder stellenweise ungenau sein.",
};

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  const notice = wipNotice[lang as Locale] ?? wipNotice.en;
  return (
    <Provider locale={lang}>
      <Banner
        variant="normal"
        height="var(--wip-banner-height)"
        className="border-b border-fd-border bg-fd-secondary px-4 text-sm font-normal leading-snug text-fd-foreground"
      >
        {notice}
      </Banner>
      {children}
    </Provider>
  );
}
