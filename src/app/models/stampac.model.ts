// =============================================================
//  MODEL: Stampac
//  -------------------------------------------------------------
//  Opis jednog modela stampaca. Pored naziva i slike, svaki
//  stampac je povezan sa odgovarajucim tonerom preko "tonerId"
//  (broj koji pokazuje na id tonera iz kolekcije tonera).
// =============================================================
export interface Stampac {
  id: number;      // jedinstveni broj (dodeljuje json-server)
  model: string;   // naziv modela, npr. "HP LaserJet Pro M404dn"
  slika: string;   // putanja do slike, npr. "stampaci/hp-m404.png"
  tonerId: number; // id tonera koji ovaj stampac koristi (veza ka Toner)
}
