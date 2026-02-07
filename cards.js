const CARD_DATA = [
    { name: '美國隊長', cost: 3, power: 3, type: 'ongoing', effect: 'buff_others', desc: '在此區域的其他卡牌 +1 戰力。', img: 'assets/card_cap_1770129287218.png' },
    { name: '鋼鐵人', cost: 5, power: 0, type: 'ongoing', effect: 'double_total', desc: '此區域的總戰力翻倍。', img: 'assets/card_ironman_proper.png' },
    { name: '浩克', cost: 6, power: 12, type: 'none', desc: '無特殊能力，但戰力驚人。', img: 'assets/card_hulk_proper.png' },
    { name: '蟻人', cost: 1, power: 1, type: 'ongoing', effect: 'antman', desc: '若此區域已滿，戰力 +3。', img: 'assets/card_antman_1770129417751.png' },
    { name: '索爾', cost: 3, power: 4, type: 'on_reveal', action: 'thor_reveal', desc: '揭示：使此區域所有其他我方卡牌 +2 戰力。', img: 'assets/card_thor_1770129300600.png' },
    { name: '藍驚奇', cost: 5, power: 3, type: 'ongoing', effect: 'buff_others_global', desc: '全場所有其他我方卡牌 +1 戰力。', img: 'assets/card_blue_marvel_1770129349527.png' },
    { name: 'X教授', cost: 5, power: 3, type: 'ongoing', effect: 'lock_zone', desc: '持續：鎖定此區域，雙方都不能再放置卡牌。', img: 'assets/card_profx_hover_1770129364474.png' },
    { name: '鋼鐵心', cost: 3, power: 0, type: 'on_reveal', action: 'buff_others_random', desc: '揭示：為場上其他隨機 3 張我方卡牌 +2 戰力。', img: 'assets/card_ironheart_1770129434390.png' },
    { name: '奧丁', cost: 6, power: 8, type: 'on_reveal', action: 'trigger_reveals', desc: '揭示：重新觸發此區域所有其他我方揭示效果。', img: 'assets/card_odin.png' },
    { name: '黑豹', cost: 5, power: 4, type: 'on_reveal', action: 'double_self', desc: '揭示：自身戰力翻倍。', img: 'assets/card_panther.png' },
    { name: '納摩', cost: 4, power: 6, type: 'ongoing', effect: 'solo_buff', desc: '持續：若你在此區域只有一張牌，戰力 +5。', img: 'assets/card_namor.png' },
    { name: '凱紗拉', cost: 4, power: 4, type: 'ongoing', effect: 'buff_1_cost', desc: '持續：你全場 1 費卡牌戰力 +1。', img: 'assets/card_kazar.png' },
    { name: '懲罰者', cost: 3, power: 2, type: 'ongoing', effect: 'punish_enemy', desc: '持續：此區域對手每有一張牌，戰力 +1。', img: 'assets/card_punisher.png' },
    { name: '惡魔恐龍', cost: 5, power: 3, type: 'ongoing', effect: 'hand_size_buff', desc: '持續：手牌中每有一張牌，戰力 +2。', img: 'assets/card_dino.png' },
    { name: '科羅德', cost: 5, power: 4, type: 'ongoing', effect: 'buff_right_zone', desc: '持續：右側區域戰力 +6。', img: 'assets/card_klaw.png' },
    { name: '星爵', cost: 2, power: 2, type: 'on_reveal', action: 'check_enemy', bonus: 3, desc: '揭示：若此區域已有對手卡牌，戰力 +3。', img: 'assets/card_starlord.png' },
    { name: '火箭浣熊', cost: 1, power: 1, type: 'on_reveal', action: 'check_enemy', bonus: 2, desc: '揭示：若此區域已有對手卡牌，戰力 +2。', img: 'assets/card_rocket.png' },
    { name: '格魯特', cost: 3, power: 3, type: 'on_reveal', action: 'check_enemy', bonus: 4, desc: '揭示：若此區域已有對手卡牌，戰力 +4。', img: 'assets/card_groot.png' },
    { name: '德拔斯', cost: 4, power: 4, type: 'on_reveal', action: 'check_enemy', bonus: 5, desc: '揭示：若此區域已有對手卡牌，戰力 +5。', img: 'assets/card_drax.png' },
    { name: '狂舞', cost: 5, power: 7, type: 'on_reveal', action: 'check_enemy', bonus: 6, desc: '揭示：若此區域已有對手卡牌，戰力 +6。', img: 'assets/card_gamora.png' },
    { name: '白虎', cost: 5, power: 1, type: 'on_reveal', action: 'add_token', token: 'Tiger', tokenPower: 8, desc: '揭示：在另一區域增加一隻 8 點戰力的老虎。', img: 'assets/card_whitetiger.png' },
    { name: '安吉拉', cost: 2, power: 0, type: 'passive', effect: 'play_here_buff', desc: '被動：你在這裡每打出一張牌，此牌戰力 +2。', img: 'assets/card_angela.png' },
    { name: '畢夏普', cost: 3, power: 1, type: 'passive', effect: 'play_anywhere_buff', desc: '被動：你每打出一張牌，此牌戰力 +1。', img: 'assets/card_bishop.png' },
    { name: '銀色衝浪手', cost: 3, power: 2, type: 'on_reveal', action: 'buff_3_cost', desc: '揭示：你全場的其他 3 費卡牌戰力 +2。', img: 'assets/card_surfer.png' },
    { name: '蠍子', cost: 2, power: 2, type: 'on_reveal', action: 'debuff_enemy_hand', desc: '揭示：對手手牌中所有卡牌戰力 -1。', img: 'assets/card_scorpion.png' },
    { name: '奧考耶', cost: 2, power: 2, type: 'on_reveal', action: 'buff_deck', desc: '揭示：你牌組中所有卡牌戰力 +1。', img: 'assets/card_okoye.png' },
    { name: '福吉', cost: 2, power: 1, type: 'on_reveal', action: 'buff_next_play', desc: '揭示：你的下一張牌戰力 +2。', img: 'assets/card_forge.png' },
    { name: '舒莉', cost: 4, power: 1, type: 'on_reveal', action: 'double_next_play', desc: '揭示：你的下一張牌戰力翻倍。', img: 'assets/card_shuri.png' },
    { name: '王', cost: 4, power: 2, type: 'ongoing', effect: 'double_on_reveal', desc: '持續：此區域的揭示效果會觸發兩次。', img: 'assets/card_wong.png' },
    { name: '蜘蛛女', cost: 5, power: 7, type: 'on_reveal', action: 'debuff_enemy_location', desc: '揭示：此區域對手所有卡牌戰力 -1。', img: 'assets/card_spiderwoman.png' },
    { name: '憎恨', cost: 5, power: 9, type: 'ongoing', effect: 'reduce_enemy_total', desc: '持續：此區域對手的總戰力 -3。', img: 'assets/card_abomination.png' },
    { name: '獨眼龍', cost: 3, power: 4, type: 'on_reveal', action: 'debuff_weakest', desc: '揭示：使此區域戰力最低的一張對手卡牌 -3 戰力。', img: 'assets/card_cyclops.png' },
    { name: '石頭人', cost: 4, power: 6, type: 'on_reveal', action: 'debuff_enemy_location', bonus: -1, desc: '揭示：使此區域所有對手卡牌戰力 -1。', img: 'assets/card_thing.png' },
    { name: '快銀', cost: 1, power: 2, type: 'on_reveal', action: 'energy_boost', desc: '揭示：接下來的 5 秒內能量累積速度翻倍。', img: 'assets/card_quicksilver.png' },
    { name: '潔西卡·瓊斯', cost: 4, power: 4, type: 'on_reveal', action: 'timed_buff', desc: '揭示：若下回合你在這裡不出牌，戰力 +4。', img: 'assets/card_jessica.png' },
    { name: '蜥蜴', cost: 2, power: 5, type: 'ongoing', effect: 'full_enemy_debuff', desc: '持續：若對手在此區域滿員，戰力 -4。', img: 'assets/card_lizard.png' },
    { name: '驚奇先生', cost: 3, power: 2, type: 'ongoing', effect: 'buff_adjacent', desc: '持續：相鄰區域戰力 +2性能。', img: 'assets/card_fantastic.png' },
    { name: '譜系', cost: 6, power: 5, type: 'on_reveal', action: 'buff_ongoing_global', desc: '揭示：你全場所有持續能力卡牌戰力 +2。', img: 'assets/card_spectrum.png' },
    { name: '狂攻', cost: 6, power: 7, type: 'ongoing', effect: 'double_other_ongoing', desc: '持續：翻倍此區域其他持續能力效果。', img: 'assets/card_onslaught.png' },
    { name: '勾斯魔', cost: 3, power: 3, type: 'ongoing', effect: 'stop_reveals', desc: '持續：此區域無法觸發揭示效果。', img: 'assets/card_cosmo.png' }
];

// 初始化全域牌組資料
const DEFAULT_DECK = ["美國隊長", "鋼鐵人", "浩克", "蟻人", "索爾", "藍驚奇", "X教授", "鋼鐵心"];

function getDeck(owner = 'player') {
    const saved = localStorage.getItem(`deck_${owner}`);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.warn("Failed to parse saved deck", e);
        }
    }
    return [...DEFAULT_DECK];
}

function saveDeck(owner, cardNames) {
    localStorage.setItem(`deck_${owner}`, JSON.stringify(cardNames));
}

function getCardByName(name) {
    const card = CARD_DATA.find(c => c.name === name);
    return card ? { ...card } : { ...CARD_DATA[0] };
}

function getNextCard(deck) {
    if (deck.length === 0) return null;
    const cardName = deck.shift();
    return getCardByName(cardName);
}
