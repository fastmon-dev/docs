import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Globe, LayoutDashboard } from "lucide-react";
import { appName } from "./shared";
import { i18n } from "./i18n";

export function baseOptions(_locale: string): BaseLayoutProps {
  return {
    i18n,
    nav: {
      title: (
        <span className="inline-flex items-center gap-2 font-semibold">
          {/* Plain <img> avoids the next/image aspect-ratio warning that
              fires when className overrides height/width. */}
          <img src="/logo-dark.svg" alt="" className="h-5 w-auto block dark:hidden" />
          <img src="/logo-light.svg" alt="" className="h-5 w-auto hidden dark:block" />
          <span style={{ fontFamily: "var(--font-playfair)" }}>{appName}</span>
        </span>
      ),
    },
    // Outbound links to the marketing site and the SPA. Rendered as icon
    // buttons in the sidebar footer row next to the theme switch.
    links: [
      {
        type: "icon",
        url: "https://fastmon.eu",
        text: "fastmon.eu",
        label: "fastmon.eu",
        icon: <Globe />,
      },
      {
        type: "icon",
        url: "https://app.fastmon.eu",
        text: "app.fastmon.eu",
        label: "Open Fastmon app",
        icon: <LayoutDashboard />,
      },
    ],
    // GitHub link removed — repo is private.
  };
}
