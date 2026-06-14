// =============================================================
//  KOMPONENTA: AdminNav (pod-navigacija admin dela)
//  -------------------------------------------------------------
//  Red linkova (tabova) koji vodi izmedju admin stranica:
//  Zahtevi, Stampaci i toneri, Statistika. routerLinkActive
//  automatski istakne link na kome se trenutno nalazimo.
// =============================================================
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './admin-nav.html',
  styleUrl: './admin-nav.scss',
})
export class AdminNav {}
