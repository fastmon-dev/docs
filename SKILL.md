---
name: german-tech-docs
description: Write or review German technical documentation that reads as natural, native German rather than translated English. Use this skill whenever the user asks for German docs, README, architecture docs, API docs, user guides, or any technical writing in German — including bilingual EN/DE projects where the German version must match the English in coverage but be written natively. Also trigger when reviewing existing German docs for tone, terminology, or quality, and when translating English technical content into German. Apply the conventions in this skill consistently across an entire project, not just for the file currently being edited.
---

# Deutsche Tech-Doku (Du-Form)

Dieser Skill legt fest, wie deutsche Tech-Doku in diesem Projekt geschrieben wird. Ziel: Doku, die wie von einer deutschen Entwicklerin geschrieben klingt — nicht wie eine 1:1-Übersetzung.

## Goldene Regel: Parallel schreiben, nicht übersetzen

Wenn eine englische Version existiert, ist sie **Referenz für den Inhalt**, nicht Vorlage für die Sätze. Erst verstehen, was die englische Version sagt, dann auf Deutsch neu formulieren. Wortwörtliche Übersetzungen klingen fast immer holprig ("Bitte beachten Sie, dass …" für "Please note that …" ist ein Klassiker — besser: "Hinweis:" oder ganz weglassen).

## Anrede

- **Konsequent „du"** — klein geschrieben, außer am Satzanfang.
- Auch „dein", „dir", „dich" klein.
- **Niemals** in derselben Datei mischen mit „Sie", „man" oder Infinitiv-Befehlen.
- Imperative direkt: „Installiere die Abhängigkeiten." — nicht „Sie sollten die Abhängigkeiten installieren."
- In Listen und Schritt-für-Schritt-Anleitungen: Imperativ ohne Subjekt ist okay („Repository klonen", „Abhängigkeiten installieren") — aber innerhalb eines Dokuments konsistent bleiben.

## Komposita

Zusammengesetzte Substantive werden **zusammengeschrieben**. Das ist der häufigste Fehler in maschinell erzeugtem Deutsch.

Richtig: `Konfigurationsdatei`, `Umgebungsvariable`, `Bereitstellungspipeline`, `Datenbankverbindung`, `Authentifizierungsdienst`, `Fehlermeldung`, `Eingabefeld`

Falsch: ~~Konfigurations Datei~~, ~~Umgebungs Variable~~, ~~Datenbank Verbindung~~

Bei langen Komposita ist ein **Bindestrich** zur Lesbarkeit erlaubt und oft besser:
- `Backend-Service`, `Frontend-Komponente`, `OAuth-Flow`, `API-Endpunkt`
- `Single-Sign-On-Konfiguration` (statt `Singlesignonkonfiguration`)

Faustregel: Wenn ein Teil englisch ist, mit Bindestrich. Wenn beide deutsch, zusammen.

## Anglizismen-Politik

**Technische Begriffe bleiben englisch.** Nicht übersetzen:

`commit`, `merge`, `pull request`, `branch`, `repository`, `deploy`, `deployment`, `build`, `runtime`, `request`, `response`, `payload`, `header`, `token`, `cache`, `queue`, `worker`, `service`, `frontend`, `backend`, `middleware`, `framework`, `library`, `dependency`, `package`, `bundle`, `hook`, `state`, `props`, `component`, `route`, `routing`, `migration`, `seed`, `mock`, `stub`, `fixture`, `linter`, `formatter`, `pipeline`, `staging`, `production`

**Werden übersetzt** (häufiger im Deutschen):
- `error` → Fehler (außer in Code/Logs: `Error`)
- `warning` → Warnung
- `endpoint` → Endpunkt (auch in Komposita: `API-Endpunkt`, `Server-Endpunkt`)
- `setting`/`option` → Einstellung / Option (die Fastmon-UI ist auf Deutsch, UI-Labels also ebenfalls deutsch — „Einstellungen", nicht „Settings")
- `feature` → Funktion (oder „Feature" wenn etabliert)
- `file` → Datei
- `folder`/`directory` → Verzeichnis / Ordner
- `version` → Version
- `update` → Aktualisierung / Update (beides okay)

**Rollen im Produkt — bewusste Trennung:**
- **Besucher** = die anonyme Person, deren Pageviews der Beacon misst (Web-Vitals-Kontext: `web-vitals/*`, `beacon`, `collection-modes`, `privacy`). Niemals „User" oder „Nutzer".
- **User** (englisch, groß) = die Fastmon-Kundschaft, die sich einloggt, Dashboards sieht, Tokens hat (Datenmodell-Kontext: `concepts/organizations`, `architecture`, `api`, `glossary`). Bleibt englisch, weil im Datenmodell `User` als Entität existiert.

Im Zweifel: Wer wird gemessen → **Besucher**. Wer benutzt Fastmon → **User**.

**Verben aus dem Englischen werden eingedeutscht**, nicht zusammengesetzt:
- „du committest", „gepusht", „gemerged", „deployt", „gebuildet"
- Konjugation folgt deutscher Grammatik

## Satzbau und Stil

- **Kurze Sätze.** Wenn ein Satz mehr als zwei Kommas hat, teile ihn.
- **Verb nicht ans Ende verschieben, wenn vermeidbar.** „Damit du die Anwendung starten kannst, musst du zuerst …" — okay, aber Hauptsatz oft besser: „Starte zuerst …, danach kannst du …"
- **Aktiv statt Passiv.** „Die Pipeline baut das Image" statt „Das Image wird von der Pipeline gebaut."
- **Keine Floskeln.** „Bitte beachten", „selbstverständlich", „natürlich", „einfach" weglassen oder durch konkrete Info ersetzen.
- **Keine Übersetzungs-Artefakte:**
  - ~~„in Ordnung sein" für "to be fine"~~ → „passen", „funktionieren"
  - ~~„Sicher sein, dass" für "make sure"~~ → „stelle sicher, dass" oder „prüfe, ob"
  - ~~„abhängig von" am Satzanfang~~ → „je nach"
  - ~~„im Falle, dass"~~ → „falls"

## Code-Blöcke, CLI, Pfade

- **Niemals übersetzen:** Befehle, Code, Dateinamen, Pfade, Variablennamen, API-Routen, Umgebungsvariablen.
- **Code-Kommentare** in Beispielen: in der Sprache des Dokuments. Englisches Doku-File → englische Kommentare im Snippet. Deutsches Doku-File → deutsche Kommentare. **Aber:** wenn Code-Kommentare aus dem realen Repo zitiert werden, bleiben sie wie sie sind.
- **Fehlermeldungen** aus dem Code: Original lassen, dann auf Deutsch erklären.
  ```
  Error: ECONNREFUSED
  ```
  Diese Meldung bedeutet, dass der Service nicht erreichbar ist.

## Terminologie-Konsistenz

**Im selben Projekt einen Begriff durchziehen.** Nicht mal „Service", mal „Dienst", mal „Komponente" für dieselbe Sache.

Bevor du anfängst, **scanne die bestehende Doku** (sowohl `docs/de/` als auch `docs/en/`) und übernimm die dort etablierten Begriffe. Wenn ein Begriff in einer Datei „Backend-Service" heißt, heißt er das überall.

Wenn du unsicher bist, ob ein Begriff schon festgelegt ist:
1. `grep` in `docs/` nach möglichen Varianten
2. Den häufigeren Begriff verwenden
3. Bei echter Inkonsistenz: den Nutzer fragen, welche Variante kanonisch ist

## Frontend vs. Backend

Da das Projekt beide Teile hat:
- **Konsistente Sprache über beide hinweg.** Ein „User" im Backend ist auch im Frontend ein „User", nicht plötzlich ein „Nutzer". Ein „Besucher" bleibt überall „Besucher".
- **Aber technische Begriffe sind kontextspezifisch.** Im Frontend-Doku: `component`, `props`, `state`, `route`. Im Backend-Doku: `endpoint`, `middleware`, `migration`, `worker`. Beide bleiben englisch.

## Überschriften und Listen

- Überschriften: **substantivisch**, nicht als ganzer Satz.
  - Gut: „Installation", „Konfiguration der Umgebung", „Erste Schritte"
  - Weniger gut: „So installierst du das Projekt"
- Listenpunkte: **parallele Struktur**. Wenn der erste Punkt mit Verb anfängt, alle.
  - Gut: „Repository klonen / Abhängigkeiten installieren / Server starten"
  - Schlecht: „Repository klonen / Du installierst die Abhängigkeiten / Der Server startet"

## Häufige Fehlerquellen (Self-Check vor dem Abgeben)

Bevor du eine deutsche Doku-Datei abschließt, prüfe:

1. **Anrede konsistent „du"?** Kein versehentliches „Sie", „man" oder „der Nutzer sollte"?
2. **Komposita zusammen?** Kein Deppenleerzeichen?
3. **Technische Begriffe englisch gelassen?** Kein „Abrufanfrage" für Pull Request. Ausnahmen wie `endpoint` → `Endpunkt` und `setting` → `Einstellung` sind oben in der Liste festgehalten.
4. **Rollen sauber getrennt?** „Besucher" für die anonyme gemessene Person, „User" für Fastmon-Kunden. Nicht mischen.
5. **Keine 1:1-Übersetzungen?** Liest sich der Text, als wäre er originär deutsch?
6. **Terminologie konsistent mit Rest des Projekts?**
7. **Code, Pfade, Befehle unverändert?**
8. **Aktiv statt Passiv** wo möglich?

## Wenn EN und DE parallel gepflegt werden

- **Inhaltliche Parität, nicht satzliche.** Die deutsche Version soll dieselben Informationen liefern, aber darf anders strukturiert sein, wenn das auf Deutsch besser fließt.
- **Struktur synchron halten:** Überschriften-Hierarchie, Code-Beispiele, Diagramme identisch. Nur der Fließtext wird neu formuliert.
- **Wenn du beide gleichzeitig schreibst:** Erst Englisch fertig, dann Deutsch neu formulieren — nicht abwechselnd Satz für Satz übersetzen.
- **Wenn nur eine Seite geändert wird:** klar markieren oder im Commit erwähnen, damit die andere Sprachversion nachgezogen werden kann.

## Beispiele: vorher / nachher

**Vorher (Übersetzung):**
> Bitte stellen Sie sicher, dass Sie Node.js installiert haben, bevor Sie fortfahren. Dann können Sie die Abhängigkeiten installieren, indem Sie den folgenden Befehl ausführen:

**Nachher (natürliches Deutsch, du-Form):**
> Du brauchst Node.js. Installiere danach die Abhängigkeiten:

---

**Vorher:**
> Die Konfigurations Datei wird automatisch generiert, wenn der Build Prozess startet.

**Nachher:**
> Die Konfigurationsdatei wird beim Build automatisch erzeugt.

---

**Vorher:**
> Falls ein Fehler auftritt, überprüfen Sie bitte Ihre Umgebungs Variablen.

**Nachher:**
> Bei Fehlern: prüfe deine Umgebungsvariablen.
