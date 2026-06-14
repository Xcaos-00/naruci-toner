// =============================================================
//  KORENSKA KOMPONENTA: App
//  -------------------------------------------------------------
//  Glavni "okvir" aplikacije: gore navigacija (navbar), a ispod nje
//  <router-outlet> u kome se smenjuju stranice u zavisnosti od rute.
// =============================================================
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/shared/navbar/navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
