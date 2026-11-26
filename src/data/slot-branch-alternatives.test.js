import { vi } from 'vitest';
import { Parser } from './parser';
import { branchAlternatives, branchComplete, branchToExpr } from './slot-branch.js';

vi.useFakeTimers()
vi.setSystemTime(new Date('2023-12-20')) // mercredi

const parser = new Parser();
const alternatives = (expr) => branchAlternatives(branchComplete(parser.parse(expr))).map(branchToExpr);

describe('branchAlternatives', () => {
    test('un créneau simple a une seule alternative', () => {
        expect(alternatives('this_week mardi')).toEqual(['this_month this_week mardi']);
    });

    test('multi à la racine', () => {
        expect(alternatives('lundi mardi')).toEqual(['this_month this_week lundi', 'this_month this_week mardi']);
    });

    test('multi imbriqué sous un préfixe commun', () => {
        expect(alternatives('this_week lundi mardi')).toEqual(['this_month this_week lundi', 'this_month this_week mardi']);
    });

    test('alternatives de semaines différentes', () => {
        expect(alternatives('next_week lundi this_week mardi')).toEqual(['this_month next_week lundi', 'this_month this_week mardi']);
    });

    test('sous-niveaux (matin/aprem) conservés', () => {
        expect(alternatives('this_week lundi aprem lundi matin')).toEqual(['this_month this_week lundi aprem', 'this_month this_week lundi matin']);
    });

    test('drapeau chaque conservé sur son alternative', () => {
        expect(alternatives('chaque lundi mercredi')).toEqual(['this_month this_week chaque lundi', 'this_month this_week mercredi']);
    });

    test('familles de jour : today jeudi', () => {
        expect(alternatives('today jeudi')).toEqual(['this_month this_week today', 'this_month this_week jeudi']);
    });

    test('branche indéfinie -> aucune alternative', () => {
        expect(branchAlternatives(undefined)).toEqual([]);
    });
});
