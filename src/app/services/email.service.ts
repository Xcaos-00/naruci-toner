// =============================================================
//  SERVIS: EmailService
//  -------------------------------------------------------------
//  Salje mejl korisniku kada administrator promeni status njegovog
//  zahteva. Koristi EmailJS. Pored teksta, prosledjuje i podatke
//  za STILIZOVAN (lep, brendiran) mejl: naziv statusa, boju statusa
//  i godinu - koje koristi HTML sablon u EmailJS-u (email-template.html).
// =============================================================
import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailjs.config';
import { Zahtev, ZahtevStatus } from '../models/zahtev.model';

@Injectable({ providedIn: 'root' })
export class EmailService {
  // Naslov i tekst poruke u zavisnosti od statusa.
  private tekstZaStatus(status: ZahtevStatus): { naslov: string; poruka: string } {
    switch (status) {
      case 'novo':
        return {
          naslov: 'Vas zahtev za toner je primljen',
          poruka:
            'Primili smo vas zahtev za toner. Obavesticemo vas mejlom ' +
            'cim administrator promeni status (odobren, odbijen, dostavljen).',
        };
      case 'u_obradi':
        return {
          naslov: 'Vas zahtev za toner je u obradi',
          poruka:
            'Vas zahtev za toner je primljen i trenutno je u obradi. ' +
            'Obavesticemo vas cim bude odobren ili odbijen.',
        };
      case 'odobren':
        return {
          naslov: 'Vas zahtev za toner je ODOBREN',
          poruka:
            'Vas zahtev za toner je odobren. Toner ce biti dostavljen u sredu kod ' +
            'vasih izabranih administratora. Dobicete potvrdu cim toner bude dostavljen.',
        };
      case 'odbijen':
        return {
          naslov: 'Vas zahtev za toner je odbijen',
          poruka:
            'Nazalost, vas zahtev za toner je odbijen. ' +
            'Za vise informacija obratite se administratoru.',
        };
      case 'dostavljen':
        return {
          naslov: 'Vas toner je dostavljen',
          poruka: 'Potvrdjujemo da je vas toner uspesno dostavljen. Hvala vam!',
        };
      default:
        return { naslov: 'Obavestenje o zahtevu', poruka: 'Status vaseg zahteva je promenjen.' };
    }
  }

  // Lep naziv statusa za prikaz u mejlu (npr. 'u_obradi' -> 'U obradi').
  private nazivStatusa(status: ZahtevStatus): string {
    const mapa: Record<ZahtevStatus, string> = {
      novo: 'Novo',
      u_obradi: 'U obradi',
      odbijen: 'Odbijen',
      odobren: 'Odobren',
      dostavljen: 'Dostavljen',
    };
    return mapa[status] ?? status;
  }

  // Boja oznake (badge) statusa u mejlu - ista logika boja kao u aplikaciji.
  private bojaStatusa(status: ZahtevStatus): string {
    const mapa: Record<ZahtevStatus, string> = {
      novo: '#757575',
      u_obradi: '#f9a825',
      odobren: '#2e7d32',
      odbijen: '#c62828',
      dostavljen: '#1565c0',
    };
    return mapa[status] ?? '#757575';
  }

  // Salje mejl za dati zahtev (na osnovu njegovog trenutnog statusa).
  async posaljiObavestenje(zahtev: Zahtev): Promise<void> {
    if (!EMAILJS_CONFIG.popunjeno()) {
      console.warn('EmailJS nije podesen (src/app/config/emailjs.config.ts) - mejl NIJE poslat.');
      return;
    }

    const { naslov, poruka } = this.tekstZaStatus(zahtev.status);

    // Ovi nazivi MORAJU da se poklope sa promenljivama u EmailJS sablonu
    // (vidi email-template.html u korenu projekta).
    const parametri = {
      to_email: zahtev.email,
      email: zahtev.email,
      to_name: `${zahtev.ime} ${zahtev.prezime}`,
      naslov: naslov,
      poruka: poruka,
      model_stampaca: zahtev.modelStampaca,
      status_tekst: this.nazivStatusa(zahtev.status),
      boja: this.bojaStatusa(zahtev.status),
      godina: new Date().getFullYear().toString(),
    };

    try {
      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        parametri,
        EMAILJS_CONFIG.publicKey
      );
      console.log('Mejl poslat na:', zahtev.email);
    } catch (e: any) {
      // EmailJS u gresci vraca .status i .text sa tacnim razlogom (npr.
      // 'The recipients address is empty' ako To Email nije {{to_email}}).
      console.error('EmailJS greska:', e?.status, e?.text || e);
      throw e;
    }
  }
}
