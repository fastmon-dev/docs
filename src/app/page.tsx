import { redirect } from 'next/navigation';
import { i18n } from '@/lib/i18n';

export default function RootRedirect() {
  // Static-export-friendly redirect: Next emits an HTML stub with meta-refresh
  // pointing at the default-language docs root. Visitors can switch language
  // via the in-app switcher.
  redirect(`/${i18n.defaultLanguage}`);
}
