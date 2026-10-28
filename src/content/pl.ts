/**
 * Wszystkie teksty interfejsu w jednym miejscu.
 *
 * - `{nazwa}` to miejsce na wartość wstawianą przez aplikację (np. `{date}`).
 * - Ton: ciepło, na „ty”, bez form rodzajowych (np. „Udało się?” zamiast „Zrobiłeś?”).
 * - Słowniki walidatorów są na końcu pliku (`lexicon`). Można w nich pisać z polskimi
 *   znakami – aplikacja sama sprowadza tekst do małych liter bez ogonków.
 */
import type {
  Area,
  InnerObstacleType,
  Lexicon,
  NudgeCode,
  ObstacleType,
  StepId,
  TimeframeType,
  WoopStatus,
} from '../domain/types.ts';
import type { WoopTemplate } from '../domain/library.ts';

interface StepContent {
  title: string;
  subtitle?: string;
  /** Accessible name of the main field when the title is not enough. */
  label?: string;
  placeholder?: string;
  why?: string;
  help?: string[];
  examples?: string[];
}

interface NudgeContent {
  title: string;
  body: string;
  example?: string;
}

const steps: Record<StepId, StepContent> = {
  'start-intro': {
    title: 'Zacznijmy od spokojnej chwili',
    subtitle: 'WOOP: Życzenie, Rezultat, Przeszkoda, Plan',
    why: 'Samo pozytywne myślenie często usypia motywację. Zestawienie wizji z realną przeszkodą daje energię do działania i pokazuje, co dokładnie zrobić.',
  },
  'start-timeframe': {
    title: 'Na jaki czas wybierasz to życzenie?',
    subtitle: 'Ramy czasowe pomogą dobrać życzenie na właściwą skalę.',
    why: 'Życzenie z terminem łatwiej przełożyć na działanie. Krótszy horyzont daje też szybszą informację, co działa, a co warto zmienić.',
    help: [
      'Na ile czasu jesteś w stanie skupić się na jednej rzeczy?',
      'Czy to coś na dziś, czy raczej nawyk, który potrzebuje kilku tygodni?',
    ],
  },
  'start-area': {
    title: 'Którego obszaru życia to dotyczy?',
    subtitle: 'Opcjonalnie. Dzięki temu pytania pomocnicze będą bliżej tego, co dla ciebie ważne.',
    why: 'Obszar nie zmienia metody, ale ułatwia znalezienie dobrego życzenia, gdy nic nie przychodzi do głowy.',
  },
  'wish-text': {
    title: 'Jakie ważne życzenie chcesz spełnić {timeframeIn}?',
    subtitle: 'Niech będzie ambitne, ale realne.',
    label: 'Twoje życzenie',
    placeholder: 'Np. 3 treningi w tygodniu przez najbliższy miesiąc',
    why: 'Dobre życzenie jest dla ciebie naprawdę ważne, trochę ambitne i jednocześnie możliwe do spełnienia. Najlepiej, żeby zależało głównie od ciebie – wtedy plan ma realną moc.',
    help: [
      'Co sprawiłoby, że uznasz {period} za udany?',
      'Co odkładasz od dawna, choć wiesz, że jest dla ciebie ważne?',
      'Gdyby dało się zmienić jedną rzecz {areaIn}, co by to było?',
    ],
    examples: ['3 treningi w tygodniu przez najbliższy miesiąc', 'Wysłać gotowy raport do piątku do 15:00'],
  },
  'wish-success': {
    title: 'Po czym poznasz, że się udało?',
    subtitle: 'Opisz coś, co da się sprawdzić albo policzyć.',
    label: 'Kryterium sukcesu',
    placeholder: 'Np. w kalendarzu będzie 12 odhaczonych treningów',
    why: 'Jasne kryterium zamienia ogólne „chcę” w coś, co da się sprawdzić. Na koniec wiesz, czy życzenie się spełniło – i masz co świętować.',
    help: [
      'Co zobaczysz albo co da się policzyć, kiedy się uda?',
      'Co powiesz bliskiej osobie, żeby pokazać, że się udało?',
    ],
    examples: ['12 odhaczonych treningów w kalendarzu', 'Raport wysłany w piątek przed 15:00'],
  },
  'wish-importance': {
    title: 'Jak bardzo ci na tym zależy?',
    subtitle: '1 – prawie wcale, 10 – bardzo.',
    label: 'Ważność życzenia',
    why: 'Metoda działa najlepiej przy życzeniach, które są naprawdę twoje i ważne. To, na czym zależy ci „na pół gwizdka”, łatwo porzucić przy pierwszej przeszkodzie.',
    help: ['Co stracisz, jeśli to się nie wydarzy?', 'Czy to życzenie jest twoje, czy raczej czyjeś oczekiwanie?'],
  },
  'wish-short': {
    title: 'Zapisz życzenie w kilku słowach',
    subtitle: 'Ta wersja trafi na twoją kartę. Najlepiej 3–6 słów.',
    label: 'Życzenie w skrócie',
    placeholder: 'Np. 3 treningi tygodniowo',
    why: 'Krótka wersja łatwo zapada w pamięć. Zobaczysz ją na karcie i podczas codziennej powtórki.',
    examples: ['3 treningi tygodniowo', 'Raport do piątku'],
  },
  'outcome-text': {
    title: 'Jaki będzie najlepszy rezultat spełnienia tego życzenia?',
    subtitle: 'Jak się wtedy poczujesz?',
    label: 'Najlepszy rezultat',
    placeholder: 'Np. więcej energii, lepszy sen i satysfakcja z dotrzymanego słowa',
    why: 'Wyobrażenie najlepszego rezultatu daje energię i kierunek. Szukamy korzyści, którą naprawdę poczujesz – nie samego efektu na papierze.',
    help: [
      'Co się zmieni w twoim zwykłym dniu?',
      'Co pomyślisz o sobie? Kto to zauważy?',
      'A co ci to da? Jak się z tym poczujesz?',
    ],
    examples: [
      'Więcej energii, lepszy sen, satysfakcja z dotrzymanego słowa',
      'Spokojna głowa w weekend i duma z dotrzymanego terminu',
    ],
  },
  'outcome-deeper': {
    title: 'A co ci to da?',
    subtitle: 'Zejdźmy poziom głębiej – do tego, co naprawdę poczujesz.',
    label: 'A co ci to da?',
    placeholder: 'Np. będę mieć siłę na wieczór z bliskimi, a nie tylko na kanapę',
    why: 'Pytanie „a co ci to da?” prowadzi od celu do osobistej, odczuwalnej korzyści. To ona najmocniej pomaga, kiedy robi się trudno.',
    help: ['Jak będzie wyglądał twój poranek, kiedy to już będzie prawda?', 'Co stanie się możliwe dzięki temu?'],
    examples: ['Będę mieć siłę na wieczór z bliskimi, a nie tylko na kanapę'],
  },
  'outcome-visualize': {
    title: 'Zamknij oczy i wyobraź sobie…',
    subtitle:
      '…że to już się stało: {outcome}. Gdzie jesteś? Co widzisz? Jak czujesz się w ciele? Pozwól sobie to naprawdę poczuć.',
    why: 'Samo wpisanie to za mało – metoda działa dzięki wyobrażeniu. Kilkadziesiąt sekund z zamkniętymi oczami sprawia, że rezultat staje się bliski i konkretny.',
  },
  'outcome-short': {
    title: 'Najlepszy rezultat w kilku słowach',
    subtitle: 'Ta wersja trafi na kartę. Najlepiej 3–6 słów.',
    label: 'Rezultat w skrócie',
    placeholder: 'Np. energia, sen, satysfakcja',
    why: 'Krótka wersja przypomni ci o najważniejszej korzyści w sekundę – na karcie i podczas powtórki.',
    examples: ['Energia, sen, satysfakcja'],
  },
  'obstacle-text': {
    title: 'Co w tobie najbardziej powstrzymuje cię przed spełnieniem tego życzenia?',
    subtitle: 'Pomyśl o emocji, nawyku, myśli albo przekonaniu – o czymś w tobie.',
    label: 'Przeszkoda',
    placeholder: 'Np. po pracy czuję zmęczenie i mówię sobie „zrobię to jutro”',
    why: 'Okoliczności zewnętrzne zdarzają się każdemu, ale wpływ masz na to, jak na nie reagujesz. Kiedy nazwiesz przeszkodę w sobie, możesz przygotować na nią konkretną odpowiedź.',
    help: [
      'Przypomnij sobie ostatnią próbę, która nie wyszła. Co działo się w twojej głowie tuż przed odpuszczeniem?',
      'W jakiej sytuacji najczęściej odpuszczasz? Co wtedy czujesz albo myślisz?',
      'Co sobie mówisz, kiedy odkładasz to na później?',
    ],
    examples: [
      'Po pracy czuję zmęczenie i mówię sobie „zrobię to jutro”',
      'Kiedy zadanie wydaje się trudne, sięgam po telefon',
    ],
  },
  'obstacle-type': {
    title: 'Jaka to przeszkoda?',
    subtitle: 'Wybierz to, co pasuje najbardziej. Opcjonalnie.',
    label: 'Rodzaj przeszkody',
    why: 'Nazwanie rodzaju przeszkody pomaga dobrać plan: na emocję działa inna odpowiedź niż na nawyk czy wymówkę.',
  },
  'obstacle-context': {
    title: 'Kiedy i gdzie ta przeszkoda zwykle się pojawia?',
    subtitle: 'Te szczegóły zasilą twój plan „jeśli–to” i przypomnienia.',
    why: 'Plan „jeśli–to” działa jak przełącznik: konkretna sytuacja uruchamia konkretne działanie. Im dokładniej znasz moment przeszkody, tym łatwiej go rozpoznać.',
    help: ['O jakiej porze dnia najczęściej odpuszczasz?', 'Gdzie wtedy jesteś i co robisz tuż wcześniej?'],
  },
  'obstacle-visualize': {
    title: 'Zamknij oczy i wyobraź sobie…',
    subtitle:
      '…chwilę, w której pojawia się twoja przeszkoda: {obstacle}{context}. Co dokładnie czujesz? Co sobie mówisz? Zobacz to tak wyraźnie, jak się da.',
    why: 'Wyobrażenie przeszkody zaraz po rezultacie to sedno metody (kontrastowanie mentalne). Dzięki temu mózg łączy cel z tym, co trzeba pokonać.',
  },
  'obstacle-short': {
    title: 'Przeszkoda w kilku słowach',
    subtitle: 'Ta wersja trafi na kartę. Najlepiej 3–6 słów.',
    label: 'Przeszkoda w skrócie',
    placeholder: 'Np. zmęczenie i „zrobię to jutro”',
    why: 'Krótka nazwa przeszkody pomaga ją szybko rozpoznać, kiedy się pojawi.',
    examples: ['Zmęczenie i „zrobię to jutro”'],
  },
  realism: {
    title: 'Jak realne jest spełnienie tego życzenia?',
    subtitle: 'Teraz, gdy widzisz i rezultat, i przeszkodę.',
    label: 'Realność',
    why: 'To zestawienie – piękna wizja i realna przeszkoda – jest sercem metody. Czasem pokazuje, że warto iść dalej, a czasem, że życzenie lepiej zmienić. Oba wyniki są dobre.',
  },
  'realism-release': {
    title: 'Świadome odpuszczenie',
    subtitle: 'To nie porażka. Uwalniasz energię na to, co teraz naprawdę możliwe.',
    label: 'Co sprawia, że odpuszczasz? Czego się o sobie dowiadujesz?',
    placeholder: 'Np. teraz ważniejszy jest dla mnie sen niż treningi',
    why: 'Badania nad MCII pokazują, że ta metoda nie tylko wzmacnia zaangażowanie w realne cele, ale też ułatwia rezygnację z tych, które są teraz poza zasięgiem.',
  },
  'plan-builder': {
    title: 'Co zrobisz albo co sobie pomyślisz, kiedy pojawi się ta przeszkoda?',
    subtitle: 'Wybierz jedną, najskuteczniejszą rzecz.',
    why: 'Plan „jeśli–to” (implementation intention, Peter Gollwitzer) z góry łączy sytuację z działaniem. Kiedy przeszkoda się pojawi, nie musisz się zastanawiać – odpowiedź jest gotowa.',
    help: [
      'Co już kiedyś pomogło ci w podobnej sytuacji?',
      'Jaką radę dostałby od ciebie przyjaciel w takiej sytuacji?',
      'Jaki najmniejszy krok da się zrobić w 2 minuty?',
      'Czy da się zapobiec przeszkodzie wcześniej (np. telefon w innym pokoju)?',
    ],
    examples: [
      'Jeśli po pracy pomyślę „zrobię to jutro”, to od razu założę strój i zrobię 10 minut rozgrzewki.',
      'Jeśli przy trudnym zadaniu sięgnę po telefon, to odłożę go ekranem w dół i napiszę pierwsze zdanie.',
    ],
  },
  'plan-backup': {
    title: 'A jeśli jednak odpuścisz albo opuścisz dzień?',
    subtitle: 'Opcjonalny plan awaryjny – żeby jedno potknięcie nie przekreśliło całości.',
    label: 'Plan awaryjny',
    placeholder: 'Np. następnego dnia zrobię chociaż 10 minut i odhaczę to w kalendarzu',
    why: 'Potknięcia są normalne. Plan awaryjny sprawia, że jedno gorsze popołudnie nie zamienia się w „i tak już nie ma sensu”.',
    examples: ['Następnego dnia zrobię chociaż 10 minut i odhaczę to w kalendarzu'],
  },
  'plan-short': {
    title: 'Plan w kilku słowach',
    subtitle: 'Na kartę. Najlepiej 3–6 słów.',
    label: 'Plan w skrócie',
    placeholder: 'Np. „jutro” → strój i rozgrzewka',
    why: 'Skrót planu to hasło, które ma ci przyjść do głowy w chwili przeszkody.',
    examples: ['„Jutro” → strój i rozgrzewka'],
  },
  'plan-rehearse': {
    title: 'Powiedz plan raz na głos',
    subtitle: 'Wyraźnie, w pierwszej osobie. To wzmacnia skojarzenie: sytuacja → działanie.',
    why: 'Wypowiedzenie i wyobrażenie planu to mała próba generalna. Kiedy przeszkoda przyjdzie naprawdę, reakcja będzie łatwiejsza.',
  },
};

const nudges: Record<NudgeCode, NudgeContent> = {
  'wish.dependent': {
    title: 'Co z tego zależy od ciebie?',
    body: 'Spełnienie tego życzenia zależy częściowo od innych („{match}”). Jak je sformułować, żeby było w twoich rękach?',
    example: '„dostać awans” → „przygotować i przedstawić szefowi plan rozwoju do końca miesiąca”',
  },
  'wish.vague': {
    title: 'Doprecyzujmy to',
    body: '„{match}” brzmi trochę ogólnie. Co dokładnie zrobisz i ile? Po czym to zmierzysz?',
    example: '„więcej się ruszać” → „3 treningi po 30 minut w najbliższym tygodniu”',
  },
  'wish.negation': {
    title: 'Do czego dążysz?',
    body: 'Łatwiej iść w stronę czegoś niż uciekać od czegoś. Co chcesz robić zamiast tego? To tylko propozycja – możesz zostawić swoją wersję.',
    example: '„nie jeść słodyczy” → „na deser jeść owoce albo jogurt”',
  },
  'wish.noCriterion': {
    title: 'Kryterium sukcesu bardzo pomaga',
    body: 'Wystarczy jedno zdanie, np. „12 odhaczonych treningów”. Dzięki temu na koniec łatwo sprawdzisz, czy się udało.',
  },
  'wish.lowImportance': {
    title: 'Czy to na pewno twoje życzenie?',
    body: 'Czy to na pewno twoje życzenie, a nie coś, co po prostu wypada zrobić? Metoda działa najlepiej przy celach, na których ci zależy.',
  },
  'outcome.repeatsWish': {
    title: 'A co ci to da?',
    body: 'To brzmi jeszcze jak samo życzenie. Wyobraź sobie, że już się udało – co ci to da? Jak się wtedy poczujesz?',
    example: '„schudnę 5 kg” → „lekko wejdę po schodach i z przyjemnością spojrzę w lustro”',
  },
  'obstacle.multiple': {
    title: 'Wybierz jedną przeszkodę',
    body: 'Widzę tu kilka przeszkód. Która przeszkadza najbardziej? Na nią przygotujemy plan.',
  },
  'obstacle.external': {
    title: 'Co w tobie?',
    body: '„{match}” to okoliczność zewnętrzna. Co w tobie sprawia, że cię zatrzymuje? Jak na nią reagujesz?',
  },
  'obstacle.tooGeneral': {
    title: 'Jak to wygląda w praktyce?',
    body: 'Opisz konkretną chwilę: co wtedy czujesz, myślisz albo robisz? Taką przeszkodę łatwiej rozpoznać.',
    example: '„lenistwo” → „po pracy kładę się na kanapie i mówię sobie, że zacznę jutro”',
  },
  'plan.notIfThen': {
    title: 'Plan w formie „jeśli–to”',
    body: 'Plan działa najlepiej jako jedno zdanie: „Jeśli [sytuacja], to [działanie]”. Rozdzielmy go na dwie części.',
    example: '„będę więcej ćwiczyć” → „Jeśli po pracy pomyślę «jutro», to od razu założę strój”',
  },
  'plan.weakThen': {
    title: 'Co dokładnie zrobisz?',
    body: '„{match}” to jeszcze nie działanie. Co dokładnie zrobisz w tej chwili, kiedy pojawi się przeszkoda?',
    example: '„postaram się poćwiczyć” → „od razu założę strój i zrobię 10 minut rozgrzewki”',
  },
  'plan.ifIsWish': {
    title: '„Jeśli” to sytuacja, nie życzenie',
    body: 'Część „jeśli” opisuje moment przeszkody – kiedy, gdzie, co czujesz albo myślisz – a nie samo życzenie.',
  },
  'plan.negativeThen': {
    title: 'Co zrobisz zamiast?',
    body: 'Plan działa lepiej, gdy mówi, co zrobisz, a nie czego unikniesz.',
    example: '„nie wezmę telefonu” → „odłożę telefon do szuflady i otworzę dokument”',
  },
  'plan.infinitive': {
    title: 'W pierwszej osobie',
    body: 'Zapisz to jako twoje działanie w 1. osobie, np. „założę strój” zamiast „założyć strój”.',
  },
  'plan.noAction': {
    title: 'Zacznij od czasownika',
    body: 'Zapisz konkretną czynność albo myśl w 1. osobie, którą zrobisz od razu – np. „założę…”, „wyjdę…”, „powiem sobie…”.',
  },
  'short.tooLong': {
    title: 'Krócej będzie łatwiej',
    body: 'Na kartę najlepiej sprawdza się 3–6 słów, a tu jest {count}. Spróbujesz skrócić?',
  },
};

export const pl = {
  locale: 'pl-PL',

  app: {
    name: 'WOOPmylife',
    tagline: 'Od życzenia do planu „jeśli–to”',
    description:
      'Prywatny przewodnik po metodzie WOOP: życzenie, najlepszy rezultat, przeszkoda i plan. Dane zostają na twoim urządzeniu.',
    methodCredit: 'Metoda WOOP / MCII: Gabriele Oettingen i Peter Gollwitzer',
    methodUrl: 'https://woopmylife.org',
    methodUrlLabel: 'woopmylife.org',
  },

  common: {
    next: 'Dalej',
    back: 'Wstecz',
    skip: 'Pomiń',
    cancel: 'Anuluj',
    close: 'Zamknij',
    save: 'Zapisz',
    done: 'Gotowe',
    delete: 'Usuń',
    yes: 'Tak',
    no: 'Nie',
    optional: 'opcjonalnie',
    loading: 'Wczytuję…',
    skipToContent: 'Przejdź do treści',
    required: 'To pole jest potrzebne, żeby iść dalej.',
    requiredChoice: 'Wybierz jedną z opcji, żeby iść dalej.',
    requiredSlider: 'Przesuń suwak albo dotknij skali, żeby wybrać wartość.',
    words: { one: 'słowo', few: 'słowa', many: 'słów' },
    wordCount: '{count} {words}',
    scale: '{value}/10',
    sliderValue: '{value} z 10',
    sliderUnset: 'nie wybrano',
    yourWish: 'Twoje życzenie',
    yourOutcome: 'Twój najlepszy rezultat',
    yourObstacle: 'Twoja przeszkoda',
  },

  nav: {
    home: 'Ekran główny',
    start: 'Start',
    library: 'Biblioteka',
    about: 'Jak to działa',
    settings: 'Ustawienia',
    closeWizard: 'Zamknij kreator (szkic zostanie zapisany)',
    mainNav: 'Nawigacja główna',
    woopNav: 'Sekcje WOOP-a',
    woopCard: 'Karta',
    woopProgress: 'Postępy',
    woopReminders: 'Co dalej',
    closeFocus: 'Zamknij',
  },

  phases: {
    wish: { letter: 'W', name: 'Życzenie' },
    outcome: { letter: 'O', name: 'Rezultat' },
    obstacle: { letter: 'O', name: 'Przeszkoda' },
    plan: { letter: 'P', name: 'Plan' },
  },

  progress: {
    label: 'Postęp WOOP',
    start: 'Przygotowanie',
    current: 'teraz',
    done: 'ukończone',
    todo: 'przed tobą',
    caption: 'Etap {index} z 4: {phase}',
  },

  intro: {
    paragraphs: [
      'WOOP to prosta, przebadana metoda. Najpierw wyobrażasz sobie, czego chcesz i jak dobrze będzie, gdy się uda. Zaraz potem uczciwie patrzysz na to, co w tobie może stanąć na przeszkodzie.',
      'Na koniec układasz krótki plan „jeśli–to”: gotową odpowiedź na chwilę, w której pojawi się przeszkoda.',
      'Zajmie to ok. 5–10 minut. Najlepiej znajdź spokojne miejsce, w którym nikt ci nie przeszkodzi.',
    ],
    letters: [
      { letter: 'W', name: 'Życzenie', text: 'czego naprawdę chcesz' },
      { letter: 'O', name: 'Rezultat', text: 'co najlepszego z tego wyniknie' },
      { letter: 'O', name: 'Przeszkoda', text: 'co w tobie może przeszkodzić' },
      { letter: 'P', name: 'Plan', text: 'jeśli przeszkoda, to działanie' },
    ],
    start: 'Zaczynamy',
  },

  timeframes: {
    today: { label: 'Dziś', in: 'dziś', period: 'ten dzień', hint: '{date}' },
    week: {
      label: 'Najbliższy tydzień',
      in: 'w najbliższym tygodniu',
      period: 'najbliższy tydzień',
      hint: 'do {date}',
    },
    month: {
      label: 'Najbliższy miesiąc',
      in: 'w najbliższym miesiącu',
      period: 'najbliższy miesiąc',
      hint: 'do {date}',
    },
    date: { label: 'Do konkretnej daty', in: 'do {date}', period: 'ten czas', hint: 'wybierzesz datę' },
  } satisfies Record<TimeframeType, { label: string; in: string; period: string; hint: string }>,
  timeframeDateLabel: 'Data końcowa',
  timeframeDateError: 'Wybierz datę – dziś albo późniejszą.',
  timeframeSummary: '{label} · do {date}',
  timeframeSummaryToday: 'Dziś · {date}',
  timeframeSummaryDate: 'Do {date}',

  areas: {
    health: { label: 'Zdrowie', in: 'w obszarze zdrowia' },
    movement: { label: 'Ruch', in: 'w obszarze ruchu' },
    work: { label: 'Praca', in: 'w pracy' },
    learning: { label: 'Nauka', in: 'w nauce' },
    relationships: { label: 'Relacje', in: 'w twoich relacjach' },
    finance: { label: 'Finanse', in: 'w twoich finansach' },
    other: { label: 'Inne', in: 'w twoim życiu' },
  } satisfies Record<Area, { label: string; in: string }>,
  areaNoneIn: 'w twoim życiu',
  areaClear: 'Bez obszaru',

  obstacleTypes: {
    emotion: { label: 'Emocja', hint: 'np. zmęczenie, lęk, nuda, złość' },
    habit: { label: 'Nawyk', hint: 'np. scrollowanie, odkładanie' },
    thought: { label: 'Myśl / wymówka', hint: 'np. „zrobię to jutro”' },
    belief: { label: 'Przekonanie o sobie', hint: 'np. „nie nadaję się do tego”' },
    temptation: { label: 'Pokusa / impuls', hint: 'np. słodycze, serial, drzemka' },
    other: { label: 'Inne', hint: 'coś jeszcze innego' },
  } satisfies Record<ObstacleType, { label: string; hint: string }>,
  obstacleTypeSuggested: 'Wygląda na: {type}',

  obstacleContext: {
    whenLabel: 'Kiedy zwykle się pojawia?',
    whenPlaceholder: 'Np. po pracy',
    whenChips: ['rano', 'w ciągu dnia', 'po pracy', 'wieczorem', 'w weekend'],
    whereLabel: 'Gdzie?',
    wherePlaceholder: 'Np. w domu na kanapie',
    whereChips: ['w domu', 'w pracy', 'w drodze', 'w łóżku'],
    timeLabel: 'O której mniej więcej?',
    timeHint: 'Opcjonalnie – na tę porę ustawisz przypomnienie.',
    chipsLabel: 'Szybki wybór',
    joiner: ', ',
    visualizeContext: ' ({value})',
  },

  statuses: {
    draft: 'Szkic',
    active: 'Aktywny',
    achieved: 'Osiągnięty',
    changed: 'Zmieniony',
    released: 'Odpuszczony',
  } satisfies Record<WoopStatus, string>,

  help: {
    why: 'Dlaczego o to pytam?',
    needHelp: 'Potrzebuję pomocy',
    hideHelp: 'Ukryj pomoc',
    another: 'Inne pytanie',
    helpLabel: 'Pytanie pomocnicze {index} z {total}',
    example: 'Przykład',
    examples: 'Przykłady',
    useExample: 'Wstaw przykład',
  },

  steps,

  pause: {
    start: 'Zaczynam',
    skip: 'Pomiń',
    finishEarly: 'Zakończ wcześniej',
    next: 'Dalej',
    durationLabel: 'Czas wizualizacji',
    seconds: '{n} s',
    inhale: 'Wdech',
    exhale: 'Wydech',
    remaining: 'Zostało {time}',
    started: 'Odliczanie: {n} sekund. Zamknij oczy.',
    finished: 'Czas minął. Otwórz oczy, kiedy zechcesz.',
    breathingLabel: 'Animacja oddechu',
  },

  shortVersion: {
    suggestion: 'Propozycja:',
    useSuggestion: 'Użyj propozycji',
    counterLabel: 'Liczba słów',
  },

  deeper: {
    previous: 'Twój rezultat',
    again: 'Zapytaj jeszcze raz: a co mi to da?',
    secondLabel: 'A to co ci da?',
    skip: 'To już jest to – dalej',
  },

  realism: {
    minLabel: '1 – mało realne',
    maxLabel: '10 – bardzo realne',
    high: {
      title: 'Świetnie – czas na plan',
      body: 'Widzisz i rezultat, i przeszkodę, a życzenie wciąż wydaje się realne. To najlepszy moment, żeby przygotować plan.',
    },
    mid: {
      title: 'Może warto je trochę zawęzić?',
      body: 'Realność {value}/10 to sygnał, że życzenie da się doprecyzować albo zmniejszyć, tak żeby było w twoim zasięgu. Możesz też iść dalej.',
      refine: 'Doprecyzuj życzenie',
      proceed: 'Idę dalej',
    },
    low: {
      title: 'To też jest cenna informacja',
      body: 'Kiedy życzenie wydaje się mało realne, możesz je zmienić, świadomie odpuścić albo mimo wszystko spróbować. Każdy z tych wyborów jest w porządku.',
      change: 'Zmień lub zmniejsz życzenie',
      changeHint: 'Wrócisz do życzenia, nic nie zginie.',
      release: 'Odpuść świadomie',
      releaseHint: 'Zamkniesz ten WOOP z krótką refleksją.',
      proceed: 'Kontynuuj mimo to',
      proceedHint: 'Przejdziesz do planu.',
    },
  },

  release: {
    confirm: 'Odpuszczam i zamykam',
    cancel: 'Jednak wracam',
  },

  planBuilder: {
    ifLabel: 'Jeśli…',
    ifHint: 'Sytuacja albo przeszkoda: kiedy, gdzie, co czujesz lub myślisz.',
    thenLabel: '…to…',
    thenHint: 'Konkretne działanie albo myśl – od razu, w 1. osobie.',
    thenPlaceholder: 'Np. od razu założę strój i zrobię 10 minut rozgrzewki',
    previewLabel: 'Twój plan',
    previewEmpty: '…',
    sentence: 'Jeśli {if}, to {then}.',
    backupSentence: 'Jeśli jednak odpuszczę albo opuszczę dzień, to {then}.',
    backupPrefix: 'Jeśli jednak odpuszczę albo opuszczę dzień, to…',
    fromObstacle: 'Wstaw przeszkodę z poprzedniego kroku',
  },

  rehearse: {
    sayAloud: 'Powiedz to na głos:',
    spoken: 'Powiedziane na głos',
    spokenDone: 'Super. Teraz krótka wizualizacja.',
    visualizeTitle: 'Wyobraź sobie, że to się dzieje',
    visualizeBody: 'Pojawia się przeszkoda… i robisz dokładnie to, co zaplanowane. Zobacz, jak to robisz.',
    finish: 'Zapisz mój WOOP',
    finishEdit: 'Zapisz zmiany',
  },

  nudgeUi: {
    heading: 'Podpowiedź',
    apply: 'Użyj tej wersji',
    edit: 'Poprawię',
    keep: 'Zostaw moją wersję',
    example: 'Na przykład:',
    suggestion: 'Propozycja:',
    chooseOne: 'Która przeszkadza najbardziej?',
    choose: 'Wybierz tę',
    keepAll: 'Zostaw wszystkie razem',
    parked: 'Pozostałe zapiszę jako pomysły na kolejny WOOP.',
    addCriterion: 'Dodam kryterium',
    changeWish: 'Zmień życzenie',
    confirmWish: 'Tak, to moje życzenie',
    splitPlan: 'Rozdziel na „jeśli” i „to”',
  },

  externalExamples: {
    time: '„brak czasu” → „wieczorem zamiast ćwiczyć, scrolluję telefon”',
    work: '„za dużo pracy” → „po pracy czuję zmęczenie i mówię sobie «zrobię to jutro»”',
    boss: '„szef” → „kiedy szef krytykuje, myślę «nie nadaję się» i odkładam zadanie”',
    kids: '„dzieci” → „kiedy dzieci zasną, czuję zmęczenie i włączam serial”',
    money: '„brak pieniędzy” → „kiedy myślę o kosztach, zniechęcam się i odkładam decyzję”',
    weather: '„pogoda” → „kiedy pada, mówię sobie «dziś odpuszczę»”',
    people: '„inni ludzie” → „przy znajomych wstydzę się odmówić”',
    default: '„brak czasu” → „wieczorem zamiast ćwiczyć, scrolluję telefon”',
  } as Record<string, string>,

  nudges,

  edit: {
    returnToSummary: 'Zapisz i wróć do podsumowania',
    editing: 'Poprawiasz zapisany WOOP',
  },

  summary: {
    title: 'Twój WOOP',
    createdTitle: 'Gotowe! Oto twoja karta WOOP',
    createdBody: 'Zapisz ją tam, gdzie będziesz ją widzieć. Krótka, codzienna powtórka wzmacnia plan.',
    releasedTitle: 'Świadomie odpuszczone',
    releasedBody: 'To była dobra decyzja na teraz.',
    releasedReflection: 'Twoja refleksja',
    labels: { wish: 'Życzenie', outcome: 'Najlepszy rezultat', obstacle: 'Przeszkoda', plan: 'Plan' },
    meta: {
      timeframe: 'Ramy czasowe',
      created: 'Utworzono',
      importance: 'Ważność',
      realism: 'Realność',
    },
    cardLabel: 'Karta WOOP',
    fullAnswers: 'Pełne odpowiedzi',
    full: {
      area: 'Obszar',
      wish: 'Życzenie',
      success: 'Po czym poznam, że się udało',
      outcome: 'Najlepszy rezultat',
      deeper: 'A co mi to da?',
      obstacle: 'Przeszkoda',
      type: 'Rodzaj przeszkody',
      when: 'Kiedy się pojawia',
      where: 'Gdzie',
      time: 'O której',
      plan: 'Plan „jeśli–to”',
      backup: 'Plan awaryjny',
      parked: 'Pomysły na kolejny WOOP',
      empty: '—',
    },
    checklist: {
      title: 'Checklista jakości',
      intro: 'Sprawdzam twój WOOP według zasad metody. To wskazówki, nie oceny.',
      allGood: 'Wszystko na miejscu.',
      ok: 'w porządku',
      toFix: 'warto poprawić',
      fix: 'Popraw',
      items: {
        wishConcrete: {
          label: 'Życzenie konkretne i zależne ode mnie',
          hint: 'Doprecyzuj, co dokładnie i ile – i co z tego jest w twoich rękach.',
        },
        timeframe: { label: 'Ramy czasowe', hint: 'Wybierz, do kiedy chcesz spełnić życzenie.' },
        obstacleInternal: {
          label: 'Przeszkoda wewnętrzna',
          hint: 'Opisz, co w tobie cię zatrzymuje – emocję, nawyk albo myśl.',
        },
        planIfThen: {
          label: 'Plan w formie „jeśli–to”',
          hint: 'Część „jeśli” to sytuacja albo przeszkoda, a część „to” – twoja reakcja.',
        },
        concreteAction: {
          label: 'Konkretne działanie',
          hint: 'W części „to” wpisz czynność, którą zrobisz od razu, w 1. osobie.',
        },
      },
    },
    exportTitle: 'Zapisz, wydrukuj, udostępnij',
    copyText: 'Kopiuj jako tekst',
    copied: 'Skopiowano do schowka.',
    copyFailed: 'Nie udało się skopiować. Zaznacz tekst ręcznie.',
    pngStory: 'Tapeta 9:16 (PNG)',
    pngSquare: 'Kwadrat (PNG)',
    pngStoryHint: 'Na ekran blokady – góra zostaje wolna na zegar.',
    share: 'Udostępnij obraz',
    print: 'Drukuj kartę A6',
    printHint: 'Jeśli przeglądarka nie ustawi formatu sama, wybierz w oknie druku A6 albo „dopasuj do strony”.',
    markdown: 'Plik .md',
    json: 'Plik .json',
    downloaded: 'Pobrano plik {name}.',
    nextSteps: 'Co dalej?',
    backHome: 'Ekran główny',
    edit: 'Edytuj',
    deleteWoop: 'Usuń ten WOOP',
    deleteConfirm: 'Usunąć ten WOOP na zawsze? Tej operacji nie da się cofnąć.',
  },

  exportText: {
    header: '{app} – mój WOOP',
    timeframe: 'Ramy czasowe: {value}',
    created: 'Utworzono: {value}',
    wish: 'Życzenie: {value}',
    outcome: 'Najlepszy rezultat: {value}',
    obstacle: 'Przeszkoda: {value}',
    plan: 'Plan: {value}',
    backup: 'Plan awaryjny: {value}',
    importance: 'Ważność: {value}/10',
    realism: 'Realność: {value}/10',
    status: 'Status: {value}',
    statusLabel: 'Status',
    mdTitle: 'Mój WOOP: {value}',
    mdCard: 'Karta',
    mdDetails: 'Pełne odpowiedzi',
    mdMeta: 'Szczegóły',
    footer: 'Metoda WOOP / MCII – Gabriele Oettingen, woopmylife.org',
    fileBase: 'woop',
  },

  card: {
    footer: '{app} · {timeframe}',
    planPrefix: 'Jeśli',
  },

  nextSteps: {
    title: 'Co dalej?',
    intro: 'Kilka rzeczy, które pomogą ci trzymać się planu w kolejnych dniach.',
    reminders: {
      title: 'Przypomnienie w kalendarzu',
      body: 'Bez konta i serwera najpewniej działa kalendarz. Dodaj cykliczne przypomnienie z twoim planem na porę, kiedy zwykle pojawia się przeszkoda.',
      time: 'Godzina przypomnienia',
      days: 'Kiedy',
      daysOptions: { daily: 'Codziennie', weekdays: 'W dni robocze', weekends: 'W weekendy' },
      until: 'Przypomnienia potrwają do końca ram czasowych: {date}.',
      includeReview: 'Dodaj też przegląd do kalendarza',
      download: 'Pobierz plik do kalendarza (.ics)',
      hint: 'Otwórz pobrany plik – kalendarz zaproponuje dodanie wydarzeń. W Google Calendar na komputerze użyj: Ustawienia → Importuj i eksportuj.',
      eventTitle: 'WOOP: {wish}',
      checkinTitle: 'Check-in WOOP: {wish}',
      checkinDescription: 'Czy przeszkoda się dziś pojawiła? Czy plan został użyty? Zajmie to 15 sekund.',
      reviewTitle: 'Przegląd WOOP: {wish}',
      reviewDescription: 'Co działało? Czy przeszkoda się zmieniła? Czy plan wymaga korekty?',
    },
    review: {
      title: 'Termin przeglądu',
      body: 'Zaplanuj chwilę na sprawdzenie, co działa, a co warto poprawić.',
      label: 'Data przeglądu',
      save: 'Zapisz termin',
      saved: 'Zapisano termin przeglądu: {date}.',
    },
    install: {
      title: 'Dodaj aplikację do ekranu głównego',
      body: 'Wtedy {app} otworzy się jak zwykła aplikacja i zadziała bez internetu.',
      button: 'Zainstaluj aplikację',
      ios: 'Na iPhonie lub iPadzie: w Safari stuknij „Udostępnij”, a potem „Do ekranu początkowego”.',
      installed: 'Aplikacja jest już zainstalowana na tym urządzeniu.',
      other: 'W menu przeglądarki poszukaj opcji „Zainstaluj aplikację” albo „Dodaj do ekranu głównego”.',
      accepted: 'Dziękuję! Aplikacja pojawi się na ekranie głównym.',
    },
    backToCard: 'Wróć do karty',
    backHome: 'Przejdź do ekranu głównego',
  },

  home: {
    title: 'Twoje WOOP-y',
    intro: 'Życzenie, najlepszy rezultat, przeszkoda i plan – krok po kroku, w swoim tempie.',
    newWoop: 'Nowy WOOP',
    newWoopHint: 'ok. 5–10 minut',
    drafts: 'Szkice do dokończenia',
    continueDraft: 'Dokończ szkic',
    draftUntitled: 'Szkic bez życzenia',
    draftMeta: 'Ostatnia zmiana: {date}',
    deleteDraft: 'Usuń szkic',
    deleteDraftConfirm: 'Usunąć ten szkic? Tej operacji nie da się cofnąć.',
    active: 'Aktywne',
    finished: 'Zakończone i odpuszczone',
    empty: 'Nie masz jeszcze żadnego WOOP-a. Pierwszy zajmie ok. 5–10 minut – najlepiej w spokojnym miejscu.',
    open: 'Otwórz kartę',
    until: 'do {date}',
    privacy: 'Wszystko zostaje na tym urządzeniu.',
  },

  settings: {
    title: 'Ustawienia',
    theme: { label: 'Motyw', system: 'Systemowy', light: 'Jasny', dark: 'Ciemny' },
    pause: { label: 'Długość wizualizacji', hint: 'Domyślny czas pauzy przy rezultacie i przeszkodzie.' },
    chime: {
      label: 'Dźwięk i wibracja na koniec wizualizacji',
      hint: 'Przydaje się, gdy masz zamknięte oczy.',
    },
    privacy: {
      title: 'Prywatność',
      body: 'Twoje WOOP-y zostają na tym urządzeniu, w pamięci przeglądarki. Aplikacja nie wysyła ich nigdzie i nie używa analityki. Wyczyszczenie danych przeglądarki usuwa też WOOP-y.',
    },
    about: {
      title: 'O aplikacji',
      version: 'Wersja {version}',
      method:
        'Metoda WOOP (Wish, Outcome, Obstacle, Plan) i MCII: Gabriele Oettingen i Peter Gollwitzer. Więcej o metodzie:',
    },
    saved: 'Zapisano.',
  },

  pwa: {
    updateAvailable: 'Jest nowa wersja aplikacji.',
    reload: 'Odśwież',
    later: 'Później',
    offlineReady: 'Aplikacja jest gotowa do pracy bez internetu.',
  },

  errors: {
    notFoundTitle: 'Nie ma tu takiej strony',
    notFoundBody: 'Może link jest nieaktualny.',
    woopNotFound: 'Nie znaleziono tego WOOP-a. Może został usunięty.',
    generic: 'Coś poszło nie tak. Spróbuj odświeżyć stronę.',
    storage: 'Nie udało się zapisać danych na urządzeniu. Sprawdź, czy przeglądarka nie działa w trybie prywatnym.',
    backHome: 'Wróć na ekran główny',
  },

  // ── Etap 2 ────────────────────────────────────────────────────────────────

  dashboard: {
    today: 'Na dziś',
    tooMany:
      'Masz {count} {woops}. Najlepiej działają maksymalnie 3 naraz – łatwiej o każdym pamiętać. To tylko wskazówka.',
    woopsForms: { one: 'aktywny WOOP', few: 'aktywne WOOP-y', many: 'aktywnych WOOP-ów' },
    sos: 'Przeszkoda teraz!',
    rehearse: 'Powtórka',
    checkin: 'Check-in',
    checkinDone: 'Check-in zrobiony',
    rehearsedToday: 'Powtórka zrobiona',
    card: 'Karta i postępy',
    quickWoop: 'Szybki WOOP na dziś',
    quickHint: 'ok. 3 minuty, np. rano',
    // \u00a0 (twarda spacja) trzyma razem „3 z 4”, żeby liczba nie spadła sama do nowej linii.
    weekStats: 'Check-in: {count}\u00a0z\u00a07 dni w tym tygodniu',
    planStats: 'Plan użyty: {used}\u00a0z\u00a0{total}',
    due: {
      review: 'Czas na przegląd tygodniowy',
      checkin: 'Pora na szybki check-in',
      obstacle: 'To pora, kiedy zwykle pojawia się przeszkoda',
    },
    dueActions: { review: 'Zrób przegląd', checkin: 'Check-in', obstacle: 'Mój plan' },
    todayEmpty: 'Na dziś nic nie czeka. Przeszkoda się pojawi? Masz przycisk „Przeszkoda teraz!”.',
    incomplete: 'Ten WOOP czeka na dokończenie.',
    incompleteAction: 'Dokończ',
    start: 'Zacznij nowy',
  },

  sos: {
    title: 'Przeszkoda teraz!',
    intro: 'Spokojnie, masz na to gotowy plan.',
    backupLabel: 'A jeśli dziś się nie uda:',
    timerTitle: 'Pierwszy krok w 2 minuty',
    timerBody: 'Zacznij od najmniejszego kroku. Licznik pomoże ruszyć z miejsca.',
    timerStart: 'Start – 2 minuty',
    timerRemaining: 'Zostało {time}',
    timerDone: 'Ruszone! Jeśli chcesz, działaj dalej.',
    timerStop: 'Zatrzymaj licznik',
    question: 'Czy plan został użyty?',
    answers: { yes: 'Tak', partly: 'Częściowo', no: 'Nie' },
    saved: 'Zapisano. Każde użycie planu wzmacnia skojarzenie „sytuacja → działanie”.',
    savedNo: 'Zapisano. To też cenna informacja – przy przeglądzie zobaczysz, co warto zmienić.',
    back: 'Wróć na ekran główny',
  },

  rehearsal: {
    title: 'Codzienna powtórka',
    intro: 'Około minuty: rezultat, przeszkoda i plan na głos.',
    stepLabel: 'Krok {index} z 3',
    outcomeTitle: 'Wyobraź sobie najlepszy rezultat',
    outcomeBody: 'Poczuj przez chwilę, jak to jest: {outcome}.',
    obstacleTitle: 'Wyobraź sobie przeszkodę',
    obstacleBody: 'Zobacz moment, w którym się pojawia: {obstacle}.',
    planTitle: 'Przeczytaj plan na głos',
    readAloud: 'Przeczytane na głos',
    done: 'Powtórka zapisana. Do jutra!',
    back: 'Wróć na ekran główny',
  },

  checkin: {
    title: 'Szybki check-in',
    occurred: 'Czy przeszkoda się dziś pojawiła?',
    planUsed: 'Czy plan został użyty?',
    rating: 'Jak oceniasz dzisiejszy dzień?',
    ratingHint: '1 – słabo, 5 – świetnie',
    note: 'Notatka',
    notePlaceholder: 'Np. pomógł strój przygotowany wieczorem',
    save: 'Zapisz check-in',
    saved: 'Zapisano check-in.',
    sosToday: 'Dziś zapisano już użycie planu przyciskiem „Przeszkoda teraz!” ({count}×).',
    alreadyDone: 'Dzisiejszy check-in jest zapisany – możesz go zmienić.',
    yes: 'Tak',
    no: 'Nie',
  },

  stats: {
    title: 'Postępy',
    planUsage: 'Plan użyty w {used} z {total} sytuacji z przeszkodą',
    planUsageDetail: 'tak: {yes} · częściowo: {partly} · nie: {no}',
    noSituations:
      'Nie ma jeszcze zapisanych sytuacji z przeszkodą. Zapisuj je w check-inie albo przyciskiem „Przeszkoda teraz!”.',
    weekTitle: 'Ten tydzień',
    weekCheckins: 'Check-in: {count} z 7 dni',
    weekRehearsals: 'Powtórka: {count} z 7 dni',
    noStreaks: 'Przerwa niczego nie zeruje – liczy się każdy dzień.',
    averageRating: 'Średnia ocena dnia: {value}/5',
    trendTitle: 'Użycie planu w ostatnich tygodniach',
    trendWeek: 'od {date}',
    trendEmpty: 'bez sytuacji',
    trendValue: '{percent}% ({used} z {total})',
    calendarTitle: 'Kalendarz',
    legendLabel: 'Legenda',
    tableSummary: 'Pokaż jako tabelę',
    tableWeek: 'Tydzień',
    tableSituations: 'Sytuacje',
    tableUsed: 'Plan użyty',
    planTile: 'Plan użyty',
    ratingTile: 'Średnia ocena dnia',
    recentTitle: 'Ostatnie wpisy',
    recentEmpty: 'Nie ma jeszcze wpisów. Pierwszy check-in zajmie 15 sekund.',
    recentDate: 'Dzień',
    recentResult: 'Jak poszło',
    recentRating: 'Ocena',
    calendarPrev: 'Poprzedni miesiąc',
    calendarNext: 'Następny miesiąc',
    weekdays: ['pn', 'wt', 'śr', 'cz', 'pt', 'sb', 'nd'],
    legend: { checkin: 'check-in', planUsed: 'plan użyty', rehearsal: 'powtórka' },
    day: {
      checkin: 'check-in',
      noObstacle: 'bez przeszkody',
      plan: { yes: 'plan użyty', partly: 'plan użyty częściowo', no: 'plan nieużyty' },
      rehearsal: 'powtórka',
      sos: 'przeszkoda teraz: {count}',
      nothing: 'brak wpisów',
    },
  },

  review: {
    title: 'Przegląd tygodniowy',
    intro: 'Kilka pytań, żeby zobaczyć, co działa. Bez oceniania – to informacja dla ciebie.',
    lastWeek: 'Ostatnie 7 dni: plan użyty w {used} z {total} sytuacji, check-in {checkins} z 7 dni.',
    whatWorked: 'Co działało?',
    whatWorkedPlaceholder: 'Np. strój przygotowany wieczorem',
    obstacleChanged: 'Czy przeszkoda się zmieniła?',
    planNeedsFix: 'Czy plan wymaga korekty?',
    decision: 'Co dalej z tym WOOP-em?',
    decisions: {
      keep: { label: 'Zostaw', hint: 'Plan działa – kontynuuję.' },
      fixPlan: { label: 'Popraw plan', hint: 'Przeszkoda ta sama, zmienię reakcję na nią.' },
      newObstacle: { label: 'Nowa przeszkoda', hint: 'Nowa iteracja: ten sam cel, nowa przeszkoda i plan.' },
      changeWish: { label: 'Zmień życzenie', hint: 'Doprecyzuję albo zmniejszę życzenie.' },
      finish: { label: 'Zakończ', hint: 'Osiągnięte, zmienione albo świadomie odpuszczone.' },
    },
    versionNote: 'Zmiana utworzy nową wersję WOOP-a. Poprzednia zostanie w historii.',
    save: 'Zapisz przegląd',
    saved: 'Zapisano przegląd. Następny: {date}.',
    due: 'Przegląd: {date}',
    start: 'Zrób przegląd',
    yes: 'Tak',
    no: 'Nie',
    past: 'Wcześniejsze przeglądy',
    pastItem: '{date} – {decision}',
  },

  close: {
    title: 'Zakończenie WOOP-a',
    intro: 'Każde zakończenie jest w porządku – liczy się to, czego się dowiadujesz.',
    question: 'Jak kończysz ten WOOP?',
    outcomes: {
      achieved: { label: 'Osiągnięte', hint: 'Życzenie się spełniło.' },
      changed: { label: 'Zmienione', hint: 'Cel się zmienił albo przerodził w coś innego.' },
      released: { label: 'Świadomie odpuszczone', hint: 'Teraz to nie jest dla mnie najważniejsze.' },
    },
    reflection: 'Czego cię to nauczyło?',
    reflectionPlaceholder: 'Np. że najtrudniejsze są pierwsze 2 minuty',
    confirm: 'Zakończ WOOP',
    closedTitle: 'Zakończone: {outcome}',
    reflectionLabel: 'Czego mnie to nauczyło',
    newWoop: 'Zacznij nowy WOOP',
  },

  versions: {
    title: 'Historia wersji',
    current: 'Wersja {version} – aktualna',
    item: 'Wersja {version} (do {date}, potem: {reason})',
    reasons: {
      edit: 'poprawka',
      fixPlan: 'poprawiony plan',
      newObstacle: 'nowa przeszkoda',
      changeWish: 'zmienione życzenie',
    } as Record<string, string>,
  },

  reminders: {
    title: 'Przypomnienia',
    intro: 'Najpewniej działają w kalendarzu telefonu. W aplikacji zobaczysz je też w sekcji „Na dziś”.',
    kinds: {
      obstacle: { label: 'Pora przeszkody', hint: 'Twój plan „jeśli–to” wtedy, kiedy zwykle pojawia się przeszkoda.' },
      checkin: { label: 'Check-in', hint: '15 sekund: czy przeszkoda się pojawiła i jak poszło?' },
      review: { label: 'Przegląd tygodniowy', hint: 'Raz w tygodniu: co działa, co poprawić.' },
    },
    enabled: 'Włączone',
    time: 'Godzina',
    days: 'Dni',
    dayNames: ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'],
    dayNamesFull: ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela'],
    save: 'Zapisz przypomnienia',
    saved: 'Zapisano przypomnienia.',
    ics: 'Dodaj do kalendarza (.ics)',
    icsHint:
      'Otwórz pobrany plik na telefonie, a kalendarz zaproponuje dodanie wydarzeń. Po imporcie sprawdź, czy wydarzenia mają powiadomienie: Google Calendar potrafi pominąć alarm z pliku. Wtedy ustaw je raz dla całej serii.',
    notifications: {
      title: 'Powiadomienia w aplikacji',
      body: 'Pokażą się tylko wtedy, gdy aplikacja jest otwarta albo działa w tle. Na iPhonie przeglądarka nie pozwala planować powiadomień bez serwera, więc tam najlepiej sprawdza się kalendarz.',
      enable: 'Włącz powiadomienia',
      enabled: 'Powiadomienia są włączone.',
      denied: 'Powiadomienia są zablokowane w ustawieniach przeglądarki.',
      unsupported: 'Ta przeglądarka nie obsługuje powiadomień.',
      test: 'Wyślij powiadomienie testowe',
      testTitle: 'Tak będą wyglądać przypomnienia',
    },
    notificationTitles: {
      obstacle: 'Pora przeszkody: {wish}',
      checkin: 'Check-in: {wish}',
      review: 'Przegląd: {wish}',
    },
  },

  quick: {
    title: 'Szybki WOOP na dziś',
    body: 'Krótka wersja na dziś: życzenie, rezultat, przeszkoda i plan. Około 3 minut, np. jako poranny rytuał.',
  },

  library: {
    title: 'Biblioteka',
    intro: 'Twoje przeszkody i plany do ponownego użycia oraz gotowe przykłady na start.',
    mine: 'Moje przeszkody i plany',
    mineEmpty: 'Tu pojawią się przeszkody i plany z twoich WOOP-ów.',
    from: 'Z WOOP-a: {wish}',
    useEntry: 'Użyj w nowym WOOP-ie',
    ideas: 'Pomysły na kolejny WOOP',
    ideasHint: 'Przeszkody odłożone na później, gdy wpisano kilka naraz.',
    useIdea: 'Zacznij WOOP z tą przeszkodą',
    examples: 'Przykłady na start',
    examplesHint: 'Kreator i tak przeprowadzi cię przez wszystkie kroki, a przykład dopasujesz do siebie.',
    useTemplate: 'Zacznij od tego przykładu',
    templates: [
      {
        id: 'movement',
        label: 'Ruch',
        wish: '3 spacery po 30 minut w najbliższym tygodniu',
        outcome: 'Lżejsza głowa po pracy i więcej energii wieczorem',
        obstacle: 'Po powrocie do domu siadam na kanapie i mówię sobie „wyjdę za chwilę”',
        obstacleType: 'thought',
        when: 'po powrocie do domu',
        ifText: 'po powrocie do domu pomyślę „wyjdę za chwilę”',
        thenText: 'od razu założę buty i wyjdę choćby na 10 minut',
      },
      {
        id: 'sleep',
        label: 'Sen',
        wish: 'Kłaść się przed 23:00 w 5 dni z 7 w najbliższym tygodniu',
        outcome: 'Wyspane poranki, spokojniejsza głowa i mniej kawy',
        obstacle: 'Wieczorem w łóżku przewijam telefon „jeszcze tylko chwilę”',
        obstacleType: 'habit',
        when: 'wieczorem w łóżku',
        ifText: 'o 22:30 sięgnę po telefon w łóżku',
        thenText: 'odłożę go na ładowarkę w przedpokoju i wezmę książkę',
      },
      {
        id: 'learning',
        label: 'Nauka',
        wish: 'Przerobić 3 rozdziały kursu w najbliższym tygodniu',
        outcome: 'Satysfakcja z postępu i większa pewność siebie',
        obstacle: 'Kiedy materiał wydaje się trudny, myślę „nie ogarniam tego” i robię coś innego',
        obstacleType: 'belief',
        when: 'kiedy siadam do nauki',
        ifText: 'przy trudnym materiale pomyślę „nie ogarniam tego”',
        thenText: 'zapiszę jedno pytanie, które mnie blokuje, i przeczytam jeszcze jedną stronę',
      },
      {
        id: 'focus',
        label: 'Praca w skupieniu',
        wish: 'Codziennie 2 bloki po 50 minut pracy w skupieniu przez najbliższy tydzień',
        outcome: 'Ważne zadania zrobione przed południem i spokojna głowa po pracy',
        obstacle: 'Gdy zadanie robi się trudne, odruchowo otwieram pocztę albo komunikator',
        obstacleType: 'habit',
        when: 'w trakcie bloku pracy',
        ifText: 'w trakcie bloku sięgnę po pocztę albo komunikator',
        thenText: 'zapiszę tę myśl na kartce i wrócę do zadania na kolejne 5 minut',
      },
      {
        id: 'food',
        label: 'Jedzenie',
        wish: 'Na deser jeść owoce zamiast słodyczy w 5 dni z 7 przez najbliższy tydzień',
        outcome: 'Więcej energii po południu i satysfakcja, że dbam o siebie',
        obstacle: 'Po obiedzie w pracy czuję ochotę na coś słodkiego i sięgam po batonik',
        obstacleType: 'temptation',
        when: 'po obiedzie',
        ifText: 'po obiedzie poczuję ochotę na coś słodkiego',
        thenText: 'zjem owoc zabrany z domu i wypiję szklankę wody',
      },
      {
        id: 'relationships',
        label: 'Relacje',
        wish: 'Zadzwonić do 2 bliskich osób w najbliższym tygodniu',
        outcome: 'Poczucie bliskości i radość z rozmowy',
        obstacle: 'Kiedy mam chwilę, myślę „nie wypada dzwonić bez powodu” i odkładam telefon',
        obstacleType: 'belief',
        when: 'wieczorem, kiedy mam chwilę',
        ifText: 'pomyślę „nie wypada dzwonić bez powodu”',
        thenText: 'od razu napiszę SMS „Masz chwilę na rozmowę?”',
      },
    ] satisfies WoopTemplate[],
  },

  about: {
    title: 'Jak to działa',
    intro: 'Krótko o metodzie, z której korzysta {app}.',
    sections: [
      {
        title: 'Czym jest WOOP?',
        paragraphs: [
          'WOOP to skrót od Wish, Outcome, Obstacle, Plan: Życzenie, Najlepszy rezultat, Przeszkoda, Plan. To przystępna forma metody MCII (Mental Contrasting with Implementation Intentions), którą opracowała psycholożka Gabriele Oettingen wraz ze współpracownikami, m.in. Peterem Gollwitzerem.',
        ],
      },
      {
        title: 'Dlaczego samo pozytywne myślenie nie wystarcza?',
        paragraphs: [
          'Badania Gabriele Oettingen pokazały, że samo wyobrażanie sobie sukcesu potrafi uśpić energię do działania – trochę tak, jakby cel był już osiągnięty.',
          'Kontrastowanie mentalne, czyli zestawienie wymarzonego rezultatu z przeszkodą w sobie, pomaga zobaczyć, co naprawdę stoi na drodze. Gdy cel jest realny, dodaje energii i zaangażowania.',
        ],
      },
      {
        title: 'Plan „jeśli–to”',
        paragraphs: [
          'Peter Gollwitzer badał plany w formie „Jeśli pojawi się sytuacja X, to zrobię Y” (implementation intentions). Taki plan łączy konkretny moment z konkretnym działaniem, więc w chwili przeszkody nie trzeba podejmować decyzji od nowa.',
        ],
      },
      {
        title: 'Kiedy życzenie okazuje się nierealne',
        paragraphs: [
          'MCII pomaga też odpuścić. Jeśli po zestawieniu rezultatu z przeszkodą życzenie wydaje się poza zasięgiem, łatwiej świadomie je zmienić albo zostawić i skierować energię tam, gdzie ma szansę zadziałać.',
        ],
      },
      {
        title: 'Jak korzystać z aplikacji',
        paragraphs: [
          'Pierwszy WOOP zrób w spokojnym miejscu, ok. 5–10 minut. Wyobrażaj sobie rezultat i przeszkodę, nie tylko je wpisuj.',
          'Jedna główna przeszkoda, jeden plan. Codzienna minuta powtórki wzmacnia skojarzenie „sytuacja → działanie”, a przycisk „Przeszkoda teraz!” przypomni plan w trudnej chwili.',
          'Raz w tygodniu zrób przegląd i popraw to, co nie działa. Najlepiej mieć maksymalnie 3 aktywne WOOP-y naraz.',
        ],
      },
    ],
    sourceTitle: 'Skąd ta metoda',
    source:
      'WOOP i MCII to dorobek naukowy Gabriele Oettingen i jej współpracowników. Oficjalne materiały, przewodniki i aplikację autorki znajdziesz na stronie:',
    disclaimer: '{app} to prywatny, niezależny projekt inspirowany tą metodą i niepowiązany z jej autorami.',
  },

  backup: {
    title: 'Kopia zapasowa',
    body: 'Wszystko jest tylko na tym urządzeniu. Raz na jakiś czas zapisz kopię – przyda się przy zmianie telefonu albo po wyczyszczeniu przeglądarki.',
    export: 'Pobierz kopię (.json)',
    exported: 'Zapisano kopię: {name}.',
    import: 'Wczytaj kopię z pliku',
    importHint: 'Możesz też wczytać pojedynczy WOOP zapisany z karty (.json).',
    preview: 'W pliku: WOOP-y {woops}, check-iny {checkins}, przypomnienia {reminders}.',
    mode: 'Jak wczytać?',
    merge: { label: 'Połącz z obecnymi danymi', hint: 'Gdy ten sam rekord jest w obu miejscach, wygrywa nowszy.' },
    replace: { label: 'Zastąp wszystko', hint: 'Obecne dane z tego urządzenia zostaną usunięte.' },
    confirmReplace: 'Zastąpić wszystkie dane na tym urządzeniu zawartością kopii? Tej operacji nie da się cofnąć.',
    apply: 'Wczytaj',
    cancel: 'Anuluj',
    done: 'Wczytano kopię.',
    errors: {
      json: 'To nie jest poprawny plik JSON.',
      format: 'Ten plik nie wygląda na kopię z {app}.',
      version: 'Ta kopia pochodzi z nowszej wersji aplikacji. Zaktualizuj aplikację i spróbuj ponownie.',
    },
  },

  /**
   * Słowniki walidatorów. Wzorce:
   *   "czas"          rdzeń – łapie „czas”, „czasu”, „czasem”…
   *   "=sam"          tylko dokładnie to słowo
   *   "nie mam czas"  kilka słów po kolei (każde jako rdzeń)
   *   "!czasopism"    wyjątek – słowa zaczynające się tak nigdy nie pasują
   */
  // prettier-ignore
  lexicon: {
    stopwords: [
      'i', 'w', 'we', 'z', 'ze', 'na', 'do', 'się', 'to', 'że', 'o', 'a', 'po', 'jak', 'jest', 'nie', 'mi', 'mnie',
      'sobie', 'ja', 'ty', 'ten', 'ta', 'te', 'tym', 'tego', 'za', 'od', 'przez', 'dla', 'bo', 'czy', 'gdy', 'kiedy',
      'jeśli', 'jeżeli', 'ale', 'lub', 'albo', 'oraz', 'już', 'też', 'tak', 'bardzo', 'co', 'są', 'być', 'będę',
      'będzie', 'chcę', 'mój', 'moja', 'moje', 'moim', 'swój', 'swoje', 'swoja', 'tylko', 'jeszcze', 'by', 'aby',
      'żeby', 'mam', 'ma', 'mieć', 'więcej', 'mniej',
    ],
    vague: [
      'więcej', 'lepiej', 'lepsz', 'bardziej', 'zacz', 'mniej', 'częściej', 'często', 'regularn', 'trochę', 'jakoś',
      'ogarn', 'popraw', 'zdrowiej', 'zdrowo', 'kiedyś', 'w końcu', 'wreszcie', 'zadbać', 'zadbam', 'schudn', 'naucz',
      '!nauczyciel', 'aktywn', 'produktywn', 'dużo', 'sporo', 'jak najwięcej',
    ],
    measure: [
      'raz', '!razem', '=dwa', '=dwie', '=trzy', '=cztery', '=pięć', '=sześć', '=siedem', '=osiem', '=dziewięć',
      '=dziesięć', 'każd', 'codzien', 'dzienn', 'tygodniow', 'miesięczn', 'minut', 'godzin', '=min', '=h', '=km',
      'kilometr', '=kg', 'kilogram', 'stron', 'rozdział', '=zł', 'złot', 'procent', 'kroków', 'litr', 'poniedział',
      'wtor', 'środ', '!środowisk', 'czwart', 'piątek', 'piątk', 'sobot', 'niedziel',
    ],
    dependent: [
      'awans', 'podwyżk', 'dostać', 'dostanę', 'żeby ktoś', 'żeby ludzie', 'żeby inni', 'żeby szef', 'żeby on',
      'żeby ona', 'żeby oni', 'żeby mnie', 'aby ktoś', 'aby mnie', 'docen', 'polubi', 'pokocha', 'zaakcept',
      'zauważył', 'zauważy mnie', 'wybrał', 'zatrudni', 'przyjęli', 'przyjął', 'wygrać', 'wygram', 'zgodził',
      'zgodzi się', 'zmienił się', 'zmieni się', 'wybaczył', 'przeprosił', 'odezwał', 'oddzwoni',
    ],
    negation: [
      'żeby nie', 'aby nie', 'przestać', 'przestanę', 'rzucić', 'rzucę', 'unikać', 'uniknę', 'skończyć z',
      'wyeliminow', 'odstawić', 'odstawię', 'zerwać z', 'pozbyć się', 'ograniczyć', 'ograniczę',
    ],
    feeling: [
      'czu', 'poczu', 'energi', 'energiczn', 'sił', '!siłown', 'spok', 'radoś', 'radosn', 'ciesz', 'dum', 'satysfakc',
      'lekk', 'pewnoś', 'pewn siebie', 'zadowol', 'szczęśl', 'szczęści', 'ulg', 'swobod', 'wolnoś', 'zdrow', '=sen',
      'snu', 'spać', 'śpię', 'wyspan', 'relaks', 'odpoczyn', 'odpręż', 'stres', 'przyjemn', 'motywac', 'wiar', 'odwag',
      'bliskoś', 'blisko', 'czas dla', 'kontrol', 'spełnien', 'sens', 'wdzięczn', 'komfort', 'zachwyc', 'ekscyt',
      'humor', 'nastr', 'samopocz', 'kondycj', 'formie', '=forma', '=formę', '=formy', 'zmęczen', 'luz', 'szacun', 'lubię', 'polubię', 'świeżoś',
      'witalnoś', 'radość', 'frajd', 'fajn', 'super', 'dobrze', 'lepsze samopoczucie',
    ],
    external: [
      'brak czas', 'nie mam czas', 'za mało czas', 'brak pieniądz', 'brak pieniędz', 'nie mam pieniędz', 'brak kasy',
      'za dużo prac', 'dużo prac', 'inni ludz', 'czas', '!czasopism', 'nie mam kiedy', 'prac', '!pracowit', 'szef', 'kierown', 'dziec', 'dzieck', 'pieniądz',
      'pieniędz', '=kasy', '=kasa', 'finans', 'budżet', 'pogod', 'deszcz', 'zimn', 'upał', 'ciemn', '=inni', '=innych',
      '=innym', '=innymi', 'ludz', 'znajom', 'rodzin', 'partner', '=mąż', '=męża', '=mężem', '=żona', '=żony', '=żoną',
      'koleżank', 'koleg', 'rodzic', 'teściow', 'sąsiad', 'obowiąz', '=korki', '=korek', '=korkach', 'dojazd',
      'daleko', 'sprzęt', 'internet', 'chorob', 'kontuzj', 'delegac', 'wyjazd', 'grafik', '=nikt', '=ktoś', 'hałas',
      'warunk', 'okoliczn', 'firm', 'klient',
    ],
    externalReframes: [
      { key: 'time', patterns: ['czas', 'nie mam kiedy', 'grafik'] },
      { key: 'boss', patterns: ['szef', 'kierown'] },
      { key: 'work', patterns: ['prac', 'obowiąz', 'firm', 'klient', 'delegac'] },
      { key: 'kids', patterns: ['dziec', 'dzieck'] },
      { key: 'money', patterns: ['pieniądz', 'pieniędz', '=kasy', '=kasa', 'finans', 'budżet'] },
      { key: 'weather', patterns: ['pogod', 'deszcz', 'zimn', 'upał', 'ciemn'] },
      {
        key: 'people',
        patterns: ['=inni', '=innych', '=innym', 'ludz', 'znajom', 'rodzin', 'partner', '=nikt', '=ktoś', 'koleg'],
      },
    ],
    internal: {
      emotion: [
        'czuj', 'czuć', 'poczuc', 'boj', 'boi', 'obaw', 'lęk', '!lekc', '!lekarz', '!lekk', '!lekar', 'strach', 'stres',
        'wstyd', 'zmęczen', 'zmęczon', 'znuż', 'nud', 'niechęć', 'niechęci', 'złoś', 'smut', 'frustr', 'zniechęc',
        'przytłocz', 'napięci', 'niepokój', 'niepokoj', 'presj', 'zazdroś', 'irytac', 'irytuj', 'zdenerw', 'nerw',
        'winy', 'samotn', 'apati', 'zniecierpl', 'panik', 'przeraż', 'onieśmiel', 'rozczarow', 'motywac', 'energi',
        'senn', 'śpiąc', 'brak sił', 'nie mam sił', 'nie mam siły',
      ],
      habit: [
        'zamiast', 'scroll', 'przewijam', 'odkładam', 'przekładam', 'zwlek', 'prokrastyn', 'nawyk', 'siadam', 'kładę się', 'włączam', 'sięgam', 'otwieram', 'kanap', 'serial', 'telefon', 'social', 'insta',
        'facebook', 'tiktok', 'youtube', 'netflix', 'gram w', '=gry', 'podjadam', 'zasiedz', 'przesypiam', 'drzemk',
        'autopilot', 'rutyn', 'odpuszcz', 'rezygn', 'poddaj',
      ],
      thought: [
        'mówię sobie', 'myślę', 'myśl', 'wmawiam', 'tłumaczę sobie', 'wymówk', 'jutro', 'później', '=potem',
        'zrobię to', 'wydaje mi się', 'i tak', 'nie ma sensu', 'nie warto', 'nie teraz', 'od poniedziałku',
        'jeszcze tylko', 'zasłuż', 'należy mi się', 'co tam',
      ],
      belief: [
        'nie jestem', 'nie potraf', 'nie umiem', 'nie dam rady', 'nie nadaję', 'jestem za', 'beznadziej', 'nigdy mi',
        'nie zasługuj', 'nie wyjdzie', 'nie dla mnie', 'nie mam talentu', 'jestem słab', 'leniw', 'lenist', 'perfekc',
        'muszę być', 'wszystko albo nic', 'za późno', 'nie wierzę',
      ],
      temptation: [
        'ochot', 'kusi', 'pokus', 'słodycz', 'przekąs', 'chips', 'alkohol', 'piwo', '=wino', 'papieros', 'impuls',
        'zachcian', 'zakup', 'czekolad', 'fast food', 'pizz', 'cukier', 'ciastk', 'drink', 'odruch',
      ],
    } satisfies Record<InnerObstacleType, string[]>,
    weakPlan: [
      'postaram się', 'postaram', 'postarać', 'spróbuj', 'próbować', 'będę bardziej', 'będę się starać', 'będę starał', 'będę starała',
      'staram się', 'starać się', 'muszę', 'musiał', 'powinien', 'powinnam', 'powinienem', 'powinn', 'chciał', 'chcę',
      'może', 'jakoś', 'w miarę', 'raczej', 'bardziej się', 'zmotywuj', 'zmuszę', 'zmusić', 'nie poddam',
      'mam nadzieję', 'będę pamiętać', 'pamiętać', 'zastanowię', 'kiedyś', 'w końcu', 'coś zrobię', 'jak najwięcej',
    ],
    wishLike: ['chcę', 'chciał', 'mój cel', 'moim celem', 'marzę', 'pragnę', 'zamierzam', 'planuję'],
    fillerStart: [
      'chcę', 'chciałbym', 'chciałabym', 'moim celem jest', 'mój cel to', 'mam zamiar', 'zamierzam', 'planuję',
      'marzę o tym żeby', 'marzę żeby', 'pragnę', 'jeśli', 'jeżeli', 'to', 'że', 'żeby', 'aby', 'będę mieć',
      'będę miał', 'będę miała', 'będę',
    ],
    functionWords: [
      'i', 'oraz', 'a', 'lub', 'albo', 'ale', 'w', 'we', 'z', 'ze', 'na', 'do', 'przez', 'dla', 'po', 'od', 'o', 'za',
      'przy', 'u', 'bez', 'pod', 'nad', 'przed', 'między', 'że', 'bo', 'aby', 'żeby', 'który', 'która', 'które',
      'kiedy', 'gdy', 'jak', 'jeśli', 'czyli', 'więc', 'by',
    ],
    subordinators: [
      'kiedy', 'gdy', 'jak', 'bo', 'że', 'który', 'która', 'które', 'więc', 'ale', 'a', 'jeśli', 'jeżeli',
      'chociaż', 'ponieważ', 'mimo', 'zanim', 'dopóki', 'aż', 'żeby', 'aby', 'to',
    ],
    listConjunctions: ['i', 'oraz', 'albo', 'lub', 'a także', 'ani'],
    verbStoplist: ['się', 'tę', 'cię', 'mię', 'tam', 'sam', 'nam', 'wam', 'program', 'problem', 'system'],
    conditionalStart: ['jeśli', 'jeżeli', 'gdy', 'kiedy', 'gdyby', 'jak', 'o ile'],
  } satisfies Lexicon,
};

export type Content = typeof pl;
