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