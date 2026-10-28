# Architektura

Prywatna PWA (local-first) hostowana jako statyczny build na Cloudflare Pages. Bez backendu w Etapach 1–2.

## Stack

| Obszar | Wybór                                                                                                      |
| ------ | ---------------------------------------------------------------------------------------------------------- |
| Build  | Vite 8, TypeScript 6.0 (strict)                                                                            |
| UI     | React 19, React Router 8 (tryb danych, `createBrowserRouter`)                                              |
| Style  | Tailwind CSS 4 (`@tailwindcss/vite`), tokeny kolorów jako zmienne CSS, motyw jasny/ciemny/systemowy        |
| Ikony  | `lucide-react` (bundlowane lokalnie, bez CDN)                                                              |
| Dane   | IndexedDB przez Dexie 4 + `dexie-react-hooks`, schowane za repozytoriami w `src/data/`                     |
| PWA    | `vite-plugin-pwa` (Workbox `generateSW`, precache całej aplikacji, monit o aktualizację)                   |
| Testy  | Vitest 5 (logika domenowa, repozytoria na `fake-indexeddb`), Playwright 1.63 + axe-core (E2E i dostępność) |
| Lint   | ESLint 9 + typescript-eslint + react-hooks + jsx-a11y                                                      |

## Warstwy

```
content (pl.ts)  ──►  domain (czysta logika)  ◄──  data (Dexie, repozytoria)
       ▲                      ▲                          ▲
       └──────────── features (ekrany) + components/ui ──┘
```

- **`src/content/pl.ts`**: jedyne miejsce z tekstami UI: pytania, pytania pomocnicze, przykłady, „Dlaczego o to pytam?”, komunikaty podpowiedzi, etykiety, a także słowniki rdzeni dla walidatorów. Szablony z `{parametrami}`, wypełniane helperem `t()`.
- **`src/domain/`**: TypeScript bez Reacta i bez Dexie. Typy, normalizacja tekstu, walidatory, silnik kreatora (lista kroków, kolejność, pola wymagane), generator wersji skróconych, podsumowanie (tekst/MD/JSON), checklista jakości, generator `.ics`, układ karty PNG. W całości pokryte testami Vitest.
- **`src/data/`**: schemat Dexie, repozytoria (`WoopRepository`, `SettingsRepository`, w Etapie 2 też check-iny, powtórki, przeglądy, przypomnienia) i hooki React (`useWoop`, `useWoops`…). Komponenty nie importują Dexie. Podmiana implementacji repozytorium pod synchronizację nie dotknie UI.
- **`src/features/`**: ekrany pogrupowane funkcjami (kreator, podsumowanie, „Co dalej”, ekran główny, ustawienia; w Etapie 2 także SOS, powtórka, check-in, statystyki, przegląd, biblioteka, „Jak to działa”, kopia zapasowa).
- **`src/components/ui/`**: dostępne klocki: przycisk, chipy (natywne radio), suwak (natywny `range`), pole tekstowe z autowysokością, rozwijane sekcje (`<details>`), okno dialogowe (`<dialog>`), pasek postępu W–O–O–P.
- **`src/lib/`**: integracje z przeglądarką: schowek, pobieranie plików, Web Share, rysowanie karty na canvasie, Wake Lock, dźwięk końca pauzy (Web Audio), instalacja PWA.

## Kreator

Silnik to deklaratywna lista kroków (`src/domain/wizard/steps.ts`). Każdy krok ma `id`, fazę (start / W / O / O / test realności / P), rodzaj ekranu, warunek „wymagane pola uzupełnione” i walidatory. Silnik:

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

Autozapis: każda zmiana trafia do rekordu `Woop` o statusie `draft` w IndexedDB (debounce ~250 ms + natychmiastowy zapis przy `visibilitychange`/`pagehide`).

## Walidatory (heurystyki)

- Normalizacja: małe litery, usunięte polskie znaki, interpunkcja → spacje, podział na tokeny.
- Wzorce w słownikach (`pl.ts`): `czas` = rdzeń (łapie „czasu”, „czasem”), `=sam` = dokładne słowo, `nie mam czas` = sekwencja rdzeni, `!czasopism` = wyjątek.
- Każdy walidator zwraca listę podpowiedzi `{ code, field, matches, options? }`; treść komunikatu pochodzi z `pl.ts` po kodzie.
- Przykładowe reguły: ogólnik bez miary (cyfry, „razy”, „minut”, „codziennie”…), cel zależny od innych, zaprzeczenie, rezultat powtarzający życzenie bez odczuwalnej korzyści, przeszkoda zewnętrzna bez wewnętrznych markerów („czuję”, „mówię sobie”, „zamiast”…), kilka przeszkód naraz, plan z „postaram się / spróbuję / muszę / będę bardziej”, część „to” bez czasownika w 1. osobie, część „jeśli” opisująca życzenie, wersja skrócona dłuższa niż 6 słów.
- Wzorcowy WOOP ze specyfikacji przechodzi bez żadnej podpowiedzi (test regresyjny).

## Model danych

Zgodny ze szkicem ze specyfikacji, z rozszerzeniami opisanymi w `DECISIONS.md`:

```ts
Woop {
  id, createdAt, updatedAt, mode: 'full' | 'quick',
  timeframe { type: 'today' | 'week' | 'month' | 'date', startDate, endDate },
  area | null,
  wish { text, short, successCriterion, importance },
  outcome { text, short, deeper: string[] },
  obstacle { text, short, type, when, where, time? },
  parkedObstacles: string[],          // kandydaci na kolejny WOOP
  realism,
  plan { ifText, thenText, backupPlan?, short },
  reviewDate?, status, version, history: WoopSnapshot[],
  closing? { outcome, reflection, closedAt },
  wizard? { stepId, dismissed, ... }   // stan kreatora, tylko dla szkiców
}
```

Etap 2 dokłada tabele `checkins`, `practices` (powtórki i użycia „Przeszkoda teraz!”), `reviews`, `reminders` (migracja wersji schematu Dexie).

## Eksporty

- Tekst do schowka (Clipboard API z fallbackiem).
- PNG rysowany na Canvas 2D: 1080×1920 (tapeta: treść poniżej zegara ekranu blokady) i 1080×1080. Układ liczony czystą funkcją (testowalny), rysowanie w `src/lib`. Na telefonie dodatkowo „Udostępnij” (Web Share z plikiem).
- Wydruk: osobny widok karty z `@page { size: A6 }`.
- `.md` i `.json` (z polem `schemaVersion`).
- `.ics` z ekranu „Co dalej”: cykliczne przypomnienie z alarmem o porze przeszkody + wydarzenie przeglądu.

## PWA, hosting, prywatność

- Manifest (`lang: pl`, standalone, ikony 192/512/maskable, apple-touch-icon), precache wszystkich zasobów, fallback nawigacji do `index.html`, baner „Dostępna nowa wersja”.
- Cloudflare Pages: build `npm run build`, katalog `dist`. Brak `404.html` = automatyczny tryb SPA. `public/_headers` ustawia cache (niezmienne `assets/*`, świeży `sw.js`).
- Prywatna aplikacja: `robots.txt` z `Disallow: /` i `noindex`. Zero analityki, zewnętrznych fontów i skryptów.

## Testy

- `npm test`: Vitest, czyli walidatory na przykładach (pozytywnych i negatywnych), wersje skrócone, ramy czasowe, silnik kreatora (kolejność, rozgałęzienia realności), podsumowanie, checklista, `.ics`, układ karty, repozytoria.
- `npm run test:e2e`: Playwright na buildzie produkcyjnym (`vite preview`), w widoku telefonu: przejście całego kreatora wzorcowym WOOP-em, podpowiedzi i „zostaw moją wersję”, przetrwanie szkicu po odświeżeniu i zamknięciu karty, eksporty, offline, skan axe-core.

## Struktura plików

```
woop-app/
├─ CLAUDE.md · README.md · package.json · vite.config.ts · playwright.config.ts · eslint.config.js
├─ docs/            SPEC.md · DECISIONS.md · ARCHITECTURE.md
├─ public/          _headers · robots.txt · favicon.svg · icons/*.png
├─ scripts/         generate-icons.mjs (SVG → PNG przez Chromium)
├─ e2e/             wizard.spec.ts · draft.spec.ts · summary.spec.ts · offline.spec.ts · a11y.spec.ts · helpers.ts
└─ src/
   ├─ main.tsx · index.css
   ├─ app/          App.tsx · router.tsx · AppShell.tsx · theme.ts · UpdatePrompt.tsx
   ├─ content/      pl.ts · t.ts
   ├─ domain/
   │  ├─ types.ts · timeframe.ts · shortVersion.ts · ics.ts
   │  ├─ text/        normalize.ts · patterns.ts
   │  ├─ validators/  wish.ts · outcome.ts · obstacle.ts · plan.ts · short.ts · index.ts
   │  ├─ wizard/      steps.ts · engine.ts
   │  ├─ summary/     text.ts · markdown.ts · json.ts · checklist.ts
   │  └─ card/        layout.ts
   ├─ data/         db.ts · woopRepository.ts · settingsRepository.ts · hooks.ts
   ├─ components/ui/ Button · ChipGroup · Slider · TextArea · Disclosure · Dialog · PhaseProgress …
   ├─ features/
   │  ├─ home/        HomePage
   │  ├─ wizard/      WizardPage · StepRenderer · steps/* · QuestionHelp · NudgePanel · VisualizationPause
   │  ├─ summary/     SummaryPage · WoopCard · QualityChecklist · ExportPanel · PrintCard
   │  ├─ next-steps/  NextStepsPage
   │  └─ settings/    SettingsPage
   └─ lib/          clipboard.ts · download.ts · share.ts · cardCanvas.ts · wakeLock.ts · chime.ts · install.ts
```

## Etap 2 (zarys)

Ekran główny z aktywnymi WOOP-ami (informacja przy więcej niż 3), „Przeszkoda teraz!” (duży plan + licznik 2 min + zapis użycia), codzienna powtórka ~60 s, check-in < 15 s, statystyki bez karzących streaków (odsetek użycia planu, trend tygodniowy, kalendarz), prowadzony przegląd tygodniowy z wersjonowaniem, zakończenie z refleksją, przypomnienia (`.ics` + powiadomienia tam, gdzie się da), „Szybki WOOP” (ten sam silnik, tryb `quick`), biblioteka (moje przeszkody i plany + gotowe przykłady), „Jak to działa”, kopia zapasowa JSON (eksport/import).

## Etap 3 (przygotowanie)

Proxy AI jako Cloudflare Pages Function (`functions/api/feedback.ts`) z kluczem w zmiennych środowiskowych; heurystyki zostają jako fallback. Synchronizację ułatwi warstwa repozytoriów i pola `updatedAt`.
