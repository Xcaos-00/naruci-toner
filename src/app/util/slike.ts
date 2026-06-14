// =============================================================
//  POMOCNA MAPA: naziv modela -> putanja do slike
//  -------------------------------------------------------------
//  Na javnoj formi sliku dobijamo direktno iz objekta Stampac
//  (polje "slika"). Ali u admin delu zahtev cuva samo NAZIV modela
//  (tekst), pa ovde mapiramo naziv -> slika da bismo i tamo prikazali
//  ilustraciju. Drzimo na jednom mestu radi preglednosti.
// =============================================================
const MAPA: Record<string, string> = {
  'HP LaserJet Pro M404dn': 'stampaci/hp-m404.png',
  'HP LaserJet Pro MFP M428fdw': 'stampaci/hp-m428.png',
  'Canon i-SENSYS LBP223dw': 'stampaci/canon-lbp223.png',
  'Brother HL-L2350DW': 'stampaci/brother-l2350.png',
  'Xerox Phaser 3260': 'stampaci/xerox-3260.png',
  'Samsung Xpress M2070': 'stampaci/samsung-m2070.png',
  'Epson EcoTank L3250': 'stampaci/epson-l3250.png',
};

// Vrati sliku za dati naziv modela; ako model nije poznat, vrati
// rezervnu (default) ilustraciju.
export function slikaZaModel(model: string): string {
  return MAPA[model] ?? 'stampaci/hp-m404.png';
}
