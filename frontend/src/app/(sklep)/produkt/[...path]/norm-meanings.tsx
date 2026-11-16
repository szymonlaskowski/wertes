const NORM_MEANINGS = new Map([
  ["EN ISO 13688", "Odzież ochronna, wymagania ogólne: rozmiar, ergonomia, nieszkodliwość materiału."],
  ["EN ISO 20345", "Obuwie bezpieczne z podnoskiem chroniącym palce przed uderzeniem 200 J."],
  ["EN ISO 20347", "Obuwie zawodowe bez podnoska."],
  ["EN ISO 20344", "Metody badań obuwia ochronnego."],
  ["OEKO-TEX STANDARD 100", "Tkanina przebadana na substancje szkodliwe."],
  ["EN ISO 21420", "Rękawice, wymagania ogólne: rozmiar, zręczność, nieszkodliwość materiału."],
  ["EN 420", "Rękawice, wymagania ogólne: rozmiar, zręczność, nieszkodliwość materiału."],
  ["EN 388", "Zagrożenia mechaniczne: ścieranie, przecięcie, rozdarcie, przekłucie."],
  ["EN 407", "Ochrona przed ciepłem i ogniem."],
  ["EN 511", "Ochrona przed zimnem."],
  ["EN ISO 374-1", "Ochrona przed chemikaliami."],
  ["EN ISO 374-2", "Szczelność: rękawica nie przepuszcza cieczy."],
  ["EN ISO 374-4", "Odporność materiału na niszczenie przez chemikalia."],
  ["EN ISO 374-5", "Ochrona przed bakteriami i grzybami."],
  ["EN 455", "Rękawice medyczne jednorazowego użytku."],
  ["EN 166", "Ochrona oczu, wymagania podstawowe."],
  ["EN 170", "Filtry chroniące oczy przed promieniowaniem UV."],
  ["EN 172", "Filtry przeciwsłoneczne do pracy w przemyśle."],
  ["EN ISO 20471", "Odzież ostrzegawcza o intensywnej widzialności."],
  ["EN 343", "Ochrona przed deszczem."],
  ["EN 1149-5", "Odzież antyelektrostatyczna."],
  ["EN 13034", "Ochrona przed rozpryskami ciekłych chemikaliów."],
  ["EN 14126", "Ochrona przed czynnikami zakaźnymi."],
  ["EN ISO 11611", "Odzież dla spawaczy."],
  ["EN ISO 11612", "Ochrona przed gorącem i płomieniem."],
  ["EN 397", "Przemysłowy hełm ochronny."],
  ["EN 812", "Przemysłowa czapka chroniąca głowę przed uderzeniem."],
  ["EN 50365", "Hełm elektroizolacyjny do pracy przy niskim napięciu."],
  ["EN 352-1", "Nauszniki przeciwhałasowe."],
  ["EN 352-2", "Wkładki przeciwhałasowe do uszu."],
  ["EN 352-3", "Nauszniki mocowane do hełmu."],
  ["EN 149", "Półmaska filtrująca cząstki, klasy FFP1, FFP2, FFP3."],
  ["EN 143", "Filtry przeciwpyłowe."],
  ["EN 14387", "Pochłaniacze gazów i par."],
]);

export function NormMeanings({ norms }: { norms: string[] }) {
  if (norms.length === 0) {
    return null;
  }

  return (
    <ul aria-label="Normy" className="flex flex-wrap gap-1">
      {norms.map((norm) => (
        <li key={norm} className="grow bg-paper p-2">
          <p className="text-title leading-none font-bold tabular-nums">{norm}</p>
          {NORM_MEANINGS.has(norm) && <p className="mt-1 text-small">{NORM_MEANINGS.get(norm)}</p>}
        </li>
      ))}
    </ul>
  );
}
