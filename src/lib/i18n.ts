import type { I18nConfig } from 'fumadocs-core/i18n';
import { defineI18nUI } from 'fumadocs-ui/i18n';

export const i18n: I18nConfig = {
  defaultLanguage: 'en',
  languages: ['en', 'de'],
  hideLocale: 'never',
};

export const i18nUI = defineI18nUI(i18n, {
  translations: {
    en: {
      displayName: 'English',
    },
    de: {
      displayName: 'Deutsch',
      // Fumadocs UI chrome
      search: 'Suchen',
      searchNoResult: 'Keine Treffer',
      toc: 'Auf dieser Seite',
      tocNoHeadings: 'Keine Überschriften',
      lastUpdate: 'Zuletzt aktualisiert',
      chooseLanguage: 'Sprache wählen',
      nextPage: 'Nächste Seite',
      previousPage: 'Vorherige Seite',
      chooseTheme: 'Theme',
      editOnGithub: 'Auf GitHub bearbeiten',
      // Fumadocs OpenAPI — labels around generated reference pages.
      // Endpoint descriptions themselves stay in whatever language the
      // backend's openapi.json provides (single source of truth).
      copy: 'Kopieren',
      send: 'Senden',
      authorization: 'Authentifizierung',
      cookies: 'Cookies',
      query: 'Query',
      path: 'Pfad',
      header: 'Header',
      body: 'Body',
      deprecated: 'Veraltet',
      submit: 'Absenden',
      close: 'Schließen',
      inputPlaceholder: 'Wert eingeben',
      titleRequestTabs: 'Beispiel-Requests',
      titleRequestBody: 'Request-Body',
      titleResponseBody: 'Response-Body',
      titleCallbacks: 'Callbacks',
      queryParameters: 'Query-Parameter',
      pathParameters: 'Pfad-Parameter',
      headerParameters: 'Header-Parameter',
      cookieParameters: 'Cookie-Parameter',
      authTokenIn: 'In',
      authScope: 'Scope',
      typeScriptDefinitions: 'TypeScript-Definitionen',
      schemaDefault: 'Standard',
      schemaMatch: 'Format',
      schemaFormat: 'Format',
      schemaMultipleOf: 'Vielfaches von',
      schemaRange: 'Bereich',
      schemaLength: 'Länge',
      schemaProperties: 'Eigenschaften',
      schemaItems: 'Items',
      schemaValueIn: 'Wert in',
      schemaExample: 'Beispiel',
      responseTabName: 'Beispiel {key}',
      responseTabNameDefault: 'Beispiel',
      statusBadRequest: 'Bad Request',
      statusUnauthorized: 'Nicht autorisiert',
      statusForbidden: 'Verboten',
      statusNotFound: 'Nicht gefunden',
      statusInternalServerError: 'Server-Fehler',
      statusSuccessful: 'Erfolgreich',
      statusError: 'Fehler',
      statusClientError: 'Client-Fehler',
      authorize: 'Authentifizieren',
      accessToken: 'Access-Token',
      loading: 'lädt …',
      empty: 'Leer',
    },
  },
});

export type Locale = (typeof i18n.languages)[number];
