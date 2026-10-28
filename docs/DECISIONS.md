# Decyzje i założenia

Tu zapisujemy doprecyzowania specyfikacji (`docs/SPEC.md`) i założenia przyjęte w trakcie pracy. Każdy wpis: co ustaliliśmy i dlaczego.

## Ustalenia z pytań doprecyzowujących (2026-10-28)

1. **Odbiorcy: tylko ja i bliscy.** Bez landingu pod SEO i bez Astro. Aplikacja działa pod `/`, a sekcja „Jak to działa” jest w środku. `robots.txt` blokuje indeksowanie, w `index.html` jest `noindex`.
2. **Hosting: Cloudflare Pages.** Build `npm run build` → `dist/`. Bez pliku `404.html` Cloudflare Pages sam serwuje `index.html` dla nieznanych ścieżek (tryb SPA). Nagłówki cache w `public/_headers`. Proxy AI w Etapie 3 jako Pages Function.
3. **Nazwa: „WOOPmylife”** (wybór użytkownika). Uwaga: to też nazwa oficjalnej strony metody (woopmylife.org), do której linkujemy w „Jak to działa”. Przy prywatnym użytku to w porządku. Przed ewentualną publikacją warto zmienić nazwę, a jest ona w jednej stałej (`pl.app.name` w `src/content/pl.ts`) i w manifeście (`vite.config.ts`). Nie używamy oficjalnego logo ani identyfikacji wizualnej WOOP. Kolory i ikona są własne.
4. **Repozytorium: `bozontko-lab/woop-app`** na GitHubie. Pushujemy po każdym etapie.

## Założenia przyjęte bez pytania

5. **Formy neutralne rodzajowo** (pierwsza opcja ze specyfikacji): pytania i komunikaty bez czasowników w czasie przeszłym w formie rodzajowej („Udało się?”, „Co ci przeszkodziło?”). Bez pytania o formę na starcie.
6. **Konta i synchronizacja dopiero w Etapie 3.** Dane wyłącznie w IndexedDB, za warstwą repozytoriów. Rekordy mają `updatedAt`. Usuwanie jest na razie trwałe (synchronizacja dołoży „nagrobki”).
7. **Ramy czasowe liczone kroczącym oknem**: „Dziś” = dzisiaj, „Najbliższy tydzień” = 7 dni od dziś, „Najbliższy miesiąc” = do tego samego dnia następnego miesiąca, „Do konkretnej daty” = wybrana data (nie wcześniejsza niż dziś). W specyfikacji jest „ten tydzień / ten miesiąc”. Kalendarzowy „ten miesiąc” wybrany 28 października trwałby 3 dni, a sama metoda (i wzorcowy WOOP: „przez najbliższy miesiąc”) myśli kroczącymi okresami. Etykiety można zmienić w `pl.ts`. Data końcowa jest zawsze pokazana obok.
8. **Pola wymagane** (wymuszane): ramy czasowe; treść życzenia, ważność; treść rezultatu; treść przeszkody; realność; część „jeśli” i „to” planu; wersje skrócone (podpowiadamy je automatycznie, więc zwykle wystarczy zatwierdzić). Opcjonalne: obszar, kryterium sukcesu (przy pustym polu pojawia się zachęta, a nie blokada), „A co ci to da?”, typ przeszkody, kiedy/gdzie/o której, plan awaryjny.
9. **Suwaki 1–10 nie mają wartości domyślnej.** Wartość zapisuje się dopiero po dotknięciu, kliknięciu albo użyciu klawiatury, żeby środek skali nie był „podsuwaną” odpowiedzią.
10. **Rozszerzenia modelu danych** względem szkicu:
    - `outcome.deeper: string[]`: odpowiedzi na „A co ci to da?” (1–2 poziomy),
    - `obstacle.time?: "HH:MM"`: przybliżona pora przeszkody, używana w przypomnieniach `.ics`,
    - `plan.short`: wersja skrócona planu na kartę (zasada 6 dotyczy każdego elementu),
    - `parkedObstacles: string[]`: pozostałe przeszkody, gdy wpisano kilka naraz (kandydaci na kolejny WOOP),
    - `timeframe.startDate`, `reviewDate`, `mode` (`full`/`quick`), `closing` (zakończenie z refleksją), `wizard` (stan kreatora szkicu: bieżący krok, odrzucone podpowiedzi).
11. **Kolejność i powroty**: „Wstecz” cofa o jeden ekran. Pasek W–O–O–P tylko informuje, nie służy do przeskakiwania. Powrót z testu realności do życzenia zachowuje dane, ale prowadzi znów przez rezultat i przeszkodę (kontrastowanie robimy od nowa dla zmienionego życzenia). Przy poprawkach z checklisty („Popraw”) ukończonego WOOP-a jest też skrót „Zapisz i wróć do podsumowania”.
12. **Wizualizacja**: odliczanie startuje po kliknięciu „Zaczynam”, żeby najpierw przeczytać instrukcję. Domyślnie 30 s (do wyboru 30/45/60 s, zapamiętywane w ustawieniach), dla planu 15 s. Na koniec delikatny dźwięk (Web Audio, można wyłączyć) i wibracja, bo oczy są zamknięte. Na czas pauzy Wake Lock trzyma ekran włączony. Przy `prefers-reduced-motion` koło oddechu nie pulsuje, a zamiast animacji zmieniają się napisy „Wdech / Wydech”.
13. **PNG rysujemy na Canvas 2D**, a nie przez `html-to-image`: przewidywalny wynik w Safari, systemowe fonty, brak zależności. Tapeta 9:16 zostawia górne ~30% na zegar ekranu blokady.
14. **Wydruk A6** przez `@page { size: A6 }`. Safari ignoruje `size`, więc w oknie druku trzeba wtedy wybrać format ręcznie (podpowiedź w UI).
15. **Edycja po ukończeniu w Etapie 1** zmienia WOOP w miejscu, bez nowej wersji. Wersjonowanie z historią (`version`, `history[]`) wchodzi w Etapie 2 razem z przeglądem tygodniowym.
16. **Język kodu**: identyfikatory i komentarze po angielsku, dokumentacja i UI po polsku. Ścieżki URL po angielsku (`/wizard/:id`, `/woop/:id`, `/settings`). Aplikacja jest prywatna i działa w trybie standalone, gdzie adresu nie widać.
17. **Motyw**: jasny / ciemny / systemowy (domyślnie systemowy), zapamiętany w `localStorage` i ustawiany skryptem w `index.html` przed pierwszym renderem (bez mignięcia). Pozostałe ustawienia leżą w IndexedDB, więc trafią do kopii zapasowej.
18. **Wersje narzędzi**: TypeScript 6.0 zamiast 7.0, bo `typescript-eslint` wspiera TS < 6.1. ESLint 9, bo `eslint-plugin-jsx-a11y` nie wspiera jeszcze ESLint 10. `@playwright/test` przypięty do 1.63.0, czyli wersji przeglądarek preinstalowanych w środowisku.

## Etap 1 – decyzje implementacyjne

19. **Szkic odporny na zamknięcie karty.** Każda zmiana w kreatorze trafia od razu, synchronicznie, do kopii w `localStorage` (`woopRepository.stash`), a z opóźnieniem ~250 ms do IndexedDB. Przy starcie aplikacji i przy otwarciu kreatora kopie nowsze niż zapis w IndexedDB są odtwarzane (`woopRepository.recover`). Powód: zapis do IndexedDB rozpoczęty przy zamykaniu karty bywa przerywany, co wyszło w teście E2E.
20. **Systemowy „Wstecz”** (telefon, przeglądarka) w kreatorze cofa o jeden krok, zamiast wychodzić z kreatora (`useBlocker` z React Routera). Na pierwszym ekranie wychodzi normalnie.
21. **Podpowiedzi pokazujemy po jednej**, w kolejności ważności. „Zostaw moją wersję” zapamiętuje decyzję dla danej treści pola (odcisk tekstu), więc ta sama podpowiedź nie wraca, dopóki tekst się nie zmieni.
22. **Wersje skrócone są podpowiadane automatycznie** (całe frazy po przecinkach, cięcie przed przyimkiem lub spójnikiem; dla przeszkody emocja + „wewnętrzny głos” z cudzysłowu; dla planu „wyzwalacz → działanie”). Pole jest od razu wypełnione, a użytkownik zatwierdza je albo poprawia.
23. **Konstruktor planu** wypełnia część „jeśli” przeszkodą z kroku 3 uzupełnioną o „kiedy/gdzie”. Gdy „kiedy” już jest w treści, „gdzie” trafia tuż za nim („po pracy w domu czuję…”).
24. **Typ przeszkody jest tylko podpowiadany** („Wygląda na: Myśl / wymówka”), nigdy zaznaczany automatycznie. Przy remisie przekonanie wygrywa z myślą („myślę, że się nie nadaję” to przekonanie).
25. **Komunikaty PWA** wyświetlamy u góry ekranu, żeby nie zasłaniały przycisków kreatora. „Gotowa do pracy bez internetu” znika sama po 5 s, „Jest nowa wersja” czeka na decyzję. Aktualizacja nigdy nie przeładowuje strony bez zgody, bo w trakcie kreatora byłoby to niebezpieczne.
26. **Prośba o trwałą pamięć** (`navigator.storage.persist()`) pada po zapisaniu pierwszego WOOP-a, a nie przy wejściu. Znane ograniczenie: Safari na iOS może po 7 dniach bez wizyty usunąć dane stron, które **nie** są dodane do ekranu początkowego. Zainstalowana PWA tego ograniczenia nie ma, dlatego „Co dalej” zachęca do instalacji. Kopia zapasowa JSON przyjdzie w Etapie 2.
27. **Alarm w `.ics`**: `TRIGGER:PT0S` (alarm w chwili wydarzenia), wydarzenia z „pływającym” czasem lokalnym (bez strefy), cykl `DAILY` albo `WEEKLY;BYDAY=…` do końca ram czasowych, linie zawijane do 75 bajtów (RFC 5545). Poprawność sprawdza test z parserem `ical.js`. Zachowanie alarmów po imporcie do Google i Apple Calendar zweryfikujemy w Etapie 2 (punkt 8 specyfikacji).
28. **Bundle**: React, React Router i Dexie są w osobnych chunkach, żeby aktualizacja aplikacji nie wymuszała ponownego pobierania bibliotek. Całość ~178 KB gzip i cała trafia do precache (offline).
29. **Ikona i znak** są własne: cztery wznoszące się kroki w kolorach faz W–O–O–P, generowane skryptem `npm run icons`.
30. **Repozytorium**: kod trafia na gałąź `main` nowego, pustego repozytorium założonego na potrzeby projektu. Cloudflare Pages może z niej publikować automatycznie.
31. **Narzędzia testowe**: `@axe-core/playwright` ma wymuszony `playwright-core@1.63.0` (`overrides` w `package.json`), zgodny z przeglądarkami w środowisku. Lighthouse 13 (dostępność) uruchamiany ręcznie, wyniki w podsumowaniu etapu.
