/**
 * PEPERÌ BUSINESS — Endpoint Google Sheet + EMAIL AUTOMATICHE
 * ----------------------------------------------------------------
 * COSA FA, a ogni invio del form:
 *   1) salva una riga nel foglio "Richieste";
 *   2) invia automaticamente un'email di recap AL CLIENTE (indirizzo del form);
 *   3) invia una notifica AL RISTORANTE.
 * Nessun Make, nessun servizio esterno: usa il servizio email integrato di Google (MailApp).
 *
 * ----------------------------------------------------------------
 * AGGIORNAMENTO (se avevi già la versione precedente):
 *   1. Apri il foglio > Estensioni > Apps Script.
 *   2. Cancella tutto il codice e incolla QUESTO file. Salva.
 *   3. La prima volta che esegui/deployi, Google chiede di RI-autorizzare
 *      (serve il nuovo permesso "invia email come te"): accetta.
 *   4. Esegui il deployment > GESTISCI deployment > (matita) Modifica >
 *      Versione: "Nuova versione" > Esegui il deployment.
 *      (Senza "Nuova versione" l'URL /exec continua a usare il codice vecchio!)
 *   L'URL /exec resta lo stesso: non devi ritoccare la landing page.
 *
 * DA QUALE INDIRIZZO PARTONO LE EMAIL:
 *   Dall'account Google proprietario di questo script. Per farle risultare da
 *   info@peperi.it, crea/deploya lo script con l'account Google di info@peperi.it.
 */

// ======================== CONFIGURAZIONE ========================
var CONFIG = {
  RISTORANTE_EMAIL: 'dalmineristorazione@gmail.com, info@peperi.it', // dove arriva la notifica interna (più indirizzi separati da virgola)
  MITTENTE_NOME:    'Peperì · Convivialità Mediterranea',
  RISPONDI_A:       'info@peperi.it',                 // reply-to delle email al cliente
  INVIA_RECAP_CLIENTE:       true,                    // email automatica al cliente
  INVIA_NOTIFICA_RISTORANTE: true                     // email automatica al ristorante
};
// ===============================================================


function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var p = (e && e.parameter) ? e.parameter : {};
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Richieste') || ss.insertSheet('Richieste');

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Data invio','Azienda','Referente','Email','Telefono','Formula',
        'Partecipanti','Data evento','Fascia oraria','Menù','Servizi aggiuntivi','Budget','Note','P.IVA']);
      sheet.getRange(1, 1, 1, 14).setFontWeight('bold').setBackground('#3a51a0').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([ new Date(), p.company||'', p.name||'', p.email||'', p.phone||'',
      p.formula||'', p.guests||'', p.date||'', p.slot||'', p.menu||'', p.servizi||'',
      p.budget||'', p.notes||'', p.piva||'' ]);

    // Le email non devono mai bloccare il salvataggio: invio protetto.
    try { inviaEmail_(p); } catch (mailErr) { console.error('Errore invio email: ' + mailErr); }

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}


function inviaEmail_(p) {
  var righe = [
    ['Azienda', p.company], ['Referente', p.name], ['P.IVA', p.piva], ['Email', p.email], ['Telefono', p.phone],
    ['Formula', p.formula], ['Partecipanti', p.guests], ['Data evento', p.date],
    ['Fascia oraria', p.slot], ['Menù', p.menu], ['Servizi aggiuntivi', p.servizi],
    ['Budget', p.budget], ['Note', p.notes]
  ];

  // Layout a righe impilate (etichetta sopra, valore sotto) invece che a due colonne:
  // su schermi stretti (mail Android/iOS) una colonna valori allineata a destra con
  // email/telefono lunghi non va a capo e sfonda il bordo destro dello schermo — impilando
  // etichetta e valore uno sopra l'altro il problema non si presenta più, indipendentemente
  // dalla larghezza dello schermo del client email.
  var tabella = righe.map(function (r) {
    return '<tr><td style="padding:10px 14px;border-bottom:1px solid #eee">' +
      '<div style="color:#6b7280;font-size:12px;margin-bottom:3px">' + r[0] + '</div>' +
      '<div style="color:#1b2547;font-weight:600;font-size:14px;word-break:break-word;overflow-wrap:anywhere">' + (r[1] || '—') + '</div>' +
      '</td></tr>';
  }).join('');

  function corpo(titolo, intro) {
    return '' +
      '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;width:100%;margin:0 auto;border:1px solid #eee;border-radius:14px;overflow:hidden;box-sizing:border-box">' +
        '<div style="background:#3a51a0;color:#fff;padding:24px 28px">' +
          '<div style="font-size:24px;font-weight:700;letter-spacing:.5px">peperì</div>' +
          '<div style="font-size:11px;letter-spacing:2px;opacity:.85;text-transform:uppercase">Convivialità Mediterranea</div>' +
        '</div>' +
        '<div style="padding:26px 28px;color:#1b2547">' +
          '<h2 style="margin:0 0 8px;color:#3a51a0;font-size:20px">' + titolo + '</h2>' +
          '<p style="margin:0 0 20px;color:#4a5478;font-size:14px;line-height:1.6">' + intro + '</p>' +
          '<table style="width:100%;border-collapse:collapse;table-layout:fixed">' + tabella + '</table>' +
        '</div>' +
        '<div style="background:#f5f3ea;padding:16px 28px;color:#6b7280;font-size:12px;line-height:1.6">' +
          'Peperì · Via Agostino Richelmi 1, 24044 Dalmine (BG)<br>+39 035 04 01 940 · info@peperi.it · www.peperi.it' +
        '</div>' +
      '</div>';
  }

  var emailValida = p.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email);

  // 1) RECAP AL CLIENTE
  if (CONFIG.INVIA_RECAP_CLIENTE && emailValida) {
    MailApp.sendEmail({
      to: p.email,
      subject: 'Abbiamo ricevuto la tua richiesta — Peperì Business',
      htmlBody: corpo('Grazie ' + (p.name || '') + '!',
        'Abbiamo ricevuto la tua richiesta e ti ricontatteremo al più presto con una proposta su misura. Ecco il riepilogo di quanto ci hai inviato:'),
      name: CONFIG.MITTENTE_NOME,
      replyTo: CONFIG.RISPONDI_A
    });
  }

  // 2) NOTIFICA AL RISTORANTE
  if (CONFIG.INVIA_NOTIFICA_RISTORANTE && CONFIG.RISTORANTE_EMAIL) {
    MailApp.sendEmail({
      to: CONFIG.RISTORANTE_EMAIL,
      subject: 'Nuova richiesta Business — ' + (p.company || 'azienda'),
      htmlBody: corpo('Nuova richiesta di preventivo',
        'È arrivata una nuova richiesta dal sito. Rispondi direttamente a questa email per contattare il cliente:'),
      name: CONFIG.MITTENTE_NOME,
      replyTo: emailValida ? p.email : CONFIG.RISPONDI_A   // così "Rispondi" scrive al cliente
    });
  }
}


// Apri questo URL nel browser per verificare che l'endpoint sia vivo.
function doGet() {
  return ContentService.createTextOutput('Peperì Business — endpoint attivo.');
}


// ==================================================================
// TEST MANUALE: seleziona questa funzione nel menu in alto dell'editor
// Apps Script (a fianco di "Esegui il deployment") e premi ▶ Esegui.
// A differenza di doPost, qui NON c'è try/catch: se MailApp fallisce,
// l'errore appare per intero nel pannello di esecuzione in basso —
// così vedi la causa vera invece che il buco nero del catch silenzioso.
// Cambia l'email qui sotto con la tua per il test.
// ==================================================================
function testInviaEmail() {
  inviaEmail_({
    company: 'Azienda di Test', name: 'Test Stefania', piva: '01234567890', email: 'opesent@gmail.com',
    phone: '+39 0000000000', formula: 'Coffee Break', guests: '10', date: '2026-12-01',
    slot: 'Mattina (coffee break)', menu: 'Da definire con lo staff', servizi: 'Nessuno',
    budget: 'Fino a 25 € a persona', notes: 'Riga di test da testInviaEmail()'
  });
  Logger.log('Fatto: se non è comparso nessun errore sopra, le email sono partite.');
}
