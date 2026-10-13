"use client";
import SearchDialog from "@/components/search";
import { RootProvider } from "fumadocs-ui/provider/next";
import { i18nProvider } from "fumadocs-ui/i18n";
import { type ReactNode } from "react";
import { translations } from "@/lib/i18n";

export function Provider({ children, locale }: { children: ReactNode; locale: string }) {
  return (
    <RootProvider i18n={i18nProvider(translations, locale)} search={{ SearchDialog }}>
      {children}
    </RootProvider>
  );
}
