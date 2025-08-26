// script.js - Version corrigée
// Charge pokemon.json, crée 9 sections (Tier 1..9) et affiche les cartes
// Interaction: hover / click / clavier (Enter/Space) pour retourner la carte

async function loadMonsters() {
  try {
    // CORRECTION 1: Gestion d'erreur améliorée
    const res = await fetch('pokemon.json');
    if (!res.ok) {
      throw new Error(`Erreur HTTP: ${res.status}`);
    }
    
    const monsters = await res.json();
    
    // CORRECTION 2: Validation des données
    if (!Array.isArray(monsters)) {
      throw new Error('Le fichier JSON doit contenir un tableau');
    }
    
    initUI(monsters);
  } catch (err) {
    console.error('Erreur de chargement:', err);
    showError(`Impossible de charger pokemon.json: ${err.message}`);
  }
}

function showError(message) {
  const content = document.getElementById('content');
  content.innerHTML = `<div class="error-message">${message}</div>`;
}

function initUI(monsters) {
  const content = document.getElementById('content');
  content.innerHTML = ''; // Nettoyer le contenu

  // CORRECTION 3: Cache des sections pour améliorer les performances
  const sectionsMap = new Map();
  
  // Créer 9 sections (Tier 1..9)
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
    sectionsMap.set(t, section);
  }

  // CORRECTION 4: Validation et nettoyage des données
  const validMonsters = monsters.filter(p => {
    if (!p.name || !p.tier || p.tier < 1 || p.tier > 9) {
      console.warn('Pokémon invalide ignoré:', p);
      return false;
    }
    return true;
  });

  // Trier les pokémons par tier puis par nom
  validMonsters.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    return a.name.localeCompare(b.name, 'fr', {sensitivity: 'base'});
  });

  // Remplir les sections
  validMonsters.forEach(p => {
    const section = sectionsMap.get(p.tier);
    if (section) {
      const grid = section.querySelector('.cards-grid');
      const card = createCard(p);
      grid.appendChild(card);
    }
  });

  // Mettre à jour compteurs et messages vides
  sectionsMap.forEach(section => {
    const countSpan = section.querySelector('.count');
    const grid = section.querySelector('.cards-grid');
    const emptyNote = section.querySelector('.empty-note');
    const count = grid.children.length;
    
    countSpan.textContent = count;
    emptyNote.style.display = count === 0 ? 'block' : 'none';
  });

  // CORRECTION 5: Setup filtre optimisé
  setupFilter(sectionsMap);
}

function setupFilter(sectionsMap) {
  const filter = document.getElementById('tier-filter');
  if (!filter) return; // Sécurité au cas où l'élément n'existe pas
  
  filter.addEventListener('change', (e) => {
    const val = e.target.value;
    
    if (val === 'all') {
      sectionsMap.forEach(section => {
        section.style.display = '';
      });
    } else {
      const tierNum = parseInt(val);
      sectionsMap.forEach((section, tier) => {
        section.style.display = (tier === tierNum) ? '' : 'none';
      });
      
      // Scroll vers la section choisie
      const targetSection = sectionsMap.get(tierNum);
      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: 'smooth', 
          block: 'start'
        });
      }
    }
  });
}

function createCard(pokemon) {
  const card = document.createElement('div');
  card.className = 'card';
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-pressed', 'false');
  card.title = `${pokemon.name} - Cliquer pour voir les détails`;

  // CORRECTION 6: Fonction améliorée pour gérer les tableaux
  const joinOrDash = (arr) => {
    if (!arr || !Array.isArray(arr)) return '—';
    const filtered = arr.filter(x => x && typeof x === 'string' && x.trim() !== '');
    return filtered.length > 0 ? filtered.join(', ') : '—';
  };

  // CORRECTION 7: Gestion d'images cassées
  const imageUrl = pokemon.image || 'https://via.placeholder.com/120x120?text=?';

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-front">
        <img src="${imageUrl}" alt="${pokemon.name}" onerror="this.src='https://via.placeholder.com/120x120?text=?'">
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
          ${(pokemon.attacks && pokemon.attacks.length) 
            ? pokemon.attacks.map(a => `<li>${a}</li>`).join('') 
            : '<li>—</li>'
          }
        </ul>
      </div>
    </div>
  `;

  // CORRECTION 8: Gestion d'événements optimisée
  const toggleFlip = () => {
    card.classList.toggle('is-flipped');
    const pressed = card.classList.contains('is-flipped');
    card.setAttribute('aria-pressed', pressed ? 'true' : 'false');
  };

  card.addEventListener('click', toggleFlip);

  card.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      toggleFlip();
    }
    if (ev.key === 'Escape') {
      card.classList.remove('is-flipped');
      card.setAttribute('aria-pressed', 'false');
    }
  });

  return card;
}

// Initialisation
document.addEventListener('DOMContentLoaded', loadMonsters);