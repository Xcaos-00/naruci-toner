// =============================================================
//  KOMPONENTA: Upravljanje (admin - stampaci i toneri)
//  -------------------------------------------------------------
//  "Smart" komponenta koja omogucava administratoru da:
//    - doda / obrise TONER (oznaka + boja)
//    - doda / obrise STAMPAC i da mu dodeli (poveze) toner
//  Podatke ucitava i menja preko TonerService i StampacService.
// =============================================================
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Toner } from '../../../models/toner.model';
import { Stampac } from '../../../models/stampac.model';
import { TonerService } from '../../../services/toner.service';
import { StampacService } from '../../../services/stampac.service';
import { PotvrdaDialog } from '../../shared/potvrda-dialog/potvrda-dialog';

@Component({
  selector: 'app-upravljanje',
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
    MatDialogModule,
  ],
  templateUrl: './upravljanje.html',
  styleUrl: './upravljanje.scss',
})
export class Upravljanje implements OnInit {
  private fb = inject(FormBuilder);
  private tonerService = inject(TonerService);
  private stampacService = inject(StampacService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  toneri: Toner[] = [];
  stampaci: Stampac[] = [];

  // Forma za novi toner
  tonerForma: FormGroup = this.fb.group({
    oznaka: ['', Validators.required],
    boja: ['Crna', Validators.required],
  });

  // Forma za novi stampac (model + putanja slike + izbor tonera)
  stampacForma: FormGroup = this.fb.group({
    model: ['', Validators.required],
    slika: ['', Validators.required],
    tonerId: ['', Validators.required],
  });

  // Pregled (preview) izabrane slike kao data URL.
  slikaPreview = '';

  // Klik na 'Izaberi sliku' (file input).
  onFajl(event: Event): void {
    const input = event.target as HTMLInputElement;
    const f = input.files && input.files[0];
    if (f) this.ucitajFajl(f);
  }

  // Prevuci-i-pusti (drag and drop) slike u zonu.
  onDrop(event: DragEvent): void {
    event.preventDefault();
    const f = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
    if (f) this.ucitajFajl(f);
  }
  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  // Procita sliku kao base64 (data URL) i upise je u formu.
  private ucitajFajl(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.snackBar.open('Izaberite sliku (slikovni fajl).', 'Zatvori', { duration: 4000 });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.slikaPreview = dataUrl;
      this.stampacForma.patchValue({ slika: dataUrl });
      this.stampacForma.controls['slika'].markAsTouched();
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  ngOnInit(): void {
    this.ucitaj();
  }

  // Ucitavanje tonera i stampaca sa servera.
  ucitaj(): void {
    this.tonerService.getToneri().subscribe({
      next: (t) => { this.toneri = t; this.cdr.detectChanges(); },
      error: (e) => this.snackBar.open(e.message, 'Zatvori', { duration: 5000 }),
    });
    this.stampacService.getStampaci().subscribe({
      next: (s) => { this.stampaci = s; this.cdr.detectChanges(); },
      error: (e) => this.snackBar.open(e.message, 'Zatvori', { duration: 5000 }),
    });
  }

  // Pomocna: vrati oznaku tonera za dati tonerId (za prikaz u listi stampaca).
  tonerOznaka(tonerId: number): string {
    const t = this.toneri.find((x) => x.id === tonerId);
    return t ? `${t.oznaka} (${t.boja})` : 'nepoznat';
  }

  // ---- TONERI ----
  dodajToner(): void {
    if (this.tonerForma.invalid) {
      this.tonerForma.markAllAsTouched();
      return;
    }
    this.tonerService.dodajToner(this.tonerForma.value).subscribe({
      next: () => {
        this.snackBar.open('Toner dodat.', 'U redu', { duration: 3000 });
        this.tonerForma.reset({ oznaka: '', boja: 'Crna' });
        this.ucitaj();
      },
      error: (e) => this.snackBar.open(e.message, 'Zatvori', { duration: 5000 }),
    });
  }

  obrisiToner(toner: Toner): void {
    this.dialog.open(PotvrdaDialog).afterClosed().subscribe((ok) => {
      if (ok) {
        this.tonerService.obrisiToner(toner.id).subscribe({
          next: () => {
            this.snackBar.open('Toner obrisan.', 'U redu', { duration: 3000 });
            this.ucitaj();
          },
          error: (e) => this.snackBar.open(e.message, 'Zatvori', { duration: 5000 }),
        });
      }
    });
  }

  // ---- STAMPACI ----
  dodajStampac(): void {
    if (this.stampacForma.invalid) {
      this.stampacForma.markAllAsTouched();
      return;
    }
    // tonerId iz forme stize kao tekst - pretvorimo ga u broj.
    const podaci = {
      ...this.stampacForma.value,
      tonerId: Number(this.stampacForma.value.tonerId),
    };
    this.stampacService.dodajStampac(podaci).subscribe({
      next: () => {
        this.snackBar.open('Stampac dodat.', 'U redu', { duration: 3000 });
        this.stampacForma.reset({ model: '', slika: '', tonerId: '' });
        this.slikaPreview = '';
        this.ucitaj();
      },
      error: (e) => this.snackBar.open(e.message, 'Zatvori', { duration: 5000 }),
    });
  }

  obrisiStampac(stampac: Stampac): void {
    this.dialog.open(PotvrdaDialog).afterClosed().subscribe((ok) => {
      if (ok) {
        this.stampacService.obrisiStampac(stampac.id).subscribe({
          next: () => {
            this.snackBar.open('Stampac obrisan.', 'U redu', { duration: 3000 });
            this.ucitaj();
          },
          error: (e) => this.snackBar.open(e.message, 'Zatvori', { duration: 5000 }),
        });
      }
    });
  }
}
