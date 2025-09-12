/*
  Global Ideology - Retro strategy prototype
  - Player and AI vie for ideological support across multiple countries
  - Spend Influence Points (IP) on actions and upgrades
  - Win by achieving global majority support before the AI does
*/

(function () {
  "use strict";

  /** Utility helpers **/
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function randRange(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(randRange(min, max + 1)); }

  /** Game data **/
  const COUNTRY_DEFS = [
    { id: "usa", name: "United States", population: 331, resistance: 0.40 },
    { id: "chn", name: "China", population: 1440, resistance: 0.55 },
    { id: "ind", name: "India", population: 1390, resistance: 0.50 },
    { id: "rus", name: "Russia", population: 146, resistance: 0.48 },
    { id: "bra", name: "Brazil", population: 213, resistance: 0.42 },
    { id: "nga", name: "Nigeria", population: 206, resistance: 0.46 },
    { id: "idn", name: "Indonesia", population: 273, resistance: 0.44 },
    { id: "mex", name: "Mexico", population: 128, resistance: 0.41 },
    { id: "jpn", name: "Japan", population: 126, resistance: 0.45 },
    { id: "deu", name: "Germany", population: 83, resistance: 0.38 },
  ];

  const STARTING_STATE = () => ({
    turnNumber: 1,
    influencePoints: 6,
    baseIpPerTurn: 5,
    playerEffectiveness: 1.0,
    aiEffectiveness: 1.0,
    espionageUnlocked: false,
    revealResistances: false,
    globalResistanceFactor: 1.0,
    upgradesPurchased: {},
    countries: COUNTRY_DEFS.map(c => ({
      id: c.id,
      name: c.name,
      population: c.population,
      resistance: c.resistance,
      supportPlayer: clamp(randRange(0.20, 0.35), 0, 0.9),
      supportAI: clamp(randRange(0.20, 0.35), 0, 0.9),
    }))
  });

  const UPGRADE_DEFS = [
    { id: "ip_plus_1", name: "+1 IP / turn", desc: "Increase passive IP income.", baseCost: 6, max: 3, apply: s => s.baseIpPerTurn += 1 },
    { id: "eff_plus_20", name: "+20% Influence", desc: "Your actions are stronger.", baseCost: 8, max: 2, apply: s => s.playerEffectiveness += 0.20 },
    { id: "unlock_espionage", name: "Unlock Espionage", desc: "Sabotage AI support.", baseCost: 9, max: 1, apply: s => s.espionageUnlocked = true },
    { id: "reveal_res", name: "Reveal Resistances", desc: "Show resistance values.", baseCost: 5, max: 1, apply: s => s.revealResistances = true },
    { id: "reduce_res", name: "-10% Global Resistance", desc: "Easier to sway nations.", baseCost: 10, max: 2, apply: s => s.globalResistanceFactor = clamp(s.globalResistanceFactor - 0.10, 0.6, 1.0) },
  ];

  /** State **/
  let state = STARTING_STATE();

  /** DOM refs **/
  const el = {
    turn: document.getElementById("turn"),
    ip: document.getElementById("ip"),
    aiSupport: document.getElementById("ai-support"),
    playerSupport: document.getElementById("player-support"),
    log: document.getElementById("log"),
    countries: document.getElementById("countries"),
    countrySelect: document.getElementById("country-select"),
    upgrades: document.getElementById("upgrades"),
    endTurn: document.getElementById("end-turn"),
    reset: document.getElementById("reset-game"),
    actInfluence: document.getElementById("act-influence"),
    actPropaganda: document.getElementById("act-propaganda"),
    actEspionage: document.getElementById("act-espionage"),
    status: document.getElementById("status"),
  };

  /** Rendering **/
  function renderTopbar() {
    el.turn.textContent = String(state.turnNumber);
    el.ip.textContent = String(state.influencePoints);
    const [p, a] = computeGlobalSupport();
    el.playerSupport.textContent = `${Math.round(p * 100)}%`;
    el.aiSupport.textContent = `${Math.round(a * 100)}%`;
  }

  function createCountryRow(c) {
    const container = document.createElement("div");
    container.className = "country";

    const titleRow = document.createElement("div");
    titleRow.className = "row";
    const left = document.createElement("div");
    left.textContent = `${c.name}`;
    const right = document.createElement("div");
    right.innerHTML = `${Math.round(c.supportPlayer * 100)}% you · ${Math.round(c.supportAI * 100)}% AI`;
    titleRow.appendChild(left);
    titleRow.appendChild(right);

    const bars = document.createElement("div");
    bars.className = "bars";
    const barPlayer = document.createElement("div");
    barPlayer.className = "bar player";
    const barPlayerFill = document.createElement("span");
    barPlayerFill.style.width = `${clamp(c.supportPlayer * 100, 0, 100)}%`;
    barPlayer.appendChild(barPlayerFill);
    const barAi = document.createElement("div");
    barAi.className = "bar ai";
    const barAiFill = document.createElement("span");
    barAiFill.style.width = `${clamp(c.supportAI * 100, 0, 100)}%`;
    barAi.appendChild(barAiFill);
    bars.appendChild(barPlayer);
    bars.appendChild(barAi);

    const labels = document.createElement("div");
    labels.className = "row";
    const resLabel = document.createElement("div");
    resLabel.className = "bar-label";
    resLabel.textContent = state.revealResistances ? `Resistance ${Math.round(c.resistance * 100)}%` : `Resistance ?`;
    const popLabel = document.createElement("div");
    popLabel.className = "bar-label";
    popLabel.textContent = `Pop ${c.population}M`;
    labels.appendChild(resLabel);
    labels.appendChild(popLabel);

    container.appendChild(titleRow);
    container.appendChild(bars);
    container.appendChild(labels);

    return container;
  }

  function renderCountries() {
    el.countries.innerHTML = "";
    state.countries.forEach(c => el.countries.appendChild(createCountryRow(c)));
  }

  function renderCountrySelect() {
    el.countrySelect.innerHTML = "";
    state.countries.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      el.countrySelect.appendChild(opt);
    });
  }

  function costForAction(id) {
    if (id === "influence") return 1;
    if (id === "propaganda") return 3;
    if (id === "espionage") return 5;
    return 0;
  }

  function renderActions() {
    el.actEspionage.disabled = !state.espionageUnlocked || state.influencePoints < costForAction("espionage");
    el.actPropaganda.disabled = state.influencePoints < costForAction("propaganda");
    el.actInfluence.disabled = state.influencePoints < costForAction("influence");
  }

  function renderUpgrades() {
    el.upgrades.innerHTML = "";
    UPGRADE_DEFS.forEach(def => {
      const purchased = state.upgradesPurchased[def.id] || 0;
      if (purchased >= def.max) return; // hide when maxed
      const cost = Math.round(def.baseCost * Math.pow(1.5, purchased));
      const row = document.createElement("div");
      row.className = "upgrade";
      const info = document.createElement("div");
      info.innerHTML = `<div>${def.name}</div><div class="meta">${def.desc}</div>`;
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.textContent = `Buy (${cost} IP)`;
      btn.disabled = state.influencePoints < cost;
      btn.addEventListener("click", () => {
        if (state.influencePoints < cost) return;
        state.influencePoints -= cost;
        def.apply(state);
        state.upgradesPurchased[def.id] = purchased + 1;
        log(`Purchased upgrade: ${def.name}`, "player");
        sync();
      });
      row.appendChild(info);
      row.appendChild(btn);
      el.upgrades.appendChild(row);
    });
  }

  function sync() {
    renderTopbar();
    renderCountries();
    renderCountrySelect();
    renderActions();
    renderUpgrades();
    evaluateWinLoss();
  }

  /** Mechanics **/
  function computeGlobalSupport() {
    const totalPop = state.countries.reduce((s, c) => s + c.population, 0);
    const playerWeighted = state.countries.reduce((s, c) => s + c.population * c.supportPlayer, 0) / totalPop;
    const aiWeighted = state.countries.reduce((s, c) => s + c.population * c.supportAI, 0) / totalPop;
    return [playerWeighted, aiWeighted];
  }

  function findCountry(id) { return state.countries.find(c => c.id === id); }

  function applyShift(country, playerDelta, aiDelta) {
    // ensure supports remain within [0,1] and normalized to <= 1.6 overall pressure allowed
    country.supportPlayer = clamp(country.supportPlayer + playerDelta, 0, 1);
    country.supportAI = clamp(country.supportAI + aiDelta, 0, 1);
  }

  function effectivenessAgainst(country) {
    const res = country.resistance * state.globalResistanceFactor;
    return clamp((1.0 - res) * state.playerEffectiveness, 0.1, 2.0);
  }

  function aiEffectivenessAgainst(country) {
    const res = country.resistance * state.globalResistanceFactor;
    return clamp((1.0 - res) * state.aiEffectiveness, 0.1, 2.0);
  }

  function actInfluence(country) {
    const base = randRange(0.04, 0.08);
    const eff = effectivenessAgainst(country);
    const delta = base * eff;
    applyShift(country, delta, -delta * 0.5);
    log(`Influenced ${country.name}: +${Math.round(delta * 100)}% you`, "player");
  }

  function actPropaganda(country) {
    const base = randRange(0.08, 0.14);
    const eff = effectivenessAgainst(country) * 0.9;
    const delta = base * eff;
    applyShift(country, delta, -delta * 0.25);
    // side effect: minor spillover to neighbors (random other countries)
    const others = state.countries.filter(c => c.id !== country.id);
    for (let i = 0; i < 2; i++) {
      const spill = others[randInt(0, others.length - 1)];
      applyShift(spill, delta * 0.25, -delta * 0.10);
    }
    log(`Propaganda in ${country.name}: strong sway +${Math.round(delta * 100)}%`, "player");
  }

  function actEspionage(country) {
    if (!state.espionageUnlocked) return;
    const base = randRange(0.07, 0.12);
    const eff = effectivenessAgainst(country) * 0.8;
    const delta = base * eff;
    applyShift(country, -delta * 0.25, -delta); // mostly hurts AI
    log(`Espionage in ${country.name}: disrupted AI -${Math.round(delta * 100)}%`, "player");
  }

  function spend(cost) {
    if (state.influencePoints < cost) return false;
    state.influencePoints -= cost;
    return true;
  }

  function log(message, cls = "sys") {
    const li = document.createElement("li");
    li.className = cls;
    li.textContent = `[T${state.turnNumber}] ${message}`;
    el.log.appendChild(li);
    el.log.scrollTop = el.log.scrollHeight;
  }

  function playerAction(action) {
    const id = el.countrySelect.value;
    const country = findCountry(id);
    const cost = costForAction(action);
    if (!spend(cost)) return;
    if (action === "influence") actInfluence(country);
    else if (action === "propaganda") actPropaganda(country);
    else if (action === "espionage") actEspionage(country);
    sync();
  }

  /** AI **/
  function aiTurn() {
    const aiIp = Math.round(4 + state.turnNumber * 0.5);
    let remaining = aiIp;
    const targets = [...state.countries].sort((a, b) => (b.supportPlayer - b.supportAI) - (a.supportPlayer - a.supportAI));
    while (remaining > 0) {
      const t = targets[randInt(0, Math.min(targets.length - 1, 4))];
      const base = randRange(0.04, 0.10);
      const eff = aiEffectivenessAgainst(t);
      const delta = base * eff;
      applyShift(t, -delta * 0.4, delta);
      remaining -= 2;
      log(`AI influenced ${t.name}: +${Math.round(delta * 100)}%`, "ai");
    }
  }

  /** Turn flow **/
  function endTurn() {
    // AI acts
    aiTurn();
    // Income
    state.influencePoints += state.baseIpPerTurn;
    state.turnNumber += 1;
    log(`New turn. Gained ${state.baseIpPerTurn} IP.`, "sys");
    sync();
  }

  function evaluateWinLoss() {
    const [p, a] = computeGlobalSupport();
    if (p >= 0.6) {
      victory("You achieved global majority support.");
    } else if (a >= 0.6) {
      defeat("AI achieved global majority support.");
    } else if (state.turnNumber > 40) {
      if (p > a) victory("Time limit: you lead."); else defeat("Time limit: AI leads.");
    }
  }

  function victory(msg) {
    el.status.textContent = `Victory: ${msg}`;
    disableAll();
  }
  function defeat(msg) {
    el.status.textContent = `Defeat: ${msg}`;
    disableAll();
  }
  function disableAll() {
    [el.endTurn, el.actInfluence, el.actPropaganda, el.actEspionage].forEach(b => b.disabled = true);
  }

  function resetGame() {
    state = STARTING_STATE();
    el.log.innerHTML = "";
    el.status.textContent = "Ready.";
    log("Game initialized.", "sys");
    sync();
  }

  /** Wire up **/
  function init() {
    el.actInfluence.addEventListener("click", () => playerAction("influence"));
    el.actPropaganda.addEventListener("click", () => playerAction("propaganda"));
    el.actEspionage.addEventListener("click", () => playerAction("espionage"));
    el.endTurn.addEventListener("click", endTurn);
    el.reset.addEventListener("click", resetGame);
    resetGame();
  }

  // bootstrap
  window.addEventListener("DOMContentLoaded", init);
})();

// Game State
let gameState = {
    playerIP: 100,
    aiIP: 100,
    playerIPGenRate: 1,
    aiIPGenRate: 1,
    selectedCountry: null,
    currentUpgradeBranch: 'ideology',
    unlockedBranches: ['ideology', 'military', 'economic', 'diplomatic'],
    unlockedCountries: ['utopia', 'imperia', 'atlantis'],
    currentModalCountry: null,
    currentUpgrade: null
};

// Countries Data
const countries = {
    utopia: { name: 'UTOPIA', resistances: {}, playerInfluence: 0, aiInfluence: 0, owned: false },
    imperia: { name: 'IMPERIA', resistances: {}, playerInfluence: 0, aiInfluence: 0, owned: false },
    atlantis: { name: 'ATLANTIS', resistances: {}, playerInfluence: 0, aiInfluence: 0, owned: false },
    pinguinia: { name: 'PINGUINIA', resistances: {}, playerInfluence: 0, aiInfluence: 0, owned: false }
};

// Upgrades Data
const upgrades = {
    ideology: [
        {
            name: 'Charismatic Leadership',
            cost: 100,
            description: 'Establishes singular, unyielding ideology in your country. All resistances are up by 50.',
            purchased: false,
            requires: null,
            effects: { resistanceBonus: 50 }
        },
        {
            name: 'Doctrinal Purity',
            cost: 300,
            description: 'Establishes cult of persona, inspiring fanatical devotion to your country leader. Increases the influence effect on other countries by 20%.',
            purchased: false,
            requires: 'Charismatic Leadership',
            effects: { influenceBonus: 20 }
        },
        {
            name: 'Social Engineering',
            cost: 500,
            description: 'The state uses psychological and sociological techniques to shape the population\'s thoughts and desires from a young age. All resistances are up by 50, IP generation up by 10%.',
            purchased: false,
            requires: 'Doctrinal Purity',
            effects: { resistanceBonus: 50, ipGenBonus: 10 }
        },
        {
            name: 'Utopia',
            cost: 1100,
            description: 'Temporarily stops all influence attempts at this country, doubles IP generation, but disables influencing other countries for 1 in-game month.',
            purchased: false,
            requires: 'Social Engineering',
            effects: { specialAction: true }
        }
    ],
    military: [
        {
            name: 'Military Parade',
            cost: 100,
            description: 'Intimidates a country with a show of force, providing a 20% boost to Military influence gains.',
            purchased: false,
            requires: null,
            effects: { militaryBonus: 20 }
        },
        {
            name: 'Cyber Operations',
            cost: 100,
            description: 'Launches cyber-attacks to disrupt a country\'s defenses, reducing effect of opponents Diplomatic influence by 50% for 1 in-game month.',
            purchased: false,
            requires: 'Military Parade',
            effects: { cyberOps: true }
        },
        {
            name: 'Sovereign Intervention',
            cost: 250,
            description: 'Performs a covert military action in selected country. The suffering country throws all Economic powers to recover.',
            purchased: false,
            requires: 'Cyber Operations',
            effects: { sovereignIntervention: true }
        },
        {
            name: 'IP Stoppage',
            cost: 700,
            description: 'Stops opponents IP generation for 3 in-game weeks.',
            purchased: false,
            requires: 'Sovereign Intervention',
            effects: { specialAction: true }
        }
    ],
    economic: [
        {
            name: 'Trade Deals',
            cost: 150,
            description: 'Secures new trade deals, providing a 30% boost to Economic influence gains.',
            purchased: false,
            requires: null,
            effects: { economicBonus: 30 }
        },
        {
            name: 'Resource Leverage',
            cost: 300,
            description: 'If there are countries with lower Economic resistance partially or fully owned by the opponent, those countries stop attributing to IP generation for the opponent for 1 in-game month.',
            purchased: false,
            requires: 'Trade Deals',
            effects: { resourceLeverage: true }
        },
        {
            name: 'Monopolization',
            cost: 600,
            description: 'Takes complete control of a country\'s economy, granting a 50% boost to Economic influence gains.',
            purchased: false,
            requires: 'Resource Leverage',
            effects: { economicBonus: 50 }
        },
        {
            name: 'Government Bribe',
            cost: 1100,
            description: 'Removes 50% of opponent\'s influence in a country and adds it to yours.',
            purchased: false,
            requires: 'Monopolization',
            effects: { specialAction: true }
        }
    ],
    diplomatic: [
        {
            name: 'Embassy',
            cost: 50,
            description: 'Establishes diplomatic ties, providing a 10% boost to Diplomatic influence gains.',
            purchased: false,
            requires: null,
            effects: { diplomaticBonus: 10 }
        },
        {
            name: 'Regional Summit',
            cost: 250,
            description: 'Hosts a major summit on a remote island to further diplomatic influence, providing a 10% boost to Diplomatic influence gains and increases the targeted country\'s Diplomatic resistance by 100.',
            purchased: false,
            requires: 'Embassy',
            effects: { diplomaticBonus: 10, resistanceIncrease: 100 }
        },
        {
            name: 'Sanctions Hammer',
            cost: 550,
            description: 'Imposes import tariffs in all controlled territories. If there are territories under shared control with the opponent, those territories stop attributing towards IP generation of the opponent for 1 in-game month.',
            purchased: false,
            requires: 'Regional Summit',
            effects: { sanctionsHammer: true }
        },
        {
            name: 'Alliance Breaker',
            cost: 1100,
            description: 'A powerful diplomatic tool that allows you to influence countries fully controlled by the AI.',
            purchased: false,
            requires: 'Sanctions Hammer',
            effects: { specialAction: true }
        }
    ],
    religion: [
        {
            name: 'Word of God',
            cost: 100,
            description: 'Reduces all resistance values of a targeted country by 10%.',
            purchased: false,
            requires: null,
            effects: { resistanceReduction: 10 }
        },
        {
            name: 'Church of Holy Molly',
            cost: 200,
            description: 'Increases IP gains by 10% across all actions.',
            purchased: false,
            requires: 'Word of God',
            effects: { ipGainBonus: 10 }
        },
        {
            name: 'Messiah',
            cost: 300,
            description: 'Reduces cost of influencing other countries by 10% permanently.',
            purchased: false,
            requires: 'Church of Holy Molly',
            effects: { costReduction: 10 }
        },
        {
            name: 'Believe!',
            cost: 1000,
            description: 'A one-off action that resets the AI\'s first fully controlled country.',
            purchased: false,
            requires: 'Messiah',
            effects: { specialAction: true }
        }
    ],
    terrorism: [
        {
            name: 'Dormant Cell',
            cost: 100,
            description: 'Establishment of a sleeping terrorist cell in the selected country. During the next in-game month, the cell will carry out bombing, dropping IP points to zero.',
            purchased: false,
            requires: null,
            effects: { dormantCell: true }
        },
        {
            name: 'Asset Degradation',
            cost: 300,
            description: 'Reduces selected country\'s highest resistance by 100.',
            purchased: false,
            requires: 'Dormant Cell',
            effects: { assetDegradation: 100 }
        },
        {
            name: 'Operation Cyclone',
            cost: 590,
            description: 'Terrorist organization has been secretly funding Myjarheadin organization. For the next 3 in-game months, the side that has more IP influence over the country will be losing IP at the rate of 0.3 per in-game day.',
            purchased: false,
            requires: 'Asset Degradation',
            effects: { operationCyclone: true }
        },
        {
            name: 'Hybrid Threat',
            cost: 1000,
            description: 'Cancels all improvements in selected country for Diplomatic branch. Effects are not retrospective.',
            purchased: false,
            requires: 'Operation Cyclone',
            effects: { specialAction: true }
        }
    ]
};

// Initialize Game
function initGame() {
    generateCountryResistances();
    updateDisplay();
    startIPGeneration();
}

// Generate random resistances for countries
function generateCountryResistances() {
    const resistanceValues = [100, 200, 300, 400];
    const resistanceTypes = ['military', 'economic', 'ideology', 'diplomatic'];
    
    Object.keys(countries).forEach(countryKey => {
        const shuffledValues = [...resistanceValues].sort(() => Math.random() - 0.5);
        const shuffledTypes = [...resistanceTypes].sort(() => Math.random() - 0.5);
        
        countries[countryKey].resistances = {};
        shuffledTypes.forEach((type, index) => {
            countries[countryKey].resistances[type] = shuffledValues[index];
        });
    });
}

// Screen Management
function showCountrySelection() {
    document.getElementById('startScreen').classList.remove('active');
    document.getElementById('countrySelectionScreen').classList.add('active');
    
    // Update country cards with resistance values
    Object.keys(countries).forEach(countryKey => {
        const card = document.querySelector(`[data-country="${countryKey}"]`);
        if (card && !card.classList.contains('locked')) {
            const resistances = countries[countryKey].resistances;
            const resistanceElements = card.querySelectorAll('.resistance-value');
            const types = ['military', 'economic', 'ideology', 'diplomatic'];
            
            types.forEach((type, index) => {
                resistanceElements[index].textContent = resistances[type];
            });
        }
    });
}

function selectCountry(countryKey) {
    if (gameState.unlockedCountries.includes(countryKey)) {
        // Remove previous selection
        document.querySelectorAll('.country-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Select new country
        document.querySelector(`[data-country="${countryKey}"]`).classList.add('selected');
        gameState.selectedCountry = countryKey;
        document.getElementById('confirmSelection').disabled = false;
    }
}

function startGame() {
    if (!gameState.selectedCountry) return;
    
    document.getElementById('countrySelectionScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    
    // AI selects a random country
    const availableCountries = gameState.unlockedCountries.filter(c => c !== gameState.selectedCountry);
    const aiCountry = availableCountries[Math.floor(Math.random() * availableCountries.length)];
    
    // Set ownership
    countries[gameState.selectedCountry].owned = 'player';
    countries[aiCountry].owned = 'ai';
    
    updateCountriesList();
    updateUpgradeContent();
    initGame();
}

// IP Generation
function startIPGeneration() {
    setInterval(() => {
        gameState.playerIP += gameState.playerIPGenRate;
        gameState.aiIP += gameState.aiIPGenRate;
        updateDisplay();
    }, 1000);
}

// Display Updates
function updateDisplay() {
    document.getElementById('playerIP').textContent = Math.floor(gameState.playerIP);
    document.getElementById('aiIP').textContent = Math.floor(gameState.aiIP);
    document.getElementById('ipGenRate').textContent = gameState.playerIPGenRate;
}

function updateCountriesList() {
    const countriesList = document.getElementById('countriesList');
    countriesList.innerHTML = '';
    
    Object.keys(countries).forEach(countryKey => {
        const country = countries[countryKey];
        const countryElement = document.createElement('div');
        countryElement.className = 'country-item';
        countryElement.onclick = () => openInfluenceModal(countryKey);
        
        const totalInfluence = country.playerInfluence + country.aiInfluence;
        const playerPercentage = totalInfluence > 0 ? (country.playerInfluence / totalInfluence) * 100 : 0;
        const aiPercentage = totalInfluence > 0 ? (country.aiInfluence / totalInfluence) * 100 : 0;
        
        countryElement.innerHTML = `
            <div class="country-item-name">${country.name}</div>
            <div class="country-item-influence">
                <span>Player: ${Math.floor(country.playerInfluence)}</span>
                <span>AI: ${Math.floor(country.aiInfluence)}</span>
            </div>
            <div class="influence-bar">
                <div class="influence-fill player" style="width: ${playerPercentage}%"></div>
                <div class="influence-fill ai" style="width: ${aiPercentage}%"></div>
            </div>
            <div class="country-resistances">
                Military: ${country.resistances.military} | 
                Economic: ${country.resistances.economic} | 
                Ideology: ${country.resistances.ideology} | 
                Diplomatic: ${country.resistances.diplomatic}
            </div>
        `;
        
        countriesList.appendChild(countryElement);
    });
}

// Influence Modal
function openInfluenceModal(countryKey) {
    gameState.currentModalCountry = countryKey;
    const country = countries[countryKey];
    
    document.getElementById('modalCountryName').textContent = country.name;
    
    // Update influence display
    const totalInfluence = country.playerInfluence + country.aiInfluence;
    const playerPercentage = totalInfluence > 0 ? (country.playerInfluence / totalInfluence) * 100 : 0;
    const aiPercentage = totalInfluence > 0 ? (country.aiInfluence / totalInfluence) * 100 : 0;
    
    document.getElementById('playerInfluence').style.width = playerPercentage + '%';
    document.getElementById('aiInfluence').style.width = aiPercentage + '%';
    
    // Update resistances
    const resistanceGrid = document.getElementById('resistanceGrid');
    resistanceGrid.innerHTML = '';
    
    Object.keys(country.resistances).forEach(type => {
        const resistanceElement = document.createElement('div');
        resistanceElement.className = 'resistance-item';
        resistanceElement.innerHTML = `
            <div class="resistance-type">${type.toUpperCase()}</div>
            <div class="resistance-value">${country.resistances[type]}</div>
        `;
        resistanceGrid.appendChild(resistanceElement);
    });
    
    document.getElementById('influenceModal').classList.add('active');
}

function closeModal() {
    document.getElementById('influenceModal').classList.remove('active');
    gameState.currentModalCountry = null;
}

function investInfluence(type) {
    // Highlight selected influence type
    document.querySelectorAll('.influence-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
}

function executeInvestment() {
    const amount = parseInt(document.getElementById('investmentAmount').value);
    const type = document.querySelector('.influence-btn.active')?.dataset.type;
    
    if (!amount || !type || amount > gameState.playerIP) return;
    
    const countryKey = gameState.currentModalCountry;
    const country = countries[countryKey];
    
    // Calculate influence gain based on formula
    const playerResistance = countries[gameState.selectedCountry].resistances[type] || 100;
    const targetResistance = country.resistances[type];
    const influenceGain = (amount * playerResistance) / targetResistance;
    
    // Apply upgrades bonuses
    let bonus = 1;
    const branchUpgrades = upgrades[gameState.currentUpgradeBranch];
    branchUpgrades.forEach(upgrade => {
        if (upgrade.purchased && upgrade.effects[`${type}Bonus`]) {
            bonus += upgrade.effects[`${type}Bonus`] / 100;
        }
    });
    
    const finalInfluenceGain = influenceGain * bonus;
    
    // Deduct IP and add influence
    gameState.playerIP -= amount;
    country.playerInfluence += finalInfluenceGain;
    
    // AI response (simplified)
    if (Math.random() < 0.3) {
        const aiAmount = Math.min(amount * 0.8, gameState.aiIP);
        const aiInfluenceGain = (aiAmount * 100) / targetResistance;
        gameState.aiIP -= aiAmount;
        country.aiInfluence += aiInfluenceGain;
    }
    
    updateDisplay();
    updateCountriesList();
    openInfluenceModal(countryKey); // Refresh modal
    
    // Check for country ownership
    checkCountryOwnership(countryKey);
}

function checkCountryOwnership(countryKey) {
    const country = countries[countryKey];
    const totalInfluence = country.playerInfluence + country.aiInfluence;
    
    if (totalInfluence > 0) {
        const playerPercentage = (country.playerInfluence / totalInfluence) * 100;
        
        if (playerPercentage >= 60 && !country.owned) {
            country.owned = 'player';
            showNotification(`You have gained control of ${country.name}!`);
        } else if (playerPercentage <= 40 && country.owned === 'player') {
            country.owned = false;
            showNotification(`You have lost control of ${country.name}!`);
        }
    }
}

// Upgrade System
function updateUpgradeContent() {
    const upgradeContent = document.getElementById('upgradeContent');
    const branchUpgrades = upgrades[gameState.currentUpgradeBranch];
    
    upgradeContent.innerHTML = '';
    
    branchUpgrades.forEach((upgrade, index) => {
        const upgradeElement = document.createElement('div');
        upgradeElement.className = `upgrade-item ${upgrade.purchased ? 'purchased' : ''}`;
        
        // Check if upgrade is available
        const canPurchase = !upgrade.purchased && 
                           gameState.playerIP >= upgrade.cost &&
                           (!upgrade.requires || upgrades[gameState.currentUpgradeBranch][index - 1]?.purchased);
        
        if (!canPurchase && !upgrade.purchased) {
            upgradeElement.classList.add('locked');
        }
        
        upgradeElement.onclick = () => openUpgradeModal(upgrade, index);
        
        upgradeElement.innerHTML = `
            <div class="upgrade-name">${upgrade.name}</div>
            <div class="upgrade-cost">Cost: ${upgrade.cost} IP</div>
            <div class="upgrade-description">${upgrade.description}</div>
        `;
        
        upgradeContent.appendChild(upgradeElement);
    });
}

function openUpgradeModal(upgrade, index) {
    if (upgrade.purchased) return;
    
    gameState.currentUpgrade = { upgrade, index };
    
    document.getElementById('upgradeModalTitle').textContent = upgrade.name;
    
    const upgradeInfo = document.getElementById('upgradeInfo');
    upgradeInfo.innerHTML = `
        <div class="cost">Cost: ${upgrade.cost} IP</div>
        <p>${upgrade.description}</p>
        ${upgrade.requires ? `<div class="requirements">Requires: ${upgrade.requires}</div>` : ''}
    `;
    
    const buyBtn = document.getElementById('upgradeBuyBtn');
    const canPurchase = gameState.playerIP >= upgrade.cost &&
                       (!upgrade.requires || upgrades[gameState.currentUpgradeBranch][index - 1]?.purchased);
    
    buyBtn.disabled = !canPurchase;
    buyBtn.textContent = canPurchase ? 'PURCHASE' : 'CANNOT PURCHASE';
    
    document.getElementById('upgradeModal').classList.add('active');
}

function closeUpgradeModal() {
    document.getElementById('upgradeModal').classList.remove('active');
    gameState.currentUpgrade = null;
}

function buyUpgrade() {
    if (!gameState.currentUpgrade) return;
    
    const { upgrade, index } = gameState.currentUpgrade;
    
    if (gameState.playerIP >= upgrade.cost) {
        gameState.playerIP -= upgrade.cost;
        upgrade.purchased = true;
        
        // Apply upgrade effects
        applyUpgradeEffects(upgrade);
        
        updateDisplay();
        updateUpgradeContent();
        closeUpgradeModal();
        
        showNotification(`Purchased ${upgrade.name}!`);
    }
}

function applyUpgradeEffects(upgrade) {
    // Apply various upgrade effects
    if (upgrade.effects.resistanceBonus) {
        // Increase player country resistances
        const playerCountry = countries[gameState.selectedCountry];
        Object.keys(playerCountry.resistances).forEach(type => {
            playerCountry.resistances[type] += upgrade.effects.resistanceBonus;
        });
    }
    
    if (upgrade.effects.ipGenBonus) {
        gameState.playerIPGenRate *= (1 + upgrade.effects.ipGenBonus / 100);
    }
    
    // Add more effect applications as needed
}

// Upgrade Tab Management
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('upgrade-tab')) {
        const branch = e.target.dataset.branch;
        
        if (gameState.unlockedBranches.includes(branch)) {
            // Remove active class from all tabs
            document.querySelectorAll('.upgrade-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Add active class to clicked tab
            e.target.classList.add('active');
            
            gameState.currentUpgradeBranch = branch;
            updateUpgradeContent();
        }
    }
});

// Shop System
function buyShopItem(item) {
    let cost = 0;
    let success = false;
    
    switch (item) {
        case 'religion':
            cost = 1000;
            if (gameState.playerIP >= cost) {
                gameState.unlockedBranches.push('religion');
                success = true;
            }
            break;
        case 'terrorism':
            cost = 1000;
            if (gameState.playerIP >= cost) {
                gameState.unlockedBranches.push('terrorism');
                success = true;
            }
            break;
        case 'pinguinia':
            cost = 500;
            if (gameState.playerIP >= cost) {
                gameState.unlockedCountries.push('pinguinia');
                success = true;
            }
            break;
    }
    
    if (success) {
        gameState.playerIP -= cost;
        updateDisplay();
        updateUpgradeContent();
        showNotification(`Unlocked ${item}!`);
    }
}

// Utility Functions
function showNotification(message) {
    // Simple notification system
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.9);
        border: 2px dashed #00ff00;
        color: #00ff00;
        padding: 15px;
        border-radius: 5px;
        z-index: 3000;
        font-family: 'VT323', monospace;
        font-size: 1rem;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    updateDisplay();
});