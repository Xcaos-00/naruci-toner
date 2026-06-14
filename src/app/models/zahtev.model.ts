// =============================================================
//  MODEL: Zahtev (zahtev za toner)
//  -------------------------------------------------------------
//  Interfejs opisuje "oblik" jednog zahteva za toner. To je samo
//  TypeScript tip - ne pravi kod u browseru, ali editor zahvaljujuci
//  njemu zna koja polja postoje i kog su tipa, pa pravimo manje gresaka.
// =============================================================

// Moguci statusi jednog zahteva (union tip - dozvoljena je SAMO
// jedna od ovih tacno nabrojanih vrednosti).
//   novo       -> tek pristigao zahtev (pocetno stanje)
//   u_obradi   -> administrator ga je preuzeo u obradu
//   odbijen    -> zahtev je odbijen
//   odobren    -> odobren; salje se mejl o dostavi (sreda)
//   dostavljen -> toner je isporucen korisniku
export type ZahtevStatus =
  | 'novo'
  | 'u_obradi'
  | 'odbijen'
  | 'odobren'
  | 'dostavljen';

// Jedan zahtev za toner (ono sto korisnik popuni na javnoj formi).
export interface Zahtev {
  // id dodeljuje json-server automatski kada se zahtev sacuva,
  // zato je opcioni ("?") - kod novog zahteva ga jos nemamo.
  id?: number;

  idStampaca: string;     // ID broj stampaca (npr. inventarski broj)
  ime: string;            // ime korisnika
  prezime: string;        // prezime korisnika
  modelStampaca: string;  // model stampaca izabran iz padajuce liste
  lokal: string;          // lokal / broj telefona
  email: string;          // mejl na koji saljemo obavestenja

  status: ZahtevStatus;   // trenutni status zahteva
  datum: string;          // datum kreiranja (ISO tekst, npr. 2026-06-14T10:00:00Z)
}
