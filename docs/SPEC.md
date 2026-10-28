# Specyfikacja (oryginał)

> Treść zadania w brzmieniu przekazanym 2026-10-28. Zmiany i doprecyzowania zapisujemy w `docs/DECISIONS.md`, a nie tutaj.

# Zadanie

Zbuduj aplikację webową (PWA, mobile-first, interfejs po polsku), która:
1. prowadzi użytkownika krok po kroku przez protokół WOOP / MCII (Mental Contrasting with Implementation Intentions – Gabriele Oettingen, Peter Gollwitzer), zadaje pytania pomocnicze i naprowadza na poprawnie sformułowany WOOP,
2. generuje czytelne podsumowanie (kartę WOOP),
3. pomaga trzymać się planu w kolejnych dniach i tygodniach.

Aplikacja ma działać jak dobry coach: pyta po kolei, podsuwa pytania pomocnicze, wyłapuje typowe błędy i proponuje poprawki. Nie ocenia i nie moralizuje.

## Zasady metody (aplikacja musi ich pilnować)

1. Stała kolejność: Życzenie (Wish) → Najlepszy rezultat (Outcome) → Przeszkoda (Obstacle) → Plan. Najpierw pozytywna wizja, zaraz po niej przeszkoda. To zestawienie (kontrastowanie mentalne) jest sednem metody. Nie da się przeskoczyć do planu.
2. Życzenie: ważne, ambitne, ale realne, z ramami czasowymi i zależne głównie od użytkownika.
3. Rezultat i przeszkodę trzeba sobie wyobrazić (krótka pauza na wizualizację), a nie tylko wpisać.
4. Przeszkoda jest wewnętrzna: emocja, nawyk, myśl, przekonanie, impuls. Okoliczności zewnętrzne („brak czasu”, „szef”) przekładamy na reakcję użytkownika, na którą ma wpływ.
5. Jedna główna przeszkoda → jeden plan w formie: „Jeśli [przeszkoda], to [konkretne działanie lub myśl]”.
6. Każdy element ma wersję skróconą (kilka słów, np. 3–6). To ona trafia na kartę.
7. Jeśli po zestawieniu rezultatu z przeszkodą życzenie wydaje się mało realne, to też dobry wynik. Aplikacja proponuje wtedy zmianę życzenia albo świadome odpuszczenie (MCII wzmacnia zaangażowanie w realne cele i ułatwia rezygnację z nierealnych).
8. Podpowiedzi i walidatory sugerują, a nie blokują. Zawsze można zostawić własną wersję. Wymuszamy tylko kolejność kroków i pola obowiązkowe.

## Jak masz pracować

1. Zainicjuj repozytorium git (jeśli go nie ma). Zapisz tę specyfikację jako docs/SPEC.md, a najważniejsze zasady (metoda, stack, konwencje) w CLAUDE.md.
2. Zanim zaczniesz kodować, zadaj mi maksymalnie 5 pytań doprecyzowujących (np. czy aplikacja ma być publiczna czy tylko dla mnie, gdzie będzie hostowana, czy potrzebne są konta i synchronizacja). Potem pokaż plan architektury i strukturę plików.
3. Pracuj etapami: Etap 1 → Etap 2 → Etap 3. Po każdym etapie: build bez błędów, testy przechodzą, commit, krótkie podsumowanie i lista rzeczy do ręcznego sprawdzenia.
4. Wszystkie teksty interfejsu (pytania, podpowiedzi, przykłady, komunikaty walidacji) trzymaj w jednym pliku, np. src/content/pl.ts, żeby dało się je edytować bez grzebania w komponentach.
5. Gdy coś jest niejasne, wybierz rozsądne rozwiązanie, zapisz założenie w docs/DECISIONS.md i działaj dalej.

## Stack (domyślny, chyba że ustalimy inaczej)

- Vite + React + TypeScript + Tailwind CSS.
- Dane lokalnie (IndexedDB przez Dexie) za warstwą repozytorium, żeby później dało się dodać synchronizację.
- PWA (vite-plugin-pwa): instalacja na telefonie, działanie offline.
- Statyczny build, który da się wrzucić na zwykły hosting albo na Netlify/Vercel/Cloudflare Pages.
- Testy: Vitest dla logiki (walidatory, generator podsumowania), Playwright dla przejścia całego kreatora.
- Jeśli aplikacja ma być publiczna i liczy się SEO: prerenderowany landing z treścią o metodzie (np. Astro), kreator pod /app.

## Etap 1 – Kreator WOOP (MVP)

### UX
- Jedno pytanie na ekran, pasek postępu W–O–O–P, przycisk „Wstecz”, autozapis szkicu (po zamknięciu karty można wrócić).
- Przy każdym pytaniu:
  - rozwijane „Dlaczego o to pytam?”,
  - przycisk „Potrzebuję pomocy” (jedno pytanie pomocnicze naraz + „Inne pytanie”),
  - 1–2 przykłady.
- Podpowiedzi naprowadzające pokazuj po kliknięciu „Dalej”, a nie w trakcie pisania.
- Pauza na wizualizację: ekran „Zamknij oczy i wyobraź sobie…” z łagodną animacją oddechu i licznikiem 30–60 s, z opcją „Pomiń”. Szanuj prefers-reduced-motion.
- Ton ciepły, na „ty”. Bez form rodzajowych („Udało się?” zamiast „Zrobiłeś?”) albo z pytaniem na starcie o preferowaną formę.
- Dostępność WCAG 2.1 AA, pełna obsługa klawiatury, tryb ciemny.

### Krok 0 – Start
- 2–3 zdania o metodzie. Informacja, że zajmie to ok. 5–10 minut i najlepiej zrobić to w spokoju.
- Ramy czasowe: dziś / ten tydzień / ten miesiąc / do konkretnej daty.
- Obszar (opcjonalnie): zdrowie, ruch, praca, nauka, relacje, finanse, inne.

### Krok 1 – Życzenie (W)
Pytanie główne: „Jakie ważne życzenie chcesz spełnić [w wybranym czasie]? Niech będzie ambitne, ale realne.”

Pytania pomocnicze:
- Co sprawiłoby, że uznasz ten [okres] za udany?
- Co odkładasz od dawna, choć wiesz, że jest dla ciebie ważne?
- Gdyby dało się zmienić jedną rzecz w obszarze [obszar], co by to było?

Doprecyzowanie:
- „Po czym poznasz, że się udało?” (kryterium sukcesu)
- „Jak bardzo ci na tym zależy?” (suwak 1–10)
- wersja skrócona na kartę

Naprowadzanie:
- Ogólniki („więcej”, „lepiej”, „bardziej”, „zacząć”) → dopytaj o konkret i miarę.
- Cel zależny od innych („dostać awans”, „żeby ktoś mnie docenił”) → pomóż przeformułować na to, co zależy od użytkownika.
- Ważność ≤ 4 → „Czy to na pewno twoje życzenie, a nie coś, co po prostu wypada zrobić?”
- Zaprzeczenie („nie jeść słodyczy”) → zaproponuj (nie wymuszaj) wersję „do czego dążę”.

### Krok 2 – Najlepszy rezultat (O)
Pytanie główne: „Jaki będzie najlepszy rezultat spełnienia tego życzenia? Jak się wtedy poczujesz?”

Pytania pomocnicze:
- Co się zmieni w twoim zwykłym dniu?
- Co pomyślisz o sobie? Kto to zauważy?
- „A co ci to da?” – zadawane 1–2 razy, aż dojdziemy do osobistej, odczuwalnej korzyści.

Potem pauza na wizualizację rezultatu i wersja skrócona.

Naprowadzanie: jeśli rezultat tylko powtarza życzenie („schudnę 5 kg”), dopytaj o odczuwalną korzyść.

### Krok 3 – Przeszkoda (O)
Pytanie główne: „Co w tobie najbardziej powstrzymuje cię przed spełnieniem tego życzenia?”

Pytania pomocnicze:
- Przypomnij sobie ostatnią próbę, która nie wyszła. Co działo się w twojej głowie tuż przed odpuszczeniem?
- W jakiej sytuacji najczęściej odpuszczasz? Co wtedy czujesz albo myślisz?
- Co sobie mówisz, kiedy odkładasz to na później?

Typ przeszkody (chipy): emocja, nawyk, myśl/wymówka, przekonanie o sobie, pokusa/impuls, inne.

Kontekst: „Kiedy zwykle się pojawia?” i „Gdzie?”. Te pola zasilą plan i przypomnienia.

Potem pauza na wizualizację przeszkody i wersja skrócona.

Naprowadzanie:
- Słowa sugerujące przeszkodę zewnętrzną (czas, praca, szef, dzieci, pieniądze, pogoda, inni ludzie) → „To okoliczność zewnętrzna. Co w tobie sprawia, że cię zatrzymuje? Jak na nią reagujesz?” Przykład: „brak czasu” → „wieczorem zamiast ćwiczyć, scrolluję telefon”.
- Kilka przeszkód naraz → poproś o wybór tej, która przeszkadza najbardziej. Resztę zapisz jako kandydatów na kolejny WOOP.
- Dopasowanie słów: normalizuj tekst (małe litery, bez polskich znaków) i dopasowuj po rdzeniach („czas” ma łapać „czasu”, „czasem”).

### Test realności (po kroku 3)
„Teraz, gdy widzisz i rezultat, i przeszkodę – jak realne jest spełnienie tego życzenia?” (1–10)
- 7–10 → przejdź do planu.
- 4–6 → zaproponuj doprecyzowanie lub zawężenie życzenia, ale pozwól iść dalej.
- 1–3 → trzy opcje:
  - zmień lub zmniejsz życzenie (powrót do kroku 1 z zachowaniem danych),
  - odpuść świadomie (status „odpuszczone” + krótka refleksja),
  - kontynuuj mimo to.

### Krok 4 – Plan (P)
Pytanie główne: „Co zrobisz albo co sobie pomyślisz, kiedy pojawi się ta przeszkoda? Wybierz jedną, najskuteczniejszą rzecz.”

Pytania pomocnicze:
- Co już kiedyś pomogło ci w podobnej sytuacji?
- Jaką radę dostałby od ciebie przyjaciel w takiej sytuacji?
- Jaki najmniejszy krok da się zrobić w 2 minuty?
- Czy da się zapobiec przeszkodzie wcześniej (np. telefon w innym pokoju)?

Konstruktor zdania: „Jeśli [przeszkoda z kroku 3 + kiedy/gdzie], to [działanie/myśl].” Pola edytowalne, podgląd całego zdania na żywo.

Naprowadzanie:
- Część „to” musi być konkretnym działaniem lub myślą do wykonania od razu (czasownik, 1. osoba). „Postaram się”, „spróbuję”, „będę bardziej”, „muszę” → dopytaj: co dokładnie zrobisz w tej chwili?
- Część „jeśli” opisuje przeszkodę lub sytuację, a nie życzenie.
- Opcjonalnie plan awaryjny: „Jeśli jednak odpuszczę albo opuszczę dzień, to…”. Dzięki temu jedno potknięcie nie przekreśla całości.

Na koniec: „Powiedz plan raz na głos” i krótka wizualizacja wykonania planu (10–20 s).

### Krok 5 – Podsumowanie
- Karta WOOP: życzenie, rezultat, przeszkoda, plan jeśli–to (wersje skrócone) + ramy czasowe, data, ważność, realność. Pod spodem rozwijane pełne odpowiedzi.
- Checklista jakości z walidatorów:
  - życzenie konkretne i zależne ode mnie,
  - ramy czasowe,
  - przeszkoda wewnętrzna,
  - plan w formie jeśli–to,
  - konkretne działanie.
  Przy brakach przycisk „Popraw” prowadzący do właściwego kroku.
- Eksport:
  - kopiuj jako tekst,
  - PNG (9:16 jako tapeta na ekran blokady + kwadrat do udostępnienia),
  - wydruk jako mała karta A6,
  - pliki .md i .json.
- Ekran „Co dalej”: przypomnienia, termin przeglądu, dodanie aplikacji do ekranu głównego.

Wzorcowy WOOP (do przykładów i testów):
- Życzenie: 3 treningi w tygodniu przez najbliższy miesiąc
- Rezultat: więcej energii, lepszy sen, satysfakcja z dotrzymanego słowa
- Przeszkoda: po pracy czuję zmęczenie i mówię sobie „zrobię to jutro”
- Plan: Jeśli po pracy pomyślę „zrobię to jutro”, to od razu założę strój i zrobię 10 minut rozgrzewki.

## Etap 2 – Utrzymanie protokołu

1. Ekran główny z aktywnymi WOOP-ami. Zalecaj maks. 3 naraz (jako informacja, nie blokada).
2. Przycisk „Przeszkoda teraz!” przy każdym WOOP-ie: duży plan jeśli–to i opcjonalny 2-minutowy licznik na pierwszy krok. Potem jednym kliknięciem zapis, czy plan został użyty.
3. Codzienna powtórka (ok. 60 s): krótkie wyobrażenie rezultatu, potem przeszkody, na koniec plan przeczytany na głos. Powtarzanie wzmacnia skojarzenie „sytuacja → działanie”.
4. Szybki check-in (< 15 s):
   - Czy przeszkoda się pojawiła?
   - Czy plan został użyty (tak / częściowo / nie)?
   - ocena 1–5,
   - opcjonalna notatka.
5. Statystyki: odsetek sytuacji, w których plan został użyty, trend w czasie, kalendarz check-inów. Bez karzących streaków: przerwa nie zeruje postępu (np. „5 z 7 dni w tym tygodniu”).
6. Prowadzony przegląd tygodniowy: co działało, czy przeszkoda się zmieniła, czy plan wymaga korekty. Decyzja: zostaw / popraw plan / nowa przeszkoda (nowa iteracja WOOP) / zmień życzenie / zakończ. Każda zmiana to nowa wersja z zachowaną historią.
7. Zakończenie WOOP-a: osiągnięte / zmienione / świadomie odpuszczone + krótka refleksja („Czego cię to nauczyło?”).
8. Przypomnienia:
   - Bez backendu najpewniejszy jest eksport do kalendarza (.ics z cyklicznym wydarzeniem i alarmem). Ustaw go na porę, w której zwykle pojawia się przeszkoda (z kroku 3), z planem jeśli–to w treści.
   - Sprawdź, czy alarm działa po imporcie do Google i Apple Calendar.
   - Dodatkowo powiadomienia PWA tam, gdzie się da. Nie obiecuj zaplanowanych powiadomień push bez serwera. Ograniczenia (zwłaszcza na iOS) opisz w docs/DECISIONS.md.
9. „Szybki WOOP” na dziś: kreator bez rozbudowanych podpowiedzi (ok. 3 minuty), np. jako poranny rytuał.
10. Biblioteka: moje wcześniejsze przeszkody i plany do ponownego użycia + gotowe przykłady WOOP-ów dla typowych celów (ruch, sen, nauka, praca w skupieniu, jedzenie, relacje).
11. Sekcja „Jak to działa”: przystępne wyjaśnienie metody z przypisaniem jej autorce (Gabriele Oettingen) i linkiem do woopmylife.org. Sama aplikacja ma własną nazwę i branding.
12. Kopia zapasowa: eksport i import wszystkich danych (JSON).

## Etap 3 – Dodatki (opcjonalnie, po akceptacji etapów 1–2)

- Feedback AI do odpowiedzi w kreatorze (np. przez Claude API). Wyłącznie przez backend proxy (np. funkcja serverless), klucz API nigdy we frontendzie. Heurystyki z Etapu 1 zostają jako fallback.
- Konta i synchronizacja między urządzeniami.
- Udostępnianie karty zaufanej osobie, która pomoże dotrzymać słowa.
- Długie cele: WOOP nadrzędny + krótkie WOOP-y tygodniowe na kolejne kroki.

## Model danych (szkic)

- Woop: id, createdAt, timeframe {type, endDate}, area, wish {text, short, successCriterion, importance}, outcome {text, short}, obstacle {text, short, type, when, where}, realism, plan {ifText, thenText, backupPlan?}, status (draft | active | achieved | changed | released), version, history[]
- Checkin: id, woopId, date, obstacleOccurred, planUsed (yes | partly | no), rating, note
- Reminder: id, woopId, time, days, kind (review | checkin | obstacle)

## Prywatność

Wszystkie dane zostają na urządzeniu. Treść WOOP-ów nie trafia do analityki ani nigdzie na zewnątrz. Wyjątek: funkcje z Etapu 3, jeśli je włączę.

## Kryteria akceptacji MVP

- Cały kreator da się przejść na telefonie w mniej niż 10 minut, bez możliwości zmiany kolejności W–O–O–P.
- Walidatory wyłapują ogólnikowe życzenie, przeszkodę zewnętrzną oraz plan bez formy jeśli–to albo z „postaram się”. Proponują poprawkę (testy jednostkowe na przykładach).
- Szkic przetrwa odświeżenie strony i zamknięcie karty.
- Podsumowanie da się skopiować, pobrać jako PNG i wydrukować.
- Aplikację da się zainstalować na telefonie i działa offline. Dostępność w Lighthouse ≥ 90.
