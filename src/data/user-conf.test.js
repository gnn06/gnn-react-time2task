import { indexConfRows } from './user-conf';

describe('indexConfRows', () => {
    test('indexe les valeurs par clé de conf', () => {
        const rows = [
            { user_id: 'u', conf: 'slotviewconf', value: { slotViewFilterConf: { view: 'tree' } } },
            { user_id: 'u', conf: 'filterconf',   value: { filterConf: { expression: 'x' } } },
        ];
        expect(indexConfRows(rows)).toEqual({
            slotviewconf: { slotViewFilterConf: { view: 'tree' } },
            filterconf:   { filterConf: { expression: 'x' } },
        });
    });

    test('une seule conf présente -> l’autre est absente', () => {
        const result = indexConfRows([{ conf: 'filterconf', value: { filterConf: {} } }]);
        expect(result.slotviewconf).toBeUndefined();
        expect(result.filterconf).toEqual({ filterConf: {} });
    });

    test.each([
        ['tableau vide', []],
        ['null', null],
        ['undefined', undefined],
        ['non tableau', { conf: 'x' }],
    ])('réponse vide ou invalide (%s) -> objet vide', (_, rows) => {
        expect(indexConfRows(rows)).toEqual({});
    });

    test('ignore les lignes sans clé de conf', () => {
        expect(indexConfRows([{ value: { a: 1 } }, null])).toEqual({});
    });
});
