import { getNow } from '../utils/now'

/**
 * SLOT_DEFS — source de vérité unique des slots disponibles à l'exécution.
 * Les structures historiques (SLOTIDS_LST, SLOTIDS_BY_LEVEL, weight) et
 * getSlotIdLevel/Family/isAnchor/isComplement en DÉRIVENT.
 * Pour ajouter un slot : une seule ligne ici.
 *   - role   : 'generic' (libellé/joker de niveau) | 'anchor' (relatif au présent)
 *              | 'complement' (position dans la période parente)
 *   - family : 'generic' | 'relatifPresent' | 'relatifParent' (| 'absolu' à venir)
 *   - weight : tri / distance (compléments : ordre dans le cycle ; ancres : échelle héritée)
 *   - alias  : forme canonique avec shift (ex. next_week = this_week + 1)
 * L'ordre de déclaration = ordre de SLOTIDS_LST.
 */
const SLOT_DEFS = [
    { id: 'month',          level: 1, role: 'generic',    family: 'generic',        weight: 1 },
    { id: 'this_month',     level: 1, role: 'anchor',     family: 'relatifPresent', weight: 1 },
    { id: 'next_month',     level: 1, role: 'anchor',     family: 'relatifPresent', weight: 2, alias: 'this_month + 1' },
    { id: 'week',           level: 2, role: 'generic',    family: 'generic',        weight: 1 },
    { id: 'this_week',      level: 2, role: 'anchor',     family: 'relatifPresent', weight: 2 },
    { id: 'next_week',      level: 2, role: 'anchor',     family: 'relatifPresent', weight: 3, alias: 'this_week + 1' },
    { id: 'following_week', level: 2, role: 'anchor',     family: 'relatifPresent', weight: 4, alias: 'this_week + 2' },
    { id: 'day',            level: 3, role: 'generic',    family: 'generic',        weight: 1 },
    { id: 'today',          level: 3, role: 'anchor',     family: 'relatifPresent', weight: 1 },
    { id: 'tomorrow',       level: 3, role: 'anchor',     family: 'relatifPresent', weight: 2, alias: 'today + 1' },
    { id: 'lundi',          level: 3, role: 'complement', family: 'relatifParent',  weight: 1 },
    { id: 'mardi',          level: 3, role: 'complement', family: 'relatifParent',  weight: 2 },
    { id: 'mercredi',       level: 3, role: 'complement', family: 'relatifParent',  weight: 3 },
    { id: 'jeudi',          level: 3, role: 'complement', family: 'relatifParent',  weight: 4 },
    { id: 'vendredi',       level: 3, role: 'complement', family: 'relatifParent',  weight: 5 },
    { id: 'matin',          level: 4, role: 'complement', family: 'relatifParent',  weight: 1 },
    { id: 'aprem',          level: 4, role: 'complement', family: 'relatifParent',  weight: 2 },
];

const _defById = new Map(SLOT_DEFS.map(d => [d.id, d]));

export const EXPR_KEYWORDS = [
    'disable', 'chaque', 'every'
];

// Catalogue des tokens (parser, autocomplétion). 'hour' reste un libellé de niveau
// seulement (cf. GENERIC_SLOTIDS), historiquement absent de cette liste / de weight.
export const SLOTIDS_LST = SLOT_DEFS.map(d => d.id);

/** Regroupe les ids retenus par niveau (clé string), triés par weight. */
function _groupByLevel(predicate) {
    /** @type {{ [level: string]: string[] }} */
    const byLevel = {};
    SLOT_DEFS
        .filter(predicate)
        .sort((a, b) => a.level - b.level || a.weight - b.weight)
        .forEach(d => { (byLevel[String(d.level)] ??= []).push(d.id); });
    return byLevel;
}

// Séquences de navigation par famille (getSlotIdNextPrev/Previous/Index).
export const ANCHOR_IDS_BY_LEVEL = _groupByLevel(d => d.role === 'anchor');
export const COMPLEMENT_IDS_BY_LEVEL = _groupByLevel(d => d.role === 'complement');

// Catalogue d'affichage / nombre de niveaux (vues, slot-panel, getSlotIdFirstLevel) :
// compléments du niveau s'ils existent, sinon ancres (les ancres jour today/tomorrow
// ne polluent donc pas la colonne des weekdays).
export const SLOTIDS_BY_LEVEL = (() => {
    /** @type {{ [level: string]: string[] }} */
    const byLevel = {};
    for (const def of SLOT_DEFS) {
        const lvl = String(def.level);
        if (!byLevel[lvl]) byLevel[lvl] = COMPLEMENT_IDS_BY_LEVEL[lvl] ?? ANCHOR_IDS_BY_LEVEL[lvl] ?? [];
    }
    return byLevel;
})();

/** Séquence de navigation d'un id selon sa famille (fallback legacy pour génériques/inconnus). */
function _navSeq(baseId) {
    const def = _defById.get(baseId);
    if (def?.role === 'anchor') return ANCHOR_IDS_BY_LEVEL[def.level];
    if (def?.role === 'complement') return COMPLEMENT_IDS_BY_LEVEL[def.level];
    return SLOTIDS_BY_LEVEL[getSlotIdLevel(baseId).toString()];
}

// Libellés / jokers de niveau (index = niveau - 1). 'hour' n'a pas de slot def.
export const GENERIC_SLOTIDS = ['month', 'week', 'day', 'hour'];

export const weight = Object.fromEntries(SLOT_DEFS.map(d => [d.id, d.weight]));

/**
 * Poids d'un jour (niveau 3) comparable à celui d'un jour de semaine réel (`referenceWeight`,
 * le poids du jour "maintenant" — toujours lundi..vendredi). `weight` seul ne suffit pas :
 * il mélange deux échelles incompatibles (today/tomorrow = famille relatifPresent,
 * lundi..vendredi = famille relatifParent). Par construction, 'today' vaut toujours le jour
 * de référence lui-même, et 'tomorrow' ce jour + 1 — quel que soit le vrai jour de la semaine.
 */
export function getSlotIdDayWeight(dayId, referenceWeight) {
    if (dayId === 'today') return referenceWeight;
    if (dayId === 'tomorrow') return referenceWeight + 1;
    return weight[dayId] ?? 0;
}

export function getSlotIdAndKeywords() {
    return SLOTIDS_LST.concat(EXPR_KEYWORDS)
}

/**
 * give the level of a slot
 * @returns int -1 or between 1 and 4
 * public used by parser.js
 */
export function getSlotIdLevel(slotId) {
    const base = slotId?.match(/(\S+)/)?.[1];
    return _defById.get(base)?.level ?? -1;
}

/**
 * Famille d'un slot id (gère le suffixe shift "id + n").
 * @returns 'relatifPresent' | 'relatifParent' | 'generic' | undefined
 */
export function getSlotIdFamily(slotId) {
    const base = slotId.match(/(\S+)/)?.[1];
    return _defById.get(base)?.family;
}

/**
 * Rang de la famille dans l'ordre d'affichage, à niveau égal (cf. slot-model-spec.md § 10).
 * Départage les slots que `weight` seul ne sait pas ordonner : au niveau jour, les deux
 * familles partagent la même échelle (`today` = `lundi` = 1). Le joker ouvre le niveau,
 * puis le `relatifPresent` (toujours urgent), puis le `relatifParent`.
 * @returns 0 | 1 | 2 (0 pour un id inconnu)
 */
export function getSlotIdFamilyRank(slotId) {
    return FAMILY_RANK[getSlotIdFamily(slotId)] ?? 0;
}

const FAMILY_RANK = { generic: 0, relatifPresent: 1, relatifParent: 2 };

/** Ancre relative au présent (peut porter shift/repetition en tête de branche). */
export function isAnchor(slotId) {
    const base = slotId.match(/(\S+)/)?.[1];
    return _defById.get(base)?.role === 'anchor';
}

/** Complément : position dans la période parente. */
export function isComplement(slotId) {
    const base = slotId.match(/(\S+)/)?.[1];
    return _defById.get(base)?.role === 'complement';
}

/*
 * returns the default slot of the given level
 * getCurrentSlot(1) = this_month
 * this_month, week, lundi, matin
 * level int between 1 this_month and 4 matin
 */
export function getSlotIdCurrent(level) {
    if (level === 1)
        return 'this_month';
    else if (level === 2)
        return 'this_week';
    else if (level === 3) {
        const currentTime = getNow();
        const day = currentTime.getDay(); // 0 = dimanche
        const jour = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        return jour[day];
    }
    else if (level === 4) {
        const currentTime = getNow();
        return currentTime.getHours() < 12 ? 'matin' : 'aprem';
    }
    else
        return '';
}

export function getSlotIdFirstLevel(level) {
    const slots = SLOTIDS_BY_LEVEL[level.toString()]
    return slots[0]
}

/**
 * 
 * @param {*} slotId 
 * @param {number or undefined} repetition 
 * @returns 
 */
export function getSlotIdPrevious(slotId, repetition) {
    if (isSlotIdGeneric(slotId)) {
        return slotId
    }
    const slots = _navSeq(slotId)
    const index = slots.indexOf(slotId)
    if (index === 0 && repetition === undefined) {
        return slotId
    }
    if (index === 0 && repetition === slots.length - 1) {
        // this becomes next and not following
        return slots[slots.length - 2];
    }
    if (index === 0) {
        return null
    }
    else {
        return slots[index - 1]
    }
}

export function isSlotIdGeneric(slotId) {
    return GENERIC_SLOTIDS.indexOf(slotId) > -1   
}

/**
 * @param direction int 1, -1, n, -n
 */
export function getSlotIdNextPrev(slotId, direction) {
    const IdRegExp = slotId.match(/(\S+) ?\+? ?(\d*)/)
    const id = IdRegExp[1]
    const shift = IdRegExp[2] !== '' ? parseInt(IdRegExp[2]) : undefined

    if (shift === undefined) {
        const slots = _navSeq(id)
        const index = slots.indexOf(id)
        if (direction > 0) {
            if (index + direction < slots.length) {
                return slots[index + direction]
            } else {
                return id + " + " + direction
            }
        } else {
            if (index > 0) {
                return slots[index + direction]
            } else {
                return id
            }                
        }
    } else { // with shift
        if (direction > 0) {
            return id + " + " + (shift + direction)
        } else {
            if (shift > 2) {
                return id + " + " + (shift + direction)
            } else {
                return id                
            }
        }
    }
}

/**
 * this_week = 0, next_week = 1, this_week + 1 = 1
 * @returns int, -1 = no index
 */
export function getSlotIdIndex(slotId) {
    const IdRegExp = slotId.match(/(\S+) ?\+? ?(\d*)/)
    const id = IdRegExp[1]
    const shift = IdRegExp[2] !== '' ? parseInt(IdRegExp[2]) : undefined

    const level = getSlotIdLevel(id)
    if (level === -1) return -1

    if (shift) {
        const index = getSlotIdIndex(id)
        return index + shift
    }

    return _navSeq(id).indexOf(id)
}

export function getSlotIdDistance(id1, id2) {
    const index1 = getSlotIdIndex(id1)
    const index2 = getSlotIdIndex(id2)
    return index2 - index1
    
}

export function isSlotIdEquals(id1, id2) {
    if (isSlotIdGeneric(id1) || isSlotIdGeneric(id2)) {
        return getSlotIdLevel(id1) === getSlotIdLevel(id2)
    } else {
        return id1 === id2
    }
}