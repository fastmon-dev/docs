import { getApiTree } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';

// API section uses its own sidebar tree (only API endpoints + concepts) so the
// docs hierarchy disappears when the user is browsing the API reference. The
// English-only constraint comes from the auto-generated OpenAPI pages — no DE
// translation exists.
export default async function ApiLayout({ children, params }: LayoutProps<'/[lang]/api'>) {
  const { lang } = await params;
  const { i18n: _i18n, ...rest } = baseOptions(lang);
  return (
    <DocsLayout
      tree={getApiTree(lang)}
      tabs={[
        { title: lang === 'de' ? 'Doku' : 'Docs', url: `/${lang}` },
        { title: 'API Reference', url: '/en/api' },
      ]}
      // Force-disable the language switcher: fumadocs auto-enables it when
      // multiple locales are registered with RootProvider, even without
      // passing `i18n`. The API tab is English-only.
      i18n={false}
      // Marker used by global.css to widen the openapi-component's right
      // column (cURL / response). All other layout dimensions match the
      // Docs layout so the sidebar feels identical between tabs.
      containerProps={{ 'data-api-layout': '' }}
      {...rest}
    >
      {children}
    </DocsLayout>
  );
}
