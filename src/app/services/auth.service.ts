// =============================================================
//  SERVIS: AuthService
//  -------------------------------------------------------------
//  Jednostavna autentifikacija za admin deo. Cuva da li je
//  administrator prijavljen. Koristi ga i AuthGuard (za zastitu ruta)
//  i Login komponenta. Lozinka je ovde "hardkodovana" radi
//  jednostavnosti - u pravoj aplikaciji proveru radi backend.
// =============================================================
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Fiksni nalog administratora (za potrebe projekta).
  private readonly KORISNIK = 'admin';
  private readonly LOZINKA = 'admin123';

  // Kljuc pod kojim u localStorage pamtimo da je neko prijavljen,
  // kako prijava ne bi nestala kada se stranica osvezi (F5).
  private readonly KLJUC = 'naruci-toner-prijavljen';

  // Pokusaj prijave. Vraca true ako su podaci ispravni.
  prijava(korisnik: string, lozinka: string): boolean {
    if (korisnik === this.KORISNIK && lozinka === this.LOZINKA) {
      localStorage.setItem(this.KLJUC, 'da');
      return true;
    }
    return false;
  }

  // Odjava - brisemo zapis o prijavi.
  odjava(): void {
    localStorage.removeItem(this.KLJUC);
  }

  // Da li je administrator trenutno prijavljen?
  jePrijavljen(): boolean {
    return localStorage.getItem(this.KLJUC) === 'da';
  }
}
