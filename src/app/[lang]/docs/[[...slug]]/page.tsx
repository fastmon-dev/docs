import { redirect } from 'next/navigation';
import { source } from '@/lib/source';

export default async function MovedRedirect(props: PageProps<'/[lang]/docs/[[...slug]]'>) {
  const params = await props.params;
  const slug = Array.isArray(params.slug) ? params.slug.join('/') : '';
  const target = `/${params.lang}${slug ? `/${slug}` : ''}`;
  redirect(target);
}

export function generateStaticParams() {
  return source.generateParams('slug', 'lang');
}
