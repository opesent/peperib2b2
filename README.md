# Peperì Business (B2B) — Landing page

Landing page B2B di **Peperì · Convivialità Mediterranea** (Dalmine Ristorazione S.r.l.)
per meeting, eventi e catering aziendali, con **form di richiesta preventivo collegato a Google Sheet**.

Sito online: https://peperib2b.netlify.app/

---

## Cosa contiene questo repository

| File | A cosa serve |
|------|--------------|
| `index.html` | L'intera pagina (testi, immagini incorporate, form). È l'unico file del sito. |
| `Code.gs` | Lo script di Google Apps Script che riceve le richieste del form e le scrive nel Google Sheet. Qui è tenuto solo come copia di sicurezza / versionamento: gira su Google, non su questo sito. |
| `README.md` | Questo file. |

> Il sito è **statico** (solo HTML): non serve nessuna build. Netlify pubblica `index.html` così com'è.

---

## Come funziona il "database" (Google Sheet)

Il form NON usa un server proprio. Quando qualcuno invia una richiesta:

1. La pagina invia i dati all'URL della **Web App** di Google Apps Script.
2. Lo script (`Code.gs`) aggiunge una riga al foglio Google nella scheda **Richieste**.

L'URL della Web App è dentro `index.html`, nel blocco di configurazione JavaScript:

```js
const GSHEET_ENDPOINT = 'https://script.google.com/macros/s/.../exec';
```

Se un domani cambi il foglio o rifai il deployment dello script, basta aggiornare questa riga.

---

## Come pubblicare da GitHub su Netlify (collegamento automatico)

Così ogni modifica salvata su GitHub aggiorna il sito da sola, senza trascinare file.

1. Su **Netlify** apri il sito `peperib2b`.
2. Vai in **Site configuration → Build & deploy → Continuous deployment**.
3. Clicca **Link repository** → scegli **GitHub** → autorizza (una volta sola) → seleziona questo repository.
4. Impostazioni di build (lasciare tutto vuoto, è un sito statico):
   - **Build command**: *(vuoto)*
   - **Publish directory**: `.` *(un punto) oppure vuoto*
5. Conferma. Da ora Netlify pubblica da GitHub; l'indirizzo `peperib2b.netlify.app` resta lo stesso.

L'autorizzazione GitHub↔Netlify è **una tantum**: dopo, per modificare non serve nessun token.

---

## Come modificare i contenuti (dal sito di GitHub, senza scaricare nulla)

1. Apri `index.html` qui su GitHub.
2. Clicca l'icona a forma di **matita** (Edit).
3. Cerca il testo con `Ctrl+F` e modificalo. Punti che cambierai più spesso:

| Cerca | Cosa cambiare |
|-------|---------------|
| `XX € a persona` | I prezzi dei tre menù (compare 3 volte). |
| `+39 035 04 01 940` | Numero di telefono. |
| `info@peperi.it` | Email di contatto. |
| `Via Agostino Richelmi, 1` | Indirizzo. |
| `GSHEET_ENDPOINT` | L'URL del Google Sheet (solo se cambia lo script). |

4. In alto clicca **Commit changes**. Netlify pubblica l'aggiornamento in circa un minuto (lo vedi nel tab **Deploys** di Netlify).

⚠️ Modifica solo il **testo**, non i simboli `<`, `>`, `"` che lo circondano.

---

## Note

- **Immagini**: sono già incorporate dentro `index.html` (in formato base64), quindi non ci sono file immagine separati da caricare.
- **Secondo sito** (`peperibtob.netlify.app`): è la versione senza database. Una volta che questa è a posto, può essere dismessa o tenuta come backup.
- **Pulsante "Mandami un recap"**: apre l'app email del cliente con il riepilogo già pronto, indirizzato a sé stesso. Per l'invio automatico del recap si può aggiungere `MailApp.sendEmail(...)` in `Code.gs`.
