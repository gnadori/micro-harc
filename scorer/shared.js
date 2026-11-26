// micro:harc Scorer – közös állapot, szinkronizáció, hangok és vicces elemek
const STORAGE_KEY = "microharc_scorer_state_v1";
const CHANNEL_NAME = "microharc_scorer_channel_v1";

const FUNNY_NAMES = [
  "9V-os Rémség",
  "Bádog Pista",
  "Turbo Krumpli",
  "Dr. Rövidzárlat",
  "Csavarhúzó 3000",
  "Kenyérpirító",
  "Laza Csavar",
  "Kétbalkezes Dózer",
  "Koffeinmentes Zúzó",
  "Porszívó Bosszúja",
  "Mágneses Majom",
  "Szigetelőszalag Király",
  "Gumiabroncs Gábor",
  "Bum-Bum Béla",
  "Nano Terminátor",
  "Zúgó Zoltán",
  "Micro-Pöröly",
  "Csúszós Csiga",
  "Plasztik Párduc",
  "Légpárnás Lajos"
];

const AVATARS = [
  { id: "cyclops", label: "Küklopsz" },
  { id: "angry", label: "Morcos" },
  { id: "derpy", label: "Kancsal" },
  { id: "visor", label: "Kiborg" },
  { id: "catbot", label: "Cicarobot" },
  { id: "crown", label: "Király" }
];

const EVENT_SLOGANS = {
  hit: ["BAM!! 💥", "PUFF!!", "CSATT!!", "KAPJAD!!", "ÜTKÖZÉS! +1"],
  damage: ["CSAVAR LEESETT! 🔧", "AUCS!! +2", "SZÉTESETT?!", "DARABOKBAN! 💥", "SÉRÜLÉS! +2"],
  lift: ["REPÜL A ROBOT!! 🚀", "FELSZÁLLÁS!! +3", "ŰRPROGRAM! 🛸", "EMELÉS! +3", "HOPAÁÁÁ!"],
  ringout: ["KILÖKVE!! +10 💨", "VISZLÁT A PÁLYÁN KÍVÜL! +10", "POTTY!! +10 🕳️", "RING-OUT!! +10 💥"],
  ko: ["K.O.!! 😵", "MOZGÁSKÉPTELEN!!", "KIFULLADT AZ ELEM?! 🔋", "BÍRÓI LEÁLLÍTÁS!"],
  laser: ["HALÁLSUGÁR TILOS! 🚫⚡", "FOLYADÉK ÉS NYÍLT LÁNG TILOS! 🔥💧", "BÍRÓI ELLENŐRZÉS! 👀"]
};

function createDefaultState() {
  return {
    matchTitle: "MICRO:HARC ARÉNA",
    roundNumber: 1,
    timeLeftMs: 180000, // 3:00
    timerRunning: false,
    timerAnchor: null, // Date.now() when started
    timerAnchorLeftMs: 180000,

    // 3-2-1-HARC visszaszámlálás
    startCountdown: null, // null | { step: "3"|"2"|"1"|"HARC!", id }

    // Mozgásképtelenség (KO) 10 mp rászámolás
    koCount: null, // null | { side: "left"|"right", sec: 10..0, active: true }

    // Utolsó vicces felugró esemény
    lastBanner: null, // { id, text, subtext, side: "left"|"right"|"center", type, ts }

    // Győztes overlay
    winner: null, // null | { side: "left"|"right"|"draw", reason: string }

    soundEnabled: true,

    left: {
      name: "9V-os Rémség",
      avatar: "angry",
      points: 0,
      stats: { hit: 0, damage: 0, lift: 0, ringout: 0 },
      mood: "idle", // idle | happy | hurt | out
      moodUntil: 0
    },
    right: {
      name: "Bádog Pista",
      avatar: "derpy",
      points: 0,
      stats: { hit: 0, damage: 0, lift: 0, ringout: 0 },
      mood: "idle",
      moodUntil: 0
    },
    updatedAt: Date.now()
  };
}

function getEffectiveTimeLeftMs(state) {
  if (!state.timerRunning || !state.timerAnchor) {
    return Math.max(0, state.timeLeftMs);
  }
  const elapsed = Date.now() - state.timerAnchor;
  return Math.max(0, state.timerAnchorLeftMs - elapsed);
}

function formatTime(ms) {
  const totalSec = Math.ceil(Math.max(0, ms) / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Vicces SVG robot-fejek, amelyek reagálnak az állapotra (idle, happy, hurt, out)
function renderRobotSVG(avatarId, side, mood) {
  const primary = side === "left" ? "#FF5722" : "#00B8D4";
  const dark = side === "left" ? "#BF360C" : "#006064";
  const accent = side === "left" ? "#FFD600" : "#FFEB3B";

  let antenna = `
    <line x1="60" y1="22" x2="60" y2="8" stroke="#111" stroke-width="5" stroke-linecap="round"/>
    <circle cx="60" cy="8" r="6" fill="${accent}" stroke="#111" stroke-width="3"/>
  `;
  if (avatarId === "catbot") {
    antenna = `
      <polygon points="26,32 34,8 48,26" fill="${primary}" stroke="#111" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="94,32 86,8 72,26" fill="${primary}" stroke="#111" stroke-width="4" stroke-linejoin="round"/>
    `;
  } else if (avatarId === "crown") {
    antenna = `
      <polygon points="34,24 40,6 52,18 60,4 68,18 80,6 86,24" fill="#FFD600" stroke="#111" stroke-width="3.5" stroke-linejoin="round"/>
    `;
  }

  // Szemek hangulat szerint
  let eyes = "";
  if (mood === "hurt" || mood === "out") {
    eyes = `
      <g stroke="#111" stroke-width="5" stroke-linecap="round">
        <line x1="34" y1="45" x2="48" y2="59"/><line x1="48" y1="45" x2="34" y2="59"/>
        <line x1="72" y1="45" x2="86" y2="59"/><line x1="86" y1="45" x2="72" y2="59"/>
      </g>
    `;
  } else if (mood === "happy") {
    eyes = `
      <path d="M 32 56 Q 41 42 50 56" fill="none" stroke="#111" stroke-width="5" stroke-linecap="round"/>
      <path d="M 70 56 Q 79 42 88 56" fill="none" stroke="#111" stroke-width="5" stroke-linecap="round"/>
      <circle cx="28" cy="64" r="5" fill="#FF8A80" opacity="0.8"/>
      <circle cx="92" cy="64" r="5" fill="#FF8A80" opacity="0.8"/>
    `;
  } else if (avatarId === "cyclops") {
    eyes = `
      <circle cx="60" cy="52" r="16" fill="#FFF" stroke="#111" stroke-width="4"/>
      <circle cx="60" cy="52" r="7" fill="#FF1744" stroke="#111" stroke-width="2.5"/>
      <circle cx="63" cy="49" r="2.5" fill="#FFF"/>
    `;
  } else if (avatarId === "visor") {
    eyes = `
      <rect x="28" y="42" width="64" height="20" rx="10" fill="#111"/>
      <rect x="34" y="47" width="52" height="10" rx="5" fill="${accent}"/>
      <rect x="44" y="49" width="14" height="6" rx="3" fill="#FFF" opacity="0.8"/>
    `;
  } else if (avatarId === "derpy") {
    eyes = `
      <circle cx="42" cy="52" r="11" fill="#FFF" stroke="#111" stroke-width="3.5"/>
      <circle cx="46" cy="54" r="4.5" fill="#111"/>
      <circle cx="78" cy="50" r="13" fill="#FFF" stroke="#111" stroke-width="3.5"/>
      <circle cx="74" cy="48" r="5" fill="#111"/>
    `;
  } else if (avatarId === "angry") {
    eyes = `
      <circle cx="42" cy="54" r="9" fill="#FFF" stroke="#111" stroke-width="3.5"/>
      <circle cx="44" cy="54" r="4" fill="#111"/>
      <circle cx="78" cy="54" r="9" fill="#FFF" stroke="#111" stroke-width="3.5"/>
      <circle cx="76" cy="54" r="4" fill="#111"/>
      <line x1="30" y1="40" x2="54" y2="48" stroke="#111" stroke-width="5" stroke-linecap="round"/>
      <line x1="90" y1="40" x2="66" y2="48" stroke="#111" stroke-width="5" stroke-linecap="round"/>
    `;
  } else {
    eyes = `
      <circle cx="42" cy="52" r="10" fill="#FFF" stroke="#111" stroke-width="3.5"/>
      <circle cx="42" cy="52" r="4.5" fill="#111"/>
      <circle cx="78" cy="52" r="10" fill="#FFF" stroke="#111" stroke-width="3.5"/>
      <circle cx="78" cy="52" r="4.5" fill="#111"/>
    `;
  }

  // Száj hangulat szerint
  let mouth = `
    <rect x="36" y="74" width="48" height="14" rx="5" fill="#FFF" stroke="#111" stroke-width="3.5"/>
    <line x1="48" y1="74" x2="48" y2="88" stroke="#111" stroke-width="3"/>
    <line x1="60" y1="74" x2="60" y2="88" stroke="#111" stroke-width="3"/>
    <line x1="72" y1="74" x2="72" y2="88" stroke="#111" stroke-width="3"/>
  `;
  if (mood === "happy") {
    mouth = `
      <path d="M 34 73 Q 60 98 86 73 Z" fill="#FFF" stroke="#111" stroke-width="3.5" stroke-linejoin="round"/>
    `;
  } else if (mood === "hurt" || mood === "out") {
    mouth = `
      <path d="M 36 86 Q 48 74 60 82 Q 72 90 84 78" fill="none" stroke="#111" stroke-width="5" stroke-linecap="round"/>
    `;
  }

  // Extrák sérülésnél (repülő csavar / szikra)
  const sparks = mood === "hurt"
    ? `<text x="92" y="28" font-size="22">⚡</text><text x="8" y="30" font-size="18">🔩</text>`
    : mood === "happy"
    ? `<text x="92" y="26" font-size="22">✨</text><text x="6" y="26" font-size="20">⭐</text>`
    : "";

  return `
    <svg viewBox="0 0 120 112" class="robot-svg mood-${mood}" aria-hidden="true">
      ${antenna}
      <!-- fülek / csavarok -->
      <rect x="10" y="44" width="12" height="24" rx="4" fill="${dark}" stroke="#111" stroke-width="3.5"/>
      <rect x="98" y="44" width="12" height="24" rx="4" fill="${dark}" stroke="#111" stroke-width="3.5"/>
      <!-- fej -->
      <rect x="20" y="22" width="80" height="78" rx="18" fill="${primary}" stroke="#111" stroke-width="4.5"/>
      <!-- fénycsík -->
      <rect x="28" y="29" width="22" height="6" rx="3" fill="#FFF" opacity="0.35"/>
      ${eyes}
      ${mouth}
      ${sparks}
    </svg>
  `;
}

// Web Audio API – 100% offline vicces hangeffektek!
const SoundFX = (() => {
  let ctx = null;
  function getCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }

  function tone(freq, startOffset, duration, type = "square", gainVal = 0.16, freqEnd = null) {
    const c = getCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    const t0 = c.currentTime + startOffset;
    osc.frequency.setValueAtTime(freq, t0);
    if (freqEnd !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t0 + duration);
    }
    g.gain.setValueAtTime(gainVal, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  return {
    play(kind, enabled = true) {
      if (!enabled) return;
      try {
        if (kind === "hit") {
          tone(220, 0, 0.12, "sawtooth", 0.2, 70);
          tone(520, 0.04, 0.09, "square", 0.12, 680);
        } else if (kind === "damage") {
          tone(340, 0, 0.09, "sawtooth", 0.22, 90);
          tone(180, 0.08, 0.16, "square", 0.2, 55);
          tone(620, 0.14, 0.12, "triangle", 0.15, 240);
        } else if (kind === "lift") {
          tone(240, 0, 0.28, "triangle", 0.22, 920);
          tone(480, 0.12, 0.22, "sine", 0.16, 1280);
        } else if (kind === "ringout") {
          // Rajzfilmes zuhanó fütty + bumm!
          tone(980, 0, 0.42, "sine", 0.2, 160);
          tone(130, 0.43, 0.26, "sawtooth", 0.28, 42);
        } else if (kind === "beep") {
          tone(760, 0, 0.12, "square", 0.16);
        } else if (kind === "gong") {
          // Bokszharang / rajtcsengő
          tone(880, 0, 0.7, "triangle", 0.26, 860);
          tone(1318, 0, 0.6, "sine", 0.18, 1290);
          tone(1760, 0, 0.45, "sine", 0.12);
        } else if (kind === "buzzer") {
          tone(150, 0, 0.75, "sawtooth", 0.26, 135);
          tone(112, 0, 0.75, "square", 0.18, 105);
        } else if (kind === "ko") {
          tone(440, 0, 0.15, "sawtooth", 0.2);
          tone(330, 0.16, 0.15, "sawtooth", 0.2);
          tone(220, 0.32, 0.4, "sawtooth", 0.25, 110);
        } else if (kind === "win") {
          const notes = [523, 659, 784, 1046];
          notes.forEach((n, idx) => tone(n, idx * 0.11, idx === 3 ? 0.45 : 0.13, "triangle", 0.22));
        } else if (kind === "laser") {
          tone(1200, 0, 0.14, "sawtooth", 0.16, 260);
          tone(1100, 0.16, 0.18, "sawtooth", 0.16, 200);
        }
      } catch (e) {
        // hang lejátszás letiltva a böngészőben
      }
    }
  };
})();
