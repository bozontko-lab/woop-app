# CLAUDE.md

PWA (mobile-first, interfejs po polsku), która prowadzi przez protokół WOOP / MCII (Gabriele Oettingen, Peter Gollwitzer), tworzy kartę WOOP i pomaga trzymać się planu.

- Pełna specyfikacja: `docs/SPEC.md` (oryginał, nie edytujemy).
- Założenia i decyzje: `docs/DECISIONS.md`. Gdy coś jest niejasne: wybierz rozsądne rozwiązanie, dopisz je tam i pracuj dalej.

## Zasady metody (aplikacja musi ich pilnować)

1. Stała kolejność: Życzenie → Najlepszy rezultat → Przeszkoda → Plan. Najpierw pozytywna wizja, zaraz po niej przeszkoda (kontrastowanie mentalne). Nie da się przeskoczyć do planu.
2. Życzenie: ważne, ambitne, ale realne, z ramami czasowymi i zależne głównie od użytkownika.
3. Rezultat i przeszkodę trzeba sobie wyobrazić (pauza na wizualizację), a nie tylko wpisać.
4. Przeszkoda jest wewnętrzna (emocja, nawyk, myśl, przekonanie, impuls). Okoliczności zewnętrzne przekładamy na reakcję użytkownika.
5. Jedna główna przeszkoda → jeden plan: „Jeśli [przeszkoda], to [konkretne działanie lub myśl]”.
6. Każdy element ma wersję skróconą (3–6 słów). To ona trafia na kartę.
7. Niska realność to też dobry wynik: proponujemy zmianę życzenia albo świadome odpuszczenie.
8. Podpowiedzi i walidatory **sugerują, nie blokują**. Wymuszamy tylko kolejność kroków i pola obowiązkowe.

## Ton i treści

- Ciepło, na „ty”, jak dobry coach. Nie oceniamy, nie moralizujemy.
- Bez form rodzajowych w tekstach do użytkownika (np. „Udało się?” zamiast „Zrobiłeś?”).
- **Wszystkie teksty UI** (pytania, podpowiedzi, przykłady, komunikaty walidacji, etykiety) są w `src/content/pl.ts`. Komponenty nie zawierają polskich napisów.
- Słowniki walidatorów (rdzenie słów) też leżą w `src/content/pl.ts`, logika dopasowania w `src/domain/validators/`.

## Stack

- Vite + React + TypeScript (strict) + Tailwind CSS.
- Dane lokalnie w IndexedDB (Dexie) **wyłącznie przez warstwę repozytorium** (`src/data/`). Komponenty nie importują Dexie bezpośrednio — to ma umożliwić późniejszą synchronizację.
- PWA przez `vite-plugin-pwa` (instalacja, offline).
- Statyczny build (`npm run build` → `dist/`), bez backendu w Etapach 1–2.
- Testy: Vitest (logika domenowa: walidatory, generator podsumowania, eksporty), Playwright (przejście kreatora end-to-end).

## Konwencje

- Kod, identyfikatory i komentarze po angielsku; dokumentacja i teksty UI po polsku.
- Logika domenowa (`src/domain/`) jest czysta: bez Reacta, bez Dexie, w pełni testowalna.
- Dostępność WCAG 2.1 AA: semantyczny HTML, pełna obsługa klawiatury, widoczny focus, `prefers-reduced-motion`, kontrast w obu motywach (jasny/ciemny).
- Daty jako ISO (`YYYY-MM-DD` dla dni, pełny ISO dla znaczników czasu). Identyfikatory: `crypto.randomUUID()`.

## Prywatność

Wszystkie dane zostają na urządzeniu. Treść WOOP-ów nie trafia do analityki ani nigdzie na zewnątrz. Żadnych zewnętrznych skryptów, fontów z CDN ani trackerów. Wyjątek: funkcje Etapu 3, jeśli użytkownik je włączy.

## Komendy

- `npm run dev` / `npm run build` / `npm run preview`
- `npm test` (Vitest), `npm run test:e2e` (Playwright na buildzie, port 4173), `npm run lint`, `npm run format`
- Przed commitem: `npm run lint && npm run build && npm test && npm run test:e2e`

## Gdzie co jest

- Kroki kreatora i ich kolejność: `src/domain/wizard/steps.ts` (silnik: `engine.ts`). Ekrany kroków: `src/features/wizard/steps/`.
- Walidatory (podpowiedzi): `src/domain/validators/`. Komunikaty podpowiedzi: `pl.nudges` w `src/content/pl.ts`.
- Wzorcowy WOOP do testów: `src/domain/__fixtures__/reference.ts`. Musi przechodzić bez żadnej podpowiedzi (`src/domain/reference.test.ts`).
- Zapis: wyłącznie przez repozytoria z `src/data/` (`woopRepository`, `settingsRepository`, `checkinRepository`, `practiceRepository`, `reviewRepository`, `reminderRepository`, `backup`).
- Statystyki i zasada liczenia sytuacji z przeszkodą: `src/domain/stats.ts`. Wersje: `versioning.ts`, przegląd: `review.ts`.
- Przypomnienia: `src/domain/reminders.ts` (domyślne + `.ics`) i `reminderSchedule.ts` („Na dziś”, powiadomienia). Ograniczenia (iOS, kalendarze): `docs/DECISIONS.md`, pkt 41.
- Kopia zapasowa: `src/domain/backup.ts` + `src/data/backupService.ts`. Zmiana formatu = podbicie `BACKUP_SCHEMA_VERSION` i obsługa starszych plików.
- Testy E2E zakładają dane względem dzisiejszej daty (`freshWoop`, `seed` w `e2e/helpers.ts`), nigdy na sztywno wpisane daty.

## Sposób pracy

- Etapami (Etap 1 → 2 → 3). Po każdym etapie: `npm run build` bez błędów, `npm test` i `npm run test:e2e` przechodzą, commit, krótkie podsumowanie i lista rzeczy do ręcznego sprawdzenia.
- Etap 3 dopiero po akceptacji Etapów 1–2. Klucz API (np. Claude) nigdy we frontendzie — tylko przez backend proxy.
