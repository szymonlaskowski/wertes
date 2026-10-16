# Checklista

`[x]` zrobione i sprawdzone, `[-]` nie dotyczy, z powodem.

## 1. Design

- [x] Kierunek wybrany z trzech pokazanych na jednej stronie (`start.md`, krok 2):
      kolory starej strony, krój z logo, unowocześnione (makiety skasowane po decyzjach)
- [x] Tablica decyzji rozstrzygnięta (`start.md`, krok 3): 1A 2A 3A 4B 5C 6A 7A 8A 9A
      10A (makiety skasowane po decyzjach)
- [ ] Tokeny w `@theme`, domyślne skale wyzerowane, więc klasa spoza tokenów nie da stylu.
      Istniejący UI: zeruj dopiero po przepięciu sekcji na tokeny, bo Tailwind po cichu
      pomija nieznane klasy i strona rozsypie się bez żadnego błędu
- [x] Sekcja Wygląd w `AGENTS.md` wypełniona, `start.md` usunięty
- [-] Podgląd na postplan.dev: strona `/podglad` i makiety usunięte na życzenie,
      w repo zostają tylko tokeny w `@theme` i reguły w `AGENTS.md`
- [x] Przycisk jako jeden komponent z dokładnie dwoma wariantami
      (`src/components/button.tsx`)
- [ ] Podstrony po jednej: zbudowana albo przepięta na tokeny, zrzut,
      sprawdzona z regułami, zaakceptowana, dopiero wtedy następna
- [ ] Wszystkie sekcje stoją, w kolejności, z przejściami

## 2. Treść

- [ ] Podstrony: o nas, kontakt
- [ ] Formularze: walidacja, stan błędu, stan wysłania
- [ ] 404, favicon, obrazek OG, sitemap, robots.txt

## 3. Konta

- [ ] Rejestracja, logowanie, reset hasła
- [ ] Moje konto, usunięcie konta

## 4. Serwer

- [ ] VPS: projekt dev na domenie dev
- [ ] Projekt prod z brancha main, wydanie to merge dev do main
- [ ] Backup bazy i sprawdzone odtworzenie z backupu
- [ ] Zgłaszanie błędów i monitoring dostępności

## 5. Maile

- [ ] Wysyłka maili transakcyjnych
- [ ] SPF, DKIM, DMARC na domenie

## 6. Prawo

- [ ] Polityka prywatności, regulamin przy sprzedaży
- [ ] Zgody przed wysłaniem formularza i przed zakupem
- [ ] Umowy powierzenia z dostawcami przetwarzającymi dane

## 7. Analityka

- [ ] Baner zgód działa, zanim analityka cokolwiek zbiera
- [ ] Analityka podpięta pod zgodę, zdarzenia kluczowe mierzone

## 8. Testy

- [ ] Cała ścieżka jako użytkownik na komputerze i telefonie
- [ ] Audyt wyglądu: każda reguła z `AGENTS.md` sprawdzona sekcja po sekcji, złamania
      wskazane po nazwie; sekcje i przejścia zgodne z listą; zero wartości dowolnych
      (`rg -n -- '-\[|#[0-9a-fA-F]{6}'` po szablonach); motyw wraca minimum pięć razy;
      usunięte 20 procent (jedna sekcja, połowa ikon, nagłówki typu "Dlaczego my");
      rytm zmienny, bez pasa równomiernie średnio wypełnionych sekcji
- [ ] Audyt `znaki-ai.md`: każdy punkt sprawdzony na zrzutach i w kodzie, trafienia
      usunięte albo wpisane w Reguły; strona nie przechodzi testu zakrytego logo;
      każda sekcja ma nazwaną skrajną decyzję
- [ ] Poprawki po testach
