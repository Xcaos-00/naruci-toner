// =============================================================
//  KOMPONENTA: DostavaDialog (kompletna isporuka u jednom prozoru)
//  -------------------------------------------------------------
//  Samostalan dijalog koji obavlja CELU isporuku jednog zahteva:
//    1) unos kolicine tonera,
//    2) provera stanja u glavnom magacinu SERVIS,
//    3) ako nema dovoljno - prebacivanje iz drugih magacina,
//    4) oduzimanje iz SERVIS-a, prelazak statusa u "dostavljen" i mejl.
//  Koristi se i iz tabele zahteva i sa stranice detalja.
//  Vraca true ako je isporuka uspesna (da pozivalac osvezi prikaz).
// =============================================================
import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

import { Zahtev } from '../../../models/zahtev.model';
import { Stampac } from '../../../models/stampac.model';
import { Toner } from '../../../models/toner.model';
import { Magacin, StanjeStavka } from '../../../models/magacin.model';
import { StampacService } from '../../../services/stampac.service';
import { TonerService } from '../../../services/toner.service';
import { MagacinService } from '../../../services/magacin.service';
import { ZahtevService } from '../../../services/zahtev.service';
import { EmailService } from '../../../services/email.service';

@Component({
  selector: 'app-dostava-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
  templateUrl: './dostava-dialog.html',
  styleUrl: './dostava-dialog.scss',
})
export class DostavaDialog implements OnInit {
  ucitavanje = true;
  radi = false;
  kolicina = 1;
  prikaziTransfer = false;

  toner?: Toner;
  servisStavka?: StanjeStavka;
  ponude: { naziv: string; stavka: StanjeStavka }[] = [];

  private stampaci: Stampac[] = [];
  private magacini: Magacin[] = [];
  private stanje: StanjeStavka[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { zahtev: Zahtev },
    private ref: MatDialogRef<DostavaDialog>,
    private stampacService: StampacService,
    private tonerService: TonerService,
    private magacinService: MagacinService,
    private zahtevService: ZahtevService,
    private emailService: EmailService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Ucitamo sve sto treba za isporuku odjednom.
    forkJoin({
      stampaci: this.stampacService.getStampaci(),
      toneri: this.tonerService.getToneri(),
      magacini: this.magacinService.getMagacini(),
      stanje: this.magacinService.getStanje(),
    }).subscribe({
      next: ({ stampaci, toneri, magacini, stanje }) => {
        this.stampaci = stampaci;
        this.magacini = magacini;
        this.stanje = stanje;
        // Pronadji toner za stampac iz zahteva.
        const stampac = stampaci.find((s) => s.model === this.data.zahtev.modelStampaca);
        this.toner = toneri.find((t) => t.id === stampac?.tonerId);
        // Stanje u SERVIS-u i ponude iz drugih magacina.
        const servis = magacini.find((m) => m.glavni);
        if (this.toner && servis) {
          this.servisStavka = stanje.find(
            (s) => s.magacinId === servis.id && s.tonerId === this.toner!.id
          );
          this.ponude = stanje
            .filter((s) => s.tonerId === this.toner!.id && s.magacinId !== servis.id && s.kolicina > 0)
            .map((s) => ({ naziv: this.nazivMagacina(s.magacinId), stavka: s }));
        }
        this.ucitavanje = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.ucitavanje = false;
        this.snackBar.open(e.message, 'Zatvori', { duration: 5000 });
        this.cdr.detectChanges();
      },
    });
  }

  private nazivMagacina(id: number): string {
    return this.magacini.find((m) => m.id === id)?.naziv ?? 'Magacin';
  }

  // Da li SERVIS ima dovoljno za trazenu kolicinu.
  get dovoljno(): boolean {
    return !!this.servisStavka && this.servisStavka.kolicina >= Number(this.kolicina);
  }

  // Klik na "Dostavi": ako ima dovoljno -> isporuci; ako ne -> prikazi transfer.
  dostavi(): void {
    if (!this.toner || !this.servisStavka) {
      this.snackBar.open('Za ovaj zahtev nije moguce odrediti toner/magacin.', 'Zatvori', { duration: 5000 });
      return;
    }
    if (Number(this.kolicina) < 1) {
      this.snackBar.open('Unesite kolicinu (najmanje 1).', 'Zatvori', { duration: 4000 });
      return;
    }
    if (this.dovoljno) {
      this.izvrsi();
    } else {
      // Nema dovoljno u SERVIS-u -> pokazi opcije za prebacivanje.
      this.prikaziTransfer = true;
    }
  }

  // Prebaci iz izabranog magacina u SERVIS onoliko koliko fali.
  prebaci(p: { naziv: string; stavka: StanjeStavka }): void {
    if (!this.servisStavka) return;
    const fali = Number(this.kolicina) - this.servisStavka.kolicina;
    const k = Math.min(p.stavka.kolicina, Math.max(0, fali));
    if (k <= 0) return;
    p.stavka.kolicina -= k;
    this.servisStavka.kolicina += k;
    forkJoin([
      this.magacinService.azurirajStanje(p.stavka),
      this.magacinService.azurirajStanje(this.servisStavka),
    ]).subscribe({
      next: () => {
        this.snackBar.open(`Prebaceno ${k} kom u SERVIS.`, 'U redu', { duration: 2500 });
        this.cdr.detectChanges();
      },
      error: (e) => this.snackBar.open(e.message, 'Zatvori', { duration: 5000 }),
    });
  }

  // Konacna isporuka: oduzmi iz SERVIS-a, postavi status, posalji mejl, zatvori.
  private izvrsi(): void {
    if (!this.servisStavka) return;
    this.radi = true;
    this.servisStavka.kolicina -= Number(this.kolicina);
    this.magacinService.azurirajStanje(this.servisStavka).subscribe({
      next: () => {
        this.zahtevService.promeniStatus(this.data.zahtev, 'dostavljen').subscribe({
          next: async (azuriran) => {
            try {
              await this.emailService.posaljiObavestenje(azuriran);
            } catch {
              /* mejl nije uspeo - isporuka je ipak zavrsena */
            }
            this.snackBar.open('Zahtev je dostavljen, toner oduzet iz SERVIS-a.', 'U redu', { duration: 4000 });
            this.radi = false;
            this.ref.close(true); // vrati true -> pozivalac osvezi prikaz
          },
          error: (e) => {
            this.radi = false;
            this.snackBar.open(e.message, 'Zatvori', { duration: 5000 });
          },
        });
      },
      error: (e) => {
        this.radi = false;
        this.snackBar.open(e.message, 'Zatvori', { duration: 5000 });
      },
    });
  }
}
