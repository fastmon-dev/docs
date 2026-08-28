import {
  EditOnGitHub,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from "fumadocs-ui/layouts/docs/page";
import { MessageSquareWarning } from "lucide-react";
import { getPageMarkdownUrl, source } from "@/lib/source";
import type { InferPageType } from "fumadocs-core/source";

const REPO = "https://github.com/fastmon-dev/docs";
const SITE = "https://docs.fastmon.eu";

const REPORT_LABEL: Record<string, string> = {
  en: "Report an issue",
  de: "Fehler melden",
};

/**
 * The action row under a page title: copy/view as Markdown, edit the source on
 * GitHub, and report a problem via the docs-error issue form.
 *
 * Pages generated from the OpenAPI document (`_openapi` in the frontmatter)
 * have no source file in the repository, so they only get the report link.
 */
export function PageActions({ page, lang }: { page: InferPageType<typeof source>; lang: string }) {
  const markdownUrl = getPageMarkdownUrl(page).url;
  const generated = page.data._openapi !== undefined;

  // GitHub opens its web editor and forks the repo for readers without write
  // access, so a text fix needs nothing but a GitHub account.
  const editUrl = `${REPO}/edit/main/content/docs/${page.path}`;

  // Issue forms prefill fields by their `id` from the query string.
  const issue = new URLSearchParams({
    template: "docs-error.yml",
    title: `[docs] ${page.data.title}`,
    url: `${SITE}${page.url}`,
    language: lang === "de" ? "Deutsch" : "English",
  });
  const issueUrl = `${REPO}/issues/new?${issue.toString()}`;

  return (
    <div className="flex flex-row flex-wrap gap-2 items-center border-b pb-6">
      <MarkdownCopyButton markdownUrl={markdownUrl} />
      <ViewOptionsPopover markdownUrl={markdownUrl} />
      {!generated && <EditOnGitHub href={editUrl} />}
      <EditOnGitHub href={issueUrl}>
        <MessageSquareWarning className="size-3.5" />
        {REPORT_LABEL[lang] ?? REPORT_LABEL.en}
      </EditOnGitHub>
    </div>
  );
}
