// =============================================================
//  KOMPONENTA: Magacin (Magacinsko stanje)
//  -------------------------------------------------------------
//  Prikazuje stanje tonera po magacinima kao matricu (red = toner,
//  kolona = magacin). Kolicine su izmenjive; dugme "Sacuvaj" snima
//  SAMO izmenjene celije, i to JEDNU PO JEDNU (redom), da ne bismo
//  preopteretili json-server (slanje svih odjednom je obaralo vezu).
//  SERVIS je glavni magacin (istaknut).
// =============================================================
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, from } from 'rxjs';
import { concatMap, toArray } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Toner } from '../../../models/toner.model';
import { Magacin as MagacinModel, StanjeStavka } from '../../../models/magacin.model';
import { TonerService } from '../../../services/toner.service';
import { MagacinService } from '../../../services/magacin.service';

interface Red {
  toner: Toner;
  celije: StanjeStavka[];
}

@Component({
  selector: 'app-magacin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './magacin.html',
  styleUrl: './magacin.scss',
})
export class Magacin implements OnInit {
  private tonerService = inject(TonerService);
  private magacinService = inject(MagacinService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  magacini: MagacinModel[] = [];
  toneri: Toner[] = [];
  stanje: StanjeStavka[] = [];
  redovi: Red[] = [];
  ucitavanje = true;
  cuva = false;

  // Pamtimo pocetne kolicine (id -> kolicina) da znamo sta je izmenjeno.
  private pocetno = new Map<number, number>();

  ngOnInit(): void {
    forkJoin({
      magacini: this.magacinService.getMagacini(),
      toneri: this.tonerService.getToneri(),
      stanje: this.magacinService.getStanje(),
    }).subscribe({
      next: ({ magacini, toneri, stanje }) => {
        this.magacini = magacini;
        this.toneri = toneri;
        this.stanje = stanje;
        // zapamti pocetne vrednosti
        this.pocetno.clear();
        stanje.forEach((s) => this.pocetno.set(s.id, s.kolicina));
        this.napraviRedove();
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

  private napraviRedove(): void {
    this.redovi = this.toneri.map((toner) => ({
      toner,
      celije: this.magacini.map(
        (m) =>
          this.stanje.find((s) => s.magacinId === m.id && s.tonerId === toner.id) ?? {
            id: 0,
            magacinId: m.id,
            tonerId: toner.id,
            kolicina: 0,
          }
      ),
    }));
  }

  // Sacuvaj SAMO izmenjene stavke, jednu po jednu (concatMap = sekvencijalno).
  sacuvaj(): void {
    const izmenjene = this.stanje.filter(
      (s) => s.id > 0 && s.kolicina !== this.pocetno.get(s.id)
    );

    if (izmenjene.length === 0) {
      this.snackBar.open('Nema izmena za cuvanje.', 'U redu', { duration: 2500 });
      return;
    }

    this.cuva = true;
    // from(...) pravi tok od stavki; concatMap salje sledeci PUT tek kad
    // prethodni zavrsi (ne sve odjednom). toArray() saceka da sve zavrsi.
    from(izmenjene)
      .pipe(
        concatMap((s) => this.magacinService.azurirajStanje(s)),
        toArray()
      )
      .subscribe({
        next: () => {
          izmenjene.forEach((s) => this.pocetno.set(s.id, s.kolicina));
          this.snackBar.open(`Sacuvano (${izmenjene.length} izmena).`, 'U redu', { duration: 3000 });
          this.cuva = false;
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.snackBar.open(e.message, 'Zatvori', { duration: 5000 });
          this.cuva = false;
          this.cdr.detectChanges();
        },
      });
  }
}
