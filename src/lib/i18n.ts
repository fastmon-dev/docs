import type { I18nConfig } from "fumadocs-core/i18n";
import { defineI18nUI } from "fumadocs-ui/i18n";
import { defineI18nOpenAPI } from "fumadocs-openapi/i18n";

export const i18n: I18nConfig = {
  defaultLanguage: "en",
  languages: ["en", "de"],
  hideLocale: "never",
};

// Two distinct translation surfaces with disjoint key sets, merged in two
// steps:
//   1) `defineI18nUI` covers the fumadocs-ui chrome (search, toc, theme, …).
//      Its `Translations` type is narrow — only the ~10 UI keys plus
//      `displayName` are accepted.
//   2) `defineI18nOpenAPI` extends the result with the OpenAPI-specific
//      strings (Authorization, Send, Path/Query/Header parameters, status
//      labels, …). Putting them in step 1 used to typecheck loosely but
//      breaks under strict @types/react + the current fumadocs versions. The
//      runtime contract is unchanged because `RootProvider` accepts
//      `TranslationsOption` (open-ended map).
//
// NOTE (fumadocs-openapi 11): the OpenAPI translation keys are now the English
// source string with a `(context)` suffix — e.g. `"Send(playground)"` — rather
// than the short keys (`send`, `query`, …) used in v10. The v10 schema
// constraint labels (`schemaMatch`, `schemaMultipleOf`, …) no longer exist in
// the translation table and fall back to fumadocs' own English/built-in copy.
const baseUI = defineI18nUI(i18n, {
  en: {
    displayName: "English",
  },
  de: {
    displayName: "Deutsch",
    search: "Suchen",
    searchNoResult: "Keine Treffer",
    toc: "Auf dieser Seite",
    tocNoHeadings: "Keine Überschriften",
    lastUpdate: "Zuletzt aktualisiert",
    chooseLanguage: "Sprache wählen",
    nextPage: "Nächste Seite",
    previousPage: "Vorherige Seite",
    chooseTheme: "Theme",
    editOnGithub: "Auf GitHub bearbeiten",
  },
});

export const i18nUI = defineI18nOpenAPI(baseUI, {
  de: {
    "Copy(TypeScript definitions)": "Kopieren",
    "Send(playground)": "Senden",
    "Authorization(operation page)": "Authentifizierung",
    "Authorization(playground)": "Authentifizierung",
    "Authorization(security scheme)": "Authentifizierung",
    "Cookies(playground)": "Cookies",
    "Query(playground)": "Query",
    "Path(playground)": "Pfad",
    "Header(playground)": "Header",
    "Body(playground)": "Body",
    "Deprecated(operation page)": "Veraltet",
    "Deprecated(security scheme)": "Veraltet",
    "Submit(OAuth dialog)": "Absenden",
    "Close(playground result display)": "Schließen",
    "Enter Value(playground server select)": "Wert eingeben",
    "Enter value(OAuth dialog)": "Wert eingeben",
    "Example Requests(operation page)": "Beispiel-Requests",
    "Request Body(operation page)": "Request-Body",
    "Response Body(operation page)": "Response-Body",
    "Callbacks(operation page)": "Callbacks",
    "Query Parameters(operation page)": "Query-Parameter",
    "Path Parameters(operation page)": "Pfad-Parameter",
    "Header Parameters(operation page)": "Header-Parameter",
    "Cookie Parameters(operation page)": "Cookie-Parameter",
    "In(security scheme)": "In",
    "Scope(security scheme)": "Scope",
    "TypeScript Definitions(TypeScript definitions)": "TypeScript-Definitionen",
    "Default(operation page)": "Standard",
    "Example(operation page)": "Beispiel",
    "Example {key}(operation page)": "Beispiel {key}",
    "Bad Request(playground status info)": "Bad Request",
    "Unauthorized(playground status info)": "Nicht autorisiert",
    "Forbidden(playground status info)": "Verboten",
    "Not Found(playground status info)": "Nicht gefunden",
    "Internal Server Error(playground status info)": "Server-Fehler",
    "Successful(playground status info)": "Erfolgreich",
    "Error(playground status info)": "Fehler",
    "Client Error(playground result display)": "Client-Fehler",
    "Authorize(playground)": "Authentifizieren",
    "Access Token(playground)": "Access-Token",
    "loading...(playground server select)": "lädt …",
    "Empty(operation page)": "Leer",
  },
});

export type Locale = (typeof i18n.languages)[number];
