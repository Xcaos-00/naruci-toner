// =============================================================
//  KOMPONENTA: IsporukaDialog (prompt kada SERVIS nema dovoljno)
//  -------------------------------------------------------------
//  Otvara se kada u glavnom magacinu (SERVIS) nema dovoljno tonera
//  za isporuku. Prikazuje koliko fali i u kojim magacinima toner
//  postoji, i nudi dugme "Prebaci u SERVIS". Tek kada SERVIS ima
//  dovoljno, dugme "Potvrdi isporuku" postaje aktivno.
// =============================================================
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

import { StanjeStavka } from '../../../models/magacin.model';
import { MagacinService } from '../../../services/magacin.service';

// Podaci koje detalj prosledjuje dijalogu.
export interface IsporukaData {
  tonerOznaka: string;
  potrebno: number;
  servisStavka: StanjeStavka;                  // stavka SERVIS-a (referenca!)
  ponude: { naziv: string; stavka: StanjeStavka }[]; // drugi magacini sa tonerom
}

@Component({
  selector: 'app-isporuka-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <h2 mat-dialog-title>Nedovoljno tonera u SERVIS-u</h2>
    <mat-dialog-content>
      <p>
        Toner <b>{{ data.tonerOznaka }}</b> — u magacinu <b>SERVIS</b> na stanju je
        <b>{{ data.servisStavka.kolicina }}</b>, a potrebno je <b>{{ data.potrebno }}</b>.
      </p>

      @if (data.ponude.length > 0) {
        <p>Toner je dostupan u drugim magacinima — prebacite ga u SERVIS:</p>
        @for (p of data.ponude; track p.stavka.id) {
          <div class="ponuda">
            <span>{{ p.naziv }}: <b>{{ p.stavka.kolicina }}</b> kom</span>
            <button mat-stroked-button color="primary"
                    [disabled]="p.stavka.kolicina === 0 || dovoljno"
                    (click)="prebaci(p)">
              <mat-icon>swap_horiz</mat-icon> Prebaci u SERVIS
            </button>
          </div>
        }
      } @else {
        <p class="upozorenje">Toner trenutno nije dostupan ni u jednom drugom magacinu.</p>
      }

      <p class="rezime">U SERVIS-u sada: <b>{{ data.servisStavka.kolicina }}</b> / {{ data.potrebno }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Otkazi</button>
      <!-- Aktivno tek kada SERVIS ima dovoljno -->
      <button mat-raised-button color="primary" [disabled]="!dovoljno" [mat-dialog-close]="true">
        Potvrdi isporuku
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .ponuda { display:flex; align-items:center; justify-content:space-between; gap:12px; margin:8px 0; }
    .rezime { margin-top:12px; font-weight:500; }
    .upozorenje { color:#c62828; }
  `],
})
export class IsporukaDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: IsporukaData,
    private ref: MatDialogRef<IsporukaDialog>,
    private magacinService: MagacinService,
    private snackBar: MatSnackBar
  ) {}

  // Da li SERVIS sada ima dovoljno (omogucava "Potvrdi isporuku").
  get dovoljno(): boolean {
    return this.data.servisStavka.kolicina >= this.data.potrebno;
  }

  // Prebaci iz izabranog magacina u SERVIS onoliko koliko fali (do dostupnog).
  prebaci(p: { naziv: string; stavka: StanjeStavka }): void {
    const fali = this.data.potrebno - this.data.servisStavka.kolicina;
    const kolicina = Math.min(p.stavka.kolicina, Math.max(0, fali));
    if (kolicina <= 0) {
      return;
    }
    // Promenimo lokalne vrednosti (reference su iste kao u detalju)...
    p.stavka.kolicina -= kolicina;
    this.data.servisStavka.kolicina += kolicina;
    // ...pa snimimo obe izmenjene stavke na server.
    forkJoin([
      this.magacinService.azurirajStanje(p.stavka),
      this.magacinService.azurirajStanje(this.data.servisStavka),
    ]).subscribe({
      next: () => this.snackBar.open(`Prebaceno ${kolicina} kom u SERVIS.`, 'U redu', { duration: 2500 }),
      error: (e) => this.snackBar.open(e.message, 'Zatvori', { duration: 5000 }),
    });
  }
}
