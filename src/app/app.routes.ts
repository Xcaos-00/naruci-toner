// =============================================================
//  RUTE APLIKACIJE
//  -------------------------------------------------------------
//  Javne rute: pocetna forma i admin login.
//  Admin rute su DECA komponente AdminLayout (levi meni je uvek tu)
//  i sve su zasticene preko canActivate: [authGuard] na roditelju.
// =============================================================
import { Routes } from '@angular/router';

import { JavnaStranica } from './components/javna-stranica/javna-stranica';
import { Login } from './components/admin/login/login';
import { AdminLayout } from './components/admin/admin-layout/admin-layout';
import { ListaZahteva } from './components/admin/lista-zahteva/lista-zahteva';
import { ZahtevDetalji } from './components/admin/zahtev-detalji/zahtev-detalji';
import { Upravljanje } from './components/admin/upravljanje/upravljanje';
import { Statistika } from './components/admin/statistika/statistika';
import { Magacin } from './components/admin/magacin/magacin';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Pocetna strana - javna forma za zahtev.
  { path: '', component: JavnaStranica },

  // Login za administratora (javno dostupan).
  { path: 'admin/login', component: Login },

  // Admin okvir sa levim menijem; sve admin stranice su njegova deca.
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard], // zastita celog admin dela
    children: [
      { path: '', component: ListaZahteva },                 // /admin
      { path: 'upravljanje', component: Upravljanje },       // /admin/upravljanje
      { path: 'magacin', component: Magacin },               // /admin/magacin
      { path: 'statistika', component: Statistika },         // /admin/statistika
      { path: 'zahtev/:id', component: ZahtevDetalji },      // /admin/zahtev/:id
    ],
  },

  // Sve nepoznate adrese vrati na pocetnu.
  { path: '**', redirectTo: '' },
];
