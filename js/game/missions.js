// Historien: steder på kartet, hvem som bor der, og hva som skjer når Mulle kommer.
import { state, save, addPart } from './state.js';
import { stats, LIMITS } from './car.js';
import { PARTS } from '../data/parts.js';
import { audio } from '../engine/audio.js';

export const PLACES = {
  bensin: { name: 'Bensinstasjonen', npc: 'bjarne', who: 'Bensin-Bjarne' },
  bakeri: { name: 'Bakeriet', npc: 'berit', who: 'Baker Berit' },
  fest: { name: 'Den gule villaen', npc: 'flora', who: 'Fru Flora' },
  torg: { name: 'Bilutstillingen', npc: 'dagny', who: 'Dommer Dagny' },
  ola: { name: 'Olas gård', npc: 'ola', who: 'Bonde Ola' },
  sigurd: { name: 'Sigurds hytte', npc: 'sigurd', who: 'Skogshugger Sigurd' },
  fyr: { name: 'Fyret', npc: 'frida', who: 'Fyrvokter Frida' },
  topp: { name: 'Fjelltoppen', npc: 'gudrun', who: 'Bestemor Gudrun' },
};

export const MEDALS = {
  melk: { name: 'Melkemedaljen', icon: '🥛', color: '#e8e8f0', task: 'Kjør melk fra Olas gård til bakeriet' },
  kake: { name: 'Kakemedaljen', icon: '🎂', color: '#f3b6c8', task: 'Frakt kaken til hagefesten' },
  sigurd: { name: 'Skogsmedaljen', icon: '🌲', color: '#8fc27a', task: 'Kjør gjennom gjørma til Sigurd' },
  fyr: { name: 'Fyrmedaljen', icon: '💡', color: '#f6e27a', task: 'Kjør gjennom tunnelen til fyret' },
  topp: { name: 'Fjellmedaljen', icon: '⛰️', color: '#b8c8d8', task: 'Kjør opp den bratte bakken til fjelltoppen' },
  show: { name: 'Bilutstillingen', icon: '🏆', color: '#f4c430', task: 'Vinn gull på bilutstillingen på torget' },
};

// Det Figge ringer om etter hvert oppdrag.
const FIGGE_DELIVERIES = [
  ['motor_traktor', 'pynt_blomst'],
  ['batteri_stort', 'eksos_sport'],
  ['kar_badekar', 'lykt_dobbel'],
  ['stot_kufanger', 'horn_elg'],
  ['tank_tonne', 'pynt_antenne', 'hjul_tre'],
];

function reward(keys) {
  for (const k of keys) addPart(k, 'garage');
}

function award(id) {
  if (!state.medals.includes(id)) {
    state.medals.push(id);
    if (state.figgeIndex + state.figgePending < FIGGE_DELIVERIES.length) state.figgePending++;
  }
  audio.fanfare();
}

const partNames = (keys) => {
  const names = keys.map((k) => PARTS[k].indef);
  return names.length > 1 ? names.slice(0, -1).join(', ') + ' og ' + names[names.length - 1] : names[0];
};

// Returnerer replikker: { who: 'npc' | 'mulle', text }
export function arrive(id) {
  const st = stats();
  const m = state.missions;
  const L = [];
  const npc = (text) => L.push({ who: 'npc', text });
  const mulle = (text) => L.push({ who: 'mulle', text });

  switch (id) {
    case 'bensin': {
      const full = state.fuel >= st.capacity - 0.5;
      npc(full ? 'Hei, Mulle! Tanken din er jo full.' : 'Hei, Mulle! Skal vi fylle tanken?');
      if (!full) {
        state.fuel = st.capacity;
        npc('Sånn! Full tank. Det er gratis for deg, som alltid.');
        mulle('Tusen takk, Bjarne!');
      }
      if (st.style >= 12) npc('For en flott bil du har bygget!');
      break;
    }
    case 'ola': {
      if (m.melk === 'none') {
        npc('Hei, Mulle! Bakeren venter på melk, men traktoren min har streiket.');
        if (state.carried) {
          npc('Men du har visst allerede noe på lasset.');
        } else if (st.cargo) {
          npc('Du har jo lasteplan! Kan du kjøre melkespannene til bakeriet i byen?');
          state.carried = 'melk';
          m.melk = 'carrying';
          mulle('Klart det! Vi kjører med en gang.');
        } else {
          npc('Hadde du hatt en bil med lasteplan, kunne du kjørt melken for meg.');
          mulle('Da må vi bygge en bil med lasteplan!');
        }
      } else if (m.melk === 'carrying') {
        npc('Kjør forsiktig med melken! Bakeriet ligger i byen.');
      } else {
        npc('Takk for hjelpen med melken, Mulle! Liker du traktorhjulene mine?');
      }
      break;
    }
    case 'bakeri': {
      if (m.melk === 'carrying' && state.carried === 'melk') {
        state.carried = null;
        m.melk = 'done';
        const r = ['sete_sofa', 'hjul_traktor', 'hjul_traktor'];
        reward(r);
        award('melk');
        npc('Melk! Endelig! Nå kan jeg bake kaken til hagefesten.');
        npc('Som takk får du den gamle blomstersofaen min. Og Ola sender deg traktorhjulene sine!');
        npc('Jeg kjører alt hjem til garasjen din.');
        mulle('Tusen takk! Det var flotte deler.');
        npc('Kom tilbake og hent kaken når bilen din er myk og god å sitte i. Kaken tåler ikke risting!');
      } else if (m.melk !== 'done') {
        npc('Uff da, jeg har ikke en dråpe melk! Uten melk blir det ingen kake til hagefesten.');
        npc('Bonde Ola har melk, men traktoren hans er i stykker.');
      } else if (m.kake === 'none') {
        if (state.carried) {
          npc('Kaken er ferdig, men du har jo noe annet på lasset.');
        } else if (st.comfort >= KAKE_COMFORT) {
          state.carried = 'kake';
          m.kake = 'carrying';
          npc('Bilen din ser myk og god ut! Her er kaken til hagefesten i den gule villaen.');
          npc('Kjør forsiktig!');
          mulle('Mmm, den lukter godt!');
        } else {
          npc('Kaken er ferdig! Men bilen din rister altfor mye – da blir kaken til mos.');
          npc('Kom tilbake med en mykere bil. En god sofa, et ordentlig karosseri og et eksosrør hjelper!');
          mulle('Hmm. Vi må bygge om bilen.');
        }
      } else if (m.kake === 'carrying') {
        npc('Kaken skal til den gule villaen. Skynd deg, men kjør pent!');
      } else {
        npc('Hei igjen, Mulle! Hagefesten ble visst en suksess.');
      }
      break;
    }
    case 'fest': {
      if (m.kake === 'carrying' && state.carried === 'kake') {
        state.carried = null;
        m.kake = 'done';
        const r = ['kar_racer', 'hjul_racer', 'hjul_racer', 'pynt_flagg'];
        reward(r);
        award('kake');
        npc('Kaken! Hurra, nå kan festen begynne!');
        npc('Min bror kjørte racerbil i gamle dager. Du skal få karosseriet, racerhjulene og et flagg!');
        mulle('Jøss! Et ekte racer-karosseri!');
      } else if (m.kake === 'done') {
        npc('For en fest! Takk igjen for kaken, Mulle.');
      } else {
        npc('Velkommen til hagefest! Men vi venter fortsatt på kaken fra bakeriet...');
      }
      break;
    }
    case 'sigurd': {
      if (!m.sigurd) {
        m.sigurd = true;
        reward(['motor_v8']);
        award('sigurd');
        npc('Nei, se! Besøk! Ingen har klart å kjøre gjennom gjørma på mange år.');
        npc('I skjulet har jeg en kraftig V8-motor som bare står. Den skal du få!');
        mulle('En V8! Med den kommer vi oss opp de bratteste bakkene.');
      } else {
        npc('Hei, Mulle! Pass deg for gjørma på vei hjem.');
      }
      break;
    }
    case 'fyr': {
      if (!m.fyr) {
        m.fyr = true;
        reward(['tank_stor', 'gir_5']);
        award('fyr');
        npc('Så hyggelig! Du kom deg gjennom den mørke tunnelen!');
        npc('Fra den gamle fiskebåten min har jeg en stor bensintank og en femtrinns girkasse. Vær så god!');
        mulle('Med en stor tank kan vi kjøre mye lenger!');
      } else {
        npc('Hei igjen! Se, så fint havet glitrer i dag.');
      }
      break;
    }
    case 'topp': {
      if (!m.topp) {
        m.topp = true;
        reward(['ratt_gull', 'pynt_stjerne']);
        award('topp');
        npc('Nei, men se! En bil helt opp på fjelltoppen!');
        npc('Det har jeg aldri sett før. Du skal få mitt gylne ratt og en gullstjerne.');
        mulle('Så flott! Det blir fint på bilutstillingen.');
      } else {
        npc('Velkommen opp igjen! Utsikten er like fin i dag.');
      }
      break;
    }
    case 'torg': {
      const score = Math.round(st.style + Math.min(4, st.comfort / 2) + Math.min(3, st.topSpeed / 50));
      const level = score >= 22 ? 'gull' : score >= 14 ? 'solv' : score >= 8 ? 'bronse' : null;
      const rank = { bronse: 1, solv: 2, gull: 3 };
      npc('Velkommen til bilutstillingen! La meg se nøye på bilen din...');
      const praise = [];
      if (st.bodyKey === 'kar_racer') praise.push('For et flott racer-karosseri!');
      else if (st.bodyKey === 'kar_badekar') praise.push('Et badekar! Det har jeg aldri sett før.');
      else if (st.bodyKey) praise.push('Fint karosseri!');
      if (state.car.pynt) praise.push('Pynten er nydelig.');
      if (st.horn === 'horn_elg') praise.push('Og elgehorn! Fantastisk!');
      if (st.comfort >= 6) praise.push('Så myke seter.');
      if (st.topSpeed >= 110) praise.push('Den ser rask ut!');
      if (praise.length) npc(praise.slice(0, 3).join(' '));
      npc(`Bilen din får ${score} poeng.`);
      const prev = m.show;
      if (!level) {
        npc('Hmm... bilen trenger mer pynt og stil. Kom tilbake når du har fikset den!');
        mulle('Vi må finne flere fine deler.');
      } else if (!prev || rank[level] > rank[prev]) {
        m.show = level;
        const nm = { bronse: 'bronsemedalje', solv: 'sølvmedalje', gull: 'gullpokalen' }[level];
        audio.fanfare();
        if (level === 'gull') {
          state.won = true;
          if (!state.medals.includes('show')) state.medals.push('show');
          npc('Dette er den fineste bilen i hele bygda! Du vinner gullpokalen!');
          mulle('Hurra! Vi vant! Tusen takk!');
        } else {
          npc(`Du får ${nm}! Klarer du ${level === 'bronse' ? 'sølv' : 'gull'} også? Da trengs ${level === 'bronse' ? 14 : 22} poeng.`);
          mulle('Det skal vi klare!');
        }
      } else {
        npc(`Du har allerede fått ${prev === 'solv' ? 'sølv' : prev}. ${prev === 'gull' ? 'Bedre blir det ikke!' : 'Pynt bilen mer for å vinne gull!'}`);
      }
      break;
    }
    default:
      break;
  }
  save();
  return L;
}

// Figge ringer: returnerer replikker og legger delene i skraphaugen.
export function figgeCall() {
  if (!state.figgePending) return null;
  const keys = FIGGE_DELIVERIES[state.figgeIndex] || [];
  state.figgePending--;
  state.figgeIndex++;
  const piles = ['pile1', 'pile2', 'pile3'];
  keys.forEach((k, i) => addPart(k, piles[(state.figgeIndex + i) % 3]));
  save();
  return [
    { who: 'figge', text: 'Hallo, Mulle! Figge Ferrum her, skraphandleren.' },
    { who: 'figge', text: `Jeg har nettopp tippet noen deler i skraphaugen din: ${partNames(keys)}.` },
    { who: 'mulle', text: 'Så bra! Takk, Figge. Vi tar en titt i skraphaugen.' },
  ];
}

// Kravene bilen kan mangle for oppdrag som ikke er gjort ennå.
// Brukes både til Mulles hint i garasjen og til merkene på tavla.
const KAKE_COMFORT = 6;
function goalList() {
  const m = state.missions;
  const g = [];
  if (m.melk === 'none') {
    g.push({ stat: 'cargo', min: 1, text: 'Med lasteplan kan vi hjelpe bonde Ola med å kjøre melk!' });
    g.push({ stat: 'strength', min: LIMITS.humpete.min, text: 'Nå er bilen sterk nok for den humpete veien til Olas gård.' });
  }
  if (!m.fyr) g.push({ stat: 'lights', min: 1, text: 'Med lykter kommer vi gjennom den mørke tunnelen til fyret!' });
  if (m.kake !== 'done') g.push({ stat: 'comfort', min: KAKE_COMFORT, text: 'Nå er bilen myk nok til å frakte kaka fra bakeriet!' });
  if (!m.sigurd) g.push({ stat: 'grip', min: LIMITS.gjorme.min, text: 'Med så godt grep kommer vi oss gjennom gjørma til Sigurd!' });
  if (!m.topp) g.push({ stat: 'climb', min: LIMITS.bratt.min, text: 'Nå har bilen nok kraft til den bratte bakken opp til fjelltoppen!' });
  return g;
}

const num = (v) => (typeof v === 'boolean' ? (v ? 1 : 0) : v);

// Hint når en endring i garasjen gjør at bilen klarer et nytt krav.
export function garageHints(before, after) {
  if (!after.drivable) return [];
  return goalList()
    .filter((g) => num(after[g.stat]) >= g.min && (num(before[g.stat]) < g.min || !before.drivable))
    .map((g) => g.text);
}

// Kravmerker til tavla i garasjen: stat -> minsteverdi.
export function boardGoals() {
  const out = {};
  for (const g of goalList()) out[g.stat] = g.min;
  return out;
}

// Mulle gir et hint om hva man kan gjøre nå.
export function hint() {
  const st = stats();
  const m = state.missions;
  if (!st.drivable) {
    return `Bilen mangler ${st.missing.slice(0, 3).join(', ')}${st.missing.length > 3 ? ' og mer' : ''}. Se i skraphaugen!`;
  }
  if (state.carried === 'melk') return 'Melken skal til bakeriet i byen.';
  if (state.carried === 'kake') return 'Kaken skal til den gule villaen. Kjør pent!';
  if (m.melk === 'none') return 'Bonde Ola trenger hjelp. Gården hans ligger nordvest for byen, langs en humpete vei.';
  if (!m.fyr) return 'Ute ved havet står et fyr. Men tunnelen dit er bekmørk – vi trenger lykter.';
  if (m.kake !== 'done') return 'Bakeren har en kake som skal på fest. Bilen må være myk å sitte i!';
  if (!m.sigurd) return 'Langt inne i skogen bor Sigurd. Veien er full av gjørme – vi trenger hjul med godt grep.';
  if (!m.topp) return 'Fjelltoppen er kjempebratt! Bilen trenger mye kraft – eller å være veldig lett.';
  if (m.show !== 'gull') return 'På torget er det bilutstilling. Mye pynt og fine deler gir flere poeng!';
  return 'For en bil! Vi er de beste bilbyggerne i hele bygda.';
}
