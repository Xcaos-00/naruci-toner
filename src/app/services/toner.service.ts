// =============================================================
//  SERVIS: TonerService
//  -------------------------------------------------------------
//  Rad sa tonerima preko mock servera: ucitavanje, dodavanje i
//  brisanje. Tonere admin povezuje sa stampacima (preko tonerId).
// =============================================================
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Toner } from '../models/toner.model';

@Injectable({ providedIn: 'root' })
export class TonerService {
  private http = inject(HttpClient);
  private readonly api = 'http://localhost:3000/toneri';

  // GET: svi toneri
  getToneri(): Observable<Toner[]> {
    return this.http.get<Toner[]>(this.api).pipe(catchError(this.greska));
  }

  // POST: dodaj novi toner (bez id-a; id dodeljuje server)
  dodajToner(podaci: Omit<Toner, 'id'>): Observable<Toner> {
    return this.http.post<Toner>(this.api, podaci).pipe(catchError(this.greska));
  }

  // DELETE: obrisi toner po id-u
  obrisiToner(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(catchError(this.greska));
  }

  private greska(e: any) {
    console.error('Greska (toneri):', e);
    return throwError(() => new Error('Greska pri radu sa tonerima. Da li je server pokrenut?'));
  }
}
