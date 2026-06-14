// =============================================================
//  SERVIS: MagacinService
//  -------------------------------------------------------------
//  Rad sa magacinima i stanjem tonera. Ucitava magacine i stanje,
//  menja kolicinu (PUT) i nudi pomocne metode za isporuku i transfer.
// =============================================================
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Magacin, StanjeStavka } from '../models/magacin.model';

@Injectable({ providedIn: 'root' })
export class MagacinService {
  private http = inject(HttpClient);
  private readonly apiMagacini = 'http://localhost:3000/magacini';
  private readonly apiStanje = 'http://localhost:3000/stanje';

  getMagacini(): Observable<Magacin[]> {
    return this.http.get<Magacin[]>(this.apiMagacini).pipe(catchError(this.greska));
  }

  getStanje(): Observable<StanjeStavka[]> {
    return this.http.get<StanjeStavka[]>(this.apiStanje).pipe(catchError(this.greska));
  }

  // Sacuvaj izmenjenu kolicinu jedne stavke stanja (PUT).
  azurirajStanje(stavka: StanjeStavka): Observable<StanjeStavka> {
    return this.http.put<StanjeStavka>(`${this.apiStanje}/${stavka.id}`, stavka).pipe(
      catchError(this.greska)
    );
  }

  private greska(e: any) {
    console.error('Greska (magacin):', e);
    return throwError(() => new Error('Greska pri radu sa magacinima. Da li je server pokrenut?'));
  }
}
