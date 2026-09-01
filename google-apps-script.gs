/**
 * À coller dans Google Sheets :
 * Extensions → Apps Script → coller ce code → Enregistrer
 * Puis : Déployer → Nouveau déploiement → Application Web
 *   - Exécuter en tant que : Moi
 *   - Qui a accès : Tout le monde
 * Copiez l'URL générée dans index.html (GOOGLE_SCRIPT_URL)
 */

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Réponses')
                  || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter && e.parameter.payload) {
      data = JSON.parse(e.parameter.payload);
    } else {
      throw new Error('Aucune donnée reçue');
    }

    sheet.appendRow([
      data.date || new Date().toLocaleString('fr-FR'),
      data.prenom || '',
      data.nom || '',
      data.enfants || 'Non',
      data.nbEnfants || '0',
      data.accompagne || 'Non',
      data.activitesInteret || 'Non',
      (data.actJeudi || []).join(' ; '),
      (data.actVendredi || []).join(' ; '),
      (data.actLundi || []).join(' ; '),
      data.menuPrincipal || '',
      data.prenomAcc || '',
      data.nomAcc || '',
      data.activitesInteretAcc || '',
      (data.actJeudiAcc || []).join(' ; '),
      (data.actVendrediAcc || []).join(' ; '),
      (data.actLundiAcc || []).join(' ; '),
      data.menuAcc || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, message: 'Script actif' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Réponses');
  if (!sheet) {
    sheet = ss.insertSheet('Réponses');
  }
  sheet.clear();
  sheet.appendRow([
    'Date',
    'Prénom',
    'Nom',
    'Enfants',
    'Nb enfants',
    'Accompagné(e)',
    'Intéressé activités',
    'Activités jeudi',
    'Activités vendredi',
    'Brunch lundi',
    'Menu invité',
    'Prénom accompagnant',
    'Nom accompagnant',
    'Intéressé activités (acc.)',
    'Activités jeudi (acc.)',
    'Activités vendredi (acc.)',
    'Brunch lundi (acc.)',
    'Menu accompagnant'
  ]);
  sheet.getRange(1, 1, 1, 18).setFontWeight('bold').setBackground('#c4a882');
  sheet.setFrozenRows(1);
}
