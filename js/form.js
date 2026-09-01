// URL configurée dans js/config.js

const form = document.getElementById('form-mariage');
const nbEnfantsBlock = document.getElementById('nb-enfants-block');
const accompagnantBlock = document.getElementById('accompagnant-block');
const activitesAccBlock = document.getElementById('activites-acc-block');
const activitesPrincipalBlock = document.getElementById('activites-principal-block');
const recap = document.getElementById('recap');
const recapText = document.getElementById('recap-text');

document.querySelectorAll('input[name="enfants"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const avecEnfants = document.querySelector('input[name="enfants"]:checked').value === 'oui';
    nbEnfantsBlock.classList.toggle('hidden', !avecEnfants);
  });
});

document.querySelectorAll('input[name="accompagne"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const accompagne = document.querySelector('input[name="accompagne"]:checked').value === 'oui';
    accompagnantBlock.classList.toggle('hidden', !accompagne);
  });
});

document.querySelectorAll('input[name="activites-acc"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const interesse = document.querySelector('input[name="activites-acc"]:checked').value === 'oui';
    activitesAccBlock.classList.toggle('hidden', !interesse);
  });
});

document.querySelectorAll('input[name="activites-principal"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const interesse = document.querySelector('input[name="activites-principal"]:checked').value === 'oui';
    activitesPrincipalBlock.classList.toggle('hidden', !interesse);
  });
});

function getCheckedValues(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(cb => cb.value);
}

function clearErrors() {
  document.querySelectorAll('.field.error').forEach(f => f.classList.remove('error'));
}

function setError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('error');
}

function validate() {
  clearErrors();
  let valid = true;

  const prenom = document.getElementById('prenom').value.trim();
  const nom = document.getElementById('nom').value.trim();
  if (!prenom) { setError('field-prenom'); valid = false; }
  if (!nom) { setError('field-nom'); valid = false; }

  const avecEnfants = document.querySelector('input[name="enfants"]:checked').value === 'oui';
  if (avecEnfants) {
    const nb = parseInt(document.getElementById('nb-enfants').value, 10);
    if (!nb || nb < 1) {
      document.getElementById('nb-enfants-block').classList.add('error');
      valid = false;
    }
  }

  const menuPrincipal = document.querySelector('input[name="menu-principal"]:checked');
  if (!menuPrincipal) { setError('field-menu-principal'); valid = false; }

  const accompagne = document.querySelector('input[name="accompagne"]:checked').value === 'oui';
  if (accompagne) {
    const prenomAcc = document.getElementById('prenom-acc').value.trim();
    const nomAcc = document.getElementById('nom-acc').value.trim();
    if (!prenomAcc) { setError('field-prenom-acc'); valid = false; }
    if (!nomAcc) { setError('field-nom-acc'); valid = false; }

    const menuAcc = document.querySelector('input[name="menu-acc"]:checked');
    if (!menuAcc) { setError('field-menu-acc'); valid = false; }
  }

  return valid;
}

function getFormData() {
  const avecEnfants = document.querySelector('input[name="enfants"]:checked').value === 'oui';
  const accompagne = document.querySelector('input[name="accompagne"]:checked').value === 'oui';
  const activitesPrincipal = document.querySelector('input[name="activites-principal"]:checked').value === 'oui';
  const activitesAcc = accompagne && document.querySelector('input[name="activites-acc"]:checked').value === 'oui';

  return {
    date: new Date().toLocaleString('fr-FR'),
    prenom: document.getElementById('prenom').value.trim(),
    nom: document.getElementById('nom').value.trim(),
    enfants: avecEnfants ? 'Oui' : 'Non',
    nbEnfants: avecEnfants ? document.getElementById('nb-enfants').value : '0',
    accompagne: accompagne ? 'Oui' : 'Non',
    activitesInteret: activitesPrincipal ? 'Oui' : 'Non',
    actJeudi: activitesPrincipal ? getCheckedValues('act-jeudi') : [],
    actVendredi: activitesPrincipal ? getCheckedValues('act-vendredi') : [],
    actLundi: activitesPrincipal ? getCheckedValues('act-lundi') : [],
    menuPrincipal: document.querySelector('input[name="menu-principal"]:checked')?.value || '',
    prenomAcc: accompagne ? document.getElementById('prenom-acc').value.trim() : '',
    nomAcc: accompagne ? document.getElementById('nom-acc').value.trim() : '',
    activitesInteretAcc: accompagne ? (activitesAcc ? 'Oui' : 'Non') : '',
    actJeudiAcc: activitesAcc ? getCheckedValues('act-jeudi-acc') : [],
    actVendrediAcc: activitesAcc ? getCheckedValues('act-vendredi-acc') : [],
    actLundiAcc: activitesAcc ? getCheckedValues('act-lundi-acc') : [],
    menuAcc: accompagne ? (document.querySelector('input[name="menu-acc"]:checked')?.value || '') : ''
  };
}

function buildRecap(data) {
  const {
    prenom, nom, enfants, nbEnfants, accompagne, activitesInteret,
    actJeudi, actVendredi, actLundi, menuPrincipal,
    prenomAcc, nomAcc, activitesInteretAcc, actJeudiAcc, actVendrediAcc, actLundiAcc, menuAcc
  } = data;
  const avecEnfants = enfants === 'Oui';
  const estAccompagne = accompagne === 'Oui';

  let text = `FICHE RENSEIGNEMENTS — MARIAGE\n`;
  text += `${'='.repeat(36)}\n\n`;
  text += `INVITÉ(E)\n`;
  text += `  Nom : ${prenom} ${nom}\n`;
  text += `  Enfants : ${avecEnfants ? 'Oui (' + nbEnfants + ')' : 'Non'}\n`;
  text += `  Accompagné(e) : ${accompagne}\n`;
  text += `  Intéressé(e) par les activités : ${activitesInteret}\n`;
  if (activitesInteret === 'Oui') {
    text += `  Activités jeudi : ${actJeudi.length ? actJeudi.join(', ') : 'Aucune'}\n`;
    text += `  Activités vendredi : ${actVendredi.length ? actVendredi.join(', ') : 'Aucune'}\n`;
    text += `  Brunch lundi : ${actLundi.length ? actLundi.join(', ') : 'Non'}\n`;
  }
  text += `  Menu : ${menuPrincipal}\n`;

  if (estAccompagne) {
    text += `\nACCOMPAGNANT(E)\n`;
    text += `  Nom : ${prenomAcc} ${nomAcc}\n`;
    text += `  Intéressé(e) par les activités : ${activitesInteretAcc}\n`;
    if (activitesInteretAcc === 'Oui') {
      text += `  Activités jeudi : ${actJeudiAcc.length ? actJeudiAcc.join(', ') : 'Aucune'}\n`;
      text += `  Activités vendredi : ${actVendrediAcc.length ? actVendrediAcc.join(', ') : 'Aucune'}\n`;
      text += `  Brunch lundi : ${actLundiAcc.length ? actLundiAcc.join(', ') : 'Non'}\n`;
    }
    text += `  Menu : ${menuAcc}\n`;
  }

  return text;
}

function saveResponse(text) {
  const responses = JSON.parse(localStorage.getItem('mariage-reponses') || '[]');
  responses.push({ date: new Date().toISOString(), contenu: text });
  localStorage.setItem('mariage-reponses', JSON.stringify(responses));
}

async function sendToGoogleSheets(data) {
  if (!GOOGLE_SCRIPT_URL) return { ok: true, localOnly: true };

  const formData = new FormData();
  formData.append('payload', JSON.stringify(data));

  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) throw new Error('Erreur réseau');
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Erreur serveur');
  return { ok: true, localOnly: false };
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validate()) return;

  const btn = document.getElementById('btn-submit');
  const status = document.getElementById('submit-status');
  const data = getFormData();
  const text = buildRecap(data);

  btn.disabled = true;
  btn.textContent = 'Envoi en cours…';
  status.style.display = 'block';
  status.textContent = GOOGLE_SCRIPT_URL
    ? 'Enregistrement dans Google Sheets…'
    : 'Enregistrement en cours…';

  try {
    const result = await sendToGoogleSheets(data);
    recapText.textContent = text;
    saveResponse(text);

    document.querySelector('.form-header').style.display = 'none';
    form.style.display = 'none';
    recap.classList.add('visible');
    document.getElementById('recap-message').textContent = result.localOnly
      ? 'Vos réponses sont enregistrées. Merci pour votre participation !'
      : 'Vos réponses ont été enregistrées dans Google Sheets. Merci !';
    recap.scrollIntoView({ behavior: 'smooth' });
  } catch {
    status.textContent = 'Erreur lors de l\'envoi. Réessayez ou copiez vos réponses.';
    status.style.color = '#6b3a3a';
    btn.disabled = false;
    btn.textContent = 'Envoyer';
  }
});

document.getElementById('btn-copy').addEventListener('click', () => {
  navigator.clipboard.writeText(recapText.textContent).then(() => {
    const btn = document.getElementById('btn-copy');
    const orig = btn.textContent;
    btn.textContent = 'Copié !';
    setTimeout(() => { btn.textContent = orig; }, 2000);
  });
});

document.getElementById('btn-modifier').addEventListener('click', () => {
  form.style.display = 'block';
  document.querySelector('.form-header').style.display = 'block';
  recap.classList.remove('visible');
  form.scrollIntoView({ behavior: 'smooth' });
});
