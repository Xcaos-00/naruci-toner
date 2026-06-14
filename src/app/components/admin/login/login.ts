// =============================================================
//  KOMPONENTA: Login (prijava administratora)
//  -------------------------------------------------------------
//  Mala reaktivna forma sa korisnickim imenom i lozinkom. Na
//  uspesnu prijavu vodi administratora na /admin. Ovde se
//  demonstrira i scenario "prijava -> pristup zasticenoj ruti".
// =============================================================
import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Jednostavna forma: oba polja su obavezna.
  forma: FormGroup = this.fb.group({
    korisnik: ['', Validators.required],
    lozinka: ['', Validators.required],
  });

  get f() {
    return this.forma.controls;
  }

  prijava(): void {
    if (this.forma.invalid) {
      this.forma.markAllAsTouched();
      return;
    }

    const { korisnik, lozinka } = this.forma.value;

    // Pitamo AuthService da li su podaci ispravni.
    if (this.auth.prijava(korisnik, lozinka)) {
      // Uspeh -> idemo na admin listu zahteva.
      this.router.navigate(['/admin']);
    } else {
      // Neuspeh -> poruka korisniku.
      this.snackBar.open('Pogresno korisnicko ime ili lozinka.', 'Zatvori', { duration: 4000 });
    }
  }
}
