// =============================================================
//  MODEL: Toner
//  -------------------------------------------------------------
//  Opis jednog tipa tonera. Svaki stampac je povezan sa tacno
//  jednim tonerom (preko polja tonerId u modelu Stampac).
// =============================================================
export interface Toner {
  id: number;     // jedinstveni broj (dodeljuje json-server)
  oznaka: string; // sifra/oznaka tonera, npr. "HP CF259A"
  boja: string;   // boja tonera, npr. "Crna"
}
