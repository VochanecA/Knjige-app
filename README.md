# Jednostavna biblioteka

## Funkcionalnosti
Sistem se sastoji od dva tipa korisnika: administratori i korisnici.
Svaki korisnik treba da ima svoj nalog.
Aplikacija omogućava funkcionalnosti registracije, prijave i odjave.
Knjiga može imati više kopija, tako da se ista knjiga može izdati na više korisnika.
Funkcije Administratora
Administratori mogu pregledati, dodavati, ažurirati ili brisati knjige.
Administratori mogu vidjeti sve studente koji imaju nalog u sistemu.
Administratori mogu pratiti sve aktivnosti u biblioteci.
Administratori mogu izdati knjigu korisniku.
Administratori mogu uzeti knjigu od korisnika.
Administratori mogu pregledati sve trenutne pozajmice knjiga.
Administratori takođe mogu pregledati prošle pozajmice kod kojih su knjige vraćene.
Administratori mogu slati e-mail pod$etnike korisnicima.
Administratori mogu ažurirati svoj profil.

## Funkcije Korisnika
Korisnici mogu vidjeti sve knjige u biblioteci.
Korisnici mogu pratiti sve svoje aktivnosti(sadasnje,prosle), zajedno sa vremenom(datum,vrijeme itd).
Korisnici mogu vidjeti sve knjige koje trenutno posjeduju, zajedno sa statusom (kasne ili ne).
Korisnici takođe mogu vidjeti knjige koje su već vratili.
Korisnici mogu ažurirati svoj profil.


## Korišćene tehnologije
HTML
CSS
Bootstrap
Javascript
Node.js
Express.js
Mongodb
ejs
HELMET
IP filter (moze i geoblock)

## Kako da pokrenem
1. Pokreni
	```sh
	npm start
	```
2. Otvori http://localhost:5000
3. Prvo se morate registrovati, a zatim prijaviti kao administrator ili korisnik da biste pokrenuli aplikaciju.
4. Stranica za registraciju administratora ukoliko ne radi iz aplikacije, skriveni link je: /auth/admin-signup

