// =============================================================
//  CUSTOM VALIDATORI
//  -------------------------------------------------------------
//  Sopstvena pravila za proveru polja u formi. Validator je obicna
//  funkcija: vrati null ako je vrednost ISPRAVNA, ili objekat sa
//  greskom ako NIJE. Angular onda prikaze odgovarajucu poruku.
// =============================================================
import { AbstractControl, ValidationErrors } from '@angular/forms';

// --- ID broj stampaca: TACNO 6 cifara ---
// Primer ispravnog: "100245". Dozvoljene su samo cifre i mora ih biti 6.
export function idStampacaValidator(control: AbstractControl): ValidationErrors | null {
  const vrednost: string = control.value || '';
  if (!vrednost) {
    return null; // prazno proverava "required"
  }
  // ^\d{6}$ znaci: od pocetka do kraja tacno 6 cifara (0-9).
  const ispravan = /^\d{6}$/.test(vrednost);
  return ispravan ? null : { idStampaca: true };
}

// --- Telefon (Srbija): mora poceti sa +381, BEZ nule odmah posle ---
// Primer ispravnog: "+381 601424850" ili "+381601424850".
// Pravilo: +381, zatim opcioni razmak, prva cifra 1-9 (ne 0), pa jos 7-8 cifara.
export function telefonValidator(control: AbstractControl): ValidationErrors | null {
  const vrednost: string = control.value || '';
  if (!vrednost) {
    return null; // prazno proverava "required"
  }
  //  ^\+381      -> mora poceti sa +381
  //  \s?         -> opcioni jedan razmak
  //  [1-9]       -> prva cifra posle 381 NE sme biti 0
  //  \d{7,8}$    -> jos 7 ili 8 cifara do kraja
  const ispravan = /^\+381\s?[1-9]\d{7,8}$/.test(vrednost);
  return ispravan ? null : { telefon: true };
}
