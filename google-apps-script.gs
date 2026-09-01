// ============================================================
// BACKEND GOOGLE SHEETS — Mariage Axelle & Axel
// Deux formulaires, un seul script, un seul déploiement :
//   - RSVP existant        → onglet "Feuille 1"
//   - Formulaire repas     → onglet "formulaire repas"
// ============================================================

const SHEET_ID = '1oowTQNH9-Jt59Yy4nSpJdx2SVZqXfcmxBi-GGIliNZU';
const SHEET_NAME_RSVP = 'Feuille 1';
const SHEET_NAME_REPAS = 'formulaire repas';

const SENDER_EMAIL = 'noreply@votresite.com';
const SENDER_NAME = 'Axelle & Axel';


// ─── Point d'entrée unique ───────────────────────────────────

function doPost(e) {
  try {
    let data = parseRequestData(e);
    if (!data) {
      return jsonResponse({ success: false, error: 'Données invalides' });
    }

    // Nouveau formulaire repas (prenom/nom + menu)
    if (isFormulaireRepas(data)) {
      return handleFormulaireRepas(data);
    }

    // Ancien formulaire RSVP
    return handleRSVP(data);

  } catch (error) {
    Logger.log('Erreur doPost: ' + error.toString());
    return jsonResponse({ success: false, error: error.toString() });
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, message: 'Script actif — RSVP + formulaire repas' }))
    .setMimeType(ContentService.MimeType.JSON);
}


// ─── Formulaire repas (nouveau site) ─────────────────────────

function isFormulaireRepas(data) {
  return data.prenom !== undefined || data.menuPrincipal !== undefined;
}

function handleFormulaireRepas(data) {
  const sheet = getOrCreateSheet(SHEET_NAME_REPAS);
  ensureRepasHeaders(sheet);

  sheet.appendRow([
    data.date || new Date().toLocaleString('fr-FR'),
    data.prenom || '',
    data.nom || '',
    data.enfants || 'Non',
    data.nbEnfants || '0',
    data.accompagne || 'Non',
    data.activitesInteret || 'Non',
    joinList(data.actJeudi),
    joinList(data.actVendredi),
    joinList(data.actLundi),
    data.menuPrincipal || '',
    data.prenomAcc || '',
    data.nomAcc || '',
    data.activitesInteretAcc || '',
    joinList(data.actJeudiAcc),
    joinList(data.actVendrediAcc),
    joinList(data.actLundiAcc),
    data.menuAcc || ''
  ]);

  Logger.log('Formulaire repas enregistré : ' + data.prenom + ' ' + data.nom);
  return jsonResponse({ success: true });
}

function ensureRepasHeaders(sheet) {
  const firstCell = sheet.getRange(1, 1).getValue();
  if (firstCell && firstCell.toString().trim() !== '') return;

  const headers = [
    'Date', 'Prénom', 'Nom', 'Enfants', 'Nb enfants', 'Accompagné(e)',
    'Intéressé activités', 'Activités jeudi', 'Activités vendredi', 'Brunch lundi',
    'Menu invité', 'Prénom accompagnant', 'Nom accompagnant',
    'Intéressé activités (acc.)', 'Activités jeudi (acc.)',
    'Activités vendredi (acc.)', 'Brunch lundi (acc.)', 'Menu accompagnant'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#c4a882');
  sheet.setFrozenRows(1);
}

function setupSheetRepas() {
  const sheet = getOrCreateSheet(SHEET_NAME_REPAS);
  sheet.clear();
  ensureRepasHeaders(sheet);
  Logger.log('Onglet "' + SHEET_NAME_REPAS + '" prêt.');
}


// ─── RSVP existant (inchangé) ────────────────────────────────

function handleRSVP(data) {
  const sheet = getSheetRSVP();

  const firstRow = sheet.getRange(1, 1, 1, 1).getValue();
  if (!firstRow || firstRow.toString().trim() === '') {
    createHeaders(sheet);
  }

  let phoneFormatted = '';
  try {
    const phoneNumber = (data.phone || '').toString().trim();
    const countryCode = (data.phone_country_code || '').toString().trim();
    if (countryCode && phoneNumber) {
      const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
      phoneFormatted = "'" + countryCode + ' ' + cleanPhone;
    } else if (phoneNumber) {
      phoneFormatted = "'" + phoneNumber;
    }
    if (!phoneFormatted || phoneFormatted.trim() === '' || phoneFormatted.trim() === "'" || phoneFormatted.trim() === "'+") {
      phoneFormatted = 'Non renseigné';
    }
  } catch (e) {
    phoneFormatted = 'Non renseigné';
  }

  let adultsFormatted = 'Aucun';
  try {
    if (data.adults) {
      let adultsArray = [];
      if (Array.isArray(data.adults)) {
        adultsArray = data.adults;
      } else if (typeof data.adults === 'string' && data.adults.trim() !== '') {
        try {
          const parsed = JSON.parse(data.adults);
          if (Array.isArray(parsed)) adultsArray = parsed;
        } catch (e) { /* ignore */ }
      }
      if (adultsArray.length > 0) {
        const formattedList = adultsArray.map(function(adult) {
          const civility = (adult.civility || '').toString().trim();
          const firstName = (adult.first_name || '').toString().trim();
          const lastName = (adult.last_name || '').toString().trim();
          const email = (adult.email || '').toString().trim();
          const phone = (adult.phone || '').toString().trim();
          const name = (firstName + ' ' + lastName).trim();
          if (!name) return '';
          let civilityLabel = '';
          if (civility === 'Mr') civilityLabel = '[Monsieur]';
          else if (civility === 'Mme') civilityLabel = '[Madame]';
          else if (civility) civilityLabel = '[' + civility + ']';
          let formatted = civilityLabel ? civilityLabel + ' ' + name : name;
          if (email) formatted += ' | Email: ' + email;
          if (phone) formatted += ' | Tél: \'' + phone;
          return formatted;
        }).filter(function(entry) { return entry.trim() !== ''; });
        if (formattedList.length > 0) adultsFormatted = formattedList.join(' || ');
      }
    }
  } catch (e) {
    adultsFormatted = 'Erreur de formatage';
  }

  const rowData = [
    new Date(),
    (data.civility || '').toString().trim(),
    (data.first_name || '').toString().trim(),
    (data.last_name || '').toString().trim(),
    (data.email || '').toString().trim().toLowerCase(),
    phoneFormatted,
    (data.language || 'FR').toString().toUpperCase(),
    data.will_attend === true || data.will_attend === 'true' ? 'Oui' : 'Non',
    adultsFormatted,
    parseInt(data.children_count) || 0,
    (data.message || '').toString().trim(),
    '',
    (data.phone_country_code || '').toString().trim(),
    data.accommodation_info === true || data.accommodation_info === 'true' ? 'Oui' : 'Non',
    data.activities_interest === true || data.activities_interest === 'true' ? 'Oui' : 'Non'
  ];

  const lastRow = sheet.getLastRow();
  sheet.appendRow(rowData);
  sheet.getRange(lastRow + 1, 6).setNumberFormat('@');

  try { sendConfirmationEmail(data); } catch (e) {
    Logger.log('Email non bloquant: ' + e.toString());
  }

  return jsonResponse({ success: true });
}


// ─── Utilitaires partagés ────────────────────────────────────

function parseRequestData(e) {
  if (!e) return null;
  if (e.postData && e.postData.contents) {
    try { return JSON.parse(e.postData.contents); } catch (e) { return null; }
  }
  if (e.parameter && e.parameter.payload) {
    try { return JSON.parse(e.parameter.payload); } catch (e) { return null; }
  }
  return null;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function joinList(arr) {
  return (arr && arr.length) ? arr.join(' ; ') : '';
}

function openSpreadsheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  if (!ss) throw new Error('Impossible d\'ouvrir le Sheet ID: ' + SHEET_ID);
  return ss;
}

function getSheetRSVP() {
  const ss = openSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME_RSVP);
  if (!sheet) {
    const sheets = ss.getSheets();
    sheet = sheets.length > 0 ? sheets[0] : ss.insertSheet(SHEET_NAME_RSVP);
  }
  return sheet;
}

function getOrCreateSheet(name) {
  const ss = openSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function getSheet() { return getSheetRSVP(); }

function createHeaders(sheet) {
  const headers = [
    'timestamp', 'civility', 'first_name', 'last_name', 'email', 'phone',
    'language', 'will_attend', 'accompagnants', 'children_count', 'message',
    'diet', 'phone_country_code', 'accommodation_info', 'activities_interest'
  ];
  const existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  if (existing[0] && existing[0].toString().trim() !== '') return;
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
}


// ─── Email RSVP ──────────────────────────────────────────────

function sendConfirmationEmail(data) {
  const recipientEmail = (data.email || '').toString().trim().toLowerCase();
  if (!recipientEmail) return;

  const language = (data.language || 'FR').toString().toUpperCase();
  const isFrench = language === 'FR';
  const firstName = (data.first_name || '').toString().trim();
  const greeting = firstName || (isFrench ? 'Cher/Chère invité(e)' : 'Dear guest');
  const subject = isFrench ? 'Merci pour votre réponse' : 'Thank you for your response';

  let emailBody = isFrench
    ? 'Bonjour ' + greeting + ',\n\nMerci d\'avoir pris le temps de remplir notre formulaire.\n\nNous allons bien prendre en compte votre réponse.\nNous revenons vers vous très rapidement.\n\nBelle journée,\nAxelle & Axel'
    : 'Hello ' + greeting + ',\n\nThank you for taking the time to fill out our form.\n\nWe will take your response into account.\nWe will get back to you very soon.\n\nHave a wonderful day,\nAxelle & Axel';

  GmailApp.sendEmail(recipientEmail, subject, emailBody, { name: SENDER_NAME });
}


// ─── Tests ───────────────────────────────────────────────────

function testSheetAccess() {
  const ss = openSpreadsheet();
  Logger.log('Sheet OK : ' + ss.getName());
  Logger.log('RSVP  : ' + getSheetRSVP().getName());
  Logger.log('Repas : ' + getOrCreateSheet(SHEET_NAME_REPAS).getName());
}

function testFormulaireRepas() {
  handleFormulaireRepas({
    date: new Date().toLocaleString('fr-FR'),
    prenom: 'Test', nom: 'Repas',
    enfants: 'Non', nbEnfants: '0', accompagne: 'Oui',
    activitesInteret: 'Oui',
    actJeudi: ['Accueil et cocktail'],
    actVendredi: [], actLundi: ['Brunch de clôture'],
    menuPrincipal: 'Poisson',
    prenomAcc: 'Marie', nomAcc: 'Dupont',
    activitesInteretAcc: 'Non',
    actJeudiAcc: [], actVendrediAcc: [], actLundiAcc: [],
    menuAcc: 'Viande'
  });
  Logger.log('Test formulaire repas OK');
}

function testSendEmail() {
  sendConfirmationEmail({ email: 'VOTRE_EMAIL@example.com', first_name: 'Test', language: 'FR' });
}

function testDirectSubmit() {
  handleRSVP({
    civility: 'Mr', first_name: 'Test', last_name: 'Direct',
    email: 'test@test.com', phone: '123456789', phone_country_code: '+33',
    language: 'FR', will_attend: false, adults: [], children_count: 0,
    message: 'Test direct', accommodation_info: false, activities_interest: false
  });
}
