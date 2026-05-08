import { getDocsTree } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';

export default async function Layout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  return (
    <DocsLayout
      tree={getDocsTree(lang)}
      // Two-tab section switcher rendered as a sidebar dropdown
      // (`tabMode: 'auto'` is the default → dropdown above the tree).
      // The Docs tab follows the active locale; API is English-only
      // because the auto-generated endpoint pages come from the
      // English OpenAPI document — no DE translation exists.
      tabs={[
        {
          title: lang === 'de' ? 'Doku' : 'Docs',
          url: `/${lang}`,
        },
        {
          title: 'API Reference',
          url: '/en/api',
        },
      ]}
      {...baseOptions(lang)}
    >
      {children}
    </DocsLayout>
  );
}
