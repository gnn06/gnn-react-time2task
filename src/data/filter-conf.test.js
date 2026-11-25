import { serializeFilterConf, restoreFilterConf } from './filter-conf';

const isRepeat = () => true;
const isImprecise = () => false;

const filterConfig = [
    { key: 'status',     type: 'multiselect', options: ['todo', 'done'] },
    { key: 'favorite',   type: 'multiselect', options: [true, false] },
    { key: 'activity',   type: 'multiselect', options: [1, 2, null] },
    { key: 'isRepeat',   type: 'slotexpr',    options: [true, false], predicate: isRepeat },
    { key: 'isImprecise', type: 'slotexpr',   options: [true, false], predicate: isImprecise },
];

describe('serializeFilterConf', () => {
    const base = { expression: '', slots: [], genericFilters: {}, taskId: 12, isMulti: true };

    test('ne garde que expression, slots et genericFilters', () => {
        const result = serializeFilterConf({ ...base, expression: 'lundi', slots: ['this_week lundi'] });
        expect(result).toEqual({ expression: 'lundi', slots: ['this_week lundi'], genericFilters: {} });
    });

    test('un prédicat slotexpr actif est sérialisé en true', () => {
        const result = serializeFilterConf({ ...base, genericFilters: { isRepeat } });
        expect(result.genericFilters).toEqual({ isRepeat: true });
    });

    test('un prédicat désactivé (null) est omis', () => {
        const result = serializeFilterConf({ ...base, genericFilters: { isRepeat: null } });
        expect(result.genericFilters).toEqual({});
    });

    test('les filtres property sont conservés, les tableaux vides omis', () => {
        const result = serializeFilterConf({ ...base, genericFilters: { status: ['todo'], favorite: [] } });
        expect(result.genericFilters).toEqual({ status: ['todo'] });
    });

    test('le résultat est sérialisable en JSON sans perte', () => {
        const result = serializeFilterConf({ ...base, genericFilters: { isRepeat, status: ['todo'] } });
        expect(JSON.parse(JSON.stringify(result))).toEqual(result);
    });

    test('filtre absent ou vide -> conf vide', () => {
        const empty = { expression: '', slots: [], genericFilters: {} };
        expect(serializeFilterConf(undefined)).toEqual(empty);
        expect(serializeFilterConf({})).toEqual(empty);
    });
});

describe('restoreFilterConf', () => {
    test('restaure expression, slots et filtres property', () => {
        const saved = { expression: 'lundi', slots: ['this_week lundi'], genericFilters: { status: ['todo'] } };
        expect(restoreFilterConf(saved, filterConfig)).toEqual(saved);
    });

    test('un slotexpr à true est restauré avec le prédicat de la config', () => {
        const result = restoreFilterConf({ genericFilters: { isRepeat: true, isImprecise: true } }, filterConfig);
        expect(result.genericFilters.isRepeat).toBe(isRepeat);
        expect(result.genericFilters.isImprecise).toBe(isImprecise);
    });

    test('aller-retour serialize puis restore', () => {
        const filter = { expression: 'x', slots: ['today'], genericFilters: { isRepeat, activity: [1, null] } };
        const result = restoreFilterConf(JSON.parse(JSON.stringify(serializeFilterConf(filter))), filterConfig);
        expect(result).toEqual(filter);
    });

    test.each([
        ['null', null],
        ['undefined', undefined],
        ['chaîne', 'n’importe quoi'],
        ['objet vide', {}],
    ])('conf absente ou invalide (%s) -> filtre vide', (_, saved) => {
        expect(restoreFilterConf(saved, filterConfig)).toEqual({ expression: '', slots: [], genericFilters: {} });
    });

    describe('valeurs invalides ignorées en silence', () => {
        test('clé de filtre inconnue', () => {
            const result = restoreFilterConf({ genericFilters: { inconnu: ['a'], status: ['todo'] } }, filterConfig);
            expect(result.genericFilters).toEqual({ status: ['todo'] });
        });

        test('valeur de filtre property absente des options (activité supprimée)', () => {
            const result = restoreFilterConf({ genericFilters: { activity: [1, 99, null] } }, filterConfig);
            expect(result.genericFilters).toEqual({ activity: [1, null] });
        });

        test('filtre property dont toutes les valeurs sont invalides -> omis', () => {
            const result = restoreFilterConf({ genericFilters: { activity: [99] } }, filterConfig);
            expect(result.genericFilters).toEqual({});
        });

        test('slotexpr dont la valeur n’est pas true', () => {
            const result = restoreFilterConf({ genericFilters: { isRepeat: false, isImprecise: 'oui' } }, filterConfig);
            expect(result.genericFilters).toEqual({});
        });

        test('filtre property qui n’est pas un tableau', () => {
            const result = restoreFilterConf({ genericFilters: { status: 'todo' } }, filterConfig);
            expect(result.genericFilters).toEqual({});
        });

        test('expression qui n’est pas une chaîne', () => {
            expect(restoreFilterConf({ expression: 42 }, filterConfig).expression).toBe('');
        });

        test('expression en erreur de syntaxe -> vide', () => {
            expect(restoreFilterConf({ expression: 'mardi jeudi' }, filterConfig).expression).toBe('');
        });

        test('expression valide conservée', () => {
            expect(restoreFilterConf({ expression: 'title:achat OR status:todo' }, filterConfig).expression)
                .toBe('title:achat OR status:todo');
        });

        test('slots : seules les chaînes non vides sont gardées, 2 au maximum', () => {
            const result = restoreFilterConf({ slots: ['today', '', 12, 'this_week lundi', 'tomorrow'] }, filterConfig);
            expect(result.slots).toEqual(['today', 'this_week lundi']);
        });

        test('slots qui n’est pas un tableau', () => {
            expect(restoreFilterConf({ slots: 'today' }, filterConfig).slots).toEqual([]);
        });
    });
});
