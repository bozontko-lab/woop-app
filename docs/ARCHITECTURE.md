# Architektura

Prywatna PWA (local-first) hostowana jako statyczny build na Cloudflare Workers (same pliki, bez kodu Workera). Bez backendu w Etapach 1–2.

## Stack

| Obszar | Wybór                                                                                                                                 |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Build  | Vite 8, TypeScript 6.0 (strict)                                                                                                       |
| UI     | React 19, React Router 8 (tryb danych, `createBrowserRouter`)                                                                         |
| Style  | Tailwind CSS 4 (`@tailwindcss/vite`), tokeny kolorów jako zmienne CSS, motyw jasny/ciemny/systemowy                                   |
| Ikony  | `lucide-react` (bundlowane lokalnie, bez CDN)                                                                                         |
| Dane   | IndexedDB przez Dexie 4 + `dexie-react-hooks`, schowane za repozytoriami w `src/data/`                                                |
| PWA    | `vite-plugin-pwa` (Workbox `generateSW`, precache całej aplikacji, monit o aktualizację, obsługa kliknięcia w powiadomienie)          |
| Testy  | Vitest 5 (logika domenowa, repozytoria na `fake-indexeddb`, `.ics` parsowane przez `ical.js`), Playwright 1.63 + axe-core (E2E, a11y) |
| Lint   | ESLint 9 + typescript-eslint + react-hooks + jsx-a11y, Prettier                                                                       |

## Warstwy

```
content (pl.ts)  ──►  domain (czysta logika)  ◄──  data (Dexie, repozytoria)
       ▲                      ▲                          ▲
       └──────────── features (ekrany) + components/ui ──┘
```

- **`src/content/pl.ts`**: jedyne miejsce z tekstami UI: pytania, pytania pomocnicze, przykłady, „Dlaczego o to pytam?”, komunikaty podpowiedzi, etykiety, treść „Jak to działa”, gotowe przykłady z biblioteki, a także słowniki rdzeni dla walidatorów. Szablony z `{parametrami}` wypełnia helper `t()`.
- **`src/domain/`**: TypeScript bez Reacta i bez Dexie, w całości pokryty testami Vitest:
  - kreator: typy, normalizacja tekstu, walidatory, silnik kroków, wersje skrócone, konstruktor planu;
  - eksporty: podsumowanie (tekst/MD/JSON), checklista jakości, `.ics`, układ karty PNG;
  - Etap 2: statystyki, wersjonowanie, przegląd, harmonogram przypomnień, biblioteka, kopia zapasowa.
- **`src/data/`**: schemat Dexie i repozytoria: `woopRepository`, `settingsRepository`, `checkinRepository`, `practiceRepository`, `reviewRepository`, `reminderRepository`, a do tego eksport/import kopii (`backupService`) i hooki React (`useWoop`, `useWoops`, `useTracking`, `useToday`…). Komponenty nie importują Dexie, więc podmiana implementacji pod synchronizację nie dotknie UI.
- **`src/features/`**: ekrany pogrupowane funkcjami (kreator, karta, postępy, „Co dalej”, przypomnienia, „Przeszkoda teraz!” / powtórka / check-in, przegląd i zakończenie, biblioteka, „Jak to działa”, ustawienia z kopią zapasową, ekran główny).
- **`src/components/ui/`**: dostępne klocki: przycisk, chipy (natywne radio), suwak (natywny `range`), pole tekstowe z autowysokością, rozwijane sekcje (`<details>`), okno dialogowe (`<dialog>`), pasek postępu W–O–O–P, nagłówek ekranów pełnoekranowych.
- **`src/lib/`**: integracje z przeglądarką: schowek, pobieranie plików, Web Share, rysowanie karty na canvasie, Wake Lock, dźwięk końca pauzy (Web Audio), instalacja i aktualizacja PWA, powiadomienia.

## Ekrany i trasy

| Układ                                                            | Trasy                                                                                                                                                                      |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Z dolną nawigacją (Start, Biblioteka, Jak to działa, Ustawienia) | `/` ekran główny, `/woop/:id` karta, `/woop/:id/progress` postępy, `/woop/:id/next` „Co dalej” i przypomnienia, `/library`, `/about`, `/settings`                          |
| Pełnoekranowy, bez rozpraszaczy                                  | `/wizard/:id` kreator, `/woop/:id/sos` „Przeszkoda teraz!”, `/woop/:id/rehearse` powtórka, `/woop/:id/checkin`, `/woop/:id/review` przegląd, `/woop/:id/close` zakończenie |

## Kreator

Silnik to deklaratywna lista kroków (`src/domain/wizard/steps.ts`). Każdy krok ma `id`, fazę (start / W / O / O / test realności / P), rodzaj ekranu, tryby (`full`, `quick`), warunek „wymagane pola uzupełnione” i walidatory. Silnik:

- pozwala iść tylko do przodu, po uzupełnieniu pól wymaganych, albo wstecz o jeden krok; URL nie zawiera kroku, więc nie da się przeskoczyć do planu adresem,
- trzyma bieżący krok w szkicu, więc po powrocie wznawia dokładnie tam, gdzie skończyliśmy,
- uruchamia walidatory dopiero po „Dalej”. Podpowiedź można zastosować, poprawić tekst albo zostawić swoją wersję (zapamiętujemy to dla danej treści, więc nie wraca).

Kolejność ekranów (pełny tryb):

| Faza             | Ekrany                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Start            | wprowadzenie → ramy czasowe → obszar (opcjonalnie)                                                                                         |
| **W** Życzenie   | treść → kryterium sukcesu → ważność (suwak 1–10) → wersja skrócona                                                                         |
| **O** Rezultat   | treść → „A co ci to da?” (1–2×, opcjonalnie) → pauza na wizualizację → wersja skrócona                                                     |
| **O** Przeszkoda | treść → typ (chipy) → kiedy / gdzie / o której → pauza na wizualizację → wersja skrócona                                                   |
| Test realności   | suwak 1–10 z rozgałęzieniem: dalej / doprecyzuj / zmień, odpuść świadomie, kontynuuj                                                       |
| **P** Plan       | konstruktor „Jeśli…, to…” z podglądem na żywo → plan awaryjny (opcjonalnie) → wersja skrócona → „Powiedz plan na głos” + 15 s wizualizacji |
| Podsumowanie     | karta, pełne odpowiedzi, checklista z „Popraw”, eksporty → „Co dalej”                                                                      |

**Szybki WOOP** (`mode: 'quick'`) korzysta z tej samej listy i pokazuje tylko kroki oznaczone trybem `quick`: wprowadzenie → życzenie → rezultat → wizualizacja → przeszkoda → wizualizacja → realność → plan → plan na głos. Ramy czasowe to „dziś”, a wersje skrócone powstają automatycznie.

**Edycja zapisanego WOOP-a** otwiera kreator na wskazanym kroku (`/wizard/:id?edit=<krok>&reason=<powód>`). Pierwsza realna zmiana tworzy nową wersję, a poprzednia treść trafia do `history`. Przegląd z decyzją „Nowa przeszkoda” dodaje `reset=obstacle`: czyści przeszkodę i plan i zaczyna od wizualizacji rezultatu.

Autozapis: każda zmiana trafia od razu do kopii w `localStorage`, a po ~250 ms (i natychmiast przy `visibilitychange`/`pagehide`) do rekordu `Woop` w IndexedDB. Przy starcie nowsze kopie są odtwarzane.

## Walidatory (heurystyki)

- Normalizacja: małe litery, usunięte polskie znaki, interpunkcja → spacje, podział na tokeny.
- Wzorce w słownikach (`pl.ts`): `czas` = rdzeń (łapie „czasu”, „czasem”), `=sam` = dokładne słowo, `nie mam czas` = sekwencja rdzeni, `!czasopism` = wyjątek.
- Każdy walidator zwraca listę podpowiedzi `{ code, field, match?, suggestion?, options? }`. Treść komunikatu pochodzi z `pl.ts` po kodzie.
- Przykładowe reguły: ogólnik bez miary (cyfry, „razy”, „minut”, „codziennie”…), cel zależny od innych, zaprzeczenie, rezultat powtarzający życzenie bez odczuwalnej korzyści, przeszkoda zewnętrzna bez wewnętrznych markerów („czuję”, „mówię sobie”, „zamiast”…), kilka przeszkód naraz, plan z „postaram się / spróbuję / muszę / będę bardziej”, część „to” bez czasownika w 1. osobie, część „jeśli” opisująca życzenie, wersja skrócona dłuższa niż 6 słów.
- Wzorcowy WOOP ze specyfikacji i gotowe przykłady z biblioteki przechodzą bez żadnej podpowiedzi (testy regresyjne).

## Model danych

Zgodny ze szkicem ze specyfikacji, z rozszerzeniami opisanymi w `DECISIONS.md`. Typy są w `src/domain/types.ts`.

```ts
Woop {
  id, createdAt, updatedAt, activatedAt, mode: 'full' | 'quick',
  timeframe { type: 'today' | 'week' | 'month' | 'date', startDate, endDate },
  area | null,
  wish { text, short, successCriterion, importance },
  outcome { text, short, deeper: string[] },
  obstacle { text, short, type, when, where, time },
  parkedObstacles: string[],          // kandydaci na kolejny WOOP
  realism,
  plan { ifText, thenText, backupPlan, short },
  reviewDate, status, version,
  history: { version, savedAt, reason, core }[],
  closing { outcome, reflection, closedAt } | null,
  wizard { stepId, dismissed } | null  // stan kreatora, tylko dla szkiców
}
Checkin  { id, woopId, date, obstacleOccurred, planUsed: 'yes' | 'partly' | 'no' | null, rating, note, createdAt, updatedAt }
Practice { id, woopId, kind: 'sos' | 'rehearsal', at, date, planUsed, updatedAt }
Review   { id, woopId, date, whatWorked, obstacleChanged, planNeedsFix, decision, version, createdAt, updatedAt }
Reminder { id, woopId, kind: 'obstacle' | 'checkin' | 'review', time, days: number[], enabled, lastNotified, createdAt, updatedAt }
```

Schemat Dexie: wersja 1 (`woops`, `settings`) i wersja 2 (`checkins` z unikalnym `[woopId+date]`, `practices`, `reviews`, `reminders`). Usunięcie WOOP-a usuwa w jednej transakcji jego wpisy ze wszystkich tabel.

## Utrzymanie protokołu (Etap 2)

- **Ekran główny**: „Na dziś” (przypomnienia, które nadeszły), aktywne WOOP-y z akcjami „Przeszkoda teraz!”, „Powtórka”, „Check-in” i linią „X z 7 dni”, wskazówka przy więcej niż 3 aktywnych, nowy / szybki WOOP, szkice, zakończone.
- **Statystyki** (`domain/stats.ts`): sytuacje z przeszkodą, odsetek użycia planu, trend tygodniowy (pn–nd), aktywność tygodnia, siatka miesiąca. Ekran postępów pokazuje kafelki, wykres słupkowy z tabelą, kalendarz i ostatnie wpisy.
- **Przegląd** (`domain/review.ts`): termin przeglądu, następna data, cel edycji dla każdej decyzji. **Wersje** (`domain/versioning.ts`).
- **Przypomnienia** (`domain/reminders.ts`, `domain/reminderSchedule.ts`): domyślne ustawienia, wydarzenia `.ics`, lista „Na dziś”, powiadomienia systemowe (`lib/reminderNotifier.ts` co 30 s, gdy aplikacja działa).
- **Biblioteka** (`domain/library.ts`): moje przeszkody i plany (także z historii), odłożone przeszkody, szkice z przykładów.
- **Kopia zapasowa** (`domain/backup.ts` + `data/backupService.ts`): format z `schemaVersion`, walidacja pliku, łączenie albo zastąpienie danych.

## Eksporty

- Tekst do schowka (Clipboard API z fallbackiem).
- PNG rysowany na Canvas 2D: 1080×1920 (tapeta: treść poniżej zegara ekranu blokady) i 1080×1080. Układ liczy czysta funkcja (testowalny), a rysowanie jest w `src/lib`. Na telefonie dodatkowo „Udostępnij” (Web Share z plikiem).
- Wydruk: osobny widok karty z `@page { size: A6 }`.
- `.md` i `.json` (z polem `schemaVersion`).
- `.ics` z ekranu „Co dalej”: wydarzenia cykliczne z alarmem dla przypomnień o przeszkodzie (z planem w opisie), check-inie i przeglądzie.
- Kopia zapasowa wszystkich danych (`.json`) w Ustawieniach.

## PWA, hosting, prywatność

- Manifest (`lang: pl`, standalone, ikony 192/512/maskable, apple-touch-icon), precache wszystkich zasobów, fallback nawigacji do `index.html`, baner „Dostępna nowa wersja”. `public/sw-notifications.js` (dołączany do service workera) otwiera właściwy ekran po kliknięciu w powiadomienie.
- Cloudflare Workers ze statycznymi plikami (`wrangler.jsonc`): build `npm run build`, wdrożenie `npx wrangler deploy` z katalogu `dist`, tryb SPA (`not_found_handling: single-page-application`). `public/_headers` ustawia cache (niezmienne `assets/*`, świeży `sw.js`).
- Prywatna aplikacja: `robots.txt` z `Disallow: /` i `noindex`. Zero analityki, zewnętrznych fontów i skryptów. Powiadomienia są lokalne, bez serwera push.

## Testy

- `npm test`: Vitest, czyli walidatory na przykładach (pozytywnych i negatywnych), wersje skrócone, ramy czasowe, silnik kreatora (kolejność, rozgałęzienia realności, tryb szybki), podsumowanie, checklista, `.ics` (parser `ical.js`), układ karty, statystyki, wersje, harmonogram przypomnień, biblioteka, kopia zapasowa, repozytoria.
- `npm run test:e2e`: Playwright na buildzie produkcyjnym (`vite preview`), w widoku telefonu:
  - Etap 1: przejście całego kreatora wzorcowym WOOP-em, podpowiedzi i „zostaw moją wersję”, przetrwanie szkicu po odświeżeniu i zamknięciu karty, eksporty, offline;
  - Etap 2: „Przeszkoda teraz!”, powtórka, check-in i statystyki, przegląd z nową przeszkodą i historią wersji, zakończenie, szybki WOOP, przykład z biblioteki, eksport/import kopii, „Na dziś”, więcej niż 3 aktywne;
  - skan axe-core wszystkich ekranów poza kreatorem i wybranych kroków kreatora (z podpowiedzią, pauzą, planem) w obu motywach.

## Struktura plików

```
woop-app/
├─ CLAUDE.md · README.md · package.json · vite.config.ts · playwright.config.ts · eslint.config.js · wrangler.jsonc
├─ docs/            SPEC.md · DECISIONS.md · ARCHITECTURE.md
├─ public/          _headers · robots.txt · favicon.svg · sw-notifications.js · icons/*.png
├─ scripts/         generate-icons.mjs (SVG → PNG przez Chromium)
├─ e2e/             wizard · draft · summary · offline · stage2 · a11y (*.spec.ts) · helpers.ts
└─ src/
   ├─ main.tsx · index.css
   ├─ app/          router.tsx · layouts.tsx · theme.ts · time.ts · UpdatePrompt.tsx · Logo.tsx · errors.tsx · useDocumentTitle.ts
   ├─ content/      pl.ts · t.ts
   ├─ domain/
   │  ├─ types.ts · dates.ts · timeframe.ts · woop.ts · plan.ts · shortVersion.ts · ics.ts · reminders.ts
   │  ├─ stats.ts · versioning.ts · review.ts · reminderSchedule.ts · library.ts · backup.ts
   │  ├─ text/        normalize.ts · patterns.ts
   │  ├─ validators/  wish · outcome · obstacle · plan · short · shared · index
   │  ├─ wizard/      steps.ts · engine.ts · lifecycle.ts
   │  ├─ summary/     text · markdown · json · checklist · format
   │  ├─ card/        layout.ts · data.ts
   │  └─ __fixtures__/ reference.ts (wzorcowy WOOP)
   ├─ data/         db.ts · woopRepository.ts · settingsRepository.ts · trackingRepositories.ts · backupService.ts · hooks.ts · index.ts
   ├─ components/ui/ Button · ChipGroup · Slider · Field · Disclosure · ConfirmDialog · PhaseProgress · Notice · FocusHeader · Loading
   ├─ features/
   │  ├─ home/        HomePage · TodayList · ActiveWoopCard
   │  ├─ wizard/      WizardPage · StepLayout · StepBody · steps/* · QuestionHelp · NudgePanel · VisualizationPause · useAutosave
   │  ├─ summary/     SummaryPage · WoopCard · FullAnswers · QualityChecklist · ExportPanel · PrintCard · VersionHistory
   │  ├─ woop/        PlanCard · QuickActions · WoopTabs · useLoadedWoop
   │  ├─ practice/    SosPage · RehearsalPage · CheckinPage
   │  ├─ progress/    ProgressPage · StatTiles · TrendChart · CheckinCalendar · RecentEntries
   │  ├─ review/      ReviewPage · ClosePage
   │  ├─ next-steps/  NextStepsPage
   │  ├─ reminders/   ReminderSettings · NotificationsToggle
   │  ├─ library/     LibraryPage · startDraft
   │  ├─ about/       AboutPage
   │  └─ settings/    SettingsPage · BackupSection
   └─ lib/          clipboard · download · share · cardCanvas · wakeLock · chime · install · pwa · store · notifications · reminderNotifier
```

## Etap 3 (przygotowanie)

Proxy AI jako kod tego samego Workera (`main` w `wrangler.jsonc`, trasy `/api/*`) z kluczem w zmiennych środowiskowych; heurystyki zostają jako fallback. Synchronizację ułatwią warstwa repozytoriów i pola `updatedAt` we wszystkich tabelach. Niezawodne przypomnienia o stałej porze wymagałyby Web Push z serwerem (zob. `DECISIONS.md`, pkt 41).
