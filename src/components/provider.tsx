'use client';
import SearchDialog from '@/components/search';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { type ReactNode } from 'react';
import { i18nUI } from '@/lib/i18n';

export function Provider({ children, locale }: { children: ReactNode; locale: string }) {
  return (
    <RootProvider i18n={i18nUI.provider(locale)} search={{ SearchDialog }}>
      {children}
    </RootProvider>
  );
}
