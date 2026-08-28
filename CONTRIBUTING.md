# Contributing to the fastmon docs

Thanks for helping to make the docs better. Typo fixes, clearer wording, missing
steps, broken links: every fix is welcome.

## The quick way: edit on GitHub

1. Find the page in `content/docs/`. English pages are `<name>.mdx`, German pages
   are `<name>.de.mdx`. Both live next to each other.
2. Click the pencil icon on GitHub and edit the file. GitHub forks the repository
   for you and opens a pull request when you save.
3. Someone from the fastmon team reviews and merges. CI runs lint, type check,
   prose check, and a full build on every pull request.

You do not need to install anything for a text fix.

## Working locally

```bash
npm install
make dev          # http://localhost:3000
make test         # typecheck + lint + format + prose check
make build        # full static export, also regenerates the API reference
```

`make build` fetches the public OpenAPI document from `api.fastmon.eu` to
generate the API reference. Without network access the build fails; the
content pages still work in `make dev`.

## Rules for content

**Both languages.** Every hand-written page exists in English and German. If you
change one, change the other too. Write the German natively; do not translate
word for word. If you only speak one of the two languages, say so in the pull
request and we take care of the other side.

**Plain language.** Short sentences, present tense, concrete. State what a
thing does and what it means for the reader. Skip filler such as "it's worth
noting", "seamlessly", "powerful", "robust", "leverage".

**No em-dashes (—).** Use a full stop, a colon, a semicolon, or parentheses.
The changelog is checked for this in CI (`npm run lint:prose`); we ask for the
same in all other pages.

**Facts over claims.** The docs describe what the product does today. If
something is planned but not shipped, say "planned" and nothing more.

**Terminology.** The brand is written lowercase `fastmon` except at the start
of a sentence or in a heading. The *tracker* is the script installed on a site;
the *beacon* is the payload it sends. Check the [glossary](content/docs/glossary.mdx)
before introducing a new term.

## What not to edit

- `content/docs/api/<group>/` folders are generated at build time from the
  OpenAPI document and are not tracked in git. Errors in endpoint descriptions
  come from the API itself; please open an issue instead of a pull request.
- `content/docs/changelog/` is written by the fastmon team. Corrections are
  welcome; new entries are not.

## Reporting instead of fixing

If you spot a problem but do not want to edit, open an issue with the
[documentation error](https://github.com/fastmon-dev/docs/issues/new?template=docs-error.yml)
template. The page URL and a sentence about what is wrong are enough.

## License

By contributing you agree that your changes are licensed under the same terms
as the repository: MIT for code, CC BY 4.0 for content. See `LICENSE` and
`LICENSE-CONTENT.md`.
