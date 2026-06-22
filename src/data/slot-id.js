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

// Cycles navigables indexables par niveau (ancres aux niveaux 1/2, compléments aux 3/4).
export const SLOTIDS_BY_LEVEL = (() => {
    /** @type {{ [level: string]: string[] }} */
    const byLevel = {};
    SLOT_DEFS
        .filter(d => d.role !== 'generic')
        .sort((a, b) => a.level - b.level || a.weight - b.weight)
        .forEach(d => { (byLevel[String(d.level)] ??= []).push(d.id); });
    return byLevel;
})();

// Libellés / jokers de niveau (index = niveau - 1). 'hour' n'a pas de slot def.
export const GENERIC_SLOTIDS = ['month', 'week', 'day', 'hour'];

export const weight = Object.fromEntries(SLOT_DEFS.map(d => [d.id, d.weight]));

export function getSlotIdAndKeywords() {
    return SLOTIDS_LST.concat(EXPR_KEYWORDS)
}

/**
 * give the level of a slot
 * @returns int -1 or between 1 and 4
 * public used by parser.js
 */
export function getSlotIdLevel(slotId) {
    return _defById.get(slotId)?.level ?? -1;
}

/**
 * Famille d'un slot id (gère le suffixe shift "id + n").
 * @returns 'relatifPresent' | 'relatifParent' | 'generic' | undefined
 */
export function getSlotIdFamily(slotId) {
    const base = slotId.match(/(\S+)/)?.[1];
    return _defById.get(base)?.family;
}

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
    const level = getSlotIdLevel(slotId)
    const slots = SLOTIDS_BY_LEVEL[level.toString()]
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
        const level = getSlotIdLevel(id)
        const slots = SLOTIDS_BY_LEVEL[level.toString()]
        const index = 
        slots.indexOf(id)
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

    return SLOTIDS_BY_LEVEL[level].indexOf(id)
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