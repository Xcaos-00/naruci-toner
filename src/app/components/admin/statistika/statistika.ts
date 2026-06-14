// =============================================================
//  KOMPONENTA: Statistika (admin - grafikoni)
//  -------------------------------------------------------------
//  Ucitava zahteve, stampace i tonere ODJEDNOM (forkJoin), izracuna
//  statistike i nacrta ih kao grafikone (Chart.js).
//  Grafikoni: raspodela po statusu (doughnut), najtrazeniji stampaci,
//  najaktivniji korisnici, najtrazeniji toneri (stubicasti).
// =============================================================
import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import Chart from 'chart.js/auto';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Zahtev } from '../../../models/zahtev.model';
import { Stampac } from '../../../models/stampac.model';
import { Toner } from '../../../models/toner.model';
import { ZahtevService } from '../../../services/zahtev.service';
import { StampacService } from '../../../services/stampac.service';
import { TonerService } from '../../../services/toner.service';
import { StatusPipe } from '../../../pipes/status.pipe';

@Component({
  selector: 'app-statistika',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './statistika.html',
  styleUrl: './statistika.scss',
})
export class Statistika implements OnInit {
  private zahtevService = inject(ZahtevService);
  private stampacService = inject(StampacService);
  private tonerService = inject(TonerService);
  private snackBar = inject(MatSnackBar);
  // ChangeDetectorRef nam treba da RUCNO osvezimo prikaz pre crtanja,
  // kako bi <canvas> elementi sigurno postojali u DOM-u.
  private cdr = inject(ChangeDetectorRef);
  private statusPipe = new StatusPipe();

  // Reference na <canvas> elemente. Oni su UVEK u DOM-u (skriveni preko
  // [hidden] dok traje ucitavanje), pa su ove reference uvek dostupne.
  @ViewChild('statusCanvas') statusCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('stampacCanvas') stampacCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('korisnikCanvas') korisnikCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tonerCanvas') tonerCanvas!: ElementRef<HTMLCanvasElement>;

  ucitavanje = true;

  ukupnoZahteva = 0;
  brojStampaca = 0;
  brojTonera = 0;
  brojKorisnika = 0;

  ngOnInit(): void {
    // forkJoin saceka da SVA tri zahteva zavrse, pa onda nastavi.
    forkJoin({
      zahtevi: this.zahtevService.getZahtevi(),
      stampaci: this.stampacService.getStampaci(),
      toneri: this.tonerService.getToneri(),
    }).subscribe({
      next: ({ zahtevi, stampaci, toneri }) => {
        this.izracunaj(zahtevi, stampaci, toneri);
        this.ucitavanje = false;
        // Rucno pokrenemo osvezavanje da Angular ODMAH prikaze canvas
        // elemente (sad kada je ucitavanje=false), pa tek onda crtamo.
        this.cdr.detectChanges();
        this.crtajGrafikone(zahtevi, stampaci, toneri);
      },
      error: (e) => {
        this.ucitavanje = false;
        this.snackBar.open(e.message, 'Zatvori', { duration: 5000 });
      },
    });
  }

  // Brojevi za metricke kartice.
  private izracunaj(zahtevi: Zahtev[], stampaci: Stampac[], toneri: Toner[]): void {
    this.ukupnoZahteva = zahtevi.length;
    this.brojStampaca = stampaci.length;
    this.brojTonera = toneri.length;
    this.brojKorisnika = new Set(zahtevi.map((z) => z.ime + ' ' + z.prezime)).size;
  }

  // Prebroji pojavljivanja i vrati sortiranu listo [ {labela, broj} ] opadajuce.
  private prebroj(stavke: string[]): { labela: string; broj: number }[] {
    const mapa = new Map<string, number>();
    for (const s of stavke) {
      mapa.set(s, (mapa.get(s) ?? 0) + 1);
    }
    return [...mapa.entries()]
      .map(([labela, broj]) => ({ labela, broj }))
      .sort((a, b) => b.broj - a.broj);
  }

  private crtajGrafikone(zahtevi: Zahtev[], stampaci: Stampac[], toneri: Toner[]): void {
    // Sigurnosna provera: ako iz nekog razloga canvas jos ne postoji,
    // prekidamo (da ne dobijemo gresku "undefined nativeElement").
    if (!this.statusCanvas || !this.stampacCanvas || !this.korisnikCanvas || !this.tonerCanvas) {
      return;
    }

    const plava = '#1565c0';
    const paleta = ['#1565c0', '#2e7d32', '#c62828', '#f9a825', '#6a1b9a', '#00838f', '#5d4037'];

    // 1) Raspodela po statusu (doughnut)
    const poStatusu = this.prebroj(zahtevi.map((z) => z.status));
    new Chart(this.statusCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: poStatusu.map((x) => this.statusPipe.transform(x.labela as any)),
        datasets: [{ data: poStatusu.map((x) => x.broj), backgroundColor: paleta }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
    });

    // 2) Najtrazeniji stampaci (vertikalni stubici)
    const poStampacu = this.prebroj(zahtevi.map((z) => z.modelStampaca));
    new Chart(this.stampacCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: poStampacu.map((x) => x.labela),
        datasets: [{ label: 'Broj zahteva', data: poStampacu.map((x) => x.broj), backgroundColor: plava }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });

    // 3) Najaktivniji korisnici (horizontalni stubici)
    const poKorisniku = this.prebroj(zahtevi.map((z) => z.ime + ' ' + z.prezime));
    new Chart(this.korisnikCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: poKorisniku.map((x) => x.labela),
        datasets: [{ label: 'Broj zahteva', data: poKorisniku.map((x) => x.broj), backgroundColor: '#2e7d32' }],
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });

    // 4) Najtrazeniji toneri (model -> stampac -> tonerId -> oznaka)
    const modelDoTonerId = new Map(stampaci.map((s) => [s.model, s.tonerId]));
    const tonerIdDoOznake = new Map(toneri.map((t) => [t.id, t.oznaka]));
    const tonerLabele = zahtevi.map((z) => {
      const tonerId = modelDoTonerId.get(z.modelStampaca);
      return (tonerId != null && tonerIdDoOznake.get(tonerId)) || 'nepoznat';
    });
    const poToneru = this.prebroj(tonerLabele);
    new Chart(this.tonerCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: poToneru.map((x) => x.labela),
        datasets: [{ label: 'Broj zahteva', data: poToneru.map((x) => x.broj), backgroundColor: '#6a1b9a' }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });
  }
}
