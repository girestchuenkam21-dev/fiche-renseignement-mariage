// URL configurée dans js/config.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-mariage');
  const nbEnfantsBlock = document.getElementById('nb-enfants-block');
  const accompagnantBlock = document.getElementById('accompagnant-block');
  const activitesAccBlock = document.getElementById('activites-acc-block');
  const activitesPrincipalBlock = document.getElementById('activites-principal-block');
  const recap = document.getElementById('recap');
  const recapDetails = document.getElementById('recap-details');
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
    if (status) status.style.display = 'none';
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

    if (!document.querySelector('input[name="menu-principal"]:checked')) {
      firstError = firstError || setError('field-menu-principal');
      valid = false;
    }

    const accompagne = document.querySelector('input[name="accompagne"]:checked').value === 'oui';
    if (accompagne) {
      if (!document.getElementById('prenom-acc').value.trim()) {
        firstError = firstError || setError('field-prenom-acc'); valid = false;
      }
      if (!document.getElementById('nom-acc').value.trim()) {
        firstError = firstError || setError('field-nom-acc'); valid = false;
      }
      if (!document.querySelector('input[name="menu-acc"]:checked')) {
        firstError = firstError || setError('field-menu-acc'); valid = false;
      }
    }

    if (!valid) {
      showFormError('Veuillez compléter tous les champs obligatoires.');
      if (firstError) firstError.scrollIntoView({ block: 'center' });
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

  function listOrNone(items, empty) {
    return items && items.length ? items.join(', ') : empty;
  }

  function buildRecapHTML(data) {
    const d = data;
    let html = '<div class="recap-block"><h3>Vous</h3>';
    html += `<p><span>Nom</span>${d.prenom} ${d.nom}</p>`;
    html += `<p><span>Enfants</span>${d.enfants === 'Oui' ? 'Oui (' + d.nbEnfants + ')' : 'Non'}</p>`;
    html += `<p><span>Accompagné(e)</span>${d.accompagne}</p>`;
    html += `<p><span>Activités</span>${d.activitesInteret}</p>`;
    if (d.activitesInteret === 'Oui') {
      html += `<p><span>Jeudi</span>${listOrNone(d.actJeudi, '—')}</p>`;
      html += `<p><span>Vendredi</span>${listOrNone(d.actVendredi, '—')}</p>`;
      html += `<p><span>Brunch lundi</span>${listOrNone(d.actLundi, '—')}</p>`;
    }
    html += `<p><span>Menu</span>${d.menuPrincipal}</p></div>`;

    if (d.accompagne === 'Oui') {
      html += '<div class="recap-block"><h3>Accompagnant(e)</h3>';
      html += `<p><span>Nom</span>${d.prenomAcc} ${d.nomAcc}</p>`;
      html += `<p><span>Activités</span>${d.activitesInteretAcc}</p>`;
      if (d.activitesInteretAcc === 'Oui') {
        html += `<p><span>Jeudi</span>${listOrNone(d.actJeudiAcc, '—')}</p>`;
        html += `<p><span>Vendredi</span>${listOrNone(d.actVendrediAcc, '—')}</p>`;
        html += `<p><span>Brunch lundi</span>${listOrNone(d.actLundiAcc, '—')}</p>`;
      }
      html += `<p><span>Menu</span>${d.menuAcc}</p></div>`;
    }

    return html;
  }

  function sendToGoogleSheets(data) {
    if (!GOOGLE_SCRIPT_URL) return;
    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data)
    }).catch(() => {});
  }

  function showSuccess(data) {
    sessionStorage.setItem('mariage-thanks', '1');
    recapDetails.innerHTML = buildRecapHTML(data);

    const header = document.querySelector('.form-header');
    if (header) header.style.display = 'none';

    form.style.display = 'none';
    recap.classList.add('visible');
    recap.scrollIntoView({ block: 'start' });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = getFormData();
    showSuccess(data);
    sendToGoogleSheets(data);
  });
});
