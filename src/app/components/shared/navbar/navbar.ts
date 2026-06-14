// =============================================================
//  KOMPONENTA: Navbar (gornja traka za navigaciju)
//  -------------------------------------------------------------
//  Prikazuje MatToolbar sa linkovima. Ako je admin prijavljen,
//  prikazuje dugme "Odjava"; ako nije, prikazuje "Admin prijava".
//  Ovo je jednostavna "presentational-ish" komponenta koja koristi
//  AuthService za informaciju o prijavi i Router za odjavu.
// =============================================================
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  // RouterLink omogucava navigaciju klikom (umesto obicnog href).
  imports: [RouterLink, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private auth = inject(AuthService);
  private router = inject(Router);

  // Koristi se u template-u (@if) da odlucimo koje dugme prikazati.
  get prijavljen(): boolean {
    return this.auth.jePrijavljen();
  }

  // Odjava: obrisi prijavu i vrati korisnika na pocetnu stranu.
  odjava(): void {
    this.auth.odjava();
    this.router.navigate(['/']);
  }
}
