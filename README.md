# Naruci Toner

Front-end aplikacija (Angular 22) za prijavu i obradu zahteva za toner.

- **Javni deo:** korisnik popuni formu (ID stampaca, ime, prezime, model stampaca
  sa slikom, lokal/telefon, email) i posalje zahtev.
- **Admin deo (zasticen prijavom)** ima tri taba:
  - **Zahtevi** - tabela svih zahteva; status mozes promeniti i direktno iz tabele
    (dugme za promenu statusa na svakom redu) ili na stranici detalja.
    Pri promeni statusa korisniku se salje mejl (EmailJS). Kod statusa **Odobren**
    mejl javlja da ce toner biti dostavljen u sredu.
  - **Stampaci i toneri** - dodavanje/brisanje tonera i stampaca i povezivanje
    svakog stampaca sa odgovarajucim tonerom.
  - **Statistika** - grafikoni (Chart.js): raspodela po statusu, najtrazeniji
    stampaci, najaktivniji korisnici, najtrazeniji toneri.

---

## 1. Preduslovi

Treba ti **Node.js v22 ili noviji** (Angular 22 to zahteva). Provera:

```
node -v
```

Ako pise v22 ili v24 - ok. Ako pise v20 ili nista, instaliraj Node.js LTS sa https://nodejs.org

## 2. Instalacija

VAZNO: posto je projekat dopunjen (dodati Chart.js i zone.js), OBAVEZNO ponovo
pokreni instalaciju u folderu projekta:

```
npm install
```

## 3. Pokretanje (DVA terminala)

Sve komande se pokrecu IZ foldera projekta. Prvo udji u folder:

```
cd C:\Users\Stefan\Claude\Projects\Naruci-Toner
```

**Terminal 1 - mock server (baza):**
```
npm run server
```
Pokrece json-server na http://localhost:3000 (trajno cuva izmene u db.json).
(Napomena: pokrece se BEZ --watch da prepisivanje db.json ne bi obaralo konekcije.
Koristi prazan folder `mock-static` da ne bi presretao API rute -
zato API za stampace radi iako postoji folder sa slikama `public/stampaci`.)

**Terminal 2 - Angular aplikacija:**
```
npm start
```
Otvori http://localhost:4200 u browseru.

## 4. Admin nalog

```
Korisnicko ime: admin
Lozinka:        admin123
```

## 5. Slike stampaca

Slike stoje u `public/stampaci`. Putanja slike u bazi (`db.json`) i kod dodavanja
novog stampaca pise se kao `stampaci/ime-slike.png`. Da dodas sliku za novi stampac:
ubaci PNG u `public/stampaci/`, pa pri dodavanju stampaca u admin delu upisi
`stampaci/ime-te-slike.png` u polje "Putanja slike".

## 6. Podesavanje slanja mejlova (EmailJS)

Bez ovog koraka aplikacija radi, ali se mejlovi ne salju. Da bi stizali:
1. Napravi besplatan nalog na https://www.emailjs.com
2. Dodaj Email Service -> dobijes SERVICE ID.
3. Napravi Email Template. Otvori "Edit Content" -> Code editor i NALEPI sadrzaj
   fajla `email-template.html` (stilizovan, brendiran mejl). U podesavanjima
   template-a stavi: Subject = `{{naslov}}`, To Email = `{{to_email}}`. Dobijes TEMPLATE ID.
4. U Account delu nadji PUBLIC KEY.
5. Upisi tri vrednosti u `src/app/config/emailjs.config.ts`.

---

## 7. Struktura projekta

```
src/app/
├── components/
│   ├── javna-stranica/        # javna forma za zahtev (smart)
│   ├── admin/
│   │   ├── login/             # prijava administratora
│   │   ├── lista-zahteva/     # tabela zahteva (smart)
│   │   ├── zahtev-detalji/    # detalji + promena statusa (smart)
│   │   ├── upravljanje/       # CRUD stampaci i toneri (smart)
│   │   └── statistika/        # grafikoni - Chart.js (smart)
│   └── shared/
│       ├── navbar/            # gornja navigacija (MatToolbar)
│       ├── admin-nav/         # tabovi admin dela (routerLinkActive)
│       ├── zahtev-red/        # prikaz jednog zahteva (PRESENTATIONAL, @Input/@Output)
│       └── potvrda-dialog/    # MatDialog za potvrdu brisanja
├── services/                  # zahtev, stampac, toner, auth, email
├── models/                    # Zahtev, Stampac, Toner
├── guards/                    # auth.guard.ts (zastita admin ruta)
├── pipes/                     # status.pipe.ts (custom pipe)
├── validators/                # custom validator (format ID stampaca)
├── util/                      # slike.ts (rezervna mapa model -> slika)
├── config/                    # emailjs.config.ts (kljucevi za mejl)
├── app.routes.ts              # sve rute
└── app.config.ts              # router, http, animacije
db.json                        # mock baza: toneri, stampaci, zahtevi
mock-static/                   # prazan static folder za json-server
public/stampaci/               # slike stampaca (.png)
```

---

## 8. Gde je ispunjen koji zahtev iz projektnog zadatka (za odbranu)

| Zahtev | Fajl / mesto |
|---|---|
| Smart vs presentational | smart: lista-zahteva, upravljanje, statistika, zahtev-detalji; presentational: zahtev-red, navbar, admin-nav |
| Lifecycle hooks | ngOnInit (vise komponenti), ngOnChanges (zahtev-red) |
| Control flow @if/@for/@switch | svuda; @switch u zahtev-red i lista-zahteva (status) |
| @Input / @Output (dvosmerno) | zahtev-red (@Input zahtev/slika, @Output promenaStatusa) <-> zahtev-detalji |
| Servisi i DI (inject, providedIn) | services/ (zahtev, stampac, toner, auth, email) |
| HTTP GET/POST/PUT/DELETE | zahtev.service, stampac.service, toner.service |
| RxJS (map, tap, catchError, switchMap, forkJoin) | services + zahtev-detalji (switchMap) + statistika (forkJoin) |
| Router + param + query param | app.routes, /admin/zahtev/:id, filter ?status= |
| AuthGuard (CanActivate) + login/logout | auth.guard, auth.service, login, navbar |
| Reactive Forms + validacija + custom validator | javna-stranica, upravljanje, login; validators/validators.ts |
| Pipe-ovi (ugradjeni + custom + chained + async) | date/uppercase; custom status.pipe; chained `status | uppercase`; async u javna-stranica |
| Angular Material | Toolbar, Table, Input, Select, Button, Dialog, SnackBar, Card, Spinner, Icon |
| Grafikoni (Chart.js) | statistika (doughnut + bar grafikoni) |
