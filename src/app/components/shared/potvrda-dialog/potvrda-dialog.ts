// =============================================================
//  KOMPONENTA: PotvrdaDialog (mali dijalog za potvrdu)
//  -------------------------------------------------------------
//  Iskacuci prozor (MatDialog) koji pita "Da li ste sigurni?".
//  Vraca true ako korisnik klikne "Da", inace false. Koristimo ga
//  pre brisanja zahteva. Template je ovde "inline" jer je kratak.
// =============================================================
import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-potvrda-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Brisanje zahteva</h2>
    <mat-dialog-content>Da li ste sigurni da zelite da obrisete ovaj zahtev?</mat-dialog-content>
    <mat-dialog-actions align="end">
      <!-- [mat-dialog-close] vraca vrednost onome ko je otvorio dijalog -->
      <button mat-button [mat-dialog-close]="false">Otkazi</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">Da, obrisi</button>
    </mat-dialog-actions>
  `,
})
export class PotvrdaDialog {
  // Referenca na dijalog (ovde je ne koristimo direktno, ali je korisno imati).
  constructor(public ref: MatDialogRef<PotvrdaDialog>) {}
}
