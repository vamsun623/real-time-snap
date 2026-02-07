// Assets Mapping - 使用更穩定的直接連結 (支持 CORS)
const ASSETS = {
    bg: 'assets/cute_marvel_bg_1770129233004.png',
    victory: 'assets/victory_splash_1770129251400.png',
    defeat: 'assets/defeat_splash_1770129268179.png',
    cards: {
        '美國隊長': 'assets/card_cap_1770129287218.png',
        '索爾': 'assets/card_thor_1770129300600.png',
        '藍驚奇': 'assets/card_blue_marvel_1770129349527.png',
        'X教授': 'assets/card_profx_hover_1770129364474.png',
        '蟻人': 'assets/card_antman_1770129417751.png',
        '鋼鐵心': 'assets/card_ironheart_1770129434390.png',
        '浩克': 'assets/card_hulk_proper.png',
        '鋼鐵人': 'assets/card_ironman_proper.png'
    },
    sfx: {
        victory: 'assets/sfx/victory.mp3',
        defeat: 'assets/sfx/defeat.mp3',
        card_drop: 'assets/sfx/card_drop.mp3',
        energy_tick: 'assets/sfx/energy_tick.mp3', // 暫時延用
        start_battle: 'assets/sfx/start_battle.mp3',
        snap: 'assets/sfx/snap.mp3',
        bgm: 'assets/sfx/bgm.mp3',
        deck_select: 'assets/sfx/deck_select.mp3',
        deck_remove: 'assets/sfx/deck_remove.mp3'
    }
};

let isMuted = false;
let bgmInstance = null;

// --- 音效引擎 (Web Audio API 與 HTML5 Audio 混合) ---
const AudioEngine = {
    ctx: null,
    buffers: {},
    isLoaded: false,

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.loadAssets();
    },

    async loadAssets() {
        const loadPromises = Object.entries(ASSETS.sfx).map(async ([key, url]) => {
            try {
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
                this.buffers[key] = audioBuffer;
            } catch (e) {
                console.warn(`Failed to load sound: ${key}`, e);
            }
        });
        await Promise.all(loadPromises);
        this.isLoaded = true;
    },

    play(key, loop = false) {
        if (isMuted || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        // 特別處理 BGM
        if (key === 'bgm') {
            this.playBGM(loop);
            return;
        }

        const buffer = this.buffers[key];
        if (!buffer) {
            this.playSynthetic(key); // 備援
            return;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.ctx.destination);
        source.start(0);
    },

    playBGM(loop = true) {
        if (bgmInstance) {
            bgmInstance.stop();
            bgmInstance = null;
        }

        const buffer = this.buffers['bgm'];
        if (!buffer) return;

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = loop;
        source.connect(this.ctx.destination);
        source.start(0);
        bgmInstance = source;
    },

    stopBGM() {
        if (bgmInstance) {
            bgmInstance.stop();
            bgmInstance = null;
        }
    },

    // 備援合成音
    beep(freq = 440, duration = 0.1, type = 'sine', volume = 0.2) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    playSynthetic(key) {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        switch (key) {
            case 'energy_tick': this.beep(2500, 0.01, 'sine', 0.1); break;
            case 'card_drop':
                this.beep(60, 0.4, 'sawtooth', 0.5);
                this.beep(40, 0.5, 'sine', 0.3);
                break;
            case 'start_battle':
                this.beep(261.63, 0.1, 'square', 0.2); // C4
                setTimeout(() => this.beep(329.63, 0.1, 'square', 0.2), 100); // E4
                setTimeout(() => this.beep(392.00, 0.1, 'square', 0.2), 200); // G4
                setTimeout(() => this.beep(523.25, 0.5, 'square', 0.3), 300); // C5
                break;
            case 'snap':
                this.beep(1200, 0.05, 'triangle', 0.3);
                setTimeout(() => this.beep(800, 0.2, 'sine', 0.2), 30);
                break;
            case 'victory':
                this.beep(523.25, 0.1, 'sine', 0.2); // C5
                setTimeout(() => this.beep(659.25, 0.1, 'sine', 0.2), 120); // E5
                setTimeout(() => this.beep(783.99, 0.4, 'sine', 0.3), 240); // G5
                break;
            case 'defeat':
                this.beep(392.00, 0.2, 'sine', 0.2); // G4
                setTimeout(() => this.beep(311.13, 0.2, 'sine', 0.2), 200); // Eb4
                setTimeout(() => this.beep(261.63, 0.6, 'sine', 0.3), 400); // C4
                break;
            case 'deck_select':
                this.beep(1500, 0.05, 'sine', 0.1);
                break;
            case 'deck_remove':
                this.beep(400, 0.05, 'triangle', 0.1);
                break;
        }
    }
};

// 重寫全域播放函數以適應新引擎
function playSFX(key) {
    AudioEngine.play(key);
}

function toggleMute() {
    isMuted = !isMuted;
    if (isMuted) {
        AudioEngine.stopBGM();
    } else {
        AudioEngine.play('bgm', true);
    }
    const muteBtn = document.getElementById('mute-toggle');
    muteBtn.innerHTML = isMuted ? '🔇' : '🔊';
    muteBtn.classList.toggle('is-muted', isMuted);
}

// 核心解鎖機制：在用戶第一次點擊時呼叫
function unlockAudioContext() {
    console.info("[SFX] Unlocking audio context via user interaction...");
    AudioEngine.init();
    if (AudioEngine.ctx.state === 'suspended') AudioEngine.ctx.resume();
}

// Game State
let state = {
    timer: 50,
    isGameOver: false,
    isPaused: false,
    playerName: '匿名英雄',
    intervals: [],
    multiplier: 1, // 全域倍率 (X1, X2, X4)
    npc: {
        energy: 0,
        maxEnergy: 10,
        hand: [],
        deck: [],
        snapped: false,
        nextPlayBuff: 0,
        nextPlayDouble: false,
        zones: [
            { id: 0, cards: [], power: 0 },
            { id: 1, cards: [], power: 0 },
            { id: 2, cards: [], power: 0 }
        ]
    },
    player: {
        energy: 0,
        maxEnergy: 10,
        hand: [],
        deck: [],
        snapped: false,
        nextPlayBuff: 0,
        nextPlayDouble: false,
        zones: [
            { id: 0, cards: [], power: 0 },
            { id: 1, cards: [], power: 0 },
            { id: 2, cards: [], power: 0 }
        ]
    },
    boostEnd: 0
};

// Selectors
const timerEl = document.getElementById('timer');
const energyFillEl = document.getElementById('energy-fill');
const energyTextEl = document.getElementById('energy-text');
const npcEnergyTextEl = document.querySelector('.npc-energy-text');
const handEl = document.getElementById('hand-container');
const snapBtn = document.getElementById('snap-button');
const multiplierDisplay = document.querySelector('.snap-multiplier-display');
const playerSnapIndicator = document.getElementById('player-snap-indicator');
const npcSnapIndicator = document.getElementById('npc-snap-indicator');
const modalOverlay = document.getElementById('modal-overlay');
const tooltipLayer = document.getElementById('card-tooltip');
const pauseOverlay = document.getElementById('pause-overlay');
const pauseBtn = document.getElementById('pause-button');
const surrenderBtn = document.getElementById('surrender-button');
const resumeBtn = document.getElementById('resume-button');

// Initialization
function init() {
    // 優先從 localStorage 取得選定牌組，若無則用預設
    const playerDeckNames = getDeck('player');
    const npcDeckNames = getDeck('npc');

    state.player.deck = playerDeckNames;
    state.npc.deck = npcDeckNames;

    // 洗牌
    state.player.deck.sort(() => 0.5 - Math.random());
    state.npc.deck.sort(() => 0.5 - Math.random());

    for (let i = 0; i < 4; i++) {
        state.player.hand.push(getNextCard(state.player.deck));
        state.npc.hand.push(getNextCard(state.npc.deck));
    }
    renderHand();

    // Intervals
    state.intervals.push(setInterval(updateTimer, 1000));
    state.intervals.push(setInterval(updateEnergy, 100)); // 0.1s 頻率累積
    state.intervals.push(setInterval(npcTick, 2500));

    // UI Event Listeners
    snapBtn.addEventListener('click', activatePlayerSnap);
    pauseBtn.addEventListener('click', togglePause);
    surrenderBtn.addEventListener('click', handleSurrender);
    resumeBtn.addEventListener('click', togglePause);

    // Drag and Drop Zones
    document.querySelectorAll('.zone').forEach(zoneEl => {
        zoneEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (state.isGameOver || state.isPaused) return;
            zoneEl.classList.add('drag-over');
        });

        zoneEl.addEventListener('dragleave', () => {
            zoneEl.classList.remove('drag-over');
        });

        zoneEl.addEventListener('drop', (e) => {
            e.preventDefault();
            zoneEl.classList.remove('drag-over');
            if (state.isGameOver || state.isPaused) return;

            const handIndex = e.dataTransfer.getData('text/plain');
            if (handIndex !== "") {
                deployPlayerCard(parseInt(handIndex), parseInt(zoneEl.dataset.zoneIndex));
            }
        });
    });

    document.addEventListener('mousemove', (e) => {
        if (!tooltipLayer.classList.contains('hidden')) {
            tooltipLayer.style.left = e.pageX + 15 + 'px';
            tooltipLayer.style.top = e.pageY + 15 + 'px';
        }
    });

    // 強制比例檢查提醒 (透過 CSS 控制 720x1024)
}

function handleSurrender() {
    if (state.isGameOver || state.isPaused) return;
    if (confirm("確定要投降嗎？這將會輸掉本局，但不會記錄在勝敗榜上。")) {
        endGame(true); // true 代表跳過資料庫記錄
    }
}

//移除舊的 getRandomDeck，改用 cards.js 的 getNextCard

function togglePause() {
    if (state.isGameOver) return;
    state.isPaused = !state.isPaused;
    pauseOverlay.classList.toggle('hidden', !state.isPaused);
    // 暫停時 UI 特效
    document.body.style.filter = state.isPaused ? 'grayscale(0.5)' : 'none';
}

function updateTimer() {
    if (state.isGameOver || state.isPaused) return;
    if (state.timer <= 0) {
        endGame();
        return;
    }
    state.timer--;
    timerEl.textContent = state.timer;
}

function updateEnergy() {
    if (state.isGameOver || state.isPaused) return;

    const prevE = Math.floor(state.player.energy);
    // 能量平滑累積：每 1.25s 獲得 1 點 (0.1s 增量為 1/12.5 = 0.08)
    let increment = 0.08;

    // Quicksilver Boost
    if (Date.now() < state.boostEnd) increment *= 2;

    if (state.player.energy < state.player.maxEnergy) {
        state.player.energy = Math.min(state.player.maxEnergy, state.player.energy + increment);
    }
    if (state.npc.energy < state.npc.maxEnergy) {
        state.npc.energy = Math.min(state.npc.maxEnergy, state.npc.energy + increment);
    }

    // 偵測整數變動，觸發跳動聲
    if (Math.floor(state.player.energy) > prevE) {
        playSFX('energy_tick');
    }

    renderHUD();
    updateCardHighlights();
}

function renderHUD() {
    const pPercent = (state.player.energy / state.player.maxEnergy) * 100;
    energyFillEl.style.width = `${pPercent}%`;
    // 能量整數顯示
    const displayP = Math.floor(state.player.energy);
    energyTextEl.textContent = `能量: ${displayP} / ${state.player.maxEnergy}`;
    npcEnergyTextEl.textContent = `能量: ${Math.floor(state.npc.energy)} / ${state.npc.maxEnergy}`;
    multiplierDisplay.textContent = `X${state.multiplier}`;
}

function updateCardHighlights() {
    document.querySelectorAll('.hand-card').forEach(handCardEl => {
        const index = parseInt(handCardEl.dataset.handIndex);
        const card = state.player.hand[index];
        if (card && card.cost <= state.player.energy) {
            handCardEl.classList.add('playable');
        } else {
            handCardEl.classList.remove('playable');
        }
    });
}

function activatePlayerSnap() {
    if (state.player.snapped || state.isGameOver || state.isPaused) return;
    state.player.snapped = true;
    state.multiplier *= 2;
    state.player.energy = Math.min(state.player.energy + 3, state.player.maxEnergy);

    snapBtn.classList.add('disabled');
    playerSnapIndicator.textContent = "SNAPPED X2";
    playerSnapIndicator.style.background = "#e11d48";

    playSFX('snap'); // 播放 SNAP 音效
    renderHUD();
    updateCardHighlights();
    checkCriticalMode();
}

function renderHand() {
    handEl.innerHTML = '';
    state.player.hand.forEach((card, index) => {
        const handCardEl = document.createElement('div');
        handCardEl.className = 'hand-card';
        handCardEl.dataset.handIndex = index;
        handCardEl.draggable = true;

        handCardEl.style.zIndex = index + 10;

        const cardEl = createCardElement(card);
        handCardEl.appendChild(cardEl);

        handCardEl.addEventListener('dragstart', (e) => {
            if (state.isGameOver || state.isPaused || card.cost > state.player.energy) {
                e.preventDefault();
                return;
            }
            handCardEl.classList.add('dragging');
            e.dataTransfer.setData('text/plain', index);
            showEnergyPreview(card.cost);
        });

        handCardEl.addEventListener('dragend', () => {
            handCardEl.classList.remove('dragging');
            hideEnergyPreview();
        });

        handEl.appendChild(handCardEl);
    });
    updateCardHighlights();
}

function createCardElement(card) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    if (card.type === 'ongoing') cardEl.classList.add('ongoing-fx');

    // 套用插畫
    if (card.img) {
        cardEl.style.backgroundImage = `url('${card.img}')`;
    }

    let badge = '';
    if (card.type === 'on_reveal') badge = '<div class="ability-badge">揭</div>';
    else if (card.type === 'ongoing') badge = '<div class="ability-badge">連</div>';

    cardEl.innerHTML = `
        <div class="card-cost">${card.cost}</div>
        <div class="card-power">${card.power}</div>
        ${badge}
        <div class="card-name">${card.name}</div>
    `;

    cardEl.addEventListener('mouseenter', (e) => showTooltip(card, e));
    cardEl.addEventListener('mouseleave', hideTooltip);

    return cardEl;
}

function showTooltip(card, event = null) {
    const typeNames = { 'on_reveal': '揭示技能 (ON REVEAL)', 'ongoing': '持續技能 (ONGOING)', 'none': '基礎卡牌' };
    tooltipLayer.querySelector('.tooltip-name').textContent = card.name;
    tooltipLayer.querySelector('.tooltip-type').textContent = typeNames[card.type];
    tooltipLayer.querySelector('.tooltip-desc').textContent = card.desc || "無特殊能力";
    tooltipLayer.classList.remove('hidden');

    if (event) updateTooltipPos(event);
}

function updateTooltipPos(e) {
    const x = e.clientX + 20;
    const y = e.clientY + 20;

    // 防止超出螢幕
    const width = tooltipLayer.offsetWidth;
    const height = tooltipLayer.offsetHeight;

    let finalX = x;
    let finalY = y;

    if (x + width > window.innerWidth) finalX = e.clientX - width - 20;
    if (y + height > window.innerHeight) finalY = e.clientY - height - 20;

    tooltipLayer.style.left = `${finalX}px`;
    tooltipLayer.style.top = `${finalY}px`;
}

function hideTooltip() {
    tooltipLayer.classList.add('hidden');
}

window.addEventListener('mousemove', (e) => {
    if (!tooltipLayer.classList.contains('hidden')) {
        updateTooltipPos(e);
    }
});

function deployPlayerCard(handIndex, zoneIndex) {
    const card = state.player.hand[handIndex];
    if (!card) return;
    const currentZone = state.player.zones[zoneIndex];

    const isLocked = state.player.zones[zoneIndex].cards.some(c => c.effect === 'lock_zone') ||
        state.npc.zones[zoneIndex].cards.some(c => c.effect === 'lock_zone');

    if (state.player.energy < card.cost || currentZone.cards.length >= 4 || isLocked) return;

    // 0. 應用手牌 Buff (Forge/Shuri)
    if (state.player.nextPlayBuff) card.power += state.player.nextPlayBuff;
    if (state.player.nextPlayDouble) card.power *= 2;
    state.player.nextPlayBuff = 0;
    state.player.nextPlayDouble = false;

    // 1. 立即扣除能量並處理牌組循環
    state.player.energy -= card.cost;
    hideEnergyPreview();
    renderHUD();

    state.player.hand.splice(handIndex, 1);
    renderHand(); // 立即渲染移除後的狀態

    // 3s 延遲後補回手牌
    setTimeout(() => {
        if (state.isGameOver) return;
        state.player.deck.push(card.name);
        const newCardData = getNextCard(state.player.deck);
        if (state.player.deck_buff) newCardData.power += state.player.deck_buff;
        state.player.hand.push(newCardData);
        renderHand();
    }, 3000);

    // 2. 顯示灰階 Ghost
    const slot = document.querySelector(`#zone-${zoneIndex + 1} .player-slots`);
    const cardEl = createCardElement(card);
    cardEl.classList.add('deploying', 'ghost');
    slot.appendChild(cardEl);

    // 3. 0.6s 延遲後落地
    setTimeout(() => {
        if (state.isGameOver) return;

        triggerImpactShake();
        playSFX('card_drop');

        cardEl.classList.remove('ghost');
        cardEl.classList.add('landing');

        currentZone.cards.push(card);

        // 觸發被動 (Angela/Bishop)
        state.player.zones.forEach((z, zi) => {
            z.cards.forEach(c => {
                if (c.effect === 'play_anywhere_buff' && c !== card) c.power += 1;
                if (c.effect === 'play_here_buff' && zi === zoneIndex && c !== card) c.power += 2;
            });
        });

        if (card.type === 'on_reveal') triggerOnReveal(card, zoneIndex, 'player');

        calculatePower();
        setTimeout(() => cardEl.classList.remove('landing'), 400);
    }, 600);
}

function triggerImpactShake() {
    const container = document.getElementById('game-container');
    container.classList.remove('shake');
    void container.offsetWidth; // 強制重繪以重啟動畫
    container.classList.add('shake');
    setTimeout(() => container.classList.remove('shake'), 400);
}

// 能量預覽邏輯
function showEnergyPreview(cost) {
    const energyBar = document.getElementById('energy-bar-container');
    let preview = document.querySelector('.energy-preview');
    if (!preview) {
        preview = document.createElement('div');
        preview.className = 'energy-preview';
        energyBar.appendChild(preview);
    }

    const currentWidth = (state.player.energy / state.player.maxEnergy) * 100;
    const costWidth = (cost / state.player.maxEnergy) * 100;
    preview.style.width = `${costWidth}%`;
    preview.style.left = `${currentWidth - costWidth}%`;
    preview.classList.remove('hidden');
}

function hideEnergyPreview() {
    const preview = document.querySelector('.energy-preview');
    if (preview) preview.classList.add('hidden');
}

// NPC Logic
// NPC Logic
function npcTick() {
    if (state.isGameOver || state.isPaused) return;

    // 1. NPC SNAP 策略
    let zonesLeading = 0;
    state.npc.zones.forEach((z, i) => { if (z.power > state.player.zones[i].power) zonesLeading++; });
    if (!state.npc.snapped && zonesLeading >= 2 && state.timer < 35) {
        state.npc.snapped = true;
        state.multiplier *= 2;
        state.npc.energy = Math.min(state.npc.energy + 3, state.npc.maxEnergy);
        npcSnapIndicator.textContent = "X2";
        npcSnapIndicator.style.background = "#e11d48";
        playSFX('snap');
        renderHUD();
        checkCriticalMode();
    }

    // 2. 深度決策評估
    const playableCards = state.npc.hand
        .map((c, i) => ({ ...c, handIndex: i }))
        .filter(c => c.cost <= state.npc.energy);

    if (playableCards.length === 0) return;

    let bestAction = null;
    let maxScore = -500;

    playableCards.forEach(card => {
        [0, 1, 2].forEach(zIdx => {
            const myZone = state.npc.zones[zIdx];
            const pZone = state.player.zones[zIdx];
            const isLocked = state.player.zones[zIdx].cards.some(c => c.effect === 'lock_zone') ||
                state.npc.zones[zIdx].cards.some(c => c.effect === 'lock_zone');

            if (myZone.cards.length >= 4 || isLocked) return;

            // --- 核心評等算法 ---
            let score = card.power * 10;
            const diff = myZone.power - pZone.power;

            // 基礎戰略權重
            if (diff >= -5 && diff <= 5) score += 50; // 關鍵爭奪區
            if (diff > 15) score -= 80;               // 溢出區 (過度領先)
            if (diff < -20) score -= 40;              // 潰敗區 (難以挽回)

            // --- 40 張牌專屬邏輯 (Special logic for all 40 cards) ---

            // 1. 對手感應卡 (Reactive Cards)
            if (card.action === 'check_enemy' || ['星爵', '火箭浣熊', '格魯特', '德拔斯', '狂舞'].includes(card.name)) {
                if (pZone.cards.length > 0) score += (card.bonus || 3) * 15;
                else score -= 10; // 對手不在這，效益低
            }

            // 2. 區域加成/限制 (Zone Interaction)
            if (card.name === '納摩' || card.effect === 'solo_buff') {
                if (myZone.cards.length === 0) score += 60;
                else score -= 100; // 有隊友就廢了
            }
            if (card.name === '蟻人' || card.effect === 'antman') {
                if (myZone.cards.length >= 2) score += 30; // 預期會滿
            }
            if (card.name === '蜥蜴' || card.effect === 'full_enemy_debuff') {
                if (pZone.cards.length <= 2) score += 20;
                else score -= 40; // 對手快滿了，避開
            }
            if (card.name === '科羅德' || card.effect === 'buff_right_zone') {
                if (zIdx < 2) score += 60; // 強化右邊
                else score -= 20;
            }
            if (card.name === '驚奇先生' || card.effect === 'buff_adjacent') {
                if (zIdx === 1) score += 40; // 中間加成兩邊最大
                else score += 20;
            }

            // 3. 連攜核心 (Combo Centers)
            const hasWong = myZone.cards.some(c => c.effect === 'double_on_reveal');
            if (card.type === 'on_reveal' && hasWong) score += 50; // 在王上面打披露牌

            const hasOnslaught = myZone.cards.some(c => c.effect === 'double_other_ongoing');
            if (card.type === 'ongoing' && hasOnslaught) score += 50; // 在狂攻上面打持續牌

            if (card.name === '奧丁' || card.action === 'trigger_reveals') {
                const revealsCount = myZone.cards.filter(c => c.type === 'on_reveal').length;
                score += revealsCount * 30; // 越多披露牌越好
            }

            // 4. 全局/群體加成 (Global/Group Buffs)
            if (card.name === '藍驚奇' || card.effect === 'buff_others_global' || card.name === '譜系') {
                const myTotalCards = state.npc.zones.reduce((sum, z) => sum + z.cards.length, 0);
                score += myTotalCards * 15;
            }
            if (card.name === '凱紗拉' || card.effect === 'buff_1_cost') {
                const oneCosts = state.npc.zones.reduce((sum, z) => sum + z.cards.filter(c => c.cost === 1).length, 0);
                score += oneCosts * 20;
            }

            // 5. 特殊戰術 (Utility)
            if (card.name === 'X教授' || card.effect === 'lock_zone') {
                if (diff >= 1 && diff <= 6) score += 100; // 鎖定勝勢
                else score -= 50;
            }
            if (card.name === '蠍子' || card.action === 'debuff_enemy_hand') {
                if (state.timer > 30) score += 40; // 早期打出削弱更多
            }
            if (card.name === '勾斯魔' || card.effect === 'stop_reveals') {
                if (pZone.cards.some(c => c.type === 'on_reveal')) score += 30; // 封閉對手
            }

            // 彈性加算
            score += (card.cost * 12); // 盡量用完能量

            if (score > maxScore) {
                maxScore = score;
                bestAction = { card, zIdx };
            }
        });
    });

    // 執行決策 (反應延遲隨剩餘時間縮短)
    const prob = state.timer < 10 ? 1.0 : 0.75;
    if (bestAction && Math.random() < prob) {
        deployNPCCard(bestAction.card.handIndex, bestAction.zIdx);
    }
}

function deployNPCCard(handIndex, zoneIndex) {
    const card = state.npc.hand[handIndex];
    if (!card) return;

    // 0. 應用手牌 Buff (Forge/Shuri)
    if (state.npc.nextPlayBuff) card.power += state.npc.nextPlayBuff;
    if (state.npc.nextPlayDouble) card.power *= 2;
    state.npc.nextPlayBuff = 0;
    state.npc.nextPlayDouble = false;

    state.npc.energy -= card.cost;

    state.npc.hand.splice(handIndex, 1);

    // 3s 延遲後補回手牌
    setTimeout(() => {
        if (state.isGameOver) return;
        state.npc.deck.push(card.name);
        const newNPCItem = getNextCard(state.npc.deck);
        if (state.npc.deck_buff) newNPCItem.power += state.npc.deck_buff;
        state.npc.hand.push(newNPCItem);
    }, 3000);

    const slot = document.querySelector(`#zone-${zoneIndex + 1} .npc-slots`);
    const cardEl = createCardElement(card);
    cardEl.classList.add('deploying', 'ghost');
    slot.appendChild(cardEl);

    setTimeout(() => {
        if (state.isGameOver) return;
        triggerImpactShake();
        playSFX('card_drop');
        cardEl.classList.remove('ghost');
        cardEl.classList.add('landing');

        state.npc.zones[zoneIndex].cards.push(card);

        // 觸發被動 (Angela/Bishop)
        state.npc.zones.forEach((z, zi) => {
            z.cards.forEach(c => {
                if (c.effect === 'play_anywhere_buff' && c !== card) c.power += 1;
                if (c.effect === 'play_here_buff' && zi === zoneIndex && c !== card) c.power += 2;
            });
        });

        if (card.type === 'on_reveal') triggerOnReveal(card, zoneIndex, 'npc');
        calculatePower();

        setTimeout(() => cardEl.classList.remove('landing'), 400);
    }, 600);
}

function checkCriticalMode() {
    if (state.multiplier >= 4) {
        document.getElementById('game-container').classList.add('critical-mode');
    }
}

function triggerOnReveal(card, zoneIndex, side) {
    if (isMuted === false) {
        AudioEngine.playSynthetic('energy_tick'); // Changed to playSynthetic
    }

    const zone = state[side].zones[zoneIndex];
    const opponentSide = side === 'player' ? 'npc' : 'player';
    const oppZone = state[opponentSide].zones[zoneIndex];

    // 檢查 Cosmo 是否在場
    const hasCosmo = zone.cards.some(c => c.effect === 'stop_reveals') ||
        oppZone.cards.some(c => c.effect === 'stop_reveals');
    if (hasCosmo && card.type === 'on_reveal') return;

    // Wong 效果：再次觸發
    const hasWong = zone.cards.some(c => c.effect === 'double_on_reveal');
    let triggers = hasWong ? 2 : 1;

    for (let t = 0; t < triggers; t++) {
        switch (card.action) {
            case 'double_self':
                card.power *= 2;
                break;
            case 'buff_others_random':
                let allCards = [];
                state[side].zones.forEach(z => z.cards.forEach(c => { if (c !== card) allCards.push(c); }));
                for (let i = 0; i < 3 && allCards.length > 0; i++) {
                    const r = Math.floor(Math.random() * allCards.length);
                    allCards[r].power += 2;
                    allCards.splice(r, 1);
                }
                break;
            case 'thor_reveal':
                zone.cards.forEach(c => { if (c !== card) c.power += 2; });
                break;
            case 'trigger_reveals':
                zone.cards.forEach(c => {
                    if (c !== card && c.type === 'on_reveal') triggerOnReveal(c, zoneIndex, side);
                });
                break;
            case 'check_enemy':
                if (oppZone.cards.length > 0) card.power += (card.bonus || 3);
                break;
            case 'add_token':
                const otherZs = [0, 1, 2].filter(z => z !== zoneIndex);
                const targetZ = otherZs[Math.floor(Math.random() * otherZs.length)];
                if (state[side].zones[targetZ].cards.length < 4) {
                    state[side].zones[targetZ].cards.push({ name: '老虎', power: 8, cost: 0, type: 'none', desc: '召喚物' });
                }
                break;
            case 'debuff_enemy_hand':
                state[opponentSide].hand.forEach(c => c.power -= 1);
                break;
            case 'debuff_enemy_location':
                oppZone.cards.forEach(c => c.power -= 1);
                break;
            case 'buff_ongoing_global':
                state[side].zones.forEach(z => z.cards.forEach(c => {
                    if (c.type === 'ongoing') c.power += 2;
                }));
                break;
            case 'buff_3_cost':
                state[side].zones.forEach(z => z.cards.forEach(c => {
                    if (c.cost === 3 && c !== card) c.power += 2;
                }));
                break;
            case 'buff_deck':
                state[side].deck_buff = (state[side].deck_buff || 0) + 1;
                break;
            case 'buff_next_play':
                state[side].nextPlayBuff = 2;
                break;
            case 'double_next_play':
                state[side].nextPlayDouble = true;
                break;
            case 'energy_boost':
                state.boostEnd = Date.now() + 5000; // 5秒加速
                break;
            case 'debuff_enemy_random':
                if (oppZone.cards.length > 0) {
                    const r = Math.floor(Math.random() * oppZone.cards.length);
                    oppZone.cards[r].power += (card.bonus || -2);
                }
                break;
            case 'timed_buff':
                const startCount = zone.cards.length;
                setTimeout(() => {
                    if (zone.cards.length === startCount) {
                        card.power += 4;
                        calculatePower();
                    }
                }, 5000); // 5秒內不在此區出牌則觸發
                break;
            case 'debuff_weakest':
                if (oppZone.cards.length > 0) {
                    let weakest = oppZone.cards[0];
                    oppZone.cards.forEach(c => { if (c.power < weakest.power) weakest = c; });
                    weakest.power -= 3;
                }
                break;
        }
    }

    calculatePower();
}

function calculatePower() {
    ['player', 'npc'].forEach(side => {
        let globalBuff = 0;
        const opponent = side === 'player' ? 'npc' : 'player';

        // 1. 計算全域 Ongoing
        state[side].zones.forEach(zone => {
            zone.cards.forEach(c => {
                if (c.type === 'ongoing') {
                    if (c.effect === 'buff_others_global') globalBuff += 1;
                }
            });
        });

        state[side].zones.forEach((zone, zIdx) => {
            let currentPower = 0;
            const oppZone = state[opponent].zones[zIdx];

            // 基礎戰力 + 局部 Ongoing
            zone.cards.forEach(c => {
                let p = c.power;
                if (c.type === 'ongoing') {
                    if (c.effect === "buff_others") p += (zone.cards.length - 1);
                    if (c.effect === "antman" && zone.cards.length >= 4) p += 3;
                    if (c.effect === "solo_buff" && zone.cards.length === 1) p += 5;
                    if (c.effect === "punish_enemy") p += oppZone.cards.length;
                    if (c.effect === "hand_size_buff") p += (state[side].hand.length * 2);
                    if (c.effect === "full_enemy_debuff" && oppZone.cards.length >= 4) p -= 4;
                }

                // 套用全域 Buff
                p += globalBuff;
                if (c.cost === 1) {
                    const hasKazar = state[side].zones.some(z => z.cards.some(ca => ca.effect === 'buff_1_cost'));
                    if (hasKazar) p += 1;
                }

                // Mister Fantastic 相鄰加成
                state[side].zones.forEach((oz, oIdx) => {
                    oz.cards.forEach(oc => {
                        if (oc.effect === 'buff_adjacent' && Math.abs(oIdx - zIdx) === 1) p += 2;
                    });
                });

                currentPower += p;
            });

            // 區域型倍率
            zone.cards.forEach(c => {
                if (c.type === 'ongoing' && c.effect === "double_total") currentPower *= 2;

                // Onslaught (簡化)
                const hasOnslaught = zone.cards.some(oc => oc.effect === 'double_other_ongoing');
                if (hasOnslaught && c.type === 'ongoing' && c.effect !== 'double_other_ongoing') {
                    currentPower += 5;
                }
            });

            // Klaw
            if (zIdx > 0) {
                const leftZone = state[side].zones[zIdx - 1];
                if (leftZone.cards.some(c => c.effect === 'buff_right_zone')) currentPower += 6;
            }

            // Abomination: Reduce enemy total
            if (oppZone.cards.some(c => c.effect === 'reduce_enemy_total')) currentPower -= 3;

            zone.power = currentPower;
            state[side].zones[zIdx].power = currentPower;
        });

        // 更新 UI
        [0, 1, 2].forEach(zIdx => {
            const display = document.querySelector(`#zone-${zIdx + 1} .${side}-power-display`);
            const val = state[side].zones[zIdx].power;
            if (display.textContent != val) {
                display.classList.remove('power-pulse');
                void display.offsetWidth;
                display.classList.add('power-pulse');
            }
            display.textContent = val;
        });
    });

    [0, 1, 2].forEach(zIdx => {
        const zoneEl = document.getElementById(`zone-${zIdx + 1}`);
        const pP = state.player.zones[zIdx].power;
        const nP = state.npc.zones[zIdx].power;
        if (pP > nP) zoneEl.style.borderColor = 'var(--player-color)';
        else if (nP > pP) zoneEl.style.borderColor = 'var(--npc-color)';
        else zoneEl.style.borderColor = 'var(--glass-border)';
    });

    checkEarlyTermination();
}

function checkEarlyTermination() {
    if (state.isGameOver) return;
    let pSlot = false, nSlot = false;
    for (let i = 0; i < 3; i++) {
        const locked = state.player.zones[i].cards.some(c => c.effect === 'lock_zone') ||
            state.npc.zones[i].cards.some(c => c.effect === 'lock_zone');
        if (!locked) {
            if (state.player.zones[i].cards.length < 4) pSlot = true;
            if (state.npc.zones[i].cards.length < 4) nSlot = true;
        }
    }
    if (!pSlot && !nSlot) {
        console.info("[Game] All zones full/locked. Ending early.");
        endGame();
    }
}

function endGame(skipRecord = false) {
    state.isGameOver = true;
    state.intervals.forEach(id => clearInterval(id));
    AudioEngine.stopBGM();

    // 紀錄勝敗
    let playerZones = 0, npcZones = 0;
    state.player.zones.forEach((z, i) => {
        if (z.power > state.npc.zones[i].power) playerZones++;
        else if (z.power < state.npc.zones[i].power) npcZones++;
    });

    const isWin = skipRecord ? false : (playerZones > npcZones);
    const isDraw = skipRecord ? false : (playerZones === npcZones);
    const result = isWin ? 'win' : (isDraw ? 'draw' : 'loss');

    // 調用資料庫 (若非投降)
    if (!skipRecord) {
        Database.recordResult(state.playerName, result);
    }

    modalOverlay.classList.remove('hidden');

    // 更新戰績顯示
    const stats = Database.getLocal(state.playerName);
    const statsEl = document.getElementById('player-stats-display');
    statsEl.innerHTML = `
        <div class="stats-title">英雄：<span class="highlight">${state.playerName}</span> 的生涯戰績</div>
        <div class="stats-row">
            勝: <span class="highlight" style="color:var(--player-color)">${stats.wins}</span> | 
            敗: <span class="highlight" style="color:var(--npc-color)">${stats.losses}</span> | 
            平: <span class="highlight">${stats.draws}</span>
        </div>
        ${skipRecord ? '<div style="color:rgba(255,255,255,0.5); font-size: 0.8rem; margin-top:5px;">(本局因投降未列入統計)</div>' : ''}
    `;

    const title = document.getElementById('result-title');
    const banner = document.querySelector('.result-banner');

    if (skipRecord) {
        title.textContent = "你選擇了投降 (SURRENDER)";
        title.style.color = 'var(--npc-color)';
        banner.style.backgroundImage = `url('${ASSETS.defeat}')`;
        playSFX('defeat');
    } else if (isWin) {
        title.textContent = "戰鬥勝利 (VICTORY)";
        title.style.color = 'var(--player-color)';
        banner.style.backgroundImage = `url('${ASSETS.victory}')`;
        playSFX('victory');
    } else if (isDraw) {
        title.textContent = "平點握手 (DRAW)";
        title.style.color = 'var(--accent-gold)';
        banner.style.backgroundImage = `url('${ASSETS.bg}')`;
        playSFX('energy_tick'); // 平手播放提示音
    } else {
        title.textContent = "戰鬥失敗 (DEFEAT)";
        title.style.color = 'var(--npc-color)';
        banner.style.backgroundImage = `url('${ASSETS.defeat}')`;
        playSFX('defeat');
    }

    document.getElementById('result-text').innerHTML = skipRecord ? "你在絕望中撤退了..." : `
        攻佔區域: ${playerZones} | 敵方佔領: ${npcZones}<br>
        最終對決積分: ${playerZones * 10 * state.multiplier} (X${state.multiplier})
    `;
}

// --- 啟動按鈕邏輯 (解決音效限制) ---
const audioSupportEl = document.getElementById('audio-support');
if (window.AudioContext || window.webkitAudioContext) {
    audioSupportEl.textContent = "已就緒";
    audioSupportEl.className = "ok";
} else {
    audioSupportEl.textContent = "不支援 (請換瀏覽器)";
    audioSupportEl.className = "err";
}

document.getElementById('sound-test-btn').addEventListener('click', (e) => {
    e.preventDefault();
    unlockAudioContext();
    playSFX('energy_tick');
    alert("若沒聽到『嗶』聲，請檢查系統音量或瀏覽器分頁是否靜音。");
});

document.getElementById('start-button').addEventListener('click', () => {
    const nameInput = document.getElementById('player-name-input');
    state.playerName = nameInput.value.trim() || '匿名英雄';

    document.getElementById('start-overlay').classList.add('hidden');
    unlockAudioContext(); // 先解鎖所有音域

    // 播放開戰特效音與啟動 BGM
    playSFX('start_battle');
    AudioEngine.play('bgm', true);

    init(); // 於點擊後才初始化遊戲與計時器
});

document.getElementById('mute-toggle').addEventListener('click', toggleMute);

/* --- Deck Builder Logic --- */
let builderState = {
    activeTab: 'player',
    playerDeck: getDeck('player'),
    npcDeck: getDeck('npc')
};

function openDeckBuilder() {
    builderState.playerDeck = getDeck('player');
    builderState.npcDeck = getDeck('npc');
    renderBuilderGrid();
    document.getElementById('deck-builder-overlay').classList.remove('hidden');
}

function renderBuilderGrid() {
    const grid = document.getElementById('all-cards-grid');
    grid.innerHTML = '';
    const currentDeck = builderState.activeTab === 'player' ? builderState.playerDeck : builderState.npcDeck;

    CARD_DATA.forEach(card => {
        const item = document.createElement('div');
        item.className = 'builder-card-wrapper';

        // 使用遊戲內卡牌結構，但加上 builder 專用 class
        const cardEl = createCardElement(card);
        cardEl.classList.add('builder-card');

        // 注入勾選標籤
        const check = document.createElement('div');
        check.className = 'card-checkmark';
        check.innerHTML = '✓';
        cardEl.appendChild(check);

        if (currentDeck.includes(card.name)) {
            cardEl.classList.add(builderState.activeTab === 'player' ? 'selected' : 'selected-npc');
        }

        // 加入 Tooltip 支援
        cardEl.onmouseenter = (e) => showTooltip(card, e);
        cardEl.onmouseleave = hideTooltip;

        // 重新綁定點擊邏輯 (不影響 Tooltip)
        cardEl.onclick = (e) => {
            e.stopPropagation();
            const idx = currentDeck.indexOf(card.name);
            if (idx > -1) {
                currentDeck.splice(idx, 1);
                cardEl.classList.remove('selected', 'selected-npc');
                AudioEngine.play('deck_remove');
            } else if (currentDeck.length < 8) {
                currentDeck.push(card.name);
                cardEl.classList.add(builderState.activeTab === 'player' ? 'selected' : 'selected-npc');
                AudioEngine.play('deck_select');
            }
            document.getElementById('current-deck-count').textContent = currentDeck.length;
        };

        item.appendChild(cardEl);
        grid.appendChild(item);
    });
    document.getElementById('current-deck-count').textContent = currentDeck.length;
}

document.getElementById('deck-builder-btn').onclick = openDeckBuilder;
document.getElementById('tab-player').onclick = () => {
    builderState.activeTab = 'player';
    document.getElementById('tab-player').classList.add('active');
    document.getElementById('tab-npc').classList.remove('active');
    renderBuilderGrid();
};
document.getElementById('tab-npc').onclick = () => {
    builderState.activeTab = 'npc';
    document.getElementById('tab-npc').classList.add('active');
    document.getElementById('tab-player').classList.remove('active');
    renderBuilderGrid();
};
document.getElementById('close-builder-btn').onclick = () => {
    if (builderState.playerDeck.length === 8 && builderState.npcDeck.length === 8) {
        saveDeck('player', builderState.playerDeck);
        saveDeck('npc', builderState.npcDeck);
        document.getElementById('deck-builder-overlay').classList.add('hidden');
    } else {
        alert("請為雙方選滿 8 張牌！");
    }
};
