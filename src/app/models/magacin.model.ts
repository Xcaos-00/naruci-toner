// =============================================================
//  MODELI: Magacin i StanjeStavka
//  -------------------------------------------------------------
//  Magacin je skladiste tonera. Glavni magacin se zove SERVIS i iz
//  njega se uvek oduzimaju toneri pri isporuci. StanjeStavka cuva
//  kolicinu jednog tonera u jednom magacinu (veza magacinId+tonerId).
// =============================================================
export interface Magacin {
  id: number;
  naziv: string;     // npr. "SERVIS", "Magacin Sever"
  glavni?: boolean;  // true samo za SERVIS (glavni magacin)
}

export interface StanjeStavka {
  id: number;
  magacinId: number; // u kom magacinu
  tonerId: number;   // koji toner
  kolicina: number;  // koliko komada ima na stanju
}
