# Peperì Business — Landing B2B

Pagina di atterraggio B2B con form collegato a Google Sheet + email automatiche.

## Struttura
```
index.html                      → la pagina (leggera, 44 KB)
images/
  peperi-sala-servizio.jpg      → foto hero (servizio in sala)
  peperi-sala-verde.jpg         → foto "Chi siamo" (sala soffitto verde)
Code.gs                         → script Google Apps Script (NON va su Netlify, va in Apps Script)
ISTRUZIONI.txt                  → setup Netlify + Google Sheet + email
```
> Le foto NON sono più dentro l'HTML: sono file nella cartella `images/`.
> Per cambiarle, sostituisci il file mantenendo lo stesso nome (o aggiorna il `src` in `index.html`).

## Mettere online con GitHub + Netlify (deploy automatico)

### 1. Crea il repository su GitHub
- Vai su https://github.com → **New repository** → nome es. `peperi-b2b` → Create.

### 2. Carica i file
- Nel repo: **Add file → Upload files** → trascina `index.html`, la cartella `images/`,
  `Code.gs`, `ISTRUZIONI.txt`, `README.md` → **Commit changes**.
- (In alternativa, con l'app **GitHub Desktop** trascini la cartella e fai "Push".)

### 3. Collega il repo a Netlify
- Netlify → **Add new site → Import an existing project → GitHub** → autorizza → scegli `peperi-b2b`.
- Build command: **(vuoto)** · Publish directory: **`.`** (la radice) → **Deploy**.

### 4. Da ora in poi
- Modifichi `index.html` **direttamente su github.com** (icona matita ✏️) o dal tuo PC e fai *commit/push*:
  Netlify ripubblica da solo in pochi secondi. Resta lo **storico delle versioni** (puoi tornare indietro).

### 5. Dominio
- In Netlify → **Domain settings** → aggiungi `b2b.peperi.it` (record DNS CNAME dal gestore del dominio).
  SSL gratuito automatico.

## Backend (email + foglio)
`Code.gs` va incollato in **Estensioni → Apps Script** del Google Sheet, NON su Netlify.
Vedi `ISTRUZIONI.txt` per deploy e ri-autorizzazione email.
