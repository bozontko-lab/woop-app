# WOOPmylife

Prywatna aplikacja PWA (mobile-first, po polsku), która prowadzi krok po kroku przez metodę WOOP / MCII (Gabriele Oettingen, Peter Gollwitzer): **Życzenie → Najlepszy rezultat → Przeszkoda → Plan „jeśli–to”**. Tworzy kartę WOOP i pomaga trzymać się planu. Wszystkie dane zostają na urządzeniu (IndexedDB).

- Specyfikacja: [`docs/SPEC.md`](docs/SPEC.md)
- Architektura: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Decyzje i założenia: [`docs/DECISIONS.md`](docs/DECISIONS.md)

## Co jest w aplikacji

- **Kreator WOOP** w stałej kolejności W → O → O → P, z pytaniami pomocniczymi, pauzami na wizualizację, testem realności i podpowiedziami, które niczego nie blokują. Do tego **szybki WOOP na dziś** (ok. 3 min).
- **Karta WOOP**: tekst, PNG (tapeta i kwadrat), wydruk A6, `.md`, `.json`, historia wersji.
- **Codzienne utrzymanie**: „Przeszkoda teraz!” z planem i 2-minutowym licznikiem, powtórka ok. 60 s, check-in poniżej 15 s, lista „Na dziś”.
- **Postępy bez streaków**: odsetek użycia planu, trend tygodniowy, kalendarz, „X z 7 dni”.
- **Przegląd tygodniowy** z wersjonowaniem i **zakończenie** z refleksją.
- **Przypomnienia**: eksport do kalendarza (`.ics` z alarmem) i powiadomienia, gdy aplikacja działa (ograniczenia: `docs/DECISIONS.md`, pkt 41).
- **Biblioteka** (moje przeszkody i plany, gotowe przykłady), **„Jak to działa”**, **kopia zapasowa** JSON.

## Uruchomienie

Wymagany Node.js 22.22+ (wersja w `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:5173
```

| Skrypt             | Co robi                                                       |
| ------------------ | ------------------------------------------------------------- |
| `npm run build`    | sprawdza typy i buduje statyczną wersję do `dist/` (z PWA)    |
| `npm run preview`  | serwuje `dist/` na http://localhost:4173                      |
| `npm test`         | testy jednostkowe (Vitest)                                    |
| `npm run test:e2e` | testy end-to-end i dostępności (Playwright + axe) na buildzie |
| `npm run lint`     | ESLint (TypeScript, hooki Reacta, jsx-a11y)                   |
| `npm run format`   | Prettier                                                      |
| `npm run icons`    | generuje ikony PWA z SVG (Chromium z Playwrighta)             |

Testy E2E używają Playwrighta 1.63. Przy pierwszym uruchomieniu poza tym środowiskiem może być potrzebne `npx playwright install chromium`.

## Edycja treści

Wszystkie teksty interfejsu (pytania, pytania pomocnicze, przykłady, komunikaty podpowiedzi) oraz słowniki walidatorów są w **`src/content/pl.ts`**. Zmiana tekstu nie wymaga zaglądania do komponentów. W słownikach można pisać z polskimi znakami, a składnia wzorców jest opisana nad sekcją `lexicon`.

## Wdrożenie na Cloudflare Pages

1. Cloudflare → **Workers & Pages** → **Create** → **Pages** → połącz repozytorium `bozontko-lab/woop-app`.
2. Ustawienia builda: **Build command** `npm run build`, **Build output directory** `dist`. Wersję Node Cloudflare odczyta z `.nvmrc`.
3. Gotowe. Brak `404.html` sprawia, że Cloudflare sam serwuje `index.html` dla wszystkich ścieżek (tryb SPA), a `public/_headers` ustawia cache i `noindex`.

Każdy push na `main` zbuduje i opublikuje nową wersję. Aplikacja zainstalowana na telefonie pokaże komunikat „Jest nowa wersja aplikacji”.

## Struktura

```
src/
├─ content/      pl.ts – wszystkie teksty i słowniki
├─ domain/       czysta logika: walidatory, silnik kreatora, podsumowanie, .ics, karta PNG,
│                statystyki, wersje, przegląd, przypomnienia, biblioteka, kopia zapasowa
├─ data/         Dexie (IndexedDB) za repozytoriami + hooki
├─ components/   klocki UI (dostępne, z tokenami motywu)
├─ features/     ekrany: kreator, karta, postępy, „Co dalej”, „Przeszkoda teraz!”, powtórka,
│                check-in, przegląd, zakończenie, biblioteka, „Jak to działa”, ustawienia
├─ lib/          integracje z przeglądarką (schowek, pliki, canvas, dźwięk, PWA, powiadomienia)
└─ app/          router, layouty, motyw
e2e/             testy Playwright (kreator, szkic, eksporty, offline, Etap 2, dostępność)
```

## Prywatność

Bez kont, bez serwera, bez analityki i bez zewnętrznych skryptów czy fontów. Dane są w pamięci przeglądarki na tym urządzeniu. Wyczyszczenie danych przeglądarki usuwa też WOOP-y, dlatego warto co jakiś czas pobrać kopię zapasową (**Ustawienia → Kopia zapasowa**). Plik JSON można potem wczytać na tym samym albo innym urządzeniu.

## Metoda

WOOP (Wish, Outcome, Obstacle, Plan) i MCII to metoda opracowana przez Gabriele Oettingen na podstawie badań nad kontrastowaniem mentalnym i planami „jeśli–to” (implementation intentions, Peter Gollwitzer). Więcej: [woopmylife.org](https://woopmylife.org). Ta aplikacja to prywatny, niezależny projekt.
