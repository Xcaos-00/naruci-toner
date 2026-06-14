// =============================================================
//  KOMPONENTA: ZahtevDetalji (SMART - detalji zahteva)
//  -------------------------------------------------------------
//  Ucitava jedan zahtev (po :id) i prikaz prepusta komponenti
//  <app-zahtev-red>. Kada ona emituje novi status:
//    - "dostavljen" otvara DostavaDialog (kolicina + magacin SERVIS),
//    - ostali statusi se odmah snime i posalje se mejl.
//  Isto se moze pokrenuti i dugmetom "Dostavi (isporuka)".
// =============================================================
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Zahtev, ZahtevStatus } from '../../../models/zahtev.model';
import { Stampac } from '../../../models/stampac.model';
import { ZahtevService } from '../../../services/zahtev.service';
import { EmailService } from '../../../services/email.service';
import { StampacService } from '../../../services/stampac.service';
import { ZahtevRed } from '../../shared/zahtev-red/zahtev-red';
import { DostavaDialog } from '../../shared/dostava-dialog/dostava-dialog';
import { slikaZaModel } from '../../../util/slike';

@Component({
  selector: 'app-zahtev-detalji',
  standalone: true,
  imports: [
    CommonModule, ZahtevRed, MatButtonModule, MatCardModule, MatIconModule,
    MatProgressSpinnerModule, MatDialogModule, MatSnackBarModule,
  ],
  templateUrl: './zahtev-detalji.html',
  styleUrl: './zahtev-detalji.scss',
})
export class ZahtevDetalji implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private zahtevService = inject(ZahtevService);
  private emailService = inject(EmailService);
  private stampacService = inject(StampacService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  zahtev?: Zahtev;
  slika = '';
  ucitavanje = true;
  private stampaci: Stampac[] = [];

  ngOnInit(): void {
    // Stampaci - radi slike.
    this.stampacService.getStampaci().subscribe({
      next: (lista) => {
        this.stampaci = lista;
        if (this.zahtev) this.slika = this.nadjiSliku(this.zahtev.modelStampaca);
        this.cdr.detectChanges();
      },
    });

    // switchMap: cim stigne :id, ucitaj taj zahtev.
    this.route.paramMap
      .pipe(switchMap((params) => this.zahtevService.getZahtev(Number(params.get('id')))))
      .subscribe({
        next: (z) => {
          this.zahtev = z;
          this.slika = this.nadjiSliku(z.modelStampaca);
          this.ucitavanje = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.ucitavanje = false;
          this.snackBar.open('Zahtev nije pronadjen.', 'Zatvori', { duration: 4000 });
          this.cdr.detectChanges();
        },
      });
  }

  private nadjiSliku(model: string): string {
    return this.stampaci.find((s) => s.model === model)?.slika ?? slikaZaModel(model);
  }

  // Poziva je dete (zahtev-red) preko @Output. "dostavljen" ide kroz dijalog.
  naPromenuStatusa(noviStatus: ZahtevStatus): void {
    if (noviStatus === 'dostavljen') {
      this.otvoriDostavu();
      return;
    }
    if (!this.zahtev) return;
    this.zahtevService.promeniStatus(this.zahtev, noviStatus).subscribe({
      next: async (azuriran) => {
        this.zahtev = azuriran;
        this.cdr.detectChanges();
        try {
          await this.emailService.posaljiObavestenje(azuriran);
          this.snackBar.open('Status sacuvan i mejl poslat korisniku.', 'U redu', { duration: 4000 });
        } catch {
          this.snackBar.open('Status sacuvan, ali slanje mejla nije uspelo.', 'Zatvori', { duration: 5000 });
        }
        this.cdr.detectChanges();
      },
      error: (greska) => this.snackBar.open(greska.message, 'Zatvori', { duration: 5000 }),
    });
  }

  // Otvori dijalog za isporuku; po uspehu osvezi zahtev.
  otvoriDostavu(): void {
    if (!this.zahtev) return;
    const ref = this.dialog.open(DostavaDialog, { width: '460px', data: { zahtev: this.zahtev } });
    ref.afterClosed().subscribe((uspeh) => {
      if (uspeh && this.zahtev?.id != null) {
        this.zahtevService.getZahtev(this.zahtev.id).subscribe((z) => {
          this.zahtev = z;
          this.cdr.detectChanges();
        });
      }
    });
  }

  nazad(): void {
    this.router.navigate(['/admin']);
  }
}
