// =============================================================
//  KOMPONENTA: ListaZahteva (SMART komponenta - admin tabela)
//  -------------------------------------------------------------
//  Ucitava sve zahteve i prikazuje ih u Material tabeli (MatTable).
//  Omogucava: filtriranje po statusu (query param), promenu statusa
//  direktno iz tabele (uz slanje mejla), otvaranje detalja (route
//  param) i brisanje uz potvrdu (MatDialog). Sliku stampaca trazimo
//  iz ZIVE liste stampaca (rezervna ako nema).
// =============================================================
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Zahtev, ZahtevStatus } from '../../../models/zahtev.model';
import { ZahtevService } from '../../../services/zahtev.service';
import { StampacService } from '../../../services/stampac.service';
import { EmailService } from '../../../services/email.service';
import { StatusPipe } from '../../../pipes/status.pipe';
import { PotvrdaDialog } from '../../shared/potvrda-dialog/potvrda-dialog';
import { DostavaDialog } from '../../shared/dostava-dialog/dostava-dialog';
import { slikaZaModel } from '../../../util/slike';

@Component({
  selector: 'app-lista-zahteva',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    StatusPipe,
  ],
  templateUrl: './lista-zahteva.html',
  styleUrl: './lista-zahteva.scss',
})
export class ListaZahteva implements OnInit {
  private zahtevService = inject(ZahtevService);
  private stampacService = inject(StampacService);
  private emailService = inject(EmailService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  sviZahtevi: Zahtev[] = [];
  prikazaniZahtevi: Zahtev[] = [];
  ucitavanje = true;
  aktivanFilter: ZahtevStatus | 'svi' = 'svi';

  private slikePoModelu = new Map<string, string>();

  prikazaneKolone = ['slika', 'idStampaca', 'korisnik', 'model', 'status', 'datum', 'akcije'];

  filteri: { vrednost: ZahtevStatus | 'svi'; naziv: string }[] = [
    { vrednost: 'svi', naziv: 'Svi' },
    { vrednost: 'novo', naziv: 'Novo' },
    { vrednost: 'u_obradi', naziv: 'U obradi' },
    { vrednost: 'odobren', naziv: 'Odobren' },
    { vrednost: 'odbijen', naziv: 'Odbijen' },
    { vrednost: 'dostavljen', naziv: 'Dostavljen' },
  ];

  // Statusi koje nudimo u meniju za brzu promenu iz tabele.
  // 'dostavljen' se NE menja ovde - isporuka (sa oduzimanjem iz magacina)
  // se radi na stranici detalja zahteva.
  statusi: { vrednost: ZahtevStatus; naziv: string }[] = [
    { vrednost: 'novo', naziv: 'Novo' },
    { vrednost: 'u_obradi', naziv: 'U obradi' },
    { vrednost: 'odobren', naziv: 'Odobren' },
    { vrednost: 'odbijen', naziv: 'Odbijen' },
  ];

  ngOnInit(): void {
    this.stampacService.getStampaci().subscribe({
      next: (lista) => lista.forEach((s) => this.slikePoModelu.set(s.model, s.slika)),
    });

    this.route.queryParamMap.subscribe((params) => {
      const status = params.get('status') as ZahtevStatus | null;
      this.aktivanFilter = status ?? 'svi';
      this.primeniFilter();
      this.cdr.detectChanges();
    });

    this.ucitaj();
  }

  ucitaj(): void {
    this.ucitavanje = true;
    this.zahtevService.getZahtevi().subscribe({
      next: (lista) => {
        this.sviZahtevi = lista;
        this.primeniFilter();
        this.ucitavanje = false;
        this.cdr.detectChanges();
      },
      error: (greska) => {
        this.snackBar.open(greska.message, 'Zatvori', { duration: 5000 });
        this.ucitavanje = false;
      },
    });
  }

  slika(model: string): string {
    return this.slikePoModelu.get(model) ?? slikaZaModel(model);
  }

  postaviFilter(vrednost: ZahtevStatus | 'svi'): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: vrednost === 'svi' ? {} : { status: vrednost },
    });
  }

  private primeniFilter(): void {
    if (this.aktivanFilter === 'svi') {
      this.prikazaniZahtevi = this.sviZahtevi;
    } else {
      this.prikazaniZahtevi = this.sviZahtevi.filter((z) => z.status === this.aktivanFilter);
    }
  }

  // Promena statusa direktno iz tabele (preko menija na svakom redu).
  // Cuva novi status (PUT) i salje mejl korisniku - isto kao na stranici detalja.
  async promeniStatus(zahtev: Zahtev, noviStatus: ZahtevStatus): Promise<void> {
    // Ako je vec taj status, nema potrebe da radimo nista.
    if (zahtev.status === noviStatus) {
      return;
    }
    this.zahtevService.promeniStatus(zahtev, noviStatus).subscribe({
      next: async (azuriran) => {
        // Azuriraj red u listi da se odmah vidi nova oznaka statusa.
        zahtev.status = noviStatus;
        this.primeniFilter();
        this.cdr.detectChanges();
        try {
          await this.emailService.posaljiObavestenje(azuriran);
          this.snackBar.open('Status promenjen i mejl poslat korisniku.', 'U redu', { duration: 4000 });
        } catch {
          this.snackBar.open('Status promenjen, ali slanje mejla nije uspelo.', 'Zatvori', { duration: 5000 });
        }
      },
      error: (greska) => this.snackBar.open(greska.message, 'Zatvori', { duration: 5000 }),
    });
  }

  otvori(zahtev: Zahtev): void {
    this.router.navigate(['/admin/zahtev', zahtev.id]);
  }

  // Otvori dijalog za isporuku; po uspehu osvezi listu.
  dostavi(zahtev: Zahtev): void {
    const ref = this.dialog.open(DostavaDialog, { width: '460px', data: { zahtev } });
    ref.afterClosed().subscribe((uspeh) => {
      if (uspeh) this.ucitaj();
    });
  }

  obrisi(zahtev: Zahtev): void {
    const ref = this.dialog.open(PotvrdaDialog);
    ref.afterClosed().subscribe((potvrdjeno) => {
      if (potvrdjeno && zahtev.id != null) {
        this.zahtevService.obrisiZahtev(zahtev.id).subscribe({
          next: () => {
            this.snackBar.open('Zahtev obrisan.', 'U redu', { duration: 3000 });
            this.ucitaj();
          },
          error: (greska) => this.snackBar.open(greska.message, 'Zatvori', { duration: 5000 }),
        });
      }
    });
  }
}
