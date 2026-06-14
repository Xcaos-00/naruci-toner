// =============================================================
//  KOMPONENTA: JavnaStranica (javna forma za zahtev)
//  -------------------------------------------------------------
//  "Smart" komponenta: ucitava listu stampaca (sa slikama) i salje
//  novi zahtev na server. Forma je "Reactive Forms" sa validacijom.
//  Kada korisnik izabere model, prikazujemo sliku tog stampaca.
// =============================================================
import { Component, OnInit, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormGroupDirective,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// Angular Material komponente koje koristimo u template-u.
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Stampac } from '../../models/stampac.model';
import { StampacService } from '../../services/stampac.service';
import { ZahtevService } from '../../services/zahtev.service';
import { EmailService } from '../../services/email.service';
import { idStampacaValidator, telefonValidator } from '../../validators/validators';

@Component({
  selector: 'app-javna-stranica',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './javna-stranica.html',
  styleUrl: './javna-stranica.scss',
})
export class JavnaStranica implements OnInit {
  // --- Ubacivanje (DI) zavisnosti preko inject() ---
  private fb = inject(FormBuilder);
  private stampacService = inject(StampacService);
  private zahtevService = inject(ZahtevService);
  private emailService = inject(EmailService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  // Lista stampaca kao Observable - u template-u je prikazujemo
  // pomocu | async pipe-a (ugradjeni pipe koji se sam pretplati i odjavi).
  stampaci$!: Observable<Stampac[]>;

  // Istu listu cuvamo i kao obican niz, da bismo mogli da pronadjemo
  // izabrani stampac (radi prikaza njegove slike).
  private stampaci: Stampac[] = [];

  // Da li je slanje u toku (da iskljucimo dugme i sprecimo dupli klik).
  // Referenca na direktivu forme - treba nam da resetujemo i 'submitted'
  // stanje (inace posle slanja sva polja ostanu crvena).
  @ViewChild(FormGroupDirective) private formDir!: FormGroupDirective;

  saljeSe = false;

  // Reaktivna forma - definisemo polja i njihova pravila validacije.
  forma: FormGroup = this.fb.group({
    idStampaca: ['', [Validators.required, idStampacaValidator]],
    ime: ['', [Validators.required, Validators.minLength(2)]],
    prezime: ['', [Validators.required, Validators.minLength(2)]],
    modelStampaca: ['', [Validators.required]],
    lokal: ['', [Validators.required, telefonValidator]],
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    // Ucitavamo stampace; tap() usput zapamti listu u nas niz.
    this.stampaci$ = this.stampacService
      .getStampaci()
      .pipe(tap((lista) => (this.stampaci = lista)));
  }

  // Pomocni pristup kontrolama forme iz template-a (npr. za greske).
  get f() {
    return this.forma.controls;
  }

  // Vrati objekat trenutno izabranog stampaca (ili undefined).
  // Koristimo ga u template-u da prikazemo sliku izabranog modela.
  get izabraniStampac(): Stampac | undefined {
    const model = this.forma.value.modelStampaca;
    return this.stampaci.find((s) => s.model === model);
  }

  posalji(): void {
    if (this.forma.invalid) {
      this.forma.markAllAsTouched();
      return;
    }

    this.saljeSe = true;

    this.zahtevService.dodajZahtev(this.forma.value).subscribe({
      next: (z) => {
        this.snackBar.open('Zahtev je uspesno poslat!', 'U redu', { duration: 4000 });
        // Potvrdni mejl o prijemu zahteva (ne blokira prikaz ako ne uspe).
        this.emailService.posaljiObavestenje(z).catch(() => {});
        // resetForm() ocisti i vrednosti i 'submitted' -> nema crvenih polja.
        this.formDir.resetForm();
        this.saljeSe = false;
        this.cdr.detectChanges();
      },
      error: (greska) => {
        this.snackBar.open(greska.message, 'Zatvori', { duration: 5000 });
        this.saljeSe = false;
      },
    });
  }
}
