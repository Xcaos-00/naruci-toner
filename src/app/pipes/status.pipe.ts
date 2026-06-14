// =============================================================
//  CUSTOM PIPE: StatusPipe
//  -------------------------------------------------------------
//  Pipe pretvara "tehnicki" kod statusa (npr. 'u_obradi') u lep
//  tekst za prikaz korisniku (npr. 'U obradi'). Koristi se u
//  template-u ovako:  {{ zahtev.status | status }}
//  Moze se i lancano (chained) spojiti:  {{ zahtev.status | status | uppercase }}
// =============================================================
import { Pipe, PipeTransform } from '@angular/core';
import { ZahtevStatus } from '../models/zahtev.model';

@Pipe({
  name: 'status',   // ime pod kojim ga pozivamo u template-u
  standalone: true, // standalone pipe - ne treba ga registrovati u modulu
})
export class StatusPipe implements PipeTransform {
  // transform() je obavezna metoda svakog pipe-a: prima ulaznu
  // vrednost i vraca preuredjenu vrednost.
  transform(status: ZahtevStatus): string {
    const mapa: Record<ZahtevStatus, string> = {
      novo: 'Novo',
      u_obradi: 'U obradi',
      odbijen: 'Odbijen',
      odobren: 'Odobren',
      dostavljen: 'Dostavljen',
    };
    return mapa[status] ?? status;
  }
}
