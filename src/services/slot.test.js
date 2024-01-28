import { removeDisable, removeDisableMulti, slotFilter } from './slot.js';

jest.useFakeTimers()
jest.setSystemTime(new Date('2023-12-20')) // mercredi

describe('removeDisable', () => {
    describe('one remove', () => {
        test('middle', () => {
            expect(removeDisable(['lundi', 'disable', 'lundi', 'aprem', 'mardi']))
            .toEqual(['lundi', 'mardi'])
        })
        test('start', () => {
            expect(removeDisable(['disable', 'lundi', 'aprem', 'mardi']))
            .toEqual(['mardi'])
        })
        test('end', () => {
            expect(removeDisable(['lundi', 'disable', 'lundi', 'aprem']))
            .toEqual(['lundi'])
        }) 
    });
    describe('two remove', () => {
        test('middle consecutif', () => {
            expect(removeDisable(['lundi', 'disable', 'lundi', 'aprem', 'disable', 'mardi', 'mercredi']))
            .toEqual(['lundi', 'mercredi'])
        })
        test('middle non consecutif', () => {
            expect(removeDisable(['lundi', 'disable', 'lundi', 'aprem', 'mercredi', 'disable', 'mardi', 'jeudi']))
            .toEqual(['lundi', 'mercredi', 'jeudi'])
        })
        test('start', () => {
            expect(removeDisable(['disable', 'lundi', 'aprem', 'disable', 'mardi', 'mercredi']))
            .toEqual(['mercredi'])
        })
        test('end', () => {
            expect(removeDisable(['lundi', 'disable', 'lundi', 'aprem', 'disable', 'mardi']))
            .toEqual(['lundi'])
        })
    });
})

test('removeDisableMulti', () => {
    const given = {
        type: 'multi',
        value: [
            { type: 'branch', value: [ 'lundi' ], flags: [ 'disable' ] },
            { type: 'branch', value: [ 'mardi' ] }
        ]
    }
    const expected = {
        type: 'multi',
        value: [
            { type: 'branch', value: [ 'mardi' ] }
        ]
    }
    const result = removeDisableMulti(given)
    expect(result).toEqual(expected)
});

describe('slotFilter', () => {
    test('slotFilter keep', () => {
        const filter = 'mardi'
        const result = slotFilter('mardi', filter)
        expect(result).toBeTruthy()
    });

    test('slotFilter discard', () => {
        const filter = 'mercredi'
        const result = slotFilter('mardi', filter)
        expect(result).toBeFalsy()
    });

    test('slotFilter level 3 keep', () => {
        const filter = 'mardi matin'
        const result = slotFilter('mardi matin', filter)
        expect(result).toBeTruthy()
    });

    test('slotFilter level 3 discard', () => {
        const filter = 'mardi matin'
        const result = slotFilter('mardi aprem', filter)
        expect(result).toBeFalsy()
    })
});
