// --- Element Selection ---
const playerIPEl = document.getElementById('player-ip-count');
const playerMuneeEl = document.getElementById('player-munee-count');
const aiIPEl = document.getElementById('ai-ip-count');
const countryGridEl = document.getElementById('country-grid');
const logListEl = document.getElementById('game-log-list');
const selectionGridEl = document.getElementById('selection-grid');
const modalPlayerIPEl = document.getElementById('modal-player-ip');

const loadingScreenEl = document.getElementById('loading-screen');
const countrySelectionScreenEl = document.getElementById('country-selection-screen');
const mainGameScreenEl = document.getElementById('main-game-screen');
const mainMenuModal = document.getElementById('main-menu-modal');
const dailyBonusModal = document.getElementById('daily-bonus-modal');
const bonusTitleEl = document.getElementById('bonus-title');
const bonusMessageEl = document.getElementById('bonus-message');
const bonusDescEl = document.getElementById('bonus-description');
const bonusModalCloseBtn = document.getElementById('bonus-modal-close-btn');
const tutorialModal = document.getElementById('tutorial-modal');
const tutorialTitleEl = document.getElementById('tutorial-title');
const tutorialDescEl = document.getElementById('tutorial-description');
const tutorialNextBtn = document.getElementById('tutorial-next-btn');
const tutorialBackBtn = document.getElementById('tutorial-back-btn');
const tutorialCloseBtn = document.getElementById('tutorial-close-btn');
const tutorialOptionsEl = document.getElementById('tutorial-options');
const dontShowAgainCheckbox = document.getElementById('dont-show-again-checkbox');

const pauseBtn = document.getElementById('pause-btn');
const playBtn = document.getElementById('play-btn');
const ffwdBtn = document.getElementById('ffwd-btn');
const upgradeBtn = document.getElementById('upgrade-btn');
const shopBtn = document.getElementById('shop-btn');
const saveGameBtn = document.getElementById('save-game-btn');
const autosaveCheckbox = document.getElementById('autosave-checkbox');
const startNewGameBtn = document.getElementById('modal-start-btn');
const continueGameBtn = document.getElementById('modal-continue-btn');
const addMuneeBtn = document.getElementById('add-munee-btn');

const countryModal = document.getElementById('country-modal');
const upgradeModal = document.getElementById('upgrade-modal');
const shopModal = document.getElementById('shop-modal');
const modals = [mainMenuModal, countryModal, upgradeModal, shopModal, dailyBonusModal, tutorialModal];

// --- Game State & Variables ---
let gameState = {
  playerIP: 100,
  playerMunee: 0,
  aiIP: 100,
  playerCountry: '',
  aiCountry: '',
  aiPersonality: '',
  countries: [],
  upgrades: {},
  gameSpeed: 'pause',
  turn: 0,
  log: [],
  pinguiniaUnlocked: false,
  religionUnlocked: false,
  terrorismUnlocked: false,
  ipGenerationRate: 1,
  ipGenerationMultiplier: 1,
  influencePowerMultiplier: 1,
  aiIPGenerationMultiplier: 1,
  isAutosaveEnabled: false,
  aiLastTarget: null,
  playerLastTarget: null,
  dailyBonusCycle: 0,
  specialBonusIndex: 0,
  lastBonusDate: null,
  nationalistSurgeCountry: null,
  espionageNetworkActive: false
};

let autosaveIntervalId = null;
let currentTutorialStep = 0;
let pauseOnTabSwitch = false;

// --- Game Data ---
const TUTORIAL_STEPS = [
    {
        title: "Welcome to Global Ideology!",
        description: "Your mission is simple: achieve global domination by strategically outmanoeuvring an AI opponent and gaining 100% influence over all countries. The world is yours for the taking."
    },
    {
        title: "The Main Screen",
        description: "This is your main command screen. Here, you can monitor your resources, track the influence battle on the world grid, and see the latest events in the game log."
    },
    {
        title: "Your Resources",
        description: "Your primary resource is Influence Points (IP), which generate automatically. Use IP to influence countries and purchase upgrades. You can earn Munee (Ξ), the premium currency, to buy powerful boosts and unlock new features from the Shop."
    },
    {
        title: "The Country Grid",
        description: "The world is divided into countries, each with unique resistances. Click on any country tile to view its stats and influence it. As you gain influence, the blue bar on the tile will grow. The AI's influence is shown in red."
    },
    {
        title: "Country Resistances",
        description: "Every country has four resistance stats: Military, Economic, Diplomatic, and Ideological. To influence a country, you must spend IP against one of these resistances. The lower a country's resistance is to a specific type, the more effective your IP will be."
    },
    {
        title: "The AI Opponent",
        description: "You are not alone in this world. A strategic AI is also working to spread its ideology. The AI will constantly generate IP and attempt to influence countries, just like you. Keep an eye on its progress and adapt your strategy to counter its moves."
    },
    {
        title: "Upgrades and The Shop",
        description: "Use the Upgrade and Shop buttons to gain an advantage. The Upgrade screen allows you to spend IP on permanent bonuses. In the Shop, you can spend Munee to unlock new upgrade trees or even a new country to influence."
    }
];

const COUNTRIES_DATA = [
  { name: 'Aethelgard', military: 400, economic: 400, diplomatic: 400, ideological: 100, description: 'A sprawling federation of states with a highly diverse population and a powerful, though sometimes divided, central government. Its immense size and complex politics make it a challenging target for a single, focused influence campaign.' },
  { name: 'Guldor', military: 200, economic: 200, diplomatic: 400, ideological: 200, description: 'An ancient and influential kingdom with a rich history of trade, exploration, and cultural dominance. Though now a modern state, its diplomatic and economic power is built upon centuries of established relationships and immense wealth.' },
  { name: 'Koryn', military: 300, economic: 200, diplomatic: 200, ideological: 300, description: 'A large, resource-rich nation with a centralized, authoritarian government. It has a proud military history and is a major player on the world stage, but its rigid political structure makes it resistant to outside ideological influence.' },
  { name: 'Sinopeia', military: 300, economic: 400, diplomatic: 300, ideological: 300, description: 'A vast and ancient empire with a rapidly expanding economy and a disciplined, centrally controlled society. Its sheer scale and technological ambition make it a global powerhouse, but its resistance to foreign ideologies is unmatched.' },
  { name: 'Juche', military: 100, economic: 100, diplomatic: 100, ideological: 400, description: 'A fiercely isolated and insular nation, fortified by a rigid political doctrine and a cult of personality. Its people are largely inaccessible to outside influence, making it one of the most difficult targets to penetrate.' },
  { name: 'Bharat', military: 300, economic: 200, diplomatic: 200, ideological: 300, description: 'A colossal democracy known for its vibrant culture, massive population, and burgeoning technology sector. Its internal diversity and complex political landscape create both great strength and numerous vulnerabilities.' },
  { name: 'La Plata', military: 300, economic: 100, diplomatic: 100, ideological: 100, description: 'A country of great natural beauty and vast agricultural wealth, but with a history of political instability and economic turmoil. Its strategic location makes it a key player in its region, but it is often susceptible to economic influence.' },
  { name: 'Pannonia', military: 100, economic: 100, diplomatic: 200, ideological: 200, description: 'A landlocked European state with a proud history and a distinct cultural identity. It is a member of major diplomatic alliances, but its internal politics often put it at odds with its neighbors, making it a difficult and unpredictable target.' },
  { name: 'Helvetia', military: 100, economic: 400, diplomatic: 300, ideological: 200, description: 'A neutral and highly prosperous alpine republic. Its global financial influence is immense, and its unique political structure and fortified borders make it an extremely difficult target for any form of military or ideological influence.' },
  { name: 'Nippon', military: 300, economic: 400, diplomatic: 400, ideological: 300, description: 'An isolated island nation with a hyper-advanced economy and a highly disciplined society. While a leader in technology, its aging population and dependence on foreign resources can be exploited.' },
  { name: 'Isolde', military: 100, economic: 300, diplomatic: 200, ideological: 200, description: 'A remote island nation of fire and ice, with an active volcanic landscape and abundant geothermal energy. Its small, close-knit population is known for its cultural heritage and self-reliance, making it highly resistant to outside cultural or ideological influence.' },
  { name: 'Borealis', military: 300, economic: 300, diplomatic: 300, ideological: 300, description: 'A sprawling northern dominion rich in natural resources and defined by its vast, untamed wilderness. Its diverse population is spread across its southern border, fostering a decentralized political structure that is both tolerant and difficult to influence as a single entity.' },
  { name: 'Pinguinia', military: 500, economic: 500, diplomatic: 500, ideological: 500, description: 'A frigid polar nation nestled among colossal ice shelves and snow-swept mountains. Though its climate is harsh, its inhabitants have forged a technologically advanced and fiercely cooperative society. Pinguinia\'s strategic value lies not in its resources, which are scarce, but in its unparalleled scientific prowess and its political neutrality. It is a coveted prize for any faction, as it grants unparalleled diplomatic and technological advantages.', purchasable: true }
];

const UPGRADES_DATA = {
  ideology: [
    { name: 'Charismatic leadership', cost: 100, requires: [] },
    { name: 'Doctrinal purity', cost: 300, requires: ['Charismatic leadership'] },
    { name: 'Social engineering', cost: 500, requires: ['Doctrinal purity'] },
    { name: 'Utopia', cost: 1100, requires: ['Social engineering'] }
  ],
  military: [
    { name: 'Military Parade', cost: 100, requires: [] },
    { name: 'Cyber Operations', cost: 300, requires: ['Military Parade'] },
    { name: 'Sovereign Intervention', cost: 500, requires: ['Cyber Operations'] },
    { name: 'Bombing infrastructure', cost: 1100, requires: ['Sovereign Intervention'] }
  ],
  diplomatic: [
    { name: 'Embassy', cost: 50, requires: [] },
    { name: 'Regional Summit', cost: 250, requires: ['Embassy'] },
    { name: 'Sanctions Hammer', cost: 550, requires: ['Regional Summit'] },
    { name: 'Alliance Breaker', cost: 1100, requires: ['Sanctions Hammer'] }
  ],
  economic: [
    { name: 'Trade Deals', cost: 150, requires: [] },
    { name: 'Resource Leverage', cost: 300, requires: ['Trade Deals'] },
    { name: 'Monopolization', cost: 600, requires: ['Resource Leverage'] },
    { name: 'Government Bribe', cost: 1100, requires: ['Monopolization'] }
  ],
  religion: [
    { name: 'Word of God', cost: 100, requires: [] },
    { name: 'Church of Holy Molly', cost: 200, requires: ['Word of God'] },
    { name: 'Messiah', cost: 300, requires: ['Church of Holy Molly'] },
    { name: 'Believe!', cost: 1000, requires: ['Messiah'] }
  ],
  terrorism: [
    { name: 'Dormant cell', cost: 100, requires: [] },
    { name: 'Asset degradation', cost: 300, requires: ['Dormant cell'] },
    { name: 'Operation Cyclone', cost: 590, requires: ['Asset degradation'] },
    { name: 'Hybrid threat', cost: 1000, requires: ['Operation Cyclone'] }
  ]
};

const SHOP_ITEMS = {
  unlockables: [
    { name: 'Pinguinia Country', muneeCost: 5.00, item: 'pinguinia', unlocked: () => gameState.pinguiniaUnlocked },
    { name: 'Religion Upgrade Tree', muneeCost: 3.00, item: 'religion', unlocked: () => gameState.religionUnlocked },
    { name: 'Terrorism Upgrade Tree', muneeCost: 4.00, item: 'terrorism', unlocked: () => gameState.terrorismUnlocked }
  ],
  boosts: [
    { name: 'IP Surge (x2 IP Generation)', muneeCost: 1.50, item: 'ip_surge', duration: 30000 },
    { name: 'Double Influence (x2 Influence Power)', muneeCost: 2.50, item: 'double_influence', duration: 60000 },
  ]
};

const AI_PERSONALITIES = ['Aggressor', 'Opportunist', 'Strategist'];

const WORLD_EVENTS = [
    { name: 'Political Unrest', type: 'negative', effect: (country) => {
        country.playerInfluence *= 0.75;
        country.aiInfluence *= 0.75;
    }},
    { name: 'Natural Disaster', type: 'negative', effect: (country) => {
        const oldMil = country.military;
        const oldEco = country.economic;
        const oldDip = country.diplomatic;
        const oldIde = country.ideological;
        country.military += 100;
        country.economic += 100;
        country.diplomatic += 100;
        country.ideological -= 50;
        setTimeout(() => {
            country.military = oldMil;
            country.economic = oldEco;
            country.diplomatic = oldDip;
            country.ideological = oldIde;
        }, 30000);
    }},
    { name: 'Economic Boom', type: 'positive', effect: (country) => {
        const oldEconomicResistance = country.economic;
        country.economic = oldEconomicResistance * 0.75;
        setTimeout(() => {
            country.economic = oldEconomicResistance;
        }, 30000);
    }},
    { name: 'Alliance Formation', type: 'positive', effect: (country) => {
      country.diplomatic *= 1.5;
    }},
    { name: 'Terrorist Attack', type: 'negative', effect: (country) => {
      country.playerInfluence *= 0.5;
      country.aiInfluence *= 0.5;
      country.military += 100;
    }}
];

const DAILY_IP_BONUSES = [50, 50, 100, 100, 150, 200];

const SPECIAL_BONUSES = [
    'Intelligence Leak',
    'Espionage Network',
    'Economic Sabotage',
    'AI Counter-Influence',
    'The "Great Wall" Protocol',
    'Global Unity',
    'Super Siphon',
    'Nationalist Surge',
    'Targeted Resistance Collapse',
    'Global Perception Boost',
    'Diplomatic Coup',
    'IP Jackpot'
];

// --- Initial Setup ---
window.onload = () => {
  let progress = 0;
  const loadingInterval = setInterval(() => {
    progress += 10;
    document.getElementById("loadingProgress").style.width = progress + "%";
    if (progress >= 100) {
      clearInterval(loadingInterval);
      document.getElementById("loadingBar").style.display = "none";
      setTimeout(() => {
        openModal(mainMenuModal);
        if (localStorage.getItem('globalIdeologySave')) {
            continueGameBtn.disabled = false;
        }
      }, 500);
    }
  }, 300);
};

startNewGameBtn.addEventListener('click', () => {
  closeModal(mainMenuModal);
  if (localStorage.getItem('hasSeenTutorial')) {
      showCountrySelection();
  } else {
      startTutorial();
  }
});

continueGameBtn.addEventListener('click', () => {
    loadGame();
    closeModal(mainMenuModal);
    startGame(true);
});

addMuneeBtn.addEventListener('click', () => {
  const amount = 10;
  gameState.playerMunee += amount;
  logMessage(`You added Ξ${amount.toFixed(2)} to your account.`);
  updateUI();
});

bonusModalCloseBtn.addEventListener('click', () => {
  closeModal(dailyBonusModal);
});

tutorialNextBtn.addEventListener('click', () => {
  currentTutorialStep++;
  if (currentTutorialStep < TUTORIAL_STEPS.length) {
      updateTutorialModal();
  } else {
      endTutorial();
  }
});

tutorialBackBtn.addEventListener('click', () => {
  currentTutorialStep--;
  updateTutorialModal();
});

tutorialCloseBtn.addEventListener('click', () => {
    endTutorial(dontShowAgainCheckbox.checked);
});

function startTutorial() {
    currentTutorialStep = 0;
    updateTutorialModal();
    openModal(tutorialModal);
}

function updateTutorialModal() {
    const step = TUTORIAL_STEPS[currentTutorialStep];
    tutorialTitleEl.textContent = step.title;
    tutorialDescEl.textContent = step.description;

    tutorialBackBtn.style.display = currentTutorialStep > 0 ? 'block' : 'none';
    tutorialNextBtn.textContent = currentTutorialStep === TUTORIAL_STEPS.length - 1 ? 'Finish' : 'Next';
    tutorialOptionsEl.style.display = currentTutorialStep === TUTORIAL_STEPS.length - 1 ? 'block' : 'none';
}

function endTutorial() {
    closeModal(tutorialModal);
    localStorage.setItem('hasSeenTutorial', true);
    showCountrySelection();
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active-screen');
  });
  document.getElementById(screenId).classList.add('active-screen');
}

function showCountrySelection() {
  showScreen('country-selection-screen');
  renderCountrySelectionGrid();
}

function renderCountrySelectionGrid() {
  selectionGridEl.innerHTML = '';
  const countriesToSelect = COUNTRIES_DATA.filter(c => !c.purchasable);
  countriesToSelect.forEach(country => {
    const tile = document.createElement('div');
    tile.classList.add('country-tile');
    
    const infoBtn = document.createElement('button');
    infoBtn.classList.add('info-btn');
    infoBtn.textContent = 'i';
    infoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openCountryModal(country, true);
    });
    tile.appendChild(infoBtn);
    
    const nameEl = document.createElement('h4');
    nameEl.textContent = country.name;
    tile.appendChild(nameEl);

    tile.addEventListener('click', () => selectPlayerCountry(country.name));
    selectionGridEl.appendChild(tile);
  });
}

function selectPlayerCountry(countryName) {
  gameState.playerCountry = countryName;

  let aiCountry;
  do {
    aiCountry = COUNTRIES_DATA[Math.floor(Math.random() * COUNTRIES_DATA.length)];
  } while (aiCountry.name === gameState.playerCountry || aiCountry.purchasable);
  gameState.aiCountry = aiCountry.name;
  
  gameState.aiPersonality = AI_PERSONALITIES[Math.floor(Math.random() * AI_PERSONALITIES.length)];

  startGame();
}

function startGame(isLoadedGame = false) {
  showScreen('main-game-screen');
  
  if (!isLoadedGame) {
    gameState.countries = COUNTRIES_DATA.map(c => ({
        ...c,
        playerInfluence: c.name === gameState.playerCountry ? 100 : 0,
        aiInfluence: c.name === gameState.aiCountry ? 100 : 0,
        isNationalistSurge: false
    }));

    // Fix: Only load the default upgrade trees at the start of the game
    const initialUpgrades = ['ideology', 'military', 'diplomatic', 'economic'];
    gameState.upgrades = {};
    initialUpgrades.forEach(branch => {
        gameState.upgrades[branch] = UPGRADES_DATA[branch].map(u => ({
            ...u,
            active: false
        }));
    });

    logMessage(`Game started. You are in control of ${gameState.playerCountry}. The AI controls ${gameState.aiCountry}.`);
    logMessage(`AI personality is: ${gameState.aiPersonality}`);
  } else {
    logMessage('Game loaded successfully.');
    logMessage(`AI personality is: ${gameState.aiPersonality}`);
  }

  checkRealTimeBonus();
  updateUI();
  gameLoop();
  logMessage('Click on a country to influence it.');
}

// --- Game Logic ---
function updateUI() {
  playerIPEl.textContent = gameState.playerIP.toFixed(2);
  playerMuneeEl.textContent = gameState.playerMunee.toFixed(2);
  aiIPEl.textContent = gameState.aiIP.toFixed(2);
  // IP visibility fix
  if (modalPlayerIPEl) {
    modalPlayerIPEl.textContent = gameState.playerIP.toFixed(2);
  }
  renderCountryGrid();
  renderLog();
}

function renderCountryGrid() {
  countryGridEl.innerHTML = '';
  gameState.countries.forEach(country => {
    const tile = document.createElement('div');
    tile.classList.add('country-tile');
    tile.dataset.name = country.name;

    const isLocked = country.purchasable && !gameState.pinguiniaUnlocked;
    if (isLocked) {
      tile.classList.add('locked');
    }

    const nameEl = document.createElement('h4');
    nameEl.textContent = isLocked ? '???' : country.name;
    tile.appendChild(nameEl);

    if (!isLocked) {
        const influenceBar = document.createElement('div');
        influenceBar.classList.add('influence-bar');
        
        const playerBar = document.createElement('div');
        playerBar.classList.add('player');
        playerBar.style.width = `${country.playerInfluence}%`;
        
        const aiBar = document.createElement('div');
        aiBar.classList.add('ai');
        aiBar.style.width = `${country.aiInfluence}%`;
        
        influenceBar.appendChild(playerBar);
        influenceBar.appendChild(aiBar);
        tile.appendChild(influenceBar);
    }

    const infoBtn = document.createElement('button');
    infoBtn.classList.add('info-btn');
    infoBtn.textContent = 'i';
    infoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openCountryModal(country, true);
    });
    tile.appendChild(infoBtn);
    
    if (!isLocked) {
      tile.addEventListener('click', () => openCountryModal(country));
    } else {
        tile.addEventListener('click', () => logMessage(`${country.name} is locked. Buy it in the shop first!`));
    }
    
    countryGridEl.appendChild(tile);
  });
}

function logMessage(message) {
  gameState.log.unshift(message);
  if (gameState.log.length > 5) {
    gameState.log.pop();
  }
  renderLog();
}

function renderLog() {
  logListEl.innerHTML = '';
  gameState.log.forEach(msg => {
    const li = document.createElement('li');
    li.textContent = msg;
    logListEl.appendChild(li);
  });
}

function openModal(modal) {
  modals.forEach(m => m.style.display = 'none');
  modal.style.display = 'flex';
}

function closeModal(modal) {
  modal.style.display = 'none';
}

modals.forEach(modal => {
  modal.querySelector('.close-btn')?.addEventListener('click', () => closeModal(modal));
});

function getResistanceColor(value) {
  if (value < 200) {
    return 'lime';
  } else if (value < 400) {
    return 'yellow';
  } else {
    return 'red';
  }
}

function openCountryModal(country, isInfoOnly = false) {
  document.getElementById('country-name').textContent = country.name;
  document.getElementById('country-description').textContent = country.description;
  
  document.getElementById('stat-military').textContent = country.military;
  document.getElementById('stat-military').style.color = getResistanceColor(country.military);
  
  document.getElementById('stat-economic').textContent = country.economic;
  document.getElementById('stat-economic').style.color = getResistanceColor(country.economic);
  
  document.getElementById('stat-diplomatic').textContent = country.diplomatic;
  document.getElementById('stat-diplomatic').style.color = getResistanceColor(country.diplomatic);
  
  document.getElementById('stat-ideological').textContent = country.ideological;
  document.getElementById('stat-ideological').style.color = getResistanceColor(country.ideological);

  // IP visibility fix
  modalPlayerIPEl.textContent = gameState.playerIP.toFixed(2);
  
  const actionsContainer = document.getElementById('country-actions-container');
  const upgradeBtn = document.getElementById('upgrade-country-btn');
  
  if (isInfoOnly) {
    actionsContainer.style.display = 'none';
    upgradeBtn.style.display = 'none';
  } else {
    actionsContainer.style.display = 'block';
    upgradeBtn.style.display = country.name === gameState.playerCountry ? 'block' : 'none';
  }

  upgradeBtn.onclick = () => {
      openModal(upgradeModal);
      renderUpgrades();
  };
  
  const influenceBtns = document.querySelectorAll('#action-buttons button');
  influenceBtns.forEach(btn => {
      btn.onclick = () => influenceCountry(country.name, btn.dataset.type, parseInt(document.getElementById('ip-amount').value));
  });

  openModal(countryModal);
}

function influenceCountry(countryName, type, amount) {
    const country = gameState.countries.find(c => c.name === countryName);
    if (!country) return;

    if (countryName === gameState.playerCountry) {
        logMessage("You already fully control your starting country.");
        return;
    }

    if (amount < 40) {
        logMessage("You must spend a minimum of 40 IP to influence a country.");
        return;
    }

    let costMultiplier = 1;
    if (country.playerInfluence >= 40 && country.aiInfluence >= 40) {
        if (country.playerInfluence >= 80 || country.aiInfluence >= 80) {
            costMultiplier = 2.5;
        } else if (country.playerInfluence >= 60 || country.aiInfluence >= 60) {
            costMultiplier = 2.0;
        } else {
            costMultiplier = 1.5;
        }
        logMessage(`Contested influence detected in ${country.name}. Action cost is multiplied by ${costMultiplier}!`);
    }

    const ipCost = amount * costMultiplier * gameState.influencePowerMultiplier;

    if (gameState.playerIP < ipCost) {
        logMessage("Not enough IP to influence this country.");
        return;
    }

    gameState.playerIP -= ipCost;
    const resistance = country[type.toLowerCase()];
    const influenceGain = amount / resistance;
    
    const aiInfluenceLoss = influenceGain * 0.3;
    country.aiInfluence = Math.max(0, country.aiInfluence - aiInfluenceLoss);

    country.playerInfluence += influenceGain * 10;
    
    logMessage(`Player influenced ${country.name} with ${ipCost} IP using ${type}.`);
    gameState.playerLastTarget = country.name;
    updateUI();
    checkWinCondition();
}

function aiTurn() {
    let targetCountry = null;
    let influenceType = '';
    let amount = 0;

    const playerCountries = gameState.countries.filter(c => c.playerInfluence > c.aiInfluence && c.name !== gameState.playerCountry);
    const neutralCountries = gameState.countries.filter(c => c.playerInfluence === c.aiInfluence && c.name !== gameState.playerCountry && c.name !== gameState.aiCountry && !c.purchasable);
    
    if (gameState.espionageNetworkActive) {
    }
    
    const affectedCountry = gameState.countries.find(c => c.isAffectedByEvent);
    if (affectedCountry) {
        targetCountry = affectedCountry;
        const resistances = ['military', 'economic', 'diplomatic', 'ideological'];
        influenceType = resistances.sort((a, b) => affectedCountry[a] - affectedCountry[b])[0];
        amount = 100 + Math.random() * 60;
    } else {
        switch (gameState.aiPersonality) {
            case 'Aggressor':
                if (playerCountries.length > 0) {
                    targetCountry = playerCountries[Math.floor(Math.random() * playerCountries.length)];
                } else {
                    targetCountry = neutralCountries[Math.floor(Math.random() * neutralCountries.length)];
                }
                influenceType = ['military', 'terrorism'][Math.floor(Math.random() * 2)];
                amount = 100 + Math.random() * 60;
                break;
            case 'Opportunist':
                const allCountries = gameState.countries.filter(c => c.name !== gameState.playerCountry);
                targetCountry = allCountries.sort((a, b) => {
                    const lowestResA = Math.min(a.military, a.economic, a.diplomatic, a.ideological);
                    const lowestResB = Math.min(b.military, b.economic, b.diplomatic, b.ideological);
                    return lowestResA - lowestResB;
                })[0];
                const resistances = ['military', 'economic', 'diplomatic', 'ideological'];
                influenceType = resistances.sort((a, b) => targetCountry[a] - targetCountry[b])[0];
                amount = 40 + Math.random() * 40;
                break;
            case 'Strategist':
                const highValueTargets = gameState.countries.filter(c => c.economic > 300 && c.playerInfluence < 50 && c.aiInfluence < 50);
                if (highValueTargets.length > 0) {
                    targetCountry = highValueTargets[Math.floor(Math.random() * highValueTargets.length)];
                    influenceType = 'economic';
                } else if (neutralCountries.length > 0) {
                    targetCountry = neutralCountries[Math.floor(Math.random() * neutralCountries.length)];
                    influenceType = 'economic';
                } else {
                    targetCountry = gameState.countries.find(c => c.name === gameState.playerCountry);
                    influenceType = 'economic';
                }
                amount = 60 + Math.random() * 80;
                break;
        }
    }

    if (!targetCountry) {
        const allCountries = gameState.countries.filter(c => c.name !== gameState.playerCountry);
        targetCountry = allCountries[Math.floor(Math.random() * allCountries.length)];
        influenceType = ['military', 'economic', 'diplomatic', 'ideological'][Math.floor(Math.random() * 4)];
        amount = 40;
    }
    
    let costMultiplier = 1;
    if (targetCountry.playerInfluence >= 40 && targetCountry.aiInfluence >= 40) {
        if (targetCountry.playerInfluence >= 80 || targetCountry.aiInfluence >= 80) {
            costMultiplier = 2.5;
        } else if (targetCountry.playerInfluence >= 60 || targetCountry.aiInfluence >= 60) {
            costMultiplier = 2.0;
        } else {
            costMultiplier = 1.5;
        }
    }
    const ipCost = amount * costMultiplier * gameState.aiIPGenerationMultiplier;

    if (targetCountry.isNationalistSurge) {
        logMessage(`AI attempted to influence ${targetCountry.name}, but was blocked by the "Nationalist Surge" bonus.`);
        return;
    }
    
    amount = Math.min(ipCost, gameState.aiIP);
    if (amount >= 40) {
        gameState.aiIP -= amount;
        const resistance = targetCountry[influenceType.toLowerCase()];
        const influenceGain = amount / resistance;
        targetCountry.aiInfluence += influenceGain * 10;

        if (gameState.espionageNetworkActive) {
            logMessage(`[INTELLIGENCE LEAK] The AI is targeting ${targetCountry.name} with ${influenceType} influence.`);
        }
        
        logMessage(`AI (${gameState.aiPersonality}) influenced ${targetCountry.name} with ${amount.toFixed(2)} IP using ${influenceType}.`);
        gameState.aiLastTarget = targetCountry.name;
        updateUI();
        checkLossCondition();
    }
}


let gameInterval;
function gameLoop() {
  if (gameState.gameSpeed === 'pause') {
    return;
  }
  
  gameState.playerIP += (gameState.ipGenerationRate + (gameState.espionageNetworkActive ? 1 : 0)) * gameState.ipGenerationMultiplier;
  gameState.aiIP += gameState.ipGenerationRate * gameState.aiIPGenerationMultiplier;
  
  aiTurn();
  checkWorldEvents();
  updateUI();
  
  const interval = gameState.gameSpeed === 'play' ? 1000 : 500;
  gameInterval = setTimeout(gameLoop, interval);
}

function checkWorldEvents() {
    // Only check for a world event every 10 turns
    if (gameState.turn % 10 === 0) {
        const roll = Math.random();

        if (roll < 0.03) {
            const availableCountries = gameState.countries.filter(c => !c.purchasable && c.name !== gameState.playerCountry && c.name !== gameState.aiCountry);
            if (availableCountries.length === 0) return;

            const event = WORLD_EVENTS[Math.floor(Math.random() * WORLD_EVENTS.length)];
            const country = availableCountries[Math.floor(Math.random() * availableCountries.length)];
            
            logMessage(`[EVENT] ${event.name} has occurred in ${country.name}.`);
            event.effect(country);

            if (event.type === 'negative') {
                const countryWithSurge = gameState.countries.find(c => c.isNationalistSurge);
                if (countryWithSurge) {
                    countryWithSurge.isNationalistSurge = false;
                    logMessage(`[NATIONALIST SURGE ENDED] The negative event in ${country.name} has ended the "Nationalist Surge" bonus in ${countryWithSurge.name}.`);
                }
            }
        }
    }
}

function setGameSpeed(speed) {
  clearTimeout(gameInterval);
  gameState.gameSpeed = speed;
  if (speed !== 'pause') {
    gameLoop();
  }
  logMessage(`Game speed set to ${speed}.`);
}

function checkRealTimeBonus() {
    const today = new Date().toDateString();
    
    if (gameState.lastBonusDate === today) {
        return;
    }

    gameState.lastBonusDate = today;
    
    gameState.dailyBonusCycle++;
    
    if (gameState.dailyBonusCycle % 7 === 0) {
        const bonusName = SPECIAL_BONUSES[gameState.specialBonusIndex];
        logMessage(`[DAILY BONUS] You have received a special bonus: ${bonusName}!`);
        showDailyBonusModal(`Special Bonus: ${bonusName}!`, `You have received a special bonus: ${bonusName}!`);
        activateSpecialBonus(bonusName);
        gameState.specialBonusIndex++;
        if (gameState.specialBonusIndex >= SPECIAL_BONUSES.length) {
            gameState.specialBonusIndex = 0;
        }
    } else {
        const ipBonus = DAILY_IP_BONUSES[(gameState.dailyBonusCycle - 1) % 6];
        gameState.playerIP += ipBonus;
        logMessage(`[DAILY BONUS] You have received a ${ipBonus} IP bonus for day ${gameState.dailyBonusCycle}.`);
        showDailyBonusModal("Daily IP Bonus!", `You have received a **${ipBonus} IP** bonus.`);
    }

    saveGame();
}

function showDailyBonusModal(title, message) {
    bonusTitleEl.textContent = title;
    bonusMessageEl.innerHTML = message;
    openModal(dailyBonusModal);
}

function activateSpecialBonus(bonusName) {
    switch(bonusName) {
        case 'Intelligence Leak':
            gameState.espionageNetworkActive = true;
            break;
        case 'Espionage Network':
            gameState.ipGenerationRate += 1;
            break;
        case 'Nationalist Surge':
            const country = gameState.countries.find(c => c.name === gameState.playerCountry);
            if (country) {
                country.isNationalistSurge = true;
                gameState.nationalistSurgeCountry = country.name;
                logMessage(`"Nationalist Surge" has been applied to ${country.name}. It will last until the next negative event.`);
            }
            break;
        default:
            logMessage(`Special bonus "${bonusName}" is not yet implemented.`);
    }
}

pauseBtn.addEventListener('click', () => setGameSpeed('pause'));
playBtn.addEventListener('click', () => setGameSpeed('play'));
ffwdBtn.addEventListener('click', () => setGameSpeed('ffwd'));
upgradeBtn.addEventListener('click', () => { openModal(upgradeModal); renderUpgrades(); });
shopBtn.addEventListener('click', () => { openModal(shopModal); showShopTab('unlockables'); });

function saveGame() {
    try {
        localStorage.setItem('globalIdeologySave', JSON.stringify(gameState));
        logMessage('Game saved successfully!');
    } catch (e) {
        logMessage('Error saving game.');
        console.error(e);
    }
}

function loadGame() {
    try {
        const savedState = JSON.parse(localStorage.getItem('globalIdeologySave'));
        if (savedState) {
            gameState = savedState;
            setGameSpeed(gameState.gameSpeed);
            if (gameState.isAutosaveEnabled) {
                autosaveCheckbox.checked = true;
                startAutosaveTimer();
            }
        }
    } catch (e) {
        logMessage('Error loading game.');
        console.error(e);
    }
}

function startAutosaveTimer() {
    if (autosaveIntervalId) {
        clearInterval(autosaveIntervalId);
    }
    autosaveIntervalId = setInterval(() => {
        saveGame();
    }, 5 * 60 * 1000);
    logMessage('Autosave enabled.');
}

function stopAutosaveTimer() {
    clearInterval(autosaveIntervalId);
    autosaveIntervalId = null;
    logMessage('Autosave disabled.');
}

saveGameBtn.addEventListener('click', saveGame);
autosaveCheckbox.addEventListener('change', (e) => {
    gameState.isAutosaveEnabled = e.target.checked;
    if (gameState.isAutosaveEnabled) {
        startAutosaveTimer();
    } else {
        stopAutosaveTimer();
    }
});

function renderUpgrades() {
  const container = document.getElementById('upgrade-tree-container');
  container.innerHTML = '';
  
  for (const branch in gameState.upgrades) {
    const branchEl = document.createElement('div');
    branchEl.classList.add('upgrade-branch');
    const branchTitle = document.createElement('h3');
    branchTitle.textContent = branch.charAt(0).toUpperCase() + branch.slice(1);
    branchEl.appendChild(branchTitle);

    gameState.upgrades[branch].forEach(upgrade => {
      const upgradeEl = document.createElement('div');
      upgradeEl.classList.add('upgrade-item');
      upgradeEl.classList.add(upgrade.active ? 'active' : 'inactive');

      const upgradeName = document.createElement('p');
      upgradeName.textContent = upgrade.name;
      upgradeEl.appendChild(upgradeName);
      
      const costEl = document.createElement('span');
      costEl.textContent = `Cost: ${upgrade.cost}`;
      upgradeEl.appendChild(costEl);

      const buyBtn = document.createElement('button');
      buyBtn.textContent = 'Buy';
      buyBtn.disabled = upgrade.active || gameState.playerIP < upgrade.cost;
      buyBtn.onclick = () => buyUpgrade(branch, upgrade.name);
      upgradeEl.appendChild(buyBtn);
      
      branchEl.appendChild(upgradeEl);
    });
    container.appendChild(branchEl);
  }
}

function buyUpgrade(branch, upgradeName) {
  const upgrade = gameState.upgrades[branch].find(u => u.name === upgradeName);
  if (!upgrade || upgrade.active || gameState.playerIP < upgrade.cost) {
      logMessage(`Cannot buy ${upgradeName}.`);
      return;
  }

  const allUpgrades = Object.values(gameState.upgrades).flat();
  const requirementsMet = upgrade.requires.every(req => {
      const requiredUpgrade = allUpgrades.find(u => u.name === req);
      return requiredUpgrade && requiredUpgrade.active;
  });
  
  if (!requirementsMet) {
      logMessage(`Cannot buy ${upgradeName}. Missing requirements.`);
      return;
  }
  
  gameState.playerIP -= upgrade.cost;
  upgrade.active = true;
  logMessage(`Player activated upgrade: ${upgradeName}.`);
  updateUI();
  renderUpgrades();
}

function showShopTab(tab) {
  const shopContainer = document.getElementById('shop-container');
  shopContainer.innerHTML = '';

  const items = SHOP_ITEMS[tab];
  items.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.classList.add('shop-item');
    itemEl.innerHTML = `
      <p>${item.name}</p>
      <p>Cost: Ξ${item.muneeCost.toFixed(2)}</p>
      <button class="buy-btn" data-item="${item.item}">Buy</button>
    `;
    const buyBtn = itemEl.querySelector('.buy-btn');
    if (item.unlocked && item.unlocked()) {
        buyBtn.disabled = true;
        buyBtn.textContent = "Unlocked";
    }
    buyBtn.onclick = () => {
        if (item.item === 'ip_surge' || item.item === 'double_influence') {
            buyBoost(item.name, item.muneeCost, item.duration, item.item);
        } else {
            buyShopItem(item.item, item.muneeCost);
        }
    };
    shopContainer.appendChild(itemEl);
  });
}

function buyShopItem(item, cost) {
    if (gameState.playerMunee >= cost) {
        gameState.playerMunee -= cost;
        if (item === 'pinguinia') {
            gameState.pinguiniaUnlocked = true;
            const pinguiniaCountry = COUNTRIES_DATA.find(c => c.name === 'Pinguinia');
            if (pinguiniaCountry) {
                gameState.countries.push({ ...pinguiniaCountry, playerInfluence: 0, aiInfluence: 0 });
                logMessage('Pinguinia has been unlocked!');
            }
        } else if (item === 'religion') {
            gameState.religionUnlocked = true;
            gameState.upgrades.religion = UPGRADES_DATA.religion.map(u => ({ ...u, active: false }));
            logMessage('Religion upgrade tree has been unlocked!');
        } else if (item === 'terrorism') {
            gameState.terrorismUnlocked = true;
            gameState.upgrades.terrorism = UPGRADES_DATA.terrorism.map(u => ({ ...u, active: false }));
            logMessage('Terrorism upgrade tree has been unlocked!');
        }
    } else {
        logMessage(`Not enough Munee to buy ${item}.`);
    }
    closeModal(shopModal);
    updateUI();
}

function buyBoost(name, cost, duration, item) {
    if (gameState.playerMunee >= cost) {
        gameState.playerMunee -= cost;
        logMessage(`${name} activated!`);
        activateTemporaryBoost(item, duration);
    } else {
        logMessage(`Not enough Munee to buy ${name}.`);
    }
    closeModal(shopModal);
    updateUI();
}

function activateTemporaryBoost(item, duration) {
    let oldMultiplier;
    if (item === 'ip_surge') {
        oldMultiplier = gameState.ipGenerationMultiplier;
        gameState.ipGenerationMultiplier *= 2;
    } else if (item === 'double_influence') {
        oldMultiplier = gameState.influencePowerMultiplier;
        gameState.influencePowerMultiplier *= 2;
    }
    
    setTimeout(() => {
        if (item === 'ip_surge') {
            gameState.ipGenerationMultiplier = oldMultiplier;
        } else if (item === 'double_influence') {
            gameState.influencePowerMultiplier = oldMultiplier;
        }
        logMessage(`${item.replace('_', ' ').toUpperCase()} boost has ended.`);
    }, duration);
}

function checkWinCondition() {
    const allControlledByPlayer = gameState.countries.every(c => c.playerInfluence > c.aiInfluence && c.playerInfluence >= 100);
    if (allControlledByPlayer) {
        alert('You have won! You have influenced all countries.');
        setGameSpeed('pause');
    }
}

function checkLossCondition() {
    const playerCountry = gameState.countries.find(c => c.name === gameState.playerCountry);
    if (playerCountry && playerCountry.aiInfluence >= 100) {
        alert('You have lost! The AI has taken control of your starting country.');
        setGameSpeed('pause');
    }
}

document.querySelectorAll('#shopTabs button').forEach(button => {
    button.addEventListener('click', (e) => showShopTab(e.target.textContent.toLowerCase()));
});

document.addEventListener('visibilitychange', () => {
    if (gameState.gameSpeed !== 'pause') {
        if (document.hidden) {
            pauseOnTabSwitch = true;
            setGameSpeed('pause');
            logMessage('Game paused automatically.');
        } else {
            if (pauseOnTabSwitch) {
                setGameSpeed('play');
                logMessage('Game resumed automatically.');
                pauseOnTabSwitch = false;
            }
        }
    }
});
