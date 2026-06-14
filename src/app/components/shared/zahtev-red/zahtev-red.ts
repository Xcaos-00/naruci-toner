// =============================================================
//  KOMPONENTA: ZahtevRed (PRESENTATIONAL / "glupa" komponenta)
//  -------------------------------------------------------------
//  Ova komponenta SAMO prikazuje jedan zahtev i nudi izbor novog
//  statusa. NE zna za servise, NE salje mejlove, NE ide na server.
//  Sve podatke dobija odozgo preko @Input, a kada korisnik izabere
//  novi status, ona ga "izbaci" navise preko @Output. Roditeljska
//  ("smart") komponenta onda obavlja pravi posao.
//
//  Ovim je demonstrirana DVOSMERNA komunikacija:
//    - roditelj -> dete:  [zahtev]            (preko @Input)
//    - dete -> roditelj:  (promenaStatusa)    (preko @Output)
// =============================================================
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

import { Zahtev, ZahtevStatus } from '../../../models/zahtev.model';
import { StatusPipe } from '../../../pipes/status.pipe';

@Component({
  selector: 'app-zahtev-red',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    StatusPipe, // nas custom pipe koristimo u template-u
  ],
  templateUrl: './zahtev-red.html',
  styleUrl: './zahtev-red.scss',
})
export class ZahtevRed {
  // @Input: podatke o zahtevu dobijamo od roditelja.
  @Input({ required: true }) zahtev!: Zahtev;

  // @Output: dogadjaj koji "emitujemo" ka roditelju kada je izabran
  // novi status. EventEmitter nosi vrednost (novi status) sa sobom.
  @Output() promenaStatusa = new EventEmitter<ZahtevStatus>();

  // : putanju do slike stampaca dobijamo od roditelja.
  @Input() slika = '';

  // Lokalna promenljiva za [(ngModel)] na padajucoj listi statusa.
  izabraniStatus: ZahtevStatus = 'novo';

  // Lista svih mogucih statusa - koristimo je za @for u padajucoj listi.
  statusi: { vrednost: ZahtevStatus; naziv: string }[] = [
    { vrednost: 'novo', naziv: 'Novo' },
    { vrednost: 'u_obradi', naziv: 'U obradi' },
    { vrednost: 'odobren', naziv: 'Odobren' },
    { vrednost: 'odbijen', naziv: 'Odbijen' },
    { vrednost: 'dostavljen', naziv: 'Dostavljen' },
  ];

  // ngOnChanges nije nuzan; kada roditelj postavi @Input, postavimo
  // pocetni izbor u padajucoj listi na trenutni status zahteva.
  ngOnChanges(): void {
    if (this.zahtev) {
      this.izabraniStatus = this.zahtev.status;
    }
  }

  // Klik na "Sacuvaj status" -> samo emitujemo izbor navise.
  sacuvaj(): void {
    this.promenaStatusa.emit(this.izabraniStatus);
  }
}
