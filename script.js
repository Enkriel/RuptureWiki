// script.js
// Charge monsters.json, crée 9 sections (Tier 1..9) et affiche les cartes
// Interaction: hover / click / clavier (Enter/Space) pour retourner la carte

async function loadMonsters() {
  try {
    const res = await fetch('pokemon.json');
    if (!res.ok) throw new Error('Impossible de charger monsters.json');
    const monsters = await res.json();
    initUI(monsters);
  } catch (err) {
    console.error(err);
    document.getElementById('content').innerHTML =
      `<p style="color:#c00">Erreur: impossible de charger monsters.json (vérifie le chemin).</p>`;
  }
}

function initUI(monsters) {
  const content = document.getElementById('content');

  // Créer 9 sections (Tier 1..9)
  const sections = [];
  for (let t = 1; t <= 9; t++) {
    const section = document.createElement('section');
    section.className = 'tier-section';
    section.dataset.tier = `${t}`;

    section.innerHTML = `
      <div class="tier-header">
        <h2>Tier ${t}</h2>
        <div class="tier-note">Nombre: <span class="count">0</span></div>
      </div>
      <div class="cards-grid" aria-live="polite"></div>
      <div class="empty-note" style="display:none">Aucun Pokémon dans ce tier</div>
    `;
    content.appendChild(section);
    sections.push(section);
  }

  // Trier les pokemons par tier puis par name
  monsters.sort((a,b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    return a.name.localeCompare(b.name, 'fr', {sensitivity:'base'});
  });

  // Remplir les sections
  monsters.forEach(p => {
    const sec = sections[p.tier - 1];
    if (!sec) return; // au cas où tier hors plage
    const grid = sec.querySelector('.cards-grid');

    const card = createCard(p);
    grid.appendChild(card);
  });

  // Mettre à jour compteurs et messages empty
  sections.forEach(sec => {
    const countSpan = sec.querySelector('.count');
    const grid = sec.querySelector('.cards-grid');
    const emptyNote = sec.querySelector('.empty-note');
    const count = grid.children.length;
    countSpan.textContent = count;
    emptyNote.style.display = count === 0 ? 'block' : 'none';
  });

  // Setup filtre
  const filter = document.getElementById('tier-filter');
  filter.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'all') {
      sections.forEach(s => s.style.display = '');
    } else {
      sections.forEach(s => {
        s.style.display = (s.dataset.tier === val) ? '' : 'none';
      });
      // scroller vers la section choisie
      const target = document.querySelector(`.tier-section[data-tier="${val}"]`);
      if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
    }
  });
}

function createCard(pokemon) {
  const card = document.createElement('div');
  card.className = 'card';
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-pressed', 'false');
  card.title = pokemon.name;

  // Protéger les valeurs vides et formater les listes
  const joinOrDash = (arr) => (arr && arr.length && arr.some(x => x && x.trim() !== '')) ? arr.join(', ') : '—';

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-front">
        <img src="${pokemon.image}" alt="${pokemon.name}">
        <h3>${pokemon.name}</h3>
      </div>

      <div class="card-back">
        <h3>${pokemon.name}</h3>
        <ul class="stats">
          <li><strong>PV:</strong> ${pokemon.hp ?? '—'}</li>
          <li><strong>Difficulté:</strong> ${pokemon.difficulty ?? '—'}</li>
          <li><strong>Armure:</strong> ${pokemon.armor ?? '—'}</li>
          <li><strong>Type:</strong> ${joinOrDash(pokemon.type)}</li>
          <li><strong>Faiblesse majeure:</strong> ${joinOrDash(pokemon.major_weakness)}</li>
          <li><strong>Faiblesses:</strong> ${joinOrDash(pokemon.weakness)}</li>
          <li><strong>Résistances:</strong> ${joinOrDash(pokemon.resistance)}</li>
          <li><strong>Résistances majeures:</strong> ${joinOrDash(pokemon.major_resistance)}</li>
          <li><strong>Immunités:</strong> ${joinOrDash(pokemon.immunity)}</li>
        </ul>

        <h4>Attaques</h4>
        <ul class="attacks">
          ${ (pokemon.attacks && pokemon.attacks.length) ? pokemon.attacks.map(a => `<li>${a}</li>`).join('') : '<li>—</li>' }
        </ul>
      </div>
    </div>
  ;

  // Click -> toggle flip
  card.addEventListener('click', (ev) => {
    // si on clique sur un lien interne évite toggle (pas de liens ici pour l'instant)
    card.classList.toggle('is-flipped');
    const pressed = card.classList.contains('is-flipped');
    card.setAttribute('aria-pressed', pressed ? 'true' : 'false');
  });

  // Keyboard: Space / Enter pour flip
  card.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      card.classList.toggle('is-flipped');
      const pressed = card.classList.contains('is-flipped');
      card.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    }
    // Escape pour retourner la carte
    if (ev.key === 'Escape') {
      card.classList.remove('is-flipped');
      card.setAttribute('aria-pressed', 'false');
    }
  });

  return card;
}

document.addEventListener('DOMContentLoaded', loadMonsters);
