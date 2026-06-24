import { Banner } from "fumadocs-ui/components/banner";
import { Provider } from "@/components/provider";
import { i18n, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}

const wipNotice: Record<Locale, string> = {
  en: "🚧 These docs are a work in progress — some pages may still be incomplete or contain inaccuracies.",
  de: "🚧 Diese Dokumentation entsteht gerade — einzelne Seiten können noch unvollständig oder stellenweise ungenau sein.",
};

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  const notice = wipNotice[lang as Locale] ?? wipNotice.en;
  return (
    <Provider locale={lang}>
      <Banner
        variant="normal"
        className="border-b border-amber-300/70 bg-amber-100 text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/60 dark:text-amber-100"
      >
        {notice}
      </Banner>
      {children}
    </Provider>
  );
}
