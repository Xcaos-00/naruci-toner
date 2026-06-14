// =============================================================
//  SERVIS: StampacService
//  -------------------------------------------------------------
//  Rad sa stampacima preko mock servera: ucitavanje, dodavanje i
//  brisanje. Svaki stampac nosi i tonerId (vezu ka toneru).
// =============================================================
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Stampac } from '../models/stampac.model';

@Injectable({ providedIn: 'root' })
export class StampacService {
  private http = inject(HttpClient);
  private readonly api = 'http://localhost:3000/stampaci';

  // GET: svi stampaci (koristi javna forma, admin i statistika)
  getStampaci(): Observable<Stampac[]> {
    return this.http.get<Stampac[]>(this.api).pipe(catchError(this.greska));
  }

  // POST: dodaj novi stampac (id dodeljuje server)
  dodajStampac(podaci: Omit<Stampac, 'id'>): Observable<Stampac> {
    return this.http.post<Stampac>(this.api, podaci).pipe(catchError(this.greska));
  }

  // DELETE: obrisi stampac po id-u
  obrisiStampac(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(catchError(this.greska));
  }

  private greska(e: any) {
    console.error('Greska (stampaci):', e);
    return throwError(() => new Error('Greska pri radu sa stampacima. Da li je server pokrenut?'));
  }
}
