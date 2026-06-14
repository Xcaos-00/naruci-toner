// =============================================================
//  GLOBALNA KONFIGURACIJA APLIKACIJE
//  -------------------------------------------------------------
//  Ovde "ukljucujemo" osnovne mogucnosti koje aplikacija koristi:
//  automatsko osvezavanje prikaza (zone.js), rutiranje, HTTP klijent
//  i animacije (potrebne za Angular Material).
// =============================================================
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // provideZoneChangeDetection ukljucuje zone.js: kada stigne odgovor
    // sa servera (subscribe), Angular AUTOMATSKI osvezi prikaz. Bez ovoga
    // (zoneless rezim) tabela bi se ucitala ali se ne bi prikazala dok se
    // ne klikne nesto. eventCoalescing grupise dogadjaje radi performansi.
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
  ],
};
