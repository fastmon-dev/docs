import { defineI18n } from "fumadocs-core/i18n";
import { uiTranslations } from "fumadocs-ui/i18n";
import { openapiTranslations } from "fumadocs-openapi/i18n";

export const i18n = defineI18n({
  defaultLanguage: "en",
  languages: ["en", "de"],
  hideLocale: "never",
});

// fumadocs-ui and fumadocs-openapi register their keys via `extend()`, so
// `add()` only accepts keys that exist. Keys are the English source string
// with a `(context)` suffix, e.g. `"Send(playground)"`; anything not listed
// falls back to the English copy.
export const translations = i18n
  .translations()
  .extend(uiTranslations())
  .extend(openapiTranslations())
  .add({
    en: {
      displayName: "English",
    },
    de: {
      displayName: "Deutsch",
      "Search(search dialog)": "Suchen",
      "Search(search trigger)": "Suchen",
      "No results found(search dialog)": "Keine Treffer",
      "On this page(table of contents)": "Auf dieser Seite",
      "No Headings(table of contents)": "Keine Überschriften",
      "Last updated on(page footer)": "Zuletzt aktualisiert",
      "Choose a language(language switcher)": "Sprache wählen",
      "Next Page(pagination)": "Nächste Seite",
      "Previous Page(pagination)": "Vorherige Seite",
      "Toggle Theme(theme switcher)(aria-label)": "Theme",
      "Edit on GitHub(edit page)": "Auf GitHub bearbeiten",
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
      "Enter Value(playground server select)": "Wert eingeben",
      "Enter value(playground)": "Wert eingeben",
      "Example Requests(operation page)": "Beispiel-Requests",
      "Request Body(operation page)": "Request-Body",
      "Response Body(operation page)": "Response-Body",
      "Callbacks(operation page)": "Callbacks",
      "Query Parameters(operation page)": "Query-Parameter",
      "Path Parameters(operation page)": "Pfad-Parameter",
      "Header Parameters(operation page)": "Header-Parameter",
      "Cookie Parameters(operation page)": "Cookie-Parameter",
      "Scope(security scheme)": "Scope",
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
      "Authorize(playground)": "Authentifizieren",
      "Empty(operation page)": "Leer",
      "Try in Playground(playground)": "Im Playground testen",
    },
  });

export type Locale = (typeof i18n.languages)[number];
