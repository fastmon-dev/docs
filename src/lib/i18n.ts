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
//      labels, schema constraint labels, …). Putting them in step 1 used to
//      typecheck loosely but breaks under strict @types/react + the current
//      fumadocs versions. The runtime contract is unchanged because
//      `RootProvider` accepts `TranslationsOption` (open-ended map).
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
    copy: "Kopieren",
    send: "Senden",
    authorization: "Authentifizierung",
    cookies: "Cookies",
    query: "Query",
    path: "Pfad",
    header: "Header",
    body: "Body",
    deprecated: "Veraltet",
    submit: "Absenden",
    close: "Schließen",
    inputPlaceholder: "Wert eingeben",
    titleRequestTabs: "Beispiel-Requests",
    titleRequestBody: "Request-Body",
    titleResponseBody: "Response-Body",
    titleCallbacks: "Callbacks",
    queryParameters: "Query-Parameter",
    pathParameters: "Pfad-Parameter",
    headerParameters: "Header-Parameter",
    cookieParameters: "Cookie-Parameter",
    authTokenIn: "In",
    authScope: "Scope",
    typeScriptDefinitions: "TypeScript-Definitionen",
    schemaDefault: "Standard",
    schemaMatch: "Format",
    schemaFormat: "Format",
    schemaMultipleOf: "Vielfaches von",
    schemaRange: "Bereich",
    schemaLength: "Länge",
    schemaProperties: "Eigenschaften",
    schemaItems: "Items",
    schemaValueIn: "Wert in",
    schemaExample: "Beispiel",
    responseTabName: "Beispiel {key}",
    responseTabNameDefault: "Beispiel",
    statusBadRequest: "Bad Request",
    statusUnauthorized: "Nicht autorisiert",
    statusForbidden: "Verboten",
    statusNotFound: "Nicht gefunden",
    statusInternalServerError: "Server-Fehler",
    statusSuccessful: "Erfolgreich",
    statusError: "Fehler",
    statusClientError: "Client-Fehler",
    authorize: "Authentifizieren",
    accessToken: "Access-Token",
    loading: "lädt …",
    empty: "Leer",
  },
});

export type Locale = (typeof i18n.languages)[number];
