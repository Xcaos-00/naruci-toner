// =============================================================
//  KOMPONENTA: AdminLayout (okvir admin dela sa LEVIM menijem)
//  -------------------------------------------------------------
//  Prikazuje bocnu traku (MatSidenav) sa leve strane sa linkovima ka
//  admin stranicama, a sadrzaj (izabrana stranica) se prikazuje desno
//  kroz <router-outlet>. Admin rute su deca ove komponente (vidi
//  app.routes.ts), pa se ovaj okvir uvek vidi unutar admin dela.
// =============================================================
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatListModule, MatIconModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {}
