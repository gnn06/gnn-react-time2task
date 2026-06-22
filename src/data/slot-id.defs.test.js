/**
 * Tests de caractérisation (golden) — filet de sécurité du refactor SLOT_DEFS.
 * Verrouillent les structures de définition et getSlotIdLevel contre leurs
 * valeurs actuelles. Doivent rester verts après dérivation depuis SLOT_DEFS.
 * Ne pas "corriger" ces attentes lors du refactor : si elles cassent, la
 * dérivation a changé le comportement.
 */
import {
    weight,
    SLOTIDS_LST,
    SLOTIDS_BY_LEVEL,
    GENERIC_SLOTIDS,
    getSlotIdLevel,
    getSlotIdFamily,
    isAnchor,
    isComplement,
} from './slot-id.js';

describe('SLOT_DEFS golden — structures de définition', () => {
    test('SLOTIDS_BY_LEVEL', () => {
        expect(SLOTIDS_BY_LEVEL).toEqual({
            '1': ['this_month', 'next_month'],
            '2': ['this_week', 'next_week', 'following_week'],
            '3': ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
            '4': ['matin', 'aprem'],
        });
    });

    test('SLOTIDS_LST (contient day, PAS hour ; ordre exact)', () => {
        expect(SLOTIDS_LST).toEqual([
            'month', 'this_month', 'next_month',
            'week', 'this_week', 'next_week', 'following_week',
            'day', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi',
            'matin', 'aprem',
        ]);
    });

    test('weight (valeurs byte-identiques)', () => {
        expect(weight).toEqual({
            month: 1, this_month: 1, next_month: 2,
            week: 1, this_week: 2, next_week: 3, following_week: 4,
            day: 1, lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5,
            matin: 1, aprem: 2,
        });
    });

    test('GENERIC_SLOTIDS', () => {
        expect(GENERIC_SLOTIDS).toEqual(['month', 'week', 'day', 'hour']);
    });
});

describe('SLOT_DEFS golden — getSlotIdLevel', () => {
    const cases = [
        ['month', 1], ['this_month', 1], ['next_month', 1],
        ['week', 2], ['this_week', 2], ['next_week', 2], ['following_week', 2],
        ['day', 3], ['lundi', 3], ['mardi', 3], ['mercredi', 3], ['jeudi', 3], ['vendredi', 3],
        ['matin', 4], ['aprem', 4],
        ['inconnu', -1], ['', -1],
    ];
    test.each(cases)('getSlotIdLevel(%s) === %i', (id, level) => {
        expect(getSlotIdLevel(id)).toBe(level);
    });
});

describe('getSlotIdFamily', () => {
    const cases = [
        ['this_month', 'relatifPresent'], ['next_month', 'relatifPresent'],
        ['this_week', 'relatifPresent'], ['next_week', 'relatifPresent'], ['following_week', 'relatifPresent'],
        ['lundi', 'relatifParent'], ['vendredi', 'relatifParent'],
        ['matin', 'relatifParent'], ['aprem', 'relatifParent'],
        ['month', 'generic'], ['week', 'generic'], ['day', 'generic'],
    ];
    test.each(cases)('getSlotIdFamily(%s) === %s', (id, family) => {
        expect(getSlotIdFamily(id)).toBe(family);
    });

    test('id inconnu → undefined', () => {
        expect(getSlotIdFamily('inconnu')).toBeUndefined();
    });

    test("'hour' est un libellé de niveau seulement → undefined", () => {
        expect(getSlotIdFamily('hour')).toBeUndefined();
    });

    test('gère le suffixe shift (id de base)', () => {
        expect(getSlotIdFamily('this_week + 1')).toBe('relatifPresent');
    });
});

describe('isAnchor / isComplement', () => {
    test('ancres relatifPresent', () => {
        expect(isAnchor('this_week')).toBe(true);
        expect(isAnchor('this_month')).toBe(true);
        expect(isAnchor('this_week + 1')).toBe(true);
    });
    test('compléments et génériques ne sont pas des ancres', () => {
        expect(isAnchor('lundi')).toBe(false);
        expect(isAnchor('matin')).toBe(false);
        expect(isAnchor('month')).toBe(false);
    });
    test('compléments relatifParent', () => {
        expect(isComplement('lundi')).toBe(true);
        expect(isComplement('matin')).toBe(true);
    });
    test('ancres et génériques ne sont pas des compléments', () => {
        expect(isComplement('this_week')).toBe(false);
        expect(isComplement('week')).toBe(false);
    });
});
