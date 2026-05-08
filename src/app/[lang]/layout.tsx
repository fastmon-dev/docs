import { Provider } from '@/components/provider';
import { i18n } from '@/lib/i18n';

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}

export default async function LangLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  return <Provider locale={lang}>{children}</Provider>;
}
