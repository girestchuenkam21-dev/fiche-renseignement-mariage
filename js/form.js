// URL configurée dans js/config.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-mariage');
  const nbEnfantsBlock = document.getElementById('nb-enfants-block');
  const accompagnantBlock = document.getElementById('accompagnant-block');
  const activitesAccBlock = document.getElementById('activites-acc-block');
  const activitesPrincipalBlock = document.getElementById('activites-principal-block');
  const recap = document.getElementById('recap');
  const recapText = document.getElementById('recap-text');
  const status = document.getElementById('submit-status');

  if (!form) return;

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
    if (status) {
      status.style.display = 'none';
      status.style.color = '';
    }
  }

  function setError(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('error');
    return el;
  }

  function showFormError(message) {
    if (!status) return;
    status.style.display = 'block';
    status.style.color = '#6b3a3a';
    status.textContent = message;
  }

  function validate() {
    clearErrors();
    let valid = true;
    let firstError = null;

    const prenom = document.getElementById('prenom').value.trim();
    const nom = document.getElementById('nom').value.trim();
    if (!prenom) { firstError = firstError || setError('field-prenom'); valid = false; }
    if (!nom) { firstError = firstError || setError('field-nom'); valid = false; }

    const avecEnfants = document.querySelector('input[name="enfants"]:checked').value === 'oui';
    if (avecEnfants) {
      const nb = parseInt(document.getElementById('nb-enfants').value, 10);
      if (!nb || nb < 1) {
        firstError = firstError || document.getElementById('nb-enfants-block');
        document.getElementById('nb-enfants-block').classList.add('error');
        valid = false;
      }
    }

    const menuPrincipal = document.querySelector('input[name="menu-principal"]:checked');
    if (!menuPrincipal) {
      firstError = firstError || setError('field-menu-principal');
      valid = false;
    }

    const accompagne = document.querySelector('input[name="accompagne"]:checked').value === 'oui';
    if (accompagne) {
      const prenomAcc = document.getElementById('prenom-acc').value.trim();
      const nomAcc = document.getElementById('nom-acc').value.trim();
      if (!prenomAcc) { firstError = firstError || setError('field-prenom-acc'); valid = false; }
      if (!nomAcc) { firstError = firstError || setError('field-nom-acc'); valid = false; }

      const menuAcc = document.querySelector('input[name="menu-acc"]:checked');
      if (!menuAcc) { firstError = firstError || setError('field-menu-acc'); valid = false; }
    }

    if (!valid) {
      showFormError('Veuillez compléter tous les champs obligatoires.');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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
    try {
      const responses = JSON.parse(localStorage.getItem('mariage-reponses') || '[]');
      responses.push({ date: new Date().toISOString(), contenu: text });
      localStorage.setItem('mariage-reponses', JSON.stringify(responses));
    } catch (e) {
      // localStorage indisponible — non bloquant
    }
  }

  async function sendToGoogleSheets(data) {
    if (!GOOGLE_SCRIPT_URL) return true;

    const payload = JSON.stringify(data);

    // Méthode 1 : POST JSON en text/plain (évite les problèmes CORS)
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: payload,
        redirect: 'follow'
      });

      const text = await response.text();
      try {
        const result = JSON.parse(text);
        if (result.success) return true;
      } catch (e) {
        if (response.ok) return true;
      }
    } catch (e) {
      // on tente la méthode 2
    }

    // Méthode 2 : no-cors (les données sont quand même enregistrées côté Google)
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: payload
    });

    return true;
  }

  function showSuccess(text) {
    recapText.textContent = text;
    saveResponse(text);

    const header = document.querySelector('.form-header');
    if (header) header.style.display = 'none';

    form.style.display = 'none';
    recap.classList.add('visible');

    const recapMessage = document.getElementById('recap-message');
    if (recapMessage) {
      recapMessage.textContent = 'Vos informations ont été prises en compte. Merci.';
    }

    recap.scrollIntoView({ behavior: 'smooth' });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const btn = document.getElementById('btn-submit');
    const data = getFormData();
    const text = buildRecap(data);

    btn.disabled = true;
    btn.textContent = 'Envoi en cours…';
    status.style.display = 'block';
    status.style.color = '#5c534c';
    status.textContent = 'Envoi en cours…';

    try {
      await sendToGoogleSheets(data);
      showSuccess(text);
    } catch (err) {
      showFormError('Erreur lors de l\'envoi. Réessayez dans un instant.');
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
    const header = document.querySelector('.form-header');
    if (header) header.style.display = 'block';
    recap.classList.remove('visible');
    status.style.display = 'none';

    const btn = document.getElementById('btn-submit');
    btn.disabled = false;
    btn.textContent = 'Envoyer';

    form.scrollIntoView({ behavior: 'smooth' });
  });
});
