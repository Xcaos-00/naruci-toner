// =============================================================
//  SERVIS: ZahtevService
//  -------------------------------------------------------------
//  Glavni servis za rad sa zahtevima za toner. Sadrzi sve cetiri
//  HTTP operacije (GET, POST, PUT, DELETE) i obradu gresaka.
//  Ovde je "poslovna logika" - komponente samo pozivaju ove metode.
// =============================================================
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Zahtev, ZahtevStatus } from '../models/zahtev.model';

@Injectable({ providedIn: 'root' })
export class ZahtevService {
  private http = inject(HttpClient);
  private readonly api = 'http://localhost:3000/zahtevi';

  // ---- GET: ucitaj SVE zahteve -------------------------------
  getZahtevi(): Observable<Zahtev[]> {
    return this.http.get<Zahtev[]>(this.api).pipe(
      // tap() koristimo za "uzgredne" radnje (npr. log u konzolu);
      // ne menja podatke koji prolaze kroz tok.
      tap((lista) => console.log('Ucitano zahteva:', lista.length)),
      // catchError() hvata gresku ako server ne radi i prosledjuje je dalje.
      catchError(this.obradiGresku)
    );
  }

  // ---- GET: ucitaj JEDAN zahtev po id-u (za stranicu detalja) -
  getZahtev(id: number): Observable<Zahtev> {
    return this.http.get<Zahtev>(`${this.api}/${id}`).pipe(
      catchError(this.obradiGresku)
    );
  }

  // ---- POST: napravi NOVI zahtev (sa javne forme) ------------
  // Primamo zahtev bez id-a, status i datum postavljamo ovde da
  // komponenta ne mora o tome da brine.
  dodajZahtev(podaci: Omit<Zahtev, 'id' | 'status' | 'datum'>): Observable<Zahtev> {
    const noviZahtev: Zahtev = {
      ...podaci,                       // prepisemo sva uneta polja
      status: 'novo',                  // svaki novi zahtev krece kao "novo"
      datum: new Date().toISOString(), // trenutni datum i vreme
    };
    return this.http.post<Zahtev>(this.api, noviZahtev).pipe(
      tap((z) => console.log('Sacuvan novi zahtev sa id:', z.id)),
      catchError(this.obradiGresku)
    );
  }

  // ---- PUT: promeni STATUS postojeceg zahteva ----------------
  promeniStatus(zahtev: Zahtev, noviStatus: ZahtevStatus): Observable<Zahtev> {
    // Napravimo kopiju zahteva sa novim statusom (ne diramo original).
    const azuriran: Zahtev = { ...zahtev, status: noviStatus };
    return this.http.put<Zahtev>(`${this.api}/${zahtev.id}`, azuriran).pipe(
      // map() moze da transformise odgovor; ovde samo vracamo azuriran zahtev.
      map(() => azuriran),
      catchError(this.obradiGresku)
    );
  }

  // ---- DELETE: obrisi zahtev ---------------------------------
  obrisiZahtev(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(
      catchError(this.obradiGresku)
    );
  }

  // ---- Zajednicka obrada gresaka -----------------------------
  // Privatna metoda koju koriste sve gore navedene operacije.
  private obradiGresku(greska: any) {
    console.error('Greska u komunikaciji sa serverom:', greska);
    // throwError vraca Observable koji "puca" greskom, pa komponenta
    // moze da je uhvati i prikaze poruku korisniku.
    return throwError(() => new Error('Doslo je do greske. Da li je server pokrenut?'));
  }
}
