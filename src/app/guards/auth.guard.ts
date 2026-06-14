// =============================================================
//  AUTH GUARD (zastita ruta)
//  -------------------------------------------------------------
//  "Cuvar" koji se izvrsava PRE ulaska na admin rutu. Ako je
//  administrator prijavljen - pusta ga. Ako nije - preusmerava ga
//  na login stranicu. Ovo je moderni "functional guard" (obicna
//  funkcija), preporuceni nacin u novom Angular-u.
// =============================================================
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Ako je prijavljen -> dozvoli pristup ruti (vrati true).
  if (auth.jePrijavljen()) {
    return true;
  }

  // Ako NIJE prijavljen -> posalji ga na login i zabrani pristup.
  // Vracanje UrlTree (router.createUrlTree) ujedno znaci "ne dozvoli"
  // i "preusmeri ovde".
  return router.createUrlTree(['/admin/login']);
};
