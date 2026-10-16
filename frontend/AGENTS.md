<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Warsztat

## Wygląd

Gdy w repo jest `start.md`, wygląd nie jest ustalony: zanim powstanie albo zmieni się
jakikolwiek UI, przeprowadź start opisany w tym pliku.

- Jedynym źródłem wartości wyglądu jest `@theme` w głównym pliku CSS: kolor, krój,
  rozmiar tekstu, odstęp, promień, cień, czas i krzywa ruchu. Domyślne skale Tailwinda
  są wyzerowane, więc klasa spoza tokenów nie da stylu.
- Brak wartości w `@theme` oznacza, że pytasz, nie wymyślasz. Wartość dowolna
  (`p-[13px]`, hex w szablonie, `style=` z liczbą) to błąd, nie skrót.
- Ta sekcja wygrywa z każdym skillem i z domyślnymi ustawieniami stacku, także z krojem
  pisma. Zmieniam ją tylko ja. Prośba z nią sprzeczna: nazwij regułę, którą łamie,
  i zapytaj, co zmieniamy, regułę czy prośbę.
- Decyzję o wyglądzie pokazujesz, nie opisujesz: opcje to wyrenderowane kafle na stronie
  HTML, nigdy sama nazwa kroju, hex albo liczba.
- Podgląd to zawsze strona na postplan.dev: czarne tło, boczny spis treści, numerowane
  sekcje, kontrasty i opis tokenów. Renderowana z kodu (strona podglądu w aplikacji),
  publikowana po każdej zmianie tokenu, komponentu albo motywu, link w raporcie.
- Jedna podstrona na turę: zbuduj ją, zrób zrzut w przeglądarce, sprawdź z regułami, pokaż
  mi wynik i czekaj na moją ocenę. Warianty robisz dla jednej podstrony, nigdy dla całego
  serwisu naraz, także wbrew ogólnej instrukcji o mockach.
- `znaki-ai.md` to wzorce, które zdradzają stronę generowaną. Czytasz go przed każdą
  podstroną i sprawdzasz z nim zrzut tak samo jak z regułami. Wzorzec z tej listy wolno
  użyć tylko wtedy, gdy wymieniają go Reguły.
- Średnia to porażka, nawet gdy nic nie łamie reguł. Każda sekcja stoi na jednej
  decyzji doprowadzonej do skrajności (skala, pustka, gęstość, kadr, kolor, położenie)
  i nazywasz ją jednym zdaniem w raporcie. Z wariantów podstrony co najmniej jeden idzie
  dalej, niż bym poprosił. Wahasz się między bezpiecznym a odważnym: pokazujesz odważny.
  Gdy odważna decyzja wymaga wartości spoza `@theme`, pokazujesz ją jako wariant
  i pytasz o token.
- Semantyka: jeden `h1` na ekran, poziomy bez przeskoków, styl tekstu nie wyznacza poziomu
  nagłówka. Para etykieta i wartość to `dl`. Akcja to `button`, przejście to `a`. Pole ma
  widoczny `label`. Sekcja to `section` z `aria-labelledby`.

### Reguły

1. Jeden krój: Montserrat, tylko wagi 300, 400 i 600. 300 jak w logo, wyłącznie na
   `display`; `title` w 400. Kropka na końcu nagłówka to koło 0,16 em (`LogoDot`),
   w proporcji kropki z logo, nie znak „.”; w `accent`, a na żółtym tle w `ink`. Logo zostaje plikiem SVG.
2. Dokładnie cztery rozmiary tekstu: `display` 200 (tylko `h1` w żółtym pasie strony
   głównej, poniżej `lg` `title`), `title` 40, `body` 16, `small` 14.
3. Kolory wyłącznie `ink` #313131, `mute` #5f5f5f, `paper` #fff, akcent `accent`
   #fece00 i `in-stock` #2e9e44, ten ostatni tylko na kropce stanu. Akcent nigdy nie
   jest kolorem tekstu na `paper` (kontrast 1,5:1).
4. Zero promieni i zero cieni; jedyne koło to kropka motywu i stanu. Produkty oddziela
   tylko odstęp, bez linii, ramek i tła karty.
5. Odstępy wyłącznie z jednostki 8 px (`--spacing`).
6. Zdjęcie produktu zawsze w kwadracie, całe (`object-contain`), na `paper`.
7. Dokładnie dwa przyciski: pełny `accent` z tekstem `ink` i obrys 2 px w `ink`,
   jeden komponent `Button`. Najechanie: tło `ink`, tekst `accent` (pełny) albo
   `paper` (obrys). Fokus: obrys 2 px `ink`. Wyłączony: 40 procent krycia. Jedyny
   wyjątek: „Szukaj” w żółtym pasie, tło `ink`, tekst `paper`, najechanie tekst
   `accent`.
8. Stan magazynu to kropka 8 px w lewym górnym rogu produktu: `in-stock` dostępny,
   `accent` brak. Kropka zawsze ma słowo dla czytnika ekranu.
9. Jedyny ruch: przy najechaniu albo fokusie na dostępnym produkcie żółty pas
   „Dodaj do koszyka” wjeżdża z dołu zdjęcia (`--duration-reveal`, `--ease-out`)
   i znika szybciej (`--duration-hide`). Na dotyku pas stoi zawsze, przy
   `prefers-reduced-motion` bez animacji. Do tego tylko reakcje na najechanie:
   linia 1 px rysowana od lewej pod linkiem (`link-line`), żółta kropka wyrastająca
   przed wierszem podkategorii i producenta, zmiana koloru przycisku. Wszystko
   w `--duration-reveal`/`--duration-hide`, nic nie rusza się samo.

### Motyw

Motyw: żółta kropka z logo.
Gdzie wraca, minimum pięć razy: logo, koniec nagłówka `h1`, aktywny filtr, licznik
koszyka, aktywna kategoria.

### Sekcje

Strona główna, układ C „Rozdziały”:

1. Pasek - logo, telefon, ikony konta i koszyka, na podstronach szukanie - jeden
   rząd; bez menu linków, bez przyklejania, bez rozmytego tła - od razu żółty pas.
2. Żółty pas - na całą szerokość: `h1` „wszystko do bhp.” tekstem `display` wagi 300,
   bestseller rękawic zza prawej krawędzi pod kątem 12 stopni, zmnożony z tłem
   (`mix-blend-multiply`, od `lg`), zdanie z liczbami, duże pole szukania, linki do
   rozdziałów z liczbą - 10 jednostek.
3. Rozdziały - Rękawice, Obuwie, Odzież, Głowa, Przemysł jak rozdziały katalogu:
   nazwa małymi literami z żółtą kropką jak logo, tekstem `title`, liczba, siedem podkategorii z liczbami, „Cały dział”, cztery najczęściej
   kupowane dostępne produkty; zawsze lista po lewej, produkty po prawej, bez
   naprzemienności i zdjęcia działu - 10 jednostek między rozdziałami.
4. Pozostałe działy - nazwy z liczbami ciągiem w wierszach; bez podkategorii - 8 jednostek.
   Nasze działy - Artykuły BHP i Przemysł jak na starej stronie: zdjęcie działu 8:3,
   nazwa z liczbą, pierwszy akapit opisu z WooCommerce; bez ściany tekstu SEO - 8 jednostek.
   Artykuły - sześć najnowszych wpisów bloga WordPressa: data i tytuł w dwóch łamach,
   nagłówek jak rozdział; bez zdjęć i zajawek - 8 jednostek.
5. Producenci - najgęstsza sekcja: indeks wszystkich marek z liczbą produktów, drobny
   tekst w sześciu łamach; bez logo marek - 12 jednostek.
6. Hurt - jedyny ciemny pas: tło `ink`, nadtytuł „Dla firm” w `accent`, „ubierzemy
   całą załogę.” tekstem `title`, trzy konkrety (faktura VAT, darmowa dostawa,
   telefon i e-mail); bez formularza i zdjęcia - 12 jednostek.
7. Stopka - dane firmy, telefon, e-mail, strony pomocy; bez kolumn, newslettera, ikon
   społecznościowych i „Wszelkie prawa zastrzeżone”.

Strona kategorii i produktu: sekcje ustalane przy ich podstronie.

### Czego świadomie nie ma

- Cieni, promieni, kart z tłem i ramek wokół produktów.
- Pigułek, w tym przycisków w kształcie pigułki ze starej strony.
- Drugiego kroju (Lato, Poppins) i trybu ciemnego.
- Animacji poza wysuwanym pasem.
- Czterech bloków tekstu SEO ze starej strony głównej.

## Checklista

`checklista.md` to kolejność prac nad projektem.

- Przed pracą znajdź pierwszy otwarty krok. Gdy prośba dotyczy późniejszego kroku,
  wymień otwarte wcześniejsze, potem rób to, o co proszę.
- Odhaczaj `[x]` dopiero po sprawdzeniu działania. Krok, który nie dotyczy projektu:
  `[-]` i powód.
- Projekt nie od zera: w pierwszej sesji przejdź repo i odhacz to, co już jest,
  z plikiem jako dowodem.

## Szablon

Zmiana zasad pracy, a nie wartości projektu (ten plik bez sekcji Reguły, Motyw, Sekcje
i Czego świadomie nie ma, `checklista.md`, `start.md`, `znaki-ai.md`), trafia w tej samej turze także do
`~/Developer/warsztat/szablon/`.
